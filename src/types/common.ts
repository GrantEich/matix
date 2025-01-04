// src/types/common.ts

export interface BaseResponse<T> {
    success: boolean;
    data: T;
    error?: {
      code: string;
      message: string;
    };
  }
  
  export interface TransactionResult {
    signature: string;
    status: 'success' | 'error' | 'pending';
    error?: Error;
  }
  
  export interface TokenData {
    mint: string;
    symbol: string;
    decimals: number;
    amount: string;
    uiAmount: number;
    usdValue?: number;
  }
  
  export interface ErrorWithCode extends Error {
    code?: string;
    data?: unknown;
  }
  
  export type AsyncActionResult<T> = Promise<{
    success: boolean;
    data?: T;
    error?: ErrorWithCode;
  }>;
  
  export interface APIErrorResponse {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }
  
  export type RequestConfig = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean>;
  };