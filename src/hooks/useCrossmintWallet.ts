// src/hooks/useCrossmintWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { CrossmintWallet } from '@/lib/wallet/crossmint';
import { TransactionManager } from '@/lib/wallet/transactions';
import { ErrorHandler } from '@/lib/utils/error-handling';
import { TransactionReceipt } from '@/lib/wallet/transactions';
import { WALLET_CONSTANTS } from '@/config/constants';
import { useAIAgent } from '@/hooks/useAIAgent';

interface WalletBalance {
  currency: string;
  amount: string;
  usdValue?: number;
}

interface TokenBalance extends WalletBalance {
  tokenAddress: string;
  symbol: string;
  decimals: number;
}

interface TransactionOptions {
  slippage?: number;
  priority?: 'low' | 'medium' | 'high';
  memo?: string;
}

interface UseCrossmintWalletReturn {
  // Wallet State
  address: string | null;
  balance: WalletBalance | null;
  tokenBalances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  initializeWallet: (config?: { linkedUser?: string }) => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: number, options?: TransactionOptions) => Promise<TransactionReceipt>;
  getTransactionHistory: (limit?: number) => Promise<any[]>;

  // Status
  isProcessing: boolean;
  pendingTransactions: Map<string, any>;
}

export function useCrossmintWallet(): UseCrossmintWalletReturn {
  // State management
  const [wallet, setWallet] = useState<CrossmintWallet | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<Map<string, any>>(new Map());

  // Initialize AI agent for transaction analysis
  const { analyzeTransaction } = useAIAgent({
    balance: balance?.amount || '0',
    address: address || '',
    isLoading,
    error
  });

  // Initialize wallet
  const initializeWallet = useCallback(async (config?: { linkedUser?: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const newWallet = await CrossmintWallet.create(config);
      setWallet(newWallet);
      setAddress(newWallet.getAddress());
      setIsInitialized(true);

      // Fetch initial balances
      await refreshBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!wallet) return;

    try {
      setIsLoading(true);
      const newBalance = await wallet.getBalance(true);
      setBalance(newBalance);

      // Fetch token balances
      const tokens = await wallet.getTokenBalances();
      setTokenBalances(tokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  // Auto-refresh balance at intervals
  useEffect(() => {
    if (!wallet) return;

    const intervalId = setInterval(refreshBalance, WALLET_CONSTANTS.INTERVALS.BALANCE_REFRESH);
    return () => clearInterval(intervalId);
  }, [wallet, refreshBalance]);

  // Send transaction
  const sendTransaction = useCallback(async (
    to: string,
    amount: number,
    options?: TransactionOptions
  ) => {
    if (!wallet || !address) {
      throw new Error('Wallet not initialized');
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Analyze transaction with AI
      const analysis = await analyzeTransaction(amount, to, options?.memo);
      if (analysis.suggestion?.type === 'warning') {
        throw new Error(`AI Warning: ${analysis.content}`);
      }

      // Create transaction manager
      const txManager = new TransactionManager(address);

      // Send transaction
      const receipt = await txManager.sendTransaction(to, amount, options);

      // Update pending transactions
      setPendingTransactions(prev => new Map(prev.set(receipt.signature, {
        status: 'pending',
        timestamp: receipt.timestamp,
        amount,
        to
      })));

      // Refresh balance after transaction
      await refreshBalance();

      return receipt;
    } catch (err) {
      throw ErrorHandler.createError(
        500,
        'TRANSACTION_FAILED',
        err instanceof Error ? err.message : 'Transaction failed'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [wallet, address, analyzeTransaction, refreshBalance]);

  // Get transaction history
  const getTransactionHistory = useCallback(async (limit?: number) => {
    if (!wallet || !address) {
      throw new Error('Wallet not initialized');
    }

    try {
      const txManager = new TransactionManager(address);
      return await txManager.getTransactionHistory(limit);
    } catch (err) {
      throw ErrorHandler.createError(
        500,
        'NETWORK_ERROR',
        'Failed to fetch transaction history'
      );
    }
  }, [wallet, address]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setWallet(null);
      setAddress(null);
      setBalance(null);
      setTokenBalances([]);
      setIsInitialized(false);
    };
  }, []);

  return {
    // Wallet State
    address,
    balance,
    tokenBalances,
    isLoading,
    error,
    isInitialized,

    // Actions
    initializeWallet,
    refreshBalance,
    sendTransaction,
    getTransactionHistory,

    // Status
    isProcessing,
    pendingTransactions
  };
}