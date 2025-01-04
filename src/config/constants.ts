// src/config/constants.ts
export const WALLET_CONSTANTS = {
    // Network configurations
    NETWORKS: {
      MAINNET: 'mainnet-beta',
      TESTNET: 'testnet',
      DEVNET: 'devnet'
    },
    
    // Transaction limits
    TRANSACTION: {
      MIN_SOL_AMOUNT: 0.000001,
      MAX_SOL_AMOUNT: 100000,
      DEFAULT_SLIPPAGE: 0.5,
      GAS_ADJUSTMENT: 1.4,
      DEFAULT_TIMEOUT: 60000, // 1 minute
      MAX_RETRIES: 3
    },
  
    // Time intervals
    INTERVALS: {
      PRICE_UPDATE: 30000, // 30 seconds
      TRANSACTION_POLLING: 2000, // 2 seconds
      BALANCE_REFRESH: 10000, // 10 seconds
      MARKET_DATA_REFRESH: 60000 // 1 minute
    },
  
    // AI configurations
    AI: {
      MIN_CONFIDENCE_THRESHOLD: 0.7,
      MAX_RESPONSE_TIME: 5000,
      ANALYSIS_MODES: {
        QUICK: 'quick',
        DETAILED: 'detailed',
        RISK_FOCUSED: 'risk-focused'
      },
      PERSONALITY_TYPES: {
        PROFESSIONAL: 'professional',
        FRIENDLY: 'friendly',
        TECHNICAL: 'technical'
      }
    },
  
    // Token related
    TOKENS: {
      WSOL_MINT: 'So11111111111111111111111111111111111111112',
      USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      USDT_MINT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    },
  
    // UI related
    UI: {
      THEME: {
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system'
      },
      ANIMATION_DURATION: 200,
      MAX_ITEMS_PER_PAGE: 20,
      BREAKPOINTS: {
        SM: '640px',
        MD: '768px',
        LG: '1024px',
        XL: '1280px'
      }
    },
  
    // Error codes
    ERROR_CODES: {
      INSUFFICIENT_BALANCE: 'E001',
      INVALID_ADDRESS: 'E002',
      TRANSACTION_FAILED: 'E003',
      NETWORK_ERROR: 'E004',
      TIMEOUT: 'E005'
    }
  } as const;
  
  // src/config/env.ts
  interface EnvironmentConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    NETWORK: 'mainnet-beta' | 'testnet' | 'devnet';
    API_URLS: {
      CROSSMINT: string;
      JUPITER: string;
      HELIUS: string;
    };
    API_KEYS: {
      CROSSMINT?: string;
      JUPITER?: string;
      HELIUS?: string;
    };
    FEATURES: {
      AI_ENABLED: boolean;
      NFT_ENABLED: boolean;
      SWAP_ENABLED: boolean;
      STAKING_ENABLED: boolean;
    };
  }
  
  class Environment {
    private static instance: Environment;
    private config: EnvironmentConfig;
  
    private constructor() {
      this.config = this.loadConfig();
    }
  
    public static getInstance(): Environment {
      if (!Environment.instance) {
        Environment.instance = new Environment();
      }
      return Environment.instance;
    }
  
    private loadConfig(): EnvironmentConfig {
      return {
        NODE_ENV: (process.env.NEXT_PUBLIC_NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
        NETWORK: (process.env.NEXT_PUBLIC_SOLANA_NETWORK as EnvironmentConfig['NETWORK']) || 'devnet',
        API_URLS: {
          CROSSMINT: process.env.NEXT_PUBLIC_CROSSMINT_API_URL || 'https://staging.crossmint.com/api/v1-alpha2',
          JUPITER: process.env.NEXT_PUBLIC_JUPITER_API_URL || 'https://price.jup.ag/v4',
          HELIUS: process.env.NEXT_PUBLIC_HELIUS_API_URL || 'https://api.helius.xyz/v0'
        },
        API_KEYS: {
          CROSSMINT: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY,
          JUPITER: process.env.NEXT_PUBLIC_JUPITER_API_KEY,
          HELIUS: process.env.NEXT_PUBLIC_HELIUS_API_KEY
        },
        FEATURES: {
          AI_ENABLED: process.env.NEXT_PUBLIC_FEATURE_AI === 'true',
          NFT_ENABLED: process.env.NEXT_PUBLIC_FEATURE_NFT === 'true',
          SWAP_ENABLED: process.env.NEXT_PUBLIC_FEATURE_SWAP === 'true',
          STAKING_ENABLED: process.env.NEXT_PUBLIC_FEATURE_STAKING === 'true'
        }
      };
    }
  
    public getConfig(): EnvironmentConfig {
      return this.config;
    }
  
    public isProduction(): boolean {
      return this.config.NODE_ENV === 'production';
    }
  
    public isDevelopment(): boolean {
      return this.config.NODE_ENV === 'development';
    }
  
    public isTestnet(): boolean {
      return this.config.NETWORK !== 'mainnet-beta';
    }
  
    public getApiUrl(service: keyof EnvironmentConfig['API_URLS']): string {
      return this.config.API_URLS[service];
    }
  
    public getApiKey(service: keyof EnvironmentConfig['API_KEYS']): string | undefined {
      return this.config.API_KEYS[service];
    }
  
    public isFeatureEnabled(feature: keyof EnvironmentConfig['FEATURES']): boolean {
      return this.config.FEATURES[feature];
    }
  
    public validateConfig(): string[] {
      const errors: string[] = [];
  
      // Required API keys in production
      if (this.isProduction()) {
        if (!this.config.API_KEYS.CROSSMINT) {
          errors.push('Missing Crossmint API key in production');
        }
        if (!this.config.API_KEYS.HELIUS) {
          errors.push('Missing Helius API key in production');
        }
      }
  
      // Required API URLs
      Object.entries(this.config.API_URLS).forEach(([key, url]) => {
        if (!url) {
          errors.push(`Missing ${key} API URL`);
        }
      });
  
      return errors;
    }
  }
  
  // Export singleton instance
  export const env = Environment.getInstance();
  
  // Example usage:
  /*
  // Get environment configuration
  const config = env.getConfig();
  
  // Check environment
  if (env.isProduction()) {
    // Production-specific code
  }
  
  // Get API URLs
  const crossmintUrl = env.getApiUrl('CROSSMINT');
  
  // Check feature flags
  if (env.isFeatureEnabled('AI_ENABLED')) {
    // AI-specific code
  }
  
  // Validate configuration
  const configErrors = env.validateConfig();
  if (configErrors.length > 0) {
    console.error('Configuration errors:', configErrors);
  }
  */