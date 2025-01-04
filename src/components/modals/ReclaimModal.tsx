import { FC } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TokenAccount } from "@/utils/solana";

export interface ReclaimModalProps {
  open: boolean;
  onClose: () => void;
  tokenAccount: TokenAccount;
}

const ReclaimModal: FC<ReclaimModalProps> = ({ open, onClose, tokenAccount }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reclaim Rent</DialogTitle>
        </DialogHeader>
        <div>
          <p>Token Mint: {tokenAccount.mint}</p>
          <p>Amount: {tokenAccount.amount}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReclaimModal;
