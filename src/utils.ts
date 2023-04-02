import { BorshAccountsCoder, BorshCoder, EventParser } from '@coral-xyz/anchor'
import { AccountInfo, Connection, Enum, PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { IDL, PROGRAM_ID } from './constants'
import { GameResult, House, HouseState, SettledGameEvent, User, UserState, UserStatus } from './types'

export const randomSeed = (len = 16) =>
  Array.from({ length: len }).map(() =>
    (Math.random() * 16 | 0).toString(16),
  ).join('')

const sha256 = async (message: string) => {
  const arrayBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  return Buffer.from(arrayBuffer).toString('hex')
}

export const parseStatus = (x: UserState['status']) => new Enum(x).enum as UserStatus

export const parseEvent = (name: string, e: any, estimatedTime: number): SettledGameEvent | undefined => {
  try {
    const wager = e.wager.toNumber()
    const unit = wager / 1_000
    return {
      player: e.player,
      creator: e.creator,
      wager,
      nonce: e.nonce.toNumber(),
      payout: unit * e.resultMultiplier.toNumber(),
      multiplier: e.resultMultiplier.toNumber(),
      estimatedTime,
      rngSeed: e.rngSeed,
      clientSeed: e.clientSeed,
      resultIndex: e.resultIndex.toNumber(),
    }
  } catch (err) {
    console.warn('🍤 Failed to parse event', name, e, estimatedTime, err)
    return undefined
  }
}

export const getRecentGames = async (connection: Connection, limit: number) => {
  const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))
  console.debug('🍤 Get recent bets')
  const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 500 }, 'confirmed')
  console.debug('🍤 Recent signatures', signatures)
  const signatureStrings = signatures.slice(0, limit).map((x) => x.signature)
  const transactions = await connection.getParsedTransactions(signatureStrings, 'confirmed')
  console.debug('🍤 Recent transactions', transactions)
  return new Promise<any[]>((resolve) => {
    const _events = []
    for (const tx of transactions) {
      if (tx?.meta?.logMessages) {
        const events = eventParser.parseLogs(tx.meta.logMessages)
        for (const event of events) {
          _events.push({ event, estimatedTime: tx.blockTime ? tx.blockTime * 1000 : Date.now() })
        }
      }
    }
    resolve(
      _events
        .map(({ event, estimatedTime }) => parseEvent(event.name, event.data, estimatedTime))
        .filter((x) => !!x),
    )
  })
}

export const parseUserAccount = (account: AccountInfo<Buffer | null> | null): User => {
  try {
    if (!account?.data) {
      throw new Error('No account data')
    }
    const state = new BorshAccountsCoder(IDL).decode('user', account.data) as UserState
    return {
      created: true,
      status: parseStatus(state.status),
      balance: state?.balance?.toNumber() ?? 0,
      _accountBalance: account.lamports,
      state,
    }
  } catch (err) {
    console.warn('🍤 Error parsing User state', err)
    return {
      status: 'none',
      created: false,
      balance: 0,
      _accountBalance: 0,
      state: null,
    }
  }
}

export const parseHouseAccount = (account: AccountInfo<Buffer | null> | null): House => {
  try {
    if (!account?.data) {
      throw new Error('No account data')
    }
    const state = new BorshAccountsCoder(IDL).decode('house', account.data) as HouseState
    return {
      state,
      balance: account.lamports,
      maxPayout: state.maxPayout.toNumber(),
      fees: {
        house: state.houseFee.toNumber() / 1000,
        creator: state.creatorFee.toNumber() / 1000,
      },
    }
  } catch (err) {
    console.warn('🍤 Error parsing House state', err)
    return {
      state: null,
      balance: 0,
      maxPayout: 0,
      fees: {
        house: 0,
        creator: 0,
      },
    }
  }
}

export const getGameHash = (
  rngSeed: string,
  clientSeed: string,
  nonce: number,
) => {
  return sha256([rngSeed, clientSeed, nonce].join('-'))
}

export const calculateResultIndex = (gameHash: string, options: number[]) => {
  const result = parseInt(gameHash.substring(0, 5), 16)
  return result % options.length
}

export const getGameResult = async (previousState: UserState, currentState: UserState): Promise<GameResult> => {
  if (!previousState.owner.equals(currentState.owner)) {
    console.error('⛔️ This should never happen', previousState.owner.toBase58(), currentState.owner.toBase58())
    throw new Error('Players don\'t match')
  }
  const clientSeed = previousState.currentGame.clientSeed
  const options = previousState.currentGame.options
  const nonce = previousState.nonce.toNumber()
  const rngSeedHashed = previousState.currentGame.rngSeedHashed
  const rngSeed = currentState.previousRngSeed
  const gameHash = await getGameHash(rngSeed, clientSeed, nonce)
  const resultIndex = calculateResultIndex(gameHash, options)
  const multiplier = options[resultIndex]
  const wager = previousState.currentGame.wager.toNumber()
  const payout = wager / 1000 * multiplier
  return {
    player: currentState.owner,
    rngSeedHashed,
    rngSeed,
    clientSeed,
    nonce,
    options,
    resultIndex,
    wager,
    payout,
  }
}

export const getPdaAddress = async (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = await PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
  return address
}
