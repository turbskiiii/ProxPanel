import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vpsId = params.id

    // Get VPS details
    const vpsResult = await query(`SELECT * FROM vps_instances WHERE id = ? AND user_id = ?`, [vpsId, user.userId])

    if (vpsResult.length === 0) {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    const vps = vpsResult[0]

    // Get latest metrics
    const metricsResult = await query(
      `SELECT * FROM vps_metrics 
       WHERE vps_id = ? 
       ORDER BY recorded_at DESC 
       LIMIT 24`,
      [vpsId],
    )

    // Get recent action logs
    const logsResult = await query(
      `SELECT * FROM action_logs 
       WHERE vps_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [vpsId],
    )

    const latestMetric = metricsResult[0] || {}

    const vpsDetails = {
      id: vps.id,
      name: vps.name,
      status: vps.status,
      ip: vps.ip_address,
      ipv6: vps.ipv6_address,
      cpu: {
        usage: latestMetric.cpu_usage || 0,
        cores: vps.cpu_cores,
        model: "Intel Xeon E5-2686 v4",
        frequency: "2.3 GHz",
      },
      memory: {
        used: latestMetric.memory_used_gb || 0,
        total: vps.memory_gb,
        usage: vps.memory_gb > 0 ? (latestMetric.memory_used_gb / vps.memory_gb) * 100 : 0,
        type: "DDR4 ECC",
      },
      disk: {
        used: latestMetric.disk_used_gb || 0,
        total: vps.disk_gb,
        type: "NVMe SSD",
        iops: 15000,
        readSpeed: 3200,
        writeSpeed: 2800,
      },
      network: {
        inbound: latestMetric.network_in_mb || 0,
        outbound: latestMetric.network_out_mb || 0,
        bandwidth: 1000,
        totalIn: 2.8,
        totalOut: 1.9,
        packets: { in: 1250000, out: 890000 },
      },
      uptime: calculateUptime(vps.created_at, vps.status),
      uptimeSeconds: calculateUptimeSeconds(vps.created_at, vps.status),
      os: vps.os,
      kernel: "5.15.0-91-generic",
      node: vps.node,
      vmid: vps.vmid,
      sshPort: vps.ssh_port,
      rootPassword: vps.root_password,
      location: getLocationFromNode(vps.node),
      datacenter: getDCFromNode(vps.node),
      plan: determinePlan(vps.cpu_cores, vps.memory_gb),
      monthlyBandwidth: { used: 2.8, total: 10 },
      backups: {
        enabled: true,
        lastBackup: "2024-01-20 03:00:15 UTC",
        count: 7,
        schedule: "Daily at 03:00 UTC",
        retention: 30,
      },
      monitoring: {
        alerts: 0,
        lastCheck: new Date().toISOString(),
        responseTime: 45,
        availability: 99.97,
        checks: { http: true, ping: true, ssh: true },
      },
      security: {
        firewall: true,
        ddosProtection: true,
        sslCerts: 3,
        lastSecurityScan: "2024-01-19 12:00:00 UTC",
        vulnerabilities: 0,
      },
      cost: {
        monthly: 89.99,
        current: 67.49,
        bandwidth: 12.5,
        storage: 25.0,
        compute: 52.49,
      },
      specs: {
        virtualization: "KVM",
        bootTime: 23,
        lastReboot: vps.updated_at,
        architecture: "x86_64",
      },
      performance: {
        cpuBenchmark: 8750,
        diskBenchmark: 15000,
        networkLatency: 0.8,
        loadAverage: [0.45, 0.52, 0.38],
      },
      metrics: metricsResult,
      logs: logsResult,
    }

    return NextResponse.json({ vps: vpsDetails })
  } catch (error) {
    console.error("VPS detail fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    const vpsId = params.id

    // Validate VPS ownership
    const vpsResult = await query("SELECT id, vmid, node FROM vps_instances WHERE id = ? AND user_id = ?", [
      vpsId,
      user.userId,
    ])

    if (vpsResult.length === 0) {
      return NextResponse.json({ error: "VPS not found" }, { status: 404 })
    }

    const vps = vpsResult[0]

    // Delete from Proxmox (implement based on your Proxmox setup)
    // const proxmox = new ProxmoxAPI(...)
    // await proxmox.deleteVM(vps.node, vps.vmid)

    // Delete from database
    await query("DELETE FROM vps_instances WHERE id = ?", [vpsId])

    // Log the deletion
    await query("INSERT INTO action_logs (user_id, vps_id, action, status) VALUES (?, ?, ?, ?)", [
      user.userId,
      vpsId,
      "delete_vps",
      "success",
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("VPS deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
