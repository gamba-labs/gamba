import { RecentPlayEvent, listenForPlayEvents } from 'gamba-core'
import React from 'react'
import { GambaProviderContext } from '../provider'
import { useRerender } from './useRerender'

export function useGambaEvent(callback: (event: RecentPlayEvent) => void, deps: React.DependencyList = []) {
  const client = useGambaClient()
  React.useEffect(
    () => listenForPlayEvents(client.connection, callback),
    [...deps, client],
  )
}

export function useGambaClient() {
  const { client } = React.useContext(GambaProviderContext)
  const rerender = useRerender()

  React.useEffect(() => client.user.onChange(rerender), [client.user.publicKey])
  React.useEffect(() => client.house.onChange(rerender), [client.house.publicKey])
  React.useEffect(() => client.wallet.onChange(rerender), [client.wallet.publicKey])

  return client
}
