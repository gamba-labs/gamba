import React from 'react'
import { GambaContext } from '../GambaProvider'
import { useRerender } from './useRerender'

export function useGambaClient() {
  const { client } = React.useContext(GambaContext)
  const rerender = useRerender()

  React.useEffect(() => client.onChange(rerender), [client])

  return client
}
