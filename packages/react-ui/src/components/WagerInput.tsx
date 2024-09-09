import { useGamba } from 'gamba-react-v2'
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
  border-radius: 0;
  margin: 0;
  padding: 10px;
  padding-left: 0;
  padding-right: 0;
  color: var(--gamba-ui-input-color);
  background: var(--gamba-ui-input-background);
  outline: none;
  flex-grow: 1;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type=number] {
    -moz-appearance: textfield;
  }
`

const InputButton = styled.button`
  border: none;
  border-radius: 0;
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
  text-wrap: nowrap;
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
}

export type WagerInputProps = WagerInputBaseProps & {
  className?: string
  disabled?: boolean
  options?: number[]
}

export function WagerInput(props: WagerInputProps) {
  const gamba = useGamba()
  const token = useCurrentToken()
  const [input, setInput] = React.useState('')
  const balance = useUserBalance() // useBalance(walletAddress, token.mint)
  const fees = useFees()
  const [isEditing, setIsEditing] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null!)

  React.useEffect(
    () => {
      props.onChange(token.baseWager)
    },
    [token.mint.toString()],
  )

  useOnClickOutside(ref, () => setIsEditing(false))

  const startEditInput = () => {
    if (props.options) {
      setIsEditing(!isEditing)
      return
    }
    setIsEditing(true)
    setInput(String(props.value / (10 ** token.decimals)))
  }

  const apply = () => {
    props.onChange(Number(input) * (10 ** token.decimals))
    setIsEditing(false)
  }

  const x2 = () => {
    const availableBalance = balance.balance + balance.bonusBalance
    const nextValue = Math.max(token.baseWager, (props.value * 2) || token.baseWager)
    props.onChange(Math.max(0, Math.min(nextValue, availableBalance - nextValue * fees)))
  }

  return (
    <div ref={ref} className={props.className} style={{ position: 'relative' }}>
      <StyledWagerInput $edit={isEditing}>
        <Flex onClick={() => !gamba.isPlaying && startEditInput()}>
          <TokenImage src={token.image} />
          {(!isEditing || props.options) ? (
            <WagerAmount
              title={(props.value / (10 ** token.decimals)).toLocaleString()}
            >
              <TokenValue suffix="" amount={props.value} mint={token.mint} />
            </WagerAmount>
          ) : (
            <Input
              value={input}
              type="number"
              max={balance.balance / (10 ** token.decimals)}
              min={0}
              step={.05}
              style={{ width: '100px' }}
              onChange={(evt) => setInput(evt.target.value)}
              onKeyDown={(e) => e.code === 'Enter' && apply()}
              onBlur={(evt) => apply()}
              disabled={gamba.isPlaying}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          )}
        </Flex>
        {!props.options && (
          <Buttons>
            <InputButton disabled={gamba.isPlaying} onClick={() => props.onChange(props.value / 2)}>
              x.5
            </InputButton>
            <InputButton disabled={gamba.isPlaying} onClick={x2}>
              2x
            </InputButton>
          </Buttons>
        )}
      </StyledWagerInput>
      {props.options && isEditing && (
        <StyledPopup>
          {props.options.map((valueInBaseWager, i) => (
            <button
              key={i}
              onClick={() => {
                props.onChange(valueInBaseWager * token.baseWager)
                setIsEditing(false)
              }}
            >
              <TokenImage src={token.image} />
              <TokenValue amount={valueInBaseWager * token.baseWager} mint={token.mint} />
            </button>
          ))}
        </StyledPopup>
      )}
    </div>
  )
}
