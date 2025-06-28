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
    opacity: 0.7;
  }
`

export interface TextInputProps<T extends number | string>
  // remove the problematic props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'children' | 'onChange' | 'formAction' | 'contentEditable'
  > {
  /** current input value */
  value: T
  /** new-value callback */
  onChange?: (value: string) => void
  /** click handler */
  onClick?: () => void
  /** disable input */
  disabled?: boolean
}

export function TextInput<T extends number | string>({
  value,
  onChange,
  ...props
}: TextInputProps<T>) {
  // cast away the styled-components overload complexity
  const SInput: any = StyledTextInput

  return (
    <SInput
      {...props}
      type="text"
      value={value as any}
      onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(evt.target.value)
      }
      onFocus={(evt: React.FocusEvent<HTMLInputElement>) =>
        evt.target.select()
      }
    />
  )
}
