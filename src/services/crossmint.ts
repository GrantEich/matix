// src/services/crossmint.ts
import { WalletResponse, BalanceResponse, TransactionResponse } from '@/types/wallet';

const CROSSMINT_API_URL = 'https://staging.crossmint.com/api/v1-alpha2';

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  error?: string;
}

interface MintTokenParams {
  decimals: number;
  authority: string;
}

interface MintTokenResponse {
  address: string;
}

class CrossmintService {
  mintToken(arg0: { decimals: number; authority: string; }) {
    throw new Error('Method not implemented.');
  }
  private apiKey: string;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY;
    if (!apiKey) {
      throw new Error('CROSSMINT_API_KEY is not defined in environment variables');
    }
    this.apiKey = apiKey;
  }

  async getTransactions(walletAddress: string): Promise<Transaction[]> {
    const response = await this.fetchApi<TransactionResponse[]>(`/wallets/${walletAddress}/transactions`);
    return response.map(tx => ({
      id: tx.id,
      type: tx.fromAddress === walletAddress ? 'outgoing' : 'incoming',
      amount: tx.amount,
      from: tx.fromAddress,
      to: tx.toAddress,
      timestamp: new Date(tx.timestamp),
      status: tx.status,
      signature: tx.signature,
    }));
  }

  async getTransactionStatus(txId: string): Promise<string> {
    const response = await this.fetchApi<{ status: string }>(`/transactions/${txId}/status`);
    return response.status;
  }

  async createMint(params: MintTokenParams): Promise<MintTokenResponse> {
    const response = await this.fetchApi<MintTokenResponse>('/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });
    return response;
  }

  private async fetchApi<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${CROSSMINT_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  }

  async createWallet(): Promise<WalletResponse> {
    return this.fetchApi<WalletResponse>('/wallets', {
      method: 'POST',
      body: JSON.stringify({
        type: 'solana-custodial-wallet',
      }),
    });
  }

  async getBalance(walletAddress: string): Promise<BalanceResponse> {
    return this.fetchApi<BalanceResponse>(
      `/wallets/${walletAddress}/balances?currency=sol`
    );
  }

  async sendTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<TransactionResponse> {
    return this.fetchApi<TransactionResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        from: fromAddress,
        to: toAddress,
        amount: amount.toString(),
        currency: 'sol',
      }),
    });
  }
}

export const crossmintService = new CrossmintService();