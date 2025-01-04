import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { TokenAccount } from "@/utils/solana";
import { WalletAI } from "@/lib/ai/agent";

type Props = {
  tokenAccount: TokenAccount;
  onSubmit: () => void;
};

const ReclaimForm = ({ tokenAccount, onSubmit }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleReclaim = async () => {
    try {
      setIsProcessing(true);
      const response = await WalletAI.evaluateTransaction(tokenAccount.mint, Number(tokenAccount.amount));
      if (response.type === "success") {
        toast({
          title: "Rent reclaimed!",
          description: "Tokens reclaimed successfully",
        });
        onSubmit();
      } else {
        toast({
          title: "Transaction Warning",
          description: response.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      const isInsufficientBalance = error?.message
        ?.toLowerCase()
        .includes("not enough balance");
      if (isInsufficientBalance) {
        console.log("Insufficient balance");
        toast({
          title: "Insufficient balance",
          description: "You do not have enough balance to reclaim rent",
          variant: "destructive",
        });
      } else {
        console.log("Error", error);
        toast({
          title: "Error",
          description: "An error occurred while reclaiming rent",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-400 font-light text-xs pb-0 leading-[15px] italic pt-1">
        This will reclaim all the tokens in the ATA. After reclaiming, the
        original ATA will be closed and the rent will be reclaimed.
      </p>
      <div className="flex gap-2 text-gray-700 text-lg font-light">
        <p className="">Tokens to Reclaim:</p>
        <p>{tokenAccount.amount}</p>
      </div>
      {isProcessing ? (
        <div className="flex justify-center h-9 items-center">
          <Loader className="w-5" />
        </div>
      ) : (
        <Button className="w-full" onClick={handleReclaim}>
          Reclaim Rent
        </Button>
      )}
    </div>
  );
};

export default ReclaimForm;
