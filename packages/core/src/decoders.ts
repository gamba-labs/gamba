import { BorshAccountsCoder, IdlAccounts } from '@coral-xyz/anchor'
import { AccountLayout } from '@solana/spl-token'
import { AccountInfo } from '@solana/web3.js'
import type { GambaIdl } from '.'
import { IDL } from './idl'

const accountsCoder = new BorshAccountsCoder(IDL)

/** Decode any account by its Anchor name, returning `T | null` */
const decodeAccount = <T>(
  accountName: string,
  info: AccountInfo<Buffer> | null,
): T | null => {
  if (!info?.data?.length) return null
  return accountsCoder.decode<T>(accountName, info.data)
}

/** Standard SPL‐Token ATA decoder */
export const decodeAta = (acc: AccountInfo<Buffer> | null) => {
  if (!acc) return null
  return AccountLayout.decode(acc.data)
}

type GambaAccounts = IdlAccounts<GambaIdl>

/**
 * Build a typed decoder for a given account in your IDL.
 * **⚠️ Make sure the string here matches the `accounts[].name` in your IDL exactly!**
 */
const makeDecoder = <N extends Extract<keyof GambaAccounts, string>>(accountName: N) => {
  return (info: AccountInfo<Buffer> | null): GambaAccounts[N] | null => {
    return decodeAccount<GambaAccounts[N]>(accountName, info)
  }
}

// ─── THESE NAMES MUST MATCH YOUR IDL ACCOUNTS[].name ──────────────────────────
export const decodePlayer     = makeDecoder('Player')
export const decodeGame       = makeDecoder('Game')
export const decodePool       = makeDecoder('Pool')
export const decodeGambaState = makeDecoder('GambaState')
