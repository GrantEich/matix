import { createContext, useContext, useEffect, useMemo, useState, PropsWithChildren } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { CrossmintWalletsAPI } from '@/wallets/crossmint/wallets/CrossmintWalletsAPI';
import { CustodialSolanaWalletClient, custodialFactory } from '@/wallets/crossmint/wallets/CustodialSolanaWalletClient';
import { useToast } from '@/hooks/use-toast';

type SupportedChain = 'solana';

interface WalletContextState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
  select: (chain: SupportedChain) => void;
  currentChain: SupportedChain;
  availableChains: SupportedChain[];
  walletClient: CustodialSolanaWalletClient | null;
}

const WalletContext = createContext<WalletContextState | null>(null);

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();
  const [currentChain, setCurrentChain] = useState<SupportedChain>('solana');
  const [currentWallet, setCurrentWallet] = useState<CustodialSolanaWalletClient | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Initialize Solana connection and Crossmint client
  const { connection, crossmintClient } = useMemo(() => {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!,
      { commitment: 'confirmed' }
    );

    const crossmintClient = new CrossmintApiClient(
      { apiKey: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY! },
      { internalConfig: {
        sdkMetadata: {
          name: '',
          version: ''
        }
      } }
    );

    return { connection, crossmintClient };
  }, []);

  // Initialize wallet clients
  const initializeWallet = useMemo(async () => {
    const createCustodialWallet = custodialFactory(crossmintClient);
    
    try {
      const wallet = await createCustodialWallet({
        chain: 'solana',
        connection,
        email: process.env.NEXT_PUBLIC_WALLET_EMAIL || '' // Or however you want to identify the wallet
      });
      
      return wallet;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      return null;
    }
  }, [connection, crossmintClient]);

  // Connect wallet
  const connect = async () => {
    if (connecting) return;

    try {
      setConnecting(true);
      const wallet = await initializeWallet;
      
      if (!wallet) {
        throw new Error('Failed to initialize wallet');
      }

      const address = wallet.getAddress();
      if (address) {
        setPublicKey(new PublicKey(address));
        setCurrentWallet(wallet);
        setConnected(true);
      }

      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet.',
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to wallet.',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      setPublicKey(null);
      setCurrentWallet(null);
      setConnected(false);
      toast({
        title: 'Wallet Disconnected',
        description: 'Successfully disconnected from your wallet.',
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from wallet.',
        variant: 'destructive',
      });
    }
  };

  // Select chain
  const select = (chain: SupportedChain) => {
    setCurrentChain(chain);
  };

  const value: WalletContextState = {
    publicKey,
    connected,
    connecting,
    disconnect,
    connect,
    select,
    currentChain,
    availableChains: ['solana'],
    walletClient: currentWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};