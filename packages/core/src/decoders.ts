import { BorshAccountsCoder, IdlAccounts } from '@coral-xyz/anchor'
import { AccountLayout } from '@solana/spl-token'
import { AccountInfo } from '@solana/web3.js'
import { GambaIdl } from '.'
import { IDL } from './idl'

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
