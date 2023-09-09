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
    <Button color="white" disabled={controls.scheme.disabled} onClick={() => button.onClick()}>
      {button.label ?? 'Play'}
    </Button>
  )
}

function Controls() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName)!, [shortName])
  const [showInfo, setShowInfo] = React.useState(true)
  const controls = useControlsStore()

  return (
    <>
      {showInfo && (
        <Modal onClose={() => setShowInfo(false)}>
          <h1 style={{ textAlign: 'center' }}>
            <img height="100" src={game.image} alt={game.name} />
          </h1>
          <p>
            {game.description || 'No information available'}
          </p>
          <Button onClick={() => setShowInfo(false)}>
            Play
          </Button>
        </Modal>
      )}
      <div className={styles.controls}>
        <div>
          <Button
            variant="ghost"
            size="small"
            style={{ width: '100px' }}
            onClick={() => setShowInfo(true)}
          >
            <img src={game.image} height="40px" />
          </Button>
          <div>
            <WagerInput />
            {controls.scheme.custom && controls.scheme.custom}
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
      <div key={game.short_name} className={styles.container}>
        <div className={styles.view}>
          <GameView game={game} />
        </div>
        <Controls />
      </div>
    </>

  )
}
