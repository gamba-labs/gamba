import { MIN_BET, lamportsToSol, solToLamports } from 'gamba'
import { useBalances } from 'gamba/react'
import { GameView, formatLamports, useControlsStore, useWagerUtils } from 'gamba/react-ui'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Button2 } from '../components/Button/Button'
import { Modal2 } from '../components/Modal/Modal'
import { GAMES } from '../games'
import styles from './Game.module.css'
import { Home } from './Home'

function WagerInput() {
  const balances = useBalances()
  const controls = useControlsStore()
  const wager = useWagerUtils({ bet: controls.scheme.wagerInput?.bet })

  const set = (value: number) => {
    controls.setWager(value)
  }

  React.useEffect(
    () => {
      controls.setWager(wager.set(controls.wager))
    }
    , [controls.scheme],
  )

  if (!controls.scheme.wagerInput) return null

  return (
    <div style={{ position: 'relative' }}>
      <Button2
        style={{ width: '100%' }}
        onClick={
          () => {
            const _wager = prompt('Set Wager', String(lamportsToSol(controls.wager)))
            if (_wager) {
              set(wager.set(solToLamports(Number(_wager))))
            }
          }
        }
      >
        {formatLamports(controls.wager)}
      </Button2>
      <div>
        <input
          type="range"
          min={wager.min()}
          style={{ width: '100%' }}
          max={balances.total}
          value={controls.wager}
          onChange={(e) => controls.setWager(Number(e.target.value))}
        />
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        <Button2 variant="ghost" size="small" onClick={() => set(MIN_BET)}>
          MIN
        </Button2>
        <Button2 variant="ghost" size="small" onClick={() => set(wager.max())}>
          MAX
        </Button2>
        <Button2 variant="ghost" size="small" onClick={() => set(wager.times(controls.wager, .5))}>
          / 2
        </Button2>
        <Button2 variant="ghost" size="small" onClick={() => set(wager.times(controls.wager, 2))}>
          x2
        </Button2>
      </div>
    </div>
  )
}

function PlayButton() {
  const controls = useControlsStore()
  const button = controls.scheme.playButton

  if (!button) return null

  return (
    <Button2 disabled={controls.scheme.disabled} onClick={() => button.onClick()}>
      {button.label ?? 'Play'}
    </Button2>
  )
}

function Controls() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName)!, [shortName])
  const [showInfo, setShowInfo] = React.useState(false)

  return (
    <>
      {showInfo && (
        <Modal2 onClose={() => setShowInfo(false)}>
          <h1 style={{ textAlign: 'center' }}>
            <img height="100" src={game.image} alt={game.name} />
          </h1>
          {game.description || 'No information available'}
        </Modal2>
      )}
      <div className={styles.controls}>
        <Button2
          variant="ghost"
          style={{ padding: 0 }}
          onClick={() => setShowInfo(true)}
        >
          <img src={game.image} height="40px" />
        </Button2>
        <div>
          <WagerInput />
        </div>
        <div style={{ height: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <PlayButton />
        </div>
      </div>
    </>
  )
}

export function Game() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName), [shortName])

  if (!game) return (<Home />)

  return (
    <>
      <div className={styles.container}>
        <div key={game.short_name} className={styles.wrapper}>
          <GameView game={game} />
        </div>
        <Controls />
      </div>
    </>

  )
}
