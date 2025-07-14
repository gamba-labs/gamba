// src/games/Jackpot/instructions/EditBet.tsx
import React, { useState, useCallback } from 'react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AnchorProvider, IdlAccounts, BN } from '@coral-xyz/anchor'
import { useGambaContext, useSendTransaction } from 'gamba-react-v2'
import * as gamba from '@gamba-labs/multiplayer-sdk'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import { GambaUi } from 'gamba-react-ui-v2'

type Props = {
  pubkey: PublicKey
  account: IdlAccounts<Multiplayer>['game']
  onComplete?: () => void
}

export default function EditBet({ pubkey, account, onComplete }: Props) {
  const { provider: gambaProvider } = useGambaContext()
  if (!gambaProvider) return null
  const anchorProvider = gambaProvider.anchorProvider as AnchorProvider
  const sendTransaction = useSendTransaction()

  // find the player's existing wager
  const me = anchorProvider.wallet.publicKey!
  const myEntry = account.players.find(p => p.user.equals(me))
  const currentLamports = myEntry?.wager.toNumber() ?? 0

  // track input as SOL string
  const [wagerSol, setWagerSol] = useState<string>(
    (currentLamports / LAMPORTS_PER_SOL).toString()
  )
  const [busy, setBusy] = useState(false)

  // parse out lamports and clamp to never go below current
  const inputLamports = Math.floor(parseFloat(wagerSol) * LAMPORTS_PER_SOL) || 0
  const clampedLamports = Math.max(inputLamports, currentLamports)
  const canIncrease = clampedLamports > currentLamports

  const handleUpdate = useCallback(async () => {
    setBusy(true)
    try {
      // 1) leave with old wager
      const leaveIx = await gamba.leaveGameIx(anchorProvider, {
        accounts: {
          gameAccount:   pubkey,
          mint:          account.mint,
          playerAccount: me,
        },
      })

      // 2) join with increased wager
      const joinIx = await gamba.joinGameIx(anchorProvider, {
        accounts: {
          gameAccount:     pubkey,
          mint:            account.mint,
          playerAccount:   me,
          creatorAddress:  me,
        },
        wager:         new BN(clampedLamports),
        creatorFeeBps: 0,
        team:          0,
      })

      await sendTransaction([leaveIx, joinIx])
      onComplete?.()
    } catch (err) {
      console.error('EditBet failed', err)
    } finally {
      setBusy(false)
    }
  }, [
    anchorProvider,
    account,
    clampedLamports,
    me,
    onComplete,
    pubkey,
    sendTransaction,
  ])

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <GambaUi.WagerInput
        value={clampedLamports}
        onChange={(lamports: number) => {
          // clamp immediately
          const valid = Math.max(lamports, currentLamports)
          setWagerSol((valid / LAMPORTS_PER_SOL).toString())
        }}
        disabled={busy}
      />
      <GambaUi.Button
        main
        disabled={!canIncrease || busy}
        onClick={handleUpdate}
      >
        {busy ? 'Increasing…' : 'Increase Bet'}
      </GambaUi.Button>
    </div>
  )
}
