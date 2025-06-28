import { NextRequest, NextResponse } from 'next/server';
import { billingSystem } from '@/lib/billing-system';
import { multiTenantSystem } from '@/lib/multi-tenant';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'analytics':
        const timeRange = searchParams.get('timeRange');
        const analytics = billingSystem.getBillingAnalytics(
          timeRange === 'month'
            ? {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date(),
              }
            : undefined
        );
        return NextResponse.json({ success: true, data: analytics });

      case 'plans':
        const plans = billingSystem.getPlans();
        return NextResponse.json({ success: true, data: plans });

      case 'subscriptions':
        const subscriptions = Array.from(
          billingSystem['subscriptions'].values()
        );
        return NextResponse.json({ success: true, data: subscriptions });

      case 'invoices':
        const invoices = Array.from(billingSystem['invoices'].values());
        return NextResponse.json({ success: true, data: invoices });

      default:
        return NextResponse.json({
          success: true,
          data: {
            analytics: billingSystem.getBillingAnalytics(),
            plans: billingSystem.getPlans(),
            totalSubscriptions: billingSystem['subscriptions'].size,
            totalInvoices: billingSystem['invoices'].size,
          },
        });
    }
  } catch (error) {
    logger.error('Billing API error', { error });
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
      case 'create-plan':
        const plan = billingSystem.createPlan(data);
        return NextResponse.json({ success: true, data: plan });

      case 'create-subscription':
        const subscription = billingSystem.createSubscription(
          data.userId,
          data.planId,
          data.provider,
          data.providerSubscriptionId,
          data.metadata
        );
        return NextResponse.json({ success: true, data: subscription });

      case 'create-invoice':
        const invoice = billingSystem.createInvoice(
          data.subscriptionId,
          data.items
        );
        return NextResponse.json({ success: true, data: invoice });

      case 'mark-invoice-paid':
        const paidInvoice = billingSystem.markInvoiceAsPaid(data.invoiceId);
        if (!paidInvoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: paidInvoice });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Billing API POST error', { error });
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
      case 'update-plan':
        const updatedPlan = billingSystem.updatePlan(id, updates);
        if (!updatedPlan) {
          return NextResponse.json(
            { success: false, error: 'Plan not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedPlan });

      case 'cancel-subscription':
        const cancelledSubscription = billingSystem.cancelSubscription(
          id,
          updates.cancelAtPeriodEnd
        );
        if (!cancelledSubscription) {
          return NextResponse.json(
            { success: false, error: 'Subscription not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: cancelledSubscription,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Billing API PUT error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
