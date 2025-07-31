// packages/react/src/multiplayer/instructions.ts

// Re-export ALL raw instruction builders + their types
export {
  joinGameIx,
  leaveGameIx,
  createGameIx,
  distributeNativeIx,
  distributeSplIx,
  selectWinnersIx,
  gambaConfigIx,
} from '@gamba-labs/multiplayer-sdk'

export type {
  JoinGameParams,
  LeaveGameParams,
  CreateGameParams,
  DistributeNativeParams,
  DistributeSplParams,
  SelectWinnersParams,
  GambaConfigParams,
} from '@gamba-labs/multiplayer-sdk'
