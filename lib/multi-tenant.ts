import { logger } from './logger';
import { billingSystem } from './billing-system';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'pending';
  plan: string;
  limits: TenantLimits;
  branding: TenantBranding;
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface TenantLimits {
  maxUsers: number;
  maxVPS: number;
  maxStorageGB: number;
  maxBandwidthGB: number;
  maxBackups: number;
  supportLevel: 'basic' | 'priority' | 'enterprise';
  customDomain: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
}

export interface TenantBranding {
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  customCSS: string;
  customJS: string;
}

export interface TenantSettings {
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableAuditLogs: boolean;
  enableAnalytics: boolean;
  enableBackups: boolean;
  enableMonitoring: boolean;
}

export interface Reseller {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  commission: number; // Percentage
  status: 'active' | 'suspended' | 'pending';
  balance: number;
  totalSales: number;
  totalCommission: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: 'admin' | 'user' | 'reseller';
  permissions: string[];
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export class MultiTenantSystem {
  private static instance: MultiTenantSystem;
  private tenants: Map<string, Tenant> = new Map();
  private resellers: Map<string, Reseller> = new Map();
  private tenantUsers: Map<string, TenantUser> = new Map();
  private tenantData: Map<string, Map<string, any>> = new Map();

  private constructor() {
    this.initializeDefaultTenant();
  }

  static getInstance(): MultiTenantSystem {
    if (!MultiTenantSystem.instance) {
      MultiTenantSystem.instance = new MultiTenantSystem();
    }
    return MultiTenantSystem.instance;
  }

  private initializeDefaultTenant() {
    const defaultTenant: Tenant = {
      id: 'default',
      name: 'ProxPanel',
      domain: 'proxpanel.com',
      subdomain: 'app',
      status: 'active',
      plan: 'enterprise',
      limits: {
        maxUsers: -1, // Unlimited
        maxVPS: -1,
        maxStorageGB: -1,
        maxBandwidthGB: -1,
        maxBackups: -1,
        supportLevel: 'enterprise',
        customDomain: true,
        whiteLabel: true,
        apiAccess: true,
      },
      branding: {
        logo: '/logo.png',
        favicon: '/favicon.ico',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        companyName: 'ProxPanel',
        supportEmail: 'admin@turbskiiii.com',
        supportPhone: '+1-555-0123',
        customCSS: '',
        customJS: '',
      },
      settings: {
        allowUserRegistration: true,
        requireEmailVerification: true,
        enableTwoFactor: true,
        sessionTimeout: 86400,
        maxLoginAttempts: 5,
        enableAuditLogs: true,
        enableAnalytics: true,
        enableBackups: true,
        enableMonitoring: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };

    this.tenants.set(defaultTenant.id, defaultTenant);
  }

  // Tenant Management
  createTenant(
    name: string,
    domain: string,
    subdomain: string,
    plan: string,
    resellerId?: string
  ): Tenant {
    const tenant: Tenant = {
      id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      domain,
      subdomain,
      status: 'pending',
      plan,
      limits: this.getPlanLimits(plan),
      branding: this.getDefaultBranding(name),
      settings: this.getDefaultSettings(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { resellerId },
    };

    this.tenants.set(tenant.id, tenant);
    this.tenantData.set(tenant.id, new Map());

    // Create billing subscription for tenant
    if (resellerId) {
      const reseller = this.getReseller(resellerId);
      if (reseller) {
        billingSystem.createSubscription(
          tenant.id,
          plan,
          'internal',
          `sub_${tenant.id}`,
          { tenantId: tenant.id, resellerId }
        );
      }
    }

    logger.info('Tenant created', { tenantId: tenant.id, name, domain, plan });
    return tenant;
  }

  getTenant(tenantId: string): Tenant | null {
    return this.tenants.get(tenantId) || null;
  }

  getTenantByDomain(domain: string, subdomain?: string): Tenant | null {
    return (
      Array.from(this.tenants.values()).find(
        tenant =>
          tenant.domain === domain &&
          (!subdomain || tenant.subdomain === subdomain)
      ) || null
    );
  }

  updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant | null {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date(),
    };
    this.tenants.set(tenantId, updatedTenant);

    logger.info('Tenant updated', { tenantId, updates });
    return updatedTenant;
  }

  activateTenant(tenantId: string): Tenant | null {
    return this.updateTenant(tenantId, { status: 'active' });
  }

  suspendTenant(tenantId: string): Tenant | null {
    return this.updateTenant(tenantId, { status: 'suspended' });
  }

  // Reseller Management
  createReseller(
    tenantId: string,
    name: string,
    email: string,
    commission: number
  ): Reseller {
    const reseller: Reseller = {
      id: `reseller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      name,
      email,
      commission,
      status: 'pending',
      balance: 0,
      totalSales: 0,
      totalCommission: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.resellers.set(reseller.id, reseller);
    logger.info('Reseller created', {
      resellerId: reseller.id,
      tenantId,
      name,
      commission,
    });
    return reseller;
  }

  getReseller(resellerId: string): Reseller | null {
    return this.resellers.get(resellerId) || null;
  }

  getResellersByTenant(tenantId: string): Reseller[] {
    return Array.from(this.resellers.values()).filter(
      reseller => reseller.tenantId === tenantId
    );
  }

  updateReseller(
    resellerId: string,
    updates: Partial<Reseller>
  ): Reseller | null {
    const reseller = this.resellers.get(resellerId);
    if (!reseller) return null;

    const updatedReseller = {
      ...reseller,
      ...updates,
      updatedAt: new Date(),
    };
    this.resellers.set(resellerId, updatedReseller);

    logger.info('Reseller updated', { resellerId, updates });
    return updatedReseller;
  }

  activateReseller(resellerId: string): Reseller | null {
    return this.updateReseller(resellerId, { status: 'active' });
  }

  // Tenant User Management
  addUserToTenant(
    tenantId: string,
    userId: string,
    role: 'admin' | 'user' | 'reseller',
    permissions: string[] = []
  ): TenantUser {
    const tenantUser: TenantUser = {
      id: `tenant_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      userId,
      role,
      permissions,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tenantUsers.set(tenantUser.id, tenantUser);
    logger.info('User added to tenant', { tenantId, userId, role });
    return tenantUser;
  }

  getTenantUser(tenantUserId: string): TenantUser | null {
    return this.tenantUsers.get(tenantUserId) || null;
  }

  getUsersByTenant(tenantId: string): TenantUser[] {
    return Array.from(this.tenantUsers.values()).filter(
      user => user.tenantId === tenantId
    );
  }

  getUserTenants(userId: string): TenantUser[] {
    return Array.from(this.tenantUsers.values()).filter(
      user => user.userId === userId
    );
  }

  updateTenantUser(
    tenantUserId: string,
    updates: Partial<TenantUser>
  ): TenantUser | null {
    const tenantUser = this.tenantUsers.get(tenantUserId);
    if (!tenantUser) return null;

    const updatedTenantUser = {
      ...tenantUser,
      ...updates,
      updatedAt: new Date(),
    };
    this.tenantUsers.set(tenantUserId, updatedTenantUser);

    logger.info('Tenant user updated', { tenantUserId, updates });
    return updatedTenantUser;
  }

  // White Label Support
  updateTenantBranding(
    tenantId: string,
    branding: Partial<TenantBranding>
  ): Tenant | null {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;

    const updatedBranding = { ...tenant.branding, ...branding };
    return this.updateTenant(tenantId, { branding: updatedBranding });
  }

  getTenantBranding(tenantId: string): TenantBranding | null {
    const tenant = this.getTenant(tenantId);
    return tenant?.branding || null;
  }

  // Custom Domain Support
  addCustomDomain(tenantId: string, domain: string): boolean {
    const tenant = this.getTenant(tenantId);
    if (!tenant || !tenant.limits.customDomain) return false;

    // Add domain to tenant metadata
    const customDomains = tenant.metadata.customDomains || [];
    customDomains.push(domain);

    this.updateTenant(tenantId, {
      metadata: { ...tenant.metadata, customDomains },
    });

    logger.info('Custom domain added', { tenantId, domain });
    return true;
  }

  // Resource Isolation
  getTenantData(tenantId: string, key: string): any {
    const tenantData = this.tenantData.get(tenantId);
    return tenantData?.get(key);
  }

  setTenantData(tenantId: string, key: string, value: any): void {
    let tenantData = this.tenantData.get(tenantId);
    if (!tenantData) {
      tenantData = new Map();
      this.tenantData.set(tenantId, tenantData);
    }
    tenantData.set(key, value);
  }

  // Usage Tracking
  trackTenantUsage(
    tenantId: string,
    resourceType: string,
    amount: number
  ): boolean {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return false;

    const currentUsage = this.getTenantData(tenantId, 'usage') || {};
    currentUsage[resourceType] = (currentUsage[resourceType] || 0) + amount;

    this.setTenantData(tenantId, 'usage', currentUsage);

    // Check against limits
    const limit = this.getResourceLimit(tenant.limits, resourceType);
    if (limit > 0 && currentUsage[resourceType] > limit) {
      logger.warn('Tenant usage limit exceeded', {
        tenantId,
        resourceType,
        usage: currentUsage[resourceType],
        limit,
      });
      return false;
    }

    return true;
  }

  // Analytics
  getTenantAnalytics(tenantId: string) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;

    const usage = this.getTenantData(tenantId, 'usage') || {};
    const users = this.getUsersByTenant(tenantId);
    const resellers = this.getResellersByTenant(tenantId);

    return {
      tenantId,
      name: tenant.name,
      status: tenant.status,
      plan: tenant.plan,
      userCount: users.length,
      resellerCount: resellers.length,
      usage,
      limits: tenant.limits,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }

  // Utility Methods
  private getPlanLimits(plan: string): TenantLimits {
    const planLimits: Record<string, TenantLimits> = {
      starter: {
        maxUsers: 10,
        maxVPS: 5,
        maxStorageGB: 500,
        maxBandwidthGB: 1000,
        maxBackups: 20,
        supportLevel: 'basic',
        customDomain: false,
        whiteLabel: false,
        apiAccess: false,
      },
      professional: {
        maxUsers: 100,
        maxVPS: 50,
        maxStorageGB: 5000,
        maxBandwidthGB: 10000,
        maxBackups: 200,
        supportLevel: 'priority',
        customDomain: true,
        whiteLabel: false,
        apiAccess: true,
      },
      enterprise: {
        maxUsers: -1, // Unlimited
        maxVPS: -1,
        maxStorageGB: -1,
        maxBandwidthGB: -1,
        maxBackups: -1,
        supportLevel: 'enterprise',
        customDomain: true,
        whiteLabel: true,
        apiAccess: true,
      },
    };

    return planLimits[plan] || planLimits.starter;
  }

  private getDefaultBranding(companyName: string): TenantBranding {
    return {
      logo: '/logo.png',
      favicon: '/favicon.ico',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      companyName,
      supportEmail: `support@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      supportPhone: '+1-555-0123',
      customCSS: '',
      customJS: '',
    };
  }

  private getDefaultSettings(): TenantSettings {
    return {
      allowUserRegistration: true,
      requireEmailVerification: true,
      enableTwoFactor: true,
      sessionTimeout: 86400,
      maxLoginAttempts: 5,
      enableAuditLogs: true,
      enableAnalytics: true,
      enableBackups: true,
      enableMonitoring: true,
    };
  }

  private getResourceLimit(limits: TenantLimits, resourceType: string): number {
    const limitMap: Record<string, number> = {
      users: limits.maxUsers,
      vps: limits.maxVPS,
      storage: limits.maxStorageGB,
      bandwidth: limits.maxBandwidthGB,
      backups: limits.maxBackups,
    };

    return limitMap[resourceType] || -1;
  }
}

// Singleton instance
export const multiTenantSystem = MultiTenantSystem.getInstance();
