import { Canvas } from '@react-three/fiber'
import { useGamba } from 'gamba/react'
import { Fullscreen, useGameControls, useSounds } from 'gamba/react-ui'
import React from 'react'
import styles from './App.module.css'
import { Coin } from './Coin'
import { Effect } from './Effect'

import SOUND_COIN from './coin.mp3'
import SOUND_LOSE from './lose.mp3'
import SOUND_WIN from './win.mp3'

const SIDES = {
  Heads: [2, 0],
  Tails: [0, 2],
}

export default function Flip() {
  const gamba = useGamba()
  const [flipping, setFlipping] = React.useState(false)
  const [win, setWin] = React.useState(false)
  const [resultIndex, setResultIndex] = React.useState(-1)
  const [bet, setBet] = React.useState(SIDES.Heads)

  const sounds = useSounds({
    coin: SOUND_COIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })

  const { wager } = useGameControls({
    disabled: flipping,
    wagerInput: { bet },
    playButton: { onClick: () => play() },
  })

  const play = async () => {
    try {
      setWin(false)
      setFlipping(true)

      sounds.coin.play({ playbackRate: .5 })

      const res = await gamba.play({ bet, wager })

      sounds.coin.play()

      const result = await res.result()

      const win = result.payout > 0

      setResultIndex(result.resultIndex)

      setWin(win)

      if (win) {
        sounds.win.play()
      } else {
        sounds.lose.play()
      }
    } finally {
      setFlipping(false)
    }
  }

  return (
    <>
      <Canvas
        linear
        flat
        orthographic
        camera={{
          zoom: 80,
          position: [0, 0, 100],
        }}
      >
        <Coin result={resultIndex} flipping={flipping} />
        {flipping && <Effect color="white" />}
        {win && <Effect color="#42ff78" />}
      </Canvas>
      <Fullscreen style={{ pointerEvents: 'none' }} maxScale={1.5}>
        <div className={[styles.container, flipping && styles.flipping].join(' ')}>
          {Object.entries(SIDES).map(([label, _bet], i) => (
            <button
              key={i}
              onClick={() => setBet(_bet)}
              className={[styles.button, bet === _bet && styles.selected].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </Fullscreen>
    </>
  )
}
