'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import useSWR from 'swr';

interface VPSTemplate {
  id: string;
  name: string;
  os: string;
  version: string;
  description: string;
  minCpu: number;
  minMemory: number;
  minDisk: number;
  recommended: boolean;
}

interface NodeInfo {
  id: string;
  name: string;
  location: string;
  cpu: { usage: number; total: number };
  memory: { usage: number; total: number };
  storage: { usage: number; total: number };
  status: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CreateVPSPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    node: '',
    template: '',
    cpu: 1,
    memory: 1,
    disk: 10,
    network: 100,
    description: ''
  });

  // Fetch real nodes and templates from API
  const { data: nodes, error: nodesError, isLoading: nodesLoading } = useSWR('/api/vps/nodes', fetcher);
  const { data: templates, error: templatesError, isLoading: templatesLoading } = useSWR('/api/vps/templates', fetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/vps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/dashboard/vps/${result.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to create VPS: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating VPS:', error);
      alert('Failed to create VPS. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (nodesLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading VPS creation options...</p>
        </div>
      </div>
    );
  }

  if (nodesError || templatesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p>Failed to load VPS creation options</p>
          <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
          <Button onClick={() => router.push('/dashboard/vps')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to VPS List
          </Button>
        </div>
      </div>
    );
  }

  if (!nodes || !templates) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-600">
          <Server className="h-8 w-8 mx-auto mb-4" />
          <p>No nodes or templates available</p>
          <p className="text-sm text-gray-500 mt-2">Please configure your Proxmox nodes and templates</p>
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
            <h1 className="text-3xl font-bold">Create New VPS</h1>
            <p className="text-gray-600">Deploy a new virtual server</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Configure your VPS name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">VPS Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="my-vps"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Web server for my application"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Node and Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
            <CardDescription>Select the node and template for your VPS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="node">Node</Label>
                <Select value={formData.node} onValueChange={(value) => handleInputChange('node', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node: any) => (
                      <SelectItem key={node.id} value={node.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{node.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {node.location}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select value={formData.template} onValueChange={(value) => handleInputChange('template', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: any) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{template.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {template.os}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>Configure CPU, memory, storage, and network resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu" className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU Cores
                </Label>
                <Select value={formData.cpu.toString()} onValueChange={(value) => handleInputChange('cpu', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 4, 8, 16, 32].map(cores => (
                      <SelectItem key={cores} value={cores.toString()}>
                        {cores} cores
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory" className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  Memory (GB)
                </Label>
                <Select value={formData.memory.toString()} onValueChange={(value) => handleInputChange('memory', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 4, 8, 16, 32, 64, 128].map(memory => (
                      <SelectItem key={memory} value={memory.toString()}>
                        {memory} GB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disk" className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Storage (GB)
                </Label>
                <Select value={formData.disk.toString()} onValueChange={(value) => handleInputChange('disk', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100, 200, 500, 1000].map(disk => (
                      <SelectItem key={disk} value={disk.toString()}>
                        {disk} GB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="network" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Network (Mbps)
                </Label>
                <Select value={formData.network.toString()} onValueChange={(value) => handleInputChange('network', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[100, 250, 500, 1000, 2500, 5000, 10000].map(bandwidth => (
                      <SelectItem key={bandwidth} value={bandwidth.toString()}>
                        {bandwidth} Mbps
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
            <CardDescription>Review your VPS configuration before creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">VPS Name:</p>
                <p className="text-gray-600">{formData.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-medium">Node:</p>
                <p className="text-gray-600">{formData.node || 'Not selected'}</p>
              </div>
              <div>
                <p className="font-medium">Template:</p>
                <p className="text-gray-600">{formData.template || 'Not selected'}</p>
              </div>
              <div>
                <p className="font-medium">Resources:</p>
                <p className="text-gray-600">
                  {formData.cpu} CPU, {formData.memory}GB RAM, {formData.disk}GB Storage, {formData.network}Mbps Network
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/vps')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || !formData.name || !formData.node || !formData.template}
          >
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating VPS...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create VPS
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
