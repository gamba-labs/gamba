import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { lamportsToSol, solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button } from 'gamba/react-ui'
import React, { useState } from 'react'
import * as Tone from 'tone'
import { Dropdown } from '../../components/Dropdown'
import { Coin } from './Coin'

const BETS = [
  0.05,
  0.1,
  0.25,
  .5,
  1,
  3,
].map(solToLamports)

const createSound = (src: string) =>
  new Tone.Player({ url: new URL(src, import.meta.url).href }).toDestination()

const soundPlay = createSound('./play.wav')
const soundWin = createSound('./win.wav')
const soundLose = createSound('./lose.wav')

export default function Flip() {
  const gamba = useGamba()
  const [flipping, setFlipping] = useState<'heads' | 'tails'>()
  const [result, setResult] = useState<number | null>(null)
  const [wager, setWager] = useState(BETS[0])

  const play = async (option: 'heads' | 'tails') => {
    try {
      const bet = option === 'heads' ? [2, 0] : [0, 2]
      const response = await gamba.play(bet, wager)
      soundPlay.start()
      setFlipping(option)
      const result = await response.result()
      const win = result.payout > 0
      setResult(result.resultIndex)
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
      <Canvas linear flat style={{ width: '100%', height: '100%' }}>
        <OrthographicCamera makeDefault zoom={100} far={100} near={0} position={[0, 0, 10]} />
        <Coin result={result} flipping={!!flipping} />
      </Canvas>
      <ActionBar>
        <Dropdown
          value={wager}
          format={(value) => lamportsToSol(value) + ' SOL'}
          label="Wager"
          onChange={setWager}
          options={BETS.map((value) => ({
            label: lamportsToSol(value) + ' SOL',
            value,
          }))}
        />
        <Button loading={flipping === 'heads'} disabled={!!flipping} onClick={() => play('heads')}>
          Heads
        </Button>
        <Button loading={flipping === 'tails'} disabled={!!flipping} onClick={() => play('tails')}>
          Tails
        </Button>
      </ActionBar>
    </>
  )
}
