import { BorshAccountsCoder, BorshCoder, EventParser } from '@coral-xyz/anchor'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AccountInfo, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { IDL, PROGRAM_ID } from './constants'
import { ParsedSettledBetEvent, parseSettledBetEvent } from './parsers'
import { BetSettledEvent, GameResult, HouseState, RecentPlayEvent, UserState } from './types'
// import BN from 'bn.js'

/**
 * Return zero if provided number is undefined
 */
export const zeroUnless = (num: number | undefined) => {
  if (num === undefined) return 0
  return num
}

// ....
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bnToNumber = (bn: any) => {
  return bn.toNumber() as number
}

export const hmac256 = async (secretKey: string, message: string, algorithm = 'SHA-256') => {
  const encoder = new TextEncoder()
  const messageUint8Array = encoder.encode(message)
  const keyUint8Array = encoder.encode(secretKey)
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyUint8Array,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  )
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageUint8Array,
  )
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex
}

/**
 * Converts Lamports to SOL
 */
export const lamportsToSol = (lamports: number) => {
  return lamports / LAMPORTS_PER_SOL
}

/**
 * Converts SOL to Lamports
 */
export const solToLamports = (sol: number) => {
  return sol * LAMPORTS_PER_SOL
}

export const getPdaAddress = (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
  return address
}

export const decodeUser = (account: AccountInfo<Buffer> | null) => {
  if (!account?.data?.length)
    return null
  return new BorshAccountsCoder(IDL).decode('user', account.data) as UserState
}

export const decodeHouse = (account: AccountInfo<Buffer> | null) => {
  if (!account?.data?.length)
    return null
  return new BorshAccountsCoder(IDL).decode('house', account.data) as HouseState
}

export const getGameHash = (rngSeed: string, clientSeed: string, nonce: number) => {
  return hmac256(rngSeed, [clientSeed, nonce].join('-'))
}

export const resultIndexFromGameHash = (gameHash: string, options: number[]) => {
  const result = parseInt(gameHash.substring(0, 5), 16)
  return result % options.length
}

export const getGameResult = async (
  previousState: UserState,
  currentState: UserState,
): Promise<GameResult> => {
  const clientSeed = previousState.currentGame.clientSeed
  const options = previousState.currentGame.options
  const nonce = bnToNumber(previousState.nonce)
  const rngSeedHashed = previousState.currentGame.rngSeedHashed
  const rngSeed = currentState.previousRngSeed
  const gameHash = await getGameHash(rngSeed, clientSeed, nonce)
  const resultIndex = resultIndexFromGameHash(gameHash, options)
  const multiplier = options[resultIndex]
  const wager = bnToNumber(previousState.currentGame.wager)
  const payout = (wager * multiplier / 1000)
  const profit = (payout - wager)

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
    profit,
  }
}

export const getTokenBalance = async (connection: Connection, wallet: PublicKey, token: PublicKey) => {
  const associatedTokenAccount = getAssociatedTokenAddressSync(
    token,
    wallet,
  )
  const tokenAccountBalance = await connection.getTokenAccountBalance(associatedTokenAccount)
  return Number(tokenAccountBalance.value.amount)
}

export const getRecentEvents = async (
  connection: Connection,
  params: {
    signatureLimit: number,
    rngAddress: PublicKey,
  },
) => {
  console.debug('[gamba] Fetching recent events', params)

  const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))

  const signatures = await connection.getSignaturesForAddress(
    params.rngAddress,
    { limit: params.signatureLimit },
    'finalized',
  )

  const signatureStrings = signatures.map((x) => x.signature)

  const transactions = await connection.getParsedTransactions(
    signatureStrings,
    { maxSupportedTransactionVersion: 0, commitment: 'finalized' },
  )

  console.debug('[gamba] Transactions', transactions.length)

  return new Promise<RecentPlayEvent[]>((resolve) => {
    const parsedEvents: RecentPlayEvent[] = []
    for (const tx of transactions) {
      try {
        if (tx?.meta?.logMessages) {
          const events = eventParser.parseLogs(tx.meta.logMessages)
          for (const event of events) {
            const data = event.data as BetSettledEvent
            parsedEvents.push({
              signature: tx.transaction.signatures[0],
              estimatedTime: tx.blockTime ? (tx.blockTime * 1000) : Date.now(),
              creator: data.creator,
              clientSeed: data.clientSeed,
              wager: bnToNumber(data.wager),
              nonce: bnToNumber(data.nonce),
              resultIndex: bnToNumber(data.resultIndex),
              resultMultiplier: bnToNumber(data.resultMultiplier) / 1000,
              rngSeed: data.rngSeed,
              player: data.player,
            })
          }
        }
      } catch (err) {
        console.error('[gamba] Failed to parse logs', tx)
      }
    }
    resolve(parsedEvents)
  })
}

export const listenForPlayEvents = (connection: Connection, cb: (event: ParsedSettledBetEvent) => void) => {
  const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))
  console.debug('🛜 Listen for events')

  const logSubscription = connection.onLogs(
    PROGRAM_ID,
    (logs) => {
      if (logs.err) {
        return
      }
      for (const event of eventParser.parseLogs(logs.logs)) {
        const data = event.data as BetSettledEvent
        cb(parseSettledBetEvent(data, logs.signature))
      }
    },
  )

  return () => {
    console.debug('🛜❌ Remove listener')
    connection.removeOnLogsListener(logSubscription)
  }
}
