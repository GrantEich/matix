import { Chain, PluginBase, WalletClientBase, createTool } from "@goat-sdk/core";
import { SystemProgram, PublicKey, Transaction } from "@solana/web3.js";
import { parseUnits } from "viem";
import { z } from "zod";

// Extend SolanaWalletClient to implement WalletClientBase
export interface SolanaWalletClient extends WalletClientBase {
    getAddress(): string;
    sendTransaction(params: {
        instructions: any[];
        addressLookupTables?: { pubkey: PublicKey }[];
        accountsToSign?: any[];
    }): Promise<{ hash: string }>;
    getCoreTools(): any[];
}

// Define TransactionResult interface
interface TransactionResult {
    hash: string;
}

export class SendSOLPlugin extends PluginBase<SolanaWalletClient> {
    constructor() {
        super("sendSOL", []);
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "solana";
    }

    getTools(walletClient: SolanaWalletClient) {
        const sendTool = createTool(
            {
                name: "send_SOL",
                description: "Send SOL to an address.",
                parameters: sendSOLParametersSchema,
            },
            async (parameters: z.infer<typeof sendSOLParametersSchema>) => {
                const result = await sendSOLMethod(walletClient, parameters);
                return { hash: result }; // Return object with hash property
            }
        );
        return [sendTool];
    }
}

export const sendSOL = () => new SendSOLPlugin();

const sendSOLParametersSchema = z.object({
    to: z.string().describe("The address to send SOL to"),
    amount: z.string().describe("The amount of SOL to send"),
});

async function sendSOLMethod(
    walletClient: SolanaWalletClient,
    parameters: z.infer<typeof sendSOLParametersSchema>,
): Promise<string> {
    try {
        const { to, amount } = parameters;

        const senderAddress = walletClient.getAddress();
        const lamports = parseUnits(amount, 9);

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: new PublicKey(senderAddress),
            toPubkey: new PublicKey(to),
            lamports: BigInt(lamports.toString()),
        });

        const txResult = await walletClient.sendTransaction({
            instructions: [transferInstruction],
            addressLookupTables: [], // Changed from addressLookupTableAddresses
            accountsToSign: [],
        });

        return txResult.hash;
    } catch (error) {
        throw new Error(`Failed to send SOL: ${error}`);
    }
}