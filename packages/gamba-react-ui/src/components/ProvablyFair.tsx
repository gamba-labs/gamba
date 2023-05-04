import { useGamba, useGambaEvent } from 'gamba-react'
import { useEffect, useState } from 'react'
import { HexColor } from './HexColor'
import styled from 'styled-components'
import { Button } from './Button'

const Game = styled.div`
  color: white;
  font-size: 12px;
  width: 120px;
`

const Seed = ({ children }: {children: string}) => {
  async function copyTextToClipboard() {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(children)
    } else {
      return document.execCommand('copy', true, children)
    }
  }

  return (
    <div style={{ cursor: 'pointer', userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={copyTextToClipboard}>
      <HexColor>
        {children}
      </HexColor>
    </div>
  )
}

export function ProvablyFair() {
  const [rngSeedHashed, setRngSeedHashed] = useState<string>(null!)
  const [previousGame, setPreviousGame] = useState<{
    nonce: number,
    clientSeed: string,
    rngSeedHashed: string,
    rngSeed: string,
    options: number[]
  }>()
  const gamba = useGamba()

  useGambaEvent(({ nonce, rngSeed, clientSeed, player }) => {
    if (gamba.wallet?.publicKey?.equals(player)) {
      setPreviousGame({ nonce, clientSeed, rngSeedHashed, rngSeed, options: gamba.user?.state.currentGame.options ?? [] })
    }
  }, [rngSeedHashed, gamba.wallet])

  useEffect(() => {
    if (gamba.user?.state.currentGame.rngSeedHashed) {
      setRngSeedHashed(gamba.user.state.currentGame.rngSeedHashed)
    }
  }, [gamba.user?.state.currentGame.rngSeedHashed])

  const link = previousGame && `https://verify.gamba.so/#${btoa(`${previousGame.nonce},${previousGame.clientSeed},${previousGame.rngSeedHashed},${previousGame.rngSeed},${previousGame.options.length}`)}`

  return (
    <>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Game>
          <h2>Next</h2>
          {rngSeedHashed && (
            <div>
              <div>{gamba.user?.nonce}</div>
              <Seed>{gamba.seed}</Seed>
              <Seed>{rngSeedHashed}</Seed>
              <div>Unknown</div>
              <div>Unknown</div>
            </div>
          )}
        </Game>
        <Game>
          <h2>Previous</h2>
          {previousGame && (
            <div>
              <div>
                {previousGame.nonce}
              </div>
              <Seed>{previousGame.clientSeed}</Seed>
              <Seed>{previousGame.rngSeedHashed}</Seed>
              <Seed>{previousGame.rngSeed}</Seed>
              <div>
                {previousGame.options.join(',')}
              </div>
            </div>
          )}
        </Game>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button fill onClick={gamba.updateSeed}>
          Seed
        </Button>
        {link && (
          <Button pulse fill onClick={() => window.open(link, '_blank')}>
            Verify
          </Button>
        )}
      </div>
    </>
  )
}
