import { WalletState } from "@/types/wallet";

export const validationUtils = {
    // Validate Solana address
    isValidSolanaAddress: (address: string): boolean => {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    },
  
    // Validate transaction amount
    isValidTransactionAmount: (
      amount: number,
      walletState: WalletState,
      includesFee: boolean = true
    ): boolean => {
      const balance = parseFloat(walletState.balance);
      const fee = includesFee ? 0.000005 : 0; // Typical Solana transaction fee
      return amount > 0 && amount <= balance - fee;
    },
  
    // Validate transaction limits
    isWithinTransactionLimits: (
      amount: number,
      dailyLimit: number,
      recentTransactions: any[]
    ): boolean => {
      const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
      const dailyTotal = recentTransactions
        .filter(tx => new Date(tx.timestamp).getTime() > last24Hours)
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      
      return dailyTotal + amount <= dailyLimit;
    },
  
    // Validate number input
    isValidNumber: (value: string): boolean => {
      return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    },
  
    // Validate URL
    isValidURL: (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
  
    // Validate email address
    isValidEmail: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    // Check if string contains HTML
    containsHTML: (str: string): boolean => {
      const htmlRegex = /<[^>]*>/;
      return htmlRegex.test(str);
    },
  
    // Sanitize string input
    sanitizeString: (str: string): string => {
      return str
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
    },
  
    // Validate NFT metadata
    isValidNFTMetadata: (metadata: any): boolean => {
      const requiredFields = ['name', 'symbol', 'image'];
      return requiredFields.every(field => metadata && metadata[field]);
    },
  
    // Validate token amount with decimals
    isValidTokenAmount: (amount: string, decimals: number): boolean => {
      const parts = amount.split('.');
      return (
        validationUtils.isValidNumber(amount) &&
        parseFloat(amount) > 0 &&
        (parts.length === 1 || parts[1].length <= decimals)
      );
    },
  };