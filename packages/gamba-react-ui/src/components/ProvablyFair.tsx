import { useGamba } from 'gamba-react'
import styled from 'styled-components'
import { Svg } from '..'
import { HexColor } from './HexColor'

const VERIFY_URL = 'http://verify.gamba.so/'

const Seed = ({ children, title }: {children: string, title?: string}) => {
  async function copyTextToClipboard() {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(children)
    } else {
      return document.execCommand('copy', true, children)
    }
  }

  return (
    <span title={title} style={{ cursor: 'pointer', userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'middle' }} onClick={copyTextToClipboard}>
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

const StylelessButton = styled.button`
  border: none;
  margin: 0;
  outline: none;
  padding: 0;
  background: none;
`

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
      <h3 style={{ display: 'grid', gridTemplateColumns: '1fr auto', marginBottom: '10px' }}>
        <div>
          <span style={{ marginRight: '10px' }}>
            <Svg.Fairness />
          </span>
          Provably Fair
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <StylelessButton title="Randomize Seed" style={{ color: 'white' }} onClick={gamba.updateSeed}>
            <Svg.Refresh />
          </StylelessButton>
          <a target="_blank" href="https://gamba.so/docs/fair" rel="noreferrer">
            <Svg.Info />
          </a>
        </div>
      </h3>

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
      {/* {previousGame && (
        <div>
          <div title="Nonce">
            {previousGame.nonce}
          </div>
          <Seed title="Client Seed">{previousGame.clientSeed}</Seed>
          <Seed title="Hashed RNG seed">{previousGame.rngSeedHashed}</Seed>
          <Seed title="RNG seed">{previousGame.rngSeed}</Seed>
          <div>
            {previousGame.options.join(',')}
          </div>
        </div>
      )} */}
      {/* <div style={{ display: 'flex', gap: '10px' }}>
        <Button fill onClick={gamba.updateSeed}>
          Seed
        </Button>
      </div> */}
    </div>
  )
}
