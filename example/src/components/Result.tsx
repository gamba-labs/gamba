import { LAMPORTS_PER_SOL, useGamba } from 'gamba'
import React from 'react'
import styled from 'styled-components'
import { Amount } from '../styles'
import { Value } from './Value'

const ResultWrapper = styled.div`
  font-size: 32px;
  font-weight: bold;
  padding: 20px;
`

export function Result() {
  const gamba = useGamba()

  if (gamba.waitingForResult) {
    return (
      <ResultWrapper>
        <small>FLIPPING</small>
        <div>
          <>...</>
        </div>
      </ResultWrapper>
    )
  }

  if (!gamba.result) {
    return (
      <ResultWrapper>
        <small>-</small>
        <div>
          <>{gamba.config.name}</>
        </div>
      </ResultWrapper>
    )
  }

  const amount = gamba.result.payout - gamba.result.wager

  return (
    <ResultWrapper>
      <small>
        {['HEADS', 'TAILS'][gamba.result.resultIndex]}
      </small>
      <Amount $value={amount}>
        <Value key={String(gamba.result.nonce)}>
          {`${(amount / LAMPORTS_PER_SOL).toFixed(3)} SOL`}
        </Value>
      </Amount>
    </ResultWrapper>
  )
}
