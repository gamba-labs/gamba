import styled, { css } from 'styled-components'

export const StyledBetButton = styled.div<{$highlighted?: boolean, $color?: 'black' | 'red'}>`
  position: relative;
  border: none;
  border-radius: 5px;
  padding: 10px 10px;
  box-shadow: 0 0 0 1px var(--border-color);
  color: white;
  width: 60px;
  cursor: pointer;
  text-align: center;

  ${(props) => props.$color === 'red' && css`
    --background-color: #ff3d5e;
    --border-color: #ff2b4e;
  `}

  ${(props) => props.$color === 'black' && css`
    --background-color: #1b1b25;
    --border-color: #121218;
  `}

  background-color: var(--background-color);
  box-shadow: 0 0 0 1px var(--border-color);

  &::after {
    content: " ";
    transition: background .1s;
    background: transparent;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }

  &:hover::after {
    background: #9999ff44;
    mix-blend-mode:screen;
  }
  ${(props) => props.$highlighted && css`
    &::after {
      background: #9999ff44;
      mix-blend-mode:screen;
    }
  `}
`

export const StyledTable = styled.div`
  display: grid;
  gap: 10px;
`

export const ChipContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  transform: translate(25%, -25%);
`
