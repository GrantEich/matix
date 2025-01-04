// src/components/modals/MintCreatedSuccess.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

interface MintCreatedSuccessProps {
  open: boolean;
  onClose: () => void;
  mintAddress: string;
}

const MintCreatedSuccess = ({
  open,
  onClose,
  mintAddress,
}: MintCreatedSuccessProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mintAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openExplorer = () => {
    const url = `https://explorer.solana.com/address/${mintAddress}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">
            Mint Created Successfully
          </DialogTitle>
          <DialogDescription className="text-center">
            Your new token mint has been created on Solana
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 my-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Mint Address
          </p>
          <div className="break-all text-sm text-gray-900">
            {mintAddress}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={copyToClipboard}
            >
              {copied ? (
                "Copied!"
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={openExplorer}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View in Explorer
            </Button>
          </div>
          <Button
            className="w-full"
            onClick={onClose}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MintCreatedSuccess;