import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await query("SELECT is_admin FROM users WHERE id = ?", [user.userId])

    if (!adminCheck[0]?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get system statistics
    const [userStats, vpsStats, serverStats, revenueStats, alertStats] = await Promise.all([
      // User statistics
      query(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30d
        FROM users
      `),

      // VPS statistics
      query(`
        SELECT 
          COUNT(*) as total_vps,
          SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running_vps,
          SUM(CASE WHEN status = 'stopped' THEN 1 ELSE 0 END) as stopped_vps,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_vps_30d
        FROM vps_instances
      `),

      // Server statistics
      query(`
        SELECT 
          COUNT(*) as total_servers,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_servers,
          AVG(cpu_usage) as avg_cpu_usage,
          AVG(memory_usage) as avg_memory_usage
        FROM server_nodes
      `),

      // Revenue statistics
      query(`
        SELECT 
          SUM(amount) as total_revenue,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as monthly_revenue,
          COUNT(*) as total_transactions
        FROM payments WHERE status = 'completed'
      `),

      // Alert statistics
      query(`
        SELECT 
          COUNT(*) as total_alerts,
          SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_alerts,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_alerts
        FROM system_alerts
      `),
    ])

    const stats = {
      users: userStats[0] || { total_users: 0, active_users: 0, suspended_users: 0, new_users_30d: 0 },
      vps: vpsStats[0] || { total_vps: 0, running_vps: 0, stopped_vps: 0, new_vps_30d: 0 },
      servers: serverStats[0] || { total_servers: 0, online_servers: 0, avg_cpu_usage: 0, avg_memory_usage: 0 },
      revenue: revenueStats[0] || { total_revenue: 0, monthly_revenue: 0, total_transactions: 0 },
      alerts: alertStats[0] || { total_alerts: 0, critical_alerts: 0, active_alerts: 0 },
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
