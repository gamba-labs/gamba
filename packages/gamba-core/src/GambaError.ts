
import { AnchorError } from '@coral-xyz/anchor'
import { Gamba } from './idl'

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error
  if (typeof error === 'object' && !!error && 'message' in error && typeof error.message === 'string') return error.message
  return JSON.stringify(error)
}

const getErrorLogs = (error: unknown) => {
  if (typeof error === 'object' && !!error && 'logs' in error && Array.isArray(error.logs)) return error.logs as string[]
  return null
}

const getGambaClientError = (error: unknown) => {
  if (typeof error === 'object' && !!error && 'gambaClientError' in error && typeof error.gambaClientError === 'string') return error.gambaClientError as GambaClientError
  return null
}

type ProgramErrorCode = Gamba['errors'][number]['name']
type GambaClientError = 'WalletNotConnected'
type ErrorCode = 'GenericClientError' | 'InsufficentFunds' | 'AccountNotInitialized' | GambaClientError | ProgramErrorCode

export const clientError = (gambaClientError: GambaClientError) => ({ gambaClientError })

export class GambaError extends Error {
  logs: string[] | null = null

  code: ErrorCode

  constructor(error: unknown) {
    const errorMessage = getErrorMessage(error)
    const logs = getErrorLogs(error)
    const clientError = getGambaClientError(error)

    super(errorMessage)

    if (clientError) {
      this.code = clientError
      return
    }

    if (logs) {
      this.logs = logs
      const anchorError = AnchorError.parse(logs)
      if (anchorError) {
        this.code = anchorError.error.errorCode.code as ProgramErrorCode
        return
      }
    }

    this.code = 'GenericClientError'
  }
}
