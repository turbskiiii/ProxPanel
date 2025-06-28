'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Server,
  CreditCard,
  Shield,
  Database,
  Globe,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  Zap,
  Cloud,
  HardDrive,
  Network,
  Lock,
  RefreshCw,
  Play,
  Pause,
  Stop,
} from 'lucide-react';

interface SystemStats {
  vps: {
    total: number;
    running: number;
    stopped: number;
    suspended: number;
  };
  users: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
  };
  billing: {
    revenue: number;
    invoices: number;
    overdue: number;
    subscriptions: number;
  };
  security: {
    threats: number;
    blocked: number;
    alerts: number;
    incidents: number;
  };
  infrastructure: {
    nodes: number;
    clusters: number;
    loadBalancers: number;
    storage: number;
  };
  dns: {
    zones: number;
    records: number;
    providers: number;
  };
  cdn: {
    zones: number;
    bandwidth: number;
    requests: number;
  };
  backup: {
    jobs: number;
    snapshots: number;
    storage: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
  user?: string;
}

interface AlertItem {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

export default function EnterpriseDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    vps: { total: 0, running: 0, stopped: 0, suspended: 0 },
    users: { total: 0, active: 0, suspended: 0, pending: 0 },
    billing: { revenue: 0, invoices: 0, overdue: 0, subscriptions: 0 },
    security: { threats: 0, blocked: 0, alerts: 0, incidents: 0 },
    infrastructure: { nodes: 0, clusters: 0, loadBalancers: 0, storage: 0 },
    dns: { zones: 0, records: 0, providers: 0 },
    cdn: { zones: 0, bandwidth: 0, requests: 0 },
    backup: { jobs: 0, snapshots: 0, storage: 0 },
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        vps: { total: 1247, running: 1189, stopped: 45, suspended: 13 },
        users: { total: 892, active: 856, suspended: 23, pending: 13 },
        billing: {
          revenue: 125847.5,
          invoices: 156,
          overdue: 8,
          subscriptions: 892,
        },
        security: { threats: 23, blocked: 1567, alerts: 5, incidents: 1 },
        infrastructure: {
          nodes: 24,
          clusters: 3,
          loadBalancers: 8,
          storage: 45,
        },
        dns: { zones: 156, records: 892, providers: 3 },
        cdn: { zones: 89, bandwidth: 2.5, requests: 1560000 },
        backup: { jobs: 45, snapshots: 234, storage: 15.8 },
      });

      setRecentActivity([
        {
          id: '1',
          type: 'vps_created',
          description: 'New VPS instance created: web-server-01',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          severity: 'info',
          user: 'admin@company.com',
        },
        {
          id: '2',
          type: 'backup_completed',
          description: 'Backup job completed successfully: daily-backup-01',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          severity: 'success',
        },
        {
          id: '3',
          type: 'security_alert',
          description: 'Suspicious login attempt detected from unknown IP',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          severity: 'warning',
        },
        {
          id: '4',
          type: 'billing_invoice',
          description: 'Invoice #INV-2024-001 generated for $1,247.50',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          severity: 'info',
        },
      ]);

      setAlerts([
        {
          id: '1',
          type: 'high_cpu',
          title: 'High CPU Usage',
          description: 'Node cluster-01 is experiencing high CPU usage (95%)',
          severity: 'high',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          acknowledged: false,
        },
        {
          id: '2',
          type: 'backup_failed',
          title: 'Backup Job Failed',
          description: 'Scheduled backup job failed for VPS web-server-05',
          severity: 'medium',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          acknowledged: true,
        },
        {
          id: '3',
          type: 'security_threat',
          title: 'Security Threat Detected',
          description:
            'Multiple failed login attempts detected from IP 192.168.1.100',
          severity: 'critical',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          acknowledged: false,
        },
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vps_created':
        return <Server className='h-4 w-4' />;
      case 'backup_completed':
        return <Database className='h-4 w-4' />;
      case 'security_alert':
        return <Shield className='h-4 w-4' />;
      case 'billing_invoice':
        return <CreditCard className='h-4 w-4' />;
      default:
        return <Activity className='h-4 w-4' />;
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
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Enterprise Dashboard</h1>
          <p className='text-muted-foreground'>
            Comprehensive overview of your ProxPanel enterprise infrastructure
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button variant='outline' size='sm'>
            <Settings className='h-4 w-4 mr-2' />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total VPS</CardTitle>
            <Server className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.vps.total.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats.vps.running} running, {stats.vps.stopped} stopped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.users.active.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats.users.total} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Revenue
            </CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${stats.billing.revenue.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats.billing.subscriptions} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Security Threats
            </CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.security.threats}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.security.blocked} threats blocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='infrastructure'>Infrastructure</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='billing'>Billing</TabsTrigger>
          <TabsTrigger value='backup'>Backup & DR</TabsTrigger>
          <TabsTrigger value='dns'>DNS & CDN</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Activity className='h-5 w-5 mr-2' />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Overall System</span>
                    <span>98%</span>
                  </div>
                  <Progress value={98} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Network</span>
                    <span>99%</span>
                  </div>
                  <Progress value={99} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Storage</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Security</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className='h-2' />
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
                  {recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className='flex items-start space-x-3'
                    >
                      <div
                        className={`p-1 rounded ${getSeverityColor(activity.severity)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium'>
                          {activity.description}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {activity.timestamp.toLocaleString()}
                          {activity.user && ` • ${activity.user}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
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
                      <AlertTriangle className='h-4 w-4' />
                      <AlertDescription>
                        <div className='flex items-center justify-between'>
                          <div>
                            <strong>{alert.title}</strong>
                            <p className='text-sm text-muted-foreground'>
                              {alert.description}
                            </p>
                          </div>
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
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            </CardContent>
          </Card>
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
                      <span>99.99%</span>
                    </div>
                    <Progress value={99.99} className='h-2' />
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

        <TabsContent value='billing' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <CreditCard className='h-5 w-5 mr-2' />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  ${stats.billing.revenue.toLocaleString()}
                </div>
                <p className='text-sm text-muted-foreground'>This month</p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Active Subscriptions</span>
                    <span>{stats.billing.subscriptions}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Pending Invoices</span>
                    <span>{stats.billing.invoices}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Overdue Amount</span>
                    <span className='text-red-600'>
                      ${(stats.billing.overdue * 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <TrendingUp className='h-5 w-5 mr-2' />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Monthly Growth</span>
                      <span className='text-green-600'>+12.5%</span>
                    </div>
                    <Progress value={75} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Customer Retention</span>
                      <span>98.2%</span>
                    </div>
                    <Progress value={98.2} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Churn Rate</span>
                      <span className='text-red-600'>1.8%</span>
                    </div>
                    <Progress value={1.8} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BarChart3 className='h-5 w-5 mr-2' />
                  Plan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Enterprise</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Professional</span>
                      <span>35%</span>
                    </div>
                    <Progress value={35} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Basic</span>
                      <span>20%</span>
                    </div>
                    <Progress value={20} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='backup' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Database className='h-5 w-5 mr-2' />
                  Backup Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>{stats.backup.jobs}</div>
                <p className='text-sm text-muted-foreground'>
                  Active backup jobs
                </p>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Total Snapshots</span>
                    <span>{stats.backup.snapshots}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Storage Used (TB)</span>
                    <span>{stats.backup.storage}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Success Rate</span>
                    <span className='text-green-600'>98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Zap className='h-5 w-5 mr-2' />
                  Disaster Recovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Recovery Plans</span>
                      <span>12</span>
                    </div>
                    <Progress value={80} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>RTO Compliance</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className='h-2' />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>RPO Compliance</span>
                      <span>99%</span>
                    </div>
                    <Progress value={99} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Cloud className='h-5 w-5 mr-2' />
                  Storage Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Local Storage</span>
                    <Badge variant='secondary'>Active</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>AWS S3</span>
                    <Badge variant='outline'>Configured</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Azure Blob</span>
                    <Badge variant='outline'>Available</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Google Cloud</span>
                    <Badge variant='outline'>Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='dns' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Globe className='h-5 w-5 mr-2' />
                  DNS Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='text-2xl font-bold'>{stats.dns.zones}</div>
                    <p className='text-sm text-muted-foreground'>
                      Active DNS zones
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Total Records</span>
                      <span>{stats.dns.records}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Providers</span>
                      <span>{stats.dns.providers}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Response Time</span>
                      <span>12ms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Zap className='h-5 w-5 mr-2' />
                  CDN Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='text-2xl font-bold'>{stats.cdn.zones}</div>
                    <p className='text-sm text-muted-foreground'>
                      Active CDN zones
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Bandwidth (TB)</span>
                      <span>{stats.cdn.bandwidth}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Requests</span>
                      <span>{stats.cdn.requests.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Cache Hit Rate</span>
                      <span>94.2%</span>
                    </div>
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
