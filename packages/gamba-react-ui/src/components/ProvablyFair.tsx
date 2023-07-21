import { useGamba } from 'gamba-react'
import styled from 'styled-components'
import { Svg } from '..'
import { Flex, StylelessButton } from '../styles'
import { copyTextToClipboard } from '../utils'
import { HexColor } from './HexColor'

const VERIFY_URL = 'http://verify.gamba.so/'

function Seed({ children, title }: {children: string, title?: string}) {
  const click = () => copyTextToClipboard(children)

  return (
    <span title={title} onClick={click} style={{ cursor: 'pointer', userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'middle' }}>
      <HexColor>
        {children}
      </HexColor>
    </span>
  )
}

export interface PreviousGame {
  nonce: number,
  clientSeed: string,
  rngSeedHashed: string,
  rngSeed: string,
  options: number[]
}

const PreviousGameLink = styled.a`
  padding: 10px;
  background: var(--bg-light-color);
  border-radius: var(--border-radius);
  display: block;
  border: 1px solid #ffffff33;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
`

export function ProvablyFair({ nextSeedHashed, games }: {nextSeedHashed: string, games: PreviousGame[]}) {
  const gamba = useGamba()

  const link = `${VERIFY_URL}?nonce=${gamba.user?.nonce}&client=${gamba.seed}&rng_hash=${nextSeedHashed}`

  return (
    <div style={{ width: '320px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', marginBottom: '10px' }}>
        <Flex>
          <Svg.Fairness />
          Provably Fair
        </Flex>
        <Flex>
          <StylelessButton title="Randomize Seed" style={{ color: 'white' }} onClick={gamba.updateSeed}>
            <Svg.Shuffle />
          </StylelessButton>
          <a target="_blank" href="https://gamba.so/docs/fair" rel="noreferrer">
            <Svg.Info />
          </a>
        </Flex>
      </div>

      <h4>Next</h4>

      <PreviousGameLink target="_blank" href={link} rel="noreferrer">
        <div>
          {gamba.user?.nonce} - <Seed title="Client Seed">{gamba.seed}</Seed>
        </div>
        <div>
          <Svg.ArrowRight />
        </div>
      </PreviousGameLink>

      {games.length > 0 && (
        <>
          <h4>Previous</h4>
          {games.map((game) => {
            const link = `${VERIFY_URL}?nonce=${game.nonce}&client=${game.clientSeed}&rng_hash=${game.rngSeedHashed}&rng=${game.rngSeed}&options=${game.options.join(',')}`
            return (
              <PreviousGameLink target="_blank" href={link} rel="noreferrer" key={game.nonce}>
                <div>
                  {game.nonce} - <Seed title="Client Seed">{game.clientSeed}</Seed>
                </div>
                <div>
                  <Svg.ArrowRight />
                </div>
              </PreviousGameLink>
            )
          })}
        </>
      )}
    </div>
  )
}
