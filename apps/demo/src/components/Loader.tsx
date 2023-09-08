import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const Loader = styled.div<{size?: number}>`
  ${({ size = 5 }) => `
    --border-size: ${size / 6 + 'em'};
    --size: ${size + 'em'};
  `}
  display: inline-block;
  border: var(--border-size) solid transparent;
  border-top: var(--border-size) solid currentColor;
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
  animation: ${spin} .3s linear infinite;
`
