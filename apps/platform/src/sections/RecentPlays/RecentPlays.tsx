import { BPS_PER_WHOLE, GambaTransaction } from 'gamba-core-v2'
import { TokenValue, useTokenMeta } from 'gamba-react-ui-v2'
import React from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { extractMetadata } from '../../utils'
import { Container, Jackpot, Profit, Recent, Skeleton } from './RecentPlays.styles'
import { ShareModal } from './ShareModal'
import { useRecentPlays } from './useRecentPlays'

function TimeDiff({ time, suffix = 'ago' }: {time: number, suffix?: string}) {
  const diff = (Date.now() - time)
  return React.useMemo(() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours >= 1) {
      return hours + 'h ' + suffix
    }
    if (minutes >= 1) {
      return minutes + 'm ' + suffix
    }
    return 'Just now'
  }, [diff])
}

function RecentPlay({ event }: {event: GambaTransaction<'GameSettled'>}) {
  const game = event.data
  const token = useTokenMeta(game.tokenMint)
  const md = useMediaQuery('md')

  const multiplier = game.bet[game.resultIndex.toNumber()] / BPS_PER_WHOLE
  const wager = game.wager.toNumber()
  const payout = multiplier * wager
  const profit = payout - wager

  const meta = extractMetadata(event)

  return (
    <>
      <img src={meta?.game?.image} style={{ height: '1.5em' }} />
      <div style={{ color: '#a079ff' }}>
        {game.user.toBase58().substring(0, 4)}...
      </div>
      {md && (profit >= 0 ? ' won ' : ' lost ')}
      <Profit $win={profit > 0}>
        <img src={token.image} height="15px" />
        <TokenValue amount={Math.abs(profit)} mint={game.tokenMint} />
      </Profit>
      {md && (
        <>
          {profit > 0 && (
            <div>
              ({multiplier.toFixed(2)}x)
            </div>
          )}
          {game.jackpotWin.toNumber() > 0 && (
            <Jackpot>
              +<TokenValue mint={game.tokenMint} amount={game.jackpotWin.toNumber()} />
            </Jackpot>
          )}
        </>
      )}
    </>
  )
}

export default function RecentPlays() {
  const events = useRecentPlays()
  const [selectedGame, setSelectedGame] = React.useState<GambaTransaction<'GameSettled'>>()
  const md = useMediaQuery('md')

  return (
    <Container>
      {selectedGame && (
        <ShareModal event={selectedGame} onClose={() => setSelectedGame(undefined)} />
      )}
      {!events.length && Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} />
      ))}
      {events.map(
        (tx) => (
          <Recent key={tx.signature} onClick={() => setSelectedGame(tx)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5em' }}>
              <RecentPlay event={tx} />
            </div>
            <TimeDiff time={tx.time} suffix={md ? 'ago' : ''} />
          </Recent>
        ),
      )}
    </Container>
  )
}