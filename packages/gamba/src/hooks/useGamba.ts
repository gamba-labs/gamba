import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { useAnchorProgram } from '../AnchorProvider'
import { BET_UNIT, SYSTEM_PROGRAM } from '../constants'
import { waitForClosed, waitForCreated, waitForResult } from '../events'
import { useGambaStore } from '../store'
import { GambaAccounts } from '../types'
import { randomSeed } from '../utils'

export type GambaState = ReturnType<typeof useGamba>
type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
type NoUndefinedAccount = NoUndefinedField<GambaAccounts>

const checkAccounts = (x: any): x is NoUndefinedAccount => !!x.wallet && !!x.house && !!x.user

interface PlayParams {
  deductFees?: boolean
}

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

  async function init() {
    if (!checkAccounts(accounts)) throw new Error('Accounts not initialized')

    const tx = await program.methods
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

    return {
      tx,
      result: waitForCreated(eventEmitter),
    }
  }

  async function play(gameConfigInput: number[], wager: number, params?: PlayParams) {
    if (!checkAccounts(accounts)) throw new Error('Accounts not initialized')

    const gameConfig = gameConfigInput.map((x) => x * BET_UNIT)
    const _wager = params?.deductFees ? Math.ceil(wager / (1 + house.fees.total)) : wager

    const tx = await program.methods
      .play(
        new PublicKey(config.creator),
        new BN(_wager),
        gameConfig,
        seed,
      )
      .accounts({
        user: accounts.user,
        owner: accounts.wallet,
        creator: config.creator,
        house: accounts.house,
      })
      .transaction()

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
    const tx = await program.methods
      .userWithdraw(new BN(amount))
      .accounts({
        user: accounts.user,
        owner: accounts.wallet,
      })
      .rpc()

    return {
      tx,
      result: async () => {
        const result = await program.provider.connection.confirmTransaction(tx, 'confirmed')
        if (result.value.err) {
          throw new Error(result.value.err.toString())
        }
        return { status: result.value }
      },
    }
  }

  async function close() {
    if (!checkAccounts(accounts)) throw new Error('Accounts not initialized')

    const tx = await program.methods
      .close()
      .accounts({
        user: accounts.user,
        house: accounts.house,
        owner: accounts.wallet,
      })
      .rpc()

    return {
      tx,
      result: () => waitForClosed(eventEmitter),
    }
  }

  return {
    /** */
    clientSeed: seed,
    /** */
    updateClientSeed: updateSeed,
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
