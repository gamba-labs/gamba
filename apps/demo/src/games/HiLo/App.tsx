import { solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { Fullscreen, useSounds } from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import { RANKS } from './constants'
import styles from './App.module.css'

import SOUND_CARD from './card.mp3'
import SOUND_WIN from './win.mp3'


const randomRank = () => 1 + Math.floor(Math.random() * (RANKS - 1))
const WAGER_AMOUNTS = [0.05, 0.1, 0.25, 0.5, 1, 2].map(solToLamports)

export default function HiLo() {
  const gamba = useGamba()
  const sounds = useSounds({
    win: SOUND_WIN,
    card: SOUND_CARD,
  })
  const [cards, setCards] = useState([randomRank()])
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [wager, setWager] = useState(WAGER_AMOUNTS[0])
  const [currentRank] = cards
  const addCard = (rank: number) => setCards((cards) => [rank, ...cards])
  const [option, setOption] = useState<'hi' | 'lo' | 'same'>()
  const [totalGain, setTotalGain] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, lost

  const betHi = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i > 0 && i >= currentRank ? (currentRank === 0 ? RANKS / (RANKS - 1) : RANKS / (RANKS - currentRank)) : 0,
    ), [currentRank])

  const betLo = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i < RANKS - 1 && i <= currentRank ? (currentRank === RANKS - 1 ? RANKS / currentRank : RANKS / (currentRank + 1)) : 0,
    ), [currentRank])

  const betSame = useMemo(() => [RANKS, ...Array(RANKS - 1).fill(0)], [currentRank])

  const claim = async () => {
    if (gamba.balances.user > 0) {
      setClaiming(true)
      await gamba.withdraw()
      setClaiming(false)
    }
    setGameState('lost')
  }

  const reset = async () => {
    setCards([randomRank()])
    setLoading(false)
    setTotalGain(0)
    setGameState('idle')
  }

  const play = async () => {
    try {
      const bet = (
        () => {
          if (option === 'hi')
            return betHi
          if (option === 'lo')
            return betLo
          return betSame
        }
      )()

      const res = await gamba.play({ bet, wager: gameState === 'playing' ? wager + totalGain : wager, deductFees: true })

      setLoading(true)
      setGameState('playing')
      const result = await res.result()
      addCard(result.resultIndex)
      sounds.card.play()

      const win = result.payout > 0

      if (win) {
        sounds.win.play()
        setTotalGain(totalGain + result.payout)
      } else {
        setGameState('lost')
        setTotalGain(0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const needsReset = gameState === 'lost'

  return (
    <>
      <Fullscreen maxScale={1.25}>
        <div className={styles.container}>
          {currentRank !== 0 ? (
            <div className={styles.option} onClick={() => setOption('lo')}>
              {/* <div><FaHandPointDown /></div> */}
              <div>(x{Math.max(...betLo).toFixed(2)})</div>
            </div>
          ) : (
            <div className={styles.option} onClick={() => setOption('same')}>
              {/* <div><FaEquals /></div> */}
              <div>(x{Math.max(...betSame).toFixed(2)})</div>
            </div>
          )}
          <div className={styles.card} key={cards.length}>
            <div className="rank">{currentRank + 1}</div>
            <div className="suit"></div>
          </div>
          {currentRank !== RANKS - 1 ? (
            <div className={styles.option} onClick={() => setOption('hi')}>
              <div>{'^'}</div>
              <div>(x{Math.max(...betHi).toFixed(2)})</div>
            </div>
          ) : (
            <div className={styles.option} onClick={() => setOption('same')}>
              <div>{'='}</div>
              <div>(x{Math.max(...betSame).toFixed(2)})</div>
            </div>
          )}
          {needsReset && !loading && (
            <div className={styles.overlay}>
              Reset to start
            </div>
          )}
        </div>
      </Fullscreen>
      {/* <ActionBar>
        {gameState === 'lost' ? (
          <Button onClick={reset}>Reset</Button>
        ) : (
          <>
            {gameState === 'idle' ? (
              <Dropdown
                value={wager}
                format={(value) => formatLamports(value)}
                label="Wager"
                onChange={setWager}
                options={WAGER_AMOUNTS.map((value) => ({
                  label: formatLamports(value),
                  value,
                }))}
              />
            ) : (
              <Button
                loading={claiming}
                disabled={claiming || loading}
                onClick={claim}
              >
                CASHOUT {formatLamports(gamba.balances.user)}
              </Button>
            )}
            <Button loading={loading} disabled={!option} onClick={play}>
              PLAY {option}
            </Button>
          </>
        )}
      </ActionBar> */}
    </>
  )
}
