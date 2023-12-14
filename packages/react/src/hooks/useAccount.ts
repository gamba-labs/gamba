import { useConnection } from '@solana/wallet-adapter-react'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import React from 'react'
import { create } from 'zustand'

interface AccountsStore {
  accountByAddress: Record<string, AccountInfo<Buffer> | null>
  numListenersByAddress: Record<string, number>
  subscribe: (connection: Connection, address: PublicKey) => void
  unsubscribe: (address: PublicKey) => void
}

// Todo
const _tmpAddressCache = new Set<string>()

export const useAccountStore = create<AccountsStore>(
  (set, get) => ({
    accountByAddress: {},

    numListenersByAddress: {},

    async subscribe(connection, address) {
      const _address = address.toBase58()
      // const listeners = get().numListenersByAddress[_address] ?? 0

      if (!_tmpAddressCache.has(address.toBase58())) {
        _tmpAddressCache.add(address.toBase58())
        const setAccount = (info: AccountInfo<Buffer> | null) => {
          set((x) => ({
            accountByAddress: {
              ...x.accountByAddress,
              [_address]: info,
            },
          }))
        }
        // Todo unsubscribe when no listeners
        const subscription = connection.onAccountChange(address, setAccount)

        console.debug('Account subscription', address.toBase58(), subscription, get())

        const accountInfo = await connection.getAccountInfo(address)

        setAccount(accountInfo)
      }

      set((x) => ({
        numListenersByAddress: {
          ...x.numListenersByAddress,
          [_address]: (x.numListenersByAddress[_address] ?? 0) + 1,
        },
      }))
    },

    unsubscribe(address) {
      const _address = address.toBase58()
      const listeners = get().numListenersByAddress[_address] ?? 0
      console.debug('Unsubscribe', address.toBase58(), listeners, get())
    },
  }),
)

/**
 * Returns a Solana account, auto fetch & auto updates
 */
export function useAccount<T>(
  address: PublicKey,
  decoder: (x: AccountInfo<Buffer> | null) => T,
) {
  const { connection } = useConnection()
  const subscribe = useAccountStore((state) => state.subscribe)
  const unsubscribe = useAccountStore((state) => state.unsubscribe)
  const account = useAccountStore((state) => state.accountByAddress[address.toBase58()] ?? null)

  React.useEffect(() => {
    subscribe(connection, address)
    return () => unsubscribe(address)
  }, [connection, address.toBase58()])

  return decoder(account)
}
