import { config as dotenvConfig } from 'dotenv'

let configed = false

export const config = () => {
  if (configed) {
    return process.env
  }

  dotenvConfig()

  if (!process.env.HELIUS_API_KEY) {
    throw new Error('Helius key not specified')
  }

  if (!process.env.SOLANA_RPC_ENDPOINT) {
    throw new Error('RPC not specified')
  }
  configed = true
  return process.env
}
