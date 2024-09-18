import { AnchorError, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
  ComputeBudgetProgram,
} from "@solana/web3.js";

const getErrorLogs = (error: unknown) => {
  if (
    typeof error === "object" &&
    !!error &&
    "logs" in error &&
    Array.isArray(error.logs)
  )
    return error.logs as string[];
  return null;
};

export async function sendTransaction(
  provider: any,
  instructions:
    | TransactionInstruction
    | Promise<TransactionInstruction>
    | (TransactionInstruction | Promise<TransactionInstruction>)[],
  // opts?: SendTransactionOptions
  lookupTable?: PublicKey, // Optional ALT public key
  priorityFee?: number
) {
  try {
    const blockhash = await provider.connection.getLatestBlockhash();

    if (!Array.isArray(instructions)) {
      instructions = [instructions];
    }

    const resolvedInstructions = await Promise.all(instructions);

    // If a lookup table is provided, fetch it
    const lookupTables = [];
    if (lookupTable) {
      const lookupTableResponse = await provider.connection.getAddressLookupTable(
        lookupTable
      );
      if (lookupTableResponse?.value) {
        lookupTables.push(lookupTableResponse.value);
      }
    }

    // Conditionally create priority fee instruction
    let priorityFeeInstructions = []
    if (priorityFee !== undefined) {
      const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFee,
      });
      priorityFeeInstructions.push(priorityFeeIx);
    }

    const simulationComputeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000, // 1.4M compute units
    })

    // create simulation transaction message
    const simulateMessageV0 = new TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: [...priorityFeeInstructions, simulationComputeLimitIx, ...resolvedInstructions],
    }).compileToV0Message();

    const simulationResult =
      await provider.connection.simulateTransaction(
        new VersionedTransaction(simulateMessageV0),
        {
          commitment: "processed",
          sigVerify: false,
        }
      );

    const simulationUnitsConsumed = simulationResult.value.unitsConsumed!;

    console.log('untis needed:', simulationUnitsConsumed)
    
    const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.floor(simulationUnitsConsumed * 1.05), // 5% buffer
    })

    const message = new TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: [...priorityFeeInstructions, computeLimitIx, ...resolvedInstructions],
    }).compileToV0Message(lookupTables);

    const transaction = new VersionedTransaction(message);
    const signedTransaction = await provider.wallet.signTransaction(transaction);

    const txId = await provider.connection.sendTransaction(signedTransaction, { skipPreflight: true  });

    console.debug('Transaction sent', txId)

    return txId;
  } catch (err) {
    const logs = getErrorLogs(err);

    const error = (() => {
      if (logs) {
        const anchorError = AnchorError.parse(logs);
        if (anchorError) {
          return anchorError;
        }
      }
      return err;
    })();

    // if (logs) {
    //   console.debug('❌ Error Logs:\n', logs.join('\n'))
    // }

    throw error;
  }
}


export const formatPublicKey = (publicKey) => publicKey.toString();
export const formatBN = (bn) => bn.toString();
export const parseGameState = (stateObject) => {
  const stateKeys = Object.keys(stateObject);
  if (stateKeys.length > 0) {
    const currentState = stateKeys[0];
    return currentState.charAt(0).toUpperCase() + currentState.slice(1);
  }
  return "Unknown State";
};
export const parseWagerType = (wagerTypeObject) => {
  const wagerTypeKeys = Object.keys(wagerTypeObject);
  return wagerTypeKeys.length > 0 ? wagerTypeKeys[0] : "Unknown";
};