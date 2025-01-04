'use client';

import { useEffect } from 'react';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { AIAssistant } from '@/components/wallet/AIAssistant';
import SendTransaction from '@/components/wallet/SendTransaction';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { TokenManager } from '@/components/wallet/TokenManager';
import { Settings } from '@/components/wallet/WalletSettings';
import { PortfolioAnalytics } from '@/components/wallet/PortfolioAnalytics';
import { useWallet } from './providers';
import type { WalletState } from '@/types/wallet';

export default function Home() {
  const { 
    publicKey, 
    connected, 
    connecting, 
    connect, 
    disconnect, 
    select, 
    createMint,
    balance,
    error 
  } = useWallet();

  // Create a wallet state object from the context values
  const walletState: WalletState = {
    publicKey,
    connected,
    connecting,
    address: publicKey?.toBase58() || '',
    balance: balance || '0',
    error: error || null,
    isLoading: connecting
  };

  useEffect(() => {
    if (!publicKey && !connecting) {
      connect();
    }
  }, [publicKey, connecting, connect]);

  if (connecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to AI-Powered Solana Wallet</h1>
          <button 
            onClick={connect} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <WalletInfo />
          <SendTransaction 
            balance={balance || ''} 
            address={publicKey.toBase58()} 
            isLoading={connecting}
            error={error || null}
          />
          <Settings />
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-2 space-y-6">
          <PortfolioAnalytics />
          <AIAssistant walletState={walletState} />
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="mt-8 space-y-6">
        <TokenManager walletState={walletState} />
        <TransactionHistory walletState={walletState} />
      </div>
    </div>
  );
}