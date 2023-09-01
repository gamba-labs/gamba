import { useConnection, useWallet, Wallet } from '@solana/wallet-adapter-react'
import { useBonusBalance, useGamba } from 'gamba-react'
import { useContext, useState } from 'react'
import styled from 'styled-components'
import { Button } from './components/Button'
import { Flash } from './components/Flash'
import { HexColor } from './components/HexColor'
import { GambaUiContext, useGambaUi } from './context'
import { Flex, StylelessButton } from './styles'
import { Info, Refresh } from './Svg'
import { copyTextToClipboard, formatLamports } from './utils'

function useGambaUiCallbacks() {
  const {
    onError = () => null,
    onWithdraw = () => null,
  } = useContext(GambaUiContext)
  return { onError, onWithdraw }
}

const statusMapping = {
  none: 'None',
  playing: 'Ready',
  seedRequested: 'Initializing Account',
  hashedSeedRequested: 'Generating Results',
}

const Address = styled.button`
  border: none;
  margin: 0;
  outline: none;
  display: block;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  background: #FFFFFF11;
  color: white;
  padding: 5px 10px;
  border-radius: 10px;
`

const ModalFooter = styled.div`
  background: #10141f;
  position: absolute;
  bottom: 0px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-weight: lighter;
`

const Content = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Balances = styled.div`
  display: flex;
  justify-content: space-evenly;
  text-align: center;
  & > div {
    & > div:last-child {
      font-weight: bold;
      opacity: .5;
      text-transform: uppercase;
    }
  }
`

function ConnectWallet() {
  const { onError } = useGambaUiCallbacks()
  const { wallets, select } = useWallet()
  const [loading, setLoading] = useState(false)

  const selectWallet = async (wallet: Wallet) => {
    try {
      setLoading(true)
      select(wallet.adapter.name)
      await wallet.adapter.connect()
    } catch (err) {
      console.error('Modal Error', err)
      setLoading(false)
      onError(err)
    } finally {
      // setLoading(false)
    }
  }

  return (
    <>
      <h1>Connect Wallet</h1>
      <div>
        {wallets.length === 0 && (
          <>
            You need a Solana wallet to connect
          </>
        )}
        {wallets.map((wallet, i) => (
          <Button
            key={i}
            className="list"
            onClick={() => selectWallet(wallet)}
            disabled={loading}
          >
            {wallet.adapter.name}
            <img
              src={wallet.adapter.icon}
              width="20"
              height="20"
            />
          </Button>
        ))}
      </div>
    </>
  )
}

function CreateAccount() {
  const wallet = useWallet()
  const { onError } = useGambaUiCallbacks()
  const { tos } = useGambaUi()
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)
  const [showTnc, setShowTnc] = useState(false)

  const createAccount = async () => {
    try {
      setLoading(true)
      const res = await gamba.createAccount()
      const response = await res.result()
      return response
    } catch (err) {
      console.error('Modal Error', err)
      onError(err)
    } finally {
      setLoading(false)
    }
  }
  const createAccountOrShowTnc = () => {
    if (tos) {
      setShowTnc(true)
    } else {
      createAccount()
    }
  }

  if (tos && showTnc) {
    return (
      <>
        <h1>Terms of Service</h1>
        <div style={{ padding: 20, fontSize: '12px' }}>
          {tos}
        </div>
        <div style={{ padding: 20, display: 'flex', justifyContent: 'space-around' }}>
          <Button loading={loading} onClick={createAccount}>
            Accept
          </Button>
          <Button disabled={loading} onClick={() => setShowTnc(false)}>
            Cancel
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <h1>Create Account</h1>
      <Content>
        <Button className="primary" loading={loading} onClick={createAccountOrShowTnc}>
          Create account
        </Button>
      </Content>
      <>
        <Button className="list" onClick={() => wallet.disconnect()}>
          Change wallet
        </Button>
      </>
    </>
  )
}

