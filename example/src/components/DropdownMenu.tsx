import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { ButtonCSS } from '../styles'

const Wrapper = styled.div`
  position: relative;
`

const animation = keyframes`
 0% { transform: translateY(5%); }
 100% { transform: translateY(0); }
`

const SelectButton = styled.button<{$active?: boolean}>`
  ${ButtonCSS}
  min-width: unset;
  width: 100%;
  ${({ $active }) => $active && `
    background: #090f1bCC;
  `}
`

const Dropdown = styled.div`
  position: absolute;
  bottom: 100%;
  z-index: 10000;
  right: 0;
  animation: ${animation} .2s ease;
  & > div {
    position: relative;
    border: none;
    max-width: 100%;
    background: #343a45;
    color: white;
    border-radius: 10px;
    margin-bottom: 20px;
    width: 100%;
    padding: 5px;
    display: grid;
    gap: 5px;
    &:after {
      content: "";
      width: 20px;
      height: 20px;
      transform: rotate(-45deg);
      background: #343a45;
      position: absolute;
      z-index: -1;
      bottom: -10px;
      left: calc(75% - 10px);
    }
  }
`

const DropdownOption = styled.button<{$selected?: boolean}>`
  display: block;
  border: none;
  margin: 0;
  padding: 0;
  width: 100%;
  text-align: center;
  width: 140px;
  background: none;
  color: white;
  cursor: pointer;
  & > div {
    padding: 10px;
    border-radius: 5px;
  }
  ${({ $selected }) => $selected && `
    & > div {
      background: #00000033;
    }
  `}
  &:hover {
    & > div {
      background: #00000044;
    }
  }
`

interface DropdownOptionProps {
  onClick: () => void
  label: string
}

interface Props {
  label: string
  options: (DropdownOptionProps | undefined | false)[]
  disabled?: boolean
}

function useOnClickOutside(ref: React.RefObject<HTMLDivElement>, handler: (e: any) => void) {
  useEffect(
    () => {
      const listener = (event: any) => {
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

export function DropdownMenu({ label, options, disabled }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setOpen] = useState(false)

  const filteredOptions = useMemo(() => {
    return [...options].filter(Boolean).reverse() as DropdownOptionProps[]
  }, [options])

  useOnClickOutside(ref, (e) => {
    if (!buttonRef.current?.contains(e.target)) {
      setOpen(false)
    }
  })

  const open = () => {
    if (isOpen) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }

  return (
    <Wrapper>
      <SelectButton
        ref={buttonRef}
        $active={isOpen}
        disabled={disabled}
        onClick={() => open()}
      >
        <>
          {label}
        </>
      </SelectButton>
      {isOpen && (
        <Dropdown ref={ref}>
          <div>
            {filteredOptions.map((option, i) => (
              <DropdownOption
                key={i}
                disabled={disabled}
                onClick={() => {
                  option?.onClick()
                  setOpen(false)
                }}
              >
                <div>
                  {option?.label}
                </div>
              </DropdownOption>
            ))}
          </div>
        </Dropdown>
      )}
    </Wrapper>
  )
}
