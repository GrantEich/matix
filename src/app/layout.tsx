// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { config } from '@/config/env';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI-Powered Solana Wallet',
  description: 'Intelligent wallet management with AI assistance for Solana blockchain',
  keywords: 'Solana, Wallet, AI, Blockchain, Crypto',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6'
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const isDevelopment = config.NODE_ENV === 'development';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        {isDevelopment && (
          <meta name="robots" content="noindex,nofollow" />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        {isDevelopment && (
          <div className="bg-yellow-400 text-black text-center text-sm py-1">
            Development Environment
          </div>
        )}

        <div className="min-h-screen bg-gray-50">
          <Providers>
            <main className="max-w-7xl mx-auto">
              {children}
            </main>
          </Providers>
          <Toaster />
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (!window.WebSocket) console.warn('WebSocket not supported');
                if (!window.localStorage) console.warn('LocalStorage not supported');
                if (!window.indexedDB) console.warn('IndexedDB not supported');
              } catch (e) {
                console.error('Feature detection failed:', e);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}