import { Gamba, LAMPORTS_PER_SOL, useGamba } from 'gamba'
import React, { useState } from 'react'
import { DropdownMenu } from './components/DropdownMenu'
import { Header } from './components/Header'
import { Loading } from './components/Loading'
import { RecentBets } from './components/RecentBets'
import { Result } from './components/Result'
import { Value } from './components/Value'
import { getConfig } from './config'
import { Amount, Button, ButtonGroup, Container, Controls, GlobalStyle, Info, Input, SmallButton, Wrapper } from './styles'

const HEADS = [2, 0]
const TAILS = [0, 2]
const MAX_WAGER = .25
const MIN_WAGER = .01

function Game() {
  const gamba = useGamba()
  const [_wager, _setWager] = useState('')
  const connected = gamba.wallet.connected
  const wager = Number(_wager || MIN_WAGER)
  const wagerIsValid = _wager && Number.isFinite(Number(wager)) && wager >= MIN_WAGER && wager <= MAX_WAGER
  const accountCreated = gamba.game.created
  const canPlay = accountCreated && !gamba.game.loading && wagerIsValid
  const setWager = (x: number) => {
    const max = Math.min(MAX_WAGER, Math.max(gamba.player.balance, gamba.game.balance))
    _setWager(String(Math.max(MIN_WAGER, Math.min(max, x))))
  }

  const play = (game: number[]) =>
    gamba.play(game, Number(wager) * LAMPORTS_PER_SOL)

  return (
    <Container>
      <Header />
      <RecentBets />
      <Wrapper>
        <Result />
        <Loading loading={gamba.game.loading} />
        <Controls>
        <Info>
          <span>
            Balance: <Value children={`${(gamba.player.balance / LAMPORTS_PER_SOL).toFixed(2)} SOL`} />
          </span>
          <Amount $value={gamba.game.balance}>
            {gamba.game.created && <Value children={`+${(gamba.game.balance / LAMPORTS_PER_SOL).toFixed(6)}`} />}
          </Amount>
        </Info>
        <Input
          placeholder="Wager (SOL)"
          value={_wager}
          disabled={!connected}
          onChange={(e) => _setWager(e.target.value)}
        />
        <ButtonGroup>
          <SmallButton disabled={!accountCreated} onClick={() => setWager(MIN_WAGER)}>
            MIN
          </SmallButton>
          <SmallButton disabled={!accountCreated} onClick={() => setWager(MAX_WAGER)}>
            MAX
          </SmallButton>
          <SmallButton disabled={!accountCreated} onClick={() => setWager(wager / 2)}>
            X.5
          </SmallButton>
          <SmallButton disabled={!accountCreated} onClick={() => setWager(wager * 2)}>
            X2
          </SmallButton>
        </ButtonGroup>
        {!connected ? (
          <Button $gradient onClick={() => gamba.connect()}>
            Connect
          </Button>
        ) : !gamba.game.created ? (
          <Button $gradient onClick={() => gamba.init()}>
            Create Gamba account
          </Button>
        ) : (
          <ButtonGroup>
            <Button disabled={!canPlay} onClick={() => play(HEADS)}>
              Heads
            </Button>
            <Button disabled={!canPlay} onClick={() => play(TAILS)}>
              Tails
            </Button>
            <DropdownMenu
              label="..."
              options={[
                {label: 'Disconnect', onClick: () => gamba.disconnect()},
                gamba.game.balance > 0 && {label: 'Claim', onClick: () => gamba.withdraw()},
                {label: 'Close Account', onClick: () => confirm('You should only use this if you are unable to Claim. Are you sure? ') && gamba.close()},
                // {label: 'Create', onClick: () => gamba.init()},
                {label: 'Debug State', onClick: () => alert(JSON.stringify(gamba.game, null, 2))},
              ]}
            />
          </ButtonGroup>
        )}
        </Controls>
      </Wrapper>
    </Container>
  )
}

export function App() {
  const config = getConfig()
  if (!config.gambaCreator) {
    return (
      <pre>.env file not configured properly.</pre>
    )
  }
  return (
    <>
      <GlobalStyle />
      <Gamba
        connection={{
          endpoint: config.rpcEndpoint,
          config: {
            commitment: 'processed',
            wsEndpoint: config.rpcWsEndpoint
          }
        }}
        name={config.gambaName}
        creator={config.gambaCreator}
      >
        <Game />
      </Gamba>
    </>
  )
}
