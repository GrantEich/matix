// src/lib/ai/prompts.ts
import { WalletState } from '@/types/wallet';
import { formatUtils } from '@/lib/utils/format';

interface PromptContext {
  walletState?: WalletState;
  userPreferences?: {
    riskTolerance?: 'low' | 'medium' | 'high';
    investmentStyle?: 'conservative' | 'moderate' | 'aggressive';
    communicationStyle?: 'technical' | 'simple' | 'friendly';
  };
  marketData?: {
    solPrice?: number;
    marketTrend?: string;
    volatility?: number;
  };
}

interface PromptTemplate {
  template: string;
  required: string[];
  optional?: string[];
}

export class PromptsManager {
  private static readonly TEMPLATES: Record<string, PromptTemplate> = {
    // Transaction Analysis Prompts
    TRANSACTION_ANALYSIS: {
      template: `
        As a financial AI assistant, analyze this transaction:
        
        Transaction Details:
        - Amount: {amount} SOL (≈ ${formatUtils.formatUSD('{usdAmount}')}})
        - Recipient: {recipient}
        - Purpose: {purpose}
        - Current Balance: {balance} SOL
        
        Context:
        - Risk Tolerance: {riskTolerance}
        - Market Conditions: {marketTrend}
        - Volatility: {volatility}
        
        Provide:
        1. Risk Assessment (0-100)
        2. Transaction Safety Analysis
        3. Specific Recommendations
        4. Alternative Suggestions (if risky)
        
        Format your response with clear sections and include a RISK_SCORE: and RECOMMENDATION: prefix for key points.
      `,
      required: ['amount', 'recipient', 'balance'],
      optional: ['purpose', 'usdAmount', 'riskTolerance', 'marketTrend', 'volatility']
    },

    // Portfolio Analysis Prompts
    PORTFOLIO_ANALYSIS: {
      template: `
        Analyze this wallet's portfolio:

        Wallet Overview:
        - Total Balance: {balance} SOL
        - Token Holdings: {tokens}
        - NFT Holdings: {nfts}
        
        Market Context:
        - SOL Price: ${formatUtils.formatUSD('{solPrice}')}
        - Market Trend: {marketTrend}
        - Volatility Index: {volatility}
        
        User Profile:
        - Risk Tolerance: {riskTolerance}
        - Investment Style: {investmentStyle}
        
        Provide:
        1. Portfolio Health Score (0-100)
        2. Diversification Analysis
        3. Risk Exposure Assessment
        4. Optimization Recommendations
        5. Action Items (prioritized)
        
        Format your response with clear sections and include a HEALTH_SCORE: and ACTION_ITEMS: prefix for key points.
      `,
      required: ['balance', 'tokens', 'solPrice'],
      optional: ['nfts', 'marketTrend', 'volatility', 'riskTolerance', 'investmentStyle']
    },

    // Market Analysis Prompts
    MARKET_ANALYSIS: {
      template: `
        Provide market analysis for Solana:

        Current Market:
        - SOL Price: ${formatUtils.formatUSD('{solPrice}')}
        - 24h Change: {priceChange}%
        - Market Trend: {marketTrend}
        - Volatility: {volatility}
        
        Wallet Context:
        - Holdings: {balance} SOL
        - Average Entry: ${formatUtils.formatUSD('{avgEntry}')}
        
        Analyze:
        1. Market Sentiment
        2. Key Price Levels
        3. Risk Factors
        4. Trading Opportunities
        5. Position Management
        
        Format your response with clear sections and include a SENTIMENT: and OPPORTUNITY: prefix for key points.
      `,
      required: ['solPrice', 'marketTrend'],
      optional: ['priceChange', 'volatility', 'balance', 'avgEntry']
    },

    // AI Assistant Conversation Prompts
    GENERAL_ASSIST: {
      template: `
        You are a knowledgeable crypto wallet assistant.
        
        Wallet Context:
        - Balance: {balance} SOL
        - Connected Network: {network}
        - Communication Style: {communicationStyle}
        
        User Query: {query}
        
        Provide helpful, accurate information in a {communicationStyle} style.
        Focus on security and best practices while maintaining user-friendly explanations.
        Include specific steps or recommendations when applicable.
      `,
      required: ['query', 'balance', 'network'],
      optional: ['communicationStyle']
    },

    // Risk Assessment Prompts
    RISK_ASSESSMENT: {
      template: `
        Perform a risk assessment for this wallet:

        Wallet Activity:
        - Balance: {balance} SOL
        - Transaction Volume: {txVolume} SOL/day
        - Interaction Types: {interactions}
        - Connected dApps: {connectedApps}
        
        Security Context:
        - Network: {network}
        - Recent Suspicious Activity: {suspiciousActivity}
        
        Assess:
        1. Overall Risk Score (0-100)
        2. Security Vulnerabilities
        3. Behavioral Patterns
        4. Protection Recommendations
        
        Format your response with clear sections and include a RISK_SCORE: and SECURITY_ADVICE: prefix for key points.
      `,
      required: ['balance', 'network'],
      optional: ['txVolume', 'interactions', 'connectedApps', 'suspiciousActivity']
    },

    // Token Swap Analysis Prompts
    SWAP_ANALYSIS: {
      template: `
        Analyze this token swap:

        Swap Details:
        - From: {fromToken} ({fromAmount})
        - To: {toToken} ({toAmount})
        - Slippage: {slippage}%
        - Price Impact: {priceImpact}%
        
        Market Context:
        - Market Trend: {marketTrend}
        - Volatility: {volatility}
        
        Evaluate:
        1. Swap Efficiency
        2. Price Impact Analysis
        3. Timing Assessment
        4. Alternative Routes
        
        Format your response with clear sections and include a SWAP_SCORE: and RECOMMENDATION: prefix for key points.
      `,
      required: ['fromToken', 'toToken', 'fromAmount', 'toAmount'],
      optional: ['slippage', 'priceImpact', 'marketTrend', 'volatility']
    }
  };

