import React from 'react'
import styled from 'styled-components'
import { Button } from './Button'

export interface SelectProps<T> extends React.PropsWithChildren {
  value: T
  disabled?: boolean
  options: T[]
  onChange: (value: T) => void
  label?: (value: T) => React.ReactNode
}

const StyledWrapper = styled.div`
  position: relative;
`

const StyledPopup = styled.div`
  --background-color: #0e0e16;
  --background-color-hover: #11111d;
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-radius: 10px;
  padding: 5px;
  background-color: var(--background-color);
  white-space: nowrap;
  transform: translateY(-5px);
  & > button {
    all: unset;
    cursor: pointer;
    font-size: inherit;
    padding: 5px;
    &:hover {
      background: var(--background-color-hover);
    }
  }
`

export function Select<T>(props: SelectProps<T>) {
  const [open, setOpen] = React.useState(false)

  const set = (val: T) => {
    setOpen(false)
    props.onChange(val)
  }

  return (
    <StyledWrapper>
      <Button disabled={props.disabled} onClick={() => setOpen(!open)}>
        {props.label ? props.label(props.value) : JSON.stringify(props.value)}
      </Button>
      {open && (
        <StyledPopup>
          {props.options.map((val, i) => (
            <button key={i} onClick={() => set(val)}>
              {props.label ? props.label(val) : JSON.stringify(val)}
            </button>
          ))}
        </StyledPopup>
      )}
    </StyledWrapper>
  )
}
