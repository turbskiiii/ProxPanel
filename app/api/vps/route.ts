import { type NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { VPSService } from '@/lib/vps-service';
import { validateVPSConfig } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ProxmoxAPI } from '@/lib/proxmox-api';

const vpsService = new VPSService();

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
    // Get real VMs from Proxmox
    const vms = await proxmox.getVMs();
    
    // Transform Proxmox data to our VPS format
    const vpsList = vms.map((vm: any) => ({
      id: vm.vmid.toString(),
      name: vm.name || `VM ${vm.vmid}`,
      status: vm.status,
      node: vm.node,
      vmid: vm.vmid,
      cpu: {
        usage: vm.cpu || 0,
        cores: 1, // Default, can be enhanced with config
        model: 'Proxmox CPU',
        frequency: '2.0 GHz'
      },
      memory: {
        used: Math.round((vm.mem || 0) / 1024 / 1024), // Convert to GB
        total: 8, // Default, can be enhanced with config
        usage: Math.round(((vm.mem || 0) / (8 * 1024 * 1024)) * 100),
        type: 'DDR4'
      },
      disk: {
        used: Math.round((vm.disk || 0) / 1024 / 1024 / 1024), // Convert to GB
        total: 100, // Default, can be enhanced with config
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
      os: 'Linux', // Default, can be enhanced
      kernel: '5.x',
      sshPort: 22,
      location: 'Proxmox Node',
      datacenter: 'Local',
      plan: 'Custom',
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
    }));

    return NextResponse.json({
      success: true,
      data: vpsList,
      total: vpsList.length,
      message: 'VPS list retrieved from Proxmox'
    });

  } catch (error) {
    console.error('Error fetching VPS list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch VPS list from Proxmox',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, node, cores, memory, disk, os } = body;

    // Generate a unique VM ID (you might want to get this from Proxmox API)
    const vmid = Math.floor(Math.random() * 9000) + 1000; // Random ID between 1000-9999

    // Create VM using Proxmox API
    const success = await proxmox.createVM(node, vmid, {
      name,
      cores: cores || 1,
      memory: memory || 1024,
      disk: disk || 10,
      os: os || 'ubuntu'
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'VPS created successfully',
        vmid: vmid
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create VPS'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating VPS:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create VPS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
