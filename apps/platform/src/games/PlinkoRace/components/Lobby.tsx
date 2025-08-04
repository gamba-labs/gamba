// src/components/Lobby.tsx
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useGames } from 'gamba-react-v2'
import CreateGameModal from './CreateGameModal'

/* ──────────────────── types ──────────────────── */
interface LobbyProps {
  onSelect : (pk: PublicKey) => void
  onDebug  : () => void
}

/* ──────────────────── helpers ─────────────────── */
const sol = (lamports: number) => lamports / LAMPORTS_PER_SOL
const shorten = (pk: PublicKey) =>
  pk.toBase58().slice(0, 4) + '...'
const formatDuration = (ms: number) => {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2,'0')}`
}

/* ───────────────── styled components ──────────── */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const TH = styled.th`
  text-align: left;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  border-bottom: 1px solid #333;
`

const TR = styled.tr<{ clickable?: boolean }>`
  &:hover {
    background: ${({ clickable }) => (clickable ? '#1c1c1c' : 'inherit')};
  }
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
`

const TD = styled.td`
  padding: 10px 12px;
  font-size: 0.95rem;
  border-bottom: 1px solid #222;
`

/* ───────────────── component ──────────────────── */
export default function Lobby({ onSelect, onDebug }: LobbyProps) {
  const { games, loading, refresh } = useGames()

  // modal open state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // drive countdowns
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <Wrapper>
      <Header>
        <Button onClick={() => setIsModalOpen(true)}>
          ＋ Create Game
        </Button>
        <Button onClick={refresh}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </Header>

      <Table>
        <thead>
          <tr>
            <TH>ID</TH>
            <TH>Maker</TH>
            <TH>Players</TH>
            <TH>Bet</TH>
            <TH>Starts In</TH>
          </tr>
        </thead>
        <tbody>
          {games.map(g => {
            const {
              gameId,
              gameMaker,
              players,
              maxPlayers,
              wagerType,
              wager,
              minBet,
              maxBet,
              softExpirationTimestamp,
              state,
            } = g.account as any

            let betLabel: string
            if ('sameWager' in wagerType) {
              betLabel = `${sol(wager.toNumber()).toFixed(2)} SOL`
            } else if ('customWager' in wagerType) {
              betLabel = 'Unlimited'
            } else {
              betLabel = `${sol(minBet.toNumber()).toFixed(2)} – ${sol(maxBet.toNumber()).toFixed(2)} SOL`
            }

            const startMs = Number(softExpirationTimestamp) * 1000
            const msLeft  = startMs - now
            let startsIn: string
            if (state.waiting) {
              startsIn = msLeft > 0
                ? formatDuration(msLeft)
                : 'Ready to start'
            } else {
              startsIn = 'Started'
            }

            return (
              <TR
                key={g.publicKey.toBase58()}
                clickable
                onClick={() => onSelect(g.publicKey)}
              >
                <TD>#{gameId.toString()}</TD>
                <TD>{shorten(gameMaker)}</TD>
                <TD>{players.length} / {maxPlayers}</TD>
                <TD>{betLabel}</TD>
                <TD>{startsIn}</TD>
              </TR>
            )
          })}

          {/* Debug row */}
          <TR clickable onClick={onDebug}>
            <TD colSpan={5} style={{ textAlign: 'center', fontStyle: 'italic' }}>
              🐞 Debug Simulator
            </TD>
          </TR>

          {!loading && games.length === 0 && (
            <TR>
              <TD colSpan={5} style={{ textAlign: 'center', opacity: 0.8 }}>
                No live games – create one!
              </TD>
            </TR>
          )}
        </tbody>
      </Table>

      <CreateGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Wrapper>
  )
}
