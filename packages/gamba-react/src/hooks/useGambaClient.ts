import { RecentPlayEvent } from 'gamba-core'
import React from 'react'
import { GambaContext } from '../GambaProvider'
import { useRerender } from './useRerender'

export function useGambaEvent(callback: (event: RecentPlayEvent) => void, deps: React.DependencyList = []) {
  // const client = useGambaClient()
  // React.useEffect(() => client.onGameResult(callback),  [client, ...deps])
}

export function useGambaClient() {
  const { client } = React.useContext(GambaContext)
  const rerender = useRerender()

  React.useEffect(() => client.userAccount.subscribe(rerender), [client.userAccount])
  React.useEffect(() => client.houseAccount.subscribe(rerender), [client.houseAccount])
  React.useEffect(() => client.walletAccount.subscribe(rerender), [client.walletAccount])

  return client
}
