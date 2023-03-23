import { PublicKey } from '@solana/web3.js'
import { LAMPORTS_PER_SOL, useGamba } from 'gamba'
import React from 'react'
import styled from 'styled-components'
import { Amount, MOBILE } from '../styles'
import { Value } from './Value'

const Container = styled.div`
  display: grid;
  gap: 20px;
  display: none;
  ${MOBILE} {
    display: unset;
    z-index: 1;
    position: fixed;
    right: 20px;
    top: 20px;
    pointer-events: none;
  }
`

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: white;
  padding: 10px;
  border-radius: 10px;
  & > div {
    text-align: left;
  }
`

interface AppConfig {
  name: string,
  results: Record<number, string>
}

const KNOWN_APPS: Record<string, AppConfig> = {
  DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV: {
    name: 'Gamba Flip',
    results: {
      0: 'Heads',
      1: 'Tails',
    },
  },
}
const getAppConfig = (pubkey: PublicKey): AppConfig | undefined => KNOWN_APPS[pubkey.toBase58()]

export function RecentGames() {
  const gamba = useGamba()
  return (
    <Container>
      {gamba.recentGames.map((res) => {
        const profit = res.payout - res.wager
        const key = res.player.toBase58() + '-' + res.nonce
        const app = getAppConfig(res.creator)
        return (
          <Wrapper key={key}>
            <div>{app?.name ?? 'Unknown Game'}</div>
            <div>{app?.results[res.resultIndex] ?? res.resultIndex}</div>
            <div>{res.player.toBase58().substring(0, 6)}...</div>
            <Amount $value={profit}>
              <Value children={`${profit >= 0 ? '+' : ''}${profit / LAMPORTS_PER_SOL} SOL`} />
            </Amount>
            {/* <Time time={res.estimatedTime} /> */}
          </Wrapper>
        )
      })}
    </Container>
  )
}
