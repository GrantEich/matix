import React, { useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { WalletContext, WalletContextState } from '@/context/walletContext';
//import Loader from '../components/Loader';
import { formatUtils } from '@/lib/utils/format';
import { Wallet } from 'lucide-react';
import { useSolBalance } from '@/hooks/useSolBalance';
import { Loader } from '../ui/loader';
//import useWalletBalance from '../hooks/useWalletBalance';

interface Token {
  name: string;
  symbol: string;
  decimals: number;
  amount: string;
}

interface UseSolBalanceHook {
  balance: number | null;
  loading: boolean;
  tokens: Token[];
  error?: Error;
}

export function WalletInfo() {
  const { publicKey } = useContext(WalletContext) as WalletContextState;
  const { balance: solBalance, loading: isLoadingSol } = useWalletBalance();
  const { tokens, loading: isLoadingTokens } = useSolBalance();

  const isLoading = isLoadingSol || isLoadingTokens;

  if (!publicKey) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* SOL Balance */}
          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">SOL Balance</p>
                <p className="text-2xl font-bold">{formatUtils.formatSOL(solBalance || 0)}</p>
              </div>
              <img src="/solana-logo.svg" alt="SOL" className="w-8 h-8" />
            </div>
          </div>

          {/* Token Balances */}
          {tokens && tokens.length > 0 && (
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Token Balances</p>
                  <ul>
                    {tokens.map((token: Token) => (
                      <li key={token.name}>
                        {token.symbol}: {formatUtils.formatNumber(parseFloat(token.amount), token.decimals)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Address */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">Wallet Address</p>
            <p className="font-mono text-sm break-all">{publicKey.toString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WalletInfo;

function useWalletBalance(): { balance: any; loading: any; } {
  throw new Error('Function not implemented.');
}
