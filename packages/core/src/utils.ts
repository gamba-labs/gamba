import { BorshAccountsCoder, IdlAccounts } from '@coral-xyz/anchor'
import { AccountLayout, NATIVE_MINT, createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AccountInfo, Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { GambaIdl, GameState } from '.'
import { GAMBA_STATE_SEED, GAME_SEED, PLAYER_SEED, POOL_ATA_SEED, POOL_BONUS_MINT_SEED, POOL_BONUS_UNDERLYING_TA_SEED, POOL_JACKPOT_SEED, POOL_LP_MINT_SEED, POOL_SEED, PROGRAM_ID } from './constants'
import { IDL } from './idl'

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

export const getGameHash = (rngSeed: string, clientSeed: string, nonce: number) => {
  return hmac256(rngSeed, [clientSeed, nonce].join('-'))
}

const accountsCoder = new BorshAccountsCoder(IDL)

const decodeAccount = <T>(accountName: string, info: AccountInfo<Buffer> | null) => {
  if (!info?.data?.length)
    return null
  return accountsCoder.decode<T>(accountName, info.data)
}

export const decodeAta = (acc: AccountInfo<Buffer> | null) => {
  if (!acc) return null
  return AccountLayout.decode(acc.data)
}

type GambaAccounts = IdlAccounts<GambaIdl>

const makeDecoder = <N extends keyof GambaAccounts>(accountName: N) => {
  return (info: AccountInfo<Buffer> | null) => {
    return decodeAccount<GambaAccounts[N]>(accountName, info) as GambaAccounts[N] | null
  }
}

export const decodePlayer = makeDecoder('player')
export const decodeGame = makeDecoder('game')
export const decodePool = makeDecoder('pool')
export const decodeGambaState = makeDecoder('gambaState')

export const BPS_PER_WHOLE = 10_000

export const basisPoints = (percent: number) => {
  return Math.round(percent * BPS_PER_WHOLE)
}

export const getPdaAddress = (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
  return address
}

export const getPoolAddress = (underlyingMint: PublicKey, authority = new PublicKey('11111111111111111111111111111111')) => getPdaAddress(
  Buffer.from(POOL_SEED),
  underlyingMint.toBytes(),
  authority.toBytes(),
)

export const getGambaStateAddress = () => getPdaAddress(
  Buffer.from(GAMBA_STATE_SEED),
)

export const getPlayerAddress = (owner: PublicKey) => getPdaAddress(
  Buffer.from(PLAYER_SEED),
  owner.toBytes(),
)

export const getGameAddress = (owner: PublicKey) => getPdaAddress(
  Buffer.from(GAME_SEED),
  owner.toBytes(),
)

export const getPoolLpAddress = (pool: PublicKey) => getPdaAddress(
  Buffer.from(POOL_LP_MINT_SEED),
  pool.toBytes(),
)

export const getPoolBonusAddress = (pool: PublicKey) => getPdaAddress(
  Buffer.from(POOL_BONUS_MINT_SEED),
  pool.toBytes(),
)

export const getPoolUnderlyingTokenAccountAddress = (pool: PublicKey) => getPdaAddress(
  Buffer.from(POOL_ATA_SEED),
  pool.toBytes(),
)

export const getPoolJackpotTokenAccountAddress = (pool: PublicKey) => getPdaAddress(
  Buffer.from(POOL_JACKPOT_SEED),
  pool.toBytes(),
)

export const getPoolBonusUnderlyingTokenAccountAddress = (pool: PublicKey) => getPdaAddress(
  Buffer.from(POOL_BONUS_UNDERLYING_TA_SEED),
  pool.toBytes(),
)


export const getUserUnderlyingAta = (user: PublicKey, underlyingTokenMint: PublicKey) =>
  getAssociatedTokenAddressSync(
    underlyingTokenMint,
    user,
  )

export const getPlayerUnderlyingAta = (user: PublicKey, underlyingTokenMint: PublicKey) =>
  getAssociatedTokenAddressSync(
    underlyingTokenMint,
    getPlayerAddress(user),
    true,
  )

export const getUserBonusAtaForPool = (user: PublicKey, pool: PublicKey) =>
  getAssociatedTokenAddressSync(
    getPoolBonusAddress(pool),
    user,
  )

export const getUserLpAtaForPool = (user: PublicKey, pool: PublicKey) =>
  getAssociatedTokenAddressSync(
    getPoolLpAddress(pool),
    user,
  )

export const getPlayerBonusAtaForPool = (user: PublicKey, pool: PublicKey) =>
  getAssociatedTokenAddressSync(
    getPoolBonusAddress(pool),
    getPlayerAddress(user),
    true,
  )

export const getUserWsolAccount = (user: PublicKey) => {
  return getAssociatedTokenAddressSync(NATIVE_MINT, user, true)
}

export const isNativeMint = (pubkey: PublicKey) => NATIVE_MINT.equals(pubkey)

export const wrapSol = async (
  from: PublicKey,
  amount: number,
  create: boolean,
) => {
  const wsolAta = getUserWsolAccount(from)

  const instructions = [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: wsolAta,
      lamports: amount,
    }),
    createSyncNativeInstruction(wsolAta),
  ]

  if (create) {
    return [
      createAssociatedTokenAccountInstruction(
        from,
        wsolAta,
        from,
        NATIVE_MINT,
      ),
      ...instructions,
    ]
  }

  return instructions
}

export const unwrapSol = async (
  from: PublicKey,
) => {
  const wsolAta = getUserWsolAccount(from)
  return createCloseAccountInstruction(
    wsolAta,
    from,
    from,
  )
}

export type GameResult = ReturnType<typeof parseResult>

export const parseResult = (
  state: GameState,
) => {
  const clientSeed = state.clientSeed
  const bet = state.bet.map((x) => x / 10000)
  const nonce = state.nonce.toNumber() - 1
  const rngSeed = state.rngSeed
  const resultIndex = state.result.toNumber()
  const multiplier = bet[resultIndex]
  const wager = state.wager.toNumber()
  const payout = (wager * multiplier)
  const profit = (payout - wager)

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
    jackpotWin: 0, // TODO
  }
}

export async function getNextResult(
  connection: Connection,
  user: PublicKey,
  prevNonce: number,
) {
  return new Promise<GameResult>((resolve, reject) => {
    const listener = connection.onAccountChange(
      getGameAddress(user),
      async (account) => {
        const current = decodeGame(account)
        if (!current) {
          connection.removeAccountChangeListener(listener)
          return reject('Game account was closed')
        }
        if (current.nonce.toNumber() === prevNonce + 1) {
          connection.removeAccountChangeListener(listener)
          const result = await parseResult(current)
          return resolve(result)
        }
      },
    )
  })
}
