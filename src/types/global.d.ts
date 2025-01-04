// src/types/global.d.ts

declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SOLANA_NETWORK: 'mainnet' | 'devnet' | 'local'
      NEXT_PUBLIC_LOCAL_RPC_URL: string
      NEXT_PUBLIC_DEVNET_RPC_URL: string
      NEXT_PUBLIC_MAINNET_RPC_URL: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
  
declare global {
  // Generic API Response type
  type ApiResponse<T = unknown> = {
    success: boolean;
    data: T;
    error?: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  };

  // Common Error type
  interface AppError extends Error {
    code?: string;
    details?: Record<string, unknown>;
  }

  // Generic Record type for unknown values
  type UnknownRecord = Record<string, unknown>;

  // Common callback types
  type VoidCallback = () => void;
  type AsyncVoidCallback = () => Promise<void>;
  type ErrorCallback = (error: AppError) => void;

  // Transaction types
  type Transaction = {
    signature: string;
    timestamp: number;
    type: 'send' | 'receive' | 'swap';
    amount: number;
    status: 'success' | 'pending' | 'error';
    to?: string;
    from?: string;
  };

  type MarketData = {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
  };

  interface WalletState {
    publicKey: string | null;
    balance: string | null;
    connecting: boolean;
    connected: boolean;
    error: string | null;
    transactionHistory?: Transaction[];
  }
}

export {};