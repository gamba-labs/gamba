import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'


const tileAnimation = keyframes`
  0% {
    background-position: -100px 200px;
  }
  100% {
    background-position: 100px -200px;
  }
`

const StyledCard = styled(NavLink)<{width: number, height: number}>`
  color: white;
  position: relative;
  background: #ffffff;
  transform: scale(1);
  cursor: pointer;
  &:hover {
    transform: scale(1.02);
    outline: var(--text-color) solid 1px;
    outline-offset: 3px;
    & > .background {
      transform: scale(1.1);
    }
    & > .logo {
      transform: scale(1.1);
    }
    & > .content {
      opacity: 0;
    }
  }
  border-radius: var(--border-radius);
  display: flex;
  justify-content: end;
  width: 200px;
  aspect-ratio: 2/1;
  transition: height .25s ease, transform .2s ease, aspect-ratio .2s ease;
  max-height: 100%;
  overflow: hidden;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  & > .logo {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 10;
    transition: transform .2s ease;
  }
  & > .content {
    background: #111111;
    opacity: 1;
    transition: opacity .2s;
    padding: 10px;
    font-size: 24px;
    text-align: center;
    font-weight: bold;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    user-select: none;
  }
`

const CardBackground = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #ff4e80;
  background-size: 50px;
  background-position: center;
  transition: transform .2s ease;
  animation: ${tileAnimation} 10s linear infinite;
`

interface Props {
  backgroundImage?: string
  backgroundColor?: string
  to: string
  logo?: string
  width?: number
  height?: number
}

export function Card({ to, logo, backgroundColor, width = 150, height = 200 }: Props) {
  return (
    <StyledCard to={to} width={width} height={height} style={{ backgroundColor }}>
      <CardBackground style={{ backgroundImage: 'url(/logo.svg)', backgroundColor }} />
      {logo && (
        <div
          className="logo"
          style={{ backgroundImage: 'url(' + logo + ')' }}
        />
      )}
      <div className="content" style={{ backgroundColor }} />
    </StyledCard>
  )
}
