import { NATIVE_MINT, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
  GAMBA_STATE_SEED,
  GAME_SEED,
  PLAYER_SEED,
  POOL_ATA_SEED,
  POOL_BONUS_MINT_SEED,
  POOL_BONUS_UNDERLYING_TA_SEED,
  POOL_JACKPOT_SEED,
  POOL_LP_MINT_SEED,
  POOL_SEED,
  PROGRAM_ID,
} from './constants'

export const getPdaAddress = (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
  return address
}

export const getPoolAddress = (underlyingMint: PublicKey, authority = new PublicKey('11111111111111111111111111111111')) =>
  getPdaAddress(
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
