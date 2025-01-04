// src/types/wallet.ts
import { PublicKey } from '@solana/web3.js';

export interface WalletResponse {
    address: string;
    type: string;
    status: string;
  }
  
  export interface BalanceResponse {
    balance: string;
    currency: string;
  }
  
  export interface TransactionResponse {
    id: string;
    amount: string;
    fromAddress: string;
    toAddress: string;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
    signature?: string;
  }
  
  export interface WalletState {
    publicKey: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    address: string;
    balance: string;
    error: string | null;
    isLoading: boolean;
  }

  export interface Transaction {
    signature: string;
    timestamp: number;
    type: 'send' | 'receive' | 'swap';
    amount: number;
    status: 'success' | 'pending' | 'error';
    to?: string;
    from?: string;
  }

  export interface TokenBalance {
    mint: string;
    symbol: string;
    decimals: number;
    amount: string;
    uiAmount: number;
    usdValue?: number;
    priceData?: {
      change24h: number;
      price: number;
      lastUpdated: number;
    };
    logoURI?: string;
    name?: string;
  }
  
  export interface WalletBalance {
    amount: string;
    usdValue?: number;
  }