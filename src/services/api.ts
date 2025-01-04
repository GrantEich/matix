// src/services/api.ts
import { ErrorHandler } from '@/lib/utils/error-handling';

export interface ApiRequestConfig<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: T;
  headers?: Record<string, string>;
  timeout?: number;
}

interface APIConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

class APIService {
  private static instance: APIService;
  private baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  private config: APIConfig;
  private controller: AbortController;

  private constructor() {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging.crossmint.com/api/v1-alpha2',
      apiKey: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || '',
      timeout: 30000, // 30 seconds default timeout
    };
    this.controller = new AbortController();
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  public async sendRequest<T>(config: ApiRequestConfig): Promise<T> {
    const response = await fetch(`${this.baseUrl}${config.path}`, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  private async request<T>(config: ApiRequestConfig): Promise<APIResponse<T>> {
    const { method, path, body, headers = {}, timeout = this.config.timeout } = config;

    // Create new abort controller for this request
    this.controller = new AbortController();
    const timeoutId = setTimeout(() => this.controller.abort(), timeout);

    try {
      const response = await fetch(`${this.config.baseURL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: this.controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleRequestError(error);
    }
  }

  private async handleErrorResponse(response: Response): Promise<Error> {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'Unknown error occurred' };
    }

    return ErrorHandler.createError(
      response.status,
      errorData.message,
      errorData.code
    );
  }

  private handleRequestError(error: any): Error {
    if (error.name === 'AbortError') {
      return ErrorHandler.createError(408, 'REQUEST_TIMEOUT', 'Request timed out');
    }
    return error;
  }

  // Wallet API endpoints
  public async createWallet(userId: string) {
    return this.request({
      method: 'POST',
      path: '/wallets',
      body: {
        type: 'solana-custodial-wallet',
        linkedUser: userId,
      },
    });
  }

  public async getWalletBalance(walletAddress: string) {
    return this.request({
      method: 'GET',
      path: `/wallets/${walletAddress}/balances`,
    });
  }

  // Transaction API endpoints
  public async sendTransaction(from: string, to: string, amount: number) {
    return this.request({
      method: 'POST',
      path: '/transactions',
      body: {
        from,
        to,
        amount: amount.toString(),
        currency: 'sol',
      },
    });
  }

  public async getTransactionStatus(txId: string) {
    return this.request({
      method: 'GET',
      path: `/transactions/${txId}`,
    });
  }

  public async getTransactionHistory(walletAddress: string) {
    return this.request({
      method: 'GET',
      path: `/wallets/${walletAddress}/transactions`,
    });
  }

  // Token API endpoints
  public async getTokenBalances(walletAddress: string) {
    return this.request({
      method: 'GET',
      path: `/wallets/${walletAddress}/tokens`,
    });
  }

  public async getTokenMetadata(tokenAddress: string) {
    return this.request({
      method: 'GET',
      path: `/tokens/${tokenAddress}`,
    });
  }

  // NFT API endpoints
  public async getNFTs(walletAddress: string) {
    return this.request({
      method: 'GET',
      path: `/wallets/${walletAddress}/nfts`,
    });
  }

  public async getNFTMetadata(nftAddress: string) {
    return this.request({
      method: 'GET',
      path: `/nfts/${nftAddress}`,
    });
  }

  // AI API endpoints
  public async getAIAnalysis(query: string, context: any) {
    return this.request({
      method: 'POST',
      path: '/ai/analyze',
      body: {
        query,
        context,
      },
    });
  }

  public async getMarketAnalysis(tokenAddress: string) {
    return this.request({
      method: 'GET',
      path: `/market/analysis/${tokenAddress}`,
    });
  }

  // Jupiter DEX API integration
  public async getSwapQuote(inputMint: string, outputMint: string, amount: number) {
    return this.request({
      method: 'GET',
      path: '/swap/quote',
      headers: {
        'X-Jupiter-Key': process.env.NEXT_PUBLIC_JUPITER_API_KEY || '',
      },
    });
  }

  // Helius RPC integration
  public async getAccountInfo(address: string) {
    return this.request({
      method: 'POST',
      path: '/rpc',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [address],
      },
      headers: {
        'X-Helius-Key': process.env.NEXT_PUBLIC_HELIUS_API_KEY || '',
      },
    });
  }
}

// Export singleton instance
export const apiService = APIService.getInstance();

// Example usage:
/*
try {
  // Create wallet
  const { data: wallet } = await apiService.createWallet('user123');
  
  // Get balance
  const { data: balance } = await apiService.getWalletBalance(wallet.address);
  
  // Send transaction
  const { data: tx } = await apiService.sendTransaction(
    wallet.address,
    'recipient-address',
    1.0
  );
  
  // Get NFTs
  const { data: nfts } = await apiService.getNFTs(wallet.address);
} catch (error) {
  const errorHandler = ErrorHandler.getInstance();
  const { message, action } = errorHandler.handleError(error);
  console.error(message, action);
}
*/