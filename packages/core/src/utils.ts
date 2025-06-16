import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js'
import { BPS_PER_WHOLE } from '.'
import { decodeGame } from './decoders'
import { getGameAddress } from './pdas'
import { GameState } from './types'

export const basisPoints = (percent: number) =>
  Math.round(percent * BPS_PER_WHOLE)

export const isNativeMint = (pubkey: PublicKey) =>
  NATIVE_MINT.equals(pubkey)

export const hmac256 = async (
  secretKey: string,
  message: string,
): Promise<string> => {
  const encoder = new TextEncoder()
  const messageUint8Array = encoder.encode(message)
  const keyUint8Array = encoder.encode(secretKey)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyUint8Array,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageUint8Array)
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const getGameHash = (rngSeed: string, clientSeed: string, nonce: number) =>
  hmac256(rngSeed, [clientSeed, nonce].join('-'))

export const getResultNumber = async (
  rngSeed: string,
  clientSeed: string,
  nonce: number,
) => {
  const hash = await getGameHash(rngSeed, clientSeed, nonce)
  return parseInt(hash.substring(0, 5), 16)
}

// ─── Explicit, portable return type ─────────────────────────────────────────
export interface GameResult {
  creator: PublicKey
  user: PublicKey
  rngSeed: string
  clientSeed: string
  nonce: number
  bet: number[]
  resultIndex: number
  wager: number
  payout: number
  profit: number
  multiplier: number
  token: PublicKey
  bonusUsed: number
  jackpotWin: number
}

/** Parses a `GameState` into a plain object */
export const parseResult = (state: GameState): GameResult => {
  const clientSeed  = state.clientSeed
  const bet         = state.bet.map((x) => x / BPS_PER_WHOLE)
  const nonce       = state.nonce.toNumber() - 1
  const rngSeed     = state.rngSeed
  const resultIndex = state.result.toNumber()
  const multiplier  = bet[resultIndex]
  const wager       = state.wager.toNumber()
  const payout      = wager * multiplier
  const profit      = payout - wager

  return {
    creator: state.creator,
    user: state.user,
    rngSeed,
    clientSeed,
    nonce,
    bet,
    resultIndex,
    wager,
    payout,
    profit,
    multiplier,
    token: state.tokenMint,
    bonusUsed: state.bonusUsed.toNumber(),
    jackpotWin: state.jackpotPayout.toNumber(),
  }
}

/** Waits for the next game‐account change and resolves with its parsed result */
export async function getNextResult(
  connection: Connection,
  user: PublicKey,
  prevNonce: number,
): Promise<GameResult> {
  return new Promise((resolve, reject) => {
    const listener = connection.onAccountChange(
      getGameAddress(user),
      async (account: AccountInfo<Buffer>) => {
        const current = decodeGame(account)
        if (!current) {
          connection.removeAccountChangeListener(listener)
          return reject('Game account was closed')
        }
        if (current.nonce.toNumber() === prevNonce + 1) {
          connection.removeAccountChangeListener(listener)
          const result = parseResult(current)
          resolve(result)
        }
      },
    )
  })
}
