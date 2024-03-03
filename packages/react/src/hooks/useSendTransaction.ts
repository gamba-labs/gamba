import { AnchorError } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Commitment, TransactionInstruction, TransactionMessage, VersionedTransaction, PublicKey } from '@solana/web3.js'
import React from 'react'
import { StoreApi, create } from 'zustand'
import { PubSub } from '../PubSub'

const transactionEventEmitter = new PubSub<[error: Error]>

export interface TransactionStore {
  state: 'none' | 'sending' | 'error'
  set: StoreApi<TransactionStore>['setState']
}

export const useTransactionStore = create<TransactionStore>(
  (set) => ({
    state: 'none',
    set,
  }),
)

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

interface SendTransactionOptions {
  confirmation?: Commitment
  lookupTable?: PublicKey
}

const getErrorLogs = (error: unknown) => {
  if (typeof error === 'object' && !!error && 'logs' in error && Array.isArray(error.logs)) return error.logs as string[]
  return null
}

export function useSendTransaction() {
  const store = useTransactionStore()
  const { connection } = useConnection()
  const wallet = useWallet()

  return async (
    instructions: TransactionInstruction | Promise<TransactionInstruction> |
    (TransactionInstruction | Promise<TransactionInstruction>)[],
    opts?: SendTransactionOptions,
  ) => {
    try {
      store.set({ state: 'sending' })
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet Not Connected')
      }

      const blockhash = await connection.getLatestBlockhash()

      if (!Array.isArray(instructions)) {
        instructions = [instructions]
      }

      const resolvedInstructions = await Promise.all(instructions)

      // If a lookup table is provided, fetch it
      const lookupTable = []
      if (opts?.lookupTable) {
        const lookupTableResponse = await connection.getAddressLookupTable(opts.lookupTable)
        if (lookupTableResponse?.value) {
          lookupTable.push(lookupTableResponse.value)
        }
      }

      const message = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash.blockhash,
        instructions: resolvedInstructions,
      }).compileToV0Message(lookupTable)

      const transaction = new VersionedTransaction(message)
      const signedTransaction = await wallet.signTransaction(transaction)

      const txId = await connection.sendTransaction(signedTransaction)

      console.debug('Transaction sent', txId)

      const confirmStrategy = {
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature: txId,
      }

      connection.confirmTransaction(confirmStrategy, 'confirmed').then(() => store.set({ state: 'none' }))

      if (opts?.confirmation) {
        const result = await connection.confirmTransaction(confirmStrategy, opts.confirmation)
        console.debug('Transaction confirmed', opts.confirmation, txId, result.value)
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
        console.debug('❌ Error Logs:\n', logs.join('\n'))
      }

      store.set({ state: 'error' })
      throw throwTransactionError(error)
    }
  }
}
