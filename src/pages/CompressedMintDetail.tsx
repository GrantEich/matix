// src/pages/[mint]/page.tsx
'use client';

import { useMintInfo } from "@/hooks/useMintInfo";
import { useParams, useSearchParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PublicKey } from "@solana/web3.js";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MintDetailContentProps {
  mint: string;
}

const MintDetailContent = ({ mint }: MintDetailContentProps) => {
  const { isFetchingMintInfo, errorFetchingMintInfo, mintInfo, isAuthority } =
    useMintInfo(mint);
  const router = useRouter();

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderMintInfo = () => {
    if (!mintInfo) return null;

    const infoFields = [
      {
        label: "Address",
        value: mintInfo.address?.toBase58() || "N/A",
      },
      {
        label: "Decimals",
        value: mintInfo.decimals?.toString() || "N/A",
      },
      {
        label: "Supply",
        value: mintInfo.supply?.toString() || "N/A",
      },
      {
        label: "Mint Authority",
        value: isAuthority ? "You" : mintInfo.mintAuthority?.toBase58() || "N/A",
      },
    ];

    return (
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        {infoFields.map((field) => (
          <div key={field.label} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <p className="text-sm font-medium text-gray-800">{field.label}</p>
            <p className="text-base font-light text-gray-600 break-all mt-1">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (isFetchingMintInfo) {
    return (
      <div className="flex justify-center items-center flex-col min-h-[200px]">
        <Loader className="w-6 h-6 text-gray-600" />
        <p className="text-gray-500 text-sm mt-2">Fetching Mint Info...</p>
      </div>
    );
  }

  if (errorFetchingMintInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 font-light mb-4">
          Error fetching mint info
        </p>
        <Button
          variant="outline"
          onClick={goBack}
          className="text-gray-600 hover:text-gray-800"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={goBack}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-semibold text-gray-800">
          Mint Details
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Viewing details for mint {mint.slice(0, 8)}...{mint.slice(-8)}
        </p>
      </div>

      {renderMintInfo()}
    </div>
  );
};

const CompressedMintDetail = () => {
  // Get mint from route params
  const params = useParams();
  const mintAddress = params && typeof params.mint === 'string' ? params.mint : '';

  // Validate mint address
  const isValidMint = useCallback(() => {
    try {
      if (!mintAddress) return false;
      new PublicKey(mintAddress);
      return true;
    } catch {
      return false;
    }
  }, [mintAddress]);

  if (!isValidMint()) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 font-light">Invalid mint address</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MintDetailContent mint={mintAddress} />
    </ErrorBoundary>
  );
};

export default CompressedMintDetail;