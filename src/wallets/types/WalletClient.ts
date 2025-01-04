import { EventEmitter } from 'events';
import { Transaction as SolanaTransaction } from '@solana/web3.js';
import { AptosClient, Types as AptosTypes } from 'aptos';
type AptosTransaction = AptosTypes.Transaction;

export interface WalletClient extends EventEmitter {
  readonly chainId: string;
  readonly address: string | null;
  readonly connected: boolean;
  readonly connecting: boolean;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(message: string | Uint8Array): Promise<string>;
  signTransaction<T extends SolanaTransaction | AptosTransaction>(transaction: T): Promise<T>;
  sendTransaction<T extends SolanaTransaction | AptosTransaction>(transaction: T): Promise<string>;
}

export interface WalletPlugin<T = any> {
  readonly name: string;
  execute(client: WalletClient, params: T): Promise<any>;
}