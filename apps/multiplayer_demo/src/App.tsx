// App.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { WalletModalButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey, Connection } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import GameCard from './components/GameCard'
import RecentMultiplayerEvents from './components/RecentMultiplayerEvents'
import GameSimulation from './components/GameSimulation'
import './styles.css'
import { sendTransaction } from './utils'
import { MultiplayerProvider, MULTIPLAYER_PROGRAM_ID } from 'gamba-multiplayer-core'
import { RPC_ENDPOINT } from './constants'

const network = RPC_ENDPOINT
const opts = { preflightCommitment: 'processed' }

const WagerType = {
  SameWager: 'SameWager',
  CustomWager: 'CustomWager',
}

const App = () => {
  const wallet = useWallet()

  const [games, setGames] = useState([])
  const [maxPlayers, setMaxPlayers] = useState('')
  const [tokenMint, setTokenMint] = useState('So11111111111111111111111111111111111111112')
  const [currentBlockchainTime, setCurrentBlockchainTime] = useState(null)
  const [fetchTime, setFetchTime] = useState(null)
  const [gameDuration, setGameDuration] = useState('')
  const [wagerAmount, setWagerAmount] = useState('')
  const [winners, setWinners] = useState('')
  const [gameType, setGameType] = useState(WagerType.SameWager)
  const [customWager, setCustomWager] = useState('')

  const connection = useMemo(() => new Connection(network, opts.preflightCommitment), [])

  const provider = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null
    return new MultiplayerProvider(connection, wallet)
  }, [connection, wallet])

  const fetchGames = useCallback(async () => {
    if (!provider) return
    try {
      const gameAccounts = await provider.fetchGames()
      const currentTimestamp = await provider.getCurrentBlockchainTime()
      const fetchTime = Date.now()
      setCurrentBlockchainTime(currentTimestamp)
      setFetchTime(fetchTime)
      setGames(gameAccounts)
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }, [provider])

  useEffect(() => {
    if (!wallet.connected || !provider) return

    fetchGames()

    const subscriptionId = connection.onProgramAccountChange(
      new PublicKey(MULTIPLAYER_PROGRAM_ID),
      () => {
        fetchGames()
      },
      'confirmed',
    )

    return () => {
      connection.removeProgramAccountChangeListener(subscriptionId)
    }
  }, [wallet.connected, provider, connection, fetchGames])

  const gambaConfig = async () => {
    if (!provider) return
    try {
      const gambaFeeAddress = new PublicKey('BoDeHdqeVd2ds6keWYp2r63hwpL4UfjvNEPCyvVz38mQ')
      const gambaFeeBps = new BN(100)
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
    if (!provider) return
    try {
      const instruction = await provider.createGame(
        new PublicKey(tokenMint),
        parseInt(maxPlayers),
        parseInt(winners),
        gameType === WagerType.SameWager ? 0 : 1,
        parseInt(wagerAmount),
        parseInt(gameDuration),
        600,
      )

      const txId = await sendTransaction(provider.anchorProvider, instruction, undefined, 5000)
      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error creating game:', error)
    }
  }

  const joinGame = async (game, creatorAddressPubKey, creatorFee) => {
    if (!provider) return
    try {
      const wager = parseInt(customWager)
      const instruction = await provider.joinGame(game, creatorAddressPubKey, creatorFee, wager)
      const txId = await sendTransaction(provider.anchorProvider, instruction)
      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error joining game:', error)
    }
  }

  const leaveGame = async (game) => {
    if (!provider) return
    try {
      const instruction = await provider.leaveGame(game)
      const txId = await sendTransaction(provider.anchorProvider, instruction)
      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error leaving game:', error)
    }
  }

  const settleGame = async (game) => {
    if (!provider) return
    try {
      const instruction = await provider.settleGame(game)
      const txId = await sendTransaction(provider.anchorProvider, instruction)
      console.log('Settle Game Transaction ID:', txId)
    } catch (error) {
      console.error('Error settling game:', error)
    }
  }

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
      <Routes>
        <Route
          path="/"
          element={
            <div>
              {games.map((game, index) => (
                <GameCard
                  key={index}
                  game={game}
                  currentBlockchainTime={currentBlockchainTime}
                  fetchTime={fetchTime}
                  joinGame={joinGame}
                  leaveGame={leaveGame}
                  settleGame={settleGame}
                  customWager={customWager}
                  setCustomWager={setCustomWager}
                />
              ))}
              {wallet.connected && wallet.publicKey && <RecentMultiplayerEvents />}
            </div>
          }
        />
        <Route path="/simulation/:signature" element={<GameSimulation />} />
      </Routes>
    </div>
  )
}

export default App
