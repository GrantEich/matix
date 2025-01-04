// src/utils/environment.ts

export enum Environment {
  LOCAL = 'local',
  DEVNET = 'devnet',
  MAINNET = 'mainnet',
}

export function getEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  switch (env) {
    case 'local':
      return Environment.LOCAL;
    case 'mainnet':
      return Environment.MAINNET;
    default:
      return Environment.DEVNET;
  }
}

export function getRpcUrl(): string {
  const env = getEnvironment();
  switch (env) {
    case Environment.LOCAL:
      return process.env.NEXT_PUBLIC_LOCAL_RPC_URL || 'http://localhost:8899';
    case Environment.DEVNET:
      return process.env.NEXT_PUBLIC_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
    case Environment.MAINNET:
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
  }
}

export function getExplorerUrl(txId: string): string {
  const env = getEnvironment();
  const baseUrl = 'https://explorer.solana.com';
  const cluster = env === Environment.MAINNET ? '' : `?cluster=${env}`;
  return `${baseUrl}/tx/${txId}${cluster}`;
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}