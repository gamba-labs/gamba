import { GameView, RecentPlays } from 'gamba/react-ui'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from './components/Header'
import { GAMES } from './games'
import { Section } from './styles'

export default function View() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName) ?? GAMES[0], [shortName])

  return (
    <>
      <Header />
      <GameView game={game} />
      <Section>
        <RecentPlays />
      </Section>
    </>
  )
}
