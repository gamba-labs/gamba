import React from 'react'
import styled from 'styled-components'

const Buttons = styled.div`
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  @media (min-width: 800px) {
    height: 100%;
  }

  @media (max-width: 800px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-top: 0!important;
  }

  & > button {
    border: none;
    width: 100%;
    border-radius: 10px;
    padding: 10px;
    background: #ffffffdf;
    transition: background .2s ease;
    &:hover {
      background: white;
    }
    color: black;
    cursor: pointer;
  }
`

const WelcomeInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  backdrop-filter: blur(10px) saturate(1.8) brightness(1);

  padding: 20px;
  & > div {
    padding: 0px;
  }
  @media (min-width: 800px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    padding: 0;
    & > div {
      padding: 40px;
    }
  }
  z-index: 1;
`

const Welcome = styled.div`
  @keyframes welcome-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes backgroundGradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  background: linear-gradient(-45deg, #ffb788, #ff4d91, #316fff, #ff4d91);
  background-size: 400% 400%;
  animation: welcome-fade-in .5s ease, backgroundGradient 30s ease infinite;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  & img {
    animation-duration: 5s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    width: 100px;
    height: 100px;
    top: 0;
    right: 0;
    &:nth-child(1) {animation-delay: 0s;}
    &:nth-child(2) {animation-delay: 1s;}
  }
`

export function WelcomeBanner() {
  return (
    <Welcome>
      <WelcomeInner>
        <div>
          <h1>Welcome to Gamba v2 👋</h1>
          <p>
            A fair, simple and decentralized casino on Solana.
          </p>
        </div>
        <Buttons>
          <button onClick={() => window.open('https://v2.gamba.so/', '_blank')}>
            🚀 Add Liqudity
          </button>
          <button onClick={() => window.open('https://github.com/gamba-labs/gamba', '_blank')}>
            👨‍💻 Build your own
          </button>
          <button onClick={() => window.open('https://discord.gg/HSTtFFwR', '_blank')}>
            💬 Discord
          </button>
        </Buttons>
      </WelcomeInner>
    </Welcome>
  )
}
