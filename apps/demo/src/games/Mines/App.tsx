import { lamportsToSol, solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { ResponsiveSize, formatLamports, useClaim, useGameControls } from 'gamba/react-ui'
import React from 'react'
import * as Tone from 'tone'
import { Bomb } from './Svg'
import { Cell, Grid, MultiplierCurrent, MultiplierWrapper, PulsingText } from './styles'

import finishSrc from './finish.mp3'
import loseSrc from './lose.mp3'
import tickSrc from './tick.mp3'
import winSrc from './win.mp3'

import styles from './test.module.css'

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

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundTick = createSound(tickSrc)
const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)
const soundFinish = createSound(finishSrc)

function Mines() {
  const gamba = useGamba()
  const [grid, setGrid] = React.useState(generateGrid())
  const [currentLevel, setLevel] = React.useState(0)
  const [selected, setSelected] = React.useState(-1)
  const [totalGain, setTotalGain] = React.useState(0)
  const [loadingState, setLoading] = React.useState<LoadState | null>(null)
  const [gameState, setGameState] = React.useState<MinesStatus>('idle')
  const [config, setConfig] = React.useState({
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

  const customControls = (
    <>
      {gameState === 'idle' && (
        <>
          <select
            value={config.wager}
            onChange={(evt) => setConfig({ ...config, wager: Number(evt.target.value) })}
          >
            {WAGER_AMOUNTS.map((value, i) => (
              <option key={i} value={value}>
                {formatLamports(value)}
              </option>
            ))}
          </select>
          <select
            value={config.mines}
            onChange={(evt) => setConfig({ ...config, mines: Number(evt.target.value) })}
          >
            {MINE_SELECT.map((value, i) => (
              <option key={i} value={value}>
                {value} Mines
              </option>
            ))}
          </select>
        </>
      )}

      {gameState === 'playing' && (
        <div>
          <button disabled={loading || claiming} onClick={endGame}>
                Claim {formatLamports(gamba.balances.user)}
          </button>
        </div>
      )}

      {needsReset && (
        <button disabled={loading} onClick={reset}>
              Reset
        </button>
      )}
    </>
  )

  useGameControls({
    custom: {
      type: 'custom',
      element: customControls,
    },
  })

  React.useEffect(
    () => {
      if (gameFinished) {
        soundFinish.start()
      }
    },
    [gameFinished],
  )

  const playCell = async (cellIndex: number) => {
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

      soundTick.playbackRate = 1.5
      soundTick.start()

      const result = await gamba.awaitResult()

      if (result.payout > 0) {
        soundTick.stop()
        soundWin.playbackRate = Math.pow(PITCH_INCREASE_FACTOR, currentLevel)
        soundWin.start()

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

        soundTick.stop()
        soundLose.start()
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
    <ResponsiveSize maxScale={1.25}>
      <div className={styles.container}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', color: 'white' }}>
          <div>
            +{formatLamports(totalGain)}
          </div>
          {needsReset && !loading && (
            <PulsingText onClick={reset}>
              {gameFinished ? 'a winner is you!' : 'Reset!'}
            </PulsingText>
          )}
        </div>
        <MultiplierWrapper>
          {Array.from({ length: 4 })
            .map((_, i) => {
              const level = currentLevel + i
              if (level >= GRID_SIZE - config.mines) {
                return (
                  <MultiplierCurrent key={i}>
                      -
                  </MultiplierCurrent>
                )
              }
              const unrevealed = GRID_SIZE - level
              const multiplier = unrevealed / (unrevealed - config.mines)
              return (
                <MultiplierCurrent key={i} isCurrent={i === 0}>
                  {parseFloat(multiplier.toFixed(3))}x
                </MultiplierCurrent>
              )
            })}
        </MultiplierWrapper>
        <Grid>
          {grid.map((cell, index) => (
            <Cell
              className={cell.status}
              key={index}
              status={cell.status}
              onClick={() => playCell(index)}
              selected={selected === index}
              disabled={!canPlay || cell.status !== 'hidden'}
            >
              {(cell.status === 'hidden' || cell.status === 'mine') && <Bomb />}
              {(cell.status === 'gold') && (
                <div>
                    +{parseFloat(lamportsToSol(cell.profit).toFixed(3))}
                </div>
              )}
            </Cell>
          ))}
        </Grid>
      </div>
    </ResponsiveSize>
  )
}

export default Mines
