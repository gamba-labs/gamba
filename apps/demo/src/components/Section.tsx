import React from 'react'
import styled from 'styled-components'

export const Section = styled.div`
  width: 100%;
  transition: width .25s ease;
  @media (min-width: 960px) {
    width: 800px;
  }
  @media (min-width: 1280px) {
    width: 1000px;
  }
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > .arrows {
    display: flex;
  }
`

interface Section2Props {
  title: JSX.Element | string
  stuff?: JSX.Element | string
}

export function Section2({ title, stuff, children }: React.PropsWithChildren<Section2Props>) {
  return (
    <Section>
      <Header>
        <h2>
          {title}
        </h2>
        <div>
          {stuff}
        </div>
      </Header>
      <div>
        {children}
      </div>
    </Section>
  )
}
