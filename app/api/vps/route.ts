import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"
import { ProxmoxAPI } from "@/lib/proxmox-api"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get VPS instances from database
    const vpsInstances = await query(
      `SELECT 
        id, name, vmid, node, status, ip_address, cpu_cores, 
        memory_gb, disk_gb, os, ssh_port, created_at, updated_at
       FROM vps_instances 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user.userId],
    )

    // Get latest metrics for each VPS
    const vpsWithMetrics = await Promise.all(
      vpsInstances.map(async (vps: any) => {
        const metrics = await query(
          `SELECT cpu_usage, memory_used_gb, disk_used_gb, network_in_mb, network_out_mb
           FROM vps_metrics 
           WHERE vps_id = ? 
           ORDER BY recorded_at DESC 
           LIMIT 1`,
          [vps.id],
        )

        const latestMetric = metrics[0] || {
          cpu_usage: 0,
          memory_used_gb: 0,
          disk_used_gb: 0,
          network_in_mb: 0,
          network_out_mb: 0,
        }

        return {
          id: vps.id,
          name: vps.name,
          status: vps.status,
          ip: vps.ip_address,
          cpu: {
            usage: latestMetric.cpu_usage || 0,
            cores: vps.cpu_cores,
          },
          memory: {
            used: latestMetric.memory_used_gb || 0,
            total: vps.memory_gb,
            usage: vps.memory_gb > 0 ? (latestMetric.memory_used_gb / vps.memory_gb) * 100 : 0,
          },
          disk: {
            used: latestMetric.disk_used_gb || 0,
            total: vps.disk_gb,
          },
          network: {
            inbound: latestMetric.network_in_mb || 0,
            outbound: latestMetric.network_out_mb || 0,
          },
          os: vps.os,
          node: vps.node,
          vmid: vps.vmid,
          sshPort: vps.ssh_port,
          uptime: calculateUptime(vps.created_at, vps.status),
        }
      }),
    )

    return NextResponse.json({ vps: vpsWithMetrics })
  } catch (error) {
    console.error("VPS fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, plan, os, location } = await request.json()

    if (!name || !plan || !os) {
      return NextResponse.json({ error: "Name, plan, and OS are required" }, { status: 400 })
    }

    // Get plan specifications
    const planSpecs = getPlanSpecs(plan)
    if (!planSpecs) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 })
    }

    // Generate unique VMID
    const vmid = await generateVMID()

    // Create VPS in Proxmox
    const proxmox = new ProxmoxAPI({
      host: process.env.PROXMOX_HOST!,
      port: Number.parseInt(process.env.PROXMOX_PORT!) || 8006,
      username: process.env.PROXMOX_USERNAME!,
      password: process.env.PROXMOX_PASSWORD!,
      realm: process.env.PROXMOX_REALM! || "pam",
    })

    const vpsId = `vm-${vmid}`
    const node = selectOptimalNode(location)

    // Create VPS in database
    await query(
      `INSERT INTO vps_instances 
       (id, user_id, name, vmid, node, status, cpu_cores, memory_gb, disk_gb, os, ssh_port) 
       VALUES (?, ?, ?, ?, ?, 'stopped', ?, ?, ?, ?, 22)`,
      [vpsId, user.userId, name, vmid, node, planSpecs.cpu, planSpecs.memory, planSpecs.disk, os],
    )

    // Log the creation action
    await query("INSERT INTO action_logs (user_id, vps_id, action, status) VALUES (?, ?, ?, ?)", [
      user.userId,
      vpsId,
      "create_vps",
      "success",
    ])

    return NextResponse.json(
      {
        success: true,
        vps: {
          id: vpsId,
          name,
          vmid,
          node,
          status: "stopped",
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("VPS creation error:", error)
    return NextResponse.json({ error: "Failed to create VPS" }, { status: 500 })
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

function getPlanSpecs(plan: string) {
  const plans: Record<string, { cpu: number; memory: number; disk: number }> = {
    developer: { cpu: 1, memory: 2, disk: 20 },
    standard: { cpu: 2, memory: 4, disk: 40 },
    business: { cpu: 2, memory: 4, disk: 60 },
    performance: { cpu: 4, memory: 8, disk: 100 },
    enterprise: { cpu: 8, memory: 16, disk: 200 },
  }

  return plans[plan.toLowerCase()]
}

async function generateVMID(): Promise<number> {
  const existingVMIDs = await query("SELECT vmid FROM vps_instances ORDER BY vmid DESC LIMIT 1")
  const lastVMID = existingVMIDs.length > 0 ? existingVMIDs[0].vmid : 99
  return lastVMID + 1
}

function selectOptimalNode(location?: string): string {
  const nodes = {
    "us-east": "devloo-ny-01",
    "us-west": "devloo-la-01",
    "eu-west": "devloo-lon-01",
    "eu-central": "devloo-fra-01",
    "asia-pacific": "devloo-sgp-01",
  }

  return nodes[location as keyof typeof nodes] || "devloo-ny-01"
}
