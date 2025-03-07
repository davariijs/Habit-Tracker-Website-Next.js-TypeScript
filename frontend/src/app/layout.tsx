import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { getServerSession } from 'next-auth/next';
import authConfig from '@/lib/auth.config';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Habit Tracker application'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);
  return (
    <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0e1111" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <Script id="pwa-debug" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.getRegistrations().then(registrations => {
                console.log('SW Registrations:', registrations);
              });
              
              // Check installability
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                console.log('✅ PWA is installable!');
                window.deferredPrompt = e;
              });
            });
          }
        `}
      </Script>
      </head>
      <body className={'overflow-hidden'}>
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <Providers session={session}>
            <Toaster />
            {children}
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
