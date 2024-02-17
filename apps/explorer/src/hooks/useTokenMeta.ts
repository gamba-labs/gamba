import { PublicKey } from "@solana/web3.js"
import { NATIVE_MINT } from "gamba-core-v2"
import React from "react"
import useSWR, { preload } from "swr"

preload('token-list', fetchTokenList)

interface JupiterTokenListResponse {
  mint: string
  address: string
  name: string
  decimals: number
  symbol: string
  logoURI: string
}

async function fetchTokenList() {
  const response = await fetch('https://cache.jup.ag/tokens')
  const data = await response.json() as JupiterTokenListResponse[]

  const byAddress: Record<string, TokenMeta> = {}

  for (const token of data) {
    byAddress[token.address] = {
      mint: new PublicKey(token.address),
      name: token.name,
      symbol: token.symbol,
      image: token.logoURI,
      decimals: token.decimals,
    }
  }

  return byAddress
}

interface TokenMeta {
  mint: PublicKey
  name: string
  symbol: string
  image: string | undefined
  decimals: number
}

export function useJupiterList() {
  const { data: list = {} } = useSWR("token-list", fetchTokenList)
  return list
}

export function useTokenMeta(mint: string | PublicKey): TokenMeta {
  const getTokenMeta = useGetTokenMeta()

  return React.useMemo(() => {
    const jupMeta = getTokenMeta(mint)

    return {
      mint: new PublicKey(mint),
      name: jupMeta.name,
      symbol: jupMeta.symbol,
      image: jupMeta.image,
      decimals: jupMeta.decimals,
    }
  }, [getTokenMeta, mint])
}

export function useGetTokenMeta() {
  const list = useJupiterList()

  return React.useCallback((mint: string | PublicKey): TokenMeta => {
    const jupData = list[mint.toString()]

    if (mint.toString() === NATIVE_MINT.toString()) {
      return {
        ...jupData,
        mint: new PublicKey(mint),
        decimals: 9,
        symbol: "SOL",
        name: 'Solana',
      }
    }

    return jupData || {
      mint: new PublicKey(mint),
      name: "Unknown",
      symbol: mint.toString().substring(0, 3),
      image: undefined,
      decimals: 9,
    }
  }, [list])
}
