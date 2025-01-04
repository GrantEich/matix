import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface MintCreatedModalProps {
  open: boolean;
  onClose: () => void;
  mintAddress: string;
}

const MintCreatedModal: FC<MintCreatedModalProps> = ({ open, onClose, mintAddress }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mint Created</DialogTitle>
          <DialogDescription>
            The mint address is {mintAddress}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MintCreatedModal;