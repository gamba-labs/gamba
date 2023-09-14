import { BorshAccountsCoder, BorshCoder, EventParser } from '@coral-xyz/anchor'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AccountInfo, Connection, LAMPORTS_PER_SOL, ParsedTransactionWithMeta, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js'
import { IDL, PROGRAM_ID } from './constants'
import { parseBetSettledEvent, parsePlayEvent } from './parsers'
import { GameEvent, GameResult, HouseState, UserState } from './types'

const accountsCoder = new BorshAccountsCoder(IDL)
const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))

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

// ....
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bnToNumber = (bn: any) => {
  return bn.toNumber() as number
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

export const decodeAccount = <T>(accountName: string, account: AccountInfo<Buffer> | null) => {
  if (!account?.data?.length)
    return null
  return accountsCoder.decode<T>(accountName, account.data)
}

export const decodeUser = (account: AccountInfo<Buffer> | null) => {
  return decodeAccount<UserState>('user', account)
}

export const decodeHouse = (account: AccountInfo<Buffer> | null) => {
  return decodeAccount<HouseState>('house', account)
}

export const getGameHash = (rngSeed: string, clientSeed: string, nonce: number) => {
  return hmac256(rngSeed, [clientSeed, nonce].join('-'))
}

export const getTokenAccount = async (connection: Connection, wallet: PublicKey, token: PublicKey) => {
  const address = getAssociatedTokenAddressSync(token, wallet)
  const tokenAccountBalance = await connection.getTokenAccountBalance(address)
  const balance = Number(tokenAccountBalance.value.amount)
  return { address, balance }
}

/**
 *
 */
export const parseTransactionEvents = (
  logs: string[],
) => {
  let gameResult: GameResult | undefined = undefined
  let gameResultOld: GameResult | undefined = undefined
  const events = eventParser.parseLogs(logs)

  for (const event of events) {
    const data = event.data as GameEvent
    if (event.name === 'GameEvent') {
      gameResult = parsePlayEvent(data)
    } else {
      gameResultOld = parseBetSettledEvent(data)
    }
  }

  return { gameResult, gameResultOld }
}

export interface ParsedGambaTransaction {
  signature: string
  time: number
  event: {
    gameResult?: GameResult
  }
}

/**
 * Tries to find Gamba data in a transaction
 */
export const parseGambaTransaction = (
  transaction: ParsedTransactionWithMeta,
): ParsedGambaTransaction => {
  const logs = transaction.meta?.logMessages ?? []
  const events = parseTransactionEvents(logs)
  const gameResult = events.gameResult ?? events.gameResultOld
  return {
    signature: transaction.transaction.signatures[0],
    time: (transaction.blockTime ?? 0) * 1000,
    event: { gameResult },
  }
}

export async function fetchTransactionsWithEvents(
  connection: Connection,
  address: PublicKey,
  options: SignaturesForAddressOptions,
) {
  const signatureInfo = await connection.getSignaturesForAddress(
    address,
    options,
    'confirmed',
  )

  const signatures = signatureInfo.map((x) => x.signature)

  const transactions = (await connection.getParsedTransactions(
    signatures,
    {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    },
  )).flatMap((x) => x ? [x] : [])

  const parsed = transactions.map(parseGambaTransaction)

  return parsed
}
