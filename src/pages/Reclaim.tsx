// src/pages/reclaim/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import dynamic from 'next/dynamic';
import type { TokenAccount } from "@/context/tokensContexts"; // Import TokenAccount as a type
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ReclaimModalProps } from '@/components/modals/ReclaimModal';

// Dynamic import for ReclaimModal
const ReclaimModal = dynamic<ReclaimModalProps>(
  () => import('@/components/modals/ReclaimModal').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <Loader />
  }
);

interface TokenAccountRowProps {
  token: TokenAccount;
  onReclaim: (token: TokenAccount) => void;
}

const TokenAccountRow: React.FC<TokenAccountRowProps> = ({ token, onReclaim }) => (
  <div
    className="grid grid-cols-[1fr_150px_150px] gap-4 hover:bg-gray-50 transition-colors h-14 px-4 text-gray-500 font-light rounded-lg items-center"
    key={token.mint}
  >
    <div className="flex items-center">
      <p className="truncate" title={token.mint}>{token.mint}</p>
    </div>
    <div className="flex items-center justify-end">
      <p className="text-right">{token.amount}</p>
    </div>
    <div className="flex justify-center items-center">
      <Button
        onClick={() => onReclaim(token)}
        variant="secondary"
        size="sm"
        className="font-light"
      >
        Reclaim Rent
      </Button>
    </div>
  </div>
);

const ReclaimContent = () => {
  const { publicKey: connectedWallet } = useWallet();
  const [selectedToken, setSelectedToken] = useState<TokenAccount | null>(null);

  const handleReclaim = (token: TokenAccount) => {
    setSelectedToken(token);
  };

  return (
    <ErrorBoundary>
      <div>
        {/* Your JSX here... */}
        <ReclaimModal
          open={!!selectedToken}
          onClose={() => setSelectedToken(null)}
          tokenAccount={selectedToken!}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ReclaimContent;