import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { VPSService } from "@/lib/vps-service"
import { logger } from "@/lib/logger"

const vpsService = new VPSService()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    if (!["start", "stop", "reboot"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be start, stop, or reboot" }, { status: 400 })
    }

    const success = await vpsService.controlVPS(user.userId, params.id, action)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `VPS ${action} completed successfully`,
      })
    } else {
      throw new Error(`VPS ${action} failed`)
    }
  } catch (error) {
    logger.error("VPS power control failed", {
      error: error.message,
      vpsId: params.id,
      action: request.body,
    })

    return NextResponse.json({ error: error.message || "Power control failed" }, { status: 500 })
  }
}
