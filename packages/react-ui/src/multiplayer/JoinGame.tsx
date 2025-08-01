// packages/react/src/multiplayer/JoinGame.tsx
import React, { useState, useCallback } from 'react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { IdlAccounts, BN }             from '@coral-xyz/anchor'
import { useMultiplayer }              from 'gamba-react-v2'
import type { Multiplayer }            from '@gamba-labs/multiplayer-sdk'
import { Button }                      from '../components/Button'
import { WagerInput }                  from '../components/WagerInput'
import { TextInput }                   from '../components/TextInput'

/** 
 * Props for the shared JoinGame component. 
 * We keep the old `pubkey` API so existing callers don’t break. 
 */
export interface JoinGameProps {
  /** the on‐chain game account PDA */
  pubkey         : PublicKey
  /** decoded anchor account for that PDA */
  account        : IdlAccounts<Multiplayer>['game']
  /** optional referrer address */
  creatorAddress?: PublicKey
  /** override the fee in basis points (defaults to 0 ⇒ no fee) */
  creatorFeeBps?: number
  /** callback after a successful TX */
  onTx?          : () => void
}

export default function JoinGame({
  pubkey,
  account,
  creatorAddress,
  creatorFeeBps = 0,
  onTx,
}: JoinGameProps) {
  const { join } = useMultiplayer()

  // SOL‐string state
  const [wager,    setWager]    = useState(
    (account.wager.toNumber() / LAMPORTS_PER_SOL).toFixed(2)
  )
  const [metadata, setMetadata] = useState('')         // player name
  const [busy,     setBusy]     = useState(false)

  const handle = useCallback(async () => {
    setBusy(true)
    try {
      const sol = parseFloat(wager)
      if (!sol || isNaN(sol)) throw new Error('Invalid wager')

      const amount = new BN(Math.round(sol * LAMPORTS_PER_SOL))
      await join({
        gameAccount   : pubkey,
        mint          : account.mint,
        wager         : amount,
        creatorAddress,
        creatorFeeBps,
        // only include metadata if non‐empty
        ...(metadata.trim() ? { metadata: metadata.trim() } : {}),
      })

      onTx?.()
    } finally {
      setBusy(false)
    }
  }, [
    join,
    pubkey,
    account.mint,
    wager,
    metadata,
    creatorAddress,
    creatorFeeBps,
    onTx,
  ])

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <WagerInput
        value={Math.round(parseFloat(wager) * LAMPORTS_PER_SOL)}
        onChange={(lamports) =>
          setWager((lamports / LAMPORTS_PER_SOL).toFixed(2))
        }
        disabled={busy}
      />

      {/* optional name input (max 10 chars) */}
      <TextInput
        placeholder="Name (opt.)"
        value={metadata}
        maxLength={10}
        onChange={setMetadata}    // ← here we get a string, not an event
        disabled={busy}
        style={{ width: 100 }}
      />

      <Button main disabled={busy} onClick={handle}>
        {busy ? 'Joining…' : 'Join'}
      </Button>
    </div>
  )
}
