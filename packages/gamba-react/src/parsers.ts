import { HouseState, StateAccount, UserState } from 'gamba-core'

type UserStatus = keyof UserState['status']
const parseStatus = (x: UserState['status']) => Object.keys(x)[0] as UserStatus

export const parseUserAccount = (account: StateAccount<UserState | undefined> | undefined) => {
  if (!account?.state || !account?.info) {
    return null
  }
  const { state, info } = account

  const subtractedUserBalance = (() => {
    if (state.status.hashedSeedRequested) {
      return state.currentGame.wager.toNumber() as number
    }
    return 0
  })()

  return {
    publicKey: account.publicKey,
    created: state.created,
    status: parseStatus(state.status),
    balance: (state.balance.toNumber() as number) - subtractedUserBalance,
    bonusBalance: state.bonusBalance.toNumber() as number,
    nonce: state.nonce.toNumber() as number,
    _accountBalance: info.lamports,
    state,
  }
}

export const parseHouseAccount = (account: StateAccount<HouseState | undefined> | undefined) => {
  if (!account?.state || !account?.info) {
    return null
  }
  const { state, info } = account
  const houseFee = state.houseFee.toNumber() / 1000
  const creatorFee = state.creatorFee.toNumber() / 1000
  return {
    publicKey: account.publicKey,
    state,
    balance: info.lamports,
    maxPayout: state.maxPayout.toNumber() as number,
    fees: {
      total: houseFee + creatorFee,
      house: houseFee,
      creator: creatorFee,
    },
  }
}

export const parseWalletAccount = (account: StateAccount<any> | undefined) => {
  if (!account?.info) {
    return null
  }
  const { info } = account
  return { publicKey: account.publicKey, balance: info.lamports }
}
