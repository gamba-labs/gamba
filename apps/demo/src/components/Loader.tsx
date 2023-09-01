import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const Loader = styled.div<{small?: boolean}>`
  ${({ small }) => `
    --border-size: ${small ? '2px' : '5px'};
    --size: ${small ? '20px' : '50px'};
  `}
  border: var(--border-size) solid transparent;
  border-top: var(--border-size) solid white;
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
  animation: ${spin} .3s linear infinite;
`
