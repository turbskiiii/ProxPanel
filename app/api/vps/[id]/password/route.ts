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

    const newPassword = await vpsService.resetVPSPassword(user.userId, params.id)

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      password: newPassword,
    })
  } catch (error) {
    logger.error("VPS password reset failed", {
      error: error.message,
      vpsId: params.id,
    })

    if (error.message === "VPS not found") {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    return NextResponse.json({ error: error.message || "Password reset failed" }, { status: 500 })
  }
}
