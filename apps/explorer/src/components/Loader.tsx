import styled, { keyframes } from 'styled-components'

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const Loader = styled.div`
  animation: ${rotate360} .5s ease infinite;
  transform: translateZ(0);

  border-top: 4px solid var(--gray-12);
  border-right: 4px solid var(--gray-12);
  border-bottom: 4px solid var(--gray-12);
  border-left: 4px solid transparent;
  background: transparent;
  width: 24px;
  height: 24px;
  border-radius: 50%;
`
