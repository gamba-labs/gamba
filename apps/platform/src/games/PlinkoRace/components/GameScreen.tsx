// src/components/GameScreen.tsx
import React, { useEffect, useState } from 'react'
import { PublicKey }            from '@solana/web3.js'
import { useWallet }            from '@solana/wallet-adapter-react'
import { useGame }              from 'gamba-react-v2'
import { GambaUi }              from 'gamba-react-ui-v2'

import JoinGame                 from '../../Jackpot/instructions/JoinGame'
import EditBet                  from '../../Jackpot/instructions/EditBet'
import Board                    from './Board'

export default function GameScreen({
  pk,
  onBack,
}: {
  pk: PublicKey
  onBack: () => void
}) {
  // useGame now returns { game, metadata? }
  const { game: chainGame } = useGame(pk)
  const { publicKey }       = useWallet()

  // 1️⃣ Snapshot once the on-chain game settles
  const [snapPlayers, setSnapPlayers] = useState<PublicKey[] | null>(null)
  const [snapWinner, setSnapWinner]   = useState<number | null>(null)
  const [replayDone, setReplayDone]   = useState(false)

  useEffect(() => {
    if (!chainGame) return
    if (!chainGame.state.settled) return
    if (snapPlayers) return

    const w = Number(chainGame.winnerIndexes[0])
    setSnapPlayers(chainGame.players.map(p => p.user))
    setSnapWinner(w)
    setReplayDone(false)
  }, [chainGame, snapPlayers])

  // 2️⃣ Countdown until settlement (if waiting)
  const [timeLeft, setTimeLeft] = useState(0)
  useEffect(() => {
    if (!chainGame) return
    const ts = chainGame.softExpirationTimestamp
    if (!ts) return

    const end = Number(ts) * 1000
    const tick = () => setTimeLeft(Math.max(end - Date.now(), 0))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [chainGame?.softExpirationTimestamp])

  // 3️⃣ Decide which players/winner go to Board
  const waiting      = snapPlayers === null
  const boardPlayers = waiting
    ? (chainGame?.players.map(p => p.user) || [])
    : snapPlayers!
  const boardWinnerIdx = waiting ? null : snapWinner

  // 4️⃣ Format mm:ss
  const formatTime = (ms: number) => {
    const tot = Math.ceil(ms / 1000)
    const m   = Math.floor(tot / 60)
    const s   = tot % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* ► Always show the Board (so pegs & finish line are visible) */}
      <Board
        players   ={boardPlayers}
        winnerIdx ={boardWinnerIdx}
        gamePk    ={pk.toBase58()}
        onFinished={!waiting ? () => setReplayDone(true) : undefined}
      />

      {/* ► Top-right status + countdown */}
      <div style={{
        position:'absolute', top:12, right:12, zIndex:200,
        textAlign:'right',
      }}>
        <div style={{
          display:'inline-block',
          background:'rgba(0,0,0,0.6)',
          color:'#fff', padding:'4px 8px',
          borderRadius:4, fontSize:12,
          textTransform:'uppercase',
        }}>
          {waiting ? 'Waiting' : (!replayDone ? 'Playing' : 'Settled')}
        </div>
        {waiting && timeLeft > 0 && (
          <div style={{marginTop:4, color:'#fff', fontSize:12}}>
            Starts in {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* ► Gamba controls: Join/Edit while waiting; Back when done */}
      <GambaUi.Portal target="controls">
        {waiting && chainGame?.state.waiting && (
          publicKey && !chainGame.players.some(p => p.user.equals(publicKey))
            ? <JoinGame pubkey={pk} account={chainGame} onTx={() => {}}/>
            : <EditBet  pubkey={pk} account={chainGame} onComplete={() => {}}/>
        )}

        {!waiting && replayDone && (
          <button
            onClick={onBack}
            style={{
              padding:'8px 16px', marginRight:12,
              fontWeight:600, background:'#222',
              color:'#fff', border:'none',
              borderRadius:6, cursor:'pointer',
            }}
          >
            ← Back to lobby
          </button>
        )}
      </GambaUi.Portal>
    </>
  )
}
