import { NextRequest, NextResponse } from 'next/server';
import { ProxmoxClient } from '@/lib/proxmox-client';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vpsId = params.id;
    // Fetch VPS details from DB (pseudo-code, replace with your actual DB logic)
    // const vps = await getVPSByIdAndUser(vpsId, user.userId);
    // if (!vps) return NextResponse.json({ error: 'VPS not found' }, { status: 404 });

    // For demo, assume node and vmid are available:
    const node = req.nextUrl.searchParams.get('node');
    const vmid = req.nextUrl.searchParams.get('vmid');
    if (!node || !vmid) {
      return NextResponse.json(
        { error: 'Missing node or vmid' },
        { status: 400 }
      );
    }

    const proxmox = new ProxmoxClient({
      host: process.env.PROXMOX_HOST!,
      port: Number(process.env.PROXMOX_PORT || '8006'),
      username: process.env.PROXMOX_USERNAME!,
      password: process.env.PROXMOX_PASSWORD!,
      realm: process.env.PROXMOX_REALM || 'pam',
    });

    // Get VNC ticket from Proxmox
    const vncData = await proxmox.requestVNCProxy(node, Number(vmid));
    const { ticket, port, cert, user: proxmoxUser } = vncData;

    // Build WebSocket URL (Proxmox default: wss://host:8006/api2/json/nodes/{node}/qemu/{vmid}/vncwebsocket)
    const wsUrl = `wss://${process.env.PROXMOX_HOST}:${process.env.PROXMOX_PORT || '8006'}/api2/json/nodes/${node}/qemu/${vmid}/vncwebsocket?port=${port}&vncticket=${encodeURIComponent(ticket)}`;

    return NextResponse.json({
      ticket,
      port,
      cert,
      user: proxmoxUser,
      wsUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
