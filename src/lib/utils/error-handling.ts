// src/lib/utils/error-handling.ts

// Custom error types
export class WalletError extends Error {
    public code: string;
    public severity: 'low' | 'medium' | 'high' | 'critical';
  
    constructor(message: string, code: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
      super(message);
      this.name = 'WalletError';
      this.code = code;
      this.severity = severity;
    }
  }
  
  export class TransactionError extends WalletError {
    public txId?: string;
    public rawError?: any;
  
    constructor(message: string, code: string, txId?: string, rawError?: any) {
      super(message, code, 'high');
      this.name = 'TransactionError';
      this.txId = txId;
      this.rawError = rawError;
    }
  }
  
  // Error codes and messages mapping
  export const ERROR_CODES = {
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    INVALID_ADDRESS: 'INVALID_ADDRESS',
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    AI_ERROR: 'AI_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMIT: 'RATE_LIMIT',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
    WALLET_CREATION_FAILED: 'WALLET_CREATION_FAILED',
    BALANCE_FETCH_FAILED: 'BALANCE_FETCH_FAILED',
    TOKEN_BALANCE_FETCH_FAILED: 'TOKEN_BALANCE_FETCH_FAILED',
  } as const;
  
  export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
    [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Insufficient balance',
    [ERROR_CODES.INVALID_ADDRESS]: 'Invalid address',
    [ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed to complete',
    [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
    [ERROR_CODES.AI_ERROR]: 'AI assistant encountered an error',
    [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input provided',
    [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access',
    [ERROR_CODES.RATE_LIMIT]: 'Rate limit exceeded',
    [ERROR_CODES.REQUEST_TIMEOUT]: 'Request timeout',
    [ERROR_CODES.WALLET_CREATION_FAILED]: 'Wallet creation failed',
    [ERROR_CODES.BALANCE_FETCH_FAILED]: 'Balance fetch failed',
    [ERROR_CODES.TOKEN_BALANCE_FETCH_FAILED]: 'Token balance fetch failed',
  };
  
  // Error handler class
  export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: Array<{
      timestamp: Date;
      error: Error;
      context?: any;
    }> = [];
  
    private constructor() {}
  
    public static getInstance(): ErrorHandler {
      if (!ErrorHandler.instance) {
        ErrorHandler.instance = new ErrorHandler();
      }
      return ErrorHandler.instance;
    }
  
    // Handle different types of errors
    public handleError(error: Error, context?: any): { message: string; action?: string } {
      this.logError(error, context);
  
      if (error instanceof TransactionError) {
        return this.handleTransactionError(error);
      }
  
      if (error instanceof WalletError) {
        return this.handleWalletError(error);
      }
  
      // Handle generic errors
      return {
        message: 'An unexpected error occurred. Please try again.',
        action: 'Please refresh the page or contact support if the issue persists.'
      };
    }
  
    // Handle transaction-specific errors
    private handleTransactionError(error: TransactionError): { message: string; action: string } {
      let action = '';
  
      switch (error.code) {
        case ERROR_CODES.INSUFFICIENT_BALANCE:
          action = 'Please add funds to your wallet and try again.';
          break;
        case ERROR_CODES.TRANSACTION_FAILED:
          action = 'Please try again or check the transaction status on Solana Explorer.';
          break;
        default:
          action = 'Please try again or contact support if the issue persists.';
      }
  
      return {
        message: error.message,
        action
      };
    }
  
    // Handle wallet-specific errors
    private handleWalletError(error: WalletError): { message: string; action?: string } {
      let action = '';
  
      switch (error.severity) {
        case 'critical':
          action = 'Please contact support immediately.';
          break;
        case 'high':
          action = 'Please try again or contact support if the issue persists.';
          break;
        case 'medium':
          action = 'Please try again.';
          break;
        case 'low':
          // No action needed for low severity errors
          break;
      }
  
      return {
        message: error.message,
        action
      };
    }
  
    // Log errors for tracking
    private logError(error: Error, context?: any): void {
      this.errorLog.push({
        timestamp: new Date(),
        error,
        context
      });
  
      // In development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', {
          timestamp: new Date(),
          error,
          context
        });
      }
  
      // In production, you might want to send to an error tracking service
      if (process.env.NODE_ENV === 'production') {
        this.sendToErrorTracking(error, context);
      }
    }
  
    // Send errors to tracking service
    private sendToErrorTracking(error: Error, context?: any): void {
      // Implement error tracking service integration here
      // Example: Sentry, LogRocket, etc.
    }
  
    // Get error message from code
    public static getErrorMessage(code: keyof typeof ERROR_CODES): string {
      return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || 'An unknown error occurred';
    }
  
    // Create error instance from code
    public static createError(status: number, code: keyof typeof ERROR_CODES, additionalInfo?: string): WalletError {
      const message = `${ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]}${additionalInfo ? `: ${additionalInfo}` : ''}`;
      return new WalletError(message, code);
    }
  
    // Create transaction error
    public static createTransactionError(
      code: keyof typeof ERROR_CODES,
      txId?: string,
      rawError?: any
    ): TransactionError {
      return new TransactionError(ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES], code, txId, rawError);
    }
  }
  
  // Error utility functions
  export const errorUtils = {
    // Check if error is a specific type
    isTransactionError: (error: any): error is TransactionError => {
      return error instanceof TransactionError;
    },
  
    isWalletError: (error: any): error is WalletError => {
      return error instanceof WalletError;
    },
  
    // Format error for display
    formatErrorForDisplay: (error: Error): string => {
      if (error instanceof WalletError) {
        return `${error.message} (Code: ${error.code})`;
      }
      return error.message;
    },
  
    // Create user-friendly error message
    createUserMessage: (error: Error): string => {
      if (error instanceof WalletError) {
        return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message;
      }
      return 'An unexpected error occurred. Please try again.';
    }
  };
  


  
  // Example usage:
  /*
  try {
    // Attempt some wallet operation
    throw ErrorHandler.createError('INSUFFICIENT_BALANCE');
  } catch (error) {
    const errorHandler = ErrorHandler.getInstance();
    const { message, action } = errorHandler.handleError(error, { operation: 'send' });
    
    console.log(message); // User-friendly error message
    console.log(action);  // Suggested action to resolve the error
  }
  */