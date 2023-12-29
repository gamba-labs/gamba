import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js"
import React from "react"
import useSWR from "swr"

export interface TokenMetaData {
  mint: PublicKey
  name: string
  symbol: string
  image?: string
  decimals: number
}

export interface ParsedTokenAccount {
  mint: PublicKey
  amount: number
  decimals: number
}

interface ParsedTokenInfo {
  isNative: boolean,
  mint: string,
  owner: string,
  state: string,
  tokenAmount: {
    amount: string,
    decimals: number,
    uiAmount: number,
    uiAmountString: string
  }
}

const parseTokenAccount = (info: ParsedTokenInfo): ParsedTokenAccount => {
  return {
    mint: new PublicKey(info.mint),
    amount: Number(info.tokenAmount.amount),
    decimals: Number(info.tokenAmount.decimals),
  }
}

export const decodeAta = (acc: AccountInfo<Buffer> | null) => {
  if (!acc) return null
  return AccountLayout.decode(acc.data)
}

async function fetchTokenAccounts(connection: Connection, owner: PublicKey) {
  const tokens = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID })
  return tokens.value.map(token => parseTokenAccount(token.account.data.parsed.info))
}

/**
 * @returns A list of user owned tokens
 */
export function useTokenAccountsByOwner(owner: PublicKey) {
  const { connection } = useConnection()
  const { data = [] } = useSWR("token-accounts-" + owner.toBase58(), () => fetchTokenAccounts(connection, owner))

  return React.useMemo(
    () => [...data.sort((a, b) => {
      const amountDiff = b.amount - a.amount
      if (amountDiff)
        return amountDiff
      return a.mint.toBase58() > b.mint.toBase58() ? 1 : -1
    }).filter(a => a.amount > -1)],
    [data],
  )
}
