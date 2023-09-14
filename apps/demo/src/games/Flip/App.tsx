import { Canvas } from '@react-three/fiber'
import { solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { GameUi, formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Coin } from './Coin'
import { Effect } from './Effect'

import SOUND_COIN from './coin.mp3'
import SOUND_LOSE from './lose.mp3'
import SOUND_WIN from './win.mp3'

const SIDES = {
  Heads: [2, 0],
  Tails: [0, 2],
}

const WAGER_OPTIONS = [0.05, 0.1, 0.5, 1, 3].map(solToLamports)

export default function Flip() {
  const gamba = useGamba()
  const [flipping, setFlipping] = React.useState(false)
  const [win, setWin] = React.useState(false)
  const [resultIndex, setResultIndex] = React.useState(0)
  const [bet, setBet] = React.useState(SIDES.Heads)
  const [wager, setWager] = React.useState(WAGER_OPTIONS[0])

  const sounds = GameUi.useSounds({
    coin: SOUND_COIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
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
      <GameUi.Controls disabled={flipping}>
        <GameUi.Select
          value={wager}
          label="Wager"
          onChange={(wager) => setWager(wager)}
        >
          {WAGER_OPTIONS.map((wager) => (
            <GameUi.Option key={wager} value={wager}>
              {formatLamports(wager)}
            </GameUi.Option>
          ))}
        </GameUi.Select>
        <GameUi.Group>
          {Object.entries(SIDES).map(([label, _bet], i) => (
            <GameUi.Button
              key={i}
              onClick={() => setBet(_bet)}
              selected={bet === _bet}
            >
              {label}
            </GameUi.Button>
          ))}
        </GameUi.Group>
        <GameUi.Button variant="primary" onClick={play}>
          Flip
        </GameUi.Button>
      </GameUi.Controls>
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
    </>
  )
}
