// src/games/Jackpot/index.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { GambaUi } from 'gamba-react-ui-v2'
import { useGambaContext } from 'gamba-react-v2'

import {
  useSpecificGames,
  useGame,
} from 'gamba-react-v2'

import JoinGame            from './instructions/JoinGame'
import EditBet             from './instructions/EditBet'
import LeaveGame           from './instructions/LeaveGame'
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

const useMediaQuery = (q: string) => {
  const [m, set] = React.useState(() => matchMedia(q).matches)
  React.useEffect(() => {
    const mm = matchMedia(q)
    const h  = () => set(mm.matches)
    mm.addEventListener('change', h)
    return () => mm.removeEventListener('change', h)
  }, [q])
  return m
}

export default function Jackpot() {
  const { provider } = useGambaContext()
  const walletKey = provider?.anchorProvider.wallet.publicKey ?? null
  const isSmall   = useMediaQuery('(max-width: 900px)')

  // 1) fetch all matching games, manual refresh
  const {
    games,
    loading: gamesLoading,
    refresh: refreshGames,
  } = useSpecificGames(DESIRED_CREATOR, DESIRED_MAX_PLAYERS, 0)

  const topGame = games[0] ?? null
  // 2) subscribe live on-chain
  const liveAcct = useGame(topGame?.publicKey ?? null)

  // 3) polling: only while no liveAcct OR (settled AND animationDone)
  const [animationDone, setAnimationDone] = useState(true)
  useEffect(() => { refreshGames() }, [refreshGames])
  useEffect(() => {
    if (!liveAcct || (liveAcct.state.settled && animationDone)) {
      const id = setInterval(refreshGames, 5000)
      return () => clearInterval(id)
    }
  }, [liveAcct, animationDone, refreshGames])

  // 4) animationDone resets whenever we enter “settled”
  useEffect(() => {
    if (liveAcct?.state.settled) setAnimationDone(false)
    else setAnimationDone(true)
  }, [liveAcct?.state.settled])

  // 5) derive UI state
  const players           = liveAcct?.players ?? []
  const totalPotLamports  = players.reduce((s, p) => s + p.wager.toNumber(), 0)
  const waitingForPlayers = !!liveAcct?.state.waiting
  const settled           = !!liveAcct?.state.settled

  const youJoined = useMemo(() => (
    walletKey && liveAcct
      ? liveAcct.players.some(p => p.user.equals(walletKey))
      : false
  ), [walletKey, liveAcct])

  const myEntry       = players.find(p => walletKey && p.user.equals(walletKey))
  const myBetLamports = myEntry?.wager.toNumber() ?? 0
  const myBetSOL      = myBetLamports / LAMPORTS_PER_SOL
  const myChancePct   = totalPotLamports
    ? (myBetLamports / totalPotLamports) * 100
    : 0

  return (
    <>
      <GambaUi.Portal target="screen">
        <S.ScreenLayout>
          <S.PageLayout>
            {/* left sidebar always there */}
            {!isSmall && (
              <S.TopPlayersSidebar>
                <TopPlayers players={players} totalPot={totalPotLamports} />
              </S.TopPlayersSidebar>
            )}

            <S.GameContainer>
              {liveAcct && <Coinfalls players={players} />}

              {isSmall && liveAcct && players.length > 0 && (
                <S.TopPlayersOverlay>
                  <TopPlayers
                    players={players}
                    totalPot={totalPotLamports}
                    $isOverlay
                  />
                </S.TopPlayersOverlay>
              )}

              <S.MainContent>
                {!liveAcct ? (
                  <S.CenterBlock layout>
                    <Waiting loading={gamesLoading} />
                  </S.CenterBlock>
                ) : (
                  <>
                    <S.Header>
                      <S.Title>Game #{liveAcct.gameId.toString()}</S.Title>
                      <S.Badge status={
                        waitingForPlayers
                          ? 'waiting'
                          : settled ? 'settled' : 'live'
                      }>
                        {waitingForPlayers
                          ? 'Waiting'
                          : settled ? 'Settled' : 'Live'}
                      </S.Badge>
                    </S.Header>

                    <S.CenterBlock layout>
                      <Countdown
                        softExpiration={Number(liveAcct.softExpirationTimestamp) * 1000}
                        onComplete={() => {}}
                      />

                      {settled && (
                        <WinnerAnimation
                          players={players}
                          winnerIndexes={liveAcct.winnerIndexes.map(Number)}
                          currentUser={walletKey}
                          onClose={() => setAnimationDone(true)}
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

            {/* right sidebar always there */}
            {!isSmall && (
              <S.RecentGamesSidebar>
                <RecentGames />
              </S.RecentGamesSidebar>
            )}
          </S.PageLayout>

          {/* bottom strip */}
          <S.RecentPlayersContainer>
            <RecentPlayers players={players} />
          </S.RecentPlayersContainer>
        </S.ScreenLayout>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        {liveAcct && topGame && waitingForPlayers && !youJoined && (
          <JoinGame pubkey={topGame.publicKey} account={liveAcct} />
        )}
        {liveAcct && topGame && waitingForPlayers && youJoined && (
          <EditBet pubkey={topGame.publicKey} account={liveAcct} />
        )}
        {liveAcct && topGame && !waitingForPlayers && youJoined && (
          <LeaveGame
            pubkey={topGame.publicKey}
            account={liveAcct}
            onTx={refreshGames}
          />
        )}
      </GambaUi.Portal>
    </>
  )
}
