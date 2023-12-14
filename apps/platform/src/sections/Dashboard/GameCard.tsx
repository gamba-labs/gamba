import { GameBundle } from 'gamba-react-ui-v2'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

const tileAnimation = keyframes`
  0% {
  background-position: -100px 100px;
  }
  100% {
    background-position: 100px -100px;
  }
`

const StyledGameCard = styled(NavLink)<{$small: boolean}>`
  width: 120px;

  @media (min-width: 800px) {
    width: 170px;
  }

  display: block;
  aspect-ratio: ${(props) => props.$small ? '2.25/1' : '2/1.3'};
  background-size: cover;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-decoration: none;
  font-size: 24px;

  & > .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: 100px;
    background-position: center;
    background-image: url(/stuff.png);
    background-repeat: repeat;
    transition: transform .2s ease, opacity .3s;
    animation: ${tileAnimation} 10s linear infinite;
    opacity: 0;
  }

  & > .image {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: 90% auto;
    background-position: center;
    background-repeat: no-repeat;
    transform: scale(.9);
    transition: transform .2s ease;
  }

  &:hover .image {
    transform: scale(1);
  }

  &:hover .background {
    opacity: .35;
  }

  position: relative;
  transform: scale(1);
  background: linear-gradient(0deg, #9564ff, #7c40ff);
  max-height: 100%;
  overflow: hidden;
  flex-grow: 0;
  flex-shrink: 0;
  background-size: 100% auto;
  background-position: center;
  font-weight: bold;
  .play {
    font-size: 12px;
    border-radius: 10px;
    padding: 1px 5px;
    background: #ffffff66;
    position: absolute;
    right: 5px;
    bottom: 5px;
    opacity: 0;
    text-transform: uppercase;

    backdrop-filter: blur(20px);
  }
  &:hover .play {
    opacity: 1;
  }
  &:hover {
    outline: #9564ff33 solid 5px;
    outline-offset: 0px;
  }
`

export function GameCard({ game }: {game: GameBundle}) {
  const small = useLocation().pathname !== '/'
  return (
    <StyledGameCard
      to={'/' + game.id}
      $small={small ?? false}
    >
      <div className="background" />
      <div className="image" style={{ backgroundImage: `url(${game.image})` }} />
      <div className="play">Play</div>
    </StyledGameCard>
  )
}
