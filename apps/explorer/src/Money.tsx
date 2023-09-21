import React from 'react'

interface Props {
  lamports: number
  children?: (x: number) => React.ReactNode
}

export function Money({ children, lamports }: Props) {
  const value = (lamports / 1e9) * 1
  if (children) return children(value)
  const fractionDigits = 2 // value > 1000 ? 0 : 2
  return value.toLocaleString(undefined, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }) + ' SOL'
}
