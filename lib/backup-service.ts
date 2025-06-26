import { query } from "./db"
import { logger } from "./logger"
import { ProxmoxClient } from "./proxmox-client"

interface BackupConfig {
  vpsId: string
  schedule: string // cron format
  retention: number // days
  enabled: boolean
  storage: string
}

export class BackupService {
  private proxmox: ProxmoxClient

  constructor() {
    this.proxmox = new ProxmoxClient({
      host: process.env.PROXMOX_HOST!,
      port: Number.parseInt(process.env.PROXMOX_PORT || "8006"),
      username: process.env.PROXMOX_USERNAME!,
      password: process.env.PROXMOX_PASSWORD!,
      realm: process.env.PROXMOX_REALM || "pam",
    })
  }

  async createBackup(vpsId: string, type: "snapshot" | "backup" = "snapshot"): Promise<string> {
    try {
      // Get VPS details
      const vpsResult = await query("SELECT vmid, node_id, name FROM vps_instances WHERE id = ?", [vpsId])

      if (vpsResult.length === 0) {
        throw new Error("VPS not found")
      }

      const vps = vpsResult[0]

      let taskId: string

      if (type === "snapshot") {
        // Create snapshot
        const snapshotName = `auto-${Date.now()}`
        taskId = await this.createSnapshot(vps.node_id, vps.vmid, snapshotName)
      } else {
        // Create full backup
        taskId = await this.createFullBackup(vps.node_id, vps.vmid)
      }

      // Record backup in database
      await query(
        `
        INSERT INTO backups (vps_id, type, status, task_id, created_at)
        VALUES (?, ?, 'running', ?, NOW())
      `,
        [vpsId, type, taskId],
      )

      logger.info("Backup started", { vpsId, type, taskId })
      return taskId
    } catch (error) {
      logger.error("Backup creation failed", { error: error.message, vpsId, type })
      throw error
    }
  }

  private async createSnapshot(node: string, vmid: number, snapshotName: string): Promise<string> {
    // Create snapshot via Proxmox API
    const response = await this.proxmox.makeRequest(`/nodes/${node}/qemu/${vmid}/snapshot`, "POST", {
      snapname: snapshotName,
      description: `Automated snapshot created by ProxPanel`,
    })
    return response.data
  }

  private async createFullBackup(node: string, vmid: number): Promise<string> {
    // Create full backup via Proxmox API
    const response = await this.proxmox.makeRequest(`/nodes/${node}/vzdump`, "POST", {
      vmid: vmid.toString(),
      storage: process.env.BACKUP_STORAGE || "local",
      mode: "snapshot",
      compress: "gzip",
    })
    return response.data
  }

  async restoreBackup(vpsId: string, backupId: string): Promise<string> {
    try {
      // Get backup details
      const backupResult = await query("SELECT * FROM backups WHERE id = ? AND vps_id = ?", [backupId, vpsId])

      if (backupResult.length === 0) {
        throw new Error("Backup not found")
      }

      const backup = backupResult[0]
      const vpsResult = await query("SELECT vmid, node_id FROM vps_instances WHERE id = ?", [vpsId])
      const vps = vpsResult[0]

      let taskId: string

      if (backup.type === "snapshot") {
        // Restore from snapshot
        taskId = await this.restoreFromSnapshot(vps.node_id, vps.vmid, backup.snapshot_name)
      } else {
        // Restore from full backup
        taskId = await this.restoreFromBackup(vps.node_id, backup.backup_file)
      }

      // Record restore operation
      await query(
        `
        INSERT INTO backup_restores (backup_id, vps_id, status, task_id, created_at)
        VALUES (?, ?, 'running', ?, NOW())
      `,
        [backupId, vpsId, taskId],
      )

      logger.info("Backup restore started", { vpsId, backupId, taskId })
      return taskId
    } catch (error) {
      logger.error("Backup restore failed", { error: error.message, vpsId, backupId })
      throw error
    }
  }

  private async restoreFromSnapshot(node: string, vmid: number, snapshotName: string): Promise<string> {
    const response = await this.proxmox.makeRequest(
      `/nodes/${node}/qemu/${vmid}/snapshot/${snapshotName}/rollback`,
      "POST",
    )
    return response.data
  }

  private async restoreFromBackup(node: string, backupFile: string): Promise<string> {
    // Restore from backup file via Proxmox API
    const response = await this.proxmox.makeRequest(`/nodes/${node}/qemu`, "POST", {
      archive: backupFile,
      storage: "local-lvm",
    })
    return response.data
  }

  async scheduleBackups(): Promise<void> {
    try {
      // Get all VPS with backup enabled
      const vpsWithBackup = await query(`
        SELECT v.id, v.name, bc.schedule, bc.retention, bc.storage
        FROM vps_instances v
        JOIN backup_configs bc ON v.id = bc.vps_id
        WHERE bc.enabled = 1
      `)

      for (const vps of vpsWithBackup) {
        // Check if backup is due based on schedule
        const lastBackup = await query(
          `
          SELECT created_at FROM backups 
          WHERE vps_id = ? AND status = 'completed'
          ORDER BY created_at DESC 
          LIMIT 1
        `,
          [vps.id],
        )

        const shouldBackup = this.shouldCreateBackup(vps.schedule, lastBackup[0]?.created_at)

        if (shouldBackup) {
          await this.createBackup(vps.id, "snapshot")
        }
      }

      // Clean up old backups
      await this.cleanupOldBackups()
    } catch (error) {
      logger.error("Scheduled backup failed", { error: error.message })
    }
  }

  private shouldCreateBackup(schedule: string, lastBackup?: Date): boolean {
    // Simple schedule check - in production, use proper cron parser
    if (!lastBackup) return true

    const now = new Date()
    const timeDiff = now.getTime() - new Date(lastBackup).getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    // Daily backup if more than 24 hours
    if (schedule === "daily" && hoursDiff >= 24) return true
    // Weekly backup if more than 7 days
    if (schedule === "weekly" && hoursDiff >= 168) return true

    return false
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      // Get backup configs with retention settings
      const configs = await query("SELECT vps_id, retention FROM backup_configs WHERE enabled = 1")

      for (const config of configs) {
        // Delete old backups beyond retention period
        await query(
          `
          DELETE FROM backups 
          WHERE vps_id = ? 
          AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
          AND status = 'completed'
        `,
          [config.vps_id, config.retention],
        )
      }

      logger.info("Old backups cleaned up")
    } catch (error) {
      logger.error("Backup cleanup failed", { error: error.message })
    }
  }
}
