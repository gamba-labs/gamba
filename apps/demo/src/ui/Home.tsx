import React from 'react'
import styled from 'styled-components'
import { ButtonLink } from '../components/Button'
import { Section } from '../components/Section'
import { Svg } from '../components/Svg'

const Banner = styled.div`
  width: 100%;
  background-size: cover;
  background-image: linear-gradient(0deg,var(--bg-color) 0%,#04051700 100%), url(/banner.png);
  padding-top: 60px;
  padding-bottom: 30px;
  position: relative;

  min-height: 100vh;

  @media (min-height: 600px) {
    min-height: 60vh;
  }

  @media (min-height: 800px) {
    min-height: min(50vh, 420px);
  }

  transition: min-height .25s ease;

  @keyframes appearappear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  animation: appearappear .5s;

  display: flex;
  flex-direction: column-reverse;
`

export function Home() {
  return (
    <Banner>
      <Section>
        <h1>
        Gamba Demo
        </h1>
        <p>
        A decentralized, provably-fair casino built on gamba.
        </p>
        <ButtonLink className="white" href="https://gamba.so" target="_blank" pulse>
          Learn More <Svg.ExternalLink />
        </ButtonLink>
      </Section>
    </Banner>
  )
}
