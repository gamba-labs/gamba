import { Game } from 'gamba-react'
import React from 'react'
import styled, { css } from 'styled-components'
import { GameBundle } from '../types'
import { ErrorBoundary } from './ErrorBoundary'
import { Loader } from './Loader'
import { RecentPlays } from './RecentPlays'

export const Wrapper = styled.div<{heights?: number[]}>`
  height: 100vh;
  display: grid;
  position: relative;
  transition: height .25s ease;
  background: ${({ theme }) => theme.palette.backgroundGame};
  ${({ heights = [640, 800] }) => heights.map(
    (h) => css`
      @media (min-height: ${h}px) {
        height: ${h}px;
      }
    `,
  )}
`

// function ProvablyFair() {
//   const gamba = useGamba()
//   return (
//     <div>
//       <Seed>{gamba.seed}</Seed>
//     </div>
//   )
// }

const DefaultLoadScreen = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Loader />
    </div>
  )
}

interface Props {
  game: GameBundle
  /**
   * Component to show while the game is loading
   */
  loader?: JSX.Element
  /**
   * Component to show if an error occurs in the game
   */
  error?: JSX.Element
}

export function GameWrapper({ game, loader, error }: Props) {
  return (
    <>
      <Wrapper>
        <ErrorBoundary error={error}>
          <React.Suspense fallback={loader ?? <DefaultLoadScreen />}>
            <Game creator={game.creator}>
              <game.app />
            </Game>
          </React.Suspense>
        </ErrorBoundary>
      </Wrapper>
      {/* <ProvablyFair /> */}
    </>
  )
}
