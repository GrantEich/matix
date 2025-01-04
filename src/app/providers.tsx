'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BrowserRouter } from 'react-router-dom';
import { aiAgentService } from '@/lib/ai/agent-service';
import { crossmintService } from '@/services/crossmint';
import { heliusService } from '@/services/helius';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

require('@solana/wallet-adapter-react-ui/styles.css');

// Context Types
interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
  select: (walletName: string) => void;
  createMint: (decimals?: number, authority?: string) => Promise<PublicKey>;
  balance?: string;
  error?: string | null;
}

interface AIContextType {
  isAnalyzing: boolean;
  lastAnalysis: {
    risk?: number;
    recommendation?: string;
    details?: string[];
  } | null;
  analyzeTransaction: (amount: number, recipient: string) => Promise<void>;
  getMarketInsights: () => Promise<void>;
}

// Create Contexts
const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  connected: false,
  connecting: false,
  disconnect: async () => {},
  connect: async () => {},
  select: () => {},
  createMint: async () => {
    throw new Error('Not implemented');
  }
});

const AIContext = createContext<AIContextType>({
  isAnalyzing: false,
  lastAnalysis: null,
  analyzeTransaction: async () => {},
  getMarketInsights: async () => {}
});

interface ProvidersProps {
  children: ReactNode;
}

function BaseProviders({ children }: ProvidersProps) {
  // Solana Connection Setup
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com', []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // Wallet State
  const [walletState, setWalletState] = useState<WalletContextType>({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnect: async () => {},
    connect: async () => {},
    select: () => {},
    createMint: async () => {
      throw new Error('Not implemented');
    }
  });

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AIContextType['lastAnalysis']>(null);

  // Your existing callbacks
  const updateBalance = useCallback(async () => {
    if (!walletState.publicKey) return;
    setWalletState(prev => ({ ...prev, connecting: true }));
    try {
      const balance = await crossmintService.getBalance(walletState.publicKey.toString());
      setWalletState(prev => ({
        ...prev,
        balance: balance.toString(),
        connecting: false,
        error: null
      }));
    } catch (_error) {
      setWalletState(prev => ({
        ...prev,
        connecting: false,
        error: 'Failed to fetch balance'
      }));
    }
  }, [walletState.publicKey]);

  // Your other callbacks here...
  // (keeping your existing implementation for other methods)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initializeWallet = async () => {
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress) {
          try {
            const publicKey = new PublicKey(savedAddress);
            setWalletState(prev => ({
              ...prev,
              publicKey,
              connected: true
            }));
            await updateBalance();
          } catch (error) {
            console.error('Failed to reconnect wallet:', error);
          }
        }
      };

      initializeWallet();
    }
  }, [updateBalance]);

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <BrowserRouter>
              <WalletContext.Provider value={walletState}>
                <AIContext.Provider
                  value={{
                    isAnalyzing,
                    lastAnalysis,
                    analyzeTransaction: async () => {}, // Implement your methods
                    getMarketInsights: async () => {}  // Implement your methods
                  }}
                >
                  {children}
                </AIContext.Provider>
              </WalletContext.Provider>
            </BrowserRouter>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}

// Export a dynamic version of Providers that handles SSR
export const Providers = dynamic(() => Promise.resolve(BaseProviders), {
  ssr: false
}) as React.FC<ProvidersProps>;

// Export hooks
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};