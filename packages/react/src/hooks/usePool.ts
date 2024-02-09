import { PublicKey } from '@solana/web3.js'
import { BPS_PER_WHOLE, decodeAta, decodeGambaState, decodePool, getGambaStateAddress, getPoolAddress, getPoolJackpotTokenAccountAddress } from 'gamba-core-v2'
import { useAccount } from './useAccount'

export interface UiPoolState {
  publicKey: PublicKey
  token: PublicKey
  liquidity: bigint
  minWager: number
  maxPayout: number
  gambaFee: number
  poolFee: number
  jackpotBalance: number
}

export function usePool(token: PublicKey): UiPoolState {
  const publicKey = getPoolAddress(token)
  const account = useAccount(publicKey, decodePool)
  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)

  const jackpotUnderlyingTokenAccount = useAccount(getPoolJackpotTokenAccountAddress(publicKey), decodeAta)
  const jackpotBalance = jackpotUnderlyingTokenAccount?.amount ?? BigInt(0)

  if (!account) {
    return {
      token,
      publicKey,
      liquidity: BigInt(0),
      minWager: 0,
      maxPayout: 0,
      gambaFee: 0,
      poolFee: 0,
      jackpotBalance: 0,
    }
  }

  const liquidity = BigInt(account.liquidityCheckpoint)

  const customGambaFeeBps = account.customGambaFeeBps.toNumber()
  const customPoolFeeBps = account.customPoolFeeBps.toNumber()

  const gambaFee = ((customGambaFeeBps || gambaState?.gambaFeeBps.toNumber()) ?? 0) / BPS_PER_WHOLE
  const poolFee = ((customPoolFeeBps || gambaState?.defaultPoolFee.toNumber()) ?? 0) / BPS_PER_WHOLE
  const maxPayoutBps = (account.customMaxPayoutBps?.toNumber() || gambaState?.maxPayoutBps?.toNumber()) ?? 0

  const maxPayout = Number(liquidity * BigInt(maxPayoutBps)) / BPS_PER_WHOLE

  return {
    token,
    publicKey,
    minWager: account.minWager.toNumber(),
    liquidity,
    maxPayout,
    gambaFee,
    poolFee,
    jackpotBalance: Number(jackpotBalance),
  }
}
