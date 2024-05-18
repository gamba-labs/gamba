import { AnchorError } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { AddressLookupTableAccount, Commitment, ComputeBudgetProgram, PublicKey, TransactionConfirmationStrategy, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import React from 'react'
import { PubSub } from '../PubSub'
import { SendTransactionContext } from '../SendTransactionContext'
import { useTransactionStore } from './useTransactionStore'

const transactionEventEmitter = new PubSub<[error: Error]>

export const throwTransactionError = (error: any) => {
  transactionEventEmitter.emit(error)
  return error
}

export function useTransactionError(callback: (error: Error) => void) {
  React.useLayoutEffect(
    () => transactionEventEmitter.subscribe(callback),
    [callback],
  )
}

export interface SendTransactionOptions {
  confirmation?: Commitment
  lookupTable?: PublicKey[]
  priorityFee?: number
  computeUnitLimitMargin?: number
  /** Skip simulation and manually set compute units */
  computeUnits?: number
  label?: string
}

const getErrorLogs = (error: unknown) => {
  if (typeof error === 'object' && !!error && 'logs' in error && Array.isArray(error.logs)) return error.logs as string[]
  return null
}

export function useSendTransaction() {
  const store = useTransactionStore()
  const { connection } = useConnection()
  const wallet = useWallet()
  const context = React.useContext(SendTransactionContext)

  return async (
    instructions: TransactionInstruction | Promise<TransactionInstruction> |
    (TransactionInstruction | Promise<TransactionInstruction>)[],
    opts?: SendTransactionOptions,
  ) => {
    try {
      store.set({ state: 'simulating', label: opts?.label })

      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet Not Connected')
      }

      const payer = wallet.publicKey

      if (!Array.isArray(instructions)) {
        instructions = [
          instructions,
        ]
      }

      const priorityFee = opts?.priorityFee ?? context.priorityFee

      const resolvedInstructions = await Promise.all(instructions)

      const lookupTableAddresses = opts?.lookupTable ?? []

      // Fetch lookup tables
      const lookupTables = await Promise.all(
        lookupTableAddresses
          .map(async (x) => {
            const response = await connection.getAddressLookupTable(x)
            return response?.value
          })
          .filter((x) => !!x),
      ) as AddressLookupTableAccount[]

      const createTx = async (units: number, recentBlockhash = PublicKey.default.toString()) => {
        const message = new TransactionMessage({
          payerKey: payer,
          recentBlockhash,
          instructions: [
            ...(priorityFee ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })] : []),
            ComputeBudgetProgram.setComputeUnitLimit({ units }),
            ...resolvedInstructions,
          ],
        }).compileToV0Message(lookupTables)
        return new VersionedTransaction(message)
      }

      const computeUnitLimit = await (
        async () => {
          if (opts?.computeUnits) {
            return opts.computeUnits
          }
          // If computeUnits has not been set manually, simulate a transaction
          const simulatedTx = await createTx(context.simulationUnits)
          const simulation = await connection.simulateTransaction(simulatedTx, { replaceRecentBlockhash: true, sigVerify: false })
          if (simulation.value.err) {
            throw simulation.value.err
          }
          if (!simulation.value.unitsConsumed) {
            throw new Error('Simulation did not consume any units.')
          }
          return Math.floor(simulation.value.unitsConsumed * (opts?.computeUnitLimitMargin ?? 1))
        }
      )()

      // Create and sign the actual transaction
      const transaction = await createTx(computeUnitLimit, (await connection.getLatestBlockhash()).blockhash)
      const signedTransaction = await wallet.signTransaction(transaction)

      store.set({ state: 'sending' })
      const txId = await connection.sendTransaction(signedTransaction, { skipPreflight: true })

      store.set({ state: 'processing', txId })
      console.debug('TX sent', txId)

      const blockhash = await connection.getLatestBlockhash()

      const confirmStrategy: TransactionConfirmationStrategy = {
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature: txId,
      }

      connection.confirmTransaction(confirmStrategy, 'processed').then((x) => {
        console.debug('TX processed', x)
        store.set({
          state: 'confirming',
          txId,
          signatureResult: x.value,
        })
      })

      connection.confirmTransaction(confirmStrategy, 'confirmed').then((x) => {
        console.debug('TX confirmed', x)
        store.set({ state: 'none' })
      })

      if (opts?.confirmation) {
        await connection.confirmTransaction(confirmStrategy, opts.confirmation)
      }

      return txId
    } catch (err) {
      const logs = getErrorLogs(err)

      const error = (() => {
        if (logs) {
          const anchorError = AnchorError.parse(logs)
          if (anchorError) {
            return anchorError
          }
        }
        return err
      })()

      if (logs) {
        console.error('Error Logs:\n', logs.join('\n'))
      }

      store.set({ state: 'error' })
      throw throwTransactionError(error)
    }
  }
}
