'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server, Search, Plus, Play, Square, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface VPSData {
  id: string;
  name: string;
  status: string;
  ip: string;
  cpu: { usage: number; cores: number };
  memory: { used: number; total: number };
  disk: { used: number; total: number };
  uptime: string;
  os: string;
  node: string;
}

export default function VPSListPage() {
  const [vpsList, setVpsList] = useState<VPSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchVPSList = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/vps');
        if (!response.ok) {
          throw new Error('Failed to fetch VPS list');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to load VPS data');
        }

        // Transform API data to our VPS format
        const transformedVPS = data.data.map((vps: any) => ({
          id: vps.id,
          name: vps.name,
          status: vps.status,
          ip: vps.ip || 'N/A',
          cpu: { 
            usage: vps.cpu?.usage || 0, 
            cores: vps.cpu?.cores || 1 
          },
          memory: { 
            used: vps.memory?.used || 0, 
            total: vps.memory?.total || 1 
          },
          disk: { 
            used: vps.disk?.used || 0, 
            total: vps.disk?.total || 1 
          },
          uptime: vps.uptime || 'Unknown',
          os: vps.os || 'Linux',
          node: vps.node || 'Unknown',
        }));

        setVpsList(transformedVPS);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load VPS data');
        console.error('VPS list error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVPSList();
  }, []);

  const filteredVPS = vpsList.filter(vps => {
    const matchesSearch = vps.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vps.ip.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || vps.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'suspended':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading VPS list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load VPS list</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
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
          <h1 className="text-3xl font-bold tracking-tight">VPS Instances</h1>
          <p className="text-muted-foreground">
            Manage your virtual private servers
          </p>
        </div>
        <Link href="/dashboard/vps/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create VPS
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search VPS by name or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="stopped">Stopped</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* VPS Grid */}
      {filteredVPS.length === 0 ? (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No VPS found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first VPS'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link href="/dashboard/vps/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create VPS
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVPS.map((vps) => (
            <Card key={vps.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{vps.name}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(vps.status)} text-white`}
                  >
                    {getStatusText(vps.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{vps.ip}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resource Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU</span>
                    <span>{vps.cpu.usage}% ({vps.cpu.cores} cores)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span>{vps.memory.used}GB / {vps.memory.total}GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Disk</span>
                    <span>{vps.disk.used}GB / {vps.disk.total}GB</span>
                  </div>
                </div>

                {/* System Info */}
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>OS: {vps.os}</div>
                  <div>Node: {vps.node}</div>
                  <div>Uptime: {vps.uptime}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/vps/${vps.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    title={vps.status === 'running' ? 'Stop' : 'Start'}
                  >
                    {vps.status === 'running' ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Reboot"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
