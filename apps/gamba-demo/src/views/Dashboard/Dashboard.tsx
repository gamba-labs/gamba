import { Button, Modal, RecentPlays, StyledGameWrapper, useGambaUi } from 'gamba/react-ui'
import React, { useState } from 'react'
import { FaCoins, FaDice } from 'react-icons/fa'
import { GameLink } from '../../components/GameLink'
import { Banner, Section, Grid } from './styles'

export default function Dashboard() {
  const [modal, setModal] = useState(false)
  const games = useGambaUi((state) => state.games)
  return (
    <div>
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <div style={{ padding: 20 }}>
            <div>Custom content here</div>
          </div>
        </Modal>
      )}
      <StyledGameWrapper heights={[360, 500]}>
        <Banner>
          <div>
            <Section style={{ paddingTop: 60 }}>
              <h1>
                Gamba Demo
              </h1>
              <div>
                A decentralized, provably-fair casino built on <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">gamba</a>.
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <Button onClick={() => setModal(true)}>
                  Read More
                </Button>
                <Button onClick={() => setModal(true)}>
                  Buy NFT
                </Button>
              </div>
            </Section>
          </div>
        </Banner>
      </StyledGameWrapper>
      <Section>
        <h2>
          <FaDice /> Featured Games
        </h2>
        <Grid>
          {games.map((game) =>
            <GameLink
              key={game.shortName}
              game={game}
            />,
          )}
        </Grid>
      </Section>
      <Section>
        <h2>
          <FaCoins /> Recent Plays
        </h2>
        <RecentPlays />
      </Section>
    </div>
  )
}
