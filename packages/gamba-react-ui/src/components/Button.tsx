import { ButtonHTMLAttributes } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { Loader } from './Loader'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fill?: boolean
  pulse?: boolean
  loading?: boolean
  icon?: string
}

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 #ffffff77;
  }
  70% {
    box-shadow: 0 0 0 10px #ffffff00;
  }
  100% {
    box-shadow: 0 0 0 0 #ffffff00;
  }
`

const StyledButton = styled.button<{$fill?: boolean, $pulse?: boolean}>`
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

  border: none;
  font-size: inherit;
  // font-weight: 700;
  height: 40px;
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
    animation: ${pulse} 1s infinite;
  `}

  border-radius: 6px;
  min-width: 100px;

  background: var(--primary-color);
  &:hover {
    background-color: #855ee6;
  }
  color: #151b54;
  --disabled-color: #666;

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
      background: #ffffff11;
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
    &:disabled {
      opacity: .8;
    }
    &:hover:not(:disabled) {
      opacity: 1;
      // background: #FFFFFF11;
    }
  }

  &:disabled {
    background: var(--disabled-color);
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

export function Button({ children, fill, pulse, icon, loading, disabled, ...props }: ButtonProps) {
  return (
    <StyledButton $pulse={pulse} $fill={fill} disabled={disabled || loading} {...props}>
      <div>
        {icon && <img width="20" height="20" src={icon} />}
        {children}
        {loading && <span><Loader small /></span>}
      </div>
    </StyledButton>
  )
}
