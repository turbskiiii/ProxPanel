import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Monitor, AlertTriangle } from 'lucide-react';

interface VNCConsoleProps {
  url: string;
  password?: string;
}

export default function VNCConsole({ url, password }: VNCConsoleProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rfbRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load noVNC from CDN
    if (!(window as any).RFB) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@novnc/novnc/core/rfb.js';
      script.async = true;
      script.onload = () => {
        // noVNC loaded
      };
      script.onerror = () => {
        setError('Failed to load VNC client');
      };
      document.body.appendChild(script);
    }
    return () => {
      if (rfbRef.current) {
        rfbRef.current.disconnect();
      }
    };
  }, []);

  const connectVNC = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        // @ts-ignore
        const RFB = (window as any).RFB;
        if (!RFB) {
          setError('VNC client not loaded');
          setLoading(false);
          return;
        }
        const rfb = new RFB(canvasRef.current, url, { credentials: { password } });
        rfbRef.current = rfb;
        rfb.addEventListener('connect', () => {
          setConnected(true);
          setLoading(false);
        });
        rfb.addEventListener('disconnect', () => {
          setConnected(false);
        });
        rfb.addEventListener('securityfailure', () => {
          setError('VNC authentication failed');
          setLoading(false);
        });
      } catch (e: any) {
        setError('Failed to connect to VNC');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <span className='font-semibold'>VNC Console</span>
        <button onClick={connectVNC} disabled={loading || connected} className='btn btn-outline btn-sm'>
          {loading ? 'Connecting...' : connected ? 'Connected' : 'Connect'}
        </button>
        {connected && <span className='text-green-600 ml-2'>Connected</span>}
        {error && <span className='text-red-600 ml-2'>{error}</span>}
      </div>
      <div ref={canvasRef} style={{ width: '100%', height: 500, background: '#111', borderRadius: 8, overflow: 'hidden' }} />
    </div>
  );
}
