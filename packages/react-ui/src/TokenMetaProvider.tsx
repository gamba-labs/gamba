import React from 'react'
import { PublicKey } from '@solana/web3.js'

export const FAKE_TOKEN_MINT = new PublicKey('FakeCDoCX1NWywV9m63fk7gmV9S4seMoyqzcNYEmRYjy')

export interface TokenMeta {
  mint: PublicKey
  name: string
  symbol: string
  image?: string
  decimals: number
  baseWager: number
  /** Set this value if you want to use a private pool */
  poolAuthority?: PublicKey
  usdPrice: number
}

type TokenMetaFetcher = (ids: string[]) => (Record<string, TokenMeta> | Promise<Record<string, TokenMeta>>)

type TokenMetaList = PartialTokenMetaWithMint[]

interface TokenMetaProps {
  fetcher?: TokenMetaFetcher
  tokens?: TokenMetaList
  debounce?: number
}

type PartialTokenMetaWithMint = Partial<TokenMeta> & {mint: PublicKey}

interface TokenMetaContext extends TokenMetaProps {
  fallback?: (mint: string | PublicKey) => Partial<PartialTokenMetaWithMint> | undefined
}

export const TokenMetaContext = React.createContext<TokenMetaContext>({})

export function TokenMetaProvider({ children, tokens = [], fetcher, debounce }: React.PropsWithChildren<TokenMetaProps>) {
  const byMint = React.useMemo(
    () => {
      return tokens.reduce<Record<string, PartialTokenMetaWithMint>>((prev, value) => ({
        ...prev,
        [value.mint.toString()]: value,
      }), {})
    },
    [tokens],
  )

  const fallback = (mint: string | PublicKey): PartialTokenMetaWithMint | undefined => {
    return byMint[mint.toString()]
  }

  return (
    <TokenMetaContext.Provider value={{ tokens, fallback, fetcher, debounce }}>
      {children}
    </TokenMetaContext.Provider>
  )
}
