import { useConnection, useWallet, Wallet } from '@solana/wallet-adapter-react'
import { solToLamports } from 'gamba-core'
import { useGamba } from 'gamba-react'
import { useContext, useState } from 'react'
import styled from 'styled-components'
import { Button } from './components/Button'
import { HexColor } from './components/HexColor'
import { GambaUiContext, useGambaUi } from './context'
import { formatLamports } from './utils'

function useCallbacks() {
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

const Content = styled.div`
  width: 100%;
  padding: 20px;
  h1 {
    font-size: 24px;
    padding-top: 20px;
    text-align: center;
  }
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

const Address = styled.button`
  border: none;
  margin: 0;
  outline: none;
  display: block;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  background: #00000033;
  padding: 5px 10px;
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
  const { onError } = useCallbacks()
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
            onClick={() => selectWallet(wallet)}
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
  const { onError } = useCallbacks()
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
        <Content>
          <h1>Terms of Service</h1>
        </Content>
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
      <Content>
        <h1>Create Account</h1>
      </Content>
      <List>
        <Button loading={loading} onClick={createAccountOrShowTnc}>
          Create account
        </Button>
        <Button onClick={() => gamba.disconnect()}>
          Change wallet
        </Button>
      </List>
    </>
  )
}
export async function copyTextToClipboard(text: string) {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text)
  } else {
    return document.execCommand('copy', true, text)
  }
}
function Account() {
  const { onError, onWithdraw } = useCallbacks()
  const gamba = useGamba()
  const [loading, setLoading] = useState<string>()

  const closeUserAccount = async () => {
    try {
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

  if (!gamba.user || !gamba.wallet) {
    return null
  }

  return (
    <>
      <Content>
        <h1>
          {formatLamports(gamba.balances.wallet)}
        </h1>
      </Content>
      <List>
        <Address onClick={() => copyTextToClipboard(gamba.wallet!.publicKey.toBase58())}>
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
      ) : (!connected || !session?.wallet.publicKey) ? (
        <ConnectWallet />
      ) : !user?.created ? (
        <CreateAccount />
      ) : (
        <Account />
      )}
    </>
  )
}
