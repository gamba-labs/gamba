import { create } from "zustand";

interface Token {
  mint: string
  decimals: 6
  name: string
  symbol: string
  logo: string
}

export interface TokenStore {
  tokenMints: Set<string>
  tokensByMint: Record<string, Token>

  setTokens: (tokens: Token[]) => void

  addTokens: (tokens: Token[]) => void
}

export const useTokenStore = create<TokenStore>(
  (set) => ({
    tokenMints: new Set,
    tokensByMint: {},

    setTokens(tokens) {

    },

    addTokens(tokens) {

    },
  })
)
