import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"
import { ProxmoxAPI } from "@/lib/proxmox-api"
import { generateSecurePassword } from "@/lib/utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vpsId = params.id

    // Get VPS details
    const vpsResult = await query("SELECT vmid, node, status FROM vps_instances WHERE id = ? AND user_id = ?", [
      vpsId,
      user.userId,
    ])

    if (vpsResult.length === 0) {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    const vps = vpsResult[0]

    // Generate new secure password
    const newPassword = generateSecurePassword()

    // Reset password via Proxmox API
    const proxmox = new ProxmoxAPI({
      host: process.env.PROXMOX_HOST!,
      port: Number.parseInt(process.env.PROXMOX_PORT!) || 8006,
      username: process.env.PROXMOX_USERNAME!,
      password: process.env.PROXMOX_PASSWORD!,
      realm: process.env.PROXMOX_REALM! || "pam",
    })

    const resetSuccess = await proxmox.resetVMPassword(vps.node, vps.vmid, newPassword)

    if (!resetSuccess) {
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
    }

    // Update password in database
    await query("UPDATE vps_instances SET root_password = ?, updated_at = NOW() WHERE id = ?", [newPassword, vpsId])

    // Log the password reset
    await query("INSERT INTO action_logs (user_id, vps_id, action, status) VALUES (?, ?, ?, ?)", [
      user.userId,
      vpsId,
      "reset_password",
      "success",
    ])

    return NextResponse.json({
      success: true,
      password: newPassword,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
