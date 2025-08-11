import { BorshAccountsCoder, IdlAccounts } from '@coral-xyz/anchor'
import { AccountLayout } from '@solana/spl-token'
import type { AccountInfo } from '@solana/web3.js'
import type { GambaIdl } from '.'
import { IDL } from './idl'

const accountsCoder = new BorshAccountsCoder(IDL)

/** Decode any account by its Anchor name, returning `T | null` */
function decodeAccount<T>(
  accountName: string,
  info: AccountInfo<Buffer> | null,
): T | null {
  if (!info?.data?.length) return null
  return accountsCoder.decode<T>(accountName, info.data)
}

/** Standard SPL‐Token ATA decoder */
export function decodeAta(
  acc: AccountInfo<Buffer> | null
): ReturnType<typeof AccountLayout.decode> | null {
  if (!acc) return null
  return AccountLayout.decode(acc.data)
}

type GambaAccounts = IdlAccounts<GambaIdl>

/** Factory for a strongly-typed Anchor account decoder */
function makeDecoder<
  N extends Extract<keyof GambaAccounts, string>
>(
  accountName: N
): (info: AccountInfo<Buffer> | null) => GambaAccounts[N] | null {
  return (info) => decodeAccount<GambaAccounts[N]>(accountName, info)
}

// ─── THESE NAMES MUST MATCH YOUR IDL ACCOUNTS[].name ──────────────────────────
export const decodePlayer: (
  info: AccountInfo<Buffer> | null
) => GambaAccounts['Player'] | null =
  makeDecoder('Player')

export const decodeGame: (
  info: AccountInfo<Buffer> | null
) => GambaAccounts['Game'] | null =
  makeDecoder('Game')

export const decodePool: (
  info: AccountInfo<Buffer> | null
) => GambaAccounts['Pool'] | null =
  makeDecoder('Pool')

export const decodeGambaState: (
  info: AccountInfo<Buffer> | null
) => GambaAccounts['GambaState'] | null =
  makeDecoder('GambaState')
