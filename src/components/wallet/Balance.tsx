import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign 
} from 'lucide-react';
import { formatUtils } from '@/lib/utils/format';
import { TokenBalance, WalletBalance } from '@/types/wallet'; // Adjust the import path as necessary

interface BalanceProps {
  solBalance: WalletBalance;
  tokenBalances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function Balance({ 
  solBalance, 
  tokenBalances, 
  isLoading, 
  error, 
  onRefresh 
}: BalanceProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalValueUSD = React.useMemo(() => {
    const solValue = parseFloat(solBalance.amount) * (solBalance.usdValue || 0);
    const tokenValue = tokenBalances.reduce((sum, token) => 
      sum + (parseFloat(token.amount) * (token.priceData?.price || 0)), 0
    );
    return solValue + tokenValue;
  }, [solBalance, tokenBalances]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading balance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Portfolio Balance
        </CardTitle>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>

      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Total Balance */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Value</p>
              <h1 className="text-3xl font-bold">
                {formatUtils.formatUSD(totalValueUSD)}
              </h1>
            </div>

            {/* SOL Balance */}
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src="/solana-logo.svg" 
                    alt="SOL" 
                    className="w-6 h-6"
                  />
                  <div>
                    <p className="font-medium">SOL Balance</p>
                    <p className="text-sm text-gray-500">Native Token</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatUtils.formatSOL(solBalance.amount)} SOL</p>
                  <p className="text-sm text-gray-500">
                    {formatUtils.formatUSD(parseFloat(solBalance.amount) * (solBalance.usdValue || 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Token Balances */}
            {tokenBalances.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Token Balances</p>
                <div className="space-y-2">
                  {tokenBalances.map((token) => (
                    <div 
                      key={token.mint} 
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {token.logoURI ? (
                          <img 
                            src={token.logoURI} 
                            alt={token.symbol} 
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/fallback-token.svg';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-sm text-gray-500">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatUtils.formatNumber(parseFloat(token.amount), token.decimals)} {token.symbol}
                        </p>
                        {token.priceData && (
                          <div className="flex items-center gap-1 justify-end">
                            <p className="text-sm text-gray-500">
                              {formatUtils.formatUSD(parseFloat(token.amount) * token.priceData.price)}
                            </p>
                            <span className={`text-xs ${
                              token.priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {token.priceData.change24h >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(token.priceData.change24h).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}