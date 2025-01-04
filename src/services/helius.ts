// src/services/helius.ts
import { config } from '@/config/env';
import { ErrorHandler } from '@/lib/utils/error-handling';
import { WALLET_CONSTANTS } from '@/config/constants';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: Date;
}

interface TokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface AccountInfo {
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
}

class HeliusService {
  private static instance: HeliusService;
  private priceCache: Map<string, PriceData>;
  private metadataCache: Map<string, TokenMetadata>;
  private lastPriceUpdate: Date;

  private constructor() {
    this.priceCache = new Map();
    this.metadataCache = new Map();
    this.lastPriceUpdate = new Date();
  }

  public static getInstance(): HeliusService {
    if (!HeliusService.instance) {
      HeliusService.instance = new HeliusService();
    }
    return HeliusService.instance;
  }

  private getApiUrl(): string {
    return config.NEXT_PUBLIC_HELIUS_API_URL;
  }

  private getApiKey(): string {
    return config.NEXT_PUBLIC_HELIUS_API_KEY;
  }

  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    try {
      const response = await fetch(`${this.getApiUrl()}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getApiKey()}`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw ErrorHandler.createError(500, 'NETWORK_ERROR', 'Failed to fetch data from Helius');
    }
  }

  private async refreshPriceData(): Promise<void> {
    const now = new Date();
    if (now.getTime() - this.lastPriceUpdate.getTime() < WALLET_CONSTANTS.INTERVALS.PRICE_UPDATE) {
      return;
    }

    try {
      const response = await this.makeRequest<any>('/token-prices');
      
      for (const [mint, data] of Object.entries(response)) {
        const priceData = data as PriceData;
        this.priceCache.set(mint, {
          symbol: priceData.symbol,
          price: priceData.price,
          change24h: priceData.change24h,
          volume24h: priceData.volume24h,
          lastUpdated: now
        });
      }

      this.lastPriceUpdate = now;
    } catch (error) {
      console.error('Failed to refresh price data:', error);
    }
  }

  // Public API Methods

  public async getTokenPrice(mint: string): Promise<PriceData> {
    await this.refreshPriceData();
    const priceData = this.priceCache.get(mint);
    
    if (!priceData) {
      throw ErrorHandler.createError(400, 'VALIDATION_ERROR', 'Token price data not found');
    }

    return priceData;
  }

  public async getTokenMetadata(mint: string): Promise<TokenMetadata> {
    if (this.metadataCache.has(mint)) {
      return this.metadataCache.get(mint)!;
    }

    const metadata = await this.makeRequest<TokenMetadata>(`/tokens/${mint}`);
    this.metadataCache.set(mint, metadata);
    return metadata;
  }

  public async getAccountInfo(address: string): Promise<AccountInfo> {
    const response = await this.makeRequest<any>('/rpc', 'POST', {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [address, { encoding: 'jsonParsed' }]
    });

    return response.result?.value || null;
  }

  public async getTokenBalances(walletAddress: string) {
    const response = await this.makeRequest<any>(`/balances/${walletAddress}`);
    
    // Enrich with price data
    const enrichedBalances = await Promise.all(
      response.tokens.map(async (token: any) => {
        try {
          const priceData = await this.getTokenPrice(token.mint);
          const metadata = await this.getTokenMetadata(token.mint);
          
          return {
            ...token,
            ...metadata,
            usdValue: token.amount * priceData.price,
            priceData
          };
        } catch {
          return token;
        }
      })
    );

    return enrichedBalances;
  }

  public async getNFTs(walletAddress: string) {
    return this.makeRequest<any>(`/nfts/${walletAddress}`);
  }

  public async getTransactionHistory(walletAddress: string, limit: number = 50) {
    return this.makeRequest<any>(`/transactions/${walletAddress}?limit=${limit}`);
  }

  public async subscribeToPriceUpdates(
    mints: string[],
    callback: (prices: Map<string, PriceData>) => void
  ) {
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(`wss://api.helius.xyz/v0/ws?api-key=${this.getApiKey()}`);

      ws.onopen = () => {
        ws?.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'priceSubscribe',
          params: { mints }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'priceNotification') {
          const prices = new Map<string, PriceData>();
          for (const [mint, priceData] of Object.entries(data.params)) {
            prices.set(mint, {
              ...priceData as PriceData,
              lastUpdated: new Date()
            });
          }
          callback(prices);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws?.close();
      };

      return () => {
        ws?.close();
      };
    } catch (error) {
      console.error('Failed to setup WebSocket connection:', error);
      throw ErrorHandler.createError(500, 'NETWORK_ERROR', 'Failed to setup price updates');
    }
  }

  public async getMarketData() {
    return this.makeRequest<any>('/market-data');
  }

  public clearCache() {
    this.priceCache.clear();
    this.metadataCache.clear();
    this.lastPriceUpdate = new Date(0);
  }
}

// Export singleton instance
export const heliusService = HeliusService.getInstance();

// Example usage:
/*
// Get token price
const solPrice = await heliusService.getTokenPrice(WALLET_CONSTANTS.TOKENS.WSOL_MINT);

// Get token balances
const balances = await heliusService.getTokenBalances('wallet-address');

// Subscribe to price updates
const unsubscribe = await heliusService.subscribeToPriceUpdates(
  [WALLET_CONSTANTS.TOKENS.WSOL_MINT],
  (prices) => {
    console.log('Updated prices:', prices);
  }
);

// Later: unsubscribe
unsubscribe();
*/