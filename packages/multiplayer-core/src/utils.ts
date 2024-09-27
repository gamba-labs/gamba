import { BorshAccountsCoder, IdlAccounts, IdlTypes, BN } from '@coral-xyz/anchor'
import { NATIVE_MINT, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { IDL, Multiplayer } from './idl'
import { MULTIPLAYER_PROGRAM_ID, GAMBA_STATE_SEED, GAME_SEED } from './constants'

// Define types for GameState and WagerType using IdlTypes
type GameState = IdlTypes<Multiplayer>['GameState']
type WagerType = IdlTypes<Multiplayer>['WagerType']

// Initialize the accounts coder with the IDL
const accountsCoder = new BorshAccountsCoder(IDL)

// Function to decode an account of a given type
const decodeAccount = <T>(accountName: string, info: AccountInfo<Buffer> | null): T | null => {
  if (!info?.data?.length) return null
  return accountsCoder.decode<T>(accountName, info.data)
}

// Define the types of accounts in your IDL
type MultiplayerAccounts = IdlAccounts<Multiplayer>

// Create a decoder function for a specific account type
const makeDecoder = <N extends keyof MultiplayerAccounts>(accountName: N) => {
  return (info: AccountInfo<Buffer> | null): MultiplayerAccounts[N] | null => {
    return decodeAccount<MultiplayerAccounts[N]>(accountName, info)
  }
}

// Export decoders for 'game' and 'gambaState' accounts
export const decodeGame = makeDecoder('game')
export const decodeGambaState = makeDecoder('gambaState')

// Basis points per whole unit (used for percentage calculations)
export const BPS_PER_WHOLE = 10_000

// Function to calculate basis points from a percentage
export const basisPoints = (percent: number) => {
  return Math.round(percent * BPS_PER_WHOLE)
}

// Function to find a program-derived address (PDA) given seeds
export const getPdaAddress = (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, MULTIPLAYER_PROGRAM_ID)
  return address
}

// Function to get the Gamba state account address
export const getGambaStateAddress = () => getPdaAddress(
  Buffer.from(GAMBA_STATE_SEED),
)

// Function to get the game account address given a game ID buffer
export const getGameAddress = (gameIdBuffer: Buffer) => getPdaAddress(
  Buffer.from(GAME_SEED),
  gameIdBuffer,
)

// Function to get the game token account address
export const getGameTokenAccountAddress = (gameAccount: PublicKey) => getPdaAddress(
  gameAccount.toBuffer(),
)

// Function to get the associated token account (ATA) for a user and mint
export const getUserAta = (user: PublicKey, mint: PublicKey) =>
  getAssociatedTokenAddressSync(
    mint,
    user,
  )

// Function to check if a given public key is the native SOL mint
export const isNativeMint = (pubkey: PublicKey) => NATIVE_MINT.equals(pubkey)

// Function to format a public key as a shortened string
export function formatPublicKey(publicKey: PublicKey) {
  return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
}

// Function to parse the GameState enum into a string
export function parseGameState(state: GameState): string {
  if ('waiting' in state) {
    return 'Waiting'
  } else if ('playing' in state) {
    return 'Playing'
  } else if ('settled' in state) {
    return 'Settled'
  } else {
    return 'Unknown'
  }
}

// Function to parse the WagerType enum into a string
export function parseWagerType(wagerType: WagerType): string {
  if ('sameWager' in wagerType) {
    return 'SameWager'
  } else if ('customWager' in wagerType) {
    return 'CustomWager'
  } else {
    return 'Unknown'
  }
}
