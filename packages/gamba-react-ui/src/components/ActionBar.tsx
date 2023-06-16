import { PropsWithChildren, useState } from 'react'
import styled from 'styled-components'
import { ProvablyFair, Svg } from '..'
import { Button } from './Button'

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
  min-width: 320px;
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
  return (
    <Container>
      <Wrapper>
        <div>
          {children}
        </div>
        {/* <div className="seperator" /> */}
        {/* <div>
          <div style={{ position: 'relative' }}>
            <Button fill onClick={toggleProof}>
              <Svg.GambaLogo />
            </Button>
            {proof && (
              <StyledPopup>
                <ProvablyFair />
              </StyledPopup>
            )}
          </div>
        </div> */}
      </Wrapper>
    </Container>
  )
}
