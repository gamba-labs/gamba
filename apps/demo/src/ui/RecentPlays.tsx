import { RecentPlayEvent, lamportsToSol, solToLamports } from 'gamba'
import { useGamba, useRecentPlays } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Icon } from '../components/Icon'
import { cx } from '../utils'
import styles from './RecentPlays.module.css'

const VERIFY_URL = 'https://explorer.solana.com/tx'

const TimeDiff: React.FC<{time: number}> = ({ time }) => {
  const diff = (Date.now() - time)
  return React.useMemo(() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours >= 1) {
      return hours + 'h ago'
    }
    if (minutes >= 1) {
      return minutes + 'm ago'
    }
    return 'Just now'
  }, [time])
}

function RecentPlay({ event, isSelf }: {event: RecentPlayEvent, isSelf: boolean}) {
  const wager = event.wager
  const multiplier = event.resultMultiplier
  const payout = wager * multiplier
  const profit = wager * multiplier - wager

  const isWhale = wager > solToLamports(0.1)
  const isRekt = payout === 0

  const win = profit >= 0

  const whaleStatus = Math.floor(Math.log10(Math.max(1, lamportsToSol(profit) * 1000)))

  return (
    <a className={styles.play} href={`${VERIFY_URL}/${event.signature}`} target="_blank" rel="noreferrer">
      <div>
        <span className={styles.who}>
          {isSelf ? 'You ' : 'Someone '}
        </span>
        made
        <span>
          <span className={cx(styles.amount, win && styles.win)}>
            {formatLamports(payout)} from {formatLamports(wager)}
          </span>
        </span>
        <span className={styles.flares}>
          {whaleStatus > 0 && '🐋'.repeat(whaleStatus - 1)}
          {isWhale && '🐳'}
          {isRekt && '💀'}
          {'🔥'.repeat(Math.floor(Math.max(0, multiplier - 1)))}
        </span>
      </div>
      <span>
        <TimeDiff time={event.estimatedTime} /> <Icon.ExternalLink />
      </span>
    </a>
  )
}

export function RecentPlays() {
  const { wallet } = useGamba()
  const recentPlays = useRecentPlays()

  return (
    <div className={styles.container}>
      {recentPlays.map((event, i) => (
        <RecentPlay
          key={i}
          event={event}
          isSelf={event.player.equals(wallet.publicKey)}
        />
      ))}
      {!recentPlays.length && Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  )
}
