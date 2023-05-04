import { useConnection, useWallet, Wallet } from '@solana/wallet-adapter-react'
import { useGamba } from 'gamba-react'
import { useState } from 'react'
import styled from 'styled-components'
import { Button } from './components/Button'
import { HexColor } from './components/HexColor'
import { formatLamports } from './utils'

const statusMapping = {
  none: 'None',
  playing: 'Ready',
  seedRequested: 'Initializing Account',
  hashedSeedRequested: 'Generating Results',
}

const Content = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 20px;
`

const WalletButton = styled.button`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: none;
  border: none;
  width: 100%;
  margin: 0;
  transition: background .2s, opacity .2s;
  text-align: left;
  color: white;
  &:disabled {
    opacity: .5;
  }
  &:hover:not(:disabled) {
    background: #FFFFFF11;
  }
`

const Address = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  background: #00000033;
  padding: 2px;
  border-radius: 2px;
`

const List = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

function ConnectWallet() {
  const { wallets, select } = useWallet()
  const [loading, setLoading] = useState(false)

  const connect = async (wallet: Wallet) => {
    try {
      setLoading(true)
      select(wallet.adapter.name)
      await wallet.adapter.connect()
    } catch (err) {
      console.error('Modal Error', err)
      setLoading(false)
    } finally {
      // setLoading(false)
    }
  }

  return (
    <>
      <Content>
        <h1>Connect Wallet</h1>
      </Content>
      <div>
        {wallets.length === 0 && (
          <>
            You need a Solana wallet to connect
          </>
        )}
        {wallets.map((wallet, i) => (
          <WalletButton
            key={i}
            onClick={() => connect(wallet)}
            disabled={loading}
          >
            {wallet.adapter.name}
            <img
              src={wallet.adapter.icon}
              width="30"
              height="30"
            />
          </WalletButton>
        ))}
      </div>
    </>
  )
}

function CreateAccount() {
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)

  const createAccount = async () => {
    try {
      const res = await gamba.createAccount()
      setLoading(true)
      const response = await res.result()
      return response
    } catch (err) {
      console.error('Modal Error', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Content>
        <h1>Create Account</h1>
      </Content>
      <List>
        <Button loading={loading} onClick={createAccount}>
          Create account
        </Button>
        <Button onClick={() => gamba.disconnect()}>
          Change wallet
        </Button>
      </List>
    </>
  )
}

function Account() {
  const gamba = useGamba()
  const [loading, setLoading] = useState<string>()

  const closeUserAccount = async () => {
    try {
      const res = await gamba.closeAccount()
      setLoading('close')
      const response = await res.result()
      return response
    } catch (err) {
      console.error('Modal Error', err)
    } finally {
      setLoading(undefined)
    }
  }

  const withdraw = async () => {
    try {
      const res = await gamba.withdraw()
      setLoading('withdraw')
      const response = await res.result()
      return response
    } catch (err) {
      console.error('Modal Error', err)
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
    } finally {
      setLoading(undefined)
    }
  }

  if (!gamba.user || !gamba.wallet) return null
  return (
    <>
      <Content>
        <h1>
          {formatLamports(gamba.balances.wallet)}
        </h1>
      </Content>
      <List>
        <Address>
          <HexColor>
            {gamba.wallet.publicKey.toBase58()}
          </HexColor>
        </Address>
        <div>
          Status: {statusMapping[gamba.user.status]}
        </div>
        {gamba.balances.user > 0 && (
          <Button loading={loading === 'withdraw'} onClick={withdraw}>
            Claim {formatLamports(gamba.balances.user)}
          </Button>
        )}
        <Button loading={loading === 'refresh'} onClick={refreshAccount}>
          Refresh
        </Button>
        {/* <Button onClick={() => alert(JSON.stringify(gamba.user?.state, null, 2))}>
          Debug
        </Button> */}
        <Button loading={loading === 'close'} onClick={() => closeUserAccount()}>
          Close account
        </Button>
        <Button onClick={() => gamba.disconnect()}>
          Disconnect
        </Button>
      </List>
    </>
  )
}

export const GambaModal = () => {
  const { session, user } = useGamba()
  const { connected } = useWallet()
  const { connection } = useConnection()

  return (
    <>
      {!connection ? (
        <>No Connection...</>
      ) : (!connected || !session?.wallet.info) ? (
        <ConnectWallet />
      ) : !user?.created ? (
        <CreateAccount />
      ) : (
        <Account />
      )}
    </>
  )
}
