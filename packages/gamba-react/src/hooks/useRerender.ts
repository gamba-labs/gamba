import { useCallback, useState } from 'react'

export function useRerender() {
  const [, set] = useState({})
  const rerender = useCallback(() => {
    set({})
  }, [])
  return rerender
}
