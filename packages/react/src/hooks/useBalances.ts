import { useWallet } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey } from '@solana/web3.js'
import { decodeAta, getPoolAddress, getUserBonusAtaForPool, getUserUnderlyingAta, isNativeMint } from 'gamba-core-v2'
import { useAccount } from './useAccount'

// Bad hack to make sure there's a publicKey if user is not connected
const emptyAccount = new Keypair

export function useWalletAddress() {
  const wallet = useWallet()
  return wallet.publicKey ?? emptyAccount.publicKey
}

export function useBalance(publicKey: PublicKey, token: PublicKey, authority?: PublicKey) {
  const ata = getUserUnderlyingAta(publicKey, token)
  const bonusAta = getUserBonusAtaForPool(publicKey, getPoolAddress(token, authority))

  const userAccount = useAccount(publicKey, (info) => info)
  const tokenAccount = useAccount(ata, decodeAta)
  const bonusAccount = useAccount(bonusAta, decodeAta)

  const nativeBalance = Number(userAccount?.lamports ?? 0)
  const balance = Number(tokenAccount?.amount ?? 0)
  const bonusBalance = Number(bonusAccount?.amount ?? 0)

  return {
    nativeBalance,
    balance: isNativeMint(token) ? nativeBalance : balance,
    bonusBalance,
  }
}
