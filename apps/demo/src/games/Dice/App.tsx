import { useGamba } from 'gamba/react'
import { ResponsiveSize, formatLamports, useGameControls, useSounds } from 'gamba/react-ui'
import React, { useState } from 'react'
import Slider from './Slider'
import styles from './styles.module.css'

import diceSrc from './dice.wav'
import loseSrc from './lose.mp3'
import tickSrc from './tick.wav'
import winSrc from './win.mp3'

const SIZE = 100

function Dice() {
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)
  const [resultIndex, setResultIndex] = useState(-1)
  const [rollUnder, setRollUnder] = React.useState(Math.floor(SIZE / 2))

  const sounds = useSounds({
    win: winSrc,
    dice: diceSrc,
    lose: loseSrc,
    tick: tickSrc,
  })

  const multiplier = SIZE / rollUnder
  const winChange = rollUnder / SIZE

  const bet = React.useMemo(
    () =>
      Array.from({ length: SIZE }).map((_, i) =>
        i >= rollUnder ? 0 : +multiplier.toFixed(4),
      )
    , [rollUnder],
  )

  const { wager } = useGameControls({
    disabled: loading,
    wagerInput: { bet },
    playButton: {
      label: 'Start',
      onClick: () => play(),
    },
  })

  const updateRollUnder = (x: number) => {
    setRollUnder(x)
    sounds.tick.play()
  }

  const play = async () => {
    try {
      setLoading(true)
      sounds.dice.play()

      await gamba.play({
        bet,
        wager,
      })

      const result = await gamba.awaitResult()

      setResultIndex(result.resultIndex)

      const win = result.payout > 0
      if (win) {
        sounds.win.play()
      } else {
        sounds.lose.play()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResponsiveSize maxScale={1.5}>
        <div className={styles.container}>
          <div className={styles.rollUnder}>
            <div>{rollUnder}</div>
            <div>Roll Under</div>
          </div>
          <div className={styles.stats}>
            <div>
              <div>{(winChange * 100).toFixed(1)}%</div>
              <div>Win Chance</div>
            </div>
            <div>
              <div>{multiplier.toFixed(2)}x</div>
              <div>Multiplier</div>
            </div>
            <div>
              <div>{formatLamports(wager * multiplier - wager)}</div>
              <div>Payout</div>
            </div>
          </div>
          <Slider
            resultIndex={resultIndex}
            disabled={loading}
            min={0}
            max={SIZE}
            value={rollUnder}
            onChange={updateRollUnder}
          />
        </div>
      </ResponsiveSize>
    </>
  )
}

export default Dice
