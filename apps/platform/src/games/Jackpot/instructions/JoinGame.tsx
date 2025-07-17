import React, { useState, useCallback } from 'react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { IdlAccounts, BN } from '@coral-xyz/anchor'
import { useMultiplayer } from 'gamba-react-v2'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import { GambaUi } from 'gamba-react-ui-v2'

import { PLATFORM_CREATOR_ADDRESS, MULTIPLAYER_FEE } from '../../../constants'
import { BPS_PER_WHOLE } from 'gamba-core-v2'

type Props = {
  pubkey  : PublicKey
  account : IdlAccounts<Multiplayer>['game']
  onTx?   : () => void
}

export default function JoinGame({ pubkey, account, onTx }: Props) {
  const { join } = useMultiplayer()
  const initialSOL = (account.wager.toNumber() / LAMPORTS_PER_SOL).toFixed(2)
  const [wagerSol, setWagerSol] = useState(initialSOL)
  const [busy, setBusy] = useState(false)

  const handleJoin = useCallback(async () => {
    setBusy(true)
    try {
      const sol = parseFloat(wagerSol)
      if (!sol || isNaN(sol)) throw new Error('Invalid wager')

      const lamports = new BN(Math.round(sol * LAMPORTS_PER_SOL))
      const creatorFeeBps = Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)

      await join({
        gameAccount    : pubkey,
        mint           : account.mint,
        wager          : lamports,
        creatorAddress : PLATFORM_CREATOR_ADDRESS,
        creatorFeeBps,
      })

      onTx?.()
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(false)
    }
  }, [join, pubkey, account.mint, wagerSol, onTx])

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <GambaUi.WagerInput
        value={Math.round(parseFloat(wagerSol) * LAMPORTS_PER_SOL)}
        onChange={lamports =>
          setWagerSol((lamports / LAMPORTS_PER_SOL).toFixed(2))
        }
        disabled={busy}
      />
      {/* ← use Button not PlayButton */}
      <GambaUi.Button main disabled={busy} onClick={handleJoin}>
        {busy ? 'Joining…' : 'Join'}
      </GambaUi.Button>
    </div>
  )
}
