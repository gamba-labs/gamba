// packages/react/src/multiplayer/useGame.ts
import { useEffect, useState } from 'react'
import type { AnchorProvider, IdlAccounts } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { getProgram } from '@gamba-labs/multiplayer-sdk'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import { useGambaContext } from '../GambaProvider'

export function useGame(pk: PublicKey | null) {
  const { provider } = useGambaContext()
  const [game, setGame] = useState<IdlAccounts<Multiplayer>['game'] | null>(null)

  useEffect(() => {
    // if no provider or no key → clear and do nothing
    if (!provider || !pk) {
      setGame(null)
      return
    }

    const anchorProvider = provider.anchorProvider as AnchorProvider
    const conn     = anchorProvider.connection
    const program  = getProgram(anchorProvider)
    const coder    = program.coder.accounts

    // 1️⃣ initial one‐off fetch
    conn.getAccountInfo(pk, 'confirmed')
      .then(info => {
        if (!info || !info.data || info.data.length === 0) {
          setGame(null)
        } else {
          try {
            setGame(coder.decode('game', info.data))
          } catch {
            setGame(null)
          }
        }
      })
      .catch(() => {
        setGame(null)
      })

    // 2️⃣ subscribe to live updates
    const subId = conn.onAccountChange(
      pk,
      info => {
        if (!info || !info.data || info.data.length === 0) {
          // account closed → fall back to polling / waiting
          setGame(null)
        } else {
          try {
            setGame(coder.decode('game', info.data))
          } catch {
            // ignore partial/decode errors
          }
        }
      },
      'confirmed',
    )

    return () => {
      conn.removeAccountChangeListener(subId)
    }
  }, [provider, pk])

  return game
}
