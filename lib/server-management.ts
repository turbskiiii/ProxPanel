import { logger } from './logger';

export interface ServerNode {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  type: 'compute' | 'storage' | 'network' | 'management';
  specs: ServerSpecs;
  resources: ServerResources;
  location: ServerLocation;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface ServerSpecs {
  cpu: {
    cores: number;
    model: string;
    frequency: number;
  };
  memory: {
    total: number; // GB
    type: string;
    frequency: number;
  };
  storage: {
    total: number; // GB
    type: string; // SSD, HDD, NVMe
    raid: string;
  };
  network: {
    interfaces: NetworkInterface[];
    bandwidth: number; // Mbps
  };
}

export interface NetworkInterface {
  name: string;
  mac: string;
  ip: string;
  netmask: string;
  gateway: string;
  type: 'ethernet' | 'bond' | 'vlan';
  speed: number; // Mbps
}

export interface ServerResources {
  cpu: {
    usage: number; // Percentage
    load: number[];
    temperature: number;
  };
  memory: {
    used: number; // GB
    available: number; // GB
    swap: number; // GB
  };
  storage: {
    used: number; // GB
    available: number; // GB
    iops: number;
    latency: number;
  };
  network: {
    rx: number; // Bytes/s
    tx: number; // Bytes/s
    connections: number;
  };
}

export interface ServerLocation {
  datacenter: string;
  rack: string;
  position: string;
  country: string;
  city: string;
  timezone: string;
}

export interface Cluster {
  id: string;
  name: string;
  type: 'high-availability' | 'load-balancing' | 'auto-scaling';
  nodes: string[]; // Server IDs
  status: 'active' | 'degraded' | 'offline';
  config: ClusterConfig;
  health: ClusterHealth;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClusterConfig {
  replication: number;
  quorum: number;
  failover: boolean;
  loadBalancing: LoadBalancingConfig;
  autoScaling: AutoScalingConfig;
}

export interface LoadBalancingConfig {
  algorithm: 'round-robin' | 'least-connections' | 'ip-hash' | 'weighted';
  healthCheck: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    path: string;
  };
  ssl: {
    enabled: boolean;
    certificate: string;
    privateKey: string;
  };
  sticky: {
    enabled: boolean;
    type: 'cookie' | 'ip';
  };
}

export interface AutoScalingConfig {
  enabled: boolean;
  minNodes: number;
  maxNodes: number;
  targetCPU: number;
  targetMemory: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldown: number;
}

export interface ClusterHealth {
  status: 'healthy' | 'warning' | 'critical';
  nodes: {
    [nodeId: string]: {
      status: 'online' | 'offline' | 'degraded';
      lastCheck: Date;
      responseTime: number;
    };
  };
  lastCheck: Date;
}

export interface LoadBalancer {
  id: string;
  name: string;
  clusterId: string;
  frontend: LoadBalancerFrontend;
  backends: LoadBalancerBackend[];
  rules: LoadBalancerRule[];
  status: 'active' | 'inactive' | 'error';
  stats: LoadBalancerStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadBalancerFrontend {
  protocol: 'http' | 'https' | 'tcp' | 'udp';
  port: number;
  ssl: {
    enabled: boolean;
    certificate: string;
    privateKey: string;
  };
  ip: string;
}

export interface LoadBalancerBackend {
  id: string;
  serverId: string;
  port: number;
  weight: number;
  healthCheck: {
    enabled: boolean;
    path: string;
    interval: number;
    timeout: number;
    retries: number;
  };
  status: 'active' | 'inactive' | 'error';
}

export interface LoadBalancerRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
}

export interface LoadBalancerStats {
  requests: number;
  responses: number;
  errors: number;
  activeConnections: number;
  bytesIn: number;
  bytesOut: number;
  lastUpdate: Date;
}

export class ServerManagementSystem {
  private static instance: ServerManagementSystem;
  private nodes: Map<string, ServerNode> = new Map();
  private clusters: Map<string, Cluster> = new Map();
  private loadBalancers: Map<string, LoadBalancer> = new Map();
  private monitoring: Map<string, any> = new Map();

  private constructor() {
    this.initializeDefaultNodes();
    this.startMonitoring();
  }

  static getInstance(): ServerManagementSystem {
    if (!ServerManagementSystem.instance) {
      ServerManagementSystem.instance = new ServerManagementSystem();
    }
    return ServerManagementSystem.instance;
  }

