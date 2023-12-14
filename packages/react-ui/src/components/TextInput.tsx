import React from 'react'
import styled from 'styled-components'

const StyledTextInput = styled.input`
  --background-color: #0e0e16;
  --background-color-hover: #11111d;

  color: white;

  background: var(--background-color);
  /* &:hover {
    background: var(--background-color-hover);
  } */

  border: none;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  min-width: 100px;
  align-items: center;

  &:disabled {
    background: #0e0e16;
    color: #333333;
    cursor: default;
    opacity: .7;
  }
`

export interface TextInputProps<T extends number | string> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  disabled?: boolean
  onClick?: () => void
  value: T
  onChange?: (value: string) => void
}

export function TextInput<T extends number | string>({onChange, ...props}: TextInputProps<T>) {
  return (
    <StyledTextInput
      type="text"
      onChange={(evt) => onChange && onChange(evt.target.value)}
      onFocus={(evt) => evt.target.select()}
      {...props}
    />
  )
}
