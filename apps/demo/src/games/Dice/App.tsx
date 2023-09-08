import { useGamba } from 'gamba/react'
import { Fullscreen, formatLamports, useGameControls, useSounds } from 'gamba/react-ui'
import React, { useState } from 'react'
import Slider from './Slider'
import styles from './styles.module.css'

import SOUND_LOSE from './lose.mp3'
import SOUND_PLAY from './play.mp3'
import SOUND_TICK from './tick.wav'
import SOUND_WIN from './win.mp3'

const SIZE = 25

function Dice() {
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)
  const [resultIndex, setResultIndex] = useState(-1)
  const [rollUnder, setRollUnder] = React.useState(Math.floor(SIZE / 2))

  const sounds = useSounds({
    win: SOUND_WIN,
    dice: SOUND_PLAY,
    lose: SOUND_LOSE,
    tick: SOUND_TICK,
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fullscreen maxScale={1.5}>
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
        <div className={styles.sliderContainer}>
          {resultIndex > -1 &&
            <div
              key={resultIndex}
              className={styles.result}
              style={{ left: `${resultIndex}%` }}
            >
              <div>
                {resultIndex}
              </div>
            </div>
          }
          <Slider
            disabled={loading}
            min={0}
            max={SIZE}
            value={rollUnder}
            onChange={updateRollUnder}
          />
        </div>
      </div>
    </Fullscreen>
  )
}

export default Dice
