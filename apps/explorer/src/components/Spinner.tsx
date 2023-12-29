import styled, { css, keyframes } from "styled-components"

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const Spinner = styled.div<{$small?: boolean}>`
  --spinner-size: 24px;
  --spinner-border: 4px;
  ${props => props.$small && css`
    --spinner-size: 14px;
    --spinner-border: 2px;
  `}
  animation: ${rotate360} .5s ease infinite;
  transform: translateZ(0);

  border-top: var(--spinner-border) solid var(--gray-12);
  border-right: var(--spinner-border) solid var(--gray-12);
  border-bottom: var(--spinner-border) solid var(--gray-12);
  border-left: var(--spinner-border) solid transparent;
  background: transparent;
  height: var(--spinner-size);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
`
