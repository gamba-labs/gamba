import { MIN_BET, lamportsToSol, solToLamports } from 'gamba'
import { ErrorBoundary, formatLamports, useControlsStore, useWagerUtils } from 'gamba/react-ui'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Section } from '../components/Section'
import { GAMES } from '../games'
import { Banner } from './Home'

const GameWrapper = styled.div`
  height: 100vh;
  max-height: -webkit-fill-available;
  @media (min-height: 800px) {
    height: 80vh;
  }
  position: relative;
  transition: height .2s ease;

  @keyframes appearappear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  animation: appearappear .5s;
  background: #0c0c11;
`

const StyledControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  background: #000000CC;
  backdrop-filter: blur(50px);
  & > div {
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`

function WagerInput() {
  const controls = useControlsStore()
  const wager = useWagerUtils({ bet: controls.scheme.wagerInput?.bet })

  const set = (value: number) => {
    controls.setWager(value)
  }

  React.useEffect(
    () => {
      controls.setWager(wager.set(controls.wager))
    }
    , [controls.scheme.wagerInput],
  )

  return (
    <div style={{ position: 'relative' }}>
      <Button className="dark" onClick={
        () => {
          const _wager = prompt('Set Wager', String(lamportsToSol(controls.wager)))
          if (_wager) {
            set(wager.set(solToLamports(Number(_wager))))
          }
        }
      }>
        {formatLamports(controls.wager)}
      </Button>
      <div style={{ display: 'flex', gap: '5px' }}>
        <Button size="small" onClick={() => set(MIN_BET)} className="dark">
          MIN
        </Button>
        <Button size="small" onClick={() => set(wager.max())} className="dark">
          MAX
        </Button>
        <Button size="small" onClick={() => set(wager.times(controls.wager, .5))} className="dark">
          / 2
        </Button>
        <Button size="small" onClick={() => set(wager.times(controls.wager, 2))} className="dark">
          x2
        </Button>
      </div>
    </div>
  )
}

function PlayButton() {
  const controls = useControlsStore()
  const button = controls.scheme.playButton

  if (!button) return null

  return (
    <Button onClick={() => button.onClick()}>
      {button.label ?? 'Play'}
    </Button>
  )
}

function Controls() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName)!, [shortName])
  const [showInfo, setShowInfo] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null!)

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
      <StyledControls>
        <Section ref={ref}>
          <Button
            className="transparent"
            style={{ padding: 0 }}
            onClick={() => setShowInfo(true)}
          >
            <img src={game.image} height="40px" />
          </Button>
          <WagerInput />
          <PlayButton />
        </Section>
      </StyledControls>
    </>
  )
}

export function Game() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName), [shortName])

  if (!game) return (
    <>
      <Banner>
        <h1>Game Not found!</h1>
      </Banner>
    </>
  )

  return (
    <GameWrapper key={game.short_name}>
      <ErrorBoundary error={<>In game error</>}>
        <React.Suspense fallback={<>Loading...</>}>
          <game.app />
        </React.Suspense>
      </ErrorBoundary>
      <Controls />
    </GameWrapper>

  )
}
