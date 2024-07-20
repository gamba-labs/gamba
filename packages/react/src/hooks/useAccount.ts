import { signal } from '@preact/signals-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import React from 'react'

const DEFAULT_DEBOUNCE_MS = 1
const nextBatch = signal(new Set<string>)
const data = signal<Record<string, AccountInfo<Buffer> | null>>({})

let fetchTimeout: any

export function useAccount<T>(
  address: PublicKey,
  decoder: (x: AccountInfo<Buffer> | null) => T,
) {
  const { connection } = useConnection()
  const fetchedData = data.value[address.toString()]

  React.useEffect(() => {
    // Clear old timeout whenever a new address should get fetched
    nextBatch.value.add(address.toString())

    clearTimeout(fetchTimeout)

    fetchTimeout = setTimeout(async () => {
      const unique = Array.from(nextBatch.value).filter((x) => !Object.keys(data.value).includes(x))
      if (!unique.length) {
        return
      }

      const accounts = await connection.getMultipleAccountsInfo(unique.map((x) => new PublicKey(x)))

      console.debug('Fetching accounts', unique)

      const newData = unique.reduce((prev, curr, ci) => {
        return { ...prev, [curr]: accounts[ci] }
      }, {} as Record<string, AccountInfo<Buffer> | null>)

      data.value = { ...data.value, ...newData }
      nextBatch.value.clear()
    }, DEFAULT_DEBOUNCE_MS)

    const subscription = connection.onAccountChange(address, (info) => {
      data.value = { ...data.value, [address.toString()]: info }
    })

    return () => {
      clearTimeout(fetchTimeout)
      connection.removeAccountChangeListener(subscription)
    }
  }, [address.toString()])

  try {
    return decoder(fetchedData)
  } catch (error) {
    console.log(error)
    return
  }
}
