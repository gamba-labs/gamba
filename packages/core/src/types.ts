import { IdlAccounts, IdlEvents } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { Keypair } from '@solana/web3.js'
import { Gamba as GambaIdl } from './idl'

export type GambaEventType = 'GameSettled' | 'PoolChange'

export type GambaEvent<T extends GambaEventType> = {name: string, data: IdlEvents<GambaIdl>[T]}

export type AnyGambaEvent = GambaEvent<'GameSettled'> | GambaEvent<'PoolChange'>

export type GambaState = IdlAccounts<GambaIdl>['GambaState']
export type PlayerState = IdlAccounts<GambaIdl>['Player']
export type GameState = IdlAccounts<GambaIdl>['Game']
export type PoolState = IdlAccounts<GambaIdl>['Pool']
export type GambaProviderWallet = Omit<NodeWallet, 'payer'> & {payer?: Keypair}
