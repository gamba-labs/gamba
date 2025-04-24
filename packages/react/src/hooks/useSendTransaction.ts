import { AnchorError } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  AddressLookupTableAccount,
  Commitment,
  ComputeBudgetProgram,
  PublicKey,
  TransactionConfirmationStrategy,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import React from 'react'
import { PubSub } from '../PubSub'
import { SendTransactionContext } from '../SendTransactionContext'
import { useTransactionStore } from './useTransactionStore'

const transactionEventEmitter = new PubSub<[error: Error]>()

export const throwTransactionError = (error: any) => {
  transactionEventEmitter.emit(error)
  return error
}

export function useTransactionError(callback: (error: any) => void) {
  React.useLayoutEffect(() => transactionEventEmitter.subscribe(callback), [callback])
}

export interface SendTransactionOptions {
  confirmation?: Commitment
  lookupTable?: PublicKey[]
  priorityFee?: number
  computeUnitLimitMargin?: number
  computeUnits?: number
  label?: string
}

const getErrorLogs = (error: unknown) =>
  typeof error === 'object' && error && 'logs' in error && Array.isArray((error as any).logs)
    ? ((error as any).logs as string[])
    : null

export function useSendTransaction() {
  const store = useTransactionStore()
  const { connection } = useConnection()
  const wallet = useWallet()
  const context = React.useContext(SendTransactionContext)

  return async (
    instructions:
    | TransactionInstruction
    | Promise<TransactionInstruction>
    | (TransactionInstruction | Promise<TransactionInstruction>)[],
    opts?: SendTransactionOptions,
  ) => {
    try {
      store.set({ state: 'simulating', label: opts?.label })

      if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet Not Connected')
      const payer = wallet.publicKey
      if (!Array.isArray(instructions)) instructions = [instructions]

      const priorityFee = opts?.priorityFee ?? context.priorityFee
      const resolvedInstructions = await Promise.all(instructions)

      const lookupTableAddresses = opts?.lookupTable ?? []
      const lookupTables = (await Promise.all(
        lookupTableAddresses.map(async (pk) => (await connection.getAddressLookupTable(pk)).value),
      ).then((a) => a.filter(Boolean))) as AddressLookupTableAccount[]

      const buildTx = async (units: number, recentBlockhash = PublicKey.default.toString()) => {
        const msg = new TransactionMessage({
          payerKey: payer,
          recentBlockhash,
          instructions: [
            ...(priorityFee
              ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })]
              : []),
            ComputeBudgetProgram.setComputeUnitLimit({ units }),
            ...resolvedInstructions,
          ],
        }).compileToV0Message(lookupTables)
        return new VersionedTransaction(msg)
      }

      const computeUnitLimit = await (async () => {
        if (opts?.computeUnits) return opts.computeUnits
        const simulated = await buildTx(context.simulationUnits)
        const sim = await connection.simulateTransaction(simulated, {
          replaceRecentBlockhash: true,
          sigVerify: false,
        })
        if (sim.value.err) throw sim.value.err
        if (!sim.value.unitsConsumed) throw new Error('Simulation consumed 0 units')
        return Math.floor(sim.value.unitsConsumed * (opts?.computeUnitLimitMargin ?? 1))
      })()

      const tx = await buildTx(
        computeUnitLimit,
        (await connection.getLatestBlockhash(context.blockhashCommitment)).blockhash,
      )
      const signedTx = await wallet.signTransaction(tx)
      const size = signedTx.serialize().length
      console.log('SIZE', size)

      store.set({ state: 'sending' })

      const txId = await connection.sendTransaction(signedTx, {
        skipPreflight: true,
        preflightCommitment: context.blockhashCommitment,
      })

      store.set({ state: 'processing', txId })
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(
        context.blockhashCommitment,
      )
      const strat: TransactionConfirmationStrategy = {
        blockhash,
        lastValidBlockHeight,
        signature: txId,
      }

      connection.confirmTransaction(strat, 'processed').then((x) => {
        store.set({ state: 'confirming', txId, signatureResult: x.value })
      })

      connection.confirmTransaction(strat, 'confirmed').then(() => {
        store.set({ state: 'none' })
      })

      if (opts?.confirmation) await connection.confirmTransaction(strat, opts.confirmation)
      return txId
    } catch (err) {
      const logs = getErrorLogs(err)
      const error = logs ? AnchorError.parse(logs) ?? err : err
      if (logs) console.error('Error Logs:\n', logs.join('\n'))
      store.set({ state: 'error' })
      throw throwTransactionError(error)
    }
  }
}
