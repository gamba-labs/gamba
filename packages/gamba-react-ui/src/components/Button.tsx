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
  padding: 0 10px;
  margin: 0;
  border-radius: var(--border-radius);
  border: 1px solid currentColor;
  transition: background .1s, color .1s;
  text-transform: uppercase;
  line-height: 40px;
  height: 40px;
  user-select: none;
  text-align: left;
  align-items: center;
  grid-template-columns: 1fr auto;
  &:disabled {
    color: gray!important;
    cursor: default;
    background: none!important;
    border-color: currentColor!important;
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
