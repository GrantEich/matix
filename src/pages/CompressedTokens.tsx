'use client';

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useRouter } from 'next/router';
import { SendHorizontal, Coins, RefreshCcw, RotateCcw } from "lucide-react";
import { useCompressedTokenBalance } from "@/hooks/useCompressedTokenBalance";
import { CompressedTokenInfo } from "@/context/tokensContexts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import dynamic from 'next/dynamic';
import { MintTokensModalProps } from "@/components/modals/MintTokensModal";
import { SendCompressedTokensModalProps, DecompressTokenModalProps } from "@/components/modals/types";


// Dynamic imports with proper typings
const MintTokensModal = dynamic<MintTokensModalProps>(
  () => import('@/components/modals/MintTokensModal').then(mod => {
    const { MintTokensModal } = mod;
    return MintTokensModal;
  }),
  { 
    ssr: false,
    loading: () => <Loader />
  }
);

const SendCompressedTokensModal = dynamic<SendCompressedTokensModalProps>(
  () => import('@/components/modals/SendCompressedTokensModal').then(mod => {
    const { SendCompressedTokensModal } = mod;
    return SendCompressedTokensModal;
  }),
  { 
    ssr: false,
    loading: () => <Loader />
  }
);

const DecompressTokenModal = dynamic<DecompressTokenModalProps>(
  () => import('@/components/modals/DecompressTokenModal').then(mod => {
    const { DecompressTokenModal } = mod;
    return DecompressTokenModal;
  }),
  { 
    ssr: false,
    loading: () => <Loader />
  }
);

const CompressedTokensContent = () => {
  const router = useRouter();
  const { publicKey: connectedWallet } = useWallet();
  const {
    compressedTokens: allCompressedTokens,
    isFetching: isFetchingCompressedTokens,
    error: errorFetchingCompressedTokens,
    refetch: refetchCompressedTokens,
  } = useCompressedTokenBalance();

  const [isMintingTokens, setIsMintingTokens] = useState(false);
  const [isSendingTokens, setIsSendingTokens] = useState(false);
  const [isDecompressingTokens, setIsDecompressingTokens] = useState(false);
  const [selectedToken, setSelectedToken] = useState<CompressedTokenInfo | null>(null);
  const [filteredTokens, setFilteredTokens] = useState<CompressedTokenInfo[] | null>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!allCompressedTokens) return;
      
      if (search) {
        const filtered = allCompressedTokens.filter((token) =>
          token.mint.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTokens(filtered);
      } else {
        setFilteredTokens(allCompressedTokens);
      }
    }, 10);

    return () => clearTimeout(handler);
  }, [search, allCompressedTokens]);

  const tokensToRender = search ? filteredTokens : allCompressedTokens;

  const goToMintDetail = (mint: string) => {
    router.push(`/mint/${mint}`);
  };

  if (!connectedWallet) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500 font-thin">
          Connect your wallet to view your compressed tokens
        </p>
      </div>
    );
  }

  if (isFetchingCompressedTokens) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center p-8">
        <Loader className="w-5 h-5" />
        <p className="text-gray-500 font-thin">fetching compressed tokens...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex justify-between items-center pb-5">
          <h1 className="text-4xl font-semibold text-gray-700">
            Compressed Wallet
          </h1>
          <button
            disabled={isFetchingCompressedTokens}
            onClick={() => refetchCompressedTokens()}
            className="bg-gray-100 p-2 rounded-md hover:bg-white transition-colors disabled:opacity-50"
          >
            <RotateCcw strokeWidth={1.25} size={20} />
          </button>
        </div>
        
        {errorFetchingCompressedTokens ? (
          <p className="text-red-500 font-light text-sm text-center">
            {errorFetchingCompressedTokens}
          </p>
        ) : (
          <div>
            <div className="pb-2">
              <input
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search for mint"
                className="w-full p-2 rounded-md bg-gray-100 focus:outline-black text-gray-600 font-light"
              />
            </div>
            
            <div className="grid grid-cols-[1fr_150px_300px] items-center gap-4 h-8 px-2 text-gray-700 font-semibold">
              <h3>Mint</h3>
              <h3 className="text-right">Balance</h3>
              <h3 className="text-right">Actions</h3>
            </div>

            {tokensToRender?.map((token) => (
              <div
                key={token.mint}
                className="grid grid-cols-[1fr_150px_300px] gap-4 hover:bg-gray-50 transition-colors h-12 px-2 text-gray-500 font-light rounded"
              >
                <div
                  onClick={() => goToMintDetail(token.mint)}
                  className="flex items-center cursor-pointer"
                >
                  <p className="truncate">{token.mint}</p>
                </div>
                
                <div className="flex items-center justify-end">
                  <p>{token.balance}</p>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 font-light"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsMintingTokens(true);
                    }}
                  >
                    Mint
                    <Coins className="ml-1" size={16} strokeWidth={1.25} />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 font-light"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsSendingTokens(true);
                    }}
                  >
                    Send
                    <SendHorizontal className="ml-1" strokeWidth={1.25} size={16} />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 font-light"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsDecompressingTokens(true);
                    }}
                  >
                    Decompress
                    <RefreshCcw className="ml-1" strokeWidth={1.25} size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedToken && (
        <>
          <MintTokensModal
            open={isMintingTokens}
            onClose={() => setIsMintingTokens(false)}
            mint={selectedToken.mint}
          />
          <SendCompressedTokensModal
            open={isSendingTokens}
            onClose={() => setIsSendingTokens(false)}
            mint={selectedToken.mint}
          />
          <DecompressTokenModal
            open={isDecompressingTokens}
            onClose={() => setIsDecompressingTokens(false)}
            mint={selectedToken.mint}
          />
        </>
      )}
    </ErrorBoundary>
  );
};

export default CompressedTokensContent;