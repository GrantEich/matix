import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { WalletAI } from '@/lib/ai/agent';
import { WalletBalance } from '@/types/wallet';
import { Loader } from '../ui/loader';

interface SendTransactionProps {
  balance: string; // Ensure balance is typed as string
  address: string;
  isLoading: boolean;
  error: string | null;
}

const SendTransaction: React.FC<SendTransactionProps> = ({ balance, address, isLoading, error }) => {
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const { toast } = useToast();

  const canSend = amount && Number(amount) > 0 && recipient.length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    try {
      setIsSending(true);
      const response = await WalletAI.evaluateTransaction(recipient, Number(amount), address);
      if (response.type === 'success') {
        toast({
          title: 'Transaction Successful',
          description: response.message,
        });
      } else {
        toast({
          title: 'Transaction Warning',
          description: response.message,
          variant: 'default',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'An error occurred while sending the transaction',
        variant: 'destructive',
      });
      console.log('error: ', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="pb-5 flex flex-col gap-2">
        <div>
          <label>Amount</label>
          <Input
            disabled={isSending}
            type="number"
            placeholder="100"
            value={amount}
            onChange={(e) => {
              if (Number(e.target.value) > 0) {
                setAmount(e.target.value);
              } else {
                setAmount('');
              }
            }}
          />
        </div>
        <div>
          <label>Recipient</label>
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

export default SendTransaction;