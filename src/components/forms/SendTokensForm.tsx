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

const SendTokensForm = ({ mint, onSubmit }: Props) => {
  const [amount, setAmount] = useState<string | number>("");
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const canSend = amount && Number(amount) > 0 && recipient.length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    try {
      setIsSending(true);
      const response = await WalletAI.evaluateTransaction(recipient, Number(amount), mint);
      if (response.type === "success") {
        toast({
          title: "Tokens sent",
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
      const isInsufficientBalance = error?.message
        ?.toLowerCase()
        .includes("not enough balance");
      if (isInsufficientBalance) {
        console.log("Insufficient balance");
        toast({
          title: "Insufficient balance",
          description: "You do not have enough balance to send tokens",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while sending tokens",
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="pb-5 flex flex-col gap-2">
        <div>
          <Label>Amount</Label>
          <Input
            disabled={isSending}
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
        </div>
        <div>
          <Label>Recipient</Label>
          <Input
            disabled={isSending}
            type="text"
            placeholder="0xqwerty..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
      </div>
      {isSending ? (
        <div className="flex justify-center h-9 items-center">
          <Loader className="w-5" />
        </div>
      ) : (
        <Button className="w-full" disabled={!canSend} onClick={handleSend}>
          Send
        </Button>
      )}
    </div>
  );
};

export default SendTokensForm;
