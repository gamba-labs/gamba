import { GambaUi } from 'gamba-react-ui-v2'
import React from 'react'
import { Modal } from '../../components/Modal'
import { SlideSection } from '../../components/Slider'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { GameCard } from './GameCard'
import { WelcomeBanner } from './WelcomeBanner'

export function Games() {
  return (
    <SlideSection>
      {GAMES.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </SlideSection>
  )
}

export default function Dashboard() {
  const userStore = useUserStore()
  return (
    <>
      {userStore.newcomer && (
        <Modal>
          <h1>👋 Welcome to Gamba v2!</h1>
          <p>
            Thank you for testing Gamba v2. This version is in beta and could contain bugs. Please do not play with more money that you are comfortable with losing.
          </p>
          <h2>Improvements</h2>
          <ul>
            <li><strong>Custom tokens</strong> - Play with SPL tokens such as $USDC or $GUAC</li>
            <li><strong>Staking</strong> - Stake SPL tokens in LPs</li>
            <li><strong>Auto claiming</strong> - Tokens will appear directly in your wallet when you win</li>
            <li><strong>No account creation</strong> - Start playing immediately from any account</li>
            <li><strong>Bonus tokens used automatically</strong> - You no longer have to redeem bonus tokens to use them</li>
          </ul>
          <GambaUi.Button onClick={() => userStore.set({ newcomer: false })}>
            🫡 I understand
          </GambaUi.Button>
        </Modal>
      )}
      <WelcomeBanner />
    </>
  )
}
