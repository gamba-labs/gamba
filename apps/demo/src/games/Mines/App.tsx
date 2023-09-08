import { lamportsToSol, solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { Fullscreen, formatLamports, useClaim, useSounds } from 'gamba/react-ui'
import React from 'react'
import styles from './App.module.css'

import SOUND_FINISH from './finish.mp3'
import SOUND_LOSE from './lose.mp3'
import ICON_MINE from './mine.svg'
import SOUND_TICK from './tick.mp3'
import SOUND_WIN from './win.mp3'

const GRID_SIZE = 25
const PITCH_INCREASE_FACTOR = 1.06
const MINE_SELECT = [1, 3, 5, 10, 15, 20, 24]
const WAGER_AMOUNTS = [.05, .1, .25, .5, 1, 3].map(solToLamports)

type CellStatus = 'hidden' | 'gold' | 'mine'
interface CellState {
  status: CellStatus
  profit: number
}
type MinesStatus = 'playing' | 'idle' | 'lost'
type LoadState = 'playing' | 'claiming'

const generateGrid = () =>
  new Array(GRID_SIZE).fill({ status: 'hidden', profit: 0 }) as CellState[]

function Mines() {
  const gamba = useGamba()
  const sounds = useSounds({
    tick: SOUND_TICK,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    finish: SOUND_FINISH,
  })

  const [grid, setGrid] = React.useState(generateGrid())
  const [currentLevel, setLevel] = React.useState(0)
  const [selected, setSelected] = React.useState(-1)
  const [totalGain, setTotalGain] = React.useState(0)
  const [loadingState, setLoading] = React.useState<LoadState | null>(null)
  const [gameState, setGameState] = React.useState<MinesStatus>('idle')

  const [config] = React.useState({
    wager: WAGER_AMOUNTS[0],
    mines: MINE_SELECT[2],
  })

  const remainingCells = GRID_SIZE - currentLevel
  const remainingLevels = remainingCells - config.mines
  const gameFinished = remainingLevels <= 0
  const needsReset = gameState === 'lost' || gameFinished
  const loading = loadingState !== null

  const [claim, claiming] = useClaim()

  const endGame = async () => {
    await claim()
    reset()
    setLoading(null)
  }

  const reset = async () => {
    setGrid(generateGrid())
    setLoading(null)
    setGameState('idle')
    setLevel(0)
    setTotalGain(0)
  }

  const canPlay = !loading && !claiming && !needsReset

  const bet = React.useMemo(
    () => Array
      .from({ length: remainingCells })
      .map((_, i, arr) => {
        return i < config.mines ? 0 : arr.length / (arr.length - config.mines)
      }),
    [remainingCells, config],
  )

  // const customControls = (
  //   <>
  //     {gameState === 'idle' && (
  //       <>
  //         <select
  //           value={config.wager}
  //           onChange={(evt) => setConfig({ ...config, wager: Number(evt.target.value) })}
  //         >
  //           {WAGER_AMOUNTS.map((value, i) => (
  //             <option key={i} value={value}>
  //               {formatLamports(value)}
  //             </option>
  //           ))}
  //         </select>
  //         <select
  //           value={config.mines}
  //           onChange={(evt) => setConfig({ ...config, mines: Number(evt.target.value) })}
  //         >
  //           {MINE_SELECT.map((value, i) => (
  //             <option key={i} value={value}>
  //               {value} Mines
  //             </option>
  //           ))}
  //         </select>
  //       </>
  //     )}

  //     {gameState === 'playing' && (
  //       <div>
  //         <button disabled={loading || claiming} onClick={endGame}>
  //           Claim {formatLamports(gamba.balances.user)}
  //         </button>
  //       </div>
  //     )}

  //     {needsReset && (
  //       <button disabled={loading} onClick={reset}>
  //         Reset
  //       </button>
  //     )}
  //   </>
  // )

  // useGameControls({
  //   custom: {
  //     type: 'custom',
  //     element: customControls,
  //   },
  // })

  React.useEffect(
    () => {
      if (gameFinished) {
        sounds.finish.play()
      }
    },
    [gameFinished],
  )

  const play = async (cellIndex: number) => {
    setLoading('playing')
    setSelected(cellIndex)
    setGameState('playing')

    try {
      const firstBet = currentLevel === 0

      await gamba.play({
        bet,
        wager: firstBet ? config.wager : config.wager + totalGain,
        deductFees: !firstBet,
      })

      sounds.tick.play({ playbackRate: 1.5 })

      const result = await gamba.awaitResult()

      if (result.payout > 0) {
        sounds.tick.player.stop()
        sounds.win.play({ playbackRate: Math.pow(PITCH_INCREASE_FACTOR, currentLevel) })

        setLevel((x) => x + 1)
        setTotalGain((x) => x + result.payout)
        // Update selected cell
        setGrid(
          (cells) => cells.map(
            (cell, i) =>
              i === cellIndex ?
                { ...cell, status: 'gold', profit: result.payout }
                : cell,
          ),
        )
      } else {
        setGameState('lost')

        // "Reveal" mines under random hidden squares
        const revealedMines = grid
          .map((cell, index) => ({ cell, index }))
          .sort((a, b) => {
            if (a.index === cellIndex) return -1
            if (b.index === cellIndex) return 1
            if (a.cell.status === 'hidden' && b.cell.status === 'hidden') {
              return Math.random() - .5
            }
            if (a.cell.status === 'hidden') return -1
            if (b.cell.status === 'hidden') return 1
            return 0
          })
          .map((x) => x.index)
          .slice(0, config.mines)

        // Update revealed cells
        setGrid(
          (cells) =>
            cells.map(
              (cell, i) =>
                revealedMines.includes(i) ? { ...cell, status: 'mine' } : cell,
            ),
        )

        sounds.tick.player.stop()
        sounds.lose.play()
      }
    } catch (err) {
      console.error(err)
      setGameState('idle')
    } finally {
      setLoading(null)
      setSelected(-1)
    }
  }

  return (
    <Fullscreen maxScale={1.25}>
      <div className={styles.container}>
        <div className={styles.statusBar}>
          <div>
            <span>
              +{formatLamports(totalGain)}
            </span>
            <span>
              Mines: {config.mines}
            </span>
          </div>
          {gameState === 'playing' && (
            <button className={styles.reset} disabled={loading || claiming} onClick={endGame}>
              Cashout
            </button>
          )}
          {needsReset && !loading && (
            <button className={styles.reset} onClick={reset}>
              {gameFinished ? 'a winner is you!' : 'Restart'}
            </button>
          )}
        </div>
        <div className={styles.levels}>
          {Array.from({ length: 4 })
            .map((_, i) => {
              const level = currentLevel + i
              if (level >= GRID_SIZE - config.mines) {
                return (
                  <div key={i}>
                    -
                  </div>
                )
              }
              const unrevealed = GRID_SIZE - level
              const multiplier = unrevealed / (unrevealed - config.mines)
              return (
                <div key={i}>
                  {parseFloat(multiplier.toFixed(3))}x
                </div>
              )
            })}
        </div>
        <div className={styles.grid}>
          {grid.map((cell, index) => (
            <button
              key={index}
              className={styles.cell}
              data-status={cell.status}
              data-selected={selected === index}
              onClick={() => play(index)}
              disabled={!canPlay || cell.status !== 'hidden'}
            >
              {(cell.status === 'hidden' || cell.status === 'mine') && <img src={ICON_MINE} />}
              {(cell.status === 'gold') && (
                <div>
                  +{parseFloat(lamportsToSol(cell.profit).toFixed(3))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </Fullscreen>
  )
}

export default Mines
