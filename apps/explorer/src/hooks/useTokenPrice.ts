import { signal } from "@preact/signals-react"
import { PublicKey } from "@solana/web3.js"
import React from "react"

const PRICE_FETCH_DEBOUNCE_MS = 200

const tokenMints = signal(new Set<string>)
const priceData = signal<Record<string, number>>({})

let priceFetchTimeout: any

function createBatches<T>(array: T[], batchSize: number) {
  const batches: T[][] = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

const fetchTokenPrice = async (token: string) => {
  tokenMints.value = new Set([...Array.from(tokenMints.value), token])

  clearTimeout(priceFetchTimeout)

  priceFetchTimeout = setTimeout(async () => {
    const unique = Array.from(tokenMints.value).filter((x) => !Object.keys(priceData.value).includes(x))

    if (!unique.length) {
      return
    }

    // Create batches of 100 pubkeys since that's the API limit
    const batches = createBatches(unique, 100)

    await Promise.all(
      batches.map(
        async (batch) => {
          const req = await fetch(`https://price.jup.ag/v4/price?ids=${batch.join(',')}`)
          const res = await req.json()
          const data = res.data as Record<string, {price: number}>

          const newData: Record<string, number> = {}

          for (const mint of batch) {
            newData[mint] = data[mint]?.price ?? 0
          }

          priceData.value = {...priceData.value, ...newData}
        }
      )
    )

    tokenMints.value = new Set
  }, PRICE_FETCH_DEBOUNCE_MS)
}

export function useTokenPrice(mint: string | PublicKey) {
  React.useEffect(() => {
    fetchTokenPrice(mint.toString())
  }, [mint])

  return priceData.value[mint.toString()] ?? 0
}

export function useGetTokenPrice() {
  return (mint: string | PublicKey) => priceData.value[mint.toString()] ?? 0
}
