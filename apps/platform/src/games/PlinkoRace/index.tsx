// src/games/PlinkoRace/index.tsx
import React, { useCallback, useMemo, useState, useEffect } from 'react'
import styled                                         from 'styled-components'
import { PublicKey, LAMPORTS_PER_SOL }                from '@solana/web3.js'
import { useWallet }                                  from '@solana/wallet-adapter-react'
import { GambaUi }                                    from 'gamba-react-ui-v2'
import {
  useGames,
  useGame,
} from 'gamba-react-v2'

import JoinGame  from '../Jackpot/instructions/JoinGame'
import EditBet   from '../Jackpot/instructions/EditBet'
import { Board } from './Board'

/* ─────────────────────────── STYLES ────────────────────────── */
const LobbyLayout   = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`
const Header        = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const H1            = styled.h1`
  margin: 0;
  font-size: 2rem;
`
const RefreshButton = styled.button`
  padding: 6px 12px;
  font-weight: 600;
  cursor: pointer;
`
const CardGrid      = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
`
const Card          = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: transform .1s ease;
  &:hover { transform: translateY(-2px) }
`
const GameId        = styled.span`
  font-weight: 600;
`
const Badge         = styled.span<{ $status: 'waiting'|'live'|'settled' }>`
  padding: 2px 8px;
  border-radius: 6px;
  font-size: .75rem;
  text-transform: uppercase;
  background: ${p =>
    p.$status === 'waiting' ? '#555'
    : p.$status === 'live'    ? '#047857'
                              : '#6b7280'};
`
const Pot           = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 8px 0;
`
const Players       = styled.div`
  font-size: .875rem;
  opacity: .8;
`
const Wager         = styled.div`
  font-size: .875rem;
  opacity: .8;
  margin-top: 4px;
`
const EnterBtn      = styled.button`
  margin-top: 12px;
  padding: 8px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`
const BackBtn       = styled.button`
  margin-bottom: 16px;
  padding: 6px 12px;
  cursor: pointer;
`
const ScreenLayout  = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
`

/* ────────── NEW: top-left overlay ────────── */
const TopLeftOverlay = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 10;
`
const StatusBadge = styled.span<{ $status: 'waiting'|'live'|'settled' }>`
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
  background: ${p =>
    p.$status === 'waiting' ? '#555'
    : p.$status === 'live'    ? '#047857'
                              : '#6b7280'};
`

