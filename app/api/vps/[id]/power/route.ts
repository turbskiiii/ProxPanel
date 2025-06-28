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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vmid = parseInt(params.id);
    const { action } = await request.json();

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
    let message = '';

    switch (action) {
      case 'start':
        success = await proxmox.startVM(vm.node, vmid);
        message = success ? 'VPS started successfully' : 'Failed to start VPS';
        break;
      case 'stop':
        success = await proxmox.stopVM(vm.node, vmid);
        message = success ? 'VPS stopped successfully' : 'Failed to stop VPS';
        break;
      case 'reboot':
        success = await proxmox.rebootVM(vm.node, vmid);
        message = success ? 'VPS rebooted successfully' : 'Failed to reboot VPS';
        break;
      case 'shutdown':
        success = await proxmox.stopVM(vm.node, vmid);
        message = success ? 'VPS shutdown successfully' : 'Failed to shutdown VPS';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid power action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success,
      message,
      action,
      vmid: vmid
    });

  } catch (error) {
    console.error('Error performing power action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform power action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
