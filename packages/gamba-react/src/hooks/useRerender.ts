import { useCallback, useState } from 'react'

export function useRerender() {
  const [, setSignal] = useState({})

  const rerender = useCallback(() => {
    setSignal({})
  }, [])

  return rerender
}
