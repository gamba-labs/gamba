import { GameBundle } from 'gamba/react-ui'
import React from 'react'
import styled from 'styled-components'

const StyledGameCard = styled.div`
  color: white;
  position: relative;
  background: #ffffff;
  &:hover {
    & > div:first-child {
      transform: scale(1.1, 1.1)
    }
    & > div:last-child {
      opacity: 1;
    }
  }
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: end;
  width: 150px;
  height: 100%;
  overflow: hidden;
  & > div {
    &:first-child {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform .2s ease;
    }
    &:last-child {
      transition: opacity .2s;
      opacity: 0;
      backdrop-filter: blur(50px);
      padding: 10px;
      text-align: center;
      background: #000000CC;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      transition-delay: .1s;
      user-select: none;
    }
  }
`

interface Props {
  game: GameBundle
}

export function GameCard({ game }: Props) {
  return (
    <StyledGameCard>
      <div style={{ backgroundImage: 'url(' + game.image + ')' }} />
      <div>{game.name}</div>
    </StyledGameCard>
  )
}
