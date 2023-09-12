import React from 'react'
import { useControlsStore } from '../useControlsStore'

interface Props {
  children: React.ReactNode
  disabled?: boolean
}

export default function Controls(props: Props) {
  const set = useControlsStore((s) => s.set)

  React.useEffect(
    () => {
      set({
        controlsNode: props.children,
        disabled: props.disabled,
      })
      return () => set({
        controlsNode: null,
        disabled: undefined,
      })
    },
    [props],
  )

  return null
}
