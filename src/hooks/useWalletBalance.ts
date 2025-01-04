// src/hooks/useCrossmintWallet.ts
import { useState, useEffect, useContext } from 'react';
import { crossmintService } from '@/services/crossmint';
import { WalletState } from '@/types/wallet';
import { WalletContext } from '../context/walletContext';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useCrossmintWallet() {
  const { publicKey, connected } = useContext(WalletContext);
  const [walletState, setWalletState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
    address: '',
    balance: '0',
    isLoading: true,
    error: null,
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connection = new Connection('https://api.mainnet-beta.solana.com');

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      const wallet = await crossmintService.createWallet();
      const balance = await crossmintService.getBalance(wallet.address);
      
      setWalletState(prev => ({
        ...prev,
        publicKey: new PublicKey(wallet.address),
        connected: true,
        connecting: false,
        address: wallet.address,
        balance: balance.balance,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
      }));
    }
  };

  const refreshBalance = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      refreshBalance();
    }
  }, [connected, publicKey]);

  const sendTransaction = async (toAddress: string, amount: number) => {
    if (!walletState.address) throw new Error('Wallet not initialized');

    try {
      const transaction = await connection.requestAirdrop(
        new PublicKey(toAddress),
        amount * LAMPORTS_PER_SOL
      );
      await refreshBalance();
      return transaction;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Transaction failed');
    }
  };

  return {
    ...walletState,
    balance,
    loading,
    error,
    refreshBalance,
    sendTransaction,
  };
}

const useWalletBalance = () => {
  const { publicKey, connected } = useContext(WalletContext);
  const [walletState, setWalletState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
    address: '',
    balance: '0',
    isLoading: true,
    error: null,
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<any[]>([]); // Add tokens state

  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const refreshBalance = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
      // Fetch tokens here if needed and setTokens
    } catch (err) {
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      refreshBalance();
    }
  }, [connected, publicKey]);

  const sendTransaction = async (toAddress: string, amount: number) => {
    if (!publicKey) throw new Error('Wallet not initialized');

    try {
      const transaction = await connection.requestAirdrop(
        new PublicKey(toAddress),
        amount * LAMPORTS_PER_SOL
      );
      await refreshBalance();
      return transaction;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Transaction failed');
    }
  };

  return {
    balance,
    loading,
    error,
    refreshBalance,
    sendTransaction,
    tokens, // Return tokens
  };
};

export default useWalletBalance;
export { useWalletBalance };