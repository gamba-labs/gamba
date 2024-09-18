import { BorshAccountsCoder, IdlAccounts } from '@coral-xyz/anchor'
import { NATIVE_MINT, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { MultiplayerIdl, GameState } from '.'
import { MULTIPLAYER_PROGRAM_ID, GAMBA_STATE_SEED, GAME_SEED } from './constants'
import { IDL } from './idl'


const accountsCoder = new BorshAccountsCoder(IDL)

const decodeAccount = <T>(accountName: string, info: AccountInfo<Buffer> | null) => {
  if (!info?.data?.length) return null
  return accountsCoder.decode<T>(accountName, info.data)
}

type MultiplayerAccounts = IdlAccounts<MultiplayerIdl>

const makeDecoder = <N extends keyof MultiplayerAccounts>(accountName: N) => {
  return (info: AccountInfo<Buffer> | null) => {
    return decodeAccount<MultiplayerAccounts[N]>(accountName, info) as MultiplayerAccounts[N] | null
  }
}

export const decodeGame = makeDecoder('game')
export const decodeGambaState = makeDecoder('gambaState')

export const BPS_PER_WHOLE = 10_000

export const basisPoints = (percent: number) => {
  return Math.round(percent * BPS_PER_WHOLE)
}

export const getPdaAddress = (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, MULTIPLAYER_PROGRAM_ID)
  return address
}

export const getGambaStateAddress = () => getPdaAddress(
  Buffer.from(GAMBA_STATE_SEED),
)

export const getGameAddress = (gameIdBuffer: Buffer) => getPdaAddress(
  Buffer.from(GAME_SEED),
  gameIdBuffer,
)

export const getGameTokenAccountAddress = (gameAccount: PublicKey) => getPdaAddress(
  gameAccount.toBuffer(),
)

export const getUserAta = (user: PublicKey, mint: PublicKey) =>
  getAssociatedTokenAddressSync(
    mint,
    user,
  )

export const isNativeMint = (pubkey: PublicKey) => NATIVE_MINT.equals(pubkey)

export function formatPublicKey(publicKey: PublicKey) {
  return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
}

export function parseGameState(state: GameState) {
  switch (state) {
    case 0:
      return 'Waiting'
    case 1:
      return 'Playing'
    default:
      return 'Unknown'
  }
}

export function parseWagerType(wagerType: number) {
  switch (wagerType) {
    case 0:
      return 'SameWager'
    case 1:
      return 'CustomWager'
    default:
      return 'Unknown'
  }
}

