import { useGamba } from "gamba-react-v2"
import React from "react"
import { Select } from "./Select"
import { TokenValue } from "./TokenValue"

export interface WagerSelectProps {
  options: number[]
  value: number
  onChange: (value: number) => void
}

export function WagerSelect(props: WagerSelectProps) {
  const gamba = useGamba()
  return (
    <Select
      options={props.options}
      value={props.value}
      onChange={props.onChange}
      disabled={gamba.isPlaying}
      label={(value) => (
        <TokenValue amount={value} />
      )}
    />
  )
}
