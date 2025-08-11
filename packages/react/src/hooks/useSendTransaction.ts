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

// ——— Pub/Sub to broadcast transaction errors —————————————————————
const transactionEventEmitter = new PubSub<[error: Error]>()

export const throwTransactionError = (err: any) => {
  transactionEventEmitter.emit(err)
  return err
}

export function useTransactionError(callback: (error: any) => void) {
  React.useLayoutEffect(
    () => transactionEventEmitter.subscribe(callback),
    [callback],
  )
}

// ——— The main hook —————————————————————————————————————————
export interface SendTransactionOptions {
  confirmation?: Commitment       // optional finality to wait for
  lookupTable?: PublicKey[]       // optional LUT addresses
  priorityFee?: number            // μLamports per CU
  computeUnitLimitMargin?: number // margin multiplier on simulated CU
  computeUnits?: number           // override CU limit
  label?: string                  // label for console logs
}

export function useSendTransaction() {
  const store = useTransactionStore()
  const { connection } = useConnection()
  const wallet = useWallet()
  const ctx = React.useContext(SendTransactionContext)

  return async (
    instructions:
    | TransactionInstruction
    | Promise<TransactionInstruction>
    | (TransactionInstruction | Promise<TransactionInstruction>)[],
    opts: SendTransactionOptions = {},
  ) => {
    try {
      // — 0) Pre-flight checks & resolve instructions
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet Not Connected')
      }
      const payer = wallet.publicKey
      if (!Array.isArray(instructions)) instructions = [instructions]
      const resolvedIx = await Promise.all(instructions)

      // — 1) Optional Address Lookup Tables
      const lutAccounts: AddressLookupTableAccount[] = (
        await Promise.all(
          (opts.lookupTable ?? []).map(async (pk) =>
            (await connection.getAddressLookupTable(pk)).value,
          ),
        )
      ).filter(Boolean) as AddressLookupTableAccount[]

      // — 2) Helper to build a versioned tx
      const priorityFee = opts.priorityFee ?? ctx.priorityFee
      const buildTx = async (units: number, recentBlockhash: string) => {
        const msg = new TransactionMessage({
          payerKey: payer,
          recentBlockhash,
          instructions: [
            ...(priorityFee
              ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })]
              : []),
            ComputeBudgetProgram.setComputeUnitLimit({ units }),
            ...resolvedIx,
          ],
        }).compileToV0Message(lutAccounts)
        return new VersionedTransaction(msg)
      }

      // — 3) Simulate to get CU usage (unless overridden)
      store.set({ state: 'simulating', label: opts.label })
      const latest = await connection.getLatestBlockhash(ctx.blockhashCommitment)
      const simUnits = opts.computeUnits ?? ctx.simulationUnits
      const simulated = await buildTx(simUnits, latest.blockhash)
      const simRes = await connection.simulateTransaction(simulated, {
        replaceRecentBlockhash: true,
        sigVerify: false,
      })

      console.groupCollapsed(`[Simulation logs] ${opts.label ?? ''}`)
      simRes.value.logs?.forEach((l) => console.log(l))
      console.groupEnd()

      if (simRes.value.err) {
        const rpcErr = simRes.value.err as any
        rpcErr.logs = simRes.value.logs
        throw rpcErr
      }
      const consumed = simRes.value.unitsConsumed ?? 0
      if (consumed === 0) {
        const err = new Error('Simulation consumed 0 units')
        ;(err as any).logs = simRes.value.logs
        throw err
      }
      const finalUnits =
        opts.computeUnits ??
        Math.floor(consumed * (opts.computeUnitLimitMargin ?? 1.1))

      // — 4) Build, sign & send
      const tx = await buildTx(finalUnits, latest.blockhash)
      const signed = await wallet.signTransaction(tx)
      store.set({ state: 'sending' })

      const signature = await connection.sendTransaction(signed, {
        skipPreflight: true,
        preflightCommitment: ctx.blockhashCommitment,
      })

      // — 5) Fire off confirmation flows
      const strat: TransactionConfirmationStrategy = {
        signature,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      }
      connection
        .confirmTransaction(strat, 'processed')
        .then((res) =>
          store.set({
            state: 'confirming',
            txId: signature,
            signatureResult: res.value,
          }),
        )
      connection
        .confirmTransaction(strat, 'confirmed')
        .then(() => store.set({ state: 'none' }))

      if (opts.confirmation) {
        await connection.confirmTransaction(strat, opts.confirmation)
      }

      // — 6) Fetch on-chain logs (always valid Finality)
      connection
        .getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',      // ← must be a Finality
        })
        .then((info) => {
          console.group(`[On-chain logs] ${signature}`)
          info?.meta?.logMessages?.forEach((l) => console.log(l))
          console.groupEnd()
        })
        .catch((e) => console.warn('Failed to fetch on-chain logs', e))

      return signature
    } catch (err) {
      // — 7) Error parsing (unchanged) ——————————————————————————
      const logs: string[] = Array.isArray((err as any).logs)
        ? (err as any).logs
        : []

      // 7A) Anchor‐style error
      const parsed = logs.length ? AnchorError.parse(logs) : null
      if (parsed) {
        const m = parsed.message.match(/Error Message:\s*(.*)$/)
        const msg = m ? m[1] : parsed.message
        const e = new Error(msg)
        ;(e as any).logs = logs
        ;(e as any).error = { errorMessage: msg }
        store.set({ state: 'error' })
        throw throwTransactionError(e)
      }

      // 7B) SPL or lamport “insufficient funds”
      const splErrs = logs.filter(
        (l) =>
          l.startsWith('Transfer:') || l.includes('Error: insufficient funds'),
      )
      if (splErrs.length) {
        const cleaned = splErrs.map((l) =>
          l.replace(/^Program log:\s*/, '').replace(/^Error:\s*/, ''),
        )
        const msg = cleaned.join('\n')
        const e = new Error(msg)
        ;(e as any).logs = logs
        ;(e as any).error = { errorMessage: msg }
        store.set({ state: 'error' })
        throw throwTransactionError(e)
      }

      // 7C) Fallback
      const generic = logs.filter((l) => !l.startsWith('Program '))
      const msg = generic.length ? generic.join('\n') : (err as Error).message
      const e = new Error(msg)
      ;(e as any).logs = logs
      ;(e as any).error = { errorMessage: msg }
      store.set({ state: 'error' })
      throw throwTransactionError(e)
    }
  }
}
