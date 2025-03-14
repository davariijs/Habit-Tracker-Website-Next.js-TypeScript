// import Providers from '@/components/layout/providers';
// import { Toaster } from '@/components/ui/sonner';
// import type { Metadata } from 'next';
// import { NuqsAdapter } from 'nuqs/adapters/next/app';
// import { Lato } from 'next/font/google';
// import NextTopLoader from 'nextjs-toploader';
// import './globals.css';
// import { getServerSession } from 'next-auth/next';
// import authConfig from '@/lib/auth.config';
// import Script from 'next/script';

// export const metadata: Metadata = {
//   title: 'Habit Tracker',
//   description: 'Habit Tracker application'
// };

// const lato = Lato({
//   subsets: ['latin'],
//   weight: ['400', '700', '900'],
//   display: 'swap'
// });

// export default async function RootLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await getServerSession(authConfig);
//   return (
//     <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
//       <head>
//         <link rel="manifest" href="/manifest.json" />
//         <meta name="theme-color" content="#0e1111" />
//         <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
//         <Script id="pwa-service-worker" strategy="afterInteractive">
//         {`
//         if ('serviceWorker' in navigator) {
//           window.addEventListener('load', function() {
//             navigator.serviceWorker.register('/sw-custom.js')
//               .then(reg => {
//                 // Check if the app can be installed
//                 window.addEventListener('beforeinstallprompt', (e) => {
//                 });
//               })
//               .catch(err => console.error("❌ Service Worker registration failed:", err));
//           });
          
//           // Log when installation is available
//           window.addEventListener('appinstalled', (event) => {
//           });
//         }
//       `}
//         </Script>
//       </head>
//       <body className={'overflow-hidden'}>
//         <NextTopLoader showSpinner={false} />
//         <NuqsAdapter>
//           <Providers session={session}>
//             <Toaster />
//             {children}
//           </Providers>
//         </NuqsAdapter>
//       </body>
//     </html>
//   );
// }


// app/layout.tsx
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
  description: 'Habit Tracker application',
  // Add other metadata here as needed (e.g., open graph tags)
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);
  return (
    <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
      <head>
        {/* --- IMPORTANT: Viewport Meta Tag --- */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0e1111" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <Script id="pwa-service-worker" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw-custom.js')
                  .then(reg => {
                    // Registration was successful, you can optionally log it
                    console.log('ServiceWorker registration successful with scope: ', reg.scope);

                    // Check if the app can be installed (optional)
                    window.addEventListener('beforeinstallprompt', (e) => {
                      // Prevent the mini-infobar from appearing on mobile
                      e.preventDefault();
                      // Stash the event so it can be triggered later.
                      // deferredPrompt = e;  // You'd need to declare deferredPrompt
                      // Show the install button or other UI element
                      // showInstallButton(); // Your custom function to show the install button
                    });
                  })
                  .catch(err => console.error("❌ Service Worker registration failed:", err));
              });

              // Log when installation is available (optional)
              window.addEventListener('appinstalled', (event) => {
                console.log('App was installed');
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