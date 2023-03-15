import { EventEmitter } from 'events';
import { GameResult } from './types';

export declare interface GambaEventEmitter {
  on(event: 'gameSettled', listener: (result: GameResult) => void): this;
  on(event: string, listener: Function): this;
}

export class GambaEventEmitter extends EventEmitter {
  emitGameSettled(result: GameResult): void {
    this.emit('gameSettled', result)
  }
  emitGameStarted(game: any): void {
    this.emit('gameStarted', game)
  }
}