  public static generatePrompt(
    templateKey: keyof typeof PromptsManager.TEMPLATES,
    context: Record<string, any>
  ): string {
    const template = this.TEMPLATES[templateKey];
    if (!template) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    // Validate required fields
    const missingFields = template.required.filter(field => !context.hasOwnProperty(field));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for ${templateKey}: ${missingFields.join(', ')}`);
    }

    // Replace template variables with context values
    let prompt = template.template;
    const allFields = [...template.required, ...(template.optional || [])];
    
    allFields.forEach(field => {
      const value = context[field] ?? '';
      prompt = prompt.replace(new RegExp(`{${field}}`, 'g'), value.toString());
    });

    return prompt.trim();
  }

  public static validateContext(context: PromptContext): boolean {
    return (
      context.walletState !== undefined &&
      typeof context.walletState.balance === 'string' &&
      typeof context.walletState.address === 'string'
    );
  }

  public static enrichContext(
    baseContext: PromptContext,
    additionalContext?: Partial<PromptContext>
  ): PromptContext {
    return {
      ...baseContext,
      ...additionalContext,
      userPreferences: {
        ...baseContext.userPreferences,
        ...additionalContext?.userPreferences
      },
      marketData: {
        ...baseContext.marketData,
        ...additionalContext?.marketData
      }
    };
  }
}

// Example usage:
/*
// Generate a transaction analysis prompt
const transactionPrompt = PromptsManager.generatePrompt('TRANSACTION_ANALYSIS', {
  amount: 1.5,
  recipient: 'Wallet123',
  balance: 10.0,
  purpose: 'Payment for services',
  usdAmount: 150,
  riskTolerance: 'medium',
  marketTrend: 'bullish',
  volatility: 'low'
});

// Generate a portfolio analysis prompt
const portfolioPrompt = PromptsManager.generatePrompt('PORTFOLIO_ANALYSIS', {
  balance: 100,
  tokens: ['SOL', 'USDC'],
  solPrice: 150,
  marketTrend: 'bullish',
  riskTolerance: 'medium',
  investmentStyle: 'moderate'
});
*/