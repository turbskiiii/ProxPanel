import { NextRequest, NextResponse } from 'next/server';
import { multiTenantSystem } from '@/lib/multi-tenant';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'list':
        const tenants = Array.from(multiTenantSystem['tenants'].values());
        return NextResponse.json({ success: true, data: tenants });

      case 'get':
        if (!tenantId) {
          return NextResponse.json(
            { success: false, error: 'Tenant ID required' },
            { status: 400 }
          );
        }
        const tenant = multiTenantSystem.getTenant(tenantId);
        if (!tenant) {
          return NextResponse.json(
            { success: false, error: 'Tenant not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: tenant });

      case 'analytics':
        if (!tenantId) {
          return NextResponse.json(
            { success: false, error: 'Tenant ID required' },
            { status: 400 }
          );
        }
        const analytics = multiTenantSystem.getTenantAnalytics(tenantId);
        if (!analytics) {
          return NextResponse.json(
            { success: false, error: 'Tenant not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: analytics });

      case 'resellers':
        if (!tenantId) {
          return NextResponse.json(
            { success: false, error: 'Tenant ID required' },
            { status: 400 }
          );
        }
        const resellers = multiTenantSystem.getResellersByTenant(tenantId);
        return NextResponse.json({ success: true, data: resellers });

      case 'users':
        if (!tenantId) {
          return NextResponse.json(
            { success: false, error: 'Tenant ID required' },
            { status: 400 }
          );
        }
        const users = multiTenantSystem.getUsersByTenant(tenantId);
        return NextResponse.json({ success: true, data: users });

      default:
        return NextResponse.json({
          success: true,
          data: {
            totalTenants: multiTenantSystem['tenants'].size,
            totalResellers: multiTenantSystem['resellers'].size,
            totalUsers: multiTenantSystem['tenantUsers'].size,
          },
        });
    }
  } catch (error) {
    logger.error('Tenants API error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create-tenant':
        const tenant = multiTenantSystem.createTenant(
          data.name,
          data.domain,
          data.subdomain,
          data.plan,
          data.resellerId
        );
        return NextResponse.json({ success: true, data: tenant });

      case 'create-reseller':
        const reseller = multiTenantSystem.createReseller(
          data.tenantId,
          data.name,
          data.email,
          data.commission
        );
        return NextResponse.json({ success: true, data: reseller });

      case 'add-user':
        const tenantUser = multiTenantSystem.addUserToTenant(
          data.tenantId,
          data.userId,
          data.role,
          data.permissions
        );
        return NextResponse.json({ success: true, data: tenantUser });

      case 'update-branding':
        const updatedTenant = multiTenantSystem.updateTenantBranding(
          data.tenantId,
          data.branding
        );
        if (!updatedTenant) {
          return NextResponse.json(
            { success: false, error: 'Tenant not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedTenant });

      case 'add-custom-domain':
        const success = multiTenantSystem.addCustomDomain(
          data.tenantId,
          data.domain
        );
        if (!success) {
          return NextResponse.json(
            { success: false, error: 'Failed to add custom domain' },
            { status: 400 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Custom domain added',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Tenants API POST error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, ...updates } = body;

    switch (action) {
      case 'update-tenant':
        const updatedTenant = multiTenantSystem.updateTenant(id, updates);
        if (!updatedTenant) {
          return NextResponse.json(
            { success: false, error: 'Tenant not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedTenant });

      case 'activate-tenant':
        const activatedTenant = multiTenantSystem.activateTenant(id);
        if (!activatedTenant) {
          return NextResponse.json(
            { success: false, error: 'Tenant not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: activatedTenant });

      case 'suspend-tenant':
        const suspendedTenant = multiTenantSystem.suspendTenant(id);
        if (!suspendedTenant) {
          return NextResponse.json(
            { success: false, error: 'Tenant not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: suspendedTenant });

      case 'update-reseller':
        const updatedReseller = multiTenantSystem.updateReseller(id, updates);
        if (!updatedReseller) {
          return NextResponse.json(
            { success: false, error: 'Reseller not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedReseller });

      case 'activate-reseller':
        const activatedReseller = multiTenantSystem.activateReseller(id);
        if (!activatedReseller) {
          return NextResponse.json(
            { success: false, error: 'Reseller not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: activatedReseller });

      case 'update-tenant-user':
        const updatedTenantUser = multiTenantSystem.updateTenantUser(
          id,
          updates
        );
        if (!updatedTenantUser) {
          return NextResponse.json(
            { success: false, error: 'Tenant user not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedTenantUser });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Tenants API PUT error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
