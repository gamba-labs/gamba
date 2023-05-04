import { Button, GameBundle, GameView, RecentPlays, Svg, useGambaUi } from 'gamba/react-ui'
import React, { Fragment, useMemo } from 'react'
import { FaArrowRight, FaDice, FaList } from 'react-icons/fa'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { GameCard } from './components/GameCard'
import { Slider } from './components/Slider'
import { StylelessButton } from './games/Roulette/styles'
import { Banner, Section } from './styles'

function GameSection({ play, games }: {play: boolean, games: GameBundle[]}) {
  return (
    <Section>
      <h2>
        <FaDice /> Featured Games
      </h2>
      <Slider $minimized={play}>
        {games.map((game) => (
          <NavLink to={`/${game.short_name}`} key={game.short_name}>
            <GameCard game={game} />
          </NavLink>
        ))}
      </Slider>
    </Section>
  )
}

const CoverImage = styled.div`
  transition: background-image .2s ease;
  background-image: url("");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
`

function Details({ game }: {game?: GameBundle}) {
  const navigate = useNavigate()

  return (
    <>
      <CoverImage style={{ backgroundImage: 'url(' + (game?.image ?? 'https://pbs.twimg.com/profile_banners/1634200383886090249/1680627885/1500x500') + ')' }} />
      <div>
        <Section>
          <div style={{ position: 'absolute', top: 80, right: 20, zIndex: 1000 }}>
            <StylelessButton style={{ color: 'white', fontSize: '20px' }} onClick={() => navigate('/')}>
              <Svg.Close />
            </StylelessButton>
          </div>
        </Section>
        {game ? (
          <Section>
            <h1>{game.name}</h1>
            <div style={{ color: '#ffffff99' }}>By {game.creator}</div>
            <div>{game.description ?? '-'}</div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'end' }}>
              <Button fill pulse onClick={() => navigate('/' + game.short_name + '/play')}>
                Play Game <FaArrowRight />
              </Button>
            </div>
          </Section>
        ) : (
          <Section>
            <h1>Gamba Demo</h1>
            <div>
              A decentralized, provably-fair casino built on <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">gamba</a>.
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Button onClick={() => window.open('https://twitter.com/gambalabs', '_blank')}>
                Read More
              </Button>
            </div>
          </Section>
        )}
      </div>
    </>
  )
}

function Content({ play }: {play: boolean}) {
  const { shortName } = useParams()
  const navigate = useNavigate()
  const games = useGambaUi((state) => state.games)
  const game = useMemo(() => games.find((x) => x.short_name === shortName), [games, shortName])

  return (
    <Banner $game={play} $yes={!!shortName}>
      <Fragment key={shortName}>
        {(play && game) ? (
          <div>
            <GameView game={game} />
            <div style={{ position: 'absolute', top: 80, right: 20, zIndex: 1000 }}>
              <StylelessButton style={{ color: 'white', fontSize: '20px' }} onClick={() => navigate('/' + game.short_name)}>
                <Svg.Close />
              </StylelessButton>
            </div>
          </div>
        ) : (
          <Details game={game} />
        )}
      </Fragment>
    </Banner>
  )
}

export default function View({ play = false }: {play?: boolean}) {
  const games = useGambaUi((state) => state.games)
  return (
    <>
      <Content play={play} />
      {games.length > 1 && (
        <GameSection
          games={games}
          play={play}
        />
      )}
      <Section>
        <h2>
          <FaList /> Recent Plays
        </h2>
        <RecentPlays />
      </Section>
    </>
  )
}
