import React from 'react'
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  gap: 20px;
  pointer-events: none;
  z-index: 20;
  font-size: 24px;
  & > a {
    pointer-events: auto;
  }
  @media (min-width: 800px) {
    position: fixed;
    bottom: 0;
    left: 0;
  }
  opacity: .75;
  transition: opacity .2s;
  &:hover {
    opacity: 1;
  }
`

export function Footer() {
  return (
    <Wrapper>
      <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer"><FaGithub /></a>
      <a target="_blank" href="http://discord.gg/xjBsW3e8fK" rel="noreferrer"><FaDiscord /></a>
      <a target="_blank" href="https://twitter.com/GambaLabs" rel="noreferrer"><FaTwitter /></a>
    </Wrapper>
  )
}
