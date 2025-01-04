// src/pages/transactions/page.tsx
'use client';

import { openExplorerUrl } from "@/utils/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import moment from "moment";
import { useTransactions } from "@/hooks/useTransactions";
import { RotateCcw, ExternalLink } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";

const TransactionsContent = () => {
  const { publicKey } = useWallet();
  const [search, setSearch] = useState("");
  const { 
    transactions, 
    isLoading, 
    error,
    refetch 
  } = useTransactions(publicKey?.toString() || "");
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  useEffect(() => {
    const filterTransactions = () => {
      if (!transactions) return;
      
      if (search) {
        const filtered = transactions.filter((txn) =>
          txn.signature?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTransactions(filtered);
      } else {
        setFilteredTransactions(transactions);
      }
    };

    filterTransactions();
  }, [search, transactions]);

  const handleRefresh = useCallback(() => {
    refetch?.();
  }, [refetch]);

  const renderTransactionRow = (txn: any) => (
    <div
      onClick={() => openExplorerUrl(txn.signature, true)}
      className="grid grid-cols-[120px_1fr_50px] gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-14 px-4 text-gray-500 font-light rounded-lg items-center"
      key={txn.signature}
    >
      <div className="text-sm flex items-center">
        <p>{moment.unix(txn.timestamp.getTime() / 1000).fromNow()}</p>
      </div>
      <div className="flex items-center justify-start">
        <p className="text-left truncate">{txn.signature}</p>
      </div>
      <div className="flex justify-end">
        <ExternalLink size={16} className="text-gray-400" />
      </div>
    </div>
  );

  if (!publicKey) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500 font-light text-center">
          Connect your wallet to view transactions
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center min-h-[200px]">
        <Loader className="w-6 h-6 text-gray-600" />
        <p className="text-gray-500 font-light">Fetching transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Transactions
        </h1>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading}
          onClick={handleRefresh}
          className="hover:bg-gray-50"
        >
          <RotateCcw strokeWidth={1.5} size={18} />
        </Button>
      </div>

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500 font-light mb-4">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction signature"
              className="w-full"
            />
          </div>

          {(!transactions || transactions.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-light">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[120px_1fr_50px] gap-4 px-4 text-gray-700 font-medium text-sm">
                <h3>Time</h3>
                <h3>Signature</h3>
                <div />
              </div>
              
              <div className="space-y-1">
                {filteredTransactions?.map(renderTransactionRow)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const TransactionsPage = () => (
  <ErrorBoundary>
    <TransactionsContent />
  </ErrorBoundary>
);

export default TransactionsPage;