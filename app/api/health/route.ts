import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      environment: false,
      proxmox: false,
    },
    version: '1.0.0',
  };

  try {
    // Test database connection
    health.checks.database = await testConnection();

    // Check required environment variables
    const requiredEnvVars = [
      'JWT_SECRET',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
    ];
    health.checks.environment = requiredEnvVars.every(
      varName => !!process.env[varName]
    );

    // Test Proxmox connection (if configured)
    if (process.env.PROXMOX_HOST) {
      try {
        // Simple connectivity test
        const response = await fetch(
          `https://${process.env.PROXMOX_HOST}:${process.env.PROXMOX_PORT || 8006}/api2/json/version`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
            // @ts-ignore
            agent: new (require('https').Agent)({ rejectUnauthorized: false }),
          }
        );
        health.checks.proxmox = response.ok;
      } catch (error) {
        health.checks.proxmox = false;
      }
    }

    // Overall health status
    const allHealthy = Object.values(health.checks).every(
      check => check === true
    );
    health.status = allHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(health, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
