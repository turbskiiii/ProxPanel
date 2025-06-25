import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const startTime = Date.now()

    // Check database connection
    const dbCheck = await query("SELECT 1 as healthy")
    const dbHealthy = dbCheck.length > 0 && dbCheck[0].healthy === 1

    // Check response time
    const responseTime = Date.now() - startTime

    // System info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    }

    const health = {
      status: dbHealthy ? "healthy" : "unhealthy",
      checks: {
        database: dbHealthy ? "pass" : "fail",
        responseTime: responseTime < 1000 ? "pass" : "warn",
      },
      responseTime,
      system: systemInfo,
    }

    const statusCode = health.status === "healthy" ? 200 : 503

    if (statusCode === 503) {
      logger.error("Health check failed", health)
    }

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    logger.error("Health check error", { error })

    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
