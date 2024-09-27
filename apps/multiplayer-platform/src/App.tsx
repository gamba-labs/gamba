import React, { useState, useEffect } from 'react'
import { WalletModalButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey, Connection } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import GameCard from './components/GameCard'
import RecentEvents from './components/RecentEvents'
import './styles.css'
import { sendTransaction } from './utils'
import { MultiplayerProvider } from 'gamba-multiplayer'

const network = 'https://devnet.helius-rpc.com/?api-key=263bbbf4-4c17-47d9-8c12-7b8312067734'
const opts = { preflightCommitment: 'processed' }

const WagerType = {
  SameWager: 'SameWager',
  CustomWager: 'CustomWager',
}

const App = () => {
  const wallet = useWallet()
  const [games, setGames] = useState([])
  const [maxPlayers, setMaxPlayers] = useState() 
  const [tokenMint, setTokenMint] = useState('So11111111111111111111111111111111111111112') 
  const [currentBlockchainTime, setCurrentBlockchainTime] = useState(null)
  const [gameDuration, setGameDuration] = useState('') // Game duration in seconds
  const [wagerAmount, setWagerAmount] = useState('') // Wager amount when creating game
  const [winners, setWinners] = useState() 
  const [gameType, setGameType] = useState(WagerType.SameWager)
  const [customWager, setCustomWager] = useState('') // wager input when joining game

  useEffect(() => {
    const fetchInterval = 2500 // Fetch every n milliseconds

    const intervalId = setInterval(() => {
      if (wallet.connected) {
        fetchGames()
      }
    }, fetchInterval)

    return () => clearInterval(intervalId)
  }, [wallet.connected]) // Re-run effect if wallet.connected changes

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new MultiplayerProvider(connection, wallet)
    return provider
  }

  const fetchGames = async () => {
    try {
      const provider = getProvider()
      const gameAccounts = await provider.fetchGames()
      const currentTimestamp = await provider.getCurrentBlockchainTime()
      
      setCurrentBlockchainTime(currentTimestamp)
      setGames(gameAccounts)
    } catch (error) {
      console.error('Error fetching game accounts or blockchain timestamp:', error)
    }
  }

  const gambaConfig = async () => {
    try {
      const provider = getProvider()
      const gambaFeeAddress = new PublicKey('BoDeHdqeVd2ds6keWYp2r63hwpL4UfjvNEPCyvVz38mQ')
      const gambaFeeBps = new BN(100) // 1%
      const rngAddress = new PublicKey('FaicqUdVsesTNxGRiVo3ZWMgrxdvhAVpSH7CPFnEN3aF')
      const authority = provider.wallet.publicKey

      const instruction = await provider.gambaConfig(
        gambaFeeAddress,
        gambaFeeBps,
        rngAddress,
        authority,
      )

      const txId = await sendTransaction(provider.anchorProvider, instruction)

      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error configuring gamba:', error)
    }
  }

  const createGame = async () => {
    try {
      const maxPlayersInt = maxPlayers
      const winnersInt = winners
      const durationSecondsInt = parseInt(gameDuration)
      const wagerInt = parseInt(wagerAmount)

      const mintPublicKey = new PublicKey(tokenMint)
      const provider = getProvider()
      const gameTypeValue = gameType === WagerType.SameWager ? 0 : 1



      const instruction = await provider.createGame(
        mintPublicKey,
        maxPlayersInt,
        winnersInt,
        gameTypeValue,
        wagerInt,
        durationSecondsInt,
      )

      const txId = await sendTransaction(provider.anchorProvider, instruction, undefined, 5000)

      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error creating game:', error)
    }
  }

  const joinGame = async (game, creatorAddressPubKey: PublicKey, creatorFee: number) => {
    const wager = parseInt(customWager)
    console.log(game.publicKey, creatorAddressPubKey, creatorFee, wager)
    try {
      const provider = getProvider()

      console.log('Joining game:', game.publicKey.toString())
      const instruction = await provider.joinGame(game, creatorAddressPubKey, creatorFee, wager)
      const txId = await sendTransaction(provider.anchorProvider, instruction)
  
      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error joining game:', error)
    }
  }
  
  const leaveGame = async ( game ) => {
    try {
      const provider = getProvider()
      const instruction = await provider.leaveGame(game)
      const txId = await sendTransaction(provider.anchorProvider, instruction)
      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error leaving game:', error)
    }
  }
  
  const settleGame = async ( game ) => {
    try {
      const provider = getProvider()

      console.log('Settling game:', game.publicKey.toString())
  
      const instruction = await provider.settleGame(game)
      const txId = await sendTransaction(provider.anchorProvider, instruction)
  
      console.log('Settle Game Transaction ID:', txId)
    } catch (error) {
      console.error('Error settling game:', error)
    }
  }

  const connection = new Connection(network, opts.preflightCommitment)

  
  return (
    <div>
      <WalletModalButton />
      <div>Wallet Public Key: {wallet.publicKey?.toString()}</div>
      <div>
        <button onClick={gambaConfig}>Gamba Config</button>
      </div>
      <div>
        <input
          className="input-field"
          type="number"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          placeholder="Max Players"
        />
        <input
          className="input-field"
          type="text"
          value={tokenMint}
          onChange={(e) => setTokenMint(e.target.value)}
          placeholder="Token Mint"
        />
        <div>
          <input
            className="input-field"
            type="number"
            value={gameDuration}
            onChange={(e) => setGameDuration(e.target.value)}
            placeholder="Game Duration (seconds)"
          />
          <input
            className="input-field"
            type="number"
            value={wagerAmount}
            onChange={(e) => setWagerAmount(e.target.value)}
            placeholder="Wager Amount"
          />
          <input
            className="input-field"
            type="number"
            value={winners}
            onChange={(e) => setWinners(e.target.value)}
            placeholder="Winners"
          />
          <div>
            <input
              type="radio"
              id="sameWager"
              name="gameType"
              value={WagerType.SameWager}
              checked={gameType === WagerType.SameWager}
              onChange={() => setGameType(WagerType.SameWager)}
            />
            <label htmlFor="sameWager">Same Wager</label>
          </div>
          <div>
            <input
              type="radio"
              id="customWager"
              name="gameType"
              value={WagerType.CustomWager}
              checked={gameType === WagerType.CustomWager}
              onChange={() => setGameType(WagerType.CustomWager)}
            />
            <label htmlFor="customWager">Custom Wager</label>
          </div>
        </div>
        <button onClick={createGame}>Create Game</button>
      </div>
      <div className="button-row">
        <button onClick={fetchGames}>Refresh Games</button>
      </div>
      <div>
        {games.map((game, index) => (
          <GameCard
            key={index}
            game={game}
            currentBlockchainTime={currentBlockchainTime}
            joinGame={joinGame}
            leaveGame={leaveGame}
            settleGame={settleGame}
            customWager={customWager}
            setCustomWager={setCustomWager}
          />
        ))}
      </div>
      <RecentEvents connection={connection} address={wallet.publicKey} />
    </div>
  )
}

export default App
