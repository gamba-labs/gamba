import * as anchor from '@coral-xyz/anchor'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AddressLookupTableProgram, ConfirmOptions, Connection, Keypair, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js'
import { PROGRAM_ID } from './constants'
import { Gamba as GambaIdl, IDL } from './idl'
import { GambaProviderWallet } from './types'
import { basisPoints, getGambaStateAddress, getGameAddress, getPlayerAddress, getPoolAddress, getPoolBonusAddress, getPoolLpAddress, getPoolUnderlyingTokenAccountAddress } from './utils'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

export class GambaProvider {
  gambaProgram: anchor.Program<GambaIdl>
  anchorProvider: anchor.AnchorProvider
  wallet: GambaProviderWallet

  constructor(
    connection: Connection,
    walletOrKeypair: GambaProviderWallet | Keypair,
    opts: ConfirmOptions = anchor.AnchorProvider.defaultOptions(),
  ) {
    const wallet = walletOrKeypair instanceof Keypair ? new NodeWallet(walletOrKeypair) : walletOrKeypair

    this.anchorProvider = new anchor.AnchorProvider(
      connection,
      wallet,
      opts,
    )
    this.gambaProgram = new anchor.Program(IDL, PROGRAM_ID, this.anchorProvider)
    this.wallet = wallet
  }

  static fromAnchorProvider(
    provider: anchor.AnchorProvider,
  ) {
    const gambaProvider = new GambaProvider(
      provider.connection,
      provider.wallet,
      provider.opts,
    )
    return gambaProvider
  }

  get user() {
    return this.wallet.publicKey
  }

