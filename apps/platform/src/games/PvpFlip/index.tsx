import React, { useState, useCallback } from 'react'
import { GambaUi } from 'gamba-react-ui-v2'
import type { PublicKey } from '@solana/web3.js'

import Lobby from './components/Lobby'
import GameScreen from './components/GameScreen'

export default function PvpFlip() {
  const [selectedGame, setSelectedGame] = useState<PublicKey | null>(null)

  const handleBack = useCallback(() => {
    setSelectedGame(null)
  }, [])

  return (
    <GambaUi.Portal target="screen">
      {selectedGame ? (
        <GameScreen pk={selectedGame} onBack={handleBack} />
      ) : (
        <Lobby onSelect={setSelectedGame} />
      )}
    </GambaUi.Portal>
  )
}


