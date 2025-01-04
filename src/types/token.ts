// src/types/token.ts
import { PublicKey } from '@solana/web3.js';

export interface SplTokenAccount {
  mint: string;
  amount: number;
  address?: string;
  owner?: string;
  state?: 'initialized' | 'frozen';
  delegateAmount?: number;
  closeAuthority?: string;
  isNative?: boolean;
}

export interface TokenAccountDetails extends SplTokenAccount {
  delegated_amount: number;
  frozen: boolean;
  owner: string;
}

export interface ReclaimModalProps {
  open: boolean;
  onClose: () => void;
  tokenAccount: SplTokenAccount;
}

export interface TokenAccountState {
  mint: PublicKey;
  owner: PublicKey;
  amount: bigint;
  delegateOption: number;
  delegate: PublicKey | null;
  state: number;
  isNativeOption: number;
  isNative: bigint;
  delegatedAmount: bigint;
  closeAuthorityOption: number;
  closeAuthority: PublicKey | null;
}

export interface ParsedTokenAccountData {
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
          };
          delegate?: string;
          state: string;
          isNative: boolean;
          delegation?: {
            delegate: string;
            amount: string;
          };
          closeAuthority?: string;
        };
        type: string;
      };
      program: string;
      space: number;
    };
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
  pubkey: PublicKey;
}