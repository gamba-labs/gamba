import { useConnection } from '@solana/wallet-adapter-react'
import { decodeGame, getGameAddress, getNextResult } from 'gamba-core-v2'
import { useAccount }     from './useAccount'
import { useWalletAddress } from './useBalances'
import { useGambaPlay }   from './useGambaPlay'
import { useTransactionStore } from './useTransactionStore'
import type { TransactionStore } from './useTransactionStore'

export function useNextResult() {
  const { connection } = useConnection()
  const userAddress    = useWalletAddress()
  const game           = useAccount(getGameAddress(userAddress), decodeGame)

  return () => {
    const prevNonce = game?.nonce?.toNumber() ?? 0
    return getNextResult(connection, userAddress, prevNonce)
  }
}

export function useGamba() {
  const userAddress      = useWalletAddress()
  const game             = useAccount(getGameAddress(userAddress), decodeGame)
  const userCreated      = !!game
  const nextRngSeedHashed = game?.nextRngSeedHashed
  const txStore          = useTransactionStore()

  // ─── only these states should lock the UI ──────────────────────
  const busyStates: TransactionStore['state'][] = [
    'simulating',
    'processing',
    'signing',
    'sending',
    'confirming',
  ]

  const isBusy    = busyStates.includes(txStore.state)
  const isPlaying = isBusy || !!game?.status.ResultRequested

  const play   = useGambaPlay()
  const result = useNextResult()

  return {
    play,
    result,
    userCreated,
    nonce: Number(game?.nonce?.toNumber()),
    nextRngSeedHashed,
    game,
    isPlaying,
  }
}
