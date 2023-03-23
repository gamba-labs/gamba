import { useEffect } from 'react'
import { useGambaStore } from '../store'
import { SettledGameEvent } from '../types'

/**
 *
 * @param cb Callback function that will fire for every GameResult
 * @param config
 */
export function useGambaEvent(cb: (result: SettledGameEvent) => void) {
  const accounts = useGambaStore((store) => store.accounts)
  const eventEmitter = useGambaStore((state) => state.eventEmitter)
  useEffect(() => {
    const handler = (result: SettledGameEvent) => {
      if (accounts.wallet?.equals(result.player)) {
        cb(result)
      }
    }
    eventEmitter.on('gameSettled', handler)
    return () => {
      eventEmitter.off('gameSettled', handler)
    }
  }, [])
}
