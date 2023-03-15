import { GameResult, LAMPORTS_PER_SOL, useGamba, useGambaResult } from 'gamba'
import React, { useState } from 'react'
import { Amount } from '../styles'
import { Value } from './Value'

export function Result() {
  const gamba = useGamba()
  const [result, setResult] = useState<GameResult>()
  const amount = !result ? 0 : result.payout - result.amount

  useGambaResult((result) => {
    setResult(result)
  })

  return (
    <div style={{fontSize: 32, fontWeight: 'bold', padding: 20}}>
      <small>
        {gamba.waitingForResult ?
          'FLIPPING..'
        : result ?
          ['HEADS', 'TAILS'][result.resultIndex]
        : '-'}
      </small>
      <Amount $value={amount}>
        <Value key={result?.nonce ?? amount}>
          {`${(amount / LAMPORTS_PER_SOL).toFixed(3)} SOL`}
        </Value>
      </Amount>
    </div>
  )
}
