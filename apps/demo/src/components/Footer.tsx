import React from 'react'
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import styled from 'styled-components'

const Links = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: center;
  & > a > svg {
    display: block;
  }
`

export function Footer() {
  return (
    <Links>
      <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">
        <FaGithub />
      </a>
      <a target="_blank" href="http://discord.gg/xjBsW3e8fK" rel="noreferrer">
        <FaDiscord />
      </a>
      <a target="_blank" href="https://twitter.com/GambaLabs" rel="noreferrer">
        <FaTwitter />
      </a>
    </Links>

  )
}
