import { RecentPlayEvent } from 'gamba-core'
import React from 'react'
import { GambaContext } from '../provider'
import { useRerender } from './useRerender'

export function useGambaEvent(callback: (event: RecentPlayEvent) => void, deps: React.DependencyList = []) {
  const client = useGambaClient()
  React.useEffect(() => client.onGameResult(callback),  [client, ...deps])
}

export function useGambaClient() {
  const { client } = React.useContext(GambaContext)
  const rerender = useRerender()

  React.useEffect(() => client.user.onChange(rerender), [client])
  React.useEffect(() => client.house.onChange(rerender), [client])
  React.useEffect(() => client.wallet.onChange(rerender), [client])

  return client
}
