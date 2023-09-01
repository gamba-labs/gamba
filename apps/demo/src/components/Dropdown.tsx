import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

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

const StyledDropdown = styled.button<{$active?: boolean}>`
  background: white;
  border-radius: var(--border-radius);
  color: black;
  border: none;
  margin: 0;
  text-align: left;
  width: 100%;
  height: 40px;
  padding: 10px 20px;
  ${({ $active }) => $active && `
    background: #d7d6e5;
  `}
  &:hover {
    background: #fafafa;
  }
  &:disabled {
    background: #d7d6e5;
    color: #CCCCCC;
  }
`

const StyledPopup = styled.div<{align?: 'bottom' | 'top'}>`
  position: absolute;
  ${({ align = 'bottom' }) => align === 'bottom' ? `
    bottom: 100%;
    margin-bottom: 20px;
    &:after {
      bottom: -10px;
    }
  ` : `
    top: 100%;
    margin-top: 20px;
    &:after {
      top: -10px;
    }
  `}
  z-index: 10000;
  left: 0;
  border: none;
  max-width: 100%;
  background: white;
  color: white;
  border-radius: 5px;
  width: 100%;
  padding: 2.5px;
  &:after {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: white;
    position: absolute;
    z-index: -1;
    bottom: -10px;
    left: calc(50% - 10px);
  }
`

const StyledOption = styled.button<{$selected?: boolean}>`
  display: block;
  border: none;
  margin: 0;
  padding: 2.5px;
  width: 100%;
  text-align: left;
  background: none;
  color: black;
  & > div {
    padding: 10px 20px;
    border-radius: 2.5px;
  }
  ${({ $selected }) => $selected && `
    & > div {
      background: #d7d6e599;
    }
  `}
  &:hover {
    & > div {
      background: #d7d6e566;
    }
  }
`

interface Props<T> {
  label: string
  options: {value: T, label: string}[]
  onChange: (value: T) => void
  value: T
  disabled?: boolean
  format?: (value: T) => string
  align?: 'top' | 'bottom'
}

function useOnClickOutside(
  ref: RefObject<HTMLDivElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(
    () => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return
        }
        handler(event)
      }

      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)

      return () => {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    [ref, handler],
  )
}

export function Dropdown<T>({ label, options, onChange, value, disabled, format, align }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  // const popup = usePopup()
  const [open, setOpen] = useState(false)
  const hideActive = false

  useOnClickOutside(ref, (e) => {
    if (!buttonRef.current?.contains(e.target)) {
      setOpen(false)
    }
  })

  const change = (v: T) => {
    onChange(v)
    setOpen(false)
  }

  const filteredOptions = useMemo(() => {
    return !hideActive ? options : options.filter((x) => x.value !== value)
  }, [options, value])

  const displayedValue = useMemo(() => format ? format(value) : value, [format, value])

  return (
    <StyledWrapper>
      <StyledDropdown
        ref={buttonRef}
        $active={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <>
          <Label>{label}</Label>
          {displayedValue}
        </>
      </StyledDropdown>
      {open && (
        <StyledPopup align={align} ref={ref}>
          {[...filteredOptions].reverse().map((option, i) => (
            <StyledOption
              key={i}
              disabled={disabled}
              onClick={() => change(option.value)}
              $selected={option.value === value}
            >
              <div>
                {format ? format(option.value) : option.label}
              </div>
            </StyledOption>
          ))}
        </StyledPopup>
      )}
    </StyledWrapper>
  )
}
