'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Activity, 
  Settings, 
  Power, 
  Monitor, 
  Terminal,
  ArrowLeft,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import VPSActions from '@/components/vps-actions';
import VNCConsole from '@/components/vnc-console';
import MonitoringPanel from '@/components/monitoring-panel';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VPSDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { data: vps, error, isLoading } = useSWR(`/api/vps/${id}`, fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading VPS details...</p>
        </div>
      </div>
    );
  }

  if (error || !vps) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p>Failed to load VPS details</p>
          <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
          <Button onClick={() => router.push('/dashboard/vps')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to VPS List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/vps')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{vps.name}</h1>
            <p className="text-gray-600">VPS ID: {vps.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={vps.status === 'running' ? 'default' : 'destructive'}>
            {vps.status}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* VPS Actions */}
      <VPSActions vps={vps} onAction={(action) => console.log(action)} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* VPS Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  VPS Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm">{vps.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Node</p>
                    <p className="text-sm">{vps.node}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">OS</p>
                    <p className="text-sm">{vps.os}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">IP Address</p>
                    <p className="text-sm">{vps.ip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPU</p>
                    <p className="text-sm">{vps.cpu?.usage || 0}% of {vps.cpu?.cores || 0} cores</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Memory</p>
                    <p className="text-sm">{vps.memory?.used || 0}GB / {vps.memory?.total || 0}GB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Storage</p>
                    <p className="text-sm">{vps.storage?.used || 0}GB / {vps.storage?.total || 0}GB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Network</p>
                    <p className="text-sm">{vps.network?.bandwidth || 0}Mbps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vps.cpu?.usage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {vps.cpu?.cores || 0} cores allocated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vps.memory?.usage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {vps.memory?.used || 0}GB / {vps.memory?.total || 0}GB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vps.storage?.usage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {vps.storage?.used || 0}GB / {vps.storage?.total || 0}GB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vps.network?.bandwidth || 0}Mbps</div>
                <p className="text-xs text-muted-foreground">
                  {vps.network?.connections || 0} connections
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <MonitoringPanel vpsId={vps.id} />
        </TabsContent>

        <TabsContent value="console" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                VNC Console
              </CardTitle>
              <CardDescription>Access your VPS through VNC console</CardDescription>
            </CardHeader>
            <CardContent>
              <VNCConsole 
                url={vps.vnc?.url || ''} 
                password={vps.vnc?.password || ''} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                VPS Settings
              </CardTitle>
              <CardDescription>Configure VPS settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Settings coming soon...</p>
                  <p className="text-sm text-gray-500">VPS configuration options will be available here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
