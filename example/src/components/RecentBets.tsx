import { LAMPORTS_PER_SOL, useGamba } from 'gamba'
import React from 'react'
import styled from 'styled-components'
import { Amount, MOBILE } from '../styles'
import { Value } from './Value'

const Container = styled.div`
  position: fixed;
  right: 20px;
  top: 20px;
  display: grid;
  gap: 20px;
  pointer-events: none;
  z-index: 1;
  display: none;
  ${MOBILE} {
    display: unset;
  }
`

const Notifcation = styled.div`
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

export function RecentBets() {
  const gamba = useGamba()
  return (
    <Container>
      {gamba.recentBets.sort((a, b) => b.blockTime - a.blockTime).slice(0, 20).map((x, i) => {
        const profit = x.payout - x.amount
        const key = x.player.toBase58() + '-' + x.nonce
        return (
          <Notifcation key={key}>
            <div>{x.player.toBase58().substring(0, 6)}...</div>
            <Amount $value={profit}>
              <Value children={`${profit / LAMPORTS_PER_SOL} SOL`} />
            </Amount>
            {/* <Time time={x.blockTime} /> */}
          </Notifcation>
        )
      })}
    </Container>
  )
}
