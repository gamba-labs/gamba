import { useGambaContext } from '../GambaProvider'
export { useAccount } from './useAccount'
export { useBalance, useWalletAddress } from './useBalances'
export * from './useGamba'
export * from './useGambaEvents'
export * from './useGambaPlay'
export * from './usePool'
export * from './useSendTransaction'
export * from './useTransactionStore'

export function useGambaProvider() {
  return useGambaContext().provider
}

export function useGambaProgram() {
  return useGambaProvider().gambaProgram
}
