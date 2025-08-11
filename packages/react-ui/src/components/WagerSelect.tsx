import React from 'react'
import { Select } from './Select'
import { TokenValue } from './TokenValue'

export interface WagerSelectProps {
  options: number[]
  value: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
}

export function WagerSelect({
  options,
  value,
  onChange,
  className,
  disabled = false,
}: WagerSelectProps) {
  return (
    <Select
      className={className}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      label={(val) => <TokenValue amount={val} />}
    />
  )
}
