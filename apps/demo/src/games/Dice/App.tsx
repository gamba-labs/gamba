import { useGamba } from 'gamba/react'
import { Fullscreen, formatLamports, useGameControls, useSounds } from 'gamba/react-ui'
import React, { useState } from 'react'
import Slider from './Slider'
import styles from './App.module.css'

import SOUND_LOSE from './lose.mp3'
import SOUND_PLAY from './play.mp3'
import SOUND_TICK from './tick.mp3'
import SOUND_WIN from './win.mp3'

const DICE_SIDES = 100

function Dice() {
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)
  const [resultIndex, setResultIndex] = useState(-1)
  const [rollUnderIndex, setRollUnderIndex] = React.useState(Math.floor(DICE_SIDES / 2))

  const sounds = useSounds({
    win: SOUND_WIN,
    dice: SOUND_PLAY,
    lose: SOUND_LOSE,
    tick: SOUND_TICK,
  })

  const bet = React.useMemo(
    () => Array
      .from({ length: DICE_SIDES })
      .map((_, i) => i >= rollUnderIndex ? 0 : +(DICE_SIDES / rollUnderIndex).toFixed(4)),
    [rollUnderIndex],
  )

  const { wager } = useGameControls({
    disabled: loading,
    wagerInput: { bet },
    playButton: {
      label: 'Roll',
      onClick: () => play(),
    },
  })

  const multiplier = DICE_SIDES / rollUnderIndex
  const winChange = rollUnderIndex / DICE_SIDES

  const updateRollUnderIndex = (x: number) => {
    setRollUnderIndex(x)
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
          <div>{rollUnderIndex + 1}</div>
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
            <div className={styles.result} style={{ left: `${resultIndex}%` }}>
              <div key={resultIndex}>
                {resultIndex + 1}
              </div>
            </div>
          }
          <Slider
            disabled={loading}
            range={[1, DICE_SIDES]}
            min={1}
            max={DICE_SIDES - 5}
            value={rollUnderIndex}
            onChange={updateRollUnderIndex}
          />
        </div>
      </div>
    </Fullscreen>
  )
}

export default Dice
