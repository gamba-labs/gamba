import { GameView, useControlsStore } from 'gamba/react-ui'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { GAMES } from '../games'
import styles from './Game.module.css'
import { Home } from './Home'
import { WagerInput } from './WagerInput'

function PlayButton() {
  const controls = useControlsStore()
  const button = controls.scheme.playButton

  if (!button) return null

  return (
    <Button disabled={controls.scheme.disabled} onClick={() => button.onClick()}>
      {button.label ?? 'Play'}
    </Button>
  )
}

function Controls() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName)!, [shortName])
  const [showInfo, setShowInfo] = React.useState(false)

  return (
    <>
      {showInfo && (
        <Modal onClose={() => setShowInfo(false)}>
          <h1 style={{ textAlign: 'center' }}>
            <img height="100" src={game.image} alt={game.name} />
          </h1>
          {game.description || 'No information available'}
        </Modal>
      )}
      <div className={styles.controls}>
        <div>
          <Button
            variant="ghost"
            style={{ padding: 0 }}
            onClick={() => setShowInfo(true)}
          >
            <img src={game.image} height="40px" />
          </Button>
          <div>
            <WagerInput />
          </div>
          <div style={{ height: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <PlayButton />
          </div>
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
