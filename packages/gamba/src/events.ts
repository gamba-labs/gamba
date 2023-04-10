import { EventEmitter } from 'events'
import { GambaError } from './constants'
import { SettledGameEvent, UserState } from './types'
import { getGameResult } from './utils'

type UserAccountChangedCallbackArgs = [state: UserState | null, previousState: UserState | null]

export declare interface GambaEventEmitter {
  on(event: 'gameSettled', listener: (result: SettledGameEvent) => void): this
  on(event: 'userAccountChanged', listener: (...args: UserAccountChangedCallbackArgs) => void): this
  on(event: string, listener: () => void): this
}

export class GambaEventEmitter extends EventEmitter {
  emitGameSettled(result: SettledGameEvent): void {
    this.emit('gameSettled', result)
  }
  emitUserAccountChanged(...[user, previousState]: UserAccountChangedCallbackArgs): void {
    this.emit('userAccountChanged', user, previousState)
  }
}

export const makeStateChangePromise = <T>(
  cb: (...args: UserAccountChangedCallbackArgs) => {error?: string, result?: T} | undefined,
) => {
  return (eventEmitter: GambaEventEmitter) => {
    return new Promise<T>((resolve, reject) => {
      eventEmitter.on('userAccountChanged', function changeListener(state, previous) {
        const off = () => eventEmitter.off('userAccountChanged', changeListener)
        const handled = cb(state, previous)
        if (handled?.error) {
          off()
          reject(handled.error)
        } else if (handled?.result) {
          off()
          resolve(handled.result)
        }
      })
    })
  }
}

export const waitForResult = makeStateChangePromise(
  (state, previous) => {
    if (!state?.created) {
      return { error: GambaError.USER_ACCOUNT_CLOSED_BEFORE_RESULT }
    }
    if (previous?.status.hashedSeedRequested) {
      if (!state?.status.playing) {
        return { error: GambaError.FAILED_TO_GENERATE_RESULT }
      } else if (!state?.status.hashedSeedRequested) {
        // Game status went from hashedSeedRequested to playing
        // We can now derive a result
        return { result: getGameResult(previous, state) }
      }
    }
  },
)

export const waitForCreated = makeStateChangePromise(
  (state) => {
    if (!state?.created) {
      return { error: GambaError.FAILED_CREATING_USER_ACCOUNT }
    } else {
      return { result: true }
    }
  },
)

export const waitForClosed = makeStateChangePromise(
  (state) => {
    if (state?.created) {
      return { error: GambaError.FAILED_TO_CLOSE_USER_ACCOUNT }
    } else {
      return { result: true }
    }
  },
)
