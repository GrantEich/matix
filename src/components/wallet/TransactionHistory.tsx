// src/components/wallet/TransactionHistory.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { WalletState } from '@/types/wallet';

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: string;
  timestamp: Date;
  address: string;
  status: 'confirmed' | 'pending' | 'failed';
  signature: string;
}

interface TransactionHistoryProps {
  walletState: WalletState;
}

export function TransactionHistory({ walletState }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing'>('all');

  useEffect(() => {
    fetchTransactionHistory();
  }, [walletState.address]);

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch(
        `https://staging.crossmint.com/api/v1-alpha2/wallets/${walletState.address}/transactions`,
        {
          headers: {
            'X-API-KEY': process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || '',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions.map(formatTransaction));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTransaction = (tx: any): Transaction => ({
    id: tx.id,
    type: tx.fromAddress === walletState.address ? 'outgoing' : 'incoming',
    amount: tx.amount,
    timestamp: new Date(tx.timestamp),
    address: tx.fromAddress === walletState.address ? tx.toAddress : tx.fromAddress,
    status: tx.status,
    signature: tx.signature
  });

  const filteredTransactions = transactions.filter(tx => 
    filterType === 'all' || tx.type === filterType
  );

  const renderTransaction = (tx: Transaction) => {
    const isOutgoing = tx.type === 'outgoing';
    const Icon = isOutgoing ? ArrowUpRight : ArrowDownLeft;
    const colorClass = isOutgoing ? 'text-red-500' : 'text-green-500';

    return (
      <div key={tx.id} className="border-b last:border-0 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-opacity-10 ${colorClass}`}>
              <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <div>
              <p className="font-medium">
                {isOutgoing ? 'Sent' : 'Received'} SOL
              </p>
              <p className="text-sm text-gray-500 font-mono truncate max-w-[200px]">
                {isOutgoing ? 'To: ' : 'From: '}{tx.address}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${colorClass}`}>
              {isOutgoing ? '-' : '+'}{tx.amount} SOL
            </p>
            <p className="text-sm text-gray-500">
              {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            tx.status === 'confirmed' ? 'bg-green-100 text-green-700' :
            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
          </span>
          <a
            href={`https://explorer.solana.com/tx/${tx.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            View on Explorer
          </a>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border rounded-lg p-1"
            >
              <option value="all">All</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="divide-y">
            {filteredTransactions.map(renderTransaction)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}