import React from 'react'
import styled, { css } from 'styled-components'

type ButtonSize = 'small' | 'medium' | 'large'

const StyledButton = styled.button<{
  $main?: boolean
  $size?: ButtonSize
}>`
  --color: var(--gamba-ui-button-default-color);
  --background-color: var(--gamba-ui-button-default-background);
  --background-color-hover: var(--gamba-ui-button-default-background-hover);

  ${({ $main }) =>
    $main &&
    css`
      --background-color: var(--gamba-ui-button-main-background);
      --color: var(--gamba-ui-button-main-color);
      --background-color-hover: var(--gamba-ui-button-main-background-hover);
    `}

  /* default $size to "medium" */
  ${({ $size = 'medium' }) =>
    css`
      --padding: ${
        $size === 'small' ? '5px' : $size === 'large' ? '15px' : '10px'
      };
    `}

  background: var(--background-color);
  color: var(--color);
  &:hover {
    background: var(--background-color-hover);
  }

  border: none;
  border-radius: var(--gamba-ui-border-radius);
  padding: var(--padding);
  cursor: pointer;
  text-align: center;

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`

export interface ButtonProps {
  disabled?: boolean
  onClick?: () => void
  main?: boolean
  size?: ButtonSize
  children?: React.ReactNode | bigint
}

export function Button({
  disabled,
  onClick,
  main,
  size,
  children,
}: ButtonProps) {
  // coerce bigint → string
  const safeChildren =
    typeof children === 'bigint' ? children.toString() : children

  // cast away the styled-component’s complex signature
  const SButton: any = StyledButton

  return (
    <SButton
      disabled={disabled}
      onClick={onClick}
      $main={main}
      $size={size}
    >
      {safeChildren}
    </SButton>
  )
}
