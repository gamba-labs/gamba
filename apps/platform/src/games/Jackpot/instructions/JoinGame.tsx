// src/games/Jackpot/instructions/JoinGame.tsx
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
  onTx?: () => void
}

export default function JoinGame({ pubkey, account, onTx }: Props) {
  const { provider: gambaProvider } = useGambaContext()
  if (!gambaProvider) return null
  const anchorProvider = gambaProvider.anchorProvider as AnchorProvider
  const sendTransaction = useSendTransaction()

  // display existing wager as SOL string
  const initialSOL = (account.wager.toNumber() / LAMPORTS_PER_SOL).toFixed(2)
  const [wagerSol, setWagerSol] = useState<string>(initialSOL)
  const [busy, setBusy] = useState(false)

  const handleJoin = useCallback(async () => {
    setBusy(true)
    try {
      const sol = parseFloat(wagerSol)
      if (isNaN(sol) || sol <= 0) throw new Error('Invalid wager')
      const lamports = Math.round(sol * LAMPORTS_PER_SOL)

      const ix = await gamba.joinGameIx(anchorProvider, {
        accounts: {
          gameAccount:   pubkey,
          mint:          account.mint,
          playerAccount: anchorProvider.wallet.publicKey,
          creatorAddress: anchorProvider.wallet.publicKey,
        },
        wager:         new BN(lamports),
        creatorFeeBps: 0,
        team:          0,
      })

      await sendTransaction([ix])
      onTx?.()
    } catch (err) {
      console.error('JoinGame failed', err)
    } finally {
      setBusy(false)
    }
  }, [
    anchorProvider,
    account.mint,
    anchorProvider?.wallet.publicKey,
    pubkey,
    sendTransaction,
    onTx,
    wagerSol,
  ])

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <GambaUi.WagerInput
        value={Math.round(parseFloat(wagerSol) * LAMPORTS_PER_SOL)}
        onChange={(lamports: number) => {
          setWagerSol((lamports / LAMPORTS_PER_SOL).toFixed(2))
        }}
        disabled={busy}
      />
      <GambaUi.PlayButton disabled={busy} onClick={handleJoin}>
        {busy ? 'Joining…' : 'Join'}
      </GambaUi.PlayButton>
    </div>
  )
}
