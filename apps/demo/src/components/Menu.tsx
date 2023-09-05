import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useBonusBalance, useGamba } from 'gamba/react'
import { Svg, copyTextToClipboard, formatLamports } from 'gamba/react-ui'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from './Button'
import { useOnClickOutside } from './Dropdown'
import { Loader } from './Loader'
import { Modal } from './Modal'
import { Money, Value } from './Value'

function usePromise<T>(pp: () => Promise<T>) {
  const [loading, setLoading] = useState(false)

  const func = async () => {
    try {
      setLoading(true)
      await pp()
    } finally {
      setLoading(false)
    }
  }

  return [func, loading] as const
}

function RedeemBonusButton() {
  const gamba = useGamba()
  const [redeemTokens, loading] = usePromise(gamba.methods.redeemBonusToken)
  const bonusBalance = useBonusBalance()

  if (bonusBalance === 0) {
    return null
  }

  return (
    <Button loading={loading} className="yellow list shine" onClick={redeemTokens}>
      Redeem {formatLamports(bonusBalance, 'gSOL')}
    </Button>
  )
}

function ClaimButton() {
  const gamba = useGamba()
  const [claim, loading] = usePromise(
    async () => {
      const res = await gamba.methods.withdraw()
      await res.result()
    },
  )

  if (gamba.balances.user === 0) {
    return null
  }

  return (
    <Button loading={loading} className="green list shine" onClick={claim}>
      Claim {formatLamports(gamba.balances.user)}
    </Button>
  )
}

const Menu = styled.div`
  position: relative;
  min-width: 200px;
  & > .menu {
    opacity: 0;
    transition: transform .2s ease, opacity .2s;
    pointer-events: none;
    width: 100%;
    overflow: hidden;
    position: absolute;

    background: #222233 ;
    border-radius: 10px;

    &.top {
      top: 100%;
      margin-top: 10px;
      transform: translateY(-10px);
    }
    &.bottom {
      bottom: 100%;
      margin-bottom: 10px;
      transform: translateY(10px);
    }
    &.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0px);
    }
  }
`

const Button2 = styled.button`
  margin: 0;
  border: none;
  background: var(--bg-light-color);
  transition: background .2s ease;
  color: white;
  &:hover {
    background: #292c39;
  }
  padding: 10px 20px;
  text-align: left;
  border-radius: 10px;
  min-height: 50px;
  & > div {
    paddding: 5px;
  }
  & .badges {
    display: flex;
    gap: 5px;
  }
  & img {
    margin-right: 10px;
  }
  & .badges {
    margin-top: 5px;
  }
  & .badge {
    background: #87ff8c;
    color: green;
    font-size: 12px;
    padding: 0 5px;
    border-radius: 5px;
    display: inline-block;

    &.yellow {
      background: #ffd743;
      color: #931400;
    }
  }
`

function CopyAddressButton() {
  const gamba = useGamba()
  const [copied, setCopied] = React.useState(false)

  const copy = () => {
    copyTextToClipboard(gamba.wallet.publicKey.toBase58())
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  return (
    <Button onClick={copy} className="transparent list">
      {copied ? 'Copied' : 'Copy Address'}
    </Button>
  )
}

function ShuffleSeedButton() {
  const gamba = useGamba()

  const shuffle = () => {
    const nextSeed = prompt('Enter a seed', gamba.seed)
    if (nextSeed)
      gamba.updateSeed(nextSeed)
  }

  return (
    <Button onClick={shuffle} className="">
      {gamba.seed}
    </Button>
  )
}

function CloseAccountButton() {
  const gamba = useGamba()

  const [closeAccount, loading] = usePromise(
    async () => {
      const res = await gamba.methods.closeAccount()
      await res.result()
    },
  )

  if (!gamba.user?.created) return null

  return (
    <Button loading={loading} onClick={closeAccount} className="">
      Close Account
    </Button>
  )
}

function CreateAccountButton() {
  const gamba = useGamba()

  const [createAccount, loading] = usePromise(
    async () => {
      const res = await gamba.methods.createAccount()
      await res.result()
    },
  )

  if (gamba.user?.created) return null

  return (
    <Button loading={loading} onClick={createAccount} className="">
      Create Account
    </Button>
  )
}

function MenuDropdown({ visible, anchor }: {visible: boolean, anchor: string}) {
  const wallet = useWallet()
  const [modal, setModal] = React.useState(false)

  return (
    <>
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h2>More Options</h2>
          <ShuffleSeedButton />
          <CloseAccountButton />
          <CreateAccountButton />
        </Modal>
      )}
      <div className={'menu ' + (visible ? 'visible ' :  '') + anchor}>
        <CopyAddressButton />
        <ClaimButton />
        <RedeemBonusButton />
        {wallet.connected && (
          <Button onClick={() => wallet.disconnect()} className="transparent list">
            Disconnect
          </Button>
        )}
        <Button onClick={() => setModal(true)} className="transparent list">
          More Options <Svg.ArrowRight />
        </Button>
      </div>
    </>
  )
}

export function MenuButton() {
  const walletModal = useWalletModal()
  const gamba = useGamba()
  const wallet = useWallet()
  const ref = React.useRef<HTMLDivElement>(null!)
  const [visible, setVisible] = useState(false)
  const bonusBalance = useBonusBalance()

  useOnClickOutside(ref, (e) => setVisible(false))

  const anchor = React.useMemo(
    () => {
      if (!ref.current) return 'bottom'
      return ref.current.getBoundingClientRect().y > window.innerHeight / 2 ? 'bottom' : 'top'
    }
    , [visible],
  )

  const connect = () => {
    if (wallet.wallet)
      wallet.connect()
    else
      walletModal.setVisible(true)
  }

  return (
    <>
      <Menu ref={ref}>
        {wallet.connected ? (
          <>
            <Button2 style={{ width: '100%' }} onClick={() => setVisible(!visible)}>
              <div>
                <img src={wallet.wallet?.adapter.icon} height="20px" />
                <Value>
                  {formatLamports(gamba.balances.wallet)}
                </Value>
                {gamba.user?.created && gamba.user?.status !== 'playing' && <Loader size={1} />}
              </div>
              <div className="badges">
                {gamba.balances.user > 0 && <div className="badge">
                  +<Money value={gamba.balances.user} />
                </div>}
                {bonusBalance > 0 && <div className="badge yellow">
                  +{formatLamports(bonusBalance)}
                </div>}
                {gamba.balances.bonus > 0 && <div className="badge yellow">
                  +{formatLamports(gamba.balances.bonus)}
                </div>}
              </div>
            </Button2>
            <MenuDropdown
              visible={visible}
              anchor={anchor}
            />
          </>
        ) : (
          <Button2 style={{ width: '100%' }} onClick={connect}>
            {wallet.connecting ? 'Connecting...' : 'Connect'}
          </Button2>
        )}
      </Menu>
    </>
  )
}
