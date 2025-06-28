import { type NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { VPSService } from '@/lib/vps-service';
import { validateVPSConfig } from '@/lib/validation';
import { logger } from '@/lib/logger';

const vpsService = new VPSService();

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vpsList = await vpsService.getUserVPSList(user.userId);

    return NextResponse.json({
      success: true,
      data: vpsList,
      total: vpsList.length,
    });
  } catch (error) {
    logger.error('Failed to fetch VPS list', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to fetch VPS list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate VPS configuration
    const validation = validateVPSConfig(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.error.issues },
        { status: 400 }
      );
    }

    const config = validation.data;

    // Create VPS
    const vps = await vpsService.createVPS(user.userId, config);

    return NextResponse.json(
      {
        success: true,
        message: 'VPS creation started',
        data: vps,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('VPS creation failed', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'VPS creation failed' },
      { status: 500 }
    );
  }
}
