import { type NextRequest, NextResponse } from 'next/server';

// Demo admin statistics for GitHub release
const DEMO_ADMIN_STATS = {
  overview: {
    totalUsers: 1247,
    activeVPS: 3891,
    totalRevenue: 89750,
    serverNodes: 12,
  },
  resources: {
    totalCPU: 2048,
    usedCPU: 1456,
    totalMemory: 8192,
    usedMemory: 5234,
    totalStorage: 50000,
    usedStorage: 32100,
  },
  recentActivity: [
    {
      id: 1,
      type: 'vps_created',
      user: 'john@example.com',
      description: 'Created new VPS: Web Server Pro',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 2,
      type: 'user_registered',
      user: 'sarah@example.com',
      description: 'New user registration',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 3,
      type: 'payment_received',
      user: 'mike@example.com',
      description: 'Payment received: $49.99',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ],
  serverHealth: [
    { name: 'NYC-01', status: 'healthy', cpu: 45, memory: 62, uptime: '99.9%' },
    { name: 'FRA-01', status: 'healthy', cpu: 38, memory: 71, uptime: '99.8%' },
    { name: 'SIN-01', status: 'warning', cpu: 78, memory: 85, uptime: '99.2%' },
    { name: 'LON-01', status: 'healthy', cpu: 52, memory: 58, uptime: '99.9%' },
  ],
};

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd verify admin authentication here

    return NextResponse.json({
      success: true,
      data: DEMO_ADMIN_STATS,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
