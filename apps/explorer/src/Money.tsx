import React from 'react'

interface Props {
  lamports: number
  children?: (x: number) => React.ReactNode
}

export function Money({ children, lamports }: Props) {
  const value = (lamports / 1e9)
  if (children) return children(value)
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SOL'
}
