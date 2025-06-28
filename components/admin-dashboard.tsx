'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Server,
  Users,
  CreditCard,
  Activity,
  Shield,
  Database,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  DollarSign,
  Zap,
  Cloud,
  HardDrive,
  Network,
  Lock,
  RefreshCw,
  Play,
  Pause,
  Stop,
  Gauge,
  Thermometer,
  Wifi,
  ShieldCheck,
  AlertCircle,
  Star,
  Award,
  Rocket,
  Crown,
  Cpu,
  MemoryStick,
} from 'lucide-react';

interface SystemStats {
  vps: {
    total: number;
    running: number;
    stopped: number;
    suspended: number;
    creating: number;
    deleting: number;
  };
  users: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
    newThisMonth: number;
    churnRate: number;
  };
  billing: {
    revenue: number;
    revenueGrowth: number;
    invoices: number;
    overdue: number;
    subscriptions: number;
    mrr: number;
    arr: number;
  };
  security: {
    threats: number;
    blocked: number;
    alerts: number;
    incidents: number;
    securityScore: number;
    lastScan: string;
  };
  infrastructure: {
    nodes: number;
    clusters: number;
    loadBalancers: number;
    storage: number;
    uptime: number;
    performance: number;
  };
  performance: {
    avgCpu: number;
    avgMemory: number;
    avgDisk: number;
    avgNetwork: number;
    responseTime: number;
    throughput: number;
  };
  business: {
    customerSatisfaction: number;
    supportTickets: number;
    slaCompliance: number;
    featureAdoption: number;
  };
}

