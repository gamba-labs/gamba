import { GameBundle, GameView } from 'gamba/react-ui'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from './components/Card'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { RecentPlays } from './components/RecentPlays'
import { Slider } from './components/Slider'
import { GAMES } from './games'
import { Section } from './styles'

const StyledFrame = styled.div<{$viewHeight: number}>`
  height: 100vh;
  max-height: -webkit-fill-available;
  @media (min-height: 800px) {
    height: ${({ $viewHeight }) => $viewHeight}vh;
  }
  position: relative;
  transition: height .2s ease;
`

function Frame({ game }: {game?: GameBundle}) {
  return (
    <StyledFrame $viewHeight={game ? 75 : 50}>
      {game && <GameView game={game} />}
      {!game && (
        <Section style={{ height: '100%' }}>
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>
              {/* <QRCode value={gamba.wallet.publicKey.toBase58()} /> */}
              {/* <br /> */}
              {/* <div style={{ display: 'inline-block' }}>
                <WalletMultiButton />
              </div> */}
              {/* <h2>Featured Games</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
                {GAMES.map((game) => (
                  <Card key={game.short_name} to={'/' + game.short_name} logo={game.image} backgroundColor={game.theme_color} />
                ))}
              </div> */}
            </div>
          </div>
        </Section>
      )}
    </StyledFrame>
  )
}

export default function View() {
  const { shortName } = useParams()
  const game = useMemo(() => GAMES.find((x) => x.short_name === shortName), [shortName])

  return (
    <>
      <Header />
      <Frame game={game} />
      <Section>
        <Slider title={<h2>Casino Games</h2>}>
          {GAMES.map((game) => (
            <Card key={game.short_name} to={'/' + game.short_name} logo={game.image} backgroundColor={game.theme_color} />
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
