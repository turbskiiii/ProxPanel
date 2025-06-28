'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Zap,
  Globe,
} from 'lucide-react';

interface VPSDetails {
  monitoring: {
    alerts: number;
    lastCheck: string;
    responseTime: number;
    availability: number;
    checks: { http: boolean; ping: boolean; ssh: boolean };
  };
  performance: {
    cpuBenchmark: number;
    diskBenchmark: number;
    networkLatency: number;
    loadAverage: number[];
  };
}

interface MonitoringPanelProps {
  vps: VPSDetails;
}

export function MonitoringPanel({ vps }: MonitoringPanelProps) {
  const [timeRange, setTimeRange] = useState('24h');

  // Mock historical data
  const mockMetrics = {
    cpu: [45, 52, 38, 61, 45, 39, 48, 55, 42, 47, 51, 45],
    memory: [40, 42, 38, 45, 43, 41, 44, 46, 39, 42, 45, 40],
    disk: [45, 45, 46, 45, 47, 46, 45, 48, 46, 45, 47, 45],
    network: [125, 134, 118, 142, 128, 135, 131, 139, 126, 133, 137, 125],
  };

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'High CPU usage detected',
      time: '2 hours ago',
      resolved: false,
    },
    {
      id: 2,
      type: 'info',
      message: 'Backup completed successfully',
      time: '6 hours ago',
      resolved: true,
    },
    {
      id: 3,
      type: 'error',
      message: 'Network latency spike',
      time: '1 day ago',
      resolved: true,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Monitoring Overview */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Availability</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {vps.monitoring.availability}%
            </div>
            <p className='text-xs text-muted-foreground'>Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Response Time</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {vps.monitoring.responseTime}ms
            </div>
            <p className='text-xs text-muted-foreground'>Average response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Network Latency
            </CardTitle>
            <Globe className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {vps.performance.networkLatency}ms
            </div>
            <p className='text-xs text-muted-foreground'>
              To nearest datacenter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Alerts</CardTitle>
            <AlertCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{vps.monitoring.alerts}</div>
            <p className='text-xs text-muted-foreground'>Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5' />
            Service Status
          </CardTitle>
          <CardDescription>
            Current status of monitored services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='flex items-center justify-between p-3 border rounded-lg'>
              <div className='flex items-center gap-2'>
                <Globe className='h-4 w-4' />
                <span>HTTP Service</span>
              </div>
              <Badge
                variant={vps.monitoring.checks.http ? 'default' : 'destructive'}
              >
                {vps.monitoring.checks.http ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 border rounded-lg'>
              <div className='flex items-center gap-2'>
                <Network className='h-4 w-4' />
                <span>Ping Response</span>
              </div>
              <Badge
                variant={vps.monitoring.checks.ping ? 'default' : 'destructive'}
              >
                {vps.monitoring.checks.ping ? 'Responding' : 'No Response'}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 border rounded-lg'>
              <div className='flex items-center gap-2'>
                <Zap className='h-4 w-4' />
                <span>SSH Access</span>
              </div>
              <Badge
                variant={vps.monitoring.checks.ssh ? 'default' : 'destructive'}
              >
                {vps.monitoring.checks.ssh ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Tabs value={timeRange} onValueChange={setTimeRange} className='w-full'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Performance Metrics</h3>
          <TabsList className='grid w-auto grid-cols-4'>
            <TabsTrigger value='1h'>1H</TabsTrigger>
            <TabsTrigger value='24h'>24H</TabsTrigger>
            <TabsTrigger value='7d'>7D</TabsTrigger>
            <TabsTrigger value='30d'>30D</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={timeRange} className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Cpu className='h-4 w-4' />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Current</span>
                    <span className='font-medium'>45%</span>
                  </div>
                  <Progress value={45} className='h-2' />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>Avg: 47%</span>
                    <span>Peak: 61%</span>
                  </div>
                </div>
                <div className='mt-4 h-20 bg-muted rounded flex items-end justify-between px-1'>
                  {mockMetrics.cpu.map((value, index) => (
                    <div
                      key={index}
                      className='bg-blue-500 w-2 rounded-t'
                      style={{ height: `${(value / 100) * 80}px` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <MemoryStick className='h-4 w-4' />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Current</span>
                    <span className='font-medium'>40%</span>
                  </div>
                  <Progress value={40} className='h-2' />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>Avg: 42%</span>
                    <span>Peak: 46%</span>
                  </div>
                </div>
                <div className='mt-4 h-20 bg-muted rounded flex items-end justify-between px-1'>
                  {mockMetrics.memory.map((value, index) => (
                    <div
                      key={index}
                      className='bg-green-500 w-2 rounded-t'
                      style={{ height: `${(value / 100) * 80}px` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <HardDrive className='h-4 w-4' />
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Current</span>
                    <span className='font-medium'>45%</span>
                  </div>
                  <Progress value={45} className='h-2' />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>IOPS: 15,000</span>
                    <span>R/W: 3.2/2.8 GB/s</span>
                  </div>
                </div>
                <div className='mt-4 h-20 bg-muted rounded flex items-end justify-between px-1'>
                  {mockMetrics.disk.map((value, index) => (
                    <div
                      key={index}
                      className='bg-purple-500 w-2 rounded-t'
                      style={{ height: `${(value / 100) * 80}px` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Network className='h-4 w-4' />
                  Network Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Current</span>
                    <span className='font-medium'>214.7 Mbps</span>
                  </div>
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>In: 125.5 Mbps</span>
                    <span>Out: 89.2 Mbps</span>
                  </div>
                </div>
                <div className='mt-4 h-20 bg-muted rounded flex items-end justify-between px-1'>
                  {mockMetrics.network.map((value, index) => (
                    <div
                      key={index}
                      className='bg-orange-500 w-2 rounded-t'
                      style={{ height: `${(value / 200) * 80}px` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alerts & Events */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            Recent Alerts & Events
          </CardTitle>
          <CardDescription>
            Latest monitoring alerts and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {alerts.map(alert => (
              <div
                key={alert.id}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  {alert.type === 'error' ? (
                    <AlertCircle className='h-4 w-4 text-red-500' />
                  ) : alert.type === 'warning' ? (
                    <AlertCircle className='h-4 w-4 text-yellow-500' />
                  ) : (
                    <CheckCircle className='h-4 w-4 text-blue-500' />
                  )}
                  <div>
                    <p className='font-medium'>{alert.message}</p>
                    <p className='text-sm text-muted-foreground'>
                      {alert.time}
                    </p>
                  </div>
                </div>
                <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
                  {alert.resolved ? 'Resolved' : 'Active'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
