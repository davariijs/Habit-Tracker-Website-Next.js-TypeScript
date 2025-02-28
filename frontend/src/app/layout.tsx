import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { getServerSession } from 'next-auth/next';
import authConfig from '@/lib/auth.config';

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
        <meta name="theme-color" content="#f6e8de" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
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
