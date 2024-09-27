import * as anchor from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, AccountLayout } from '@solana/spl-token'
import { ConfirmOptions, Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { MULTIPLAYER_PROGRAM_ID, WRAPPED_SOL_MINT } from './constants'
import { Multiplayer as MultiplayerIdl, IDL } from './idl'
import { MultiplayerProviderWallet, GameState } from './types'
import { getGambaStateAddress, getGameAddress, getGameTokenAccountAddress } from './utils'

export class MultiplayerProvider {
  multiplayerProgram: anchor.Program<MultiplayerIdl>
  anchorProvider: anchor.AnchorProvider
  wallet: MultiplayerProviderWallet

  constructor(
    connection: Connection,
    wallet: MultiplayerProviderWallet,
    opts: ConfirmOptions = anchor.AnchorProvider.defaultOptions(),
  ) {
    this.anchorProvider = new anchor.AnchorProvider(
      connection,
      wallet,
      opts,
    )
    this.multiplayerProgram = new anchor.Program(IDL, MULTIPLAYER_PROGRAM_ID, this.anchorProvider)
    this.wallet = wallet
  }

  static fromAnchorProvider(
    provider: anchor.AnchorProvider,
  ) {
    const multiplayerProvider = new MultiplayerProvider(
      provider.connection,
      provider.wallet,
      provider.opts,
    )
    return multiplayerProvider
  }

  get user() {
    return this.wallet.publicKey
  }

  async gambaConfig(gambaFeeAddress: PublicKey, gambaFeeBps: anchor.BN, rngAddress: PublicKey, authority: PublicKey) {
    const gambaState = await getGambaStateAddress()

    return this.multiplayerProgram.methods
      .gambaConfig(
        gambaFeeAddress,
        gambaFeeBps,
        rngAddress,
        authority,
      )
      .accounts({
        gambaState: gambaState,
        authority: authority,
        systemProgram: SystemProgram.programId,
      })
      .instruction()
  }

  async createGame(
    mint: PublicKey,
    maxPlayers: number,
    winners: number,
    wagerType: number,
    wager: number,
    softDurationSeconds: number,
    //optional hard duration seconds
    hardDurationSeconds = 86400,
  ) {
    const gambaState = await getGambaStateAddress()

    // Fetch gamba state to get the current gameId
    const gambaStateAccount = await this.multiplayerProgram.account.gambaState.fetch(gambaState)
    const gameIdBuffer = gambaStateAccount.gameId.toArrayLike(Buffer, 'le', 8)
    
    // Generate the game_account PDA with the correct seeds
    const gameAccount = getGameAddress(gameIdBuffer)
    const gameAccountTokenAccount = mint.equals(WRAPPED_SOL_MINT) ? null : getGameTokenAccountAddress(gameAccount)
    
    const gameTypeValue = new anchor.BN(wagerType)
    
    const gambaFeeAddress = gambaStateAccount.gambaFeeAddress
    const gambaFeeAta = getAssociatedTokenAddressSync(
      mint,
      gambaFeeAddress,
    )

    return this.multiplayerProgram.methods
      .createGame(
        maxPlayers,
        winners,
        gameTypeValue,
        new anchor.BN(wager),
        new anchor.BN(softDurationSeconds),
        new anchor.BN(hardDurationSeconds),
      )
      .accounts({
        gameAccount,
        mint,
        gameAccountTaAccount: gameAccountTokenAccount,
        gameMaker: this.wallet.publicKey,
        gambaState,
        gambaFeeAddress: gambaFeeAddress,
        gambaFeeAta: gambaFeeAta,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .instruction()
  }


  async joinGame(
    game: anchor.ProgramAccount<GameState>,
    creatorAddressPubKey: PublicKey,
    creatorFee: number,
    wager: number,
  ) {
    const gambaState = await getGambaStateAddress()
    const playerPubKey = this.wallet.publicKey
  
    // If mint is wrapped SOL, set playerAta to null
    const playerAta = game.account.mint.equals(WRAPPED_SOL_MINT) ? null : getAssociatedTokenAddressSync(
      game.account.mint,
      playerPubKey,
    )

    //if mint is wrapped sol set gameAccountTa to null
    const gameAccountTa = game.account.mint.equals(WRAPPED_SOL_MINT) ? null : getGameTokenAccountAddress(game.publicKey)
  
    const creatorAta = getAssociatedTokenAddressSync(
      game.account.mint,
      creatorAddressPubKey,
    )
  
    console.log('GAME PUBLICKEY', game.publicKey.toString())
  
    const gameAccountPubKey = (game.publicKey instanceof PublicKey) ? game.publicKey : new PublicKey(game.publicKey)
  
    return this.multiplayerProgram.methods
      .joinGame(new anchor.BN(creatorFee), new anchor.BN(wager))
      .accounts({
        gameAccount: gameAccountPubKey,
        gambaState: gambaState,
        gameAccountTa: gameAccountTa,
        mint: game.account.mint,
        playerAccount: playerPubKey,
        playerAta: playerAta,
        creatorAddress: creatorAddressPubKey,
        creatorAta: creatorAta,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction()
  }
  

  async leaveGame(game: anchor.ProgramAccount<GameState>) {
    const playerPubKey = this.wallet.publicKey
  
    // If mint is wrapped SOL, set playerAta to null
    const playerAta = game.account.mint.equals(WRAPPED_SOL_MINT) ? null : getAssociatedTokenAddressSync(
      game.account.mint,
      playerPubKey,
    )
    
    //if mint is wrapped sol set gameAccountTa to null
    const gameAccountTa = game.account.mint.equals(WRAPPED_SOL_MINT) ? null : getGameTokenAccountAddress(game.publicKey)
  
    const gameAccountPubKey = (game.publicKey instanceof PublicKey) ? game.publicKey : new PublicKey(game.publicKey)
  
    return this.multiplayerProgram.methods
      .leaveGame()
      .accounts({
        gameAccount: gameAccountPubKey,
        gameAccountTa: gameAccountTa,
        mint: game.account.mint,
        playerAccount: playerPubKey,
        playerAta: playerAta,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction()
  }

  async settleGame(game: anchor.ProgramAccount<GameState>) {
    if (game.account.mint.equals(WRAPPED_SOL_MINT)) {
      return this.settleGameNative(game)
    } else {
      return this.settleGameSpl(game)
    }
  }

  async settleGameSpl(game: anchor.ProgramAccount<GameState>) {
    const gambaState = await getGambaStateAddress()
  
    // Fetch gambaConfig to get the gambaFeeAddress
    const gambaStateAccount = await this.multiplayerProgram.account.gambaState.fetch(gambaState)
    const gambaFeeAddress = gambaStateAccount.gambaFeeAddress
    const rngAddress = gambaStateAccount.rng
  
    const gambaFeeAta = getAssociatedTokenAddressSync(
      game.account.mint,
      gambaFeeAddress,
    )
  
    const [gameAccountTaPDA] = PublicKey.findProgramAddressSync(
      [game.publicKey.toBuffer()],
      this.multiplayerProgram.programId,
    )
  
    const accounts: any = {
      rng: rngAddress,
      gambaState: gambaState,
      gameMaker: game.account.gameMaker,
      gameAccount: game.publicKey,
      gameAccountTa: gameAccountTaPDA,
      mint: game.account.mint,
      gambaFeeAddress: gambaFeeAddress,
      gambaFeeAta: gambaFeeAta,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    }
  
    // Dynamically add player ATAs and creator ATAs, currently 10 is max and 10 accounts need to be submitted
    for (let i = 0; i < 10; i++) {
      if (game.account.players[i]) {
        const userAddress = game.account.players[i].user
        const creatorAddress = game.account.players[i].creatorAddress
        
        if (userAddress && creatorAddress) {
          const playerAta = getAssociatedTokenAddressSync(game.account.mint, userAddress)
          const creatorAta = getAssociatedTokenAddressSync(game.account.mint, creatorAddress)
  
          accounts[`player${i + 1}Ata`] = playerAta
          accounts[`creator${i + 1}Ata`] = creatorAta
        } else {
          accounts[`player${i + 1}Ata`] = null
          accounts[`creator${i + 1}Ata`] = null
        }
      } else {
        accounts[`player${i + 1}Ata`] = null
        accounts[`creator${i + 1}Ata`] = null
      }
    }
  
    return this.multiplayerProgram.methods
      .settleGame()
      .accounts(accounts)
      .instruction()
  }
  

  // New function: settleWithUninitializedAccounts
  async settleWithUninitializedAccounts(game: anchor.ProgramAccount<GameState>) {
    const gambaState = await getGambaStateAddress()
  
    // Fetch gambaConfig to get addresses
    const gambaStateAccount = await this.multiplayerProgram.account.gambaState.fetch(gambaState)
    const gambaFeeAddress = gambaStateAccount.gambaFeeAddress
    const rngAddress = gambaStateAccount.rng
  
    const gambaFeeAta = getAssociatedTokenAddressSync(
      game.account.mint,
      gambaFeeAddress,
    )
  
    const [gameAccountTaPDA] = PublicKey.findProgramAddressSync(
      [game.publicKey.toBuffer()],
      this.multiplayerProgram.programId,
    )
  
    const accounts: any = {
      rng: rngAddress,
      gambaState: gambaState,
      gameMaker: game.account.gameMaker,
      gameAccount: game.publicKey,
      gameAccountTa: gameAccountTaPDA,
      mint: game.account.mint,
      gambaFeeAddress: gambaFeeAddress,
      gambaFeeAta: gambaFeeAta,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    }
  
    // Dynamically add player ATAs and creator ATAs, currently 10 is max and 10 accounts need to be submitted
    for (let i = 0; i < 10; i++) {
      let playerAta = null
      let creatorAta = null
  
      if (game.account.players[i]) {
        const userAddress = game.account.players[i].user
        const creatorAddress = game.account.players[i].creatorAddress
  
        if (userAddress) {
          const potentialPlayerAta = getAssociatedTokenAddressSync(game.account.mint, userAddress)
          const playerAccountInfo = await this.anchorProvider.connection.getAccountInfo(potentialPlayerAta)
  
          if (playerAccountInfo && AccountLayout.decode(playerAccountInfo.data).state === 1) {
            playerAta = potentialPlayerAta
          } else {
            playerAta = gambaFeeAta
          }
        } else {
          playerAta = gambaFeeAta
        }
  
        if (creatorAddress) {
          const potentialCreatorAta = getAssociatedTokenAddressSync(game.account.mint, creatorAddress)
          const creatorAccountInfo = await this.anchorProvider.connection.getAccountInfo(potentialCreatorAta)
  
          if (creatorAccountInfo && AccountLayout.decode(creatorAccountInfo.data).state === 1) {
            creatorAta = potentialCreatorAta
          } else {
            creatorAta = gambaFeeAta
          }
        } else {
          creatorAta = gambaFeeAta
        }
      }
  
      accounts[`player${i + 1}Ata`] = playerAta
      accounts[`creator${i + 1}Ata`] = creatorAta
    }
  
    console.log('GAME ACCOUNTS with Uninitialized Checks', accounts)
  
    return this.multiplayerProgram.methods
      .settleGame()
      .accounts(accounts)
      .instruction()
  }

  async settleGameNative(game: anchor.ProgramAccount<GameState>) {
    const gambaState = await getGambaStateAddress()

    // Fetch gambaConfig to get the gambaFeeAddress
    const gambaStateAccount = await this.multiplayerProgram.account.gambaState.fetch(gambaState)
    const gambaFeeAddress = gambaStateAccount.gambaFeeAddress
    const rngAddress = gambaStateAccount.rng

    const accounts: any = {
      rng: rngAddress,
      gambaState: gambaState,
      gameMaker: game.account.gameMaker,
      gameAccount: game.publicKey,
      mint: game.account.mint,
      gambaFeeAddress: gambaFeeAddress,
      systemProgram: SystemProgram.programId,
    }

    // Dynamically add player and creator accounts
    for (let i = 0; i < 10; i++) {
      if (game.account.players[i]) {
        const userAddress = game.account.players[i].user
        const creatorAddress = game.account.players[i].creatorAddress

        if (userAddress && creatorAddress) {
          accounts[`player${i + 1}`] = userAddress
          accounts[`creator${i + 1}`] = creatorAddress
        } else {
          accounts[`player${i + 1}`] = null
          accounts[`creator${i + 1}`] = null
        } 
      } else {
        accounts[`player${i + 1}`] = null
        accounts[`creator${i + 1}`] = null
      }
    }

    return this.multiplayerProgram.methods
      .settleGameNative()
      .accounts(accounts)
      .instruction()
  }


  async fetchGames() {
    try {
      const gameAccounts = await this.multiplayerProgram.account.game.all()
      return gameAccounts
    } catch (error) {
      console.error('Error fetching game accounts:', error)
      throw error
    }
  }

  async getCurrentBlockchainTime() {
    try {
      const slot = await this.anchorProvider.connection.getSlot()
      const currentTimestamp = await this.anchorProvider.connection.getBlockTime(slot)
      if (!currentTimestamp) throw new Error('Failed to get current blockchain time')
      return currentTimestamp
    } catch (error) {
      console.error('Error fetching blockchain timestamp:', error)
      throw error
    }
  }
}








