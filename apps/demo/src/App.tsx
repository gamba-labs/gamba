import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Card } from './components/Card'
import { Header } from './components/Header'
import { Section, SlideSection } from './components/Section'
import { GAMES } from './games'
import { Game } from './ui/Game'
import { Home } from './ui/Home'
import { InitializeAccountModal } from './ui/InitializeUserModal'
import { PoolButton } from './ui/PoolButton'
import { RecentPlays } from './ui/RecentPlays'
import { UserButton } from './ui/UserButton'

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

      <SlideSection title="Casino Games">
        {GAMES.map((game) => (
          <Card
            key={game.short_name}
            to={'/' + game.short_name}
            logo={game.image}
            backgroundColor={game.theme_color}
          />
        ))}
      </SlideSection>

      <Section title="Recent Games">
        <RecentPlays />
      </Section>
    </>
  )
}
