import { useGambaContext } from '../GambaProvider'
export { useAccount, useAccountStore } from './useAccount'
export { useBalance, useWalletAddress } from './useBalances'
export * from './useGamba'
export * from './useGambaEvents'
export * from './usePool'
export * from './useSendTransaction'

export function useGambaProvider() {
  return useGambaContext().provider
}

export function useGambaProgram() {
  return useGambaProvider().gambaProgram
}
