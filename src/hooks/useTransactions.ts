// src/hooks/useTransactions.ts
import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';

interface TransactionInfo {
  signature: string;
  timestamp: Date;
  status: 'success' | 'error';
  errorMessage?: string;
  type?: string;
  amount?: number;
}

export const useTransactions = (walletAddress: string) => {
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseTransaction = (tx: ParsedTransactionWithMeta): TransactionInfo | null => {
    if (!tx.blockTime) return null;

    try {
      return {
        signature: tx.transaction.signatures[0],
        timestamp: new Date(tx.blockTime * 1000),
        status: tx.meta?.err ? 'error' : 'success',
        errorMessage: tx.meta?.err ? JSON.stringify(tx.meta.err) : undefined,
        // Add more transaction details here as needed
      };
    } catch (err) {
      console.error('Error parsing transaction:', err);
      return null;
    }
  };

  const fetchTransactions = useCallback(async () => {
    if (!walletAddress) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch recent signatures
      const signatures = await connection.getSignaturesForAddress(
        new PublicKey(walletAddress),
        { limit: 50 }
      );

      // Fetch transaction details
      const parsedTransactions = await Promise.all(
        signatures.map(async (sigInfo) => {
          try {
            const tx = await connection.getParsedTransaction(
              sigInfo.signature,
              { maxSupportedTransactionVersion: 0 }
            );
            return tx ? parseTransaction(tx) : null;
          } catch (err) {
            console.error('Error fetching transaction:', err);
            return null;
          }
        })
      );

      // Filter out null values and sort by timestamp
      const validTransactions = parsedTransactions
        .filter((tx): tx is TransactionInfo => tx !== null)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setTransactions(validTransactions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error in fetchTransactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connection, walletAddress]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const refetch = useCallback(() => {
    return fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refetch
  };
};