  private initializeDefaultNodes() {
    const defaultNodes: ServerNode[] = [
      {
        id: 'node-1',
        name: 'Primary Compute Node',
        hostname: 'compute-01.proxpanel.com',
        ip: '192.168.1.10',
        status: 'online',
        type: 'compute',
        specs: {
          cpu: { cores: 32, model: 'AMD EPYC 7443P', frequency: 2.85 },
          memory: { total: 128, type: 'DDR4', frequency: 3200 },
          storage: { total: 4000, type: 'NVMe', raid: 'RAID 10' },
          network: {
            interfaces: [
              {
                name: 'eth0',
                mac: '00:15:5d:01:ca:05',
                ip: '192.168.1.10',
                netmask: '255.255.255.0',
                gateway: '192.168.1.1',
                type: 'ethernet',
                speed: 10000,
              },
            ],
            bandwidth: 10000,
          },
        },
        resources: {
          cpu: { usage: 25, load: [1.2, 1.5, 1.8], temperature: 45 },
          memory: { used: 64, available: 64, swap: 0 },
          storage: { used: 2000, available: 2000, iops: 50000, latency: 0.1 },
          network: { rx: 1000000, tx: 500000, connections: 150 },
        },
        location: {
          datacenter: 'DC-01',
          rack: 'R01',
          position: 'U42',
          country: 'US',
          city: 'New York',
          timezone: 'America/New_York',
        },
        tags: ['compute', 'primary', 'production'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      },
      {
        id: 'node-2',
        name: 'Secondary Compute Node',
        hostname: 'compute-02.proxpanel.com',
        ip: '192.168.1.11',
        status: 'online',
        type: 'compute',
        specs: {
          cpu: { cores: 32, model: 'AMD EPYC 7443P', frequency: 2.85 },
          memory: { total: 128, type: 'DDR4', frequency: 3200 },
          storage: { total: 4000, type: 'NVMe', raid: 'RAID 10' },
          network: {
            interfaces: [
              {
                name: 'eth0',
                mac: '00:15:5d:01:ca:06',
                ip: '192.168.1.11',
                netmask: '255.255.255.0',
                gateway: '192.168.1.1',
                type: 'ethernet',
                speed: 10000,
              },
            ],
            bandwidth: 10000,
          },
        },
        resources: {
          cpu: { usage: 30, load: [1.5, 1.8, 2.1], temperature: 48 },
          memory: { used: 72, available: 56, swap: 0 },
          storage: { used: 2200, available: 1800, iops: 48000, latency: 0.12 },
          network: { rx: 1200000, tx: 600000, connections: 180 },
        },
        location: {
          datacenter: 'DC-01',
          rack: 'R01',
          position: 'U43',
          country: 'US',
          city: 'New York',
          timezone: 'America/New_York',
        },
        tags: ['compute', 'secondary', 'production'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      },
    ];

    defaultNodes.forEach(node => this.nodes.set(node.id, node));
  }

  private startMonitoring() {
    // Start monitoring all nodes
    setInterval(() => {
      this.updateNodeResources();
    }, 30000); // Every 30 seconds

    // Start cluster health checks
    setInterval(() => {
      this.checkClusterHealth();
    }, 60000); // Every minute

    // Start load balancer monitoring
    setInterval(() => {
      this.updateLoadBalancerStats();
    }, 10000); // Every 10 seconds
  }

  // Node Management
  addNode(
    nodeData: Omit<ServerNode, 'id' | 'createdAt' | 'updatedAt'>
  ): ServerNode {
    const node: ServerNode = {
      ...nodeData,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.nodes.set(node.id, node);
    logger.info('Server node added', {
      nodeId: node.id,
      name: node.name,
      type: node.type,
    });
    return node;
  }

  getNode(nodeId: string): ServerNode | null {
    return this.nodes.get(nodeId) || null;
  }

  getNodes(filters?: {
    type?: string;
    status?: string;
    location?: string;
  }): ServerNode[] {
    let nodes = Array.from(this.nodes.values());

    if (filters) {
      if (filters.type) {
        nodes = nodes.filter(node => node.type === filters.type);
      }
      if (filters.status) {
        nodes = nodes.filter(node => node.status === filters.status);
      }
      if (filters.location) {
        nodes = nodes.filter(
          node => node.location.datacenter === filters.location
        );
      }
    }

    return nodes;
  }

  updateNode(nodeId: string, updates: Partial<ServerNode>): ServerNode | null {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    const updatedNode = { ...node, ...updates, updatedAt: new Date() };
    this.nodes.set(nodeId, updatedNode);

    logger.info('Server node updated', { nodeId, updates });
    return updatedNode;
  }

  removeNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Check if node is in any clusters
    const nodeInClusters = Array.from(this.clusters.values()).some(cluster =>
      cluster.nodes.includes(nodeId)
    );

    if (nodeInClusters) {
      throw new Error(
        `Cannot remove node ${nodeId} - it is part of active clusters`
      );
    }

    this.nodes.delete(nodeId);
    logger.info('Server node removed', { nodeId, name: node.name });
    return true;
  }

  // Cluster Management
  createCluster(
    name: string,
    type: 'high-availability' | 'load-balancing' | 'auto-scaling',
    nodeIds: string[],
    config: ClusterConfig
  ): Cluster {
    // Validate nodes exist and are online
    const nodes = nodeIds
      .map(id => this.nodes.get(id))
      .filter((node): node is ServerNode => node !== undefined);
    if (nodes.length !== nodeIds.length) {
      throw new Error('Some specified nodes do not exist');
    }

    const offlineNodes = nodes.filter(node => node.status !== 'online');
    if (offlineNodes.length > 0) {
      throw new Error(
        `Cannot create cluster with offline nodes: ${offlineNodes.map(n => n.name).join(', ')}`
      );
    }

    const cluster: Cluster = {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      nodes: nodeIds,
      status: 'active',
      config,
      health: {
        status: 'healthy',
        nodes: {},
        lastCheck: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Initialize health check for each node
    nodeIds.forEach(nodeId => {
      cluster.health.nodes[nodeId] = {
        status: 'online',
        lastCheck: new Date(),
        responseTime: 0,
      };
    });

    this.clusters.set(cluster.id, cluster);
    logger.info('Cluster created', {
      clusterId: cluster.id,
      name,
      type,
      nodeCount: nodeIds.length,
    });
    return cluster;
  }

  getCluster(clusterId: string): Cluster | null {
    return this.clusters.get(clusterId) || null;
  }

  getClusters(filters?: { type?: string; status?: string }): Cluster[] {
    let clusters = Array.from(this.clusters.values());

    if (filters) {
      if (filters.type) {
        clusters = clusters.filter(cluster => cluster.type === filters.type);
      }
      if (filters.status) {
        clusters = clusters.filter(
          cluster => cluster.status === filters.status
        );
      }
    }

    return clusters;
  }

  updateCluster(clusterId: string, updates: Partial<Cluster>): Cluster | null {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return null;

    const updatedCluster = { ...cluster, ...updates, updatedAt: new Date() };
    this.clusters.set(clusterId, updatedCluster);

    logger.info('Cluster updated', { clusterId, updates });
    return updatedCluster;
  }

  // Load Balancer Management
  createLoadBalancer(
    name: string,
    clusterId: string,
    frontend: LoadBalancerFrontend,
    backends: Omit<LoadBalancerBackend, 'id'>[]
  ): LoadBalancer {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      throw new Error(`Cluster ${clusterId} not found`);
    }

    const loadBalancer: LoadBalancer = {
      id: `lb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      clusterId,
      frontend,
      backends: backends.map((backend, index) => ({
        ...backend,
        id: `backend_${index}`,
      })),
      rules: [],
      status: 'active',
      stats: {
        requests: 0,
        responses: 0,
        errors: 0,
        activeConnections: 0,
        bytesIn: 0,
        bytesOut: 0,
        lastUpdate: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.loadBalancers.set(loadBalancer.id, loadBalancer);
    logger.info('Load balancer created', {
      lbId: loadBalancer.id,
      name,
      clusterId,
    });
    return loadBalancer;
  }

  getLoadBalancer(lbId: string): LoadBalancer | null {
    return this.loadBalancers.get(lbId) || null;
  }

  getLoadBalancers(clusterId?: string): LoadBalancer[] {
    let loadBalancers = Array.from(this.loadBalancers.values());

    if (clusterId) {
      loadBalancers = loadBalancers.filter(lb => lb.clusterId === clusterId);
    }

    return loadBalancers;
  }

  addBackendToLoadBalancer(
    lbId: string,
    backend: Omit<LoadBalancerBackend, 'id'>
  ): LoadBalancer | null {
    const loadBalancer = this.loadBalancers.get(lbId);
    if (!loadBalancer) return null;

    const newBackend: LoadBalancerBackend = {
      ...backend,
      id: `backend_${loadBalancer.backends.length}`,
    };

    loadBalancer.backends.push(newBackend);
    loadBalancer.updatedAt = new Date();

    this.loadBalancers.set(lbId, loadBalancer);
    logger.info('Backend added to load balancer', {
      lbId,
      backendId: newBackend.id,
    });
    return loadBalancer;
  }

  // Auto Scaling
  enableAutoScaling(clusterId: string, config: AutoScalingConfig): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;

    cluster.config.autoScaling = config;
    cluster.updatedAt = new Date();

    this.clusters.set(clusterId, cluster);
    logger.info('Auto scaling enabled', { clusterId, config });
    return true;
  }

  // Monitoring and Health Checks
  private updateNodeResources() {
    this.nodes.forEach((node, nodeId) => {
      // Simulate resource updates (in real implementation, this would query the actual server)
      const cpuUsage = Math.random() * 100;
      const memoryUsage = Math.random() * node.specs.memory.total;
      const storageUsage = Math.random() * node.specs.storage.total;

      node.resources = {
        cpu: {
          usage: cpuUsage,
          load: [Math.random() * 5, Math.random() * 5, Math.random() * 5],
          temperature: 40 + Math.random() * 20,
        },
        memory: {
          used: memoryUsage,
          available: node.specs.memory.total - memoryUsage,
          swap: 0,
        },
        storage: {
          used: storageUsage,
          available: node.specs.storage.total - storageUsage,
          iops: 40000 + Math.random() * 20000,
          latency: 0.05 + Math.random() * 0.1,
        },
        network: {
          rx: Math.random() * 2000000,
          tx: Math.random() * 1000000,
          connections: Math.floor(Math.random() * 300),
        },
      };

      node.updatedAt = new Date();
      this.nodes.set(nodeId, node);
    });
  }

  private checkClusterHealth() {
    this.clusters.forEach((cluster, clusterId) => {
      let healthyNodes = 0;
      const totalNodes = cluster.nodes.length;

      cluster.nodes.forEach(nodeId => {
        const node = this.nodes.get(nodeId);
        if (node && node.status === 'online') {
          cluster.health.nodes[nodeId] = {
            status: 'online',
            lastCheck: new Date(),
            responseTime: Math.random() * 100,
          };
          healthyNodes++;
        } else {
          cluster.health.nodes[nodeId] = {
            status: 'offline',
            lastCheck: new Date(),
            responseTime: -1,
          };
        }
      });

      // Update cluster status based on health
      const healthRatio = healthyNodes / totalNodes;
      if (healthRatio >= 0.8) {
        cluster.health.status = 'healthy';
        cluster.status = 'active';
      } else if (healthRatio >= 0.5) {
        cluster.health.status = 'warning';
        cluster.status = 'degraded';
      } else {
        cluster.health.status = 'critical';
        cluster.status = 'offline';
      }

      cluster.health.lastCheck = new Date();
      cluster.updatedAt = new Date();

      this.clusters.set(clusterId, cluster);
    });
  }

  private updateLoadBalancerStats() {
    this.loadBalancers.forEach((lb, lbId) => {
      // Simulate load balancer statistics
      lb.stats = {
        requests: lb.stats.requests + Math.floor(Math.random() * 100),
        responses: lb.stats.responses + Math.floor(Math.random() * 95),
        errors: lb.stats.errors + Math.floor(Math.random() * 5),
        activeConnections: Math.floor(Math.random() * 1000),
        bytesIn: lb.stats.bytesIn + Math.floor(Math.random() * 1000000),
        bytesOut: lb.stats.bytesOut + Math.floor(Math.random() * 500000),
        lastUpdate: new Date(),
      };

      lb.updatedAt = new Date();
      this.loadBalancers.set(lbId, lb);
    });
  }

  // Analytics and Reporting
  getSystemAnalytics() {
    const nodes = Array.from(this.nodes.values());
    const clusters = Array.from(this.clusters.values());
    const loadBalancers = Array.from(this.loadBalancers.values());

    return {
      nodes: {
        total: nodes.length,
        online: nodes.filter(n => n.status === 'online').length,
        offline: nodes.filter(n => n.status === 'offline').length,
        maintenance: nodes.filter(n => n.status === 'maintenance').length,
        byType: {
          compute: nodes.filter(n => n.type === 'compute').length,
          storage: nodes.filter(n => n.type === 'storage').length,
          network: nodes.filter(n => n.type === 'network').length,
          management: nodes.filter(n => n.type === 'management').length,
        },
      },
      clusters: {
        total: clusters.length,
        active: clusters.filter(c => c.status === 'active').length,
        degraded: clusters.filter(c => c.status === 'degraded').length,
        offline: clusters.filter(c => c.status === 'offline').length,
        byType: {
          'high-availability': clusters.filter(
            c => c.type === 'high-availability'
          ).length,
          'load-balancing': clusters.filter(c => c.type === 'load-balancing')
            .length,
          'auto-scaling': clusters.filter(c => c.type === 'auto-scaling')
            .length,
        },
      },
      loadBalancers: {
        total: loadBalancers.length,
        active: loadBalancers.filter(lb => lb.status === 'active').length,
        totalRequests: loadBalancers.reduce(
          (sum, lb) => sum + lb.stats.requests,
          0
        ),
        totalErrors: loadBalancers.reduce(
          (sum, lb) => sum + lb.stats.errors,
          0
        ),
      },
    };
  }
}

// Singleton instance
export const serverManagement = ServerManagementSystem.getInstance();
