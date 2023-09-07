import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { solToLamports } from 'gamba'
import { useGameControls } from 'gamba/react-ui'
import React, { useState } from 'react'
import * as Tone from 'tone'
import { Coin } from './Coin'
import { SplashEffect } from './SplashEffect'
import coinSrc from './coin.wav'
import loseSrc from './lose.wav'
import winSrc from './win.wav'
import { useGamba } from 'gamba/react'

const WAGER_AMOUNTS = [
  0.05,
  0.1,
  0.25,
  .5,
  1,
  3,
].map(solToLamports)

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundPlay = createSound(coinSrc)
const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)

interface Result {
  win: boolean
  index: number
}

export default function Flip() {
  const gamba = useGamba()
  const [side, setSide] = useState<'heads' | 'tails'>('heads')
  const [flipping, setFlipping] = useState<'heads' | 'tails'>()
  const [result, setResult] = useState<Result>()
  const [wager, setWager] = useState(WAGER_AMOUNTS[0])

  const bet = React.useMemo(
    () => side === 'heads' ? [2, 0] : [0, 2],
    [side],
  )

  useGameControls({
    wager: {
      type: 'wager',
      onChange: setWager,
      value: wager,
    },

    play: {
      type: 'button',
      disabled: !!flipping,
      onClick: () => play(),
    },
  })

  const play = async () => {
    try {
      setFlipping(side)

      soundPlay.playbackRate = .5
      soundPlay.start()

      await gamba.play({ bet, wager })

      soundPlay.playbackRate = 1
      soundPlay.start()

      const result = await gamba.awaitResult()

      const win = result.payout > 0

      setResult({
        index: result.resultIndex,
        win,
      })
      if (win)
        soundWin.start()
      else
        soundLose.start()
    } catch (err) {
      console.error(err)
    } finally {
      setFlipping(undefined)
    }
  }

  return (
    <>
      <Canvas linear flat onContextMenu={(e) => e.preventDefault()}>
        <OrthographicCamera
          makeDefault
          zoom={80}
          position={[0, 0, 100]}
        />
        <Coin result={result?.index ?? 0} flipping={!!flipping} />
        {flipping && <SplashEffect color="white" />}
        {!flipping && result?.win && <SplashEffect color="#42ff78" />}
        <ambientLight color="#ffffff" intensity={.5} />
        <directionalLight position={[0, 5, 5]} intensity={.5} />
        <hemisphereLight color="black" groundColor="red" intensity={1} />
      </Canvas>
    </>
  )
}

// params: {
//   wager,
//   bet,
// },
// onStart: () => {
//   soundPlay.playbackRate = 1
//   soundPlay.start()
// },
// onResult: (result) => {
//   const win = result.payout > 0

//   setResult({
//     index: result.resultIndex,
//     win,
//   })
//   if (win) {
//     soundWin.start()
//   } else {
//     soundLose.start()
//   }

//   setFlipping(undefined)
// },
