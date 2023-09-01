import React from 'react'

export function useRerender() {
  const [, set] = React.useState({})
  const rerender = React.useCallback(() => {
    set({})
  }, [])
  return rerender
}
