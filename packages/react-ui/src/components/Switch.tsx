import React from 'react'
import styled from 'styled-components'

const SwitchButton = styled.input`
  all: unset;
  cursor: pointer;
  position: relative;
  height: 25px;
  aspect-ratio: 2 / 1;
  border-radius: 20px;
  background: #0e0e16;
  &:checked:after {
    left: 50%;
  }
  &:after {
    transition: left .1s ease;
    content: " ";
    height: 100%;
    width: 50%;
    left: 0;
    top: 0;
    border-radius: 20px;
    position: absolute;
    background: #9564ff;
  }
  &:not(:disabled):hover {
    outline: #9564ff solid 1px;
    outline-offset: 1px;
  }
  &:disabled {
    &:after {
      background: gray;
    }
  }
`

interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch(props: SwitchProps) {
  return (
    <SwitchButton
      type="checkbox"
      className={props.className}
      checked={props.checked}
      disabled={props.disabled}
      onChange={(evt) => props.onChange && props.onChange(evt.target.checked)}
    />
  )
}
