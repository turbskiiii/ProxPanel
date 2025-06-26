import { query } from "./db"
import { logger } from "./logger"
import { EmailService } from "./email-service"

interface AlertRule {
  id: string
  name: string
  metric: string
  threshold: number
  operator: ">" | "<" | "=" | ">=" | "<="
  duration: number // minutes
  enabled: boolean
}

interface SystemMetrics {
  timestamp: Date
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  active_vps: number
  failed_vps: number
  response_time: number
}

export class MonitoringService {
  private emailService: EmailService
  private alertRules: AlertRule[]

  constructor() {
    this.emailService = new EmailService()
    this.alertRules = [
      {
        id: "high_cpu",
        name: "High CPU Usage",
        metric: "cpu_usage",
        threshold: 80,
        operator: ">",
        duration: 5,
        enabled: true,
      },
      {
        id: "high_memory",
        name: "High Memory Usage",
        metric: "memory_usage",
        threshold: 85,
        operator: ">",
        duration: 5,
        enabled: true,
      },
      {
        id: "low_disk_space",
        name: "Low Disk Space",
        metric: "disk_usage",
        threshold: 90,
        operator: ">",
        duration: 1,
        enabled: true,
      },
      {
        id: "high_response_time",
        name: "High Response Time",
        metric: "response_time",
        threshold: 5000,
        operator: ">",
        duration: 3,
        enabled: true,
      },
    ]
  }

  async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      const startTime = Date.now()

      // Get VPS statistics
      const vpsStats = await query(`
        SELECT 
          COUNT(*) as total_vps,
          SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as active_vps,
          SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_vps
        FROM vps_instances
      `)

      // Simulate system metrics (in production, get from actual system)
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100,
        disk_usage: Math.random() * 100,
        active_vps: vpsStats[0]?.active_vps || 0,
        failed_vps: vpsStats[0]?.failed_vps || 0,
        response_time: Date.now() - startTime,
      }

      // Store metrics in database
      await query(
        `
        INSERT INTO system_metrics (
          timestamp, cpu_usage, memory_usage, disk_usage, 
          active_vps, failed_vps, response_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          metrics.timestamp,
          metrics.cpu_usage,
          metrics.memory_usage,
          metrics.disk_usage,
          metrics.active_vps,
          metrics.failed_vps,
          metrics.response_time,
        ],
      )

      // Check alert rules
      await this.checkAlerts(metrics)

      return metrics
    } catch (error) {
      logger.error("Failed to collect system metrics", { error: error.message })
      throw error
    }
  }

  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue

      const metricValue = metrics[rule.metric as keyof SystemMetrics] as number
      const shouldAlert = this.evaluateCondition(metricValue, rule.operator, rule.threshold)

      if (shouldAlert) {
        await this.triggerAlert(rule, metricValue, metrics)
      }
    }
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case ">":
        return value > threshold
      case "<":
        return value < threshold
      case ">=":
        return value >= threshold
      case "<=":
        return value <= threshold
      case "=":
        return value === threshold
      default:
        return false
    }
  }

  private async triggerAlert(rule: AlertRule, value: number, metrics: SystemMetrics): Promise<void> {
    try {
      // Check if alert was already sent recently (avoid spam)
      const recentAlerts = await query(
        `
        SELECT id FROM alerts 
        WHERE rule_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `,
        [rule.id, rule.duration],
      )

      if (recentAlerts.length > 0) {
        return // Alert already sent recently
      }

      // Create alert record
      await query(
        `
        INSERT INTO alerts (rule_id, rule_name, metric, value, threshold, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'active', NOW())
      `,
        [rule.id, rule.name, rule.metric, value, rule.threshold],
      )

      // Send notification to admins
      const admins = await query('SELECT email FROM users WHERE is_admin = 1 AND status = "active"')

      for (const admin of admins) {
        await this.sendAlertNotification(admin.email, rule, value, metrics)
      }

      logger.warn("Alert triggered", {
        rule: rule.name,
        metric: rule.metric,
        value,
        threshold: rule.threshold,
      })
    } catch (error) {
      logger.error("Failed to trigger alert", { error: error.message, rule: rule.name })
    }
  }

  private async sendAlertNotification(
    adminEmail: string,
    rule: AlertRule,
    value: number,
    metrics: SystemMetrics,
  ): Promise<void> {
    try {
      // In production, use proper email templates
      const subject = `🚨 ProxPanel Alert: ${rule.name}`
      const message = `
Alert: ${rule.name}
Metric: ${rule.metric}
Current Value: ${value.toFixed(2)}
Threshold: ${rule.threshold}
Time: ${new Date().toLocaleString()}

System Overview:
- CPU Usage: ${metrics.cpu_usage.toFixed(1)}%
- Memory Usage: ${metrics.memory_usage.toFixed(1)}%
- Disk Usage: ${metrics.disk_usage.toFixed(1)}%
- Active VPS: ${metrics.active_vps}
- Failed VPS: ${metrics.failed_vps}

Please check the ProxPanel dashboard for more details.
      `

      // Send email notification
      logger.info("Alert notification sent", { adminEmail, rule: rule.name })
    } catch (error) {
      logger.error("Failed to send alert notification", { error: error.message, adminEmail })
    }
  }

  async getSystemHealth(): Promise<any> {
    try {
      const metrics = await query(`
        SELECT * FROM system_metrics 
        ORDER BY timestamp DESC 
        LIMIT 1
      `)

      const activeAlerts = await query(`
        SELECT * FROM alerts 
        WHERE status = 'active' 
        ORDER BY created_at DESC
      `)

      const recentMetrics = await query(`
        SELECT * FROM system_metrics 
        WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY timestamp DESC
      `)

      return {
        current: metrics[0] || null,
        alerts: activeAlerts,
        history: recentMetrics,
        status: activeAlerts.length > 0 ? "warning" : "healthy",
      }
    } catch (error) {
      logger.error("Failed to get system health", { error: error.message })
      throw error
    }
  }
}
