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
} from 'lucide-react';

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
  status: 'online' | 'offline' | 'maintenance';
}

const templates: VPSTemplate[] = [
  {
    id: 'ubuntu-22.04',
    name: 'Ubuntu Server',
    os: 'Ubuntu',
    version: '22.04 LTS',
    description: 'Most popular Linux distribution for servers',
    minCpu: 1,
    minMemory: 512,
    minDisk: 10,
    recommended: true,
  },
  {
    id: 'debian-12',
    name: 'Debian',
    os: 'Debian',
    version: '12 (Bookworm)',
    description: 'Stable and secure Linux distribution',
    minCpu: 1,
    minMemory: 512,
    minDisk: 10,
    recommended: true,
  },
  {
    id: 'centos-9',
    name: 'CentOS Stream',
    os: 'CentOS',
    version: '9',
    description: 'Enterprise-grade Linux distribution',
    minCpu: 1,
    minMemory: 1024,
    minDisk: 15,
    recommended: false,
  },
  {
    id: 'rocky-9',
    name: 'Rocky Linux',
    os: 'Rocky Linux',
    version: '9',
    description: 'RHEL-compatible enterprise Linux',
    minCpu: 1,
    minMemory: 1024,
    minDisk: 15,
    recommended: false,
  },
  {
    id: 'alpine-3.19',
    name: 'Alpine Linux',
    os: 'Alpine',
    version: '3.19',
    description: 'Lightweight, security-oriented Linux',
    minCpu: 1,
    minMemory: 256,
    minDisk: 5,
    recommended: false,
  },
];

const mockNodes: NodeInfo[] = [
  {
    id: 'pve-ny-01',
    name: 'New York Node 1',
    location: 'New York, USA',
    cpu: { usage: 35, total: 100 },
    memory: { usage: 45, total: 100 },
    storage: { usage: 60, total: 100 },
    status: 'online',
  },
  {
    id: 'pve-la-01',
    name: 'Los Angeles Node 1',
    location: 'Los Angeles, USA',
    cpu: { usage: 28, total: 100 },
    memory: { usage: 38, total: 100 },
    storage: { usage: 55, total: 100 },
    status: 'online',
  },
  {
    id: 'pve-eu-01',
    name: 'Frankfurt Node 1',
    location: 'Frankfurt, Germany',
    cpu: { usage: 42, total: 100 },
    memory: { usage: 52, total: 100 },
    storage: { usage: 48, total: 100 },
    status: 'online',
  },
];

