import { NextRequest, NextResponse } from 'next/server';
import { ProxmoxAPI } from '@/lib/proxmox-api';

// Initialize Proxmox API with environment variables
const proxmox = new ProxmoxAPI({
  host: process.env.PROXMOX_HOST || 'localhost',
  port: parseInt(process.env.PROXMOX_PORT || '8006'),
  username: process.env.PROXMOX_USERNAME || 'root',
  password: process.env.PROXMOX_PASSWORD || 'demo123',
  realm: process.env.PROXMOX_REALM || 'pam',
});

export async function GET(request: NextRequest) {
  try {
    // Get cluster status to find all nodes
    const clusterStatus = await proxmox.getClusterStatus();
    
    if (!clusterStatus) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cluster status' },
        { status: 500 }
      );
    }

    // Get nodes from cluster status
    const nodes = clusterStatus.filter((item: any) => item.type === 'node');
    
    // Get detailed stats for each node
    const nodeStats = await Promise.all(
      nodes.map(async (node: any) => {
        try {
          const stats = await proxmox.getNodeStats(node.name);
          return {
            id: node.name,
            name: node.name,
            status: node.online ? 'online' : 'offline',
            location: 'Proxmox Cluster',
            datacenter: 'Local',
            cpu: {
              cores: stats?.cpuinfo?.cpus || 0,
              model: stats?.cpuinfo?.model || 'Unknown',
              usage: stats?.cpu * 100 || 0,
              frequency: `${stats?.cpuinfo?.mhz || 0} MHz`
            },
            memory: {
              total: Math.round((stats?.memory?.total || 0) / 1024 / 1024 / 1024), // GB
              used: Math.round((stats?.memory?.used || 0) / 1024 / 1024 / 1024), // GB
              free: Math.round((stats?.memory?.free || 0) / 1024 / 1024 / 1024), // GB
              usage: stats?.memory?.total ? Math.round(((stats?.memory?.used || 0) / stats?.memory?.total) * 100) : 0
            },
            disk: {
              total: Math.round((stats?.rootfs?.total || 0) / 1024 / 1024 / 1024), // GB
              used: Math.round((stats?.rootfs?.used || 0) / 1024 / 1024 / 1024), // GB
              free: Math.round((stats?.rootfs?.avail || 0) / 1024 / 1024 / 1024), // GB
              usage: stats?.rootfs?.total ? Math.round(((stats?.rootfs?.used || 0) / stats?.rootfs?.total) * 100) : 0
            },
            network: {
              interfaces: Object.keys(stats?.networks || {}),
              bandwidth: 1000,
              totalIn: 0,
              totalOut: 0
            },
            vms: {
              total: 0, // Will be calculated from VM list
              running: 0,
              stopped: 0
            },
            uptime: stats?.uptime ? `${Math.floor(stats.uptime / 3600)} hours` : '0 hours',
            loadAverage: stats?.loadavg || [0, 0, 0],
            temperature: stats?.thermal?.temp || 0,
            powerConsumption: 0,
            virtualization: 'Proxmox VE',
            hypervisor: 'KVM',
            storage: {
              local: stats?.rootfs?.total ? Math.round(stats.rootfs.total / 1024 / 1024 / 1024) : 0,
              shared: 0,
              backup: 0
            },
            performance: {
              cpuBenchmark: 0,
              diskBenchmark: 0,
              networkLatency: 0
            },
            alerts: {
              critical: 0,
              warning: 0,
              info: 0
            },
            maintenance: {
              scheduled: false,
              lastMaintenance: '',
              nextMaintenance: ''
            }
          };
        } catch (error) {
          console.error(`Failed to get stats for node ${node.name}:`, error);
          return {
            id: node.name,
            name: node.name,
            status: node.online ? 'online' : 'offline',
            location: 'Proxmox Cluster',
            datacenter: 'Local',
            cpu: { cores: 0, model: 'Unknown', usage: 0, frequency: '0 MHz' },
            memory: { total: 0, used: 0, free: 0, usage: 0 },
            disk: { total: 0, used: 0, free: 0, usage: 0 },
            network: { interfaces: [], bandwidth: 0, totalIn: 0, totalOut: 0 },
            vms: { total: 0, running: 0, stopped: 0 },
            uptime: '0 hours',
            loadAverage: [0, 0, 0],
            temperature: 0,
            powerConsumption: 0,
            virtualization: 'Proxmox VE',
            hypervisor: 'KVM',
            storage: { local: 0, shared: 0, backup: 0 },
            performance: { cpuBenchmark: 0, diskBenchmark: 0, networkLatency: 0 },
            alerts: { critical: 0, warning: 0, info: 0 },
            maintenance: { scheduled: false, lastMaintenance: '', nextMaintenance: '' }
          };
        }
      })
    );

    // Get VM count per node
    const vms = await proxmox.getVMs();
    nodeStats.forEach(node => {
      const nodeVMs = vms.filter((vm: any) => vm.node === node.name);
      node.vms.total = nodeVMs.length;
      node.vms.running = nodeVMs.filter((vm: any) => vm.status === 'running').length;
      node.vms.stopped = nodeVMs.filter((vm: any) => vm.status === 'stopped').length;
    });

    return NextResponse.json({
      success: true,
      data: nodeStats,
      total: nodeStats.length,
      message: 'Node list retrieved from Proxmox cluster'
    });

  } catch (error) {
    console.error('Error fetching nodes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch nodes from Proxmox',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
