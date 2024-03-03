import { PublicKey } from '@solana/web3.js'
import React from 'react'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { useTokenMeta } from '../hooks'

export interface TokenValueProps {
  mint?: PublicKey
  amount: number
  suffix?: string
  exact?: boolean
}

export function TokenValue(props: TokenValueProps) {
  const context = React.useContext(GambaPlatformContext)
  const mint = props.mint ?? context?.selectedPool.token
  if (!mint) {
    throw new Error('"mint" prop is required when not using GambaPlatformProvider')
  }
  const token = useTokenMeta(mint)
  const suffix = props.suffix ?? token?.symbol ?? '?'
  const tokenAmount = props.amount / (10 ** token.decimals)

  const displayedAmount = (
    () => {
      if (!props.exact) {
        if (tokenAmount >= 1e9) {
          return (tokenAmount / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'B'
        }
        if (tokenAmount >= 1e6) {
          return (tokenAmount / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'M'
        }
        if (tokenAmount > 1000) {
          return (tokenAmount / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'K'
        }
      }
      return tokenAmount.toLocaleString(undefined, { maximumFractionDigits: Math.floor(tokenAmount) > 100 ? 1 : 4 })
    }
  )()

  return (
    <>
      {displayedAmount} {suffix}
    </>
  )
}
