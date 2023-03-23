import { EventEmitter } from 'events'
import { User, SettledGameEvent } from './types'

export declare interface GambaEventEmitter {
  on(event: 'gameSettled', listener: (result: SettledGameEvent) => void): this
  on(event: 'userAccountChanged', listener: (user: User, previousUser: User | undefined) => void): this
  on(event: string, listener: () => void): this
}

export class GambaEventEmitter extends EventEmitter {
  emitGameSettled(result: SettledGameEvent): void {
    this.emit('gameSettled', result)
  }
  emitUserAccountChanged(user: User, previousUser: User | undefined): void {
    this.emit('userAccountChanged', user, previousUser)
  }
}
