import { NATIVE_MINT } from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"
import { decodeAta, getPoolAddress, getUserBonusAtaForPool, getUserLpAtaForPool, getUserUnderlyingAta, isNativeMint } from "gamba-core-v2"
import { useAccount, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { ParsedTokenAccount, useTokenAccountsByOwner } from "./useTokens"
import { PlatformMeta, getPlatformMeta } from "@/platforms"
import { useBonfidaName } from "./useBonfidaName"
import { minidenticon } from "minidenticons"
import { truncateString } from "@/components/AccountItem"
export * from "./useToast"
export * from "./useTokenMeta"
export * from "./useBonfidaName"
export * from "./useMediaQuery"
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

export function usePlatformMeta(address: PublicKey | string): PlatformMeta {
  const meta = getPlatformMeta(address)
  const domainName = useBonfidaName(address)
  const identicon = React.useMemo(() => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(address.toString())), [address.toString()])

  return meta ?? {
    address: address.toString(),
    name: domainName ?? truncateString(address.toString()),
    image: identicon,
  }
}