export default function CreateVPSPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdVPS, setCreatedVPS] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    template: '',
    cpu: 1,
    memory: 1024,
    disk: 20,
    node: '',
    description: '',
  });

  const selectedTemplate = templates.find(t => t.id === formData.template);
  const selectedNode = mockNodes.find(n => n.id === formData.node);

  const calculateCost = () => {
    const cpuCost = formData.cpu * 5; // $5 per CPU core
    const memoryCost = (formData.memory / 1024) * 8; // $8 per GB RAM
    const diskCost = formData.disk * 0.5; // $0.50 per GB disk
    return cpuCost + memoryCost + diskCost;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/vps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create VPS');
      }

      setCreatedVPS(result.data);
      setSuccess(true);
      setStep(5);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.template;
      case 2:
        return (
          formData.cpu >= 1 && formData.memory >= 512 && formData.disk >= 10
        );
      case 3:
        return formData.node;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Choose Template';
      case 2:
        return 'Configure Resources';
      case 3:
        return 'Select Location';
      case 4:
        return 'Review & Create';
      case 5:
        return 'VPS Created!';
      default:
        return 'Create VPS';
    }
  };

  if (success) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/dashboard/vps')}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to VPS List
          </Button>
        </div>

        <Card className='max-w-2xl mx-auto'>
          <CardHeader className='text-center'>
            <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <CardTitle className='text-2xl'>
              VPS Created Successfully!
            </CardTitle>
            <CardDescription>
              Your virtual private server is being set up
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
              <div className='flex justify-between'>
                <span className='font-medium'>VPS Name:</span>
                <span>{createdVPS?.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>VM ID:</span>
                <span>{createdVPS?.vmid}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Node:</span>
                <span>{createdVPS?.node}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Status:</span>
                <Badge variant='outline'>{createdVPS?.status}</Badge>
              </div>
              {createdVPS?.rootPassword && (
                <div className='flex justify-between'>
                  <span className='font-medium'>Root Password:</span>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm'>
                    {createdVPS.rootPassword}
                  </code>
                </div>
              )}
            </div>

            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                Your VPS is being created in the background. This process may
                take 2-5 minutes. You can monitor the progress from the VPS
                management page.
              </AlertDescription>
            </Alert>

            <div className='flex gap-3'>
              <Button
                onClick={() => router.push(`/dashboard/vps/${createdVPS?.id}`)}
                className='flex-1'
              >
                <Server className='mr-2 h-4 w-4' />
                Manage VPS
              </Button>
              <Button
                variant='outline'
                onClick={() => router.push('/dashboard/vps')}
                className='flex-1'
              >
                View All VPS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/dashboard/vps')}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to VPS List
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>Create New VPS</h1>
          <p className='text-muted-foreground'>
            Set up your virtual private server in minutes
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between mb-4'>
            <span className='text-sm font-medium'>Step {step} of 4</span>
            <span className='text-sm text-muted-foreground'>
              {getStepTitle()}
            </span>
          </div>
          <Progress value={(step / 4) * 100} className='h-2' />
        </CardContent>
      </Card>

      {error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Server className='h-5 w-5' />
                VPS Details
              </CardTitle>
              <CardDescription>
                Choose a name and operating system for your VPS
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>VPS Name</Label>
                <Input
                  id='name'
                  placeholder='e.g., web-server-01'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <p className='text-xs text-muted-foreground'>
                  Use letters, numbers, hyphens, and underscores only
                </p>
              </div>

              <div className='space-y-2'>
                <Label>Operating System Template</Label>
                <div className='grid gap-3 md:grid-cols-2'>
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.template === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, template: template.id })
                      }
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-medium'>{template.name}</h4>
                            {template.recommended && (
                              <Badge variant='secondary'>Recommended</Badge>
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {template.version}
                          </p>
                          <p className='text-xs text-muted-foreground mt-1'>
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <div className='flex gap-4 mt-3 text-xs text-muted-foreground'>
                        <span>Min CPU: {template.minCpu}</span>
                        <span>Min RAM: {template.minMemory}MB</span>
                        <span>Min Disk: {template.minDisk}GB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Configure Resources */}
      {step === 2 && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Cpu className='h-5 w-5' />
                Resource Configuration
              </CardTitle>
              <CardDescription>
                Allocate CPU, memory, and storage for your VPS
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* CPU Configuration */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-2'>
                  <Cpu className='h-4 w-4' />
                  CPU Cores: {formData.cpu}
                </Label>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        cpu: Math.max(1, formData.cpu - 1),
                      })
                    }
                    disabled={formData.cpu <= 1}
                  >
                    -
                  </Button>
                  <span className='w-16 text-center font-mono'>
                    {formData.cpu} cores
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        cpu: Math.min(16, formData.cpu + 1),
                      })
                    }
                    disabled={formData.cpu >= 16}
                  >
                    +
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Minimum: {selectedTemplate?.minCpu || 1} core(s) • Maximum: 16
                  cores
                </p>
              </div>

              <Separator />

              {/* Memory Configuration */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-2'>
                  <MemoryStick className='h-4 w-4' />
                  Memory: {formData.memory}MB (
                  {(formData.memory / 1024).toFixed(1)}GB)
                </Label>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        memory: Math.max(512, formData.memory - 512),
                      })
                    }
                    disabled={formData.memory <= 512}
                  >
                    -512MB
                  </Button>
                  <span className='w-24 text-center font-mono'>
                    {formData.memory}MB
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        memory: Math.min(32768, formData.memory + 512),
                      })
                    }
                    disabled={formData.memory >= 32768}
                  >
                    +512MB
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Minimum: {selectedTemplate?.minMemory || 512}MB • Maximum:
                  32GB
                </p>
              </div>

              <Separator />

              {/* Disk Configuration */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-2'>
                  <HardDrive className='h-4 w-4' />
                  Storage: {formData.disk}GB
                </Label>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        disk: Math.max(10, formData.disk - 10),
                      })
                    }
                    disabled={formData.disk <= 10}
                  >
                    -10GB
                  </Button>
                  <span className='w-16 text-center font-mono'>
                    {formData.disk}GB
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        disk: Math.min(1000, formData.disk + 10),
                      })
                    }
                    disabled={formData.disk >= 1000}
                  >
                    +10GB
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Minimum: {selectedTemplate?.minDisk || 10}GB • Maximum: 1000GB
                </p>
              </div>

              {/* Cost Estimate */}
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  <DollarSign className='h-4 w-4 text-blue-600' />
                  <span className='font-medium text-blue-900'>
                    Estimated Monthly Cost
                  </span>
                </div>
                <div className='text-2xl font-bold text-blue-900'>
                  ${calculateCost().toFixed(2)}/month
                </div>
                <div className='text-sm text-blue-700 mt-1'>
                  CPU: ${(formData.cpu * 5).toFixed(2)} • RAM: $
                  {((formData.memory / 1024) * 8).toFixed(2)} • Storage: $
                  {(formData.disk * 0.5).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Select Location */}
      {step === 3 && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Network className='h-5 w-5' />
                Select Location
              </CardTitle>
              <CardDescription>
                Choose the datacenter location for your VPS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {mockNodes.map(node => (
                  <div
                    key={node.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.node === node.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${node.status !== 'online' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() =>
                      node.status === 'online' &&
                      setFormData({ ...formData, node: node.id })
                    }
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div>
                        <h4 className='font-medium'>{node.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {node.location}
                        </p>
                      </div>
                      <Badge
                        variant={
                          node.status === 'online' ? 'default' : 'destructive'
                        }
                      >
                        {node.status}
                      </Badge>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between text-xs'>
                        <span>CPU Usage</span>
                        <span>{node.cpu.usage}%</span>
                      </div>
                      <Progress value={node.cpu.usage} className='h-1' />

                      <div className='flex justify-between text-xs'>
                        <span>Memory Usage</span>
                        <span>{node.memory.usage}%</span>
                      </div>
                      <Progress value={node.memory.usage} className='h-1' />

                      <div className='flex justify-between text-xs'>
                        <span>Storage Usage</span>
                        <span>{node.storage.usage}%</span>
                      </div>
                      <Progress value={node.storage.usage} className='h-1' />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Review & Create */}
      {step === 4 && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5' />
                Review Configuration
              </CardTitle>
              <CardDescription>
                Review your VPS configuration before creation
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-medium mb-2'>VPS Details</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Name:</span>
                        <span className='font-medium'>{formData.name}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Template:</span>
                        <span className='font-medium'>
                          {selectedTemplate?.name}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          OS Version:
                        </span>
                        <span className='font-medium'>
                          {selectedTemplate?.version}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Resources</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          CPU Cores:
                        </span>
                        <span className='font-medium'>{formData.cpu}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Memory:</span>
                        <span className='font-medium'>{formData.memory}MB</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Storage:</span>
                        <span className='font-medium'>{formData.disk}GB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h4 className='font-medium mb-2'>Location</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Node:</span>
                        <span className='font-medium'>
                          {selectedNode?.name}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Location:</span>
                        <span className='font-medium'>
                          {selectedNode?.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Billing</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Monthly Cost:
                        </span>
                        <span className='font-bold text-lg'>
                          ${calculateCost().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description (Optional)</Label>
                <Textarea
                  id='description'
                  placeholder='Add a description for this VPS...'
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <Alert>
                <Shield className='h-4 w-4' />
                <AlertDescription>
                  Your VPS will be created with a randomly generated root
                  password. You can change this password after creation from the
                  VPS management panel.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className='flex justify-between'>
        <Button
          variant='outline'
          onClick={handleBack}
          disabled={step === 1 || loading}
        >
          Back
        </Button>

        <div className='flex gap-3'>
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed() || loading}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={!canProceed() || loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating VPS...
                </>
              ) : (
                <>
                  <Server className='mr-2 h-4 w-4' />
                  Create VPS
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
