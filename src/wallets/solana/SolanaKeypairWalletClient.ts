import {
    ComputeBudgetProgram,
    type Keypair,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
    Connection
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { type SolanWalletClientCtorParams } from "./SolanaWalletClient";
import type { SolanaTransaction, SolanaInstructionTransaction } from "./types";

// Update constructor params to include correct types
export interface SolanaKeypairWalletClientCtorParams extends SolanWalletClientCtorParams {
    keypair: Keypair;
    connection: Connection;
}

export class SolanaKeypairWalletClient {
    protected connection: Connection;
    #keypair: Keypair;

    constructor(params: SolanaKeypairWalletClientCtorParams) {
        const { keypair, connection } = params;
        this.connection = connection;
        this.#keypair = keypair;
    }

    async connect(): Promise<void> {
        // Implementation for connect method
        return Promise.resolve();
    }

    async disconnect(): Promise<void> {
        // Implementation for disconnect method
        return Promise.resolve();
    }

    getAddress(): string {
        return this.#keypair.publicKey.toBase58();
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        const messageBytes = Buffer.from(message);
        const signature = nacl.sign.detached(messageBytes, this.#keypair.secretKey);
        return Buffer.from(signature).toString("hex");
    }

    async sendTransaction(transaction: SolanaInstructionTransaction): Promise<{ hash: string }> {
        const { instructions, addressLookupTableAddresses = [], accountsToSign = [] } = transaction;

        try {
            const ixComputeBudget = await this.getComputeBudgetInstructions(instructions, "mid");
            const allInstructions = [
                ixComputeBudget.computeBudgetLimitInstruction,
                ixComputeBudget.computeBudgetPriorityFeeInstructions,
                ...instructions,
            ];

            const messageV0 = new TransactionMessage({
                payerKey: this.#keypair.publicKey,
                recentBlockhash: ixComputeBudget.blockhash,
                instructions: allInstructions,
            }).compileToV0Message(await this.getAddressLookupTableAccounts(addressLookupTableAddresses));

            const transaction = new VersionedTransaction(messageV0);
            transaction.sign([this.#keypair, ...accountsToSign]);

            const timeoutMs = 90000;
            const startTime = Date.now();
            
            while (Date.now() - startTime < timeoutMs) {
                const transactionStartTime = Date.now();

                const hash = await this.connection.sendTransaction(transaction, {
                    maxRetries: 0,
                    skipPreflight: true,
                });

                const statuses = await this.connection.getSignatureStatuses([hash]);
                if (statuses.value[0]) {
                    if (!statuses.value[0].err) {
                        return { hash };
                    }
                }

                const elapsedTime = Date.now() - transactionStartTime;
                const remainingTime = Math.max(0, 1000 - elapsedTime);
                if (remainingTime > 0) {
                    await new Promise((resolve) => setTimeout(resolve, remainingTime));
                }
            }
            throw new Error("Transaction timeout");
        } catch (error) {
            throw new Error(`Failed to send transaction: ${error}`);
        }
    }

    private priorityFeeTiers = {
        min: 0.01,
        mid: 0.5,
        max: 0.95,
    };

    protected async getAddressLookupTableAccounts(addresses: string[]): Promise<any[]> {
        // Implementation for getting address lookup table accounts
        return [];
    }

    private async getComputeBudgetInstructions(
        instructions: TransactionInstruction[],
        feeTier: keyof typeof this.priorityFeeTiers,
    ): Promise<{
        blockhash: string;
        computeBudgetLimitInstruction: TransactionInstruction;
        computeBudgetPriorityFeeInstructions: TransactionInstruction;
    }> {
        try {
            const blockhash = (await this.connection.getLatestBlockhash()).blockhash;
            const messageV0 = new TransactionMessage({
                payerKey: this.#keypair.publicKey,
                recentBlockhash: blockhash,
                instructions: instructions,
            }).compileToV0Message();
            
            const transaction = new VersionedTransaction(messageV0);
            const simulatedTx = this.connection.simulateTransaction(transaction);
            const estimatedComputeUnits = (await simulatedTx).value.unitsConsumed;
            const safeComputeUnits = Math.ceil(
                estimatedComputeUnits ? Math.max(estimatedComputeUnits + 100000, estimatedComputeUnits * 1.2) : 200000,
            );

            const computeBudgetLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
                units: safeComputeUnits,
            });

            const priorityFee = await this.connection
                .getRecentPrioritizationFees()
                .then(
                    (fees) =>
                        fees.sort((a, b) => a.prioritizationFee - b.prioritizationFee)[
                            Math.floor(fees.length * this.priorityFeeTiers[feeTier])
                        ].prioritizationFee,
                );

            const computeBudgetPriorityFeeInstructions = ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: priorityFee,
            });

            return {
                blockhash,
                computeBudgetLimitInstruction,
                computeBudgetPriorityFeeInstructions,
            };
        } catch (error) {
            throw new Error(`Failed to get compute budget instructions: ${error}`);
        }
    }
}

export const solana = (params: SolanaKeypairWalletClientCtorParams) => new SolanaKeypairWalletClient(params);