/* ────────── NEW: time formatting ────────── */
function formatMS(ms: number) {
  const clamped = Math.max(0, ms)
  const minutes = Math.floor(clamped / 60000)
  const seconds = Math.floor((clamped % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2,'0')}`
}

/* ────────────────────────── HELPERS ───────────────────────── */
function sol(lamports: number) {
  return lamports / LAMPORTS_PER_SOL
}

/* ────────────────── LOBBY (list of live games) ───────────── */
type LobbyProps = { onSelect: (pk: PublicKey) => void }

function Lobby({ onSelect }: LobbyProps) {
  const { games, loading, refresh } = useGames()

  return (
    <LobbyLayout>
      <Header>
        <H1>Plinko Race Lobby</H1>
        <RefreshButton onClick={refresh}>
          {loading ? 'Loading…' : 'Refresh'}
        </RefreshButton>
      </Header>

      <CardGrid>
        {games.map(g => {
          const players  = g.account.players
          const status   = g.account.state.settled
                            ? 'settled' as const
                            : g.account.state.waiting
                              ? 'waiting' as const
                              : 'live' as const
          const totalPot = sol(
            players.reduce((sum, p) => sum + p.wager.toNumber(), 0)
          )
          const fixedWagerLam = g.account.wager.toNumber()
          const hasFixedWager = fixedWagerLam > 0

          return (
            <Card
              key={g.publicKey.toBase58()}
              onClick={() => onSelect(g.publicKey)}
            >
              <div>
                <GameId>Game #{g.account.gameId.toString()}</GameId>
                <Badge $status={status} style={{ marginLeft: 8 }}>
                  {status}
                </Badge>
                <Pot>{totalPot.toFixed(2)} SOL</Pot>
                <Players>
                  {players.length} / {g.account.maxPlayers} players
                </Players>
                {hasFixedWager && (
                  <Wager>
                    Wager: {sol(fixedWagerLam).toFixed(2)} SOL
                  </Wager>
                )}
              </div>
              <EnterBtn>Enter</EnterBtn>
            </Card>
          )
        })}
      </CardGrid>

      {!loading && games.length === 0 && (
        <p>No live games right now – create or wait for one!</p>
      )}
    </LobbyLayout>
  )
}

/* ──────────────── GAME SCREEN ───────────────────── */
type GameScreenProps = {
  pk    : PublicKey
  onBack: () => void
}

function GameScreen({ pk, onBack }: GameScreenProps) {
  const game       = useGame(pk)
  const { publicKey } = useWallet()

  // derive state
  const players    = game?.players ?? []
  const potLam     = players.reduce((s,p)=>s + p.wager.toNumber(), 0)
  const potSol     = potLam / LAMPORTS_PER_SOL
  const waiting    = !!game?.state.waiting
  const settled    = !!game?.state.settled
  const youJoined  = !!publicKey && players.some(p=>p.user.equals(publicKey))

  // countdown logic
  const softMs     = (game?.softExpirationTimestamp ?? 0) * 1000
  const [timeLeft, setTimeLeft] = useState(softMs - Date.now())
  useEffect(() => {
    if (!softMs || settled) return
    const id = setInterval(() => {
      setTimeLeft(softMs - Date.now())
    }, 250)
    return () => clearInterval(id)
  }, [softMs, settled])

  // Board inputs
  const boardPlayers = players.map(p=>p.user)
  const winnerIdx    = settled
    ? Number(game!.winnerIndexes[0])
    : null

  return (
    <>
      <BackBtn onClick={onBack}>← Back to lobby</BackBtn>

      {/* ────── TOP-LEFT OVERLAY ────── */}
      {game && (
        <TopLeftOverlay>
          <StatusBadge $status={
            waiting ? 'waiting' : settled ? 'settled' : 'live'
          }>
            {waiting ? 'Waiting' : settled ? 'Settled' : 'Live'}
          </StatusBadge>
          {!settled && (
            <span>⏱ {formatMS(timeLeft)}</span>
          )}
        </TopLeftOverlay>
      )}

      {!game ? (
        <p>Loading live game data…</p>
      ) : (
        <ScreenLayout>
          <h2>Game #{game.gameId.toString()}</h2>
          <h3>Pot: {potSol.toFixed(2)} SOL</h3>
          {youJoined && (
            <p>
              You: {(
                players.find(p=>p.user.equals(publicKey!))!
                  .wager.toNumber() / LAMPORTS_PER_SOL
              ).toFixed(2)} SOL
            </p>
          )}
          <Board players={boardPlayers} winnerIdx={winnerIdx} />
        </ScreenLayout>
      )}

      <GambaUi.Portal target="controls">
        {game && waiting && !youJoined && (
          <JoinGame pubkey={pk} account={game} onTx={()=>{}} />
        )}
        {game && waiting && youJoined && (
          <EditBet pubkey={pk} account={game} onComplete={()=>{}} />
        )}
      </GambaUi.Portal>
    </>
  )
}

/* ───────────────────────── ROOT EXPORT ─────────────────────── */
export default function PlinkoRace() {
  const [selectedPk, setSelectedPk] = useState<PublicKey | null>(null)
  const handleBack = useCallback(() => setSelectedPk(null), [])

  return (
    <>
      <GambaUi.Portal target="screen">
        {selectedPk
          ? <GameScreen pk={selectedPk} onBack={handleBack}/>
          : <Lobby      onSelect={setSelectedPk}/>
        }
      </GambaUi.Portal>
    </>
  )
}
