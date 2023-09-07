import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { Loader } from './Loader'

interface ButtonProps {
  fill?: boolean
  pulse?: boolean
  loading?: boolean
  icon?: string
  label?: React.ReactNode
}

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 #ffffff77;
  }
  100% {
    box-shadow: 0 0 0 10px #ffffff00;
  }
`

const StyledButtonCSS = css<{$fill?: boolean, $pulse?: boolean}>`
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
  min-height: 40px;
  overflow: hidden;
  padding: 8px 16px;
  position: relative;
  transition: .3s;
  text-align: left;

  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  ${({ $pulse }) => $pulse && css`
    animation: ${pulse} 1s 1s infinite;
  `}

  border-radius: var(--border-radius);
  min-width: 100px;

  background: #a079ff;
  &:hover {
    background-color: #855ee6;
  }
  color: white;

  &.white {
    background: #ffffff;
    color: black;
    &:hover {
      background: #fafafa;
    }
  }

  &.dark {
    background: #1a1c24;
    color: white;
    &:hover {
      background: #292c39;
    }
  }

  &.yellow {
    background-color: #fff2d9;
    color: #f09300;
    &:hover {
      background-color: #ffdc99;
    }
  }

  &.green {
    background-color: #daffd9;
    color: #007b1a;
    &:hover {
      background-color: #a2ffaf;
    }
  }

  &.primary {
    background: linear-gradient(45deg,#FF6969 10%,#A088FF 90%);
    background-size: 100% 100%;
    color: white;
    border: none;
    &:disabled {
      opacity: .5;
    }
  }

  &.transparent {
    color: inherit;
    background: transparent;
    &:hover {
      background: #ffffff22;
    }
  }

  &.list {
    border-radius: 0;
    border: none;
    width: 100%;
    margin: 0;
    text-align: left;

    opacity: 1;
    & > div {
      width: 100%;
    }
    &:hover:not(:disabled) {
      opacity: 1;
      // background: #FFFFFF11;
    }
  }

  &:disabled {
    opacity: .8;
    cursor: default;
  }

  &.shine {
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
`

const StyledButton = styled.button`
  ${StyledButtonCSS}
`

const StyledButtonLink = styled.a`
  ${StyledButtonCSS}
  text-decoration: none;
`

export function Button({ children, label, fill, pulse, icon, loading, disabled, ...props }: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <StyledButton  $pulse={pulse} $fill={fill} disabled={disabled || loading} {...props}>
      <div>
        {label && <div className="label">{label}</div>}
        {icon && <img width="20" height="20" src={icon} />}
        {children}
        {loading && <span><Loader size={1} /></span>}
      </div>
    </StyledButton>
  )
}

export function ButtonLink({ children, label, fill, pulse, icon, loading, ...props }: ButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <StyledButtonLink $pulse={pulse} $fill={fill} {...props}>
      <div>
        {label && <div className="label">{label}</div>}
        {icon && <img width="20" height="20" src={icon} />}
        {children}
        {loading && <span><Loader size={1} /></span>}
      </div>
    </StyledButtonLink>
  )
}
