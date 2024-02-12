import { signal } from "@preact/signals-react"
import { PublicKey } from "@solana/web3.js"
import React from "react"

const PRICE_FETCH_DEBOUNCE_MS = 200

const tokenMints = signal(new Set<string>)
const priceData = signal<Record<string, number>>({})

let priceFetchTimeout: any

const fetchTokenPrice = async (token: string) => {
  tokenMints.value = new Set([...Array.from(tokenMints.value), token])

  clearTimeout(priceFetchTimeout)

  priceFetchTimeout = setTimeout(async () => {
    const unique = Array.from(tokenMints.value).filter((x) => !Object.keys(priceData.value).includes(x))

    if (!unique.length) {
      return
    }

    const req = await fetch(`https://price.jup.ag/v4/price?ids=${unique.join(',')}`)
    const res = await req.json()
    const data = res.data as Record<string, {price: number}>

    const newData: Record<string, number> = {}

    for (const x of unique) {
      newData[x] = data[x]?.price ?? 0
    }

    priceData.value = {...priceData.value, ...newData}
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
