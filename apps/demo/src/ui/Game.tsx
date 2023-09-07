import { solToLamports } from 'gamba'
import { GameContext, GameControls, GameProvider, formatLamports, useInputContext } from 'gamba/react-ui'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { Modal } from '../components/Modal'
import { Section } from '../components/Section'
import { GAMES } from '../games'

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
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: 1;
  background: #000000CC;
  backdrop-filter: blur(50px);

  padding: 10px;
`

function CustomControl() {
  const { control } = useInputContext()
  return (
    <div style={{ position: 'relative' }}>
      {control.element}
    </div>
  )
}

function WagerControl() {
  const { control } = useInputContext()
  const [visible, setVisible] = React.useState(false)
  const options = [0.05, 0.1, 1, 3, 4, 5, 10].map(solToLamports)

  const set = (value: number) => {
    setVisible(false)
    control.onChange(value)
  }

  return (
    <div style={{ position: 'relative' }}>
      <Button label="Wager" onClick={() => setVisible(!visible)} className="dark">
        {formatLamports(control.value)}
      </Button>
      <Dropdown anchor="bottom" visible={visible}>
        {options.map((option) => (
          <Button className="list transparent" key={option} onClick={() => set(option)}>
            {formatLamports(option)}
          </Button>
        ))}
      </Dropdown>
    </div>
  )
}

function ButtonControl() {
  const { control } = useInputContext()

  return (
    <div style={{ position: 'relative' }}>
      <Button disabled={control.disabled} onClick={() => control.onClick()}>
        Play
      </Button>
    </div>
  )
}

function Controls() {
  const [showInfo, setShowInfo] = React.useState(false)
  const { game } = React.useContext(GameContext)

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
        <Section>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Button style={{ padding: 0 }} onClick={() => setShowInfo(true)} className="transparent">
              <img src={game.image} height="40px" />
            </Button>

            <GameControls
              wager={WagerControl}
              button={ButtonControl}
              custom={CustomControl}
            />

          </div>
        </Section>
      </StyledControls>
    </>
  )
}

export function Game() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName), [shortName])

  if (!game) return null

  return (
    <GameWrapper key={game.short_name}>
      <GameProvider game={game}>
        <game.app />
        <Controls />
      </GameProvider>
    </GameWrapper>

  )
}
