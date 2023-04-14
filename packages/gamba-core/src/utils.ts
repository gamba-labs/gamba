import { BorshAccountsCoder, BorshCoder, EventParser } from '@coral-xyz/anchor'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { IDL, PROGRAM_ID } from './constants'
import { GameResult, HouseState, UserState } from './types'

const sha256 = async (message: string) => {
  const arrayBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  return Buffer.from(arrayBuffer).toString('hex')
}

export const getPdaAddress = (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
  return address
}

export const decodeUser = (account: AccountInfo<Buffer> | null) => {
  return account && new BorshAccountsCoder(IDL).decode('user', account.data) as UserState
}

export const decodeHouse = (account: AccountInfo<Buffer> | null) => {
  return account && new BorshAccountsCoder(IDL).decode('house', account.data) as HouseState
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

export const getRecentEvents = async (connection: Connection, limit: number) => {
  const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))
  console.debug('🍤 Get recent bets')
  const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 500 }, 'confirmed')
  console.debug('🍤 Recent signatures', signatures)
  const signatureStrings = signatures.slice(0, limit).map((x) => x.signature)
  console.debug('🍤 Get recent bets', signatureStrings)
  const transactions = await connection.getParsedTransactions(
    signatureStrings,
    { maxSupportedTransactionVersion: 0, commitment: 'confirmed' },
  )
  console.debug('🍤 Recent transactions', transactions)
  return new Promise<any[]>((resolve) => {
    const _events = []
    for (const tx of transactions) {
      try {
        if (tx?.meta?.logMessages) {
          const events = eventParser.parseLogs(tx.meta.logMessages)
          for (const event of events) {
            _events.push({ event, estimatedTime: tx.blockTime ? tx.blockTime * 1000 : Date.now() })
          }
        }
      } catch (err) {
        console.error('Failed to parse logs', tx)
      }
    }
    resolve(_events)
  })
}
