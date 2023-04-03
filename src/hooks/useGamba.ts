import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useAnchorProgram } from '../AnchorProvider'
import { BET_UNIT, SYSTEM_PROGRAM } from '../constants'
import { GambaEventEmitter } from '../events'
import { useGambaStore } from '../store'
import { GambaAccounts, GameResult } from '../types'
import { getGameResult, randomSeed } from '../utils'

export type GambaState = ReturnType<typeof useGamba>
type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
type NoUndefinedAccount = NoUndefinedField<GambaAccounts>

const checkAccounts = (x: any): x is NoUndefinedAccount => {
  return !!x.wallet && !!x.house && !!x.user
}

const waitForResult = (eventEmitter: GambaEventEmitter) => new Promise<GameResult>((resolve, reject) => {
  eventEmitter.on('userAccountChanged', function changeListener(game, previousGame) {
    const off = () => eventEmitter.off('userAccountChanged', changeListener)
    if (!game.created) {
      off()
      reject('ACCOUNT_CLOSED')
    }
    if (previousGame?.state?.status.hashedSeedRequested) {
      if (game.state?.status.playing) {
        // Game status went from hashedSeedRequested to playing
        // We can now derive a result
        const result = getGameResult(previousGame.state, game.state)
        off()
        resolve(result)
      } else if (!game.state?.status.hashedSeedRequested) {
        //
        off()
        reject('UNEXPECTED_STATE_CHANGE')
      }
    }
  })
})

export function useGamba() {
  const web3Wallet = useWallet()
  const walletModal = useWalletModal()
  const program = useAnchorProgram()
  const recentGames = useGambaStore((store) => store.recentGames)
  const house = useGambaStore((store) => store.house)
  const set = useGambaStore((store) => store.set)
  const user = useGambaStore((store) => store.user)
  const accounts = useGambaStore((store) => store.accounts)
  const wallet = useGambaStore((store) => store.wallet)
  const seed = useGambaStore((state) => state.seed)
  const config = useGambaStore((state) => state.config)
  const eventEmitter = useGambaStore((state) => state.eventEmitter)

  const updateSeed = () => set({ seed: randomSeed() })

  const _play = (
    gameConfig: number[],
    wager: number,
    seed: string,
  ) => {
    if (!checkAccounts(accounts)) throw new Error('Accounts not initialized')
    return program.methods
      .play(
        new PublicKey(config.creator),
        new BN(wager),
        gameConfig,
        seed,
      )
      .accounts({
        user: accounts.user,
        owner: accounts.wallet,
        creator: config.creator,
        house: accounts.house,
      })
  }

  async function init() {
    if (!checkAccounts(accounts)) throw new Error('Accounts not initialized')
    return program.methods
      .initializeUser(
        accounts.wallet,
      )
      .accounts({
        user: accounts.user,
        owner: accounts.wallet,
        systemProgram: SYSTEM_PROGRAM,
      })
      .remainingAccounts([
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      ])
      .rpc()
  }

  async function play(gameConfigInput: number[], wager: number) {
    const gameConfig = gameConfigInput.map((x) => x * BET_UNIT)

    const tx = await _play(
      gameConfig,
      wager,
      seed,
    ).transaction()

    const signature = await web3Wallet.sendTransaction(tx, program.provider.connection)

    return {
      signature,
      result: async () => {
        const result = await waitForResult(eventEmitter)
        // Automatically update seed
        updateSeed()
        return result
      },
    }
  }

  async function withdraw(_amount?: number) {
    const amount = _amount ?? user.balance
    if (!checkAccounts(accounts)) throw new Error('Accounts not initialized')
    return program.methods
      .userWithdraw(new BN(amount))
      .accounts({
        user: accounts.user,
        owner: accounts.wallet,
      })
      .rpc()
  }

  async function close() {
    if (!checkAccounts(accounts)) throw new Error('Accounts not initialized')
    return program.methods
      .close()
      .accounts({
        user: accounts.user,
        house: accounts.house,
        owner: accounts.wallet,
        // creator: config.creator,
      })
      .rpc()
  }

  return {
    /**
     * The web3 connection
     */
    web3Connection: program.provider.connection,
    /**
     * The connected web3 wallet
     */
    web3Wallet,
    /**
     * The config of the Gamba app. Should reflect the props passed to the <Gamba /> component
     */
    config,
    /**
     * Opens the modal to select wallet
     */
    connect: () => walletModal.setVisible(true),
    /**
     * Disconnects the connected wallet
     */
    disconnect: () => web3Wallet.disconnect(),
    /**
     * If the user has connected their wallet
     */
    connected: web3Wallet.connected,
    /**
     * Creates a Gamba account for the connected user
     * @returns txId
     */
    init,
    /**
     * Play a game
     * @param gameConfig List of potential payouts the user can receive. 2 = 2x
     * @param wager Bet size in Lamports
     * @returns A response object containing `result` and `signature`.
     */
    play,
    /**
     * Close the account associated with the connected user
     * @returns txId
     */
    close,
    /**
     * Withdraw funds from the game account
     * @param amount Amount to withdraw in lamports. Leave empty to withdraw all funds
     * @returns txId
     */
    withdraw,
    /**
     * The Gamba House account
     */
    house,
    /**
     * The Gamba User account for the connected wallet
     */
    user,
    /**
     * The connected wallet.
     */
    wallet,
    /**
     * A list of recent games played on Gamba
     */
    recentGames,
    /**
     * Various Account addresses
     */
    accounts,
  }
}
