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
      // … simulation & send logic unchanged …
      store.set({ state: 'simulating', label: opts?.label })
      if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet Not Connected')
      const payer = wallet.publicKey
      if (!Array.isArray(instructions)) instructions = [instructions]
      const priorityFee = opts?.priorityFee ?? context.priorityFee
      const resolvedInstructions = await Promise.all(instructions)
      const lookupTables = (
        await Promise.all(
          (opts?.lookupTable ?? []).map(async (pk) =>
            (await connection.getAddressLookupTable(pk)).value,
          ),
        )
      ).filter((x): x is AddressLookupTableAccount => !!x)

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

        console.groupCollapsed(`[Simulation logs] ${opts?.label ?? ''}`)
        const logs = sim.value.logs ?? []
        logs.forEach((l) => console.log(l))
        console.groupEnd()

        if (sim.value.err) {
          const rpcErr = sim.value.err as any
          rpcErr.logs = logs
          throw rpcErr
        }
        if (!sim.value.unitsConsumed) {
          const err = new Error('Simulation consumed 0 units')
          ;(err as any).logs = logs
          throw err
        }
        return Math.floor(sim.value.unitsConsumed * (opts?.computeUnitLimitMargin ?? 1))
      })()

      const latest = await connection.getLatestBlockhash(context.blockhashCommitment)
      const tx = await buildTx(computeUnitLimit, latest.blockhash)
      const signedTx = await wallet.signTransaction(tx)
      store.set({ state: 'sending' })

      const txId = await connection.sendTransaction(signedTx, {
        skipPreflight: true,
        preflightCommitment: context.blockhashCommitment,
      })

      store.set({ state: 'processing', txId })
      const strat: TransactionConfirmationStrategy = {
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
        signature: txId,
      }
      connection.confirmTransaction(strat, 'processed').then((res) => {
        store.set({ state: 'confirming', txId, signatureResult: res.value })
      })
      connection.confirmTransaction(strat, 'confirmed').then(() => {
        store.set({ state: 'none' })
      })
      if (opts?.confirmation) {
        await connection.confirmTransaction(strat, opts.confirmation)
      }

      connection
        .getTransaction(txId, { maxSupportedTransactionVersion: 0 })
        .then((info) => {
          console.group(`[On-chain logs] ${txId}`)
          info?.meta?.logMessages?.forEach((l) => console.log(l))
          console.groupEnd()
        })
        .catch((e) => console.warn('Failed to fetch on-chain logs', e))

      return txId
    } catch (err) {
      // —————— Tailored error extraction ——————
      const logs = Array.isArray((err as any).logs) ? (err as any).logs as string[] : []

      // 1) Anchor errors: pull only the human message
      const parsed = logs.length ? AnchorError.parse(logs) : null
      if (parsed) {
        // Extract after “Error Message: ”
        const match = parsed.message.match(/Error Message:\s*(.*)$/)
        const display = match ? match[1] : parsed.message
        const finalError = new Error(display)
        ;(finalError as any).logs = logs
        ;(finalError as any).error = { errorMessage: display }
        console.error('Transaction failed:', display)
        store.set({ state: 'error' })
        throw throwTransactionError(finalError)
      }

      // 2) SPL-token “insufficient funds” or SOL “Transfer:” errors
      const splErrors = logs.filter(
        (l) =>
          l.startsWith('Transfer:') || // SOL lamports errors
          l.includes('Error: insufficient funds'), // SPL-token error line
      )

      if (splErrors.length > 0) {
        // Clean up e.g. “Program log: Error: insufficient funds”
        const cleaned = splErrors.map((l) =>
          l.replace(/^Program log:\s*/, '').replace(/^Error:\s*/, ''),
        )
        const display = cleaned.join('\n')
        const finalError = new Error(display)
        ;(finalError as any).logs = logs
        ;(finalError as any).error = { errorMessage: display }
        console.error('Transaction failed:', display)
        store.set({ state: 'error' })
        throw throwTransactionError(finalError)
      }

      // 3) Fallback: show whatever remains after stripping all “Program ” boilerplate
      const generic = logs.filter((l) => !l.startsWith('Program '))
      const display = generic.length ? generic.join('\n') : (err as Error).message
      const finalError = new Error(display)
      ;(finalError as any).logs = logs
      ;(finalError as any).error = { errorMessage: display }
      console.error('Transaction failed:', display)
      store.set({ state: 'error' })
      throw throwTransactionError(finalError)
    }
  }
}
