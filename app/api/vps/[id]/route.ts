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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vmid = parseInt(params.id);
    
    // Get all VMs to find the one with matching ID
    const vms = await proxmox.getVMs();
    const vm = vms.find((v: any) => v.vmid === vmid);
    
    if (!vm) {
      return NextResponse.json(
        { success: false, error: 'VPS not found' },
        { status: 404 }
      );
    }

    // Get detailed VM information
    const vmDetails = await proxmox.getVMDetails(vm.node, vmid);
    const vmConfig = await proxmox.getVMConfig(vm.node, vmid);

    // Transform to our VPS format with real data
    const vpsDetails = {
      id: vmid.toString(),
      name: vm.name || `VM ${vmid}`,
      status: vm.status,
      node: vm.node,
      vmid: vmid,
      cpu: {
        usage: vm.cpu || 0,
        cores: vmConfig?.cores || 1,
        model: 'Proxmox CPU',
        frequency: '2.0 GHz'
      },
      memory: {
        used: Math.round((vm.mem || 0) / 1024 / 1024), // Convert to GB
        total: vmConfig?.memory ? Math.round(vmConfig.memory / 1024) : 8,
        usage: vmConfig?.memory ? Math.round(((vm.mem || 0) / vmConfig.memory) * 100) : 0,
        type: 'DDR4'
      },
      disk: {
        used: Math.round((vm.disk || 0) / 1024 / 1024 / 1024), // Convert to GB
        total: vmConfig?.disk ? Math.round(vmConfig.disk / 1024 / 1024 / 1024) : 100,
        type: 'SSD',
        iops: 15000,
        readSpeed: 3200,
        writeSpeed: 2800
      },
      network: {
        inbound: 0,
        outbound: 0,
        bandwidth: 1000,
        totalIn: 0,
        totalOut: 0,
        packets: { in: 0, out: 0 }
      },
      uptime: vm.uptime ? `${Math.floor(vm.uptime / 3600)} hours` : '0 hours',
      uptimeSeconds: vm.uptime || 0,
      os: vmConfig?.ostype || 'Linux',
      kernel: '5.x',
      sshPort: 22,
      location: getLocationFromNode(vm.node),
      datacenter: getDCFromNode(vm.node),
      plan: determinePlan(vm.cpu || 0, Math.round((vm.mem || 0) / 1024 / 1024)),
      monthlyBandwidth: { used: 0, total: 1000 },
      backups: {
        enabled: false,
        lastBackup: '',
        count: 0,
        schedule: 'None',
        retention: 0
      },
      monitoring: {
        alerts: 0,
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        availability: 100,
        checks: { http: false, ping: true, ssh: false }
      },
      security: {
        firewall: false,
        ddosProtection: false,
        sslCerts: 0,
        lastSecurityScan: '',
        vulnerabilities: 0
      },
      cost: {
        monthly: 0,
        current: 0,
        bandwidth: 0,
        storage: 0,
        compute: 0
      },
      specs: {
        virtualization: 'KVM',
        bootTime: 0,
        lastReboot: '',
        architecture: 'x86_64'
      },
      performance: {
        cpuBenchmark: 0,
        diskBenchmark: 0,
        networkLatency: 0,
        loadAverage: [0, 0, 0]
      }
    };

    return NextResponse.json({
      success: true,
      data: vpsDetails,
      message: 'VPS details retrieved from Proxmox'
    });

  } catch (error) {
    console.error('Error fetching VPS details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch VPS details from Proxmox',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vmid = parseInt(params.id);
    const body = await request.json();
    const { action } = body;

    // Get VM info to find the node
    const vms = await proxmox.getVMs();
    const vm = vms.find((v: any) => v.vmid === vmid);
    
    if (!vm) {
      return NextResponse.json(
        { success: false, error: 'VPS not found' },
        { status: 404 }
      );
    }

    let success = false;

    switch (action) {
      case 'start':
        success = await proxmox.startVM(vm.node, vmid);
        break;
      case 'stop':
        success = await proxmox.stopVM(vm.node, vmid);
        break;
      case 'reboot':
        success = await proxmox.rebootVM(vm.node, vmid);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `VPS ${action} successful`
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to ${action} VPS`
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error performing VPS action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform VPS action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vmid = parseInt(params.id);
    
    // Get VM info to find the node
    const vms = await proxmox.getVMs();
    const vm = vms.find((v: any) => v.vmid === vmid);
    
    if (!vm) {
      return NextResponse.json(
        { success: false, error: 'VPS not found' },
        { status: 404 }
      );
    }

    const success = await proxmox.deleteVM(vm.node, vmid);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'VPS deleted successfully'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete VPS'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting VPS:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete VPS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function calculateUptime(createdAt: string, status: string) {
  if (status !== 'running') return 'Stopped';

  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} days, ${hours} hours, ${minutes} minutes`;
}

function calculateUptimeSeconds(createdAt: string, status: string) {
  if (status !== 'running') return 0;

  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 1000);
}

function getLocationFromNode(node: string) {
  const nodeLocations: Record<string, string> = {
    'proxpanel-ny-01': 'New York, USA',
    'proxpanel-la-01': 'Los Angeles, USA',
    'proxpanel-lon-01': 'London, UK',
    'proxpanel-fra-01': 'Frankfurt, Germany',
    'proxpanel-sgp-01': 'Singapore',
  };
  return nodeLocations[node] || 'Unknown';
}

function getDCFromNode(node: string) {
  const nodeDatacenters: Record<string, string> = {
    'proxpanel-ny-01': 'NYC-DC1',
    'proxpanel-la-01': 'LAX-DC1',
    'proxpanel-lon-01': 'LON-DC1',
    'proxpanel-fra-01': 'FRA-DC1',
    'proxpanel-sgp-01': 'SGP-DC1',
  };
  return nodeDatacenters[node] || 'Unknown';
}

function determinePlan(cpu: number, memory: number) {
  if (cpu === 1 && memory === 2) return 'Developer';
  if (cpu === 2 && memory === 4) return 'Standard';
  if (cpu === 4 && memory === 8) return 'Performance Plus';
  if (cpu === 8 && memory === 16) return 'Enterprise';
  return 'Custom';
}
