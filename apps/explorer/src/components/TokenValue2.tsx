import { useTokenMeta, useTokenPrice } from '@/hooks'
import { PublicKey } from '@solana/web3.js'
import React from 'react'

export interface TokenValueProps {
  mint: PublicKey
  amount: number | bigint
  suffix?: string
  exact?: boolean
  dollar?: boolean
}

export function TokenValue2(props: TokenValueProps) {
  const price = useTokenPrice(props.mint)
  const token = useTokenMeta(props.mint)
  const suffix = props.suffix ?? token.symbol
  const tokenAmount = Number(BigInt(props.amount) / BigInt(10 ** token.decimals))
  const amount = props.dollar ? price * tokenAmount : tokenAmount

  const displayedAmount = (
    () => {
      if (!props.exact) {
        if (amount >= 1e9) {
          return (amount / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'B'
        }
        if (amount >= 1e6) {
          return (amount / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'M'
        }
        if (amount > 1000) {
          return (amount / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'K'
        }
      }
      return amount.toLocaleString(undefined, { maximumFractionDigits: Math.floor(amount) > 100 ? 1 : 4 })
    }
  )()

  return (
    <>
      {props.dollar ? (
        <>
          ${displayedAmount}
        </>
      ) : (
        <>
          {displayedAmount} {suffix}
        </>
      )}
    </>
  )
}
