import React from 'react'
import { GameBundle } from 'gamba/react-ui'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const StyledGameLink = styled(NavLink)`
  padding: 10px;
  text-align: center;
  text-decoration: none;
  background: white;
  color: black;
  transition: color .1s, background .1s, transform .2s ease;
  &:hover {
    background: black;
    color: ${({ theme }) => theme.palette.primary};
    & > div {
      transform: scale(1.1, 1.1);
    }
  }
  border-radius: 5px;
  display: block;
  width: 80px;
  height: 96px;
  & > div {
    transition: color .1s, background .1s, transform .2s ease;
    transform: scale(1,1);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    & > div:first-child {
      font-size: 32px;
    }
  }
  @media (min-width: 640px) {
    width: 100px;
    height: 120px;
    & > div {
      & > div:first-child {
        font-size: 48px;
      }
    }
  }
`

interface Props {
  game: GameBundle
}

export function GameLink({ game }: Props) {
  return (
    <StyledGameLink key={game.shortName} to={'/' + game.shortName}>
      <div>
        <div>{game.icon && <game.icon />}</div>
        <div>{game.name}</div>
      </div>
    </StyledGameLink>
  )
}
