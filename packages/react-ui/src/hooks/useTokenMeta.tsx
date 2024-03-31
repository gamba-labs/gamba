import { signal } from '@preact/signals-react'
import { PublicKey } from '@solana/web3.js'
import React from 'react'
import { FAKE_TOKEN_MINT, TokenMeta, TokenMetaContext } from '../TokenMetaProvider'

const DEFAULT_DEBOUNCE_MS = 0
const tokenMints = signal(new Set<string>)
const tokenData = signal<Record<string, TokenMeta>>({})

const STANDARD_TOKEN_DATA = {
  So11111111111111111111111111111111111111112: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    baseWager: 0.05 * 1e9,
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: 'USDC',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    usdPrice: 1,
    decimals: 6,
    baseWager: 1 * 1e6,
  },
  [FAKE_TOKEN_MINT.toString()]: {
    name: 'Fake Money',
    symbol: 'FAKE',
    decimals: 9,
    baseWager: 1 * 1e9,
    usdPrice: 0,
  },
} as Record<string, Partial<TokenMeta>>

let fetchTimeout: any

export function useTokenMeta(mint: PublicKey): TokenMeta {
  const context = React.useContext(TokenMetaContext)
  const fetchedTokenData = tokenData.value[mint.toString()]

  React.useEffect(() => {
    // Clear old timeout whenever a new mint should get fetched
    tokenMints.value.add(mint.toString())

    clearTimeout(fetchTimeout)

    fetchTimeout = setTimeout(async () => {
      if (!context.fetcher) return

      const unique = Array
        .from(tokenMints.value)
        .filter((x) => x !== FAKE_TOKEN_MINT.toString() && !Object.keys(tokenData.value).includes(x))

      if (!unique.length) {
        return
      }

      console.debug('Fetching Mint', unique)

      const newData = await context.fetcher(unique)

      tokenData.value = { ...tokenData.value, ...newData }
      tokenMints.value.clear()
    }, context.debounce ?? DEFAULT_DEBOUNCE_MS)

    return () => {
      clearTimeout(fetchTimeout)
    }
  }, [mint.toString()])

  const defaultToken: TokenMeta = {
    mint: new PublicKey(mint),
    name: 'Unknown',
    symbol: mint.toString().substring(0, 3),
    image: undefined,
    decimals: 9,
    baseWager: 1,
    usdPrice: 0,
  }

  const fallback = context.fallback ?? (() => undefined)

  return {
    ...defaultToken,
    ...fetchedTokenData,
    ...STANDARD_TOKEN_DATA[mint.toString()],
    ...fallback(mint),
  }
}

type UseTokenMetaFetcher = (tokenMints: string[]) => (Promise<Record<string, TokenMeta>> | Record<string, TokenMeta>)

/**
 * @deprecated Use <TokenMetaProvider />
 */
useTokenMeta.debouce = DEFAULT_DEBOUNCE_MS

/**
 * @deprecated Use <TokenMetaProvider />
 */
useTokenMeta.fallback = (mint: PublicKey): (Partial<TokenMeta> | undefined) => {
  return undefined
}

/**
 * @deprecated Use <TokenMetaProvider />
 */
useTokenMeta.setFallbackHandler = (cb: (mint: PublicKey) => (Partial<TokenMeta> | undefined)) => {
  // useTokenMeta.fallback = cb
}

/**
 * @deprecated Use <TokenMetaProvider />
 */
useTokenMeta.fetcher = (mints: string[]) => {
  return {}
}

/**
 * @deprecated Use <TokenMetaProvider />
 */
useTokenMeta.setFetcher = (cb: UseTokenMetaFetcher) => {
  // useTokenMeta.fetcher = cb
}
