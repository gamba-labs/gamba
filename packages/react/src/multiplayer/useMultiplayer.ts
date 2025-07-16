// packages/react/src/multiplayer/useMultiplayer.ts

import { useCallback } from 'react'
import { BN, AnchorProvider } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

import {
  joinGameIx,    type JoinGameParams,
  leaveGameIx,   type LeaveGameParams,
  createGameIx,  type CreateGameParams,
  distributeIx,  type DistributeNativeParams, type DistributeSplParams,
  selectWinnersIx, type SelectWinnersParams,
  gambaConfigIx,   type GambaConfigParams,
} from '@gamba-labs/multiplayer-sdk'

import { useGambaContext }    from '../GambaProvider'
import { useSendTransaction } from '../hooks/useSendTransaction'

export interface JoinOptions {
  gameAccount    : PublicKey
  mint           : PublicKey
  wager          : BN | number
  creatorAddress?: PublicKey
  creatorFeeBps? : number
  team?          : number
}

export interface LeaveOptions {
  gameAccount : PublicKey
  mint        : PublicKey
}

export type DistributeOptions =
  | DistributeNativeParams
  | DistributeSplParams

export interface CreateGameOptions {
  mint            : PublicKey
  maxPlayers      : number
  wager           : BN | number
  softDuration    : BN | number
  hardDuration?   : BN | number
  preAllocPlayers?: number
  numTeams?       : number
  winnersTarget?  : number
  wagerType?      : number
  payoutType?     : number
  creatorAddress?: PublicKey
}

export function useMultiplayer() {
  const { provider: gambaProvider } = useGambaContext()
  const sendTx = useSendTransaction()

  function getProvider(): AnchorProvider {
    if (!gambaProvider) throw new Error('Gamba provider unavailable')
    return gambaProvider.anchorProvider as AnchorProvider
  }

  const join = useCallback(async (opts: JoinOptions) => {
    const prov   = getProvider()
    const wallet = prov.wallet.publicKey
    const ix = await joinGameIx(prov, {
      creatorFeeBps : opts.creatorFeeBps ?? 0,
      wager         : opts.wager,
      team          : opts.team ?? 0,
      accounts      : {
        gameAccount    : opts.gameAccount,
        mint           : opts.mint,
        playerAccount  : wallet,
        creatorAddress : opts.creatorAddress ?? wallet,
      },
    } satisfies JoinGameParams)
    return sendTx([ix], { label: 'join-game' })
  }, [sendTx])

  const leave = useCallback(async (opts: LeaveOptions) => {
    const prov = getProvider()
    const ix = await leaveGameIx(prov, {
      accounts: {
        gameAccount   : opts.gameAccount,
        mint          : opts.mint,
        playerAccount : prov.wallet.publicKey,
      },
    } satisfies LeaveGameParams)
    return sendTx([ix], { label: 'leave-game' })
  }, [sendTx])

  const editBet = useCallback(async (opts: JoinOptions) => {
    const prov   = getProvider()
    const wallet = prov.wallet.publicKey

    const leaveIx = await leaveGameIx(prov, {
      accounts: {
        gameAccount   : opts.gameAccount,
        mint          : opts.mint,
        playerAccount : wallet,
      },
    } satisfies LeaveGameParams)

    const joinIx = await joinGameIx(prov, {
      creatorFeeBps : opts.creatorFeeBps ?? 0,
      wager         : opts.wager,
      team          : opts.team ?? 0,
      accounts      : {
        gameAccount    : opts.gameAccount,
        mint           : opts.mint,
        playerAccount  : wallet,
        creatorAddress : opts.creatorAddress ?? wallet,
      },
    } satisfies JoinGameParams)

    return sendTx([leaveIx, joinIx], { label: 'edit-bet' })
  }, [sendTx])

  const createGame = useCallback(async (opts: CreateGameOptions) => {
    const prov   = getProvider()
    const wallet = prov.wallet.publicKey

    const preAlloc = opts.preAllocPlayers ?? Math.min(10, opts.maxPlayers)
    const teams    = opts.numTeams       ?? 0
    const winners  = opts.winnersTarget  ?? 1
    const wType    = opts.wagerType      ?? 0
    const pType    = opts.payoutType     ?? 0

    const soft     = opts.softDuration
    const hard     = opts.hardDuration != null
      ? opts.hardDuration
      : (soft instanceof BN
         ? soft.mul(new BN(2))
         : (soft as number) * 2)

    const params: CreateGameParams = {
      preAllocPlayers: preAlloc,
      maxPlayers:      opts.maxPlayers,
      numTeams:        teams,
      winnersTarget:   winners,
      wagerType:       wType,
      payoutType:      pType,
      wager:           opts.wager,
      softDuration:    soft,
      hardDuration:    hard,
      accounts: {
        gameMaker: opts.creatorAddress ?? wallet,
        mint:      opts.mint,
      },
    }

    const ix = await createGameIx(prov, params)
    return sendTx([ix], { label: 'create-game' })
  }, [sendTx])

  const distribute = useCallback(async (p: DistributeOptions) => {
    const prov = getProvider()
    const ix   = await distributeIx(prov, p as any)
    return sendTx([ix], { label: 'distribute' })
  }, [sendTx])

  const selectWinners = useCallback(async (p: SelectWinnersParams) => {
    const prov = getProvider()
    const ix   = await selectWinnersIx(prov, p)
    return sendTx([ix], { label: 'select-winners' })
  }, [sendTx])

  const gambaConfig = useCallback(async (p: GambaConfigParams) => {
    const prov = getProvider()
    const ix   = await gambaConfigIx(prov, p)
    return sendTx([ix], { label: 'gamba-config' })
  }, [sendTx])

  return {
    join,
    leave,
    editBet,
    createGame,
    distribute,
    selectWinners,
    gambaConfig,
  }
}
