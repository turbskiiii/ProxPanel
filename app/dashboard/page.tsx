'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server, Users, Activity, Settings, LogOut } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Fetch user info from secure endpoint
  const { data: user, error: userError } = useSWR('/api/auth/me', fetcher);
  
  // Fetch dashboard stats
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR('/api/admin/stats', fetcher);

  useEffect(() => {
    // Check if user is authenticated
    if (userError) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }
    
    if (user) {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [user, userError, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p>Please log in to access the dashboard.</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || user?.email || 'User'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            {user?.is_admin ? 'Admin' : 'User'}
          </Badge>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Loading data...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Failed to load dashboard statistics</p>
              <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
            </div>
          </CardContent>
        </Card>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total VPS</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vps?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.vps?.running || 0} running, {stats.vps?.stopped || 0} stopped
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users?.active || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.health?.overall === 'healthy' ? 'Good' : 'Warning'}</div>
              <p className="text-xs text-muted-foreground">
                {stats.health?.proxmox === 'connected' ? 'Proxmox Connected' : 'Proxmox Disconnected'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cpu?.usage || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.cpu?.cores || 0} cores available
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <p>No statistics available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              VPS Management
            </CardTitle>
            <CardDescription>Create and manage your virtual servers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/vps')} className="w-full">
              Manage VPS
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoring
            </CardTitle>
            <CardDescription>View system performance and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/dashboard/vps')} className="w-full">
              View Metrics
            </Button>
          </CardContent>
        </Card>

        {user?.is_admin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Panel
              </CardTitle>
              <CardDescription>Administrative tools and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => router.push('/admin')} className="w-full">
                Admin Panel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
