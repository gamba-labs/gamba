import { GameWrapper, RecentPlays, useGambaUi } from 'gamba/react-ui'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import { FaCoins } from 'react-icons/fa'
import { Section } from './views/Dashboard/styles'

const Dashboard = React.lazy(() => import('./views/Dashboard/Dashboard'))

export function App() {
  const games = useGambaUi((state) => state.games)
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={null}>
              <Dashboard />
            </React.Suspense>
          }
        />
        {games.map((game) => (
          <Route
            key={game.shortName}
            path={'/' + game.shortName}
            element={
              <>
                <GameWrapper game={game} />
                <Section>
                  <h2>
                    <FaCoins /> Recent Plays
                  </h2>
                  <RecentPlays />
                </Section>
              </>
            }
          />
        ))}
      </Routes>
      <Footer />
    </>
  )
}
