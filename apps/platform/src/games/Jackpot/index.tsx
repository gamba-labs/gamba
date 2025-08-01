// src/games/Jackpot/index.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { LAMPORTS_PER_SOL }           from '@solana/web3.js'
import { GambaUi }                    from 'gamba-react-ui-v2'
import { useGambaContext }            from 'gamba-react-v2'
import { useWallet }                  from '@solana/wallet-adapter-react'

import {
  useSpecificGames,
  useGame,
} from 'gamba-react-v2'

import { Countdown }       from './Countdown'
import { Pot }             from './Pot'
import { WinnerAnimation } from './WinnerAnimation'
import { Coinfalls }       from './Coinfall'
import { TopPlayers }      from './TopPlayers'
import { RecentPlayers }   from './RecentPlayers'
import { RecentGames }     from './RecentGames'
import { Waiting }         from './Waiting'
import { MyStats }         from './MyStats'

import { DESIRED_CREATOR, DESIRED_MAX_PLAYERS } from './config'
import * as S from './Jackpot.styles'

// ← NEW: shared multiplayer widgets from your UI library
import { Multiplayer }                      from 'gamba-react-ui-v2'
import { PLATFORM_CREATOR_ADDRESS,
         MULTIPLAYER_FEE }                 from './../../constants'
import { BPS_PER_WHOLE }                   from 'gamba-core-v2'

/** Simple media‐query hook */
const useMediaQuery = (q: string) => {
  const [matches, setMatches] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const mm = matchMedia(q)
    const handler = () => setMatches(mm.matches)
    mm.addEventListener('change', handler)
    return () => mm.removeEventListener('change', handler)
  }, [q])
  return matches
}

export default function Jackpot() {
  // 1) Gamba + wallet
  const { provider }             = useGambaContext()
  const { publicKey: walletKey } = useWallet()
  const isSmall                  = useMediaQuery('(max-width: 900px)')

  // 2) fetch list of matching games (no auto-poll)
  const {
    games,
    loading: gamesLoading,
    refresh: refreshGames,
  } = useSpecificGames(DESIRED_CREATOR, DESIRED_MAX_PLAYERS, /* pollMs= */ 0)

  // 3) take the “top” game
  const topGame = games[0] ?? null

  // 4) subscribe live on‐chain to that PDA
  // useGame now returns { game, metadata? }, so grab .game
  const liveGame = useGame(topGame?.publicKey ?? null).game

  // 5) manual polling: while there’s no liveGame or it’s already settled
  useEffect(() => { refreshGames() }, [refreshGames])
  useEffect(() => {
    if (!liveGame || liveGame.state.settled) {
      const id = setInterval(refreshGames, 5000)
      return () => clearInterval(id)
    }
  }, [liveGame, refreshGames])

  // 6) derive display state
  const players           = liveGame?.players ?? []
  const totalPotLamports  = players.reduce((sum, p) => sum + p.wager.toNumber(), 0)
  const waitingForPlayers = !!liveGame?.state.waiting
  const settled           = !!liveGame?.state.settled

  const youJoined = useMemo(
    () =>
      !!walletKey &&
      !!liveGame &&
      liveGame.players.some(p => p.user.equals(walletKey)),
    [walletKey, liveGame]
  )

  const myEntry       = players.find(p => walletKey && p.user.equals(walletKey))
  const myBetLamports = myEntry?.wager.toNumber() ?? 0
  const myBetSOL      = myBetLamports / LAMPORTS_PER_SOL
  const myChancePct   = totalPotLamports
    ? (myBetLamports / totalPotLamports) * 100
    : 0

  // 7) compute timestamps for countdown bar
  // creationTimestamp and softExpirationTimestamp are in seconds
  const creationMs = liveGame
    ? Number(liveGame.creationTimestamp) * 1000
    : 0
  const softMs = liveGame
    ? Number(liveGame.softExpirationTimestamp) * 1000
    : 0
  const totalDur = Math.max(softMs - creationMs, 0)

  return (
    <>
      {/* ───── MAIN SCREEN ───── */}
      <GambaUi.Portal target="screen">
        <S.ScreenLayout>
          <S.PageLayout>

            {/* left sidebar – always visible */}
            {!isSmall && (
              <S.TopPlayersSidebar>
                <TopPlayers players={players} totalPot={totalPotLamports} />
              </S.TopPlayersSidebar>
            )}

            {/* center game area */}
            <S.GameContainer>
              {liveGame && <Coinfalls players={players} />}

              {isSmall && liveGame && players.length > 0 && (
                <S.TopPlayersOverlay>
                  <TopPlayers
                    players={players}
                    totalPot={totalPotLamports}
                    $isOverlay
                  />
                </S.TopPlayersOverlay>
              )}

              <S.MainContent>
                {!liveGame ? (
                  <S.CenterBlock layout>
                    <Waiting loading={gamesLoading} />
                  </S.CenterBlock>
                ) : (
                  <>
                    <S.Header>
                      <S.Title>Game #{liveGame.gameId.toString()}</S.Title>
                      <S.Badge
                        status={
                          waitingForPlayers
                            ? 'waiting'
                            : settled
                              ? 'settled'
                              : 'live'
                        }
                      >
                        {waitingForPlayers
                          ? 'Waiting'
                          : settled
                            ? 'Settled'
                            : 'Live'}
                      </S.Badge>
                    </S.Header>

                    {/* countdown bar uses creation→soft span */}
                    {totalDur > 0 && (
                      <Countdown
                        creationTimestamp={creationMs}
                        softExpiration={softMs}
                        onComplete={() => {}}
                      />
                    )}

                    <S.CenterBlock layout>
                      {settled && (
                        <WinnerAnimation
                          players={players}
                          winnerIndexes={liveGame.winnerIndexes.map(Number)}
                          currentUser={walletKey}
                          onClose={() => {
                            // once the animation finishes, fetch again to pick up the new game
                            refreshGames()
                          }}
                        />
                      )}

                      <Pot totalPot={totalPotLamports / LAMPORTS_PER_SOL} />

                      {myEntry && (
                        <MyStats betSOL={myBetSOL} chancePct={myChancePct} />
                      )}
                    </S.CenterBlock>
                  </>
                )}
              </S.MainContent>
            </S.GameContainer>

            {/* right sidebar – always visible */}
            {!isSmall && (
              <S.RecentGamesSidebar>
                <RecentGames />
              </S.RecentGamesSidebar>
            )}
          </S.PageLayout>

          {/* bottom strip – always visible */}
          <S.RecentPlayersContainer>
            <RecentPlayers players={players} />
          </S.RecentPlayersContainer>
        </S.ScreenLayout>
      </GambaUi.Portal>

      {/* ───── CONTROLS ───── */}
      <GambaUi.Portal target="controls">
        {liveGame && topGame && waitingForPlayers && !youJoined && (
          <Multiplayer.JoinGame
            pubkey={topGame.publicKey}
            account={liveGame}
            creatorAddress={PLATFORM_CREATOR_ADDRESS}
            creatorFeeBps={Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)}
            onTx={() => refreshGames()}
          />
        )}
        {liveGame && topGame && waitingForPlayers && youJoined && (
          <Multiplayer.EditBet
            pubkey={topGame.publicKey}
            account={liveGame}
            creatorAddress={PLATFORM_CREATOR_ADDRESS}
            creatorFeeBps={Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)}
            onComplete={() => refreshGames()}
          />
        )}
      </GambaUi.Portal>
    </>
  )
}
