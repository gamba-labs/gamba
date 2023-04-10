import { ConnectionProvider, ConnectionProviderProps, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { clusterApiUrl } from '@solana/web3.js'
import { ReactNode } from 'react'

export interface SolanaProviderProps {
  connection?: Omit<ConnectionProviderProps, 'children'>
}

export function SolanaProvider({ children, connection }: {children: ReactNode} & SolanaProviderProps) {
  const endpoint = connection?.endpoint ?? clusterApiUrl()
  return (
    <ConnectionProvider {...connection} endpoint={endpoint}>
      <WalletProvider autoConnect wallets={[]}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
