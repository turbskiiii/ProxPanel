import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
  generator: 'v0.dev',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning>
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
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="fixed top-4 right-4 z-50">
              <LanguageSwitcher />
            </div>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
