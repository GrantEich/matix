export interface WalletState {
    address: string | null;
    balance: string;
    isLoading: boolean;
    error: string | null;
    network: 'mainnet-beta' | 'testnet' | 'devnet';
  }
  
  export interface WalletBalance {
    currency: string;
    amount: string;
    usdValue?: number;
    lastUpdated: Date;
  }
  
  export interface TokenBalance extends WalletBalance {
    mint: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    priceData?: {
      price: number;
      change24h: number;
      volume24h: number;
    };
  }
  
  export interface TransactionData {
    signature: string;
    type: 'incoming' | 'outgoing';
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: Date;
    from: string;
    to: string;
    amount: string;
    currency: string;
    fee?: string;
    memo?: string;
    confirmations: number;
    blockHeight?: number;
  }
  
  export interface TransactionOptions {
    slippage?: number;
    priority?: 'low' | 'medium' | 'high';
    memo?: string;
    aiAnalysis?: boolean;
    maxFee?: number;
  }
  
  export interface TransactionReceipt {
    signature: string;
    status: TransactionData['status'];
    confirmations: number;
    fee: string;
    blockHeight?: number;
    timestamp: Date;
    error?: string;
  }
  
  export interface WalletConfig {
    network: WalletState['network'];
    linkedUser?: string;
    labels?: string[];
    features?: {
      ai?: boolean;
      nft?: boolean;
      swap?: boolean;
      staking?: boolean;
    };
  }
  
  export interface NFTData {
    mint: string;
    name: string;
    symbol: string;
    description?: string;
    image: string;
    collection?: {
      name: string;
      family: string;
    };
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
    lastSalePrice?: number;
    rarity?: number;
  }
  
  export interface SwapData {
    inputToken: TokenBalance;
    outputToken: TokenBalance;
    amount: string;
    expectedOutput: string;
    priceImpact: number;
    route: Array<{
      protocol: string;
      fromToken: string;
      toToken: string;
      percentage: number;
    }>;
    fee: {
      amount: string;
      currency: string;
    };
  }
  
  export interface WalletError extends Error {
    code: string;
    details?: any;
    suggestion?: string;
  }
  
  export type WalletEvent = 
    | { type: 'BALANCE_UPDATE'; payload: WalletBalance }
    | { type: 'TRANSACTION_PENDING'; payload: TransactionData }
    | { type: 'TRANSACTION_CONFIRMED'; payload: TransactionData }
    | { type: 'TRANSACTION_FAILED'; payload: TransactionData }
    | { type: 'TOKEN_BALANCE_UPDATE'; payload: TokenBalance }
    | { type: 'NFT_UPDATE'; payload: NFTData }
    | { type: 'ERROR'; payload: WalletError }
    | { type: 'NETWORK_CHANGE'; payload: WalletState['network'] };
  
  export interface WalletEventListener {
    onEvent: (event: WalletEvent) => void;
    eventTypes?: Array<WalletEvent['type']>;
  }