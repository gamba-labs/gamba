import { BorshCoder, EventParser } from '@coral-xyz/anchor'
import { Signal } from '@hmans/signal'
import { Connection, PublicKey } from '@solana/web3.js'
import { StateAccount } from './account'
import { HOUSE_SEED, IDL, PROGRAM_ID } from './constants'
import { GambaSession } from './session'
import { BetSettledEvent, HouseState, RecentPlayEvent, Wallet } from './types'
import { decodeHouse, getPdaAddress } from './utils'

export class GambaProvider {
  private eventSignal = new Signal<RecentPlayEvent>()
  private creatorSignal = new Signal<PublicKey | undefined>()
  readonly connection: Connection
  readonly house: StateAccount<HouseState | undefined>

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
      (logs) => {
        if (logs.err) {
          return
        }
        for (const event of eventParser.parseLogs(logs.logs)) {
          const data = event.data as BetSettledEvent
          this.eventSignal.emit({
            creator: data.creator,
            clientSeed: data.clientSeed,
            wager: data.wager.toNumber(),
            signature: logs.signature,
            estimatedTime: Date.now(),
            resultIndex: data.resultIndex.toNumber(),
            resultMultiplier: data.resultMultiplier.toNumber() / 1000,
            rngSeed: data.rngSeed,
            player: data.player,
            nonce: data.nonce.toNumber(),
          })
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

  onEvent(callback: (event: RecentPlayEvent) => void) {
    this.eventSignal.add(callback)
    return () => {
      this.eventSignal.remove(callback)
    }
  }

  createSession(wallet: Wallet) {
    return new GambaSession(this, wallet)
  }
}
