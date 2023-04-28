import { useConnection, useWallet, Wallet } from '@solana/wallet-adapter-react'
import { lamportsToSol } from 'gamba-core'
import { useGamba } from 'gamba-react'
import { useState } from 'react'
import styled from 'styled-components'
import { Button } from './components/Button'
import { Modal } from './components/Modal'
import { Padding } from './styles'

const statusMapping = {
  none: 'None',
  playing: 'Ready',
  seedRequested: 'Initializing Account',
  hashedSeedRequested: 'Generating Results',
}

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
  cursor: pointer;
  color: unset;
  transition: background .2s, opacity .2s;
  text-align: left;
  &:disabled {
    opacity: .5;
  }
  &:hover:not(:disabled) {
    background: #FFFFFF11;
  }
`

const Address = styled.div`
  overflow: auto;
  text-overflow: ellipsis;
`

function SelectWallet() {
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
      <div>
        <Padding><b>Select Wallet</b></Padding>
        {wallets.length === 0 && (
          <Padding>
            You need a Solana wallet to connect
          </Padding>
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
    <div>
      <Padding style={{ display: 'grid', gap: 20 }}>
        <div><b>Create Account</b></div>
        <Button loading={loading} onClick={createAccount}>
          Create account
        </Button>
        <Button onClick={() => gamba.disconnect()}>
          Change wallet
        </Button>
      </Padding>
    </div>
  )
}

function Account() {
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const closeUserAccount = async () => {
    try {
      const res = await gamba.closeAccount()
      setLoading(true)
      const response = await res.result()
      return response
    } catch (err) {
      console.error('Modal Error', err)
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async () => {
    try {
      const res = await gamba.withdraw()
      setLoading(true)
      const response = await res.result()
      return response
    } catch (err) {
      console.error('Modal Error', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshAccount = async () => {
    try {
      setRefreshing(true)
      await gamba.refresh()
    } catch (err) {
      console.error('Modal Error', err)
    } finally {
      setRefreshing(false)
    }
  }

  if (!gamba.user || !gamba.wallet) return null
  return (
    <>
      <div style={{ height: '100%' }}>
        <Padding style={{ display: 'grid', gap: 20 }}>
          <div style={{ textAlign: 'center', fontSize: '32px' }}>
            {parseFloat(lamportsToSol(gamba.balances.wallet).toFixed(4))} SOL
          </div>
          <Address>
            {gamba.wallet.publicKey.toBase58()}
          </Address>
          <div>
            Status: {statusMapping[gamba.user.status]}
          </div>
          {gamba.balances.user > 0 && (
            <Button onClick={withdraw}>
              Claim {parseFloat(lamportsToSol(gamba.balances.user).toFixed(4))} SOL
            </Button>
          )}
          <Button loading={refreshing} onClick={refreshAccount}>
            Refresh
          </Button>
          <Button loading={loading} onClick={() => closeUserAccount()}>
            Close account
          </Button>
          <Button onClick={() => gamba.disconnect()}>
            Disconnect
          </Button>
        </Padding>
      </div>
    </>
  )
}

export const GambaModal = ({ onClose }: {onClose: () => void}) => {
  const { session, user } = useGamba()
  const { connected } = useWallet()
  const { connection } = useConnection()

  return (
    <Modal onClose={onClose}>
      {!connection ? (
        <>No Connection...</>
      ) : (!connected || !session?.wallet.info) ? (
        <SelectWallet />
      ) : !user?.created ? (
        <CreateAccount />
      ) : (
        <Account />
      )}
    </Modal>
  )
}
