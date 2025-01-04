// src/hooks/useMintInfo.ts
import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

interface MintInfo {
  address: PublicKey;
  decimals: number;
  supply: bigint;
  mintAuthority: PublicKey | null;
  freezeAuthority: PublicKey | null;
}

export const useMintInfo = (mintAddress?: string) => {
  const { connection } = useConnection();
  const { publicKey: walletPublicKey } = useWallet();
  
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [isFetchingMintInfo, setIsFetchingMintInfo] = useState(false);
  const [errorFetchingMintInfo, setErrorFetchingMintInfo] = useState<string | null>(null);

  const isAuthority = useMemo(() => {
    if (!mintInfo || !walletPublicKey) return false;
    return mintInfo.mintAuthority?.equals(walletPublicKey);
  }, [mintInfo, walletPublicKey]);

  const fetchMintInfo = useCallback(async () => {
    if (!mintAddress) return;

    setIsFetchingMintInfo(true);
    setErrorFetchingMintInfo(null);

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const info = await connection.getParsedAccountInfo(mintPubkey);

      if (!info.value) {
        throw new Error('Mint account not found');
      }

      const data = info.value.data;
      if (!('parsed' in data)) {
        throw new Error('Failed to parse mint account data');
      }

      const parsed = data.parsed;
      if (parsed.type !== 'mint') {
        throw new Error('Not a mint account');
      }

      const mintAuthority = parsed.info.mintAuthority ? 
        new PublicKey(parsed.info.mintAuthority) : null;

      const freezeAuthority = parsed.info.freezeAuthority ? 
        new PublicKey(parsed.info.freezeAuthority) : null;

      setMintInfo({
        address: mintPubkey,
        decimals: parsed.info.decimals,
        supply: BigInt(parsed.info.supply),
        mintAuthority,
        freezeAuthority
      });
    } catch (error) {
      console.error('Error fetching mint info:', error);
      setErrorFetchingMintInfo(
        error instanceof Error ? error.message : 'Failed to fetch mint info'
      );
    } finally {
      setIsFetchingMintInfo(false);
    }
  }, [connection, mintAddress]);

  useEffect(() => {
    if (mintAddress) {
      fetchMintInfo();
    }
  }, [fetchMintInfo, mintAddress]);

  const refreshMintInfo = useCallback(() => {
    return fetchMintInfo();
  }, [fetchMintInfo]);

  return {
    mintInfo,
    isFetchingMintInfo,
    errorFetchingMintInfo,
    isAuthority,
    refreshMintInfo
  };
};