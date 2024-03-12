import { signal } from '@preact/signals-react'
import { PublicKey } from '@solana/web3.js'
import React from 'react'
import { FAKE_TOKEN_MINT, TokenMeta } from '../tokens'

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
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAYAAADG4PRLAAAAAXNSR0IArs4c6QAAA55JREFUeJztndtNI0EURIvV5kAopGJ+CIEE+F0ScAj+wakQykYBH6jRaDSe6XdXtetISCBhsHxUtx/Td+bh3+nrC0aWP6PfgCnDAsWxQHEsUBwLFMcCxbFAcSxQHAsUxwILefv4+RrF33H/ug2X6/n3+5fT68B30oepEriUt/VzbUYmL/Awy2Z2rKxaqdyS9/5c5U8nMUUCU5J2uZ6bJ7Mn8gnck/Fyeo2SlZrKvdLZO4XSArfkfP7/kfH0mJayGIkxY54FJrAWGOQFakgsmaj0kCk7BsaUxrXQ3vSYpUom8Ch5a1KSuFdKc4W0TKKcwFR5gVoSgWORPcdBqRKaKy/1d4/K856g3pMYGYEl8nJek7NW9EL+BjUX3rUmNmtZI+QBAgK3klcqIfb1Crs29AJbUSOJo1K3hHYWurfLUpPY2SnrpSmZBLZalKeUU0YoBdaYcaagLJH+inyKvHU5HL2V1gPKBDLDlkILzIBJogWKY4HiWKA4FiiOBYpjgeJYoDgWKI4FimOB4ligOBYojgWKY4HiWKA4FigOvcCUnobS9jJFKAWuj/C1lPj0eJYWTSkQKJPYGqYzorQHewMlRwyX0muVVyZ5AHECA7WSyJTgmtAnMNCjsfMItvQBAgkM5CZx9sO9MgKBsRIZ0weICdw6UNtDIqs8QEjg3mnolhKZ5QEiAmN6Be91TKQXuCevh0SmPogtqAXGJK/H/iezRFqBKS3WORJTSymrREqBOf3xPSQyQilwTcsPWn08pBfIlhI2ifQCGWGSaIHiWKA4FiiOBYpjgeJYoDgWKI4FimOB4ligOBYojgWKY4HiWKA4FijOtALZLgS3YthNz98+6j84416kLRmawJjn8bVuC1NvOxteQrck9urOVZcHDBS4LJ+3JC5F1u5ln0EeQJDAQI/nzQZmkQcIPLklpDCcBAsffu6EpVQeW7cSTQKB9imcKXkBKoHAbYlbY2IKNeSxpQ8YLLB0HRgrZVZ5wOC7VJQ8l315OnpvPJxZHkBYQnO4JWnGMW+NnMBQdo8W+7WSx5w+YGAJzSmft8bMFs0m7OICQxJYU14LVOQBgiV0i5qlTkkeMInAWqjJAwZtpW2Vw72yGls+19tu9wBNAt+f641zOUlSTB9AervJdRpLxR4lUlUeQJTAJbVnnHuClOUBApeTWpXVy/UsLw8gLaGBUEp7rgHVoE6gxR1DOQaaeCxQHAsUxwLFsUBxLFAcCxTnGwzKf0r3c1xCAAAAAElFTkSuQmCC',
    decimals: 9,
    baseWager: 1 * 1e9,
    usdPrice: 0,
  },
} as Record<string, Partial<TokenMeta>>

let fetchTimeout: any

export function useTokenMeta(mint: PublicKey): TokenMeta {
  const fetchedTokenData = tokenData.value[mint.toString()]

  React.useEffect(() => {
    console.log('Fetching', mint.toString())
    // Clear old timeout whenever a new mint should get fetched
    tokenMints.value.add(mint.toString())

    clearTimeout(fetchTimeout)

    fetchTimeout = setTimeout(async () => {
      const unique = Array.from(tokenMints.value).filter((x) => !Object.keys(tokenData.value).includes(x))
      if (!unique.length) {
        return
      }

      const newData = await useTokenMeta.fetcher(unique) //fetchTokenMeta2(mint.toString())
      tokenData.value = { ...tokenData.value, ...newData }
      tokenMints.value.clear()
    }, useTokenMeta.debouce)

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

  return {
    ...defaultToken,
    ...fetchedTokenData,
    ...STANDARD_TOKEN_DATA[mint.toString()],
    ...useTokenMeta.fallback(mint),
  }
}

type UseTokenMetaFetcher = (tokenMints: string[]) => (Promise<Record<string, TokenMeta>> | Record<string, TokenMeta>)

useTokenMeta.debouce = DEFAULT_DEBOUNCE_MS

useTokenMeta.fallback = (mint: PublicKey): (Partial<TokenMeta> | undefined) => {
  return undefined
}

useTokenMeta.setFallbackHandler = (cb: (mint: PublicKey) => (Partial<TokenMeta> | undefined)) => {
  useTokenMeta.fallback = cb
}

useTokenMeta.fetcher = (mints: string[]) => {
  return {}
}

useTokenMeta.setFetcher = (cb: UseTokenMetaFetcher) => {
  useTokenMeta.fetcher = cb
}
