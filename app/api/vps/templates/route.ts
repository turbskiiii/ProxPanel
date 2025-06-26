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

    // Mock templates for demo - in production, fetch from Proxmox
    const templates = [
      {
        id: "ubuntu-22.04",
        name: "Ubuntu Server",
        os: "Ubuntu",
        version: "22.04 LTS",
        description: "Most popular Linux distribution for servers",
        minCpu: 1,
        minMemory: 512,
        minDisk: 10,
        recommended: true,
        available: true,
      },
      {
        id: "debian-12",
        name: "Debian",
        os: "Debian",
        version: "12 (Bookworm)",
        description: "Stable and secure Linux distribution",
        minCpu: 1,
        minMemory: 512,
        minDisk: 10,
        recommended: true,
        available: true,
      },
      {
        id: "centos-9",
        name: "CentOS Stream",
        os: "CentOS",
        version: "9",
        description: "Enterprise-grade Linux distribution",
        minCpu: 1,
        minMemory: 1024,
        minDisk: 15,
        recommended: false,
        available: true,
      },
      {
        id: "rocky-9",
        name: "Rocky Linux",
        os: "Rocky Linux",
        version: "9",
        description: "RHEL-compatible enterprise Linux",
        minCpu: 1,
        minMemory: 1024,
        minDisk: 15,
        recommended: false,
        available: true,
      },
      {
        id: "alpine-3.19",
        name: "Alpine Linux",
        os: "Alpine",
        version: "3.19",
        description: "Lightweight, security-oriented Linux",
        minCpu: 1,
        minMemory: 256,
        minDisk: 5,
        recommended: false,
        available: true,
      },
    ]

    return NextResponse.json({
      success: true,
      data: templates,
    })
  } catch (error) {
    logger.error("Failed to fetch VPS templates", { error: error.message })
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}
