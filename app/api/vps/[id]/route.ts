import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"
import { VPSService } from "@/lib/vps-service"
import { logger } from "@/lib/logger"

const vpsService = new VPSService()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vpsDetails = await vpsService.getVPSDetails(user.userId, params.id)

    return NextResponse.json({
      success: true,
      data: vpsDetails,
    })
  } catch (error) {
    logger.error("Failed to fetch VPS details", { error: error.message, vpsId: params.id })

    if (error.message === "VPS not found") {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to fetch VPS details" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vpsId = params.id
    const updates = await request.json()

    // Validate VPS ownership
    const vpsResult = await query("SELECT id FROM vps_instances WHERE id = ? AND user_id = ?", [vpsId, user.userId])

    if (vpsResult.length === 0) {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    // Build update query dynamically
    const allowedFields = ["name", "ssh_port"]
    const updateFields = []
    const updateValues = []

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`)
        updateValues.push(value)
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updateValues.push(vpsId)

    await query(`UPDATE vps_instances SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`, updateValues)

    // Log the update action
    await query("INSERT INTO action_logs (user_id, vps_id, action, details, status) VALUES (?, ?, ?, ?, ?)", [
      user.userId,
      vpsId,
      "update_vps",
      JSON.stringify(updates),
      "success",
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("VPS update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await vpsService.deleteVPS(user.userId, params.id)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "VPS deleted successfully",
      })
    } else {
      throw new Error("VPS deletion failed")
    }
  } catch (error) {
    logger.error("VPS deletion failed", { error: error.message, vpsId: params.id })

    if (error.message === "VPS not found") {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    return NextResponse.json({ error: error.message || "VPS deletion failed" }, { status: 500 })
  }
}

function calculateUptime(createdAt: string, status: string) {
  if (status !== "running") return "Stopped"

  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${days} days, ${hours} hours, ${minutes} minutes`
}

function calculateUptimeSeconds(createdAt: string, status: string) {
  if (status !== "running") return 0

  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / 1000)
}

function getLocationFromNode(node: string) {
  const locations: Record<string, string> = {
    "devloo-ny-01": "New York, USA",
    "devloo-la-01": "Los Angeles, USA",
    "devloo-lon-01": "London, UK",
    "devloo-fra-01": "Frankfurt, Germany",
    "devloo-sgp-01": "Singapore",
  }
  return locations[node] || "Unknown"
}

function getDCFromNode(node: string) {
  const datacenters: Record<string, string> = {
    "devloo-ny-01": "NYC-DC1",
    "devloo-la-01": "LAX-DC1",
    "devloo-lon-01": "LON-DC1",
    "devloo-fra-01": "FRA-DC1",
    "devloo-sgp-01": "SGP-DC1",
  }
  return datacenters[node] || "Unknown"
}

function determinePlan(cpu: number, memory: number) {
  if (cpu === 1 && memory === 2) return "Developer"
  if (cpu === 2 && memory === 4) return "Standard"
  if (cpu === 4 && memory === 8) return "Performance Plus"
  if (cpu === 8 && memory === 16) return "Enterprise"
  return "Custom"
}
