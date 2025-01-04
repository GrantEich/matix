// src/components/wallet/TokenManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { WalletState } from '@/types/wallet';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  usdValue: number;
  icon?: string;
  priceChange24h?: number;
}

interface TokenManagerProps {
  walletState: WalletState;
}

export function TokenManager({ walletState }: TokenManagerProps) {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokenBalances();
  }, [walletState.address]);

  const fetchTokenBalances = async () => {
    if (!walletState.address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Using Helius API for token data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HELIUS_RPC_URL}/token-balances/${walletState.address}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch token balances');

      const data = await response.json();
      const enrichedTokens = await enrichTokenData(data.tokens);
      setTokens(enrichedTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const enrichTokenData = async (rawTokens: any[]): Promise<TokenBalance[]> => {
    // Fetch token metadata and prices in parallel
    const enrichedTokens = await Promise.all(
      rawTokens.map(async (token) => {
        try {
          // Fetch token metadata using Jupiter API
          const metadataResponse = await fetch(
            `https://price.jup.ag/v4/token/${token.mint}`
          );
          const metadata = await metadataResponse.json();

          return {
            mint: token.mint,
            symbol: metadata.data.symbol,
            name: metadata.data.name,
            balance: (Number(token.amount) / Math.pow(10, token.decimals)).toString(),
            decimals: token.decimals,
            usdValue: metadata.data.price * (Number(token.amount) / Math.pow(10, token.decimals)),
            icon: metadata.data.logoURI,
            priceChange24h: metadata.data.priceChange24h,
          };
        } catch {
          // Return basic token data if metadata fetch fails
          return {
            mint: token.mint,
            symbol: 'Unknown',
            name: 'Unknown Token',
            balance: (Number(token.amount) / Math.pow(10, token.decimals)).toString(),
            decimals: token.decimals,
            usdValue: 0,
          };
        }
      })
    );

    // Sort by USD value
    return enrichedTokens.sort((a, b) => b.usdValue - a.usdValue);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTokenBalances();
    setRefreshing(false);
  };

  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Token Manager
          </CardTitle>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading tokens...</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No tokens found matching your search' : 'No tokens found'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTokens.map((token) => (
              <div
                key={token.mint}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {token.icon ? (
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/fallback-token-icon.png';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-sm text-gray-500">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{parseFloat(token.balance).toFixed(4)}</p>
                  <p className="text-sm text-gray-500">{formatUSD(token.usdValue)}</p>
                  {token.priceChange24h && (
                    <p className={`text-xs ${
                      token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}