// src/hooks/useSplTokenAccounts.ts
import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { SplTokenAccount, TokenAccount } from '@/utils/solana';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export function useSplTokenAccounts() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  const [splTokenAccounts, setSplTokenAccounts] = useState<SplTokenAccount[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenAccounts = useCallback(async () => {
    if (!publicKey) {
      setSplTokenAccounts([]);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      // Fetch all token accounts owned by the wallet
      const accounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_PROGRAM_ID
        }
      );

      // Process and filter accounts
      const tokenAccounts: SplTokenAccount[] = accounts.value
        .map(account => {
          const parsedInfo = account.account.data.parsed.info;
          return {
            address: account.pubkey.toString(),
            mint: parsedInfo.mint,
            amount: parsedInfo.tokenAmount.uiAmount,
            decimals: parsedInfo.tokenAmount.decimals,
            authority: parsedInfo.owner,
            // Additional data you might need
            isNative: parsedInfo.isNative,
            rentExemptReserve: parsedInfo.rentExemptReserve,
          };
        })
        // Filter out accounts with zero balance if needed
        .filter(account => account.amount > 0);

      setSplTokenAccounts(tokenAccounts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token accounts';
      setError(errorMessage);
      console.error('Error fetching token accounts:', err);
    } finally {
      setIsFetching(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchTokenAccounts();
  }, [fetchTokenAccounts]);

  const refetch = useCallback(() => {
    return fetchTokenAccounts();
  }, [fetchTokenAccounts]);

  return {
    splTokenAccounts,
    isFetching,
    error,
    refetch
  };
}

// Add types for token accounts
declare module '@/utils/solana' {
  export interface SplTokenAccount {
    address: string;
    mint: string;
    amount: number;
    decimals: number;
    authority: string;
    isNative?: boolean;
    rentExemptReserve?: string;
  }
}