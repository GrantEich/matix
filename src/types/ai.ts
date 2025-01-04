import { TransactionData } from "./transaction";
import { WalletState } from "./wallet";

export interface AIAgentContext {
    walletState: WalletState;
    transactionHistory?: TransactionData[];
    marketData?: MarketData;
    userPreferences?: UserPreferences;
  }
  
  export interface AIAnalysisResponse {
    content: string;
    confidence: number;
    suggestion?: {
      type: 'approve' | 'reject' | 'warning' | 'advice';
      reason: string;
      action?: string;
    };
    analysis?: {
      riskScore: number;
      sentiment: 'positive' | 'neutral' | 'negative';
      factors: string[];
    };
  }
  
  export interface AITransactionAnalysis extends AIAnalysisResponse {
    transactionRisk: number;
    suggestedActions?: string[];
    alternatives?: Array<{
      action: string;
      reason: string;
      priority: number;
    }>;
  }
  
  export interface UserPreferences {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentStyle: 'conservative' | 'moderate' | 'aggressive';
    communicationStyle: 'technical' | 'simple' | 'friendly';
    notificationPreferences: {
      priceAlerts: boolean;
      transactionAlerts: boolean;
      marketUpdates: boolean;
    };
  }
  
  export interface MarketData {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    supply: {
      total: number;
      circulating: number;
    };
    sentiment: {
      score: number;
      trend: 'bullish' | 'bearish' | 'neutral';
    };
  }
  