'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import useSWR from 'swr';

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
  vpsId?: string;
}

interface VPSMetrics {
  cpu?: {
    usage: number;
    cores: number;
    frequency: number;
  };
  memory?: {
    usage: number;
    used: number;
    total: number;
  };
  storage?: {
    usage: number;
    used: number;
    total: number;
  };
  network?: {
    bandwidth: number;
    upload: number;
    download: number;
  };
  uptime?: {
    percentage: number;
  };
  performance?: {
    avgResponseTime: number;
    throughput: number;
  };
  status?: {
    overall: string;
    services: string;
    security: string;
    backup: string;
  };
}

interface SystemAlert {
  type: 'warning' | 'critical';
  message: string;
  icon: React.ComponentType<{ className?: string }>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MonitoringPanel({ vpsId }: MonitoringPanelProps) {
  const { data: metrics, error, isLoading } = useSWR(
    vpsId ? `/api/vps/${vpsId}/metrics` : null, 
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p>Failed to load metrics</p>
          <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-600">
          <Activity className="h-8 w-8 mx-auto mb-4" />
          <p>No metrics available</p>
          <p className="text-sm text-gray-500 mt-2">Select a VPS to view its metrics</p>
        </div>
      </div>
    );
  }

  const alerts: SystemAlert[] = [];
  
  // Generate alerts based on real metrics
  if (metrics.cpu?.usage > 80) {
    alerts.push({
      type: 'warning',
      message: `High CPU usage: ${metrics.cpu.usage}%`,
      icon: Cpu
    });
  }
  
  if (metrics.memory?.usage > 85) {
    alerts.push({
      type: 'critical',
      message: `Critical memory usage: ${metrics.memory.usage}%`,
      icon: MemoryStick
    });
  }
  
  if (metrics.storage?.usage > 90) {
    alerts.push({
      type: 'critical',
      message: `Critical storage usage: ${metrics.storage.usage}%`,
      icon: HardDrive
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-gray-600">Real-time performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Live Data
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => {
            const IconComponent = alert.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.type === 'critical' 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="font-medium">{alert.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu?.usage || 0}%</div>
            <Progress value={metrics.cpu?.usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.cpu?.cores || 0} cores, {metrics.cpu?.frequency || 0}GHz
            </p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory?.usage || 0}%</div>
            <Progress value={metrics.memory?.usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.memory?.used || 0}GB / {metrics.memory?.total || 0}GB
            </p>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.storage?.usage || 0}%</div>
            <Progress value={metrics.storage?.usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.storage?.used || 0}GB / {metrics.storage?.total || 0}GB
            </p>
          </CardContent>
        </Card>

        {/* Network Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.network?.bandwidth || 0}Mbps</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                {metrics.network?.upload || 0} Mbps ↑
              </span>
              <TrendingDown className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">
                {metrics.network?.download || 0} Mbps ↓
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <CardDescription>Historical performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.uptime?.percentage || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.performance?.avgResponseTime || 0}ms
              </div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.performance?.throughput || 0}
              </div>
              <p className="text-sm text-muted-foreground">Requests/sec</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${metrics.status?.overall === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Overall Status</span>
              <Badge variant={metrics.status?.overall === 'healthy' ? 'default' : 'destructive'}>
                {metrics.status?.overall || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${metrics.status?.services === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Services</span>
              <Badge variant={metrics.status?.services === 'running' ? 'default' : 'destructive'}>
                {metrics.status?.services || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${metrics.status?.security === 'secure' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>Security</span>
              <Badge variant={metrics.status?.security === 'secure' ? 'default' : 'destructive'}>
                {metrics.status?.security || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${metrics.status?.backup === 'current' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Backup Status</span>
              <Badge variant={metrics.status?.backup === 'current' ? 'default' : 'destructive'}>
                {metrics.status?.backup || 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
