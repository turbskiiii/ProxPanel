import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"
import { ProxmoxAPI } from "@/lib/proxmox-api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  let user: any
  let action: string

  try {
    user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vpsId = params.id
    action = await request.json()

    if (!["start", "stop", "reboot"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Get VPS details
    const vpsResult = await query("SELECT vmid, node, status FROM vps_instances WHERE id = ? AND user_id = ?", [
      vpsId,
      user.userId,
    ])

    if (vpsResult.length === 0) {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    const vps = vpsResult[0]

    // Validate action based on current status
    if (action === "start" && vps.status === "running") {
      return NextResponse.json({ error: "VPS is already running" }, { status: 400 })
    }
    if ((action === "stop" || action === "reboot") && vps.status !== "running") {
      return NextResponse.json({ error: "VPS is not running" }, { status: 400 })
    }

    // Execute power action via Proxmox API
    const proxmox = new ProxmoxAPI({
      host: process.env.PROXMOX_HOST!,
      port: Number.parseInt(process.env.PROXMOX_PORT!) || 8006,
      username: process.env.PROXMOX_USERNAME!,
      password: process.env.PROXMOX_PASSWORD!,
      realm: process.env.PROXMOX_REALM! || "pam",
    })

    let success = false
    let newStatus = vps.status

    switch (action) {
      case "start":
        success = await proxmox.startVM(vps.node, vps.vmid)
        newStatus = success ? "running" : vps.status
        break
      case "stop":
        success = await proxmox.stopVM(vps.node, vps.vmid)
        newStatus = success ? "stopped" : vps.status
        break
      case "reboot":
        success = await proxmox.rebootVM(vps.node, vps.vmid)
        newStatus = success ? "running" : vps.status
        break
    }

    if (!success) {
      return NextResponse.json({ error: `Failed to ${action} VPS` }, { status: 500 })
    }

    // Update VPS status in database
    await query("UPDATE vps_instances SET status = ?, updated_at = NOW() WHERE id = ?", [newStatus, vpsId])

    // Log the power action
    await query("INSERT INTO action_logs (user_id, vps_id, action, details, status) VALUES (?, ?, ?, ?, ?)", [
      user.userId,
      vpsId,
      `power_${action}`,
      `VPS ${action} executed`,
      "success",
    ])

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `VPS ${action} completed successfully`,
    })
  } catch (error) {
    console.error(`Power ${action} error:`, error)

    // Log failed action
    try {
      await query("INSERT INTO action_logs (user_id, vps_id, action, details, status) VALUES (?, ?, ?, ?, ?)", [
        user?.userId,
        params.id,
        `power_${action}`,
        error.message,
        "failed",
      ])
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