interface RealTimeMetric {
  timestamp: Date;
  value: number;
  label: string;
}

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  category: 'security' | 'performance' | 'billing' | 'infrastructure';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    vps: {
      total: 0,
      running: 0,
      stopped: 0,
      suspended: 0,
      creating: 0,
      deleting: 0,
    },
    users: {
      total: 0,
      active: 0,
      suspended: 0,
      pending: 0,
      newThisMonth: 0,
      churnRate: 0,
    },
    billing: {
      revenue: 0,
      revenueGrowth: 0,
      invoices: 0,
      overdue: 0,
      subscriptions: 0,
      mrr: 0,
      arr: 0,
    },
    security: {
      threats: 0,
      blocked: 0,
      alerts: 0,
      incidents: 0,
      securityScore: 0,
      lastScan: '',
    },
    infrastructure: {
      nodes: 0,
      clusters: 0,
      loadBalancers: 0,
      storage: 0,
      uptime: 0,
      performance: 0,
    },
    performance: {
      avgCpu: 0,
      avgMemory: 0,
      avgDisk: 0,
      avgNetwork: 0,
      responseTime: 0,
      throughput: 0,
    },
    business: {
      customerSatisfaction: 0,
      supportTickets: 0,
      slaCompliance: 0,
      featureAdoption: 0,
    },
  });
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealTimeMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simulate API calls with realistic enterprise data
      await new Promise(resolve => setTimeout(resolve, 800));

      setStats({
        vps: {
          total: 1247,
          running: 1189,
          stopped: 45,
          suspended: 13,
          creating: 8,
          deleting: 2,
        },
        users: {
          total: 892,
          active: 856,
          suspended: 23,
          pending: 13,
          newThisMonth: 47,
          churnRate: 1.8,
        },
        billing: {
          revenue: 125847.5,
          revenueGrowth: 12.5,
          invoices: 156,
          overdue: 8,
          subscriptions: 892,
          mrr: 125847.5,
          arr: 1510170.0,
        },
        security: {
          threats: 23,
          blocked: 1567,
          alerts: 5,
          incidents: 1,
          securityScore: 98.5,
          lastScan: '2024-01-20 15:30:00 UTC',
        },
        infrastructure: {
          nodes: 24,
          clusters: 3,
          loadBalancers: 8,
          storage: 45,
          uptime: 99.99,
          performance: 97.2,
        },
        performance: {
          avgCpu: 23.4,
          avgMemory: 45.2,
          avgDisk: 67.8,
          avgNetwork: 34.1,
          responseTime: 12.3,
          throughput: 2.4,
        },
        business: {
          customerSatisfaction: 4.8,
          supportTickets: 12,
          slaCompliance: 99.97,
          featureAdoption: 87.3,
        },
      });

      // Generate real-time metrics
      const now = new Date();
      const metrics: RealTimeMetric[] = [];
      for (let i = 0; i < 20; i++) {
        const time = new Date(now.getTime() - (20 - i) * 300000); // 5-minute intervals
        metrics.push({
          timestamp: time,
          value: Math.random() * 100,
          label: `Metric ${i + 1}`,
        });
      }
      setRealtimeMetrics(metrics);

      setAlerts([
        {
          id: '1',
          type: 'performance',
          title: 'High CPU Usage Detected',
          description: 'Node cluster-01 experiencing 95% CPU usage',
          severity: 'high',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          acknowledged: false,
          category: 'performance',
        },
        {
          id: '2',
          type: 'security',
          title: 'Suspicious Login Attempt',
          description: 'Multiple failed logins from IP 192.168.1.100',
          severity: 'medium',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          acknowledged: true,
          category: 'security',
        },
        {
          id: '3',
          type: 'billing',
          title: 'Payment Processing Issue',
          description: 'Stripe webhook failure for subscription #SUB-123',
          severity: 'low',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          acknowledged: false,
          category: 'billing',
        },
      ]);

      setLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className='h-4 w-4' />;
      case 'performance':
        return <Gauge className='h-4 w-4' />;
      case 'billing':
        return <CreditCard className='h-4 w-4' />;
      case 'infrastructure':
        return <Server className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with KPIs */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Crown className='h-8 w-8 text-yellow-500' />
            Enterprise Dashboard
          </h1>
          <p className='text-muted-foreground'>
            Real-time overview of your ProxPanel enterprise infrastructure
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.location.reload()}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size='sm'
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className='h-4 w-4 mr-2' />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${stats.billing.revenue.toLocaleString()}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='h-3 w-3 mr-1' />+
              {stats.billing.revenueGrowth}% this month
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active VPS</CardTitle>
            <Server className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.vps.running.toLocaleString()}
            </div>
            <div className='text-xs text-muted-foreground'>
              {stats.vps.total} total • {stats.vps.creating} creating
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Security Score
            </CardTitle>
            <ShieldCheck className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.security.securityScore}%
            </div>
            <Progress
              value={stats.security.securityScore}
              className='mt-2 h-2'
            />
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-orange-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Uptime</CardTitle>
            <Target className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.infrastructure.uptime}%
            </div>
            <div className='text-xs text-muted-foreground'>
              SLA compliance: {stats.business.slaCompliance}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-7'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='business'>Business</TabsTrigger>
          <TabsTrigger value='infrastructure'>Infrastructure</TabsTrigger>
          <TabsTrigger value='alerts'>Alerts</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Activity className='h-5 w-5 mr-2' />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Overall System</span>
                    <span className='font-medium'>
                      {stats.infrastructure.performance}%
                    </span>
                  </div>
                  <Progress
                    value={stats.infrastructure.performance}
                    className='h-2'
                  />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Network Performance</span>
                    <span className='font-medium'>
                      {stats.performance.avgNetwork}%
                    </span>
                  </div>
                  <Progress
                    value={stats.performance.avgNetwork}
                    className='h-2'
                  />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Storage Utilization</span>
                    <span className='font-medium'>
                      {stats.performance.avgDisk}%
                    </span>
                  </div>
                  <Progress value={stats.performance.avgDisk} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Security Status</span>
                    <span className='font-medium'>
                      {stats.security.securityScore}%
                    </span>
                  </div>
                  <Progress
                    value={stats.security.securityScore}
                    className='h-2'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Clock className='h-5 w-5 mr-2' />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-green-100 rounded-full'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        New VPS created: web-server-01
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-blue-100 rounded-full'>
                      <Users className='h-4 w-4 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        New user registered: john@company.com
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        5 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-yellow-100 rounded-full'>
                      <AlertTriangle className='h-4 w-4 text-yellow-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        High CPU usage detected on node-01
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        10 minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Cpu className='h-5 w-5 mr-2' />
                  CPU Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {stats.performance.avgCpu}%
                </div>
                <p className='text-sm text-muted-foreground'>
                  Average across all VPS
                </p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Peak Usage</span>
                    <span>87%</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Idle Time</span>
                    <span>76.6%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <MemoryStick className='h-5 w-5 mr-2' />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {stats.performance.avgMemory}%
                </div>
                <p className='text-sm text-muted-foreground'>
                  Average utilization
                </p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Available</span>
                    <span>54.8%</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Swap Usage</span>
                    <span>2.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Network className='h-5 w-5 mr-2' />
                  Network Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {stats.performance.responseTime}ms
                </div>
                <p className='text-sm text-muted-foreground'>
                  Average response time
                </p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Throughput</span>
                    <span>{stats.performance.throughput} Gbps</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Packet Loss</span>
                    <span>0.01%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Shield className='h-5 w-5 mr-2' />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {stats.security.blocked}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Threats Blocked
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-red-600'>
                        {stats.security.threats}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Active Threats
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Firewall Rules</span>
                      <span>1,247</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>SSL Certificates</span>
                      <span>89</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>2FA Enabled Users</span>
                      <span>756</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Last Security Scan</span>
                      <span>{stats.security.lastScan}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Lock className='h-5 w-5 mr-2' />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Failed Login Attempts</span>
                      <span>23</span>
                    </div>
                    <Progress value={23} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>API Rate Limit Hits</span>
                      <span>5</span>
                    </div>
                    <Progress value={5} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Suspicious IPs Blocked</span>
                      <span>156</span>
                    </div>
                    <Progress value={156} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='business' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <DollarSign className='h-5 w-5 mr-2' />
                  Revenue Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  ${stats.billing.mrr.toLocaleString()}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Monthly Recurring Revenue
                </p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>ARR</span>
                    <span>${(stats.billing.arr / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Growth Rate</span>
                    <span className='text-green-600'>
                      +{stats.billing.revenueGrowth}%
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Churn Rate</span>
                    <span className='text-red-600'>
                      {stats.users.churnRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Users className='h-5 w-5 mr-2' />
                  Customer Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>{stats.users.total}</div>
                <p className='text-sm text-muted-foreground'>Total Customers</p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>New This Month</span>
                    <span className='text-green-600'>
                      +{stats.users.newThisMonth}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Satisfaction</span>
                    <span>{stats.business.customerSatisfaction}/5.0</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Support Tickets</span>
                    <span>{stats.business.supportTickets}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Target className='h-5 w-5 mr-2' />
                  SLA & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {stats.business.slaCompliance}%
                </div>
                <p className='text-sm text-muted-foreground'>SLA Compliance</p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Uptime SLA</span>
                    <span>99.99%</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Response Time</span>
                    <span>&lt; 15min</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Feature Adoption</span>
                    <span>{stats.business.featureAdoption}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='infrastructure' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Server className='h-5 w-5 mr-2' />
                  Infrastructure Nodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {stats.infrastructure.nodes}
                </div>
                <p className='text-sm text-muted-foreground'>Active nodes</p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Clusters</span>
                    <span>{stats.infrastructure.clusters}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Load Balancers</span>
                    <span>{stats.infrastructure.loadBalancers}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Storage (TB)</span>
                    <span>{stats.infrastructure.storage}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Network className='h-5 w-5 mr-2' />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Bandwidth Usage</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Latency</span>
                      <span>2.3ms</span>
                    </div>
                    <Progress value={85} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Uptime</span>
                      <span>{stats.infrastructure.uptime}%</span>
                    </div>
                    <Progress
                      value={stats.infrastructure.uptime}
                      className='h-2'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <HardDrive className='h-5 w-5 mr-2' />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>SSD Storage</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>HDD Storage</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Backup Storage</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='alerts' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <AlertTriangle className='h-5 w-5 mr-2' />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {alerts
                  .filter(alert => !alert.acknowledged)
                  .map(alert => (
                    <Alert
                      key={alert.id}
                      className={`border-l-4 border-l-${getSeverityColor(alert.severity).replace('bg-', '')}`}
                    >
                      <div className='flex items-start space-x-3'>
                        {getCategoryIcon(alert.category)}
                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <strong>{alert.title}</strong>
                            <Badge
                              variant={
                                alert.severity === 'critical'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {alert.description}
                          </p>
                          <p className='text-xs text-muted-foreground mt-1'>
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BarChart3 className='h-5 w-5 mr-2' />
                  Real-time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {realtimeMetrics.slice(-5).map((metric, index) => (
                    <div
                      key={index}
                      className='flex justify-between items-center'
                    >
                      <span className='text-sm'>{metric.label}</span>
                      <div className='flex items-center space-x-2'>
                        <div className='w-20 bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full'
                            style={{ width: `${metric.value}%` }}
                          ></div>
                        </div>
                        <span className='text-sm font-medium'>
                          {metric.value.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <TrendingUp className='h-5 w-5 mr-2' />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm'>Revenue Growth</span>
                    <span className='text-green-600 font-medium'>
                      +{stats.billing.revenueGrowth}%
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm'>User Growth</span>
                    <span className='text-green-600 font-medium'>
                      +{stats.users.newThisMonth}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm'>VPS Growth</span>
                    <span className='text-green-600 font-medium'>+12.3%</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm'>Performance</span>
                    <span className='text-green-600 font-medium'>
                      +{stats.infrastructure.performance}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
