import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { AddressLookupTableProgram, ConfirmOptions, Connection, Keypair, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js'
import { PROGRAM_ID } from './constants'
import { Gamba, IDL } from './idl'
import { getGambaStateAddress, getGameAddress, getPlayerAddress, getPoolAddress, getPoolBonusAddress, getPoolLpAddress, getPoolUnderlyingTokenAccountAddress, getPoolBonusUnderlyingTokenAccountAddress, getPoolJackpotTokenAccountAddress } from './pdas'
import { GambaProviderWallet } from './types'
import { basisPoints } from './utils'

export class GambaProvider {
  gambaProgram: anchor.Program<Gamba>
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
    this.gambaProgram = new anchor.Program(IDL, this.anchorProvider)
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
  createPool(
    underlyingTokenMint: PublicKey,
    authority: PublicKey,
    slot: number,
  ) {
    // … compute all your PDAs exactly as before …
    const pool                    = getPoolAddress(underlyingTokenMint, authority)
    const poolUnderlyingTA       = getPoolUnderlyingTokenAccountAddress(pool)
    const [poolBonusUnderlyingTA] = PublicKey.findProgramAddressSync(
      [Buffer.from('POOL_BONUS_UNDERLYING_TA'), pool.toBuffer()],
      PROGRAM_ID,
    )
    const gamba_state            = getGambaStateAddress()
    const gambaStateAta          = getAssociatedTokenAddressSync(underlyingTokenMint, gamba_state, true)
    const poolJackpotTA          = PublicKey.findProgramAddressSync(
      [Buffer.from('POOL_JACKPOT'), pool.toBuffer()],
      PROGRAM_ID,
    )[0]
    const lpMint                 = getPoolLpAddress(pool)
    const bonusMint              = getPoolBonusAddress(pool)
    const TOKEN_METADATA         = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const METADATA_SEED          = 'metadata'
    const [lpMintMetadata]       = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA.toBuffer(), lpMint.toBuffer()],
      TOKEN_METADATA,
    )
    const [bonusMintMetadata]    = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA.toBuffer(), bonusMint.toBuffer()],
      TOKEN_METADATA,
    )

    const [lutCreateIx, lutAddress] = AddressLookupTableProgram.createLookupTable({
      authority: this.user,
      payer: this.user,
      recentSlot: slot - 1,
    })

    const lutExtendIx = AddressLookupTableProgram.extendLookupTable({
      payer: this.user,
      authority: this.user,
      lookupTable: lutAddress,
      addresses: [
        pool, underlyingTokenMint, poolUnderlyingTA,
        poolBonusUnderlyingTA, gamba_state, gambaStateAta,
        bonusMint, poolJackpotTA,
      ],
    })

    const lutFreezeIx = AddressLookupTableProgram.freezeLookupTable({
      authority: this.user,
      lookupTable: lutAddress,
    })

    // ——— HERE is the switch to accountsPartial ———
    const accs: Record<string, PublicKey | null> = {
      initializer: this.user,
      gambaState: gamba_state,
      underlyingTokenMint,
      pool,
      poolUnderlyingTokenAccount: poolUnderlyingTA,
      poolBonusUnderlyingTokenAccount: poolBonusUnderlyingTA,
      gambaStateAta,                     
      lpMint,
      lpMintMetadata,
      bonusMint,
      bonusMintMetadata,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      tokenMetadataProgram: TOKEN_METADATA,
    }

    const createPoolIx = this.gambaProgram.methods
      .poolInitialize(authority, lutAddress)
      .accountsPartial(accs as any)    
      .instruction()

    return [lutCreateIx, lutExtendIx, lutFreezeIx, createPoolIx]
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
    amount: number | bigint,
  ) {
    // PDAs
    const poolUnderlyingTokenAccount = getPoolUnderlyingTokenAccountAddress(pool)
    const poolLpMint                 = getPoolLpAddress(pool)
    const gambaState                 = getGambaStateAddress()

    // User ATAs
    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.wallet.publicKey,
    )
    const userLpAta = getAssociatedTokenAddressSync(
      poolLpMint,
      this.wallet.publicKey,
    )

    // build a loose map of all accounts
    const accs: Record<string, PublicKey | null> = {
      user: this.wallet.publicKey,
      gambaState,
      pool,
      underlyingTokenMint,
      poolUnderlyingTokenAccount,
      lpMint: poolLpMint,
      userUnderlyingAta,
      userLpAta,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    }

    return this.gambaProgram.methods
      .poolDeposit(new anchor.BN(amount))
      .accountsPartial(accs as any)
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
    amount: number | bigint,
  ) {
    const poolUnderlyingTA = getPoolUnderlyingTokenAccountAddress(pool)
    const poolLpMint       = getPoolLpAddress(pool)
    const gambaState       = getGambaStateAddress()
    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.wallet.publicKey,
    )
    const userLpAta = getAssociatedTokenAddressSync(
      poolLpMint,
      this.wallet.publicKey,
    )

    const accs: Record<string, PublicKey | null> = {
      user: this.wallet.publicKey,
      gambaState,
      pool,
      underlyingTokenMint,
      poolUnderlyingTokenAccount: poolUnderlyingTA,
      lpMint: poolLpMint,
      userUnderlyingAta,
      userLpAta,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    }

    return this.gambaProgram.methods
      .poolWithdraw(new anchor.BN(amount))
      .accountsPartial(accs as any)
      .instruction()
  }

  /**
   * Mints bonus tokens that can be used as free plays in the pool
   * @param pool Pool to mint bonus tokens for
   * @param underlyingTokenMint Token to mint bonus tokens for
   * @param amount Amount of bonus tokens to mint
   */
  mintBonusTokens(
    pool: PublicKey,
    underlyingTokenMint: PublicKey,
    amount: number | bigint,
  ) {
    const bonusMint     = getPoolBonusAddress(pool)
    const gambaState    = getGambaStateAddress()
    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.wallet.publicKey,
    )
    const userBonusAta  = getAssociatedTokenAddressSync(
      bonusMint,
      this.wallet.publicKey,
    )

    const poolBonusUnderlyingTA = getPoolBonusUnderlyingTokenAccountAddress(pool)
    const poolJackpotTA = getPoolJackpotTokenAccountAddress(pool)

    const accs: Record<string, PublicKey> = {
      user: this.wallet.publicKey,
      gambaState: gambaState,
      pool: pool,
      underlyingTokenMint: underlyingTokenMint,
      bonusMint: bonusMint,
      userUnderlyingAta: userUnderlyingAta,
      userBonusAta: userBonusAta,
      poolBonusUnderlyingTokenAccount: poolBonusUnderlyingTA,
      poolJackpotTokenAccount: poolJackpotTA,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    }

    return this.gambaProgram.methods
      .poolMintBonusTokens(new anchor.BN(amount))
      .accountsPartial(accs as any)
      .instruction()
  }


  /**
   * Initializes an associated Player account for the connected wallet
   */
  createPlayer() {
    const player = getPlayerAddress(this.wallet.publicKey)
    const game   = getGameAddress(this.wallet.publicKey)

    const accs: Record<string, PublicKey> = {
      player,
      game,
      user: this.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    }

    return this.gambaProgram.methods
      .playerInitialize()
      .accountsPartial(accs as any)
      .instruction()
  }

  /**
   * Closes the associated Player account for the connected wallet
   */
  closePlayer() {
    const player = getPlayerAddress(this.wallet.publicKey)
    const game   = getGameAddress(this.wallet.publicKey)

    const accs = {
      player,
      game,
      user: this.wallet.publicKey,
    }

    return this.gambaProgram.methods
      .playerClose()
      .accountsPartial(accs as any)
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
    useBonus = false,
  ) {
    const player = getPlayerAddress(this.wallet.publicKey)
    const game   = getGameAddress(this.wallet.publicKey)
    const gambaState = getGambaStateAddress()

    const userUnderlyingAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      this.wallet.publicKey,
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
      this.wallet.publicKey,
    )
    const playerBonusAta = getAssociatedTokenAddressSync(
      bonusMint,
      player,
      true,
    )

    const poolJackpotTA = PublicKey.findProgramAddressSync(
      [Buffer.from('POOL_JACKPOT'), pool.toBuffer()],
      PROGRAM_ID,
    )[0]

    const accs: Record<string, PublicKey | null> = {
      user: this.wallet.publicKey,
      player,
      game,
      gambaState,
      pool,
      underlyingTokenMint,
      bonusTokenMint: bonusMint,
      userUnderlyingAta,
      creator,
      creatorAta,
      playerAta,
      playerBonusAta: useBonus ? playerBonusAta : null,
      userBonusAta: useBonus ? userBonusAta : null,
      poolJackpotTokenAccount: poolJackpotTA,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    }

    return this.gambaProgram.methods
      .playGame(
        new anchor.BN(wager),
        bet.map(basisPoints),
        clientSeed,
        basisPoints(creatorFee),
        basisPoints(jackpotFee),
        metadata,
      )
      .accountsPartial(accs as any)
      .instruction()
  }
}
