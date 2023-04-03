import { useConnection } from '@solana/wallet-adapter-react'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { useEffect, useRef } from 'react'

export function useAccountChangeListener(
  account: PublicKey | null,
  callback: (account: AccountInfo<Buffer> | null, previous: AccountInfo<Buffer> | null) => void,
) {
  const { connection } = useConnection()
  const previous = useRef<AccountInfo<Buffer>>(null)
  const handler = (account: AccountInfo<Buffer> | null) => {
    callback(account, previous.current)
    ;(previous as any).current = account
  }
  useEffect(() => {
    if (account) {
      connection.getAccountInfo(account)
        .then(handler)
        .catch((err) => {
          console.error('🍤 Failed to getAccountInfo', err)
        })
      const listener = connection.onAccountChange(account, handler)
      return () => {
        connection.removeAccountChangeListener(listener)
      }
    }
  })
}
