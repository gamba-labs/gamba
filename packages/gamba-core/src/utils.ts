import { BorshAccountsCoder, BorshCoder, EventParser } from '@coral-xyz/anchor'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AccountInfo, Connection, LAMPORTS_PER_SOL, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js'
import { IDL, PROGRAM_ID } from './constants'
import { parsePlayEvent } from './parsers'
import { GameEvent, HouseState, UserState, GameResult } from './types'

const accountsCoder = new BorshAccountsCoder(IDL)
const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))

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
  return accountsCoder.decode<UserState>('user', account.data)
}

export const decodeHouse = (account: AccountInfo<Buffer> | null) => {
  if (!account?.data?.length)
    return null
  return accountsCoder.decode<HouseState>('house', account.data)
}

export const getGameHash = (rngSeed: string, clientSeed: string, nonce: number) => {
  return hmac256(rngSeed, [clientSeed, nonce].join('-'))
}

export const deriveGameResult = async (
  previousState: UserState,
  currentState: UserState,
  estimatedTime = Date.now(),
): Promise<GameResult> => {
  const clientSeed = previousState.currentGame.clientSeed
  const bet = previousState.currentGame.options
  const nonce = bnToNumber(previousState.nonce)
  const rngSeed = currentState.previousRngSeed
  const gameHash = await getGameHash(rngSeed, clientSeed, nonce)
  const resultIndex = parseInt(gameHash.substring(0, 5), 16) % bet.length
  const multiplier = bet[resultIndex] / 1000
  const wager = bnToNumber(previousState.currentGame.wager)
  const payout = (wager * multiplier)
  const profit = (payout - wager)

  return {
    creator: currentState.currentGame.creator,
    player: currentState.owner,
    rngSeed,
    clientSeed,
    nonce,
    bet,
    resultIndex,
    wager,
    payout,
    profit,
    estimatedTime,
    signature: '',
    multiplier,
  }
}

export const getTokenAccount = async (connection: Connection, wallet: PublicKey, token: PublicKey) => {
  const address = getAssociatedTokenAddressSync(token, wallet)
  const tokenAccountBalance = await connection.getTokenAccountBalance(address)
  const balance = Number(tokenAccountBalance.value.amount)
  return { address, balance }
}

export const parseTransactionEvents = (
  logs: string[],
  signature: string,
  time: number,
) => {
  const parsedEvents: GameResult[] = []
  const events = eventParser.parseLogs(logs)
  for (const event of events) {
    const data = event.data as GameEvent
    if (event.name === 'GameEvent')
      parsedEvents.push(parsePlayEvent(data, signature, time))
  }
  return parsedEvents
}

/**
 * Fetches transactions from a given address and extracts their GameResult events
 */
export const getGameResults = async (
  connection: Connection,
  params: {
    signatureLimit: number,
    address: PublicKey,
    before?: string,
  },
) => {
  const signatureInfo = await connection.getSignaturesForAddress(
    params.address,
    {
      limit: params.signatureLimit,
      before: params.before,
    },
    'confirmed',
  )
  const signatures = signatureInfo.map((x) => x.signature)

  const transactions = await connection.getParsedTransactions(
    signatures,
    {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    },
  )

  const results = transactions.flatMap(
    (tx) => {
      if (!tx?.meta?.logMessages) return []
      return parseTransactionEvents(
        tx.meta.logMessages,
        tx.transaction.signatures[0],
        (tx.blockTime ?? 0) * 1000,
      )
    },
  )

  return { results, signatures }
}

export interface ParsedGambaTransaction {
  transaction: ParsedTransactionWithMeta
  gameResult?: GameResult
}

/**
 * Tries to find Gamba data in a transaction
 */
export const parseGambaTransaction = async (
  transaction: ParsedTransactionWithMeta,
): Promise<ParsedGambaTransaction> => {
  const _logs = transaction.meta?.logMessages ?? []
  const events = await parseTransactionEvents(
    _logs,
    transaction.transaction.signatures[0],
    (transaction.blockTime ?? 0) * 1000,
  )
  const gameResult = events[0]
  return { transaction, gameResult }
}

export const listenForPlayEvents = (
  connection: Connection,
  cb: (event: GameResult) => void,
  creator?: PublicKey,
) => {
  console.debug('🛜 Listen for events')
  const logSubscription = connection.onLogs(
    creator ?? PROGRAM_ID,
    (logs) => {
      if (logs.err) {
        return
      }
      parseTransactionEvents(
        logs.logs,
        logs.signature,
        Date.now(),
      ).forEach(cb)
    },
  )

  return () => {
    console.debug('🛜❌ Remove listener')
    connection.removeOnLogsListener(logSubscription)
  }
}
