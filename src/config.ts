import { PublicKey } from '@solana/web3.js'

export interface GambaConfig {
  /**
   * The name of the game
   */
  name: string
  /**
   * The address that receives fees
   */
  creator: PublicKey
}

export type GambaConfigInput = Omit<GambaConfig, 'creator'> & {
  /**
   * The address that receives fees
   */
  creator: PublicKey | string
}

/**
 * Creates a config to be used in Gamba
 * @param config
 * @returns A GambaConfig object
 */
export const createConfig = (config: GambaConfigInput): GambaConfig => {
  return {
    ...config,
    creator: new PublicKey(config.creator),
  }
}
