// src/games/Jackpot/instructions/LeaveGame.tsx
import React, { useState, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { AnchorProvider, IdlAccounts } from '@coral-xyz/anchor'
import { useGambaContext, useSendTransaction } from 'gamba-react-v2'
import * as gamba from '@gamba-labs/multiplayer-sdk'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import { GambaUi } from 'gamba-react-ui-v2'

type Props = {
  pubkey: PublicKey
  account: IdlAccounts<Multiplayer>['game']
  onTx?: () => void
}

export default function LeaveGame({ pubkey, account, onTx }: Props) {
  const { provider: gambaProvider } = useGambaContext()
  if (!gambaProvider) return null
  const anchorProvider = gambaProvider.anchorProvider as AnchorProvider
  const sendTransaction = useSendTransaction()
  const [busy, setBusy] = useState(false)

  const handleLeave = useCallback(async () => {
    setBusy(true)
    try {
      const ix = await gamba.leaveGameIx(anchorProvider, {
        accounts: {
          gameAccount:   pubkey,
          mint:          account.mint,
          playerAccount: anchorProvider.wallet.publicKey,
        },
      })
      await sendTransaction([ix])
      onTx?.()
    } catch (err) {
      console.error('LeaveGame failed', err)
    } finally {
      setBusy(false)
    }
  }, [
    account.mint,
    anchorProvider,
    onTx,
    pubkey,
    sendTransaction,
  ])

  return (
    <GambaUi.Button
      disabled={busy}
      onClick={handleLeave}
      style={{ alignSelf: 'center' }}
    >
      {busy ? 'Leaving…' : 'Leave'}
    </GambaUi.Button>
  )
}
