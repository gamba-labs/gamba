import { IdlAccounts, IdlEvents } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { Keypair } from '@solana/web3.js'
import { Multiplayer as MultiplayerIdl } from './idl'

export type MultiplayerEventType = 'GameCreated' | 'PlayerJoined' | 'PlayerLeft' | 'GameSettled';

export type MultiplayerEvent<T extends MultiplayerEventType> = { name: string, data: IdlEvents<MultiplayerIdl>[T] };

export type AnyMultiplayerEvent = MultiplayerEvent<'GameCreated'> | MultiplayerEvent<'PlayerJoined'> | MultiplayerEvent<'PlayerLeft'> | MultiplayerEvent<'GameSettled'>;

export type MultiplayerState = IdlAccounts<MultiplayerIdl>['gambaState'];
export type GameState = IdlAccounts<MultiplayerIdl>['game'];
export type MultiplayerProviderWallet = Omit<NodeWallet, 'payer'> & { payer?: Keypair };
