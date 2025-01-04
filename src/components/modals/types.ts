// src/components/modals/types.ts
export interface BaseModalProps {
    open: boolean;
    onClose: () => void;
    mint: string;
  }
  
  export interface MintTokensModalProps extends BaseModalProps {}
  export interface SendCompressedTokensModalProps extends BaseModalProps {}
  export interface DecompressTokenModalProps extends BaseModalProps {}