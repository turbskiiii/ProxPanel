import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ProxmoxAPI } from '@/lib/proxmox-api';

export async function GET() {
  const healthChecks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: false,
      proxmox: false,
      environment: false,
      disk_space: false,
      memory: false,
    },
    details: {} as any,
  };

  try {
    // Database health check
    try {
      await query('SELECT 1');
      healthChecks.checks.database = true;
    } catch (error) {
      healthChecks.details.database_error = 'Database connection failed';
    }

    // Proxmox health check
    if (process.env.PROXMOX_HOST) {
      try {
        const proxmox = new ProxmoxAPI({
          host: process.env.PROXMOX_HOST,
          port: Number.parseInt(process.env.PROXMOX_PORT || '8006'),
          username: process.env.PROXMOX_USERNAME!,
          password: process.env.PROXMOX_PASSWORD!,
          realm: process.env.PROXMOX_REALM || 'pam',
        });

        await proxmox.authenticate();
        healthChecks.checks.proxmox = true;
      } catch (error) {
        healthChecks.details.proxmox_error = 'Proxmox connection failed';
      }
    }

    // Environment variables check
    const requiredEnvVars = [
      'JWT_SECRET',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
    ];
    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    if (missingVars.length === 0) {
      healthChecks.checks.environment = true;
    } else {
      healthChecks.details.missing_env_vars = missingVars;
    }

    // System resource checks
    const memoryUsage = process.memoryUsage();
    healthChecks.checks.memory = memoryUsage.heapUsed < 512 * 1024 * 1024; // 512MB limit
    healthChecks.details.memory_usage = {
      heap_used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heap_total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    };

    // Overall health status
    const allChecksPass = Object.values(healthChecks.checks).every(
      check => check === true
    );
    healthChecks.status = allChecksPass ? 'healthy' : 'unhealthy';

    const statusCode = allChecksPass ? 200 : 503;
    return NextResponse.json(healthChecks, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
