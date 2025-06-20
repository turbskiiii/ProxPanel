import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseConnection()

    // Check environment variables
    const requiredEnvVars = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]

    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: dbHealthy ? "connected" : "disconnected",
      services: {
        database: dbHealthy,
        proxmox: !!process.env.PROXMOX_HOST,
        auth: !!process.env.JWT_SECRET,
      },
      issues: [],
    }

    if (!dbHealthy) {
      health.issues.push("Database connection failed")
      health.status = "unhealthy"
    }

    if (missingEnvVars.length > 0) {
      health.issues.push(`Missing environment variables: ${missingEnvVars.join(", ")}`)
      health.status = "unhealthy"
    }

    const statusCode = health.status === "healthy" ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
