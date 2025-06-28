'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Server, Search, Settings, Power, RotateCcw } from 'lucide-react';

interface VPSData {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'suspended';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchVPSList = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: VPSData[] = [
        {
          id: 'vm-100',
          name: 'Web Server',
          status: 'running',
          ip: '192.168.1.100',
          cpu: { usage: 45, cores: 2 },
          memory: { used: 1.2, total: 2 },
          disk: { used: 15, total: 40 },
          uptime: '7 days, 3 hours',
          os: 'Ubuntu 22.04',
          node: 'proxmox-node-1',
        },
        {
          id: 'vm-101',
          name: 'Database Server',
          status: 'running',
          ip: '192.168.1.101',
          cpu: { usage: 23, cores: 4 },
          memory: { used: 3.8, total: 8 },
          disk: { used: 85, total: 100 },
          uptime: '12 days, 8 hours',
          os: 'CentOS 8',
          node: 'proxmox-node-1',
        },
        {
          id: 'vm-102',
          name: 'Development',
          status: 'stopped',
          ip: '192.168.1.102',
          cpu: { usage: 0, cores: 1 },
          memory: { used: 0, total: 1 },
          disk: { used: 8, total: 20 },
          uptime: 'Stopped',
          os: 'Debian 11',
          node: 'proxmox-node-2',
        },
        {
          id: 'vm-103',
          name: 'Mail Server',
          status: 'running',
          ip: '192.168.1.103',
          cpu: { usage: 12, cores: 1 },
          memory: { used: 0.8, total: 2 },
          disk: { used: 25, total: 50 },
          uptime: '3 days, 12 hours',
          os: 'Ubuntu 20.04',
          node: 'proxmox-node-2',
        },
      ];

      setVpsList(mockData);
      setLoading(false);
    };

    fetchVPSList();
  }, []);

  const filteredVPS = vpsList.filter(vps => {
    const matchesSearch =
      vps.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vps.ip.includes(searchTerm) ||
      vps.os.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vps.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className='bg-green-100 text-green-800'>Running</Badge>;
      case 'stopped':
        return <Badge className='bg-red-100 text-red-800'>Stopped</Badge>;
      case 'suspended':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>Suspended</Badge>
        );
      default:
        return <Badge variant='secondary'>Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-3xl font-bold tracking-tight'>VPS List</h2>
        </div>
        <div className='grid gap-4'>
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className='animate-pulse'>
              <CardContent className='p-6'>
                <div className='space-y-3'>
                  <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>VPS List</h2>
        <Button>
          <Server className='mr-2 h-4 w-4' />
          Create New VPS
        </Button>
      </div>

      {/* Search and Filter */}
      <div className='flex gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search VPS by name, IP, or OS...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className='px-3 py-2 border border-input bg-background rounded-md text-sm'
        >
          <option value='all'>All Status</option>
          <option value='running'>Running</option>
          <option value='stopped'>Stopped</option>
          <option value='suspended'>Suspended</option>
        </select>
      </div>

      {/* VPS Grid */}
      <div className='grid gap-4'>
        {filteredVPS.map(vps => (
          <Card key={vps.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between'>
                <div className='space-y-3 flex-1'>
                  <div className='flex items-center gap-3'>
                    <Server className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <h3 className='font-semibold text-lg'>{vps.name}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {vps.ip} • {vps.os} • Node: {vps.node}
                      </p>
                    </div>
                    {getStatusBadge(vps.status)}
                  </div>

                  <div className='grid grid-cols-3 gap-4 text-sm'>
                    <div>
                      <div className='flex justify-between mb-1'>
                        <span>CPU ({vps.cpu.cores} cores)</span>
                        <span>{vps.cpu.usage}%</span>
                      </div>
                      <Progress value={vps.cpu.usage} className='h-2' />
                    </div>

                    <div>
                      <div className='flex justify-between mb-1'>
                        <span>Memory</span>
                        <span>
                          {vps.memory.used}GB / {vps.memory.total}GB
                        </span>
                      </div>
                      <Progress
                        value={(vps.memory.used / vps.memory.total) * 100}
                        className='h-2'
                      />
                    </div>

                    <div>
                      <div className='flex justify-between mb-1'>
                        <span>Disk</span>
                        <span>
                          {vps.disk.used}GB / {vps.disk.total}GB
                        </span>
                      </div>
                      <Progress
                        value={(vps.disk.used / vps.disk.total) * 100}
                        className='h-2'
                      />
                    </div>
                  </div>

                  <div className='text-sm text-muted-foreground'>
                    Uptime: {vps.uptime}
                  </div>
                </div>

                <div className='flex flex-col gap-2 ml-4'>
                  <Button asChild size='sm'>
                    <Link href={`/dashboard/vps/${vps.id}`}>
                      <Settings className='mr-1 h-3 w-3' />
                      Manage
                    </Link>
                  </Button>

                  {vps.status === 'running' ? (
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-orange-600'
                    >
                      <RotateCcw className='mr-1 h-3 w-3' />
                      Reboot
                    </Button>
                  ) : (
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-green-600'
                    >
                      <Power className='mr-1 h-3 w-3' />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVPS.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Server className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No VPS Found</h3>
            <p className='text-muted-foreground text-center mb-4'>
              {searchTerm || statusFilter !== 'all'
                ? 'No VPS match your current filters.'
                : "You don't have any virtual private servers yet."}
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <Button
                variant='outline'
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button>Create New VPS</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
