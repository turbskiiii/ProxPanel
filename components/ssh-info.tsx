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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Terminal, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface VPSDetails {
  id: string;
  name: string;
  ip: string;
  sshPort: number;
  rootPassword?: string;
}

interface SSHInfoProps {
  vps: VPSDetails;
}

export function SSHInfo({ vps }: SSHInfoProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sshCommand = `ssh root@${vps.ip} -p ${vps.sshPort}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Terminal className='h-5 w-5' />
          SSH Connection
        </CardTitle>
        <CardDescription>Connect to your VPS via SSH</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div>
            <Label htmlFor='ssh-host'>Host</Label>
            <div className='flex gap-2'>
              <Input
                id='ssh-host'
                value={vps.ip}
                readOnly
                className='font-mono'
              />
              <Button
                variant='outline'
                size='icon'
                onClick={() => copyToClipboard(vps.ip, 'host')}
              >
                {copied === 'host' ? (
                  <CheckCircle className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor='ssh-port'>Port</Label>
            <div className='flex gap-2'>
              <Input
                id='ssh-port'
                value={vps.sshPort.toString()}
                readOnly
                className='font-mono'
              />
              <Button
                variant='outline'
                size='icon'
                onClick={() => copyToClipboard(vps.sshPort.toString(), 'port')}
              >
                {copied === 'port' ? (
                  <CheckCircle className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor='ssh-username'>Username</Label>
            <div className='flex gap-2'>
              <Input
                id='ssh-username'
                value='root'
                readOnly
                className='font-mono'
              />
              <Button
                variant='outline'
                size='icon'
                onClick={() => copyToClipboard('root', 'username')}
              >
                {copied === 'username' ? (
                  <CheckCircle className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {vps.rootPassword && (
            <div>
              <Label htmlFor='ssh-password'>Password</Label>
              <div className='flex gap-2'>
                <Input
                  id='ssh-password'
                  type={showPassword ? 'text' : 'password'}
                  value={vps.rootPassword}
                  readOnly
                  className='font-mono'
                />
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => copyToClipboard(vps.rootPassword!, 'password')}
                >
                  {copied === 'password' ? (
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Alert>
          <Terminal className='h-4 w-4' />
          <AlertDescription>
            <div className='space-y-2'>
              <p className='font-medium'>SSH Command:</p>
              <div className='flex items-center gap-2 p-2 bg-muted rounded font-mono text-sm'>
                <code className='flex-1'>{sshCommand}</code>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => copyToClipboard(sshCommand, 'command')}
                >
                  {copied === 'command' ? (
                    <CheckCircle className='h-3 w-3 text-green-600' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
