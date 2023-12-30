import React from 'react'
import styled from 'styled-components'

const StyledTextInput = styled.input`
  color: var(--gamba-ui-input-color);
  background: var(--gamba-ui-input-background);
  &:hover {
    background: var(--gamba-ui-input-background-hover);
  }

  border: none;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  min-width: 100px;
  align-items: center;

  &:disabled {
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

export function TextInput<T extends number | string>({ onChange, ...props }: TextInputProps<T>) {
  return (
    <StyledTextInput
      type="text"
      onChange={(evt) => onChange && onChange(evt.target.value)}
      onFocus={(evt) => evt.target.select()}
      {...props}
    />
  )
}
