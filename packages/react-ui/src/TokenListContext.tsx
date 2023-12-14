import { PublicKey } from "@solana/web3.js"
import React, { PropsWithChildren } from 'react'
import { GAMBA_STANDARD_TOKEN_LIST, TokenMeta } from "./tokens"

const TokenListContext = React.createContext<TokenMeta[]>(GAMBA_STANDARD_TOKEN_LIST)

export function TokenListProvider(props: PropsWithChildren<{tokens: TokenMeta[]}>) {
  return (
    <TokenListContext.Provider value={props.tokens}>
      {props.children}
    </TokenListContext.Provider>
  )
}

export function useTokenList() {
  return React.useContext(TokenListContext)
}

export function useTokenMeta(mint: PublicKey): TokenMeta & {isUnknown?: boolean} {
  const tokens = useTokenList()

  const token = tokens.find((x) => x.mint.equals(mint))

  if (!token) {
    return {
      mint,
      name: 'Unknown',
      symbol: mint.toBase58().substring(0, 3),
      image: undefined,
      decimals: 9,
      baseWager: 1,
      isUnknown: !token,
    }
  }

  return token
}