function Account() {
  const { onError, onWithdraw } = useGambaUiCallbacks()
  const bonusBalance = useBonusBalance()
  const wallet = useWallet()
  const gamba = useGamba()
  const [loading, setLoading] = useState<string>()

  const closeUserAccount = async () => {
    try {
      if (gamba.balances.bonus > 0) {
        if (!confirm(`If you close your account you will lose your bonus balance (${formatLamports(gamba.balances.bonus, 'SOL')}). Are you sure?`))
          return
      }
      setLoading('close')
      const res = await gamba.closeAccount()
      const response = await res.result()
      return response
    } catch (err) {
      console.error('Modal Error', err)
      onError(err)
    } finally {
      setLoading(undefined)
    }
  }

  const withdraw = async () => {
    try {
      setLoading('withdraw')
      const res = await gamba.withdraw()
      const response = await res.result()
      onWithdraw(response.status)
      return response
    } catch (err) {
      console.error('Modal Error', err)
      onError(err)
    } finally {
      setLoading(undefined)
    }
  }

  const refreshAccount = async () => {
    try {
      setLoading('refresh')
      await gamba.refresh()
    } catch (err) {
      console.error('Modal Error', err)
      onError(err)
    } finally {
      setLoading(undefined)
    }
  }

  const redeemBonus = async () => {
    try {
      setLoading('redeem')
      await gamba.redeemBonusToken()
    } catch (err) {
      console.error('Modal Error', err)
      onError(err)
    } finally {
      setLoading(undefined)
    }
  }

  if (!gamba.user || !gamba.wallet) {
    return null
  }

  const accountStatus = loading === 'refresh' ? 'Fetching' : statusMapping[gamba.user.status]

  return (
    <>
      <h1>
        <Flash>
          {formatLamports(gamba.balances.total - gamba.balances.user)}
        </Flash>
      </h1>
      <Balances>
        {gamba.balances.user > 0 && (
          <div>
            <Flash>
              {formatLamports(gamba.balances.user)}
            </Flash>
            <div>
              Claimable
            </div>
          </div>
        )}
        {gamba.balances.bonus > 0 && (
          <div>
            <Flash>
              {formatLamports(gamba.balances.bonus)}
            </Flash>
            <div>
              Bonus
            </div>
          </div>
        )}
      </Balances>
      <Content>
        <Address onClick={() => copyTextToClipboard(gamba.wallet!.publicKey.toBase58())}>
          <HexColor>
            {gamba.wallet.publicKey.toBase58()}
          </HexColor>
        </Address>
        {gamba.balances.user > 0 && (
          <Button className="primary" loading={loading === 'withdraw'} onClick={withdraw} disabled={gamba.user.status !== 'playing'}>
            Claim {formatLamports(gamba.balances.user)}
          </Button>
        )}
        {bonusBalance > 0 && (
          <Button className="primary" loading={loading === 'redeem'} onClick={redeemBonus}>
            Redeem Bonus ({formatLamports(bonusBalance, 'gSOL')})
          </Button>
        )}
      </Content>
      <Button className="list" loading={loading === 'close'} onClick={() => closeUserAccount()}>
        Close account
      </Button>
      <Button className="list" onClick={() => wallet.disconnect()}>
        Disconnect wallet
      </Button>
      <ModalFooter>
        <div>
          Status: <Flash>{accountStatus}</Flash>
        </div>
        <Flex>
          <StylelessButton disabled={loading === 'refresh'} style={{ color: 'white' }} onClick={refreshAccount}>
            <Refresh />
          </StylelessButton>
          <a target="_blank" href="https://gamba.so/docs/account#status" rel="noreferrer">
            <Info />
          </a>
        </Flex>
      </ModalFooter>
    </>
  )
}

export function GambaModal() {
  const { wallet, user } = useGamba()
  const { connected } = useWallet()
  const { connection } = useConnection()
  return (
    <>
      {!connection ? (
        <>No Connection...</>
      ) : (!connected || !wallet.publicKey) ? (
        <ConnectWallet />
      ) : !user?.created ? (
        <CreateAccount />
      ) : (
        <Account />
      )}
    </>
  )
}
