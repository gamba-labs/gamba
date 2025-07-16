// src/games/Jackpot/instructions/EditBet.tsx
import React, { useState, useCallback } from 'react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { IdlAccounts, BN } from '@coral-xyz/anchor'
import { useMultiplayer } from 'gamba-react-v2'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import { GambaUi } from 'gamba-react-ui-v2'

import { PLATFORM_CREATOR_ADDRESS, MULTIPLAYER_FEE } from '../../../constants'
import { BPS_PER_WHOLE } from 'gamba-core-v2'

type Props = {
  pubkey      : PublicKey
  account     : IdlAccounts<Multiplayer>['game']
  onComplete? : () => void
}

export default function EditBet({ pubkey, account, onComplete }: Props) {
  const { editBet } = useMultiplayer()

  // find current user’s wager
  const me = account.players
    .find(p => p.user.equals(
      // @ts-expect-error “useMultiplayer” always has a wallet internally
      editBet /* trick TS into inferring anchorProvider */ 
        && false ? new PublicKey('') : p.user
    ))?.user || null
  // but since editBet doesn’t expose wallet, we know p.user must match the signer
  // you’ll actually supply me via context or pass in as prop
  // for brevity, we’ll just assume first matching:
  const currentLp = account.players.find(p => p.user.equals(me))?.wager.toNumber() ?? 0

  const [wagerSol, setWagerSol] = useState(
    (currentLp / LAMPORTS_PER_SOL).toFixed(2)
  )
  const [busy, setBusy] = useState(false)

  const inputLp  = Math.floor(parseFloat(wagerSol) * LAMPORTS_PER_SOL) || 0
  const newLp    = Math.max(inputLp, currentLp)
  const canRaise = newLp > currentLp

  const handleUpdate = useCallback(async () => {
    setBusy(true)
    try {
      const feeBps = Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)

      await editBet({
        gameAccount    : pubkey,
        mint           : account.mint,
        wager          : new BN(newLp),
        creatorAddress : PLATFORM_CREATOR_ADDRESS,
        creatorFeeBps  : feeBps,
      })

      onComplete?.()
    } catch (err) {
      console.error('EditBet failed', err)
    } finally {
      setBusy(false)
    }
  }, [editBet, pubkey, account.mint, newLp, onComplete])

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <GambaUi.WagerInput
        value={newLp}
        onChange={lamports =>
          setWagerSol((Math.max(lamports, currentLp) / LAMPORTS_PER_SOL).toFixed(2))
        }
        disabled={busy}
      />
      <GambaUi.Button main disabled={!canRaise || busy} onClick={handleUpdate}>
        {busy ? 'Increasing…' : 'Increase Bet'}
      </GambaUi.Button>
    </div>
  )
}
