import { Connection } from '@solana/web3.js'
import { config } from './config'

export const connection = new Connection(
  config().SOLANA_RPC_ENDPOINT,
  { commitment: 'confirmed' },
)
