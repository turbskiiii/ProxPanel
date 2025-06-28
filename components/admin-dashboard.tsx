'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Users, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Cpu,
  MemoryStick,
  HardDrive,
  Calendar,
  RefreshCw,
  Network,
  TrendingUp,
  Clock,
  DollarSign,
  Crown,
  Gauge,
  BarChart3
} from 'lucide-react';
import useSWR from 'swr';

interface AdminStats {
  vps: {
    total: number;
    running: number;
    stopped: number;
  };
  users: {
    total: number;
    active: number;
  };
  infrastructure: {
    nodes: number;
    uptime: number;
  };
  performance: {
    avgCpu: number;
    avgMemory: number;
    avgDisk: number;
  };
  security: {
    securityScore: number;
    threats: number;
    alerts: number;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR('/api/admin/stats', fetcher);
  const { data: users, error: usersError, isLoading: usersLoading } = useSWR('/api/admin/users', fetcher);

  if (statsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError || usersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p>Failed to load admin data</p>
          <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  if (!stats || !users) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-600">
          <Server className="h-8 w-8 mx-auto mb-4" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Resources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cpu?.usage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.cpu?.cores || 0} cores available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memory?.usage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.memory?.used || 0}GB / {stats.memory?.total || 0}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storage?.usage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.storage?.used || 0}TB / {stats.storage?.total || 0}TB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.network?.bandwidth || 0}Gbps</div>
            <p className="text-xs text-muted-foreground">
              {stats.network?.connections || 0} active connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VPS Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              VPS Overview
            </CardTitle>
            <CardDescription>Virtual server statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total VPS</span>
              <Badge variant="secondary">{stats.vps?.total || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Running</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {stats.vps?.running || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Stopped</span>
              <Badge variant="destructive">{stats.vps?.stopped || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Error</span>
              <Badge variant="destructive">{stats.vps?.error || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>User account statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Users</span>
              <Badge variant="secondary">{users.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Active Users</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {users.filter((user: any) => user.status === 'active').length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Admins</span>
              <Badge variant="outline" className="text-purple-600">
                {users.filter((user: any) => user.is_admin).length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>New This Month</span>
              <Badge variant="secondary">
                {users.filter((user: any) => {
                  const created = new Date(user.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Real-time system monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${stats.health?.overall === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Overall Status</span>
              <Badge variant={stats.health?.overall === 'healthy' ? 'default' : 'destructive'}>
                {stats.health?.overall || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${stats.health?.proxmox === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Proxmox Connection</span>
              <Badge variant={stats.health?.proxmox === 'connected' ? 'default' : 'destructive'}>
                {stats.health?.proxmox || 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${stats.health?.database === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Database</span>
              <Badge variant={stats.health?.database === 'connected' ? 'default' : 'destructive'}>
                {stats.health?.database || 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" size="sm">
              <Server className="h-4 w-4 mr-2" />
              VPS Management
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
            <Button variant="outline" size="sm">
              <DollarSign className="h-4 w-4 mr-2" />
              Billing Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
