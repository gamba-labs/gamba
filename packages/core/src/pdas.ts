import { NATIVE_MINT, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { utils } from '@coral-xyz/anchor'
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

const encode = utils.bytes.utf8.encode

/**
 * Derive a PDA given a list of UTF-8 seed byte arrays.
 */
export const getPdaAddress = (...seeds: Uint8Array[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
  return address
}

/** Pool PDA: [ "pool", underlyingMint, authority ] */
export const getPoolAddress = (
  underlyingMint: PublicKey,
  authority = new PublicKey('11111111111111111111111111111111'),
) =>
  getPdaAddress(
    encode(POOL_SEED),
    underlyingMint.toBytes(),
    authority.toBytes(),
  )

/** Gamba state PDA: [ "gamba_state" ] */
export const getGambaStateAddress = () =>
  getPdaAddress(
    encode(GAMBA_STATE_SEED),
  )

/** Player PDA: [ "player", owner ] */
export const getPlayerAddress = (owner: PublicKey) =>
  getPdaAddress(
    encode(PLAYER_SEED),
    owner.toBytes(),
  )

/** Game PDA: [ "game", owner ] */
export const getGameAddress = (owner: PublicKey) =>
  getPdaAddress(
    encode(GAME_SEED),
    owner.toBytes(),
  )

/** LP-mint PDA: [ "pool_lp_mint", pool ] */
export const getPoolLpAddress = (pool: PublicKey) =>
  getPdaAddress(
    encode(POOL_LP_MINT_SEED),
    pool.toBytes(),
  )

/** Bonus-mint PDA: [ "pool_bonus_mint", pool ] */
export const getPoolBonusAddress = (pool: PublicKey) =>
  getPdaAddress(
    encode(POOL_BONUS_MINT_SEED),
    pool.toBytes(),
  )

/** Underlying-token-account PDA: [ "pool_ata", pool ] */
export const getPoolUnderlyingTokenAccountAddress = (pool: PublicKey) =>
  getPdaAddress(
    encode(POOL_ATA_SEED),
    pool.toBytes(),
  )

/** Jackpot-token-account PDA: [ "pool_jackpot", pool ] */
export const getPoolJackpotTokenAccountAddress = (pool: PublicKey) =>
  getPdaAddress(
    encode(POOL_JACKPOT_SEED),
    pool.toBytes(),
  )

/** Bonus-underlying-token-account PDA: [ "pool_bonus_underlying_ta", pool ] */
export const getPoolBonusUnderlyingTokenAccountAddress = (pool: PublicKey) =>
  getPdaAddress(
    encode(POOL_BONUS_UNDERLYING_TA_SEED),
    pool.toBytes(),
  )

/** User ATA for any mint */
export const getUserUnderlyingAta = (
  user: PublicKey,
  underlyingTokenMint: PublicKey,
) =>
  getAssociatedTokenAddressSync(
    underlyingTokenMint,
    user,
  )

/** Player ATA for underlying mint */
export const getPlayerUnderlyingAta = (
  user: PublicKey,
  underlyingTokenMint: PublicKey,
) =>
  getAssociatedTokenAddressSync(
    underlyingTokenMint,
    getPlayerAddress(user),
    true,
  )

/** User bonus ATA for pool */
export const getUserBonusAtaForPool = (
  user: PublicKey,
  pool: PublicKey,
) =>
  getAssociatedTokenAddressSync(
    getPoolBonusAddress(pool),
    user,
  )

/** User LP ATA for pool */
export const getUserLpAtaForPool = (
  user: PublicKey,
  pool: PublicKey,
) =>
  getAssociatedTokenAddressSync(
    getPoolLpAddress(pool),
    user,
  )

/** Player bonus ATA for pool */
export const getPlayerBonusAtaForPool = (
  user: PublicKey,
  pool: PublicKey,
) =>
  getAssociatedTokenAddressSync(
    getPoolBonusAddress(pool),
    getPlayerAddress(user),
    true,
  )

/** Native SOL wrapped ATA */
export const getUserWsolAccount = (user: PublicKey) =>
  getAssociatedTokenAddressSync(
    NATIVE_MINT,
    user,
    true,
  )
