// src/lib/wallet/crossmint.ts
import { apiService, ApiRequestConfig } from '@/services/api';
import { ErrorHandler } from '@/lib/utils/error-handling';
import { WALLET_CONSTANTS } from '@/config/constants';

interface CrossmintWalletConfig {
  linkedUser?: string;
  type?: 'solana-custodial-wallet';
  labels?: string[];
}

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

interface WalletResponse {
  address: string;
  type: 'solana-custodial-wallet';
  status: string;
}

interface BalanceResponse {
  amount: string;
  currency: string;
  usdValue?: number;
}

interface TokenBalanceResponse {
  tokens: TokenBalance[];
}

export class CrossmintWallet {
  private address: string;
  private balances: Map<string, WalletBalance>;
  private lastBalanceUpdate: Date;

  constructor(address: string) {
    this.address = address;
    this.balances = new Map();
    this.lastBalanceUpdate = new Date(0);
  }

  public static async create(config?: CrossmintWalletConfig): Promise<CrossmintWallet> {
    try {
      const requestConfig: ApiRequestConfig = {
        method: 'POST',
        path: '/wallets',
        body: {
          type: config?.type || 'solana-custodial-wallet',
          linkedUser: config?.linkedUser,
          labels: config?.labels
        }
      };

      const response = await apiService.sendRequest<WalletResponse>(requestConfig);

      if (!response.address) {
        throw new Error('Invalid wallet response');
      }

      return new CrossmintWallet(response.address);
    } catch (error) {
      throw ErrorHandler.createError(500, 'WALLET_CREATION_FAILED', 'Failed to create wallet');
    }
  }

  public async getBalance(forceUpdate = false): Promise<WalletBalance> {
    const now = new Date();
    const shouldUpdate = forceUpdate || 
      (now.getTime() - this.lastBalanceUpdate.getTime() > WALLET_CONSTANTS.INTERVALS.BALANCE_REFRESH);

    if (shouldUpdate) {
      try {
        const requestConfig: ApiRequestConfig = {
          method: 'GET',
          path: `/wallets/${this.address}/balance`
        };

        const response = await apiService.sendRequest<BalanceResponse>(requestConfig);
        
        const balance: WalletBalance = {
          currency: response.currency,
          amount: response.amount,
          usdValue: response.usdValue
        };

        this.balances.set('SOL', balance);
        this.lastBalanceUpdate = now;
      } catch (error) {
        throw ErrorHandler.createError(500, 'BALANCE_FETCH_FAILED', 'Failed to fetch balance');
      }
    }

    return this.balances.get('SOL') || { currency: 'SOL', amount: '0' };
  }

  public async getTokenBalances(): Promise<TokenBalance[]> {
    try {
      const requestConfig: ApiRequestConfig = {
        method: 'GET',
        path: `/wallets/${this.address}/tokens`
      };

      const response = await apiService.sendRequest<TokenBalanceResponse>(requestConfig);
      
      return response.tokens.map(token => ({
        tokenAddress: token.tokenAddress,
        symbol: token.symbol,
        decimals: token.decimals,
        currency: token.currency,
        amount: token.amount,
        usdValue: token.usdValue
      }));
    } catch (error) {
      throw ErrorHandler.createError(500, 'TOKEN_BALANCE_FETCH_FAILED', 'Failed to fetch token balances');
    }
  }

  public getAddress(): string {
    return this.address;
  }

  public async validateAddress(address: string): Promise<boolean> {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
}