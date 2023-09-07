import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Card } from './components/Card'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Section } from './components/Section'
import { Slider } from './components/Slider'
import { GAMES } from './games'
import { Game } from './ui/Game'
import { Home } from './ui/Home'
import { PoolButton } from './ui/PoolButton'
import { RecentPlays } from './ui/RecentPlays'
import { UserButton } from './ui/UserButton'
import { InitializeAccountModal } from './ui/InitializeUserModal'

export function App() {
  const location = useLocation()

  React.useEffect(() =>
    document.body.scrollTo({
      top: 0,
      left: 0,
    })
  , [location.key])

  return (
    <>
      <InitializeAccountModal />

      <Header>
        <PoolButton />
        <UserButton />
      </Header>

      <Routes>
        <Route path="/" element={<Home />} />
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
