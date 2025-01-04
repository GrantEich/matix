// src/lib/wallet/transactions.ts
import { apiService } from '@/services/api';
import { ErrorHandler } from '@/lib/utils/error-handling';
import { WALLET_CONSTANTS } from '@/config/constants';
import { formatUtils } from '@/lib/utils/format';
import { WalletError } from '@/lib/utils/error-handling';
import {TRANSACTION_CONSTANTS} from '@/lib/utils/constants';
interface TransactionOptions {
  slippage?: number;
  priority?: 'low' | 'medium' | 'high';
  memo?: string;
}

interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  error?: string;
  signature?: string;
}

export interface TransactionReceipt {
  signature: string;
  timestamp: number;
  fee: number;
  status: TransactionStatus['status'];
}

interface TransactionResponse {
  data: {
    signature: string;
    fee: number;
    status: TransactionStatus['status'];
  };
}

interface BalanceResponse {
  data: {
    amount: string;
    currency: string;
  };
}

interface TransactionHistoryResponse {
  data: {
    transactions: Array<{
      signature: string;
      timestamp: number;
      fee: number;
      status: TransactionStatus['status'];
    }>;
  };
}

interface FeeResponse {
  data: {
    estimatedFee: number;
  };
}

interface TransactionMapItem {
  signature: string;
  timestamp: number;
  fee: number;
  status: TransactionStatus['status'];
}

export class TransactionManager {
  private wallet: string;
  private pendingTransactions: Map<string, TransactionStatus>;
  private statusPollingIntervals: Map<string, NodeJS.Timeout>;

  constructor(walletAddress: string) {
    this.wallet = walletAddress;
    this.pendingTransactions = new Map();
    this.statusPollingIntervals = new Map();
  }

  public async sendTransaction(
    to: string,
    amount: number,
    options: TransactionOptions = {}
  ): Promise<TransactionReceipt> {
    try {
      await this.validateTransaction(to, amount);
      const priorityFee = await this.calculatePriorityFee(options.priority);

      const response = await apiService.sendRequest<TransactionResponse>({
        method: 'POST',
        path: '/transactions',
        body: {
          from: this.wallet,
          to,
          amount: amount.toString(),
          slippage: options.slippage || WALLET_CONSTANTS.TRANSACTION.DEFAULT_SLIPPAGE,
          priorityFee,
          memo: options.memo
        }
      });

      this.monitorTransaction(response.data.signature);

      return {
        signature: response.data.signature,
        timestamp: Date.now(),
        fee: response.data.fee,
        status: 'pending'
      };
    } catch (error) {
      throw ErrorHandler.createError(500, 'TRANSACTION_FAILED', 'Failed to send transaction');
    }
  }

  private async validateTransaction(to: string, amount: number): Promise<void> {
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(to)) {
      throw ErrorHandler.createError(400, 'VALIDATION_ERROR', 'Invalid recipient address');
    }

    if (amount <= 0 || amount > WALLET_CONSTANTS.TRANSACTION.MAX_SOL_AMOUNT) {
      throw ErrorHandler.createError(400, 'VALIDATION_ERROR', 'Invalid transaction amount');
    }

    try {
      const response = await apiService.sendRequest<BalanceResponse>({
        method: 'GET',
        path: `/wallets/${this.wallet}/balance`
      });

      if (parseFloat(response.data.amount) < amount) {
        throw ErrorHandler.createError(402, 'INSUFFICIENT_BALANCE', 'Insufficient balance for transaction');
      }
    } catch (error) {
      throw ErrorHandler.createError(500, 'NETWORK_ERROR', 'Failed to check balance');
    }
  }

  private async calculatePriorityFee(priority: TransactionOptions['priority'] = 'medium'): Promise<number> {
    try {
      const response = await apiService.sendRequest<FeeResponse>({
        method: 'GET',
        path: '/fees/estimate'
      });

      const multipliers = {
        low: 1,
        medium: 1.5,
        high: 2
      };
      return response.data.estimatedFee * multipliers[priority];
    } catch (error) {
      return 5000; // Fallback value if constant is missing
    }
  }

  private monitorTransaction(signature: string): void {
    this.pendingTransactions.set(signature, {
      status: 'pending',
      confirmations: 0
    });

    const interval = setInterval(async () => {
      try {
        const status = await this.getTransactionStatus(signature);
        this.pendingTransactions.set(signature, status);

        if (status.status !== 'pending') {
          this.clearTransactionPolling(signature);
        }
      } catch (error) {
        console.error(`Error monitoring transaction ${signature}:`, error);
      }
    }, WALLET_CONSTANTS.INTERVALS.TRANSACTION_POLLING);

    this.statusPollingIntervals.set(signature, interval);

    setTimeout(() => {
      this.clearTransactionPolling(signature);
    }, WALLET_CONSTANTS.TRANSACTION.DEFAULT_TIMEOUT);
  }

  private clearTransactionPolling(signature: string): void {
    const interval = this.statusPollingIntervals.get(signature);
    if (interval) {
      clearInterval(interval);
      this.statusPollingIntervals.delete(signature);
    }
  }

  public async getTransactionStatus(signature: string): Promise<TransactionStatus> {
    try {
      const response = await apiService.sendRequest<TransactionResponse>({
        method: 'GET',
        path: `/transactions/${signature}`
      });

      return {
        status: response.data.status,
        confirmations: 1,
        signature
      };
    } catch (error) {
      throw ErrorHandler.createError(500, 'NETWORK_ERROR', 'Failed to check transaction status');
    }
  }

  public async getTransactionHistory(limit?: number): Promise<TransactionReceipt[]> {
    try {
      const response = await apiService.sendRequest<TransactionHistoryResponse>({
        method: 'GET',
        path: `/wallets/${this.wallet}/transactions`,
        body: { limit }
      });

      return response.data.transactions.map((tx: TransactionMapItem) => ({
        signature: tx.signature,
        timestamp: tx.timestamp,
        fee: tx.fee,
        status: tx.status
      }));
    } catch (error) {
      throw ErrorHandler.createError(500, 'NETWORK_ERROR', 'Failed to fetch transaction history');
    }
  }

  public getPendingTransactions(): Map<string, TransactionStatus> {
    return new Map(this.pendingTransactions);
  }
}

export const createWalletTransaction = async (
  wallet: string,
  to: string,
  amount: number,
  options?: TransactionOptions
): Promise<TransactionReceipt> => {
  const manager = new TransactionManager(wallet);
  return manager.sendTransaction(to, amount, options);
};