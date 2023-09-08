import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { NavLink, NavLinkProps } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { Loader } from './Loader'

type ButtonSize = 'medium' | 'small'

interface ButtonProps {
  pulse?: boolean
  loading?: boolean
  icon?: React.ReactNode
  label?: React.ReactNode
  size?: ButtonSize
}

const pulseAnimation = keyframes`
0% {
  box-shadow: 0 0 0 0 #ffffff77;
}
100% {
  box-shadow: 0 0 0 10px #ffffff00;
}
`

const StyledButtonCSS = css<{pulse?: boolean, size?: ButtonSize}>`
  ${({ size = 'medium' }) => `
    padding: ${size === 'medium' && '10px 16px'};
    padding: ${size === 'small' && '2px 8px'};
  `}

  ${({ pulse }) => pulse && css`
    animation: ${pulseAnimation} 1s 1s infinite;
  `}

  @keyframes button-shine1 {
    0% {
      left: -50%
    }
    to {
      left: 100%
    }
  }

  @keyframes button-shine2 {
    to {
      opacity: 0;
    }
  }

  & .label {
    font-size: 12px;
    text-transform: uppercase;
    color: #666;
    display: inline;
    margin-right: 1em;
  }

  border: none;
  font-size: inherit;
  display: inline-block;
  position: relative;
  transition: background .25s, opacity .25s;
  text-align: center;
  text-wrap: nowrap;
  max-width: 100%;

  border-radius: var(--border-radius);

  --button-bg: #a079ff;
  --button-bg-hover: #855ee6;
  --button-col: white;

  &.transparent {
    --button-bg: transparent;
    --button-bg-hover: #ffffff22;
    --button-col: inherit;
  }

  &.white {
    --button-bg: #fffffff0;
    --button-bg-hover: #ffffff;
    --button-col: black;
  }

  &.dark {
    --button-bg: #1a1c24;
    --button-bg-hover: #292c39;
    --button-col: white;
  }

  &.yellow {
    --button-bg: #fff2d9;
    --button-bg-hover: #ffdc99;
    --button-col: #f09300;
  }

  &.green {
    --button-bg: #daffd9;
    --button-bg-hover: #a2ffaf;
    --button-col: #007b1a;
  }

  background: var(--button-bg);
  color: var(--button-col);

  @media (hover: hover) {
    &:hover {
      background: var(--button-bg-hover);
    }
  }

  &:active {
    background: var(--button-bg-hover);
    outline: none;
  }

  &.list {
    width: 100%;
    text-align: left;
    border-radius: 0px;
  }

  &:disabled {
    opacity: .8;
    cursor: default;
  }

  &.shine {
    overflow: hidden;
    &:hover::after {
      animation: button-shine1 .6s linear, button-shine2 .5s .2s forwards;
      background: #fff;
      content: " ";
      display: block;
      height: 200px;
      opacity: .5;
      position: absolute;
      transform: rotate(40deg);
      width: 35px;
      left: -100%;
      top: -100px;
    }
  }

  & .icon {
    vertical-align: middle;
    margin-left: .5em;
  }
`

const StyledButton = styled.button`
  ${StyledButtonCSS}
`

const StyledButtonLink = styled.a`
  ${StyledButtonCSS}
  text-decoration: none;
`

const StyledButtonNavLink = styled(NavLink)`
  ${StyledButtonCSS}
`

export function Button({ children, icon, label, pulse, loading, disabled, ...props }: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <StyledButton pulse={pulse} disabled={disabled || loading} {...props}>
      {label && <div className="label">{label}</div>}
      {children}
      {loading ? <span><Loader size={1} /></span> : icon && <span className="icon">{icon}</span>}
    </StyledButton>
  )
}

export function ButtonLink({ children, icon, label, pulse, loading, ...props }: ButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <StyledButtonLink pulse={pulse} {...props}>
      {label && <div className="label">{label}</div>}
      {children}
      {loading ? <span><Loader size={1} /></span> : icon && <span className="icon">{icon}</span>}
    </StyledButtonLink>
  )
}

export function ButtonNavLink({ children, icon, label, pulse, loading, ...props }: ButtonProps & Omit<NavLinkProps, 'children'> & React.PropsWithChildren) {
  return (
    <StyledButtonNavLink pulse={pulse} {...props}>
      {label && <div className="label">{label}</div>}
      {children}
      {loading ? <span><Loader size={1} /></span> : icon && <span className="icon">{icon}</span>}
    </StyledButtonNavLink>
  )
}

