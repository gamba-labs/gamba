import React from 'react'
import styled from 'styled-components'

const Links = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  align-items: center;
  & > a > svg {
    display: block;
  }
`

export function Footer() {
  return (
    <Links>
      <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">
        Github
      </a>
      <a target="_blank" href="https://discord.gg/xjBsW3e8fK" rel="noreferrer">
        Discord
      </a>
      <a target="_blank" href="https://twitter.com/GambaLabs" rel="noreferrer">
        Twitter
      </a>
    </Links>

  )
}
