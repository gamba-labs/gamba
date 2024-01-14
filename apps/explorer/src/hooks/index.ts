import { NATIVE_MINT } from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"
import { decodeAta, getPoolAddress, getUserBonusAtaForPool, getUserLpAtaForPool, getUserUnderlyingAta, isNativeMint } from "gamba-core-v2"
import { useAccount, useWalletAddress } from "gamba-react-v2"
import React from "react"

import { ParsedTokenAccount, useTokenAccountsByOwner } from "@/hooks"

export * from "./useToast"
export * from "./useTokens"

export function useNativeBalance() {
  const user = useWalletAddress()
  const userAccount = useAccount(user, info => info)
  const nativeBalance = Number(userAccount?.lamports ?? 0)
  return nativeBalance
}

export function useBalance(mint: PublicKey) {
  const user = useWalletAddress()

  const ata = getUserUnderlyingAta(user, mint)
  const bonusAta = getUserBonusAtaForPool(user, getPoolAddress(mint))
  const lpAta = getUserLpAtaForPool(user, getPoolAddress(mint))

  const tokenAccount = useAccount(ata, decodeAta)
  const bonusAccount = useAccount(bonusAta, decodeAta)
  const lpAccount = useAccount(lpAta, decodeAta)

  const nativeBalance = useNativeBalance()
  const balance = Number(tokenAccount?.amount ?? 0)
  const bonusBalance = Number(bonusAccount?.amount ?? 0)
  const lpBalance = Number(lpAccount?.amount ?? 0)

  return {
    balance: isNativeMint(mint) ? nativeBalance : balance,
    bonusBalance,
    lpBalance,
  }
}
// Modified to always include SOL even when the user doesn't have wSOL
export function useTokenList() {
  const publicKey = useWalletAddress()
  const tokens = useTokenAccountsByOwner(publicKey)
  const nativeBalance = useNativeBalance()

  const nativeToken: ParsedTokenAccount = {
    mint: NATIVE_MINT,
    amount: nativeBalance,
    decimals: 9,
  }

  return React.useMemo(
    () => {
      return [nativeToken, ...tokens.filter(x => !isNativeMint(x.mint))]
    },
    [tokens],
  )
}


export async function fetchJupiterTokenList() {
  const response = await fetch('https://cache.jup.ag/tokens')
  const tokenList = await response.json()

  return tokenList.map(token => ({
    mint: new PublicKey(token.address),
    name: token.name,
    symbol: token.symbol,
    image: token.logoURI,
    decimals: token.decimals,
  }))
}

export const formatTokenAmount = (amount, decimals, symbol = "") => {
  // Ensure amount is a BigInt
  const bigIntAmount = BigInt(amount);

  // Calculate the divisor as a BigInt
  const divisor = BigInt(10 ** decimals);

  // Divide and get remainder as BigInt
  const formattedAmount = bigIntAmount / divisor;
  const fractionalPart = bigIntAmount % divisor;

  // Combine integer and fractional parts for display
  const displayAmount = Number(formattedAmount) + Number(fractionalPart) / Number(divisor);

  // Format with commas and decimal places
  const formattedWithCommas = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayAmount);

  return symbol ? `${formattedWithCommas} ${symbol}` : formattedWithCommas;
}


