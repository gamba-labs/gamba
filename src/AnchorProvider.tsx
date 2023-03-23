import { AnchorProvider as AnchorProviderClass, Program } from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { IDL, PROGRAM_ID } from './constants'
import { Gamba } from './idl'

export const AnchorContext = createContext<Program<Gamba>>(null!)

export function AnchorProvider({ children }: {children: ReactNode}) {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const program = useMemo(() => {
    const provider = new AnchorProviderClass(
      connection,
      wallet!,
      { preflightCommitment: 'processed' },
    )
    return new Program(IDL, PROGRAM_ID, provider)
  }, [wallet, connection])
  return (
    <AnchorContext.Provider value={program}>
      {children}
    </AnchorContext.Provider>
  )
}

export function useAnchorProgram() {
  return useContext(AnchorContext)
}
