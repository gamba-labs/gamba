import { useGamba } from 'gamba-react-v2'
import React from 'react'
import styled, { css } from 'styled-components'
import { useCurrentToken, useFees, useUserBalance } from '../hooks'
import { TokenValue } from './TokenValue'
import { StyledPopup } from './Select'

export interface WagerInputBaseProps {
  value: number
  onChange: (value: number) => void
}

export type WagerInputTextProps = {
  type?: 'text'
}

export type WagerInputSelectProps = {
  type: 'select'
  options: number[]
}

export type WagerInputProps = WagerInputBaseProps & (WagerInputTextProps | WagerInputSelectProps)

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

const WagerAmount = styled.div`
  text-wrap: nowrap;
  padding: 10px 0;
  width: 40px;  // Default width for small screens

  @media (min-width: 600px) {
    width: 100px;  // Increase width for screens wider than 600px
  }

  opacity: .8;
  overflow: hidden;
`

export function WagerInput(props: WagerInputProps) {
  const gamba = useGamba()
  const token = useCurrentToken()
  const [input, setInput] = React.useState('')
  const balance = useUserBalance() //useBalance(walletAddress, token.mint)
  const fees = useFees()
  const [isEditing, setIsEditing] = React.useState(false)
  const type = props.type ?? 'text'

  React.useEffect(
    () => {
      props.onChange(token.baseWager)
    },
    [token.mint.toString()],
  )

  const edit = () => {
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
    <div style={{ position: 'relative' }}>
      <StyledWagerInput $edit={isEditing}>
        <Flex onClick={() => !gamba.isPlaying && edit()}>
          <img src={token.image} height="25px" style={{ margin: '0 5px', borderRadius: '50%', aspectRatio: '1/1' }} />
          {(!isEditing || type !== 'text') ? (
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
        {type === 'text' && (
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
      {props.type === 'select' && isEditing && (
        <StyledPopup>
          {props.options.map((val, i) => (
            <button
              key={i}
              onClick={() => {
                props.onChange(val)
                setIsEditing(false)
              }}
            >
              <img src={token.image} height="25px" style={{ margin: '0 5px', borderRadius: '50%', aspectRatio: '1/1' }} />
              <TokenValue amount={val} mint={token.mint} />
            </button>
          ))}
        </StyledPopup>
      )}
    </div>
  )
}
