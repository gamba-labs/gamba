import { useGamba } from 'gamba'
import React, { useState } from 'react'
import styled from 'styled-components'
import { SmallButton } from '../styles'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 50px;
`

const Input = styled.input`
  padding: 15px;
  height: 50px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 10px;
  border: none;
  background: rgb(47 51 60);
  color: white;
  outline: none;
  transition: background .1s;
  &:focus {
    background: rgb(58 63 75);
  }
`

const Controls = styled.div`
  position: absolute;
  right: 10px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 5px;
`

const MAX_WAGER = .25
const MIN_WAGER = .01

interface Props {
  wager: number
  onChange: (wager: number) => void
}

export function BetInput({ wager, onChange }: Props) {
  const gamba = useGamba()
  const [_wager, _setWager] = useState(String(wager))
  const accountCreated = gamba.user.created

  const setWager = (x: number) => {
    const max = Math.min(MAX_WAGER, Math.max(gamba.wallet.balance, gamba.user.balance))
    const wager = Math.max(MIN_WAGER, Math.min(max, x))
    _setWager(String(wager))
    onChange(wager)
  }

  return (
    <Wrapper>
      <Input
        placeholder="Wager (SOL)"
        value={_wager}
        disabled={!gamba.connected}
        onChange={(e) => _setWager(e.target.value)}
        onBlur={() => setWager(Number(_wager))}
      />
      <Controls>
        <SmallButton disabled={!accountCreated} onClick={() => setWager(MIN_WAGER)}>
          MIN
        </SmallButton>
        <SmallButton disabled={!accountCreated} onClick={() => setWager(MAX_WAGER)}>
          MAX
        </SmallButton>
        <SmallButton disabled={!accountCreated} onClick={() => setWager(wager / 2)}>
          X.5
        </SmallButton>
        <SmallButton disabled={!accountCreated} onClick={() => setWager(wager * 2)}>
          X2
        </SmallButton>
      </Controls>
    </Wrapper>
  )
}
