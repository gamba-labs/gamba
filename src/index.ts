export { LAMPORTS_PER_SOL } from '@solana/web3.js'
export { createConfig, type GambaConfig } from './config'
export { useFetchState, useGamba, useGambaResult, type GambaState } from './hooks'
export { Gamba, type GambaProps } from './provider'
export { type GameResult } from './types'
import * as buffer from 'buffer'

window.Buffer = buffer.Buffer
