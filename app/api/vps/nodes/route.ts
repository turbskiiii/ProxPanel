import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { VPSService } from "@/lib/vps-service"
import { logger } from "@/lib/logger"

const vpsService = new VPSService()

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock nodes for demo - in production, fetch from Proxmox
    const nodes = [
      {
        id: "pve-ny-01",
        name: "New York Node 1",
        location: "New York, USA",
        cpu: { usage: 35, total: 100 },
        memory: { usage: 45, total: 100 },
        storage: { usage: 60, total: 100 },
        status: "online",
        latency: 12,
        uptime: "99.9%",
      },
      {
        id: "pve-la-01",
        name: "Los Angeles Node 1",
        location: "Los Angeles, USA",
        cpu: { usage: 28, total: 100 },
        memory: { usage: 38, total: 100 },
        storage: { usage: 55, total: 100 },
        status: "online",
        latency: 8,
        uptime: "99.8%",
      },
      {
        id: "pve-eu-01",
        name: "Frankfurt Node 1",
        location: "Frankfurt, Germany",
        cpu: { usage: 42, total: 100 },
        memory: { usage: 52, total: 100 },
        storage: { usage: 48, total: 100 },
        status: "online",
        latency: 25,
        uptime: "99.7%",
      },
    ]

    return NextResponse.json({
      success: true,
      data: nodes,
    })
  } catch (error) {
    logger.error("Failed to fetch nodes", { error: error.message })
    return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 })
  }
}
