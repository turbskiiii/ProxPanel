import { NextRequest, NextResponse } from 'next/server';
import { dnsCdnSystem } from '@/lib/dns-cdn-system';
import { logger } from '@/lib/logger';
import { apiRateLimiter } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');
    const provider = searchParams.get('provider');
    const type = searchParams.get('type'); // 'dns' or 'cdn'

    if (zoneId) {
      if (type === 'cdn') {
        const zone = dnsCdnSystem.getCDNZone(zoneId);
        if (!zone) {
          return NextResponse.json(
            { error: 'CDN zone not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ zone });
      } else {
        const zone = dnsCdnSystem.getDNSZone(zoneId);
        if (!zone) {
          return NextResponse.json(
            { error: 'DNS zone not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ zone });
      }
    }

    // Get all zones
    const dnsZones = Array.from(dnsCdnSystem['dnsZones'].values());
    const cdnZones = Array.from(dnsCdnSystem['cdnZones'].values());
    const providers = dnsCdnSystem.getDNSProviders();
    const cdnProviders = dnsCdnSystem.getCDNProviders();

    let filteredDnsZones = dnsZones;
    let filteredCdnZones = cdnZones;

    if (provider) {
      filteredDnsZones = filteredDnsZones.filter(
        zone => zone.provider === provider
      );
      filteredCdnZones = filteredCdnZones.filter(
        zone => zone.provider === provider
      );
    }

    return NextResponse.json({
      dns: {
        zones: filteredDnsZones,
        total: filteredDnsZones.length,
        providers,
      },
      cdn: {
        zones: filteredCdnZones,
        total: filteredCdnZones.length,
        providers: cdnProviders,
      },
      analytics: dnsCdnSystem.getSystemAnalytics(),
    });
  } catch (error) {
    logger.error('Error fetching DNS/CDN data', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, name, domain, provider, settings } = body;

    if (!type || !name || !domain || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type === 'dns') {
      const zone = dnsCdnSystem.createDNSZone(name, domain, provider, settings);
      return NextResponse.json(
        {
          zone,
          message: 'DNS zone created successfully',
        },
        { status: 201 }
      );
    } else if (type === 'cdn') {
      const zone = dnsCdnSystem.createCDNZone(name, domain, provider, settings);
      return NextResponse.json(
        {
          zone,
          message: 'CDN zone created successfully',
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "dns" or "cdn"' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('Error creating zone', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { zoneId, type, updates } = body;

    if (!zoneId || !type) {
      return NextResponse.json(
        { error: 'Zone ID and type are required' },
        { status: 400 }
      );
    }

    let updatedZone;
    if (type === 'dns') {
      updatedZone = dnsCdnSystem.updateDNSZone(zoneId, updates);
    } else if (type === 'cdn') {
      updatedZone = dnsCdnSystem.updateCDNZone(zoneId, updates);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "dns" or "cdn"' },
        { status: 400 }
      );
    }

    if (!updatedZone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    return NextResponse.json({
      zone: updatedZone,
      message: 'Zone updated successfully',
    });
  } catch (error) {
    logger.error('Error updating zone', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
