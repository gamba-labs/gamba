import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT, GambaPlatformContext, GambaUi, PoolToken, TokenValue, useCurrentToken, useTokenMeta, useUserBalance } from 'gamba-react-ui-v2'
import React from 'react'
import styled from 'styled-components'
import { Dropdown } from '../components/Dropdown'
import { Modal } from '../components/Modal'
import { POOLS } from '../constants'

const StyledToken = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  img {
    height: 20px;
  }
`

const StyledTokenImage = styled.img`
  height: 20px;
  aspect-ratio: 1/1;
  border-radius: 50%;
`

const StyledTokenButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 5px;
  &:hover {
    background: #ffffff11;
  }
`

function TokenImage({ mint, ...props }: {mint: PublicKey}) {
  const meta = useTokenMeta(mint)
  return (
    <StyledTokenImage src={meta.image} {...props} />
  )
}

function TokenName({ mint }: { mint: PublicKey }) {
  const meta = useTokenMeta(mint)
  return (
    <>
      {meta.symbol}
    </>
  )
}

export default function TokenSelect() {
  const [visible, setVisible] = React.useState(false)
  const [warning, setWarning] = React.useState(false)
  const context = React.useContext(GambaPlatformContext)
  const selectedToken = useCurrentToken()
  const balance = useUserBalance()

  const selectPool = (pool: PoolToken) => {
    context.setPool(pool.token, pool.authority)
    setVisible(false)
    if (
      import.meta.env.VITE_REAL_PLAYS_DISABLED &&
      !pool.token.equals(FAKE_TOKEN_MINT)
    ) {
      setWarning(true)
    }
  }

  const click = () => {
    setVisible(!visible)
  }

  return (
    <>
      {warning && (
        <Modal>
          <h1>Real plays disabled</h1>
          <p>
            This platform only allows you to play with fake tokens.
          </p>
          <GambaUi.Button
            main
            onClick={() => {
              setWarning(false)
              context.setPool(FAKE_TOKEN_MINT)
            }}
          >
            Switch to fake tokens
          </GambaUi.Button>
        </Modal>
      )}
      <div style={{ position: 'relative' }}>
        <GambaUi.Button onClick={click}>
          {selectedToken && (
            <StyledToken>
              <TokenImage mint={selectedToken.mint} />
              <TokenValue amount={balance.balance} />
            </StyledToken>
          )}
        </GambaUi.Button>
        <Dropdown visible={visible}>
          {POOLS.map((x, i) => (
            <StyledTokenButton onClick={() => selectPool(x)} key={i}>
              <TokenImage mint={x.token} /> <TokenName mint={x.token} />
            </StyledTokenButton>
          ))}
        </Dropdown>
      </div>
    </>
  )
}
