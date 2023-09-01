import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useBonusBalance, useGamba } from 'gamba-react'
import { Button, formatLamports } from 'gamba/react-ui'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Logo = styled.img`
  width: 2em;
  height: 2em;
`

const Wrapper = styled.div`
  width: 100%;
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  padding: 20px;
  .label {
    display: none;
    @media (min-width: 800px) {
      display: block;
    }
  }
  > div {
    margin: 0 auto;
    gap: 20px;
    display: grid;
    align-items: center;
    grid-template-columns: auto max-content;
  }
`

const StyledNavigationLink = styled(NavLink)`
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 1em;
  transition: color .1s, border .1s;
  white-space: nowrap;
  text-transform: uppercase;
`

function NavigationLink({ children, to }: React.PropsWithChildren<{to: string}>) {
  return (
    <StyledNavigationLink to={to}>
      {children}
    </StyledNavigationLink>
  )
}

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

export function RedeemBonusButton() {
  const gamba = useGamba()
  const [redeemTokens, loading] = usePromise(gamba.redeemBonusToken)
  const bonusBalance = useBonusBalance()

  if (bonusBalance === 0) {
    return null
  }
  // icon={<Svg.BonusChip />}

  return (
    <Button pulse loading={loading} className="yellow" onClick={redeemTokens}>
      Redeem {formatLamports(bonusBalance, 'gSOL')}
    </Button>
  )
}

export function ClaimButton() {
  const gamba = useGamba()
  const [claim, loading] = usePromise(gamba.withdraw)

  if (gamba.balances.user === 0) {
    return null
  }

  return (
    <Button pulse loading={loading} className="green" onClick={claim}>
      Claim {formatLamports(gamba.balances.user)}
    </Button>
  )
}

export function Header() {
  return (
    <Wrapper>
      <div>
        <NavigationLink to="/">
          <Logo src="/logo.png" />
        </NavigationLink>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'inline-block' }}>
            <WalletMultiButton />
          </div>
          {/* <GambaConnectButton /> */}
          {/* <Dropdown
            align="top"
            value="SOL"
            // format={formatLamports}
            label="Token"
            onChange={() => null}
            options={['SOL'].map((value) => ({
              label: 'SOL',
              value,
            }))}
          /> */}
        </div>
      </div>
    </Wrapper>
  )
}