  /**
   * Creates a pool for the specified token with address lookup table
   * @param underlyingTokenMint The token to use for the pool
   * @param authority The authority for the pool
   * @param slot The slot to use for the lookup table instruction
   * @returns Multiple TransactionInstruction in an array
   */
  createPool(underlyingTokenMint: PublicKey, authority: PublicKey, slot: number) {
    const gambaStateAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      getGambaStateAddress(),
      true,
    )
    const METADATA_SEED = 'metadata'
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const pool = getPoolAddress(underlyingTokenMint, authority)
    const lpMint = getPoolLpAddress(pool)
    const bonusMint = getPoolBonusAddress(pool)
    const poolUnderlyingTokenAccount = getPoolUnderlyingTokenAccountAddress(pool)
    const [poolBonusUnderlyingTokenAccount] = PublicKey.findProgramAddressSync([Buffer.from('POOL_BONUS_UNDERLYING_TA'), pool.toBuffer()], PROGRAM_ID)
    const [lpMintMetadata] = PublicKey.findProgramAddressSync([Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), lpMint.toBuffer()], TOKEN_METADATA_PROGRAM_ID)
    const [bonusMintMetadata] = PublicKey.findProgramAddressSync([Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), bonusMint.toBuffer()], TOKEN_METADATA_PROGRAM_ID)

    //more addresses for lookup table
    const gamba_state = getGambaStateAddress()
    const poolJackpotTokenAccount = PublicKey.findProgramAddressSync([Buffer.from('POOL_JACKPOT'), pool.toBuffer()], PROGRAM_ID)[0]

    const [lookupTableInst, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
      authority: this.wallet.publicKey,
      payer: this.wallet.publicKey,
      recentSlot: slot - 1,
    })

    const addAddressesInstruction = AddressLookupTableProgram.extendLookupTable({
      payer: this.wallet.publicKey,
      authority: this.wallet.publicKey,
      lookupTable: lookupTableAddress,
      addresses: [
        pool,
        underlyingTokenMint,
        poolUnderlyingTokenAccount,
        poolBonusUnderlyingTokenAccount,
        gamba_state,
        gambaStateAta,
        bonusMint,
        poolJackpotTokenAccount,
      ],
    })

    const freezeInstruction = AddressLookupTableProgram.freezeLookupTable({
      authority: this.wallet.publicKey,
      lookupTable: lookupTableAddress,
    })

    const createPoolInstruction = this.gambaProgram.methods
      .poolInitialize(authority, lookupTableAddress)
      .accounts({
        initializer: this.wallet.publicKey,
        gambaState: getGambaStateAddress(),
        underlyingTokenMint: underlyingTokenMint,
        pool,
        poolUnderlyingTokenAccount,
        poolBonusUnderlyingTokenAccount,
        gambaStateAta,
        lpMint,
        lpMintMetadata,
        bonusMint,
        bonusMintMetadata,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .instruction()

    return [lookupTableInst, addAddressesInstruction, freezeInstruction, createPoolInstruction]
  }

  /**
   *
   * @param pool The pool to deposit to
   * @param underlyingTokenMint Token to deposit (Has to be the same as pool.underlyingTokenMint)
   * @param amount Amount of tokens to deposit
   */
  depositToPool(
    pool: PublicKey,
    underlyingTokenMint: PublicKey,
    amount: bigint | number,
  ) {
    const poolUnderlyingTokenAccount = getPoolUnderlyingTokenAccountAddress(pool)
    const poolLpMint = getPoolLpAddress(pool)

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.wallet.publicKey,
    )

    const userLpAta = getAssociatedTokenAddressSync(
      poolLpMint,
      this.wallet.publicKey,
    )

    return this.gambaProgram.methods
      .poolDeposit(new anchor.BN(amount))
      .accounts({
        pool,
        underlyingTokenMint,
        poolUnderlyingTokenAccount,
        userUnderlyingAta,
        userLpAta,
      })
      .instruction()
  }

  /**
   *
   * @param pool The pool to withdraw from
   * @param underlyingTokenMint Token to withdraw (Has to be the same as pool.underlyingTokenMint)
   * @param amount Amount of tokens to withdraw
   */
  withdrawFromPool(
    pool: PublicKey,
    underlyingTokenMint: PublicKey,
    amount: bigint | number,
  ) {
    const poolUnderlyingTokenAccount = getPoolUnderlyingTokenAccountAddress(pool)
    const poolLpMint = getPoolLpAddress(pool)

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.wallet.publicKey,
    )

    const userLpAta = getAssociatedTokenAddressSync(
      poolLpMint,
      this.wallet.publicKey,
    )

    return this.gambaProgram.methods
      .poolWithdraw(new anchor.BN(amount))
      .accounts({
        pool,
        underlyingTokenMint,
        poolUnderlyingTokenAccount,
        userUnderlyingAta,
        userLpAta,
      })
      .instruction()
  }

  /**
   * Mints bonus tokens that can be used as free plays in the pool
   * @param pool Pool to mint bonus tokens for
   * @param underlyingTokenMint Token to mint bonus tokens for (Has to be equal to pool.underlyingTokenMint)
   * @param amount Amount of bonus tokens to mint
   */
  mintBonusTokens(
    pool: PublicKey,
    underlyingTokenMint: PublicKey,
    amount: bigint | number,
  ) {
    const poolBonusMint = getPoolBonusAddress(pool)

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.wallet.publicKey,
    )

    const userBonusAta = getAssociatedTokenAddressSync(
      poolBonusMint,
      this.wallet.publicKey,
    )

    return this.gambaProgram.methods
      .poolMintBonusTokens(new anchor.BN(amount))
      .accounts({
        pool,
        user: this.wallet.publicKey,
        underlyingTokenMint,
        userUnderlyingAta,
        userBonusAta,
      })
      .instruction()
  }

  /**
   * Initializes an associated Player account for the connected wallet
   */
  createPlayer() {
    return this.gambaProgram.methods
      .playerInitialize()
      .accounts({})
      .instruction()
  }

  /**
   * Closes the associated Player account for the connected wallet
   */
  closePlayer() {
    const gameAddress = getGameAddress(this.user)
    return this.gambaProgram.methods
      .playerClose()
      .accounts({ game: gameAddress })
      .instruction()
  }

  play(
    wager: number,
    bet: number[],
    clientSeed: string,
    pool: PublicKey,
    underlyingTokenMint: PublicKey,
    creator: PublicKey,
    creatorFee: number,
    jackpotFee: number,
    metadata: string,
    useBonus: boolean,
  ) {
    const player = getPlayerAddress(this.user)

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.user,
    )

    const creatorAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      creator,
    )

    const playerAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      player,
      true,
    )

    const bonusMint = getPoolBonusAddress(pool)
    const userBonusAta = getAssociatedTokenAddressSync(
      bonusMint,
      this.user,
    )

    const playerBonusAta = getAssociatedTokenAddressSync(
      bonusMint,
      getPlayerAddress(this.user),
      true,
    )

    return this.gambaProgram.methods
      .playGame(
        new anchor.BN(wager),
        bet.map(basisPoints),
        clientSeed,
        basisPoints(creatorFee),
        basisPoints(jackpotFee),
        metadata,
      )
      .accounts({
        pool,
        userUnderlyingAta,
        underlyingTokenMint,
        creator,
        creatorAta,
        playerAta,
        playerBonusAta: useBonus ? playerBonusAta : null,
        userBonusAta: useBonus ? userBonusAta : null,
      })
      .instruction()
  }
}
