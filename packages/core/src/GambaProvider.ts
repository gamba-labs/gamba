import * as anchor from '@coral-xyz/anchor'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { ConfirmOptions, Connection, PublicKey } from '@solana/web3.js'
import { PROGRAM_ID } from './constants'
import { Gamba as GambaIdl, IDL } from './idl'
import { GambaProviderWallet } from './types'
import { basisPoints, getGambaStateAddress, getGameAddress, getPlayerAddress, getPoolAddress, getPoolBonusAddress, getPoolLpAddress, getPoolUnderlyingTokenAccountAddress } from './utils'

export class GambaProvider {
  gambaProgram: anchor.Program<GambaIdl>
  anchorProvider: anchor.AnchorProvider
  wallet: GambaProviderWallet

  constructor(
    connection: Connection,
    wallet: GambaProviderWallet,
    opts: ConfirmOptions = anchor.AnchorProvider.defaultOptions(),
  ) {
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
   * Creates a pool for the specified token
   * @param underlyingTokenMint The token to use for the pool
   * @param authority The authority for the pool
   */
  createPool(underlyingTokenMint: PublicKey, authority: PublicKey) {
    const gambaStateAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      getGambaStateAddress(),
      true,
    )
    const METADATA_SEED = 'metadata'
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const pool = getPoolAddress(underlyingTokenMint, authority)
    const lp_mint = getPoolLpAddress(pool)
    const bonus_mint = getPoolBonusAddress(pool)
    const pool_underlying_token_account = getPoolUnderlyingTokenAccountAddress(pool)
    const pool_bonus_underlying_token_account = PublicKey.findProgramAddressSync([Buffer.from('POOL_BONUS_UNDERLYING_TA'), pool.toBuffer()], PROGRAM_ID)[0]
    const lpMintMetadata = PublicKey.findProgramAddressSync([Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), lp_mint.toBuffer()], TOKEN_METADATA_PROGRAM_ID)[0]
    const bonusMintMetadata = PublicKey.findProgramAddressSync([Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), bonus_mint.toBuffer()], TOKEN_METADATA_PROGRAM_ID)[0]

    return this.gambaProgram.methods
      .poolInitialize(authority)
      .accounts({
        initializer: this.anchorProvider.wallet.publicKey,
        gambaState: getGambaStateAddress(),
        underlyingTokenMint: underlyingTokenMint,
        pool: pool,
        poolUnderlyingTokenAccount: pool_underlying_token_account,
        poolBonusUnderlyingTokenAccount: pool_bonus_underlying_token_account,
        gambaStateAta,
        lpMint: lp_mint,
        lpMintMetadata: lpMintMetadata,
        bonusMint: bonus_mint,
        bonusMintMetadata: bonusMintMetadata,
        associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .instruction()
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
    amount: number,
  ) {
    const poolUnderlyingTokenAccount = getPoolUnderlyingTokenAccountAddress(pool)
    const poolLpMint = getPoolLpAddress(pool)

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.anchorProvider.wallet.publicKey,
    )

    const userLpAta = getAssociatedTokenAddressSync(
      poolLpMint,
      this.anchorProvider.wallet.publicKey,
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
    amount: number,
  ) {
    const poolUnderlyingTokenAccount = getPoolUnderlyingTokenAccountAddress(pool)
    const poolLpMint = getPoolLpAddress(pool)

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.anchorProvider.wallet.publicKey,
    )

    const userLpAta = getAssociatedTokenAddressSync(
      poolLpMint,
      this.anchorProvider.wallet.publicKey,
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
    amount: number,
  ) {
    const poolBonusMint = getPoolBonusAddress(pool)

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.anchorProvider.wallet.publicKey,
    )

    const userBonusAta = getAssociatedTokenAddressSync(
      poolBonusMint,
      this.anchorProvider.wallet.publicKey,
    )

    return this.gambaProgram.methods
      .poolMintBonusTokens(new anchor.BN(amount))
      .accounts({
        pool,
        user: this.anchorProvider.wallet.publicKey,
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
