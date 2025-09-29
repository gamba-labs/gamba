// src/games/PvpFlip/components/Lobby.tsx
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useGambaProvider, useSpecificGames } from 'gamba-react-v2'
import { GambaUi } from 'gamba-react-ui-v2'
import { DESIRED_MAX_PLAYERS, DESIRED_WINNERS_TARGET } from '../config'
import CreateGameModal from './CreateGameModal'
import { fetchPlayerMetadata } from '@gamba-labs/multiplayer-sdk'
import HEADS_IMG from '../assets/heads.png'
import TAILS_IMG from '../assets/tails.png'

const sol = (lamports: number) => lamports / LAMPORTS_PER_SOL
const shorten = (pk: PublicKey) => pk.toBase58().slice(0, 4) + '...'
const formatDuration = (ms: number) => {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

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
const TR = styled.tr<{ $clickable?: boolean }>`
  &:hover {
    background: ${({ $clickable }) => ($clickable ? '#1c1c1c' : 'inherit')};
  }
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`
const TD = styled.td`
  padding: 10px 12px;
  font-size: 0.95rem;
  border-bottom: 1px solid #222;
`

export default function Lobby({
  onSelect,
}: {
  onSelect(pk: PublicKey): void
}) {
  const { games, loading, refresh } = useSpecificGames(
    { maxPlayers: DESIRED_MAX_PLAYERS, winnersTarget: DESIRED_WINNERS_TARGET },
    0,
  )

  const { anchorProvider } = useGambaProvider()
  const [metas, setMetas] = useState<Record<string, Record<string, string>>>({})

  // Fetch player metadata for all visible games to know chosen sides
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const entries = await Promise.all(
          games.map(async (g) => {
            try {
              const md = await fetchPlayerMetadata(anchorProvider as any, (g.account as any).gameSeed)
              return [g.publicKey.toBase58(), md] as const
            } catch {
              return [g.publicKey.toBase58(), {}] as const
            }
          })
        )
        if (!cancelled) {
          const next: Record<string, Record<string, string>> = {}
          for (const [k, v] of entries) next[k] = v
          setMetas(next)
        }
      } catch (e) {
        console.error(e)
      }
    }
    load()
    return () => { cancelled = true }
  }, [games, anchorProvider])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <GambaUi.Portal target="screen">
      <Wrapper>
        <Header>
          <Button onClick={() => setIsModalOpen(true)}>＋ Create 1v1</Button>
          <Button onClick={refresh}>{loading ? 'Loading…' : 'Refresh'}</Button>
        </Header>

        <Table>
          <thead>
            <tr>
              <TH>Maker</TH>
              <TH>Side</TH>
              <TH>Players</TH>
              <TH>Bet</TH>
              <TH>Starts In</TH>
            </tr>
          </thead>
          <tbody>
            {games.map(g => {
              const {
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

              // Maker's chosen side from metadata, fallback to "Random"
              const md = metas[g.publicKey.toBase58()] || {}
              const makerMeta = (md[gameMaker.toBase58()] ?? '').toLowerCase().trim()
              const makerSide: 'heads' | 'tails' | undefined =
                makerMeta === 'heads' || makerMeta === 'head'
                  ? 'heads'
                  : makerMeta === 'tails' || makerMeta === 'tail'
                    ? 'tails'
                    : undefined

              let betLabel: string
              if ('sameWager' in wagerType) {
                betLabel = `${sol(wager.toNumber()).toFixed(2)} SOL`
              } else if ('customWager' in wagerType) {
                betLabel = 'Unlimited'
              } else {
                betLabel = `${sol(minBet.toNumber()).toFixed(2)} – ${sol(maxBet.toNumber()).toFixed(2)} SOL`
              }

              const startMs = Number(softExpirationTimestamp) * 1000
              const msLeft = startMs - now
              const startsIn = state.waiting
                ? msLeft > 0
                  ? formatDuration(msLeft)
                  : 'Ready to start'
                : 'Started'

              return (
                <TR
                  key={g.publicKey.toBase58()}
                  $clickable
                  onClick={() => onSelect(g.publicKey)}
                >
                  <TD>{shorten(gameMaker)}</TD>
                  <TD>
                    {makerSide ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={makerSide === 'heads' ? HEADS_IMG : TAILS_IMG} height={18} />
                        {makerSide === 'heads' ? 'Heads' : 'Tails'}
                      </div>
                    ) : (
                      'Random'
                    )}
                  </TD>
                  <TD>
                    {players.length} / {maxPlayers}
                  </TD>
                  <TD>{betLabel}</TD>
                  <TD>{startsIn}</TD>
                </TR>
              )
            })}

            {!loading && games.length === 0 && (
              <TR>
                <TD colSpan={5} style={{ textAlign: 'center', opacity: 0.8 }}>
                  No open 1v1 games – create one!
                </TD>
              </TR>
            )}
          </tbody>
        </Table>

        <CreateGameModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={onSelect}
        />
      </Wrapper>
    </GambaUi.Portal>
  )
}


