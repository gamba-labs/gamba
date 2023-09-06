import { GameView } from 'gamba/react-ui'
import React, { useMemo } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Section } from './components/Section'
import { Slider } from './components/Slider'
import { GAMES } from './games'
import { InitializeAccountModal } from './ui/InitializeUserModal'
import { PoolButton } from './ui/PoolButton'
import { RecentPlays } from './ui/RecentPlays'
import { UserButton } from './ui/UserButton'

const Banner = styled.div`
  width: 100%;
  background-size: cover;
  background-image: url(/banner.png);
  padding: 50px;
  position: relative;

  @media (min-height: 800px) {
    height: auto;
  }

  &::after {
    content: "";
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    pointer-events: none;
    background-image: linear-gradient(0deg,var(--bg-color) 0%,#04051700 100%);
  }
  transition: height .25s ease;

  @keyframes appearappear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  animation: appearappear .5s;
`

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
`

function Game() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName), [shortName])

  if (!game) return null

  return (
    <GameWrapper key={game.short_name}>
      <GameView game={game} />
    </GameWrapper>
  )
}

export function App() {
  return (
    <>
      <InitializeAccountModal />

      <Header>
        <PoolButton />
        <UserButton />
      </Header>

      <Routes>
        <Route path="/" element={
          <Banner>
            <Section>
              <div>
                <h1>Welcome</h1>
                <p>How are you</p>
                <Button pulse>Do something</Button>
              </div>
            </Section>
          </Banner>
        } />
        <Route path="/:shortName" element={<Game />} />
      </Routes>

      <Section>
        <Slider title={<h2>Casino Games</h2>}>
          {GAMES.map((game) => (
            <Card
              key={game.short_name}
              to={'/' + game.short_name}
              logo={game.image}
              backgroundColor={game.theme_color}
            />
          ))}
        </Slider>
      </Section>

      <Section>
        <h2>Recent Plays</h2>
        <RecentPlays />
      </Section>

      <Section>
        <Footer />
      </Section>
    </>
  )
}
