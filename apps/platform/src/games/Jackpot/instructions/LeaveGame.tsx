// src/games/Jackpot/instructions/LeaveGame.tsx
import React, { useState, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { IdlAccounts } from '@coral-xyz/anchor'
import { useMultiplayer } from 'gamba-react-v2'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import { GambaUi } from 'gamba-react-ui-v2'

type Props = {
  pubkey : PublicKey
  account: IdlAccounts<Multiplayer>['game']
  onTx?  : () => void
}

export default function LeaveGame({ pubkey, account, onTx }: Props) {
  const { leave } = useMultiplayer()
  const [busy, setBusy] = useState(false)

  const handleLeave = useCallback(async () => {
    setBusy(true)
    try {
      await leave({
        gameAccount: pubkey,
        mint       : account.mint,
      })
      onTx?.()
    } catch (err) {
      console.error('LeaveGame failed', err)
    } finally {
      setBusy(false)
    }
  }, [leave, pubkey, account.mint, onTx])

  return (
    <GambaUi.Button onClick={handleLeave} disabled={busy}>
      {busy ? 'Leaving…' : 'Leave'}
    </GambaUi.Button>
  )
}
