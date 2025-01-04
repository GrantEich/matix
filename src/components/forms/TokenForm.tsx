import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { WalletAI } from "@/lib/ai/agent";

type Props = {
  mint: string;
  onSubmit: () => void;
};

const TokensForm = ({ mint, onSubmit }: Props) => {
  const [amount, setAmount] = useState<string | number>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const canSend = amount && Number(amount) > 0;

  const handle = async () => {
    if (!canSend) return;
    try {
      setIsProcessing(true);
      const response = await WalletAI.evaluateTransaction(mint, Number(amount));
      if (response.type === "success") {
        toast({
          title: "Transaction Successful",
          description: response.message,
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
      toast({
        title: "Error",
        description: "An error occurred while processing the transaction",
        variant: "destructive",
      });
      console.log("error: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="pb-5 flex flex-col gap-2">
        <div>
          <Label>Amount</Label>
          <div className="flex items-center gap-2">
            <Input
              disabled={isProcessing}
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => {
                if (Number(e.target.value) > 0) {
                  setAmount(Number(e.target.value));
                } else {
                  setAmount("");
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isProcessing}
            >
              Max
            </Button>
          </div>
        </div>
      </div>
      {isProcessing ? (
        <div className="flex justify-center h-9 items-center">
          <Loader className="w-5" />
        </div>
      ) : (
        <Button
          className="w-full"
          disabled={!canSend}
          onClick={handle}
        >
          Send
        </Button>
      )}
    </div>
  );
};

export default TokensForm;
