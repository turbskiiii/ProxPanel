'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Key,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Shield,
  Database,
  Network,
  HardDrive,
  Cpu,
  MemoryStick,
  Gauge,
  Activity,
  Zap,
  Rocket,
  Target,
  Clock,
  Copy,
  Terminal,
  FileText,
  FileCheck,
  Users,
  Trash2,
  Star,
  Award,
  Crown,
  Sparkles,
  Brain,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Wifi,
  Globe,
  Server,
  Cloud,
  FileText as FileTextIcon,
  FileCheck as FileCheckIcon,
  Users as UsersIcon,
  Trash2 as Trash2Icon,
  Copy as CopyIcon,
  Terminal as TerminalIcon,
  Power,
  PowerOff,
  Monitor,
  BarChart3,
  TrendingUp,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VPS {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'suspended' | 'creating' | 'deleting';
  node: string;
  vmid: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  ip: string;
  os: string;
  plan: string;
  uptime: number;
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  security: {
    score: number;
    threats: number;
    lastScan: string;
  };
  monitoring: {
    enabled: boolean;
    alerts: number;
    metrics: boolean;
  };
}

interface VPSActionsProps {
  vps: VPS;
  onAction: (action: string, vpsId: string) => void;
}

export default function VPSActions({ vps, onAction }: VPSActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await onAction(action, vps.id);
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'suspended':
        return 'bg-yellow-500';
      case 'creating':
        return 'bg-blue-500';
      case 'deleting':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className='h-4 w-4' />;
      case 'stopped':
        return <Square className='h-4 w-4' />;
      case 'suspended':
        return <Pause className='h-4 w-4' />;
      case 'creating':
        return <RefreshCw className='h-4 w-4 animate-spin' />;
      case 'deleting':
        return <XCircle className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* VPS Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Server className='h-5 w-5' />
              <span>{vps.name}</span>
              <Badge variant='outline' className='ml-2'>
                {vps.plan}
              </Badge>
            </div>
            <div className='flex items-center space-x-2'>
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(vps.status)}`}
              ></div>
              <span className='text-sm font-medium capitalize'>
                {vps.status}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Node: {vps.node} • VM ID: {vps.vmid} • IP: {vps.ip}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{vps.uptime}%</div>
              <p className='text-sm text-muted-foreground'>Uptime</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{vps.security.score}</div>
              <p className='text-sm text-muted-foreground'>Security Score</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{vps.monitoring.alerts}</div>
              <p className='text-sm text-muted-foreground'>Active Alerts</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{vps.performance.cpu}%</div>
              <p className='text-sm text-muted-foreground'>CPU Usage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Actions */}
      <Tabs defaultValue='basic' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='basic'>Basic</TabsTrigger>
          <TabsTrigger value='advanced'>Advanced</TabsTrigger>
          <TabsTrigger value='monitoring'>Monitoring</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
        </TabsList>

        <TabsContent value='basic' className='space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button
              onClick={() => handleAction('start')}
              disabled={vps.status === 'running' || loading !== null}
              className='h-20 flex flex-col items-center justify-center space-y-2'
            >
              {loading === 'start' ? (
                <RefreshCw className='h-6 w-6 animate-spin' />
              ) : (
                <Play className='h-6 w-6' />
              )}
              <span className='text-sm'>Start</span>
            </Button>

            <Button
              onClick={() => handleAction('stop')}
              disabled={vps.status === 'stopped' || loading !== null}
              variant='outline'
              className='h-20 flex flex-col items-center justify-center space-y-2'
            >
              {loading === 'stop' ? (
                <RefreshCw className='h-6 w-6 animate-spin' />
              ) : (
                <Square className='h-6 w-6' />
              )}
              <span className='text-sm'>Stop</span>
            </Button>

            <Button
              onClick={() => handleAction('restart')}
              disabled={vps.status === 'stopped' || loading !== null}
              variant='outline'
              className='h-20 flex flex-col items-center justify-center space-y-2'
            >
              {loading === 'restart' ? (
                <RefreshCw className='h-6 w-6 animate-spin' />
              ) : (
                <RotateCcw className='h-6 w-6' />
              )}
              <span className='text-sm'>Restart</span>
            </Button>

            <Button
              onClick={() => handleAction('suspend')}
              disabled={vps.status === 'suspended' || loading !== null}
              variant='outline'
              className='h-20 flex flex-col items-center justify-center space-y-2'
            >
              {loading === 'suspend' ? (
                <RefreshCw className='h-6 w-6 animate-spin' />
              ) : (
                <Pause className='h-6 w-6' />
              )}
              <span className='text-sm'>Suspend</span>
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Settings className='h-5 w-5 mr-2' />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={() => handleAction('console')}
                >
                  <Monitor className='h-4 w-4 mr-2' />
                  Open Console
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={() => handleAction('backup')}
                >
                  <Database className='h-4 w-4 mr-2' />
                  Create Backup
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={() => handleAction('snapshot')}
                >
                  <HardDrive className='h-4 w-4 mr-2' />
                  Take Snapshot
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={() => handleAction('resize')}
                >
                  <Zap className='h-4 w-4 mr-2' />
                  Resize VPS
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Activity className='h-5 w-5 mr-2' />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>CPU</span>
                    <span>{vps.performance.cpu}%</span>
                  </div>
                  <Progress value={vps.performance.cpu} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Memory</span>
                    <span>{vps.performance.memory}%</span>
                  </div>
                  <Progress value={vps.performance.memory} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Disk</span>
                    <span>{vps.performance.disk}%</span>
                  </div>
                  <Progress value={vps.performance.disk} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Network</span>
                    <span>{vps.performance.network}%</span>
                  </div>
                  <Progress value={vps.performance.network} className='h-2' />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='advanced' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Rocket className='h-5 w-5 mr-2' />
                  Advanced Operations
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('migrate')}
                >
                  <Globe className='h-4 w-4 mr-2' />
                  Migrate to Another Node
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('clone')}
                >
                  <Copy className='h-4 w-4 mr-2' />
                  Clone VPS
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('template')}
                >
                  <Star className='h-4 w-4 mr-2' />
                  Create Template
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('reinstall')}
                >
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reinstall OS
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('rescue')}
                >
                  <Shield className='h-4 w-4 mr-2' />
                  Rescue Mode
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete VPS
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Zap className='h-5 w-5 mr-2' />
                  Automation & Scripts
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('run-script')}
                >
                  <Terminal className='h-4 w-4 mr-2' />
                  Run Custom Script
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('schedule-task')}
                >
                  <Clock className='h-4 w-4 mr-2' />
                  Schedule Task
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('auto-scaling')}
                >
                  <TrendingUp className='h-4 w-4 mr-2' />
                  Configure Auto-scaling
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('load-balancer')}
                >
                  <Network className='h-4 w-4 mr-2' />
                  Load Balancer Setup
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('disaster-recovery')}
                >
                  <Shield className='h-4 w-4 mr-2' />
                  Disaster Recovery
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('performance-tuning')}
                >
                  <Gauge className='h-4 w-4 mr-2' />
                  Performance Tuning
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='monitoring' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Monitor className='h-5 w-5 mr-2' />
                  Monitoring Controls
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Enable Monitoring</span>
                  <Button
                    variant={vps.monitoring.enabled ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handleAction('toggle-monitoring')}
                  >
                    {vps.monitoring.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Real-time Metrics</span>
                  <Button
                    variant={vps.monitoring.metrics ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handleAction('toggle-metrics')}
                  >
                    {vps.monitoring.metrics ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className='space-y-2'>
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => handleAction('view-logs')}
                  >
                    <FileTextIcon className='h-4 w-4 mr-2' />
                    View System Logs
                  </Button>
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => handleAction('performance-report')}
                  >
                    <BarChart3 className='h-4 w-4 mr-2' />
                    Generate Performance Report
                  </Button>
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => handleAction('set-alerts')}
                  >
                    <AlertTriangle className='h-4 w-4 mr-2' />
                    Configure Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BarChart3 className='h-5 w-5 mr-2' />
                  Monitoring Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {vps.monitoring.alerts}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Active Alerts
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>24/7</div>
                      <p className='text-sm text-muted-foreground'>
                        Monitoring
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Response Time</span>
                      <span>12ms</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Availability</span>
                      <span>99.99%</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Last Check</span>
                      <span>2 seconds ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Shield className='h-5 w-5 mr-2' />
                  Security Controls
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('security-scan')}
                >
                  <Shield className='h-4 w-4 mr-2' />
                  Run Security Scan
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('firewall-config')}
                >
                  <Lock className='h-4 w-4 mr-2' />
                  Configure Firewall
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('ssl-certificate')}
                >
                  <Key className='h-4 w-4 mr-2' />
                  SSL Certificate
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('backup-encryption')}
                >
                  <Database className='h-4 w-4 mr-2' />
                  Backup Encryption
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('access-control')}
                >
                  <UsersIcon className='h-4 w-4 mr-2' />
                  Access Control
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleAction('security-audit')}
                >
                  <FileCheckIcon className='h-4 w-4 mr-2' />
                  Security Audit
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Target className='h-5 w-5 mr-2' />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Security Score</span>
                      <span>{vps.security.score}/100</span>
                    </div>
                    <Progress value={vps.security.score} className='h-2' />
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Active Threats</span>
                      <span className='text-red-600'>
                        {vps.security.threats}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Last Scan</span>
                      <span>{vps.security.lastScan}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Firewall Status</span>
                      <span className='text-green-600'>Active</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>SSL Status</span>
                      <span className='text-green-600'>Valid</span>
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
