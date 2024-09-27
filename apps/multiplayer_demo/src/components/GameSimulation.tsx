// GameSimulation.tsx
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useConnection } from '@solana/wallet-adapter-react'
import { parseTransactionEvents } from 'gamba-multiplayer-core'
import Matter from 'matter-js'
import seedrandom from 'seedrandom'

const GameSimulation = () => {
  const { signature } = useParams()
  const { connection } = useConnection()
  const canvasRef = useRef(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSimulation, setShowSimulation] = useState(false)
  const [simulationStarted, setSimulationStarted] = useState(false)
  const [simulationEnded, setSimulationEnded] = useState(false)
  const [playerColors, setPlayerColors] = useState({})
  const [winnerPlayer, setWinnerPlayer] = useState(null)
  const [selectedSimulationData, setSelectedSimulationData] = useState(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        const transaction = await connection.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        })

        if (!transaction) {
          setError('Transaction not found')
          setLoading(false)
          return
        }

        const logs = transaction.meta?.logMessages ?? []
        const events = parseTransactionEvents(logs)
        const gameSettledEvent = events.find((event) => event.name === 'GameSettled')

        if (!gameSettledEvent) {
          setError('GameSettled event not found in transaction')
          setLoading(false)
          return
        }

        console.log('GameSettled Event Data:', gameSettledEvent)

        setEvent({
          ...gameSettledEvent,
          signature,
          time: transaction.blockTime ? transaction.blockTime * 1000 : Date.now(),
        })
        setLoading(false)
      } catch (err) {
        console.error('Error fetching transaction:', err)
        setError('An error occurred while fetching the transaction')
        setLoading(false)
      }
    }

    if (signature) {
      fetchEvent()
    } else {
      setError('No transaction signature provided')
      setLoading(false)
    }
  }, [connection, signature])

  useEffect(() => {
    if (simulationStarted && event && !simulationEnded) {
      const { data } = event
      const players = data.players
      const winners = data.winners
      const desiredWinner = winners[0]  // Assuming a single winner

      // Assign colors to players
      const colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow', 'pink', 'cyan', 'magenta', 'lime']
      const assignedColors = {}
      players.forEach((player, index) => {
        assignedColors[player] = colors[index % colors.length]
      })
      setPlayerColors(assignedColors)

      const MAX_SIMULATION_ATTEMPTS = 1000  // Maximum number of simulation attempts
      let simulationAttempts = 0
      let selectedSimulation = null

      while (simulationAttempts < MAX_SIMULATION_ATTEMPTS) {
        simulationAttempts++
        const seed = Math.random().toString()
        const simulationResult = runSimulation(players, assignedColors, seed)
        simulationResult.seed = seed

        if (simulationResult.winner === desiredWinner) {
          selectedSimulation = simulationResult
          break  // Exit the loop when desired outcome is achieved
        }
      }

      if (!selectedSimulation) {
        console.error('Unable to generate simulation with the desired outcome')
        setError('Unable to generate simulation with the desired outcome')
        setSimulationStarted(false)
        return
      }

      setSelectedSimulationData(selectedSimulation)
      setWinnerPlayer(desiredWinner)
      playSimulation(selectedSimulation, players, assignedColors)
    }
  }, [simulationStarted, event, simulationEnded])

  const runSimulation = (players, assignedColors, seed) => {
    // Initialize Matter.js
    const { Engine, Bodies, World } = Matter

    const engine = Engine.create()
    const world = engine.world

    // Configure the simulation parameters
    engine.timing.timeScale = 0.5  // Slower simulation

    const canvasWidth = 800
    const canvasHeight = 1000

    // Seed the random number generator
    const rng = seedrandom(seed)

    // Create pegs
    const rows = 15
    const cols = 12
    const pegRadius = 5
    const pegOffsetX = canvasWidth / (cols + 1)
    const pegOffsetY = 50

    const pegPositions = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Introduce randomness to peg positions
        const xJitter = rng() * 10 - 5  // Random offset between -5 and +5
        const yJitter = rng() * 10 - 5
        const x = pegOffsetX + col * pegOffsetX + (row % 2 === 0 ? pegOffsetX / 2 : 0) + xJitter
        const y = 100 + row * pegOffsetY + yJitter
        pegPositions.push({ x, y })
        const peg = Bodies.circle(x, y, pegRadius, {
          isStatic: true,
        })
        World.add(world, peg)
      }
    }

    // Create walls
    const wallOptions = { isStatic: true }
    const ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + 50, canvasWidth, 100, wallOptions)
    const leftWall = Bodies.rectangle(-50, canvasHeight / 2, 100, canvasHeight, wallOptions)
    const rightWall = Bodies.rectangle(canvasWidth + 50, canvasHeight / 2, 100, canvasHeight, wallOptions)

    World.add(world, [ground, leftWall, rightWall])

    // Create balls for each player
    const ballRadius = 10
    const ballStartingPositions = []
    const balls = players.map((player, index) => {
      // Introduce randomness to ball starting positions
      const xRandomOffset = rng() * 40 - 20  // Random offset between -20 and +20
      const xPosition = canvasWidth / 2 + (index - (players.length - 1) / 2) * 30 + xRandomOffset
      ballStartingPositions.push(xPosition)
      const ball = Bodies.circle(
        xPosition,
        50,
        ballRadius,
        {
          restitution: 0.5,
          label: player,
        },
      )
      World.add(world, ball)
      return ball
    })

    // Simulate the game without rendering
    const runner = Matter.Runner.create()
    let simulationTime = 0
    const maxSimulationTime = 20000  // Maximum simulation time in milliseconds
    const timeIncrement = 1000 / 60  // 60 steps per second
    let winner = null
    const ballReachedBottom = {}

    while (simulationTime < maxSimulationTime) {
      Matter.Engine.update(engine, timeIncrement)
      simulationTime += timeIncrement

      balls.forEach((ball) => {
        if (!ballReachedBottom[ball.label] && ball.position.y >= canvasHeight - 100) {
          ballReachedBottom[ball.label] = simulationTime
          if (!winner) {
            winner = ball.label
          }
        }
      })

      if (Object.keys(ballReachedBottom).length === balls.length) {
        break
      }
    }

    Matter.World.clear(world, false)
    Matter.Engine.clear(engine)

    return {
      winner,
      pegPositions,
      ballStartingPositions,
      seed,
    }
  }

  const playSimulation = (simulationData, players, playerColors) => {
    const { pegPositions, ballStartingPositions, seed } = simulationData

    // Initialize Matter.js
    const { Engine, Render, Runner, Bodies, World, Events } = Matter

    const engine = Engine.create()
    const world = engine.world

    // Configure the simulation parameters
    engine.timing.timeScale = 0.5  // Slower simulation

    const canvasWidth = 800
    const canvasHeight = 1000

    // Seed the random number generator
    const rng = seedrandom(seed)

    // Create pegs using stored positions
    const pegRadius = 5

    pegPositions.forEach(({ x, y }) => {
      const peg = Bodies.circle(x, y, pegRadius, {
        isStatic: true,
        render: { fillStyle: '#ffffff' },
      })
      World.add(world, peg)
    })

    // Create walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#ffffff' } }
    const leftWall = Bodies.rectangle(-50, canvasHeight / 2, 100, canvasHeight, wallOptions)
    const rightWall = Bodies.rectangle(canvasWidth + 50, canvasHeight / 2, 100, canvasHeight, wallOptions)

    // Create Ground with Sprite Texture
    const groundTextureDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAZElEQVR4AWMY6OHp//8/BRgYGE0WMjA4CJYDA4P/v0H8wCgqMoBE3YBEFI5OAnQyP//+we/GDAiZwgYmMgYGRkZ2f/+/Xv4p4G+G6MGhQ0A8dIyWJ8KDEYOh4eoHDgAFiRCixIkxQAAAABJRU5ErkJggg=='

    const groundImage = new Image()
    groundImage.src = groundTextureDataUrl

    groundImage.onload = () => {
      const ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + 50, canvasWidth, 100, {
        isStatic: true,
        render: {
          sprite: {
            texture: groundTextureDataUrl,
            xScale: canvasWidth / 16, // Adjust scaling based on image dimensions
            yScale: 100 / 16,
          },
        },
      })

      World.add(world, [ground, leftWall, rightWall])

      // Create balls using stored starting positions
      const ballRadius = 10
      const balls = players.map((player, index) => {
        const xPosition = ballStartingPositions[index]
        const ball = Bodies.circle(
          xPosition,
          50,
          ballRadius,
          {
            restitution: 0.5,
            label: player,
            render: {
              fillStyle: playerColors[player],
            },
          }
        )
        World.add(world, ball)
        return ball
      })

      // Detect when balls have reached the bottom
      Events.on(engine, 'afterUpdate', () => {
        const allBallsStopped = balls.every((ball) => ball.position.y >= canvasHeight - 100)
        if (allBallsStopped && !simulationEnded) {
          setSimulationEnded(true)
          Runner.stop(runner)
          Render.stop(render)
          engine.events = {}
          engine.world.bodies = []
        }
      })

      // Start the engine and rendering
      const render = Render.create({
        element: canvasRef.current,
        engine: engine,
        options: {
          width: canvasWidth,
          height: canvasHeight,
          wireframes: false,
          background: '#0b0b13',
        },
      })

      Engine.run(engine)
      Render.run(render)
      const runner = Runner.create()
      Runner.run(runner, engine)
    }

    groundImage.onerror = () => {
      console.error('Failed to load ground image.')

      // Fallback: Use solid color for ground
      const ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + 50, canvasWidth, 100, {
        isStatic: true,
        render: { fillStyle: '#ffffff' },
      })

      World.add(world, [ground, leftWall, rightWall])

      // Create balls using stored starting positions
      const ballRadius = 10
      const balls = players.map((player, index) => {
        const xPosition = ballStartingPositions[index]
        const ball = Bodies.circle(
          xPosition,
          50,
          ballRadius,
          {
            restitution: 0.5,
            label: player,
            render: {
              fillStyle: playerColors[player],
            },
          }
        )
        World.add(world, ball)
        return ball
      })

      // Detect when balls have reached the bottom
      Events.on(engine, 'afterUpdate', () => {
        const allBallsStopped = balls.every((ball) => ball.position.y >= canvasHeight - 100)
        if (allBallsStopped && !simulationEnded) {
          setSimulationEnded(true)
          Runner.stop(runner)
          Render.stop(render)
          engine.events = {}
          engine.world.bodies = []
        }
      })

      // Start the engine and rendering
      const render = Render.create({
        element: canvasRef.current,
        engine: engine,
        options: {
          width: canvasWidth,
          height: canvasHeight,
          wireframes: false,
          background: '#0b0b13',
        },
      })

      Engine.run(engine)
      Render.run(render)
      const runner = Runner.create()
      Runner.run(runner, engine)
    }
  }

  const resetSimulation = () => {
    setSimulationStarted(false)
    setSimulationEnded(false)
    setSelectedSimulationData(null)
    setError(null)
    setWinnerPlayer(null)
  }

  if (loading) {
    return <div>Loading game simulation...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!event) {
    return <div>No event data available</div>
  }

  const { data } = event

  const gameId = data.gameId
  const gameAccount = data.gameAccount
  const mint = data.mint
  const players = data.players
  const winners = data.winners
  const payouts = data.payouts
  const totalWager = data.totalWager
  const totalGambaFee = data.totalGambaFee

  return (
    <div className="gameSimulation" style={simulationStyles}>
      <div style={headerStyles}>
        <h2>Game Simulation</h2>
      </div>
      <div>
        <strong>Transaction ID:</strong>{' '}
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {signature}
        </a>
      </div>
      <div>
        <strong>Game ID:</strong> {gameId}
      </div>
      <div>
        <strong>Game Account:</strong> {gameAccount}
      </div>
      <div>
        <strong>Mint:</strong> {mint}
      </div>
      <div>
        <strong>Total Wager:</strong> {totalWager}
      </div>
      <div>
        <strong>Total Gamba Fee:</strong> {totalGambaFee}
      </div>
      <div>
        <strong>Players:</strong>
        <ul>
          {players.map((player, index) => (
            <li key={index}>
              <span style={{ color: playerColors[player] || 'black' }}>●</span> {player}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Winners:</strong>
        <ul>
          {winners.map((winner, index) => (
            <li key={index}>{winner}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Payouts:</strong>
        <ul>
          {payouts.map((payout, index) => (
            <li key={index}>{payout}</li>
          ))}
        </ul>
      </div>
      {!showSimulation && (
        <button onClick={() => setShowSimulation(true)} style={{ marginTop: '20px' }}>
          Show Game
        </button>
      )}
      {showSimulation && (
        <div style={{ marginTop: '20px' }}>
          {!simulationStarted && (
            <button onClick={() => {
              setSimulationStarted(true)
              setError(null)
            }}>Start Simulation</button>
          )}
          {simulationStarted && simulationEnded && (
            <button onClick={resetSimulation}>View Game Again</button>
          )}
          <div>
            <h3>Player Colors:</h3>
            <ul>
              {players.map((player, index) => (
                <li key={index}>
                  <span style={{ color: playerColors[player] || 'black' }}>●</span> {player}
                </li>
              ))}
            </ul>
          </div>
          <div ref={canvasRef}></div>
          {simulationEnded && winnerPlayer && (
            <div>
              <h3>Game Over!</h3>
              <h4>The winner is: {winnerPlayer}</h4>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GameSimulation

const simulationStyles = {
  padding: '20px',
}

const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}
