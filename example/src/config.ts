import { clusterApiUrl } from '@solana/web3.js'

export const getConfig = () => {
  const conf = import.meta.env
  return {
    rpcEndpoint: conf.VITE_RPC_ENDPOINT || clusterApiUrl(),
    rpcWsEndpoint: conf.VITE_RPC_WS_ENDPOINT || undefined,
    gambaName: conf.VITE_GAMBA_NAME || 'Gamba Flip',
    gambaCreator: conf.VITE_GAMBA_CREATOR || undefined,
  }
}
