import { GambaUi, useGambaAudioStore } from 'gamba-react-ui-v2'
import { useGamba, useTransactionStore } from 'gamba-react-v2'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { GameSlider } from '../Dashboard/Dashboard'
import { Container, Controls, IconButton, LoadingIndicator, Screen, Splash } from './Game.styles'
import { ProvablyFairModal } from './ProvablyFairModal'

function CustomError() {
  return (
    <>
      <GambaUi.Portal target="error">
        <GambaUi.Responsive>
          <h1>😭 Oh no!</h1>
          <p>Something went wrong</p>
        </GambaUi.Responsive>
      </GambaUi.Portal>
    </>
  )
}

/**
 * A renderer component to display the contents of the loaded GambaUi.Game
 * Screen
 * Controls
 */
function CustomRenderer() {
  const gamba = useGamba()
  const { game } = GambaUi.useGame()
  const [info, setInfo] = React.useState(false)
  const [provablyFair, setProvablyFair] = React.useState(false)
  const audioStore = useGambaAudioStore()
  const hasBeenPlayed = useUserStore((state) => state.gamesPlayed.includes(game.id))
  const markAsPlayed = useUserStore((state) => () => state.markGameAsPlayed(game.id, true))
  const [ready, setReady] = React.useState(false)

  React.useEffect(
    () => {
      const timeout = setTimeout(() => {
        setReady(true)
      }, 750)
      return () => clearTimeout(timeout)
    },
    [],
  )

  React.useEffect(
    () => {
      const timeout = setTimeout(() => {
        setInfo(!hasBeenPlayed)
      }, 1000)
      return () => clearTimeout(timeout)
    },
    [hasBeenPlayed],
  )

  const closeInfo = () => {
    markAsPlayed()
    setInfo(false)
  }

  return (
    <>
      {info && (
        <Modal onClose={() => setInfo(false)}>
          <h1>
            <img height="100px" title={game.meta.name} src={game.meta.image} />
          </h1>
          <p>{game.meta.description}</p>
          <GambaUi.Button onClick={closeInfo}>
            Close
          </GambaUi.Button>
        </Modal>
      )}
      {provablyFair && (
        <ProvablyFairModal onClose={() => setProvablyFair(false)} />
      )}
      <Container>
        <Screen>
          <Splash>
            <img height="150px" src={game.meta.image} />
          </Splash>
          <GambaUi.PortalTarget target="error" />
          {ready && <GambaUi.PortalTarget target="screen" />}
          {/* {ready && <iframe src="http://localhost:4444" style={{ width: '100%', height: '100%', border: 'none' }} />} */}
          <div style={{ position: 'absolute', bottom: '0', left: 0, width: '100%', padding: '10px' }}>
            <IconButton onClick={() => audioStore.set(audioStore.masterGain ? 0 : .5)}>
              {audioStore.masterGain ? '🔈' : '🔇'}
            </IconButton>
          </div>
        </Screen>
        <LoadingIndicator
          key={Number(gamba.isPlaying)}
          $active={gamba.isPlaying}
        />
        <Controls>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex' }}>
              <IconButton onClick={() => setInfo(true)}>
                <Icon.Info />
              </IconButton>
              <IconButton onClick={() => setProvablyFair(true)}>
                <Icon.Fairness />
              </IconButton>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GambaUi.PortalTarget target="controls" />
              <GambaUi.PortalTarget target="play" />
            </div>
          </div>
        </Controls>
      </Container>
    </>
  )
}

export default function Game() {
  const { gameId } = useParams()
  const game = GAMES.find((x) => x.id === gameId)

  return (
    <>
      {game ? (
        <GambaUi.Game
          game={game}
          errorFallback={<CustomError />}
          children={<CustomRenderer />}
        />
      ) : (
        <h1>Game not found! 👎</h1>
      )}
      <GameSlider />
    </>
  )
}
