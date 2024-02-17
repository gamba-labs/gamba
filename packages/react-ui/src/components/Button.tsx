import React from 'react'
import styled, { css } from 'styled-components'

type ButtonSize = 'small' | 'medium' | 'large'

const StyledButton = styled.button<{$main?: boolean, $size: ButtonSize}>`
  --background-color: var(--gamba-ui-button-default-background);
  --background-color-hover: var(--gamba-ui-button-default-background-hover);

  ${(props) => props.$main && css`
    --background-color: var(--gamba-ui-button-main-background);
    --background-color-hover: var(--gamba-ui-button-main-background-hover);
  `}

  ${(props) => css`
    --padding: ${props.$size === 'small' ? '5px' : props.$size === 'medium' ? '10px' : props.$size === 'large' && '15px'};
  `}

  background: var(--background-color);
  color: white;
  &:hover {
    background: var(--background-color-hover);
  }

  border: none;
  border-radius: var(--gamba-ui-border-radius);
  padding: var(--padding);
  cursor: pointer;
  /* min-width: 100px; */
  text-align: center;
  align-items: center;

  &:disabled {
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
