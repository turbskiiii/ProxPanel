import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProxPanel - Professional VPS Management',
  description:
    'Modern web-based dashboard for managing Proxmox VE virtual private servers. Built with Next.js, TypeScript, and Tailwind CSS.',
  keywords: [
    'VPS',
    'Proxmox',
    'Server Management',
    'Cloud Infrastructure',
    'Dashboard',
  ],
  authors: [{ name: 'ProxPanel Team' }],
  creator: 'ProxPanel',
  publisher: 'ProxPanel',
  robots: 'index, follow',
  openGraph: {
    title: 'ProxPanel - Professional VPS Management',
    description:
      'Modern web-based dashboard for managing Proxmox VE virtual private servers',
    type: 'website',
    locale: 'en_US',
    siteName: 'ProxPanel',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProxPanel - Professional VPS Management',
    description:
      'Modern web-based dashboard for managing Proxmox VE virtual private servers',
    creator: '@proxpanel',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <meta name='application-name' content='ProxPanel' />
        <meta name='apple-mobile-web-app-title' content='ProxPanel' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='mobile-web-app-capable' content='yes' />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
