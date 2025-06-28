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
    const { newPassword } = await request.json();

    // Get VM info to find the node
    const vms = await proxmox.getVMs();
    const vm = vms.find((v: any) => v.vmid === vmid);
    
    if (!vm) {
      return NextResponse.json(
        { success: false, error: 'VPS not found' },
        { status: 404 }
      );
    }

    // Reset VM password using Proxmox API
    const password = await proxmox.resetVMPassword(vm.node, vmid, newPassword);

    if (password) {
      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
        password: password,
        vmid: vmid
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to reset password. Make sure the guest agent is running.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset password',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
