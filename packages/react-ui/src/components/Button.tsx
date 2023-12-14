import React from 'react'
import styled, { css } from 'styled-components'

type ButtonSize = 'small' | 'medium' | 'large'

const StyledButton = styled.button<{$main?: boolean, $size: ButtonSize}>`
  --background-color: #0e0e16;
  --background-color-hover: #11111d;

  ${(props) => props.$main && css`
    --background-color: ${({theme}) => theme.gamba.button.background};
    --background-color-hover: ${({theme}) => theme.gamba.button.backgroundHover};
  `}

  ${(props) => css`
    --padding: ${props.$size === 'small' ? '5px' : props.$size === 'medium' ? '10px' : props.$size === 'large' && '15px'};
  `}

  color: white;

  background: var(--background-color);
  &:hover {
    background: var(--background-color-hover);
  }

  border: none;
  border-radius: 10px;
  padding: var(--padding);
  cursor: pointer;
  /* min-width: 100px; */
  text-align: center;
  align-items: center;

  &:disabled {
    background: #0e0e16;
    color: #333333;
    cursor: default;
    opacity: .7;
  }
`

export interface ButtonProps extends React.PropsWithChildren {
  disabled?: boolean
  onClick?: () => void
  main?: boolean
  size?: ButtonSize
}

export function Button(props: ButtonProps) {
  return (
    <StyledButton
      disabled={props.disabled}
      onClick={props.onClick}
      $main={props.main}
      $size={props.size ?? 'medium'}
    >
      {props.children}
    </StyledButton>
  )
}
