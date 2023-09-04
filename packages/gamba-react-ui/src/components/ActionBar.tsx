import { PropsWithChildren } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: 1;
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
  background: #00000033;
  border-radius: 10px;
  backdrop-filter: blur(50px);
  max-width: 100vw;
`

interface Props extends PropsWithChildren {
  _?: boolean
}

export function ActionBar({ children }: Props) {
  return (
    <>
      <Container>
        <Wrapper>
          <div>
            {children}
          </div>
          {/* <div className="seperator"></div> */}
          {/* <input value={gamba.seed} onChange={(evt) => gamba.updateSeed(evt.target.value)} /> */}
        </Wrapper>
      </Container>
    </>
  )
}
