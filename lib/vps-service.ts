import { ProxmoxClient } from './proxmox-client';
import { query } from './db';
import { logger } from './logger';

export interface VPSConfig {
  name: string;
  template: string;
  cpu: number;
  memory: number; // MB
  disk: number; // GB
  node?: string;
  ostype?: string;
  storage?: string;
}

export class VPSService {
  private proxmox: ProxmoxClient;

  constructor() {
    this.proxmox = new ProxmoxClient({
      host: process.env.PROXMOX_HOST!,
      port: Number.parseInt(process.env.PROXMOX_PORT || '8006'),
      username: process.env.PROXMOX_USERNAME!,
      password: process.env.PROXMOX_PASSWORD!,
      realm: process.env.PROXMOX_REALM || 'pam',
    });
  }

  async createVPS(userId: number, config: VPSConfig): Promise<any> {
    try {
      logger.info(`Creating VPS for user ${userId}`, { config });

      // Get optimal node if not specified
      const node = config.node || (await this.getOptimalNode());

      // Get next available VM ID
      const vmid = await this.proxmox.getNextVMID();

      // Generate unique VPS ID
      const vpsId = `vps-${vmid}`;

      // Create VM configuration
      const vmConfig = {
        name: config.name,
        memory: config.memory,
        cores: config.cpu,
        sockets: 1,
        ostype: config.ostype || 'l26',
        scsi0: `local-lvm:${config.disk}`,
        net0: 'virtio,bridge=vmbr0',
        onboot: 1,
        agent: 1,
        description: `VPS for user ${userId} - Created by ProxPanel`,
      };

      // Create VM in Proxmox
      const taskId = await this.proxmox.createVM(node, vmid, vmConfig);

      // Wait for VM creation to complete
      const success = await this.proxmox.waitForTask(node, taskId);

      if (!success) {
        throw new Error('VM creation failed');
      }

      // Generate root password
      const rootPassword = this.generatePassword();

      // Store VPS in database
      await query(
        `
        INSERT INTO vps_instances (
          id, user_id, name, vmid, node_id, status, 
          cpu_cores, memory_gb, disk_gb, os, root_password,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'stopped', ?, ?, ?, ?, ?, NOW(), NOW())
      `,
        [
          vpsId,
          userId,
          config.name,
          vmid,
          node,
          config.cpu,
          Math.round(config.memory / 1024),
          config.disk,
          config.template,
          rootPassword,
        ]
      );

      // Log creation
      await query(
        `
        INSERT INTO audit_logs (user_id, action, category, details, resource_id, status, created_at)
        VALUES (?, 'create_vps', 'vps', ?, ?, 'success', NOW())
      `,
        [userId, JSON.stringify(config), vpsId]
      );

      logger.info(`VPS created successfully`, { vpsId, vmid, node });

      return {
        id: vpsId,
        vmid,
        node,
        name: config.name,
        status: 'stopped',
        rootPassword,
      };
    } catch (error) {
      logger.error('VPS creation failed', {
        error: error.message,
        userId,
        config,
      });

      // Log failure
      await query(
        `
        INSERT INTO audit_logs (user_id, action, category, details, status, created_at)
        VALUES (?, 'create_vps_failed', 'vps', ?, 'error', NOW())
      `,
        [userId, error.message]
      );

      throw error;
    }
  }

