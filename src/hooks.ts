import { BorshAccountsCoder } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { BN } from 'bn.js'
import { Buffer } from 'buffer'
import { useEffect, useRef } from 'react'
import { useAnchorProgram } from './AnchorProvider'
import { BET_UNIT, SYSTEM_PROGRAM } from './constants'
import { useGambaStore } from './store'
import { Game, GameResult } from './types'
import { getEnum, randomSeed } from './utils'

export type GambaState = ReturnType<typeof useGamba>

type PopulatedGame = Game & {
  status: string
  active: boolean
  loading: boolean
}

export function useFetchState() {
  const program = useAnchorProgram()
  const { connection } = useConnection()
  const set = useGambaStore((state) => state.set)
  const game = useGambaStore((state) => state.game)
  return async () => {
    console.debug('🍤 Fetching state', game.address.toBase58())
    try {
      const account = await connection.getAccountInfo(game.address)
      if (!account) {
        throw new Error('State not found')
      }
      const state = new BorshAccountsCoder(program.idl).decode('Game', account.data)
      console.debug('🍤 Fetched state ', account.lamports, state)
      set((store) => ({
        game: {
          ...store.game,
          created: true,
          balance: state?.balance?.toNumber() ?? 0,
          _accountBalance: account.lamports,
          state,
        },
      }))
    } catch (err) {
      console.warn('🍤 Error fetching state', err)
      set((store) => ({
        game: {
          ...store.game,
          created: false,
          balance: 0,
          _accountBalance: 0,
          state: null,
        },
      }))
    }
  }
}

interface UseGambaResultConfig {
  all?: boolean
}

/**
 *
 * @param cb Callback function that will fire for every GameResult
 * @param config
 */
export function useGambaResult(cb: (result: GameResult) => void, config: UseGambaResultConfig = {}) {
  const player = useGambaStore((store) => store.player)
  const eventEmitter = useGambaStore((state) => state.eventEmitter)
  useEffect(() => {
    const handler = (result: GameResult) => {
      if (config.all || player.address?.equals(result.player)) {
        cb(result)
      }
    }
    eventEmitter.on('gameSettled', handler)
    return () => {
      eventEmitter.off('gameSettled', handler)
    }
  }, [config])
}

export function useGamba() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const program = useAnchorProgram()
  const recentBets = useGambaStore((store) => store.recentBets)
  const set = useGambaStore((store) => store.set)
  const _game = useGambaStore((store) => store.game)
  const playRequested = useGambaStore((store) => store.playRequested)
  const status = _game.state ? getEnum(_game.state.status) : 'none'
  const gameLoading = !!playRequested || status === 'seedRequested' || status === 'hashedSeedRequested'
  const game: PopulatedGame = {
    ..._game,
    status,
    active: status === 'none' || status === 'idle' || status === 'playing',
    loading: gameLoading
  }
  const player = useGambaStore((store) => store.player)
  const house = useGambaStore((store) => store.house)
  const seed = useGambaStore((state) => state.seed)
  const config = useGambaStore((state) => state.config)
  const queuedPlay = useRef<{gameConfigInput: number[], wager: number, seed: string}>()

  // useEffect(() => {
  //   if (playRequested) {
  //     const listener = program.provider.connection.onSignature(playRequested, (e) => {
  //       console.debug('🍤 Signature', e)
  //       setPlayRequested(undefined)
  //     }, 'processed')

  //     return () => {
  //       program.provider.connection.removeSignatureListener(listener)
  //     }
  //   }
  // }, [playRequested])

  const _init = () =>
    program.methods
      .initialize(
        player.address,
      )
      .accounts({
        game: game.address,
        house: house.address,
        player: player.address,
        systemProgram: SYSTEM_PROGRAM,
      })
      .remainingAccounts([
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      ])

  useEffect(() => {
    if (queuedPlay.current) {
      const {gameConfigInput, wager, seed} = queuedPlay.current
      if (game.status === 'playing') {
        queuedPlay.current = undefined
        play(gameConfigInput, wager, seed)
          .catch(() => {
            queuedPlay.current = {gameConfigInput, wager, seed}
          })
      }
    }
  }, [game, player, status, playRequested])

  const _play = (
    gameConfig: number[],
    wager: number,
    seed: string,
  ) => {
    const txId = program.methods
      .play(
        new PublicKey(config.creator),
        new BN(wager),
        gameConfig,
        Buffer.from(seed),
      )
      .accounts({
        game: game.address,
        player: player.address,
        creator: config.creator,
        house: house.address,
      })
    return txId
  }

  const _withdraw = (amount: number) =>
    program.methods
      .withdraw(new BN(amount))
      .accounts({
        game: game.address,
        player: player.address,
        creator: config.creator,
        house: house.address,
      })

  /**
   * Creates a Gamba account for the connected user
   * @returns txId
   */
  async function init() {
    if (!player) return
    return _init().rpc()
  }

  /**
   * Play a game
   * @param gameConfig List of potential payouts the user can receive. 2 = 2x
   * @param wager Bet size in Lamports
   * @returns signature
   */
  async function play(gameConfigInput: number[], wager: number, _seed = seed) {
    try {
      if (!player) return
      if (!game.created) {
        await _init().rpc()
      }
      const gameConfig = gameConfigInput.map((x) => x * BET_UNIT)
      if (game.status !== 'playing') {
        queuedPlay.current = {gameConfigInput, wager, seed: _seed}
        return
      }

      const tx = await _play(
        gameConfig,
        wager,
        seed,
      ).transaction()

      const signature = await wallet.sendTransaction(tx, program.provider.connection)

      set({playRequested: signature})

      console.debug('🍤 Tx sent', signature)

      // Update seed
      set({seed: randomSeed()})

      return signature
    } catch (err) {
      console.warn('🍤 play', err)
    }
  }

  /**
   * Withdraw funds from the game account
   * @param amount Amount to withdraw in lamports. Leave empty to withdraw all funds
   * @returns txId
   */
  async function withdraw(amount?: number) {
    if (!player) return
    return _withdraw(amount || game.balance).rpc()
  }

  /**
   * Close the account associated with the connected user
   * @returns txId
   */
  async function close() {
    if (!player) return
    return program.methods
      .close()
      .accounts({
        game: game.address,
        house: house.address,
        player: player.address,
        creator: config.creator,
      })
      .rpc()
  }

  // Remove duplicates
  const filteredRecentBets = recentBets.filter((a, i, arr) => {
    const key = (x: GameResult) => x.player.toBase58() + '-' + x.nonce
    return arr.findIndex((b) => key(b) === key(a)) === i
  })

  return {
    connection: program.provider.connection,
    config,
    connect: () => walletModal.setVisible(true),
    disconnect: () => wallet.disconnect(),
    wallet,
    init,
    play,
    close,
    withdraw,
    game,
    player,
    house,
    recentBets: filteredRecentBets,
    waitingForResult: !!playRequested || status === 'hashedSeedRequested',
  }
}
