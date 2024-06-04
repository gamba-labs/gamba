import { StoreApi, create } from 'zustand'

export interface TransactionStore {
  state: 'none' | 'simulating' | 'processing' | 'signing' | 'sending' | 'confirming' | 'error'
  label?: string
  signatureResult?: any
  set: StoreApi<TransactionStore>['setState']
  txId: string | undefined
}

export const useTransactionStore = create<TransactionStore>(
  (set) => ({
    txId: undefined,
    label: undefined,
    state: 'none',
    set,
  }),
)