  async getUserVPSList(userId: number): Promise<any[]> {
    try {
      // Get VPS instances from database
      const vpsInstances = await query(
        `
        SELECT id, name, vmid, node_id, status, cpu_cores, memory_gb, 
               disk_gb, os, ip_address, created_at, updated_at
        FROM vps_instances 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `,
        [userId]
      );

      // Get real-time status from Proxmox for each VPS
      const vpsWithStatus = await Promise.all(
        vpsInstances.map(async (vps: any) => {
          try {
            const proxmoxStatus = await this.proxmox.getVMStatus(
              vps.node_id,
              vps.vmid
            );
            const proxmoxConfig = await this.proxmox.getVMConfig(
              vps.node_id,
              vps.vmid
            );

            // Update database if status changed
            if (proxmoxStatus.status !== vps.status) {
              await query(
                'UPDATE vps_instances SET status = ?, updated_at = NOW() WHERE id = ?',
                [proxmoxStatus.status, vps.id]
              );
            }

            return {
              ...vps,
              status: proxmoxStatus.status,
              uptime: proxmoxStatus.uptime || 0,
              cpu_usage: proxmoxStatus.cpu || 0,
              memory_usage: proxmoxStatus.mem
                ? (proxmoxStatus.mem / proxmoxStatus.maxmem) * 100
                : 0,
              network: {
                netin: proxmoxStatus.netin || 0,
                netout: proxmoxStatus.netout || 0,
              },
            };
          } catch (error) {
            logger.warn(`Failed to get status for VPS ${vps.id}`, {
              error: error.message,
            });
            return vps;
          }
        })
      );

      return vpsWithStatus;
    } catch (error) {
      logger.error('Failed to get user VPS list', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  async getVPSDetails(userId: number, vpsId: string): Promise<any> {
    try {
      // Get VPS from database
      const vpsResult = await query(
        `
        SELECT * FROM vps_instances 
        WHERE id = ? AND user_id = ?
      `,
        [vpsId, userId]
      );

      if (vpsResult.length === 0) {
        throw new Error('VPS not found');
      }

      const vps = vpsResult[0];

      // Get real-time data from Proxmox
      const [status, config, metrics] = await Promise.all([
        this.proxmox.getVMStatus(vps.node_id, vps.vmid),
        this.proxmox.getVMConfig(vps.node_id, vps.vmid),
        this.proxmox.getVMMetrics(vps.node_id, vps.vmid).catch(() => null),
      ]);

      return {
        ...vps,
        status: status.status,
        uptime: status.uptime || 0,
        cpu_usage: status.cpu || 0,
        memory_usage: status.mem ? (status.mem / status.maxmem) * 100 : 0,
        memory_used: status.mem || 0,
        memory_total: status.maxmem || 0,
        disk_usage: status.disk ? (status.disk / status.maxdisk) * 100 : 0,
        disk_used: status.disk || 0,
        disk_total: status.maxdisk || 0,
        network: {
          netin: status.netin || 0,
          netout: status.netout || 0,
        },
        config,
        metrics: metrics || [],
      };
    } catch (error) {
      logger.error('Failed to get VPS details', {
        error: error.message,
        vpsId,
        userId,
      });
      throw error;
    }
  }

  async controlVPS(
    userId: number,
    vpsId: string,
    action: 'start' | 'stop' | 'reboot'
  ): Promise<boolean> {
    try {
      // Verify VPS ownership
      const vpsResult = await query(
        `
        SELECT vmid, node_id, status FROM vps_instances 
        WHERE id = ? AND user_id = ?
      `,
        [vpsId, userId]
      );

      if (vpsResult.length === 0) {
        throw new Error('VPS not found');
      }

      const vps = vpsResult[0];

      // Validate action based on current status
      if (action === 'start' && vps.status === 'running') {
        throw new Error('VPS is already running');
      }
      if (
        (action === 'stop' || action === 'reboot') &&
        vps.status !== 'running'
      ) {
        throw new Error('VPS is not running');
      }

      // Execute action
      let taskId: string;
      switch (action) {
        case 'start':
          taskId = await this.proxmox.startVM(vps.node_id, vps.vmid);
          break;
        case 'stop':
          taskId = await this.proxmox.stopVM(vps.node_id, vps.vmid);
          break;
        case 'reboot':
          taskId = await this.proxmox.rebootVM(vps.node_id, vps.vmid);
          break;
      }

      // Wait for task completion
      const success = await this.proxmox.waitForTask(vps.node_id, taskId);

      if (success) {
        // Update status in database
        const newStatus =
          action === 'start' || action === 'reboot' ? 'running' : 'stopped';
        await query(
          'UPDATE vps_instances SET status = ?, updated_at = NOW() WHERE id = ?',
          [newStatus, vpsId]
        );

        // Log action
        await query(
          `
          INSERT INTO audit_logs (user_id, action, category, details, resource_id, status, created_at)
          VALUES (?, ?, 'vps', ?, ?, 'success', NOW())
        `,
          [userId, `vps_${action}`, `VPS ${action} completed`, vpsId]
        );

        logger.info(`VPS ${action} completed`, { vpsId, userId });
      }

      return success;
    } catch (error) {
      logger.error(`VPS ${action} failed`, {
        error: error.message,
        vpsId,
        userId,
      });

      // Log failure
      await query(
        `
        INSERT INTO audit_logs (user_id, action, category, details, resource_id, status, created_at)
        VALUES (?, ?, 'vps', ?, ?, 'error', NOW())
      `,
        [userId, `vps_${action}_failed`, error.message, vpsId]
      );

      throw error;
    }
  }

  async deleteVPS(userId: number, vpsId: string): Promise<boolean> {
    try {
      // Verify VPS ownership
      const vpsResult = await query(
        `
        SELECT vmid, node_id, name FROM vps_instances 
        WHERE id = ? AND user_id = ?
      `,
        [vpsId, userId]
      );

      if (vpsResult.length === 0) {
        throw new Error('VPS not found');
      }

      const vps = vpsResult[0];

      // Stop VM if running
      try {
        const status = await this.proxmox.getVMStatus(vps.node_id, vps.vmid);
        if (status.status === 'running') {
          const stopTask = await this.proxmox.stopVM(vps.node_id, vps.vmid);
          await this.proxmox.waitForTask(vps.node_id, stopTask);
        }
      } catch (error) {
        logger.warn('Failed to stop VPS before deletion', {
          error: error.message,
        });
      }

      // Delete VM from Proxmox
      const deleteTask = await this.proxmox.deleteVM(vps.node_id, vps.vmid);
      const success = await this.proxmox.waitForTask(vps.node_id, deleteTask);

      if (success) {
        // Remove from database
        await query('DELETE FROM vps_instances WHERE id = ?', [vpsId]);

        // Log deletion
        await query(
          `
          INSERT INTO audit_logs (user_id, action, category, details, resource_id, status, created_at)
          VALUES (?, 'delete_vps', 'vps', ?, ?, 'success', NOW())
        `,
          [userId, `Deleted VPS: ${vps.name}`, vpsId]
        );

        logger.info('VPS deleted successfully', { vpsId, userId });
      }

      return success;
    } catch (error) {
      logger.error('VPS deletion failed', {
        error: error.message,
        vpsId,
        userId,
      });

      // Log failure
      await query(
        `
        INSERT INTO audit_logs (user_id, action, category, details, resource_id, status, created_at)
        VALUES (?, 'delete_vps_failed', 'vps', ?, ?, 'error', NOW())
      `,
        [userId, error.message, vpsId]
      );

      throw error;
    }
  }

  private async getOptimalNode(): Promise<string> {
    try {
      const nodes = await this.proxmox.getNodes();

      // Filter online nodes
      const onlineNodes = nodes.filter(node => node.status === 'online');

      if (onlineNodes.length === 0) {
        throw new Error('No online nodes available');
      }

      // Get node with lowest CPU usage
      const nodeStats = await Promise.all(
        onlineNodes.map(async node => {
          try {
            const status = await this.proxmox.getNodeStatus(node.node);
            return {
              node: node.node,
              cpu: status.cpu || 0,
              memory: status.memory
                ? status.memory.used / status.memory.total
                : 0,
            };
          } catch (error) {
            return { node: node.node, cpu: 1, memory: 1 }; // Fallback high values
          }
        })
      );

      // Sort by combined CPU and memory usage
      nodeStats.sort((a, b) => a.cpu + a.memory - (b.cpu + b.memory));

      return nodeStats[0].node;
    } catch (error) {
      logger.error('Failed to get optimal node', { error: error.message });
      // Fallback to first configured node or default
      return process.env.PROXMOX_DEFAULT_NODE || 'pve';
    }
  }

  private generatePassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async resetVPSPassword(userId: number, vpsId: string): Promise<string> {
    try {
      // Verify VPS ownership
      const vpsResult = await query(
        `
        SELECT vmid, node_id FROM vps_instances 
        WHERE id = ? AND user_id = ?
      `,
        [vpsId, userId]
      );

      if (vpsResult.length === 0) {
        throw new Error('VPS not found');
      }

      const vps = vpsResult[0];
      const newPassword = this.generatePassword();

      // Set password via Proxmox agent
      const success = await this.proxmox.setVMPassword(
        vps.node_id,
        vps.vmid,
        'root',
        newPassword
      );

      if (success) {
        // Update password in database
        await query(
          'UPDATE vps_instances SET root_password = ?, updated_at = NOW() WHERE id = ?',
          [newPassword, vpsId]
        );

        // Log password reset
        await query(
          `
          INSERT INTO audit_logs (user_id, action, category, details, resource_id, status, created_at)
          VALUES (?, 'reset_password', 'vps', 'Root password reset', ?, 'success', NOW())
        `,
          [userId, vpsId]
        );

        logger.info('VPS password reset successfully', { vpsId, userId });
        return newPassword;
      } else {
        throw new Error('Failed to set password via Proxmox agent');
      }
    } catch (error) {
      logger.error('VPS password reset failed', {
        error: error.message,
        vpsId,
        userId,
      });
      throw error;
    }
  }
}
