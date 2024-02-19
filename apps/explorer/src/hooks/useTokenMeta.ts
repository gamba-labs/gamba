import { signal } from '@preact/signals-react'
import { PublicKey } from '@solana/web3.js'
import { Helius } from 'helius-sdk'
import React from 'react'

// How many MS we should wait to aggregate pubkeys before fetching
const DEBOUNCE_MS = 1

const KNOWN_DATA = {
  'So11111111111111111111111111111111111111112': {
    name: 'Solana',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
} as Record<string, Partial<TokenData>>

const helius = new Helius(import.meta.env.VITE_HELIUS_API_KEY)

export interface TokenData {
  // supply: bigint
  mint: PublicKey
  decimals: number
  image?: string
  name?: string
  symbol?: string
  usdPrice: number
}

const tokenMints = signal(new Set<string>)
const tokenData = signal<Record<string, TokenData>>({})

let fetchTimeout: any

const fetchTokenMeta = async (token: string) => {
  tokenMints.value = new Set([...Array.from(tokenMints.value), token])

  clearTimeout(fetchTimeout)

  fetchTimeout = setTimeout(async () => {
    const unique = Array.from(tokenMints.value).filter((x) => !Object.keys(tokenData.value).includes(x))
    if (!unique.length) {
      return
    }

    const res = await helius.rpc.getAssetBatch({ ids: unique })

    const tokens = res
      .reduce((prev, x) => {
        const info = (x as any).token_info
        const data = {
          mint: new PublicKey(x.id),
          image: x.content?.links?.image,
          symbol: info.symbol,
          decimals: info.decimals,
          name: x.content?.metadata.name ?? info.symbol,
          usdPrice: info.price_info?.price_per_token ?? 0,
          ...KNOWN_DATA[x.id.toString()]
        }
        return {...prev, [x.id.toString()]: data}
      }, {} as Record<string, TokenData> )

    tokenData.value = { ...tokenData.value, ...tokens }
    tokenMints.value = new Set
  }, DEBOUNCE_MS)
}

export function useTokenMeta(mint: string | PublicKey) {
  const get = useGetTokenMeta()

  React.useEffect(() => {
    fetchTokenMeta(mint.toString())
  }, [mint])

  return get(mint)
}

export function useGetTokenMeta() {
  return (mint: string | PublicKey) => {
    return tokenData.value[mint.toString()] ?? {
      mint: new PublicKey(mint),
      name: "Unknown",
      symbol: mint.toString().substring(0, 3),
      image: KNOWN_DATA[mint.toString()],
      decimals: 9,
      usdPrice: 0,
      ...KNOWN_DATA[mint.toString()]
    }
  }
}
