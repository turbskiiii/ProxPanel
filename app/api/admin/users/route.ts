import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { apiRateLimiter } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.ip || 'unknown';
    const rateLimitResult = await apiRateLimiter.isAllowed(identifier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // For now, return a single admin user since we're using Proxmox authentication
    const users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@proxpanel.com',
        name: 'System Administrator',
        role: { id: 'admin', name: 'Admin' },
        status: 'active',
        vpsCount: 0, // Will be calculated from Proxmox VMs
        totalSpent: 0,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        location: 'Proxmox Cluster',
      },
    ];

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page: 1,
        limit: 10,
        total: users.length,
        pages: 1,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch users', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const identifier = request.ip || 'unknown';
    const rateLimitResult = await apiRateLimiter.isAllowed(identifier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, email, name, role } = body;

    // Validate required fields
    if (!username || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, you would create the user in your database
    // For now, return a success response
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        id: Date.now().toString(),
        username,
        email,
        name,
        role: role || { id: 'user', name: 'User' },
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to create user', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
