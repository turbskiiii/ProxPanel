import { logger } from './logger';

export interface BillingProvider {
  name: string;
  type: 'whmcs' | 'stripe' | 'paypal' | 'blesta';
  config: Record<string, any>;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'suspended' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  provider: string;
  providerSubscriptionId: string;
  metadata: Record<string, any>;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  metadata: Record<string, any>;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metadata: Record<string, any>;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  features: BillingFeature[];
  limits: BillingLimits;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface BillingFeature {
  name: string;
  value: number | string | boolean;
  type: 'number' | 'string' | 'boolean';
  description: string;
}

export interface BillingLimits {
  vpsCount: number;
  cpuCores: number;
  memoryGB: number;
  storageGB: number;
  bandwidthGB: number;
  backupCount: number;
  supportLevel: 'basic' | 'priority' | 'enterprise';
}

export class BillingSystem {
  private static instance: BillingSystem;
  private providers: Map<string, BillingProvider> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private plans: Map<string, BillingPlan> = new Map();

  private constructor() {
    this.initializeDefaultPlans();
    this.initializeProviders();
  }

  static getInstance(): BillingSystem {
    if (!BillingSystem.instance) {
      BillingSystem.instance = new BillingSystem();
    }
    return BillingSystem.instance;
  }

  private initializeDefaultPlans() {
    const plans: BillingPlan[] = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small projects',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          {
            name: 'vps_count',
            value: 2,
            type: 'number',
            description: 'VPS instances',
          },
          {
            name: 'cpu_cores',
            value: 2,
            type: 'number',
            description: 'CPU cores per VPS',
          },
          {
            name: 'memory_gb',
            value: 4,
            type: 'number',
            description: 'RAM per VPS',
          },
          {
            name: 'storage_gb',
            value: 50,
            type: 'number',
            description: 'Storage per VPS',
          },
          {
            name: 'backup_count',
            value: 5,
            type: 'number',
            description: 'Backup slots',
          },
          {
            name: 'support_level',
            value: 'basic',
            type: 'string',
            description: 'Support level',
          },
        ],
        limits: {
          vpsCount: 2,
          cpuCores: 2,
          memoryGB: 4,
          storageGB: 50,
          bandwidthGB: 1000,
          backupCount: 5,
          supportLevel: 'basic',
        },
        isActive: true,
        metadata: {},
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'For growing businesses',
        price: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          {
            name: 'vps_count',
            value: 10,
            type: 'number',
            description: 'VPS instances',
          },
          {
            name: 'cpu_cores',
            value: 4,
            type: 'number',
            description: 'CPU cores per VPS',
          },
          {
            name: 'memory_gb',
            value: 8,
            type: 'number',
            description: 'RAM per VPS',
          },
          {
            name: 'storage_gb',
            value: 100,
            type: 'number',
            description: 'Storage per VPS',
          },
          {
            name: 'backup_count',
            value: 20,
            type: 'number',
            description: 'Backup slots',
          },
          {
            name: 'support_level',
            value: 'priority',
            type: 'string',
            description: 'Support level',
          },
        ],
        limits: {
          vpsCount: 10,
          cpuCores: 4,
          memoryGB: 8,
          storageGB: 100,
          bandwidthGB: 5000,
          backupCount: 20,
          supportLevel: 'priority',
        },
        isActive: true,
        metadata: {},
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large-scale deployments',
        price: 99.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          {
            name: 'vps_count',
            value: -1,
            type: 'number',
            description: 'Unlimited VPS instances',
          },
          {
            name: 'cpu_cores',
            value: 16,
            type: 'number',
            description: 'CPU cores per VPS',
          },
          {
            name: 'memory_gb',
            value: 32,
            type: 'number',
            description: 'RAM per VPS',
          },
          {
            name: 'storage_gb',
            value: 500,
            type: 'number',
            description: 'Storage per VPS',
          },
          {
            name: 'backup_count',
            value: -1,
            type: 'number',
            description: 'Unlimited backups',
          },
          {
            name: 'support_level',
            value: 'enterprise',
            type: 'string',
            description: 'Support level',
          },
        ],
        limits: {
          vpsCount: -1, // Unlimited
          cpuCores: 16,
          memoryGB: 32,
          storageGB: 500,
          bandwidthGB: -1, // Unlimited
          backupCount: -1, // Unlimited
          supportLevel: 'enterprise',
        },
        isActive: true,
        metadata: {},
      },
    ];

    plans.forEach(plan => this.plans.set(plan.id, plan));
  }

  private initializeProviders() {
    const providers: BillingProvider[] = [
      {
        name: 'Stripe',
        type: 'stripe',
        config: {
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
          secretKey: process.env.STRIPE_SECRET_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },
        isActive: true,
      },
      {
        name: 'WHMCS',
        type: 'whmcs',
        config: {
          url: process.env.WHMCS_URL,
          identifier: process.env.WHMCS_IDENTIFIER,
          secret: process.env.WHMCS_SECRET,
        },
        isActive: false,
      },
      {
        name: 'PayPal',
        type: 'paypal',
        config: {
          clientId: process.env.PAYPAL_CLIENT_ID,
          clientSecret: process.env.PAYPAL_CLIENT_SECRET,
          mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
        },
        isActive: false,
      },
    ];

    providers.forEach(provider => this.providers.set(provider.name, provider));
  }

  // Plan Management
  getPlans(): BillingPlan[] {
    return Array.from(this.plans.values()).filter(plan => plan.isActive);
  }

  getPlan(planId: string): BillingPlan | null {
    return this.plans.get(planId) || null;
  }

  createPlan(plan: Omit<BillingPlan, 'id'>): BillingPlan {
    const newPlan: BillingPlan = {
      ...plan,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.plans.set(newPlan.id, newPlan);
    logger.info('Billing plan created', {
      planId: newPlan.id,
      name: newPlan.name,
    });
    return newPlan;
  }

  updatePlan(
    planId: string,
    updates: Partial<BillingPlan>
  ): BillingPlan | null {
    const plan = this.plans.get(planId);
    if (!plan) return null;

    const updatedPlan = { ...plan, ...updates };
    this.plans.set(planId, updatedPlan);
    logger.info('Billing plan updated', { planId, updates });
    return updatedPlan;
  }

  // Subscription Management
  createSubscription(
    userId: string,
    planId: string,
    provider: string,
    providerSubscriptionId: string,
    metadata: Record<string, any> = {}
  ): Subscription {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: this.calculatePeriodEnd(plan.billingCycle),
      cancelAtPeriodEnd: false,
      amount: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      provider,
      providerSubscriptionId,
      metadata,
    };

    this.subscriptions.set(subscription.id, subscription);
    logger.info('Subscription created', {
      subscriptionId: subscription.id,
      userId,
      planId,
    });
    return subscription;
  }

  getSubscription(subscriptionId: string): Subscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  getUserSubscriptions(userId: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(
      sub => sub.userId === userId
    );
  }

  cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Subscription | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = 'cancelled';
    }

    this.subscriptions.set(subscriptionId, subscription);
    logger.info('Subscription cancelled', {
      subscriptionId,
      cancelAtPeriodEnd,
    });
    return subscription;
  }

  // Invoice Management
  createInvoice(
    subscriptionId: string,
    items: Omit<InvoiceItem, 'id'>[]
  ): Invoice {
    const subscription = this.getSubscription(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    const invoiceItems: InvoiceItem[] = items.map((item, index) => ({
      ...item,
      id: `item_${Date.now()}_${index}`,
      total: item.quantity * item.unitPrice,
    }));

    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0);

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscriptionId,
      userId: subscription.userId,
      amount: totalAmount,
      currency: subscription.currency,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: invoiceItems,
      metadata: {},
    };

    this.invoices.set(invoice.id, invoice);
    logger.info('Invoice created', {
      invoiceId: invoice.id,
      subscriptionId,
      amount: totalAmount,
    });
    return invoice;
  }

  getInvoice(invoiceId: string): Invoice | null {
    return this.invoices.get(invoiceId) || null;
  }

  getUserInvoices(userId: string): Invoice[] {
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.userId === userId
    );
  }

  markInvoiceAsPaid(invoiceId: string): Invoice | null {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    this.invoices.set(invoiceId, invoice);

    logger.info('Invoice marked as paid', {
      invoiceId,
      paidAt: invoice.paidAt,
    });
    return invoice;
  }

  // Provider Management
  getProviders(): BillingProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(providerName: string): BillingProvider | null {
    return this.providers.get(providerName) || null;
  }

  updateProvider(
    providerName: string,
    updates: Partial<BillingProvider>
  ): BillingProvider | null {
    const provider = this.providers.get(providerName);
    if (!provider) return null;

    const updatedProvider = { ...provider, ...updates };
    this.providers.set(providerName, updatedProvider);
    logger.info('Billing provider updated', { providerName, updates });
    return updatedProvider;
  }

  // Utility Methods
  private calculatePeriodEnd(billingCycle: string): Date {
    const now = new Date();
    switch (billingCycle) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  // Usage Tracking
  trackUsage(userId: string, resourceType: string, amount: number): void {
    const subscriptions = this.getUserSubscriptions(userId);
    const activeSubscription = subscriptions.find(
      sub => sub.status === 'active'
    );

    if (activeSubscription) {
      const plan = this.getPlan(activeSubscription.planId);
      if (plan) {
        // Track usage against plan limits
        logger.info('Usage tracked', {
          userId,
          resourceType,
          amount,
          planId: plan.id,
        });
      }
    }
  }

  // Analytics
  getBillingAnalytics(timeRange?: { start: Date; end: Date }) {
    const subscriptions = Array.from(this.subscriptions.values());
    const invoices = Array.from(this.invoices.values());

    const filteredSubscriptions = timeRange
      ? subscriptions.filter(
          sub =>
            sub.currentPeriodStart >= timeRange.start &&
            sub.currentPeriodStart <= timeRange.end
        )
      : subscriptions;

    const filteredInvoices = timeRange
      ? invoices.filter(
          inv => inv.dueDate >= timeRange.start && inv.dueDate <= timeRange.end
        )
      : invoices;

    return {
      totalSubscriptions: filteredSubscriptions.length,
      activeSubscriptions: filteredSubscriptions.filter(
        sub => sub.status === 'active'
      ).length,
      totalRevenue: filteredInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0),
      outstandingAmount: filteredInvoices
        .filter(inv => inv.status === 'open')
        .reduce((sum, inv) => sum + inv.amount, 0),
      averageSubscriptionValue:
        filteredSubscriptions.length > 0
          ? filteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0) /
            filteredSubscriptions.length
          : 0,
    };
  }
}

// Singleton instance
export const billingSystem = BillingSystem.getInstance();
