import React from 'react'
import styled from 'styled-components'
import { Button } from './Button'

export interface SelectProps<T> extends React.PropsWithChildren {
  value: T
  disabled?: boolean
  options: T[]
  onChange: (value: T) => void
  label?: (value: T) => React.ReactNode
  className?: string
}

const StyledWrapper = styled.div`
  position: relative;
`

export const StyledPopup = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  width: max-content;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-radius: 10px;
  padding: 5px;
  color: var(--gamba-ui-input-color);
  background: var(--gamba-ui-input-background);
  white-space: nowrap;
  transform: translateY(-5px);
  z-index: 100;
  & > button {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    font-size: inherit;
    padding: 5px;
    display: flex;
    align-items: center;
    &:hover {
      background: var(--gamba-ui-input-background-hover);
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
    <StyledWrapper className={props.className}>
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
