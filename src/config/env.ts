import { z } from 'zod';

// Environment variable schema definition
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),

  // Solana network configuration
  NEXT_PUBLIC_SOLANA_NETWORK: z.enum(['mainnet-beta', 'testnet', 'devnet']).default('devnet'),
  NEXT_PUBLIC_SOLANA_RPC_HOST: z.string(),

  // API endpoints
  NEXT_PUBLIC_CROSSMINT_API_URL: z.string().url().default('https://staging.crossmint.com/api/v1-alpha2'),
  NEXT_PUBLIC_JUPITER_API_URL: z.string().url().default('https://price.jup.ag/v4'),
  NEXT_PUBLIC_HELIUS_API_URL: z.string(),

  // API keys
  NEXT_PUBLIC_CROSSMINT_API_KEY: z.string(),
  NEXT_PUBLIC_JUPITER_API_KEY: z.string().optional(),
  NEXT_PUBLIC_HELIUS_API_KEY: z.string(),

  // Feature flags
  NEXT_PUBLIC_FEATURE_AI: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_FEATURE_NFT: z.enum(['true', 'false']).optional(),
});

// Load and validate environment variables
export const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', env.error.format());
  throw new Error('Invalid environment variables');
}

export const config = env.data;