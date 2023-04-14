import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from 'gamba-core'
import { useGamba } from 'gamba-react'
import { useState } from 'react'
import styled from 'styled-components'
import { Modal } from './components/Modal'
import { Button, Padding } from './styles'

const WalletButton = styled.button`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: none;
  border: none;
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

function SelectWallet() {
  const { wallets } = useWallet()
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)

  const connect = async (wallet: Wallet) => {
    try {
      setLoading(true)
      const session = await gamba.connect(wallet)
      return session
    } catch (err) {
      console.error('Modal Error', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Padding><b>Select Wallet</b></Padding>
      <div style={{ display: 'grid' }}>
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
            <img src={wallet.adapter.icon} width="30" height="30" />
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
      <Padding>
        <div><b>Create Account</b></div>
      </Padding>
      <Padding>
        <Button disabled={loading} onClick={createAccount}>
          Create account
        </Button>
        <Button onClick={() => gamba.disconnect()}>
          Change wallet
        </Button>
      </Padding>
    </>
  )
}

function Account() {
  const gamba = useGamba()
  const [loading, setLoading] = useState(false)

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

  if (!gamba.user || !gamba.wallet) return null
  return (
    <>
      <Padding>
        <b>
          {gamba.wallet.publicKey.toBase58()}
        </b>
      </Padding>
      <Padding>
        <img
          width="50"
          height="50"
          src={`https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=50,height=50,quality=85/https://swr.xnfts.dev/avatars/${gamba.wallet.publicKey.toBase58()}/1681424998617?size=400`}
        />
        <div>
          Status: {gamba.user.status}
        </div>
        <div>
          Balance: {gamba.balances.wallet / LAMPORTS_PER_SOL} SOL
        </div>
        <Button disabled={loading || !gamba.balances.user} onClick={() => withdraw()}>
          +{gamba.balances.user / LAMPORTS_PER_SOL} SOL
        </Button>
        <Button disabled={loading} onClick={() => closeUserAccount()}>
          Close account
        </Button>
        <Button onClick={() => gamba.refresh()}>
          Refresh
        </Button>
        <Button onClick={() => gamba.disconnect()}>
          Disconnect
        </Button>
      </Padding>
    </>
  )
}

export const GambaModal = ({ onClose }: {onClose: () => void}) => {
  const { session, user } = useGamba()

  return (
    <Modal onClose={onClose}>
      {(!session || !session.wallet.state) ? (
        <SelectWallet />
      ) : !user?.created ? (
        <CreateAccount />
      ) : (
        <Account />
      )}
    </Modal>
  )
}
