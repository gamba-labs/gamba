import { useGamba, useGambaEvent } from 'gamba-react'
import { PropsWithChildren, useEffect, useState } from 'react'
import styled from 'styled-components'
import { ProvablyFair, Svg } from '..'
import { Button } from './Button'
import { PreviousGame } from './ProvablyFair'

const Container = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: 1;
  padding: 10px;
`

const Wrapper = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 20px;
  & > div {
    display: flex;
    gap: 20px;
  }
  & .seperator {
    width: 1px;
    background: #ffffff33;
  }
  background: #00000099;
  border-radius: var(--border-radius);
  backdrop-filter: blur(50px);
`

const StyledPopup = styled.div`
  position: absolute;
  bottom: 100%;
  z-index: 10000;
  left: 0;
  background: var(--bg-light-color);
  color: white;
  border-radius: var(--border-radius);
  margin-bottom: 40px;
  padding: 10px;
  transform: translateX(-50%);
  display: grid;
  gap: 10px;
  &:after {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: var(--bg-light-color);
    position: absolute;
    z-index: -1;
    bottom: -10px;
    left: calc(50% - 10px);
  }
`

interface Props extends PropsWithChildren {
  _?: boolean
}

export function ActionBar({ children }: Props) {
  const [proof, setProof] = useState(false)
  const toggleProof = () => setProof(!proof)
  const gamba = useGamba()
  const [previousGames, setPreviousGames] = useState<PreviousGame[]>([])
  const [rngSeedHashed, setRngSeedHashed] = useState(gamba.user?.state.currentGame.rngSeedHashed)

  useEffect(() => setRngSeedHashed(gamba.user?.state.currentGame.rngSeedHashed), [gamba.user?.state.currentGame.rngSeedHashed])

  useGambaEvent(({ nonce, rngSeed, clientSeed, player }) => {
    if (gamba.wallet?.publicKey?.equals(player)) {
      const game = { nonce, clientSeed, rngSeedHashed: rngSeedHashed ?? 'abcd', rngSeed, options: gamba.user?.state.currentGame.options ?? [] }
      setPreviousGames((games) => [game, ...games].slice(0, 5))
      setRngSeedHashed(gamba.user?.state.currentGame.rngSeedHashed)
    }
  }, [rngSeedHashed, gamba.wallet])

  return (
    <>
      <Container>
        <Wrapper>
          <div>
            {children}
          </div>
          <div className="seperator" />
          <div>
            <div style={{ position: 'relative' }}>
              {proof && rngSeedHashed && (
                <StyledPopup>
                  <ProvablyFair nextSeedHashed={rngSeedHashed} games={previousGames} />
                </StyledPopup>
              )}
              <Button disabled={!rngSeedHashed} fill onClick={toggleProof}>
                <Svg.Fairness />
              </Button>
            </div>
          </div>
        </Wrapper>
      </Container>
    </>
  )
}
