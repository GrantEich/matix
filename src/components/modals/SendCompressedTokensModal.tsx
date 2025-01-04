// src/components/modals/SendCompressedTokensModal.tsx
import { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";

import type { SendCompressedTokensModalProps } from './types';
import { useToast } from '@/hooks/use-toast';

export const SendCompressedTokensModal: FC<SendCompressedTokensModalProps> = ({
  open,
  onClose,
  mint
}) => {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!recipient) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a recipient address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Implement your send logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast({
        title: "Success",
        description: "Tokens sent successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Compressed Tokens</DialogTitle>
          <DialogDescription>
            Send tokens from mint {mint.slice(0, 4)}...{mint.slice(-4)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="recipient" className="text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient address"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4" />
                Sending...
              </>
            ) : (
              'Send Tokens'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Re-export for convenience
export { type SendCompressedTokensModalProps } from './types';