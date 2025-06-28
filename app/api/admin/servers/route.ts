import { NextRequest, NextResponse } from 'next/server';
import { serverManagement } from '@/lib/server-management';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const nodeId = searchParams.get('nodeId');
    const clusterId = searchParams.get('clusterId');

    switch (action) {
      case 'nodes':
        const filters: any = {};
        if (searchParams.get('type')) filters.type = searchParams.get('type');
        if (searchParams.get('status'))
          filters.status = searchParams.get('status');
        if (searchParams.get('location'))
          filters.location = searchParams.get('location');

        const nodes = serverManagement.getNodes(
          Object.keys(filters).length > 0 ? filters : undefined
        );
        return NextResponse.json({ success: true, data: nodes });

      case 'node':
        if (!nodeId) {
          return NextResponse.json(
            { success: false, error: 'Node ID required' },
            { status: 400 }
          );
        }
        const node = serverManagement.getNode(nodeId);
        if (!node) {
          return NextResponse.json(
            { success: false, error: 'Node not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: node });

      case 'clusters':
        const clusterFilters: any = {};
        if (searchParams.get('type'))
          clusterFilters.type = searchParams.get('type');
        if (searchParams.get('status'))
          clusterFilters.status = searchParams.get('status');

        const clusters = serverManagement.getClusters(
          Object.keys(clusterFilters).length > 0 ? clusterFilters : undefined
        );
        return NextResponse.json({ success: true, data: clusters });

      case 'cluster':
        if (!clusterId) {
          return NextResponse.json(
            { success: false, error: 'Cluster ID required' },
            { status: 400 }
          );
        }
        const cluster = serverManagement.getCluster(clusterId);
        if (!cluster) {
          return NextResponse.json(
            { success: false, error: 'Cluster not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: cluster });

      case 'load-balancers':
        const loadBalancers = serverManagement.getLoadBalancers(
          clusterId || undefined
        );
        return NextResponse.json({ success: true, data: loadBalancers });

      case 'load-balancer':
        if (!searchParams.get('lbId')) {
          return NextResponse.json(
            { success: false, error: 'Load balancer ID required' },
            { status: 400 }
          );
        }
        const loadBalancer = serverManagement.getLoadBalancer(
          searchParams.get('lbId')!
        );
        if (!loadBalancer) {
          return NextResponse.json(
            { success: false, error: 'Load balancer not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: loadBalancer });

      case 'analytics':
        const analytics = serverManagement.getSystemAnalytics();
        return NextResponse.json({ success: true, data: analytics });

      default:
        return NextResponse.json({
          success: true,
          data: {
            analytics: serverManagement.getSystemAnalytics(),
            totalNodes: serverManagement['nodes'].size,
            totalClusters: serverManagement['clusters'].size,
            totalLoadBalancers: serverManagement['loadBalancers'].size,
          },
        });
    }
  } catch (error) {
    logger.error('Servers API error', { error });
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
      case 'add-node':
        const node = serverManagement.addNode(data);
        return NextResponse.json({ success: true, data: node });

      case 'create-cluster':
        const cluster = serverManagement.createCluster(
          data.name,
          data.type,
          data.nodeIds,
          data.config
        );
        return NextResponse.json({ success: true, data: cluster });

      case 'create-load-balancer':
        const loadBalancer = serverManagement.createLoadBalancer(
          data.name,
          data.clusterId,
          data.frontend,
          data.backends
        );
        return NextResponse.json({ success: true, data: loadBalancer });

      case 'add-backend':
        const updatedLoadBalancer = serverManagement.addBackendToLoadBalancer(
          data.lbId,
          data.backend
        );
        if (!updatedLoadBalancer) {
          return NextResponse.json(
            { success: false, error: 'Load balancer not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedLoadBalancer });

      case 'enable-auto-scaling':
        const success = serverManagement.enableAutoScaling(
          data.clusterId,
          data.config
        );
        if (!success) {
          return NextResponse.json(
            { success: false, error: 'Cluster not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Auto scaling enabled',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Servers API POST error', { error });
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
      case 'update-node':
        const updatedNode = serverManagement.updateNode(id, updates);
        if (!updatedNode) {
          return NextResponse.json(
            { success: false, error: 'Node not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedNode });

      case 'update-cluster':
        const updatedCluster = serverManagement.updateCluster(id, updates);
        if (!updatedCluster) {
          return NextResponse.json(
            { success: false, error: 'Cluster not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updatedCluster });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Servers API PUT error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'remove-node':
        const success = serverManagement.removeNode(id);
        if (!success) {
          return NextResponse.json(
            { success: false, error: 'Node not found or cannot be removed' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, message: 'Node removed' });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Servers API DELETE error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
