import { BorshCoder, EventParser } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { Signal } from '@hmans/signal'
import { StateAccount } from './account'
import { HOUSE_SEED, IDL, PROGRAM_ID } from './constants'
import { GambaSession, Wallet } from './session'
import { HouseState } from './types'
import { decodeHouse, getPdaAddress } from './utils'

type EventPayload = {data: any, slot: number, signature: string}

export class GambaProvider {
  private eventSignal = new Signal<EventPayload>()
  private creatorSignal = new Signal<PublicKey | undefined>()
  readonly connection: Connection
  readonly house: StateAccount<HouseState>

  private _creator?: PublicKey

  get creator(): Readonly<PublicKey | undefined> {
    return this._creator
  }

  setCreator(creator: PublicKey | undefined) {
    this._creator = creator
    this.creatorSignal.emit(creator)
  }

  constructor(connection: Connection, creator?: PublicKey) {
    this.connection = connection
    this.house = new StateAccount(
      getPdaAddress(HOUSE_SEED),
      decodeHouse,
    )
    this.house._debugIdentifier = 'HOUSE'
    this.setCreator(creator)
  }

  listen() {
    const removeHouseListener = this.house.listen(this.connection)
    const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))

    const logSubscription = this.connection.onLogs(
      PROGRAM_ID,
      (logs, ctx) => {
        if (logs.err) {
          return
        }
        for (const event of eventParser.parseLogs(logs.logs)) {
          this.eventSignal.emit({ data: event.data, slot: ctx.slot, signature: logs.signature })
        }
      },
    )

    return () => {
      this.connection.removeOnLogsListener(logSubscription)
      removeHouseListener()
    }
  }

  onCreatorChanged(callback: (newCreator: PublicKey | undefined) => void) {
    this.creatorSignal.add(callback)
    return () => {
      this.creatorSignal.remove(callback)
    }
  }

  onEvent(callback: (event: EventPayload) => void) {
    this.eventSignal.add(callback)
    return () => {
      this.eventSignal.remove(callback)
    }
  }

  createSession(wallet: Wallet) {
    return new GambaSession(this, wallet)
  }
}
