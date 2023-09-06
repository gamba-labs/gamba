import React, { useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { Button } from './Button'
import { Dropdown } from './Dropdown'

const StyledWrapper = styled.div`
  position: relative;
  min-width: 100px;
`

const Label = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  color: #666;
  display: inline;
  margin-right: 1em;
`

interface Props<T> {
  label: string
  options: {value: T, label: string}[]
  onChange: (value: T) => void
  value: T
  disabled?: boolean
  format?: (value: T) => string
}

export function DropdownButton<T>({ label, options, onChange, value, disabled, format }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const hideActive = false

  useOnClickOutside(ref, () => setOpen(false))

  const change = (v: T) => {
    onChange(v)
    setOpen(false)
  }

  const filteredOptions = useMemo(() => {
    return !hideActive ? options : options.filter((x) => x.value !== value)
  }, [options, value])

  const displayedValue = useMemo(() => format ? format(value) : value, [format, value])

  return (
    <StyledWrapper ref={ref}>
      <Button
        className="dark"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <>
          <Label>{label}</Label>
          {displayedValue}
        </>
      </Button>
      <Dropdown visible={open}>
        {[...filteredOptions].reverse().map((option, i) => (
          <Button
            key={i}
            disabled={disabled}
            onClick={() => change(option.value)}
            className="list transparent"
          >
            <div>
              {format ? format(option.value) : option.label}
            </div>
          </Button>
        ))}
      </Dropdown>
    </StyledWrapper>
  )
}
