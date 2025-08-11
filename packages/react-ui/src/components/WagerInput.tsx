// src/components/WagerInput.tsx
import React, { useRef } from 'react'
import styled, { css } from 'styled-components'
import { useCurrentToken, useFees, useUserBalance } from '../hooks'
import { TokenValue } from './TokenValue'
import useOnClickOutside from '../hooks/useOnClickOutside'

const StyledPopup = styled.div`
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

const StyledWagerInput = styled.div<{$edit: boolean}>`
  display: flex;
  justify-content: space-between;
  color: var(--gamba-ui-input-color);
  background: var(--gamba-ui-input-background);
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  ${(props) => props.$edit && css`
    outline: #9564ff solid 1px;
    outline-offset: 1px;
  `}
`

const Flex = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-grow: 1;
  box-sizing: border-box;
`

const Input = styled.input`
  border: none;
  margin: 0;
  padding: 10px 0;
  color: var(--gamba-ui-input-color);
  background: var(--gamba-ui-input-background);
  outline: none;
  flex-grow: 1;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type=number] {
    -moz-appearance: textfield;
  }
`

const InputButton = styled.button`
  border: none;
  margin: 0;
  padding: 2px 10px;
  color: var(--gamba-ui-input-color);
  background: var(--gamba-ui-input-background);
  cursor: pointer;
`

const Buttons = styled.div`
  display: flex;
`

const TokenImage = styled.img`
  width: 25px;
  height: 25px;
  margin: 0 5px;
  border-radius: 50%;
  -webkit-user-drag: none;
`

const WagerAmount = styled.div`
  padding: 10px 0;
  width: 40px;
  @media (min-width: 600px) {
    width: 100px;
  }
  opacity: .8;
  overflow: hidden;
`

export interface WagerInputBaseProps {
  value: number
  onChange: (value: number) => void
  /** If provided, the input is locked to this exact lamports value */
  lockedValue?: number
  /** Optional lower/upper bounds in lamports (for range wager games) */
  minValue?: number
  maxValue?: number
}

export type WagerInputProps = WagerInputBaseProps & {
  className?: string
  disabled?: boolean
  options?: number[]
}

export function WagerInput(props: WagerInputProps) {
  const token   = useCurrentToken()
  const balance = useUserBalance()
  const fees    = useFees()
  const ref     = useRef<HTMLDivElement>(null!)
  const [isEditing, setIsEditing] = React.useState(false)
  const [input, setInput]         = React.useState('')

  const isLocked = props.lockedValue != null
  const effectiveValue = isLocked ? (props.lockedValue as number) : props.value

  const clampToBounds = (n: number) => {
    let x = n
    if (props.minValue != null) x = Math.max(x, props.minValue)
    if (props.maxValue != null) x = Math.min(x, props.maxValue)
    return x
  }

  // whenever the mint changes, reset back to base wager
  React.useEffect(() => {
    props.onChange(token.baseWager)
  }, [token.mint.toString()])

  useOnClickOutside(ref, () => setIsEditing(false))

  const startEditInput = () => {
    if (props.disabled || isLocked) return
    if (props.options) {
      setIsEditing(!isEditing)
      return
    }
    setIsEditing(true)
    setInput(String(effectiveValue / 10 ** token.decimals))
  }

  const apply = () => {
    if (isLocked) return
    const next = Number(input) * 10 ** token.decimals
    props.onChange(clampToBounds(next))
    setIsEditing(false)
  }

  const x2 = () => {
    if (isLocked) return
    const available = balance.balance + balance.bonusBalance
    const base      = token.baseWager
    const want      = Math.max(base, effectiveValue * 2 || base)
    const cappedBal = Math.min(want, available - want * fees)
    const bounded   = clampToBounds(cappedBal)
    props.onChange(bounded)
  }

  return (
    <div ref={ref} className={props.className} style={{ position: 'relative' }}>
      <StyledWagerInput $edit={isEditing}>
        <Flex onClick={startEditInput}>
          <TokenImage src={token.image} />
          {isLocked || (!isEditing || props.options) ? (
            <WagerAmount
              title={(effectiveValue / 10 ** token.decimals).toLocaleString()}
            >
              <TokenValue amount={effectiveValue} mint={token.mint} />
            </WagerAmount>
          ) : (
            <Input
              value={input}
              type="number"
              max={(props.maxValue ?? balance.balance) / 10 ** token.decimals}
              min={(props.minValue ?? 0) / 10 ** token.decimals}
              step={0.05}
              style={{ width: '100px' }}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.code === 'Enter' && apply()}
              onBlur={apply}
              disabled={props.disabled || isLocked}
              autoFocus
              onFocus={e => e.target.select()}
            />
          )}
        </Flex>

        {!props.options && (
          <Buttons>
            <InputButton
              disabled={props.disabled || isLocked}
              onClick={() => props.onChange(clampToBounds(effectiveValue / 2))}
            >
              x.5
            </InputButton>
            <InputButton disabled={props.disabled || isLocked} onClick={x2}>
              2x
            </InputButton>
          </Buttons>
        )}
      </StyledWagerInput>

      {props.options && isEditing && !isLocked && (
        <StyledPopup>
          {props.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                props.onChange(opt * token.baseWager)
                setIsEditing(false)
              }}
            >
              <TokenImage src={token.image} />
              <TokenValue amount={opt * token.baseWager} mint={token.mint} />
            </button>
          ))}
        </StyledPopup>
      )}
    </div>
  )
}
