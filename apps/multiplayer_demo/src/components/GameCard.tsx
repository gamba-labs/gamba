import React from 'react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { formatPublicKey, parseGameState, parseWagerType } from '../utils'

interface GameCardProps {
  game: any;
  currentBlockchainTime: number | null;
  joinGame: (game: any, creatorAddressPubKey: PublicKey, creatorFee: number) => void;
  leaveGame: (game: any) => void;
  settleGame: (game: any) => void;
  customWager: string;
  setCustomWager: React.Dispatch<React.SetStateAction<string>>;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  currentBlockchainTime,
  joinGame,
  leaveGame,
  settleGame,
  customWager,
  setCustomWager,
}) => {
  const expirationTimestamp = new BN(game.account.softExpirationTimestamp).toNumber()
  const timeUntilExpiration = currentBlockchainTime ? Math.max(0, expirationTimestamp - currentBlockchainTime) : null

  return (
    <div className="gameCard">
      <div>Game Account Public Key: {formatPublicKey(game.publicKey)}</div>
      <div>Game Maker: {formatPublicKey(game.account.gameMaker)}</div>
      <div>State: {parseGameState(game.account.state)}</div>
      <div>Mint: {formatPublicKey(game.account.mint)}</div>
      <div>Max Players: {game.account.maxPlayers.toString()}</div>
      <div>Winners: {game.account.winners.toString()}</div>
      <div>Game ID: {game.account.gameId.toString()}</div>
      <div>Game Expiration Timestamp: {game.account.softExpirationTimestamp.toString()}</div>
      <div>Time Until Expiration: {timeUntilExpiration !== null ? `${timeUntilExpiration} seconds` : 'Loading...'}</div>
      <div>Wager Type: {parseWagerType(game.account.wagerType)}</div>
      <div>Wager: {game.account.wager.toString()}</div>
      <div>
        Players:
        {game.account.players.map((player, playerIndex) => (
          <div key={playerIndex} className="playerInfo">
            <div>Creator: {formatPublicKey(player.creatorAddress)}</div>
            <div>User: {formatPublicKey(player.user)}</div>
            <div>Creator Fee: {player.creatorFeeAmount.toString()}</div>
            <div>Gamba Fee: {player.gambaFeeAmount.toString()}</div>
            <div>Wager: {player.wager.toString()}</div>
          </div>
        ))}
      </div>
      <div className="buttonContainer">
        <div className="joinLeaveButtons">
          <button onClick={() => joinGame(game, new PublicKey('FaicqUdVsesTNxGRiVo3ZWMgrxdvhAVpSH7CPFnEN3aF'), 100)}>Join Game</button>
          <button onClick={() => leaveGame(game)}>Leave Game</button>
          <input
            type="number"
            placeholder="Enter wager amount"
            value={customWager}
            onChange={e => setCustomWager(e.target.value)}
            className="input-field"
          />
        </div>
        {(parseGameState(game.account.state) === 'Playing' || timeUntilExpiration === 0) && (
          <button className="settleButton" onClick={() => settleGame(game)}>Settle Game</button>
        )}
      </div>
    </div>
  )
}

export default GameCard