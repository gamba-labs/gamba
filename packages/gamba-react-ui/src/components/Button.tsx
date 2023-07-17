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

export const StyledButton = styled.button<{$fill?: boolean, $pulse?: boolean}>`
  padding: 0 20px;
  margin: 0;
  border-radius: 10px;
  border: 1px solid currentColor;
  transition: background .2s, color .2s, opacity .2s;
  text-transform: uppercase;
  line-height: 40px;
  height: 40px;
  user-select: none;
  text-align: left;
  align-items: center;
  grid-template-columns: 1fr auto;
  cursor: pointer;
  &:disabled {
    color: gray;
    cursor: default;
    background: none;
    border-color: currentColor;
  }
  ${({ $pulse }) => $pulse && css`
    animation: ${pulse} 2s infinite;
  `}
  ${({ $fill }) => $fill ? `
    background: white;
    color: black;
    border-color: white;
    &:hover {
      color: var(--primary-color);
    }
  ` : `
    color: var(--primary-color);
    background: transparent;
    &:hover {
      background: white;
      color: black;
      border-color: white;
    }
  `}

  &.primary {
    background: linear-gradient(45deg,#FF6969 10%,#A088FF 90%);
    background-size: 100% 100%;
    color: white;
    border: none;
    &:disabled {
      opacity: .5;
    }
  }

  &.list {
    border-radius: 0;
    background: none;
    border: none;
    width: 100%;
    margin: 0;
    text-align: left;
    color: inherit;
    opacity: .8;
    &:disabled {
      opacity: .5;
    }
    &:hover:not(:disabled) {
      opacity: 1;
      background: #FFFFFF11;
    }
  }
`

export function Button({ children, fill, pulse, icon, loading, disabled, ...props }: ButtonProps) {
  return (
    <StyledButton $pulse={pulse} $fill={fill} disabled={disabled || loading} {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon && <img width="20" height="20" src={icon} />}
        {children}
        {loading && <span><Loader small /></span>}
      </div>
    </StyledButton>
  )
}
