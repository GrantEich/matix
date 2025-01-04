// src/hooks/useAIAgent.ts
import { useState, useEffect } from 'react';
import { WalletAI, AIResponse } from '@/lib/ai/agent';

interface AIAgentHook {
  isThinking: boolean;
  lastResponse: AIResponse | null;
  askAI: (query: string) => Promise<AIResponse>;
  evaluateTransaction: (toAddress: string, amount: number, purpose?: string) => Promise<AIResponse>;
  analyzeTransaction: (amount: number, to: string, memo?: string) => Promise<{ suggestion: { type: string }, content: string }>;
  error: string | null;
}

export function useAIAgent(config: { balance: string; address: string; isLoading: boolean; error: string | null }): AIAgentHook {
  const [isThinking, setIsThinking] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update AI context when config changes
  useEffect(() => {
    WalletAI.updateContext(config);
  }, [config]);

  const askAI = async (query: string): Promise<AIResponse> => {
    setIsThinking(true);
    setError(null);
    
    try {
      const response = await WalletAI.ask(query);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
      setError(errorMessage);
      throw err;
    } finally {
      setIsThinking(false);
    }
  };

  const evaluateTransaction = async (
    toAddress: string,
    amount: number,
    purpose?: string
  ): Promise<AIResponse> => {
    setIsThinking(true);
    setError(null);

    try {
      const response = await WalletAI.evaluateTransaction(toAddress, amount, purpose);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to evaluate transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setIsThinking(false);
    }
  };

  const analyzeTransaction = async (amount: number, to: string, memo?: string) => {
    setIsThinking(true);
    setError(null);

    try {
      // Analyze transaction logic
      const response = await WalletAI.analyzeTransaction(amount, to, memo);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setIsThinking(false);
    }
  };

  return {
    isThinking,
    lastResponse,
    askAI,
    evaluateTransaction,
    analyzeTransaction,
    error
  };
}