import React, { PropsWithChildren, useRef } from 'react'
import styled from 'styled-components'
import { Svg } from './Svg'

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > .arrows {
    display: flex;
    & > button {
      width: 40px;
      color: white;
      background: transparent;
      margin: 0;
      padding: 0;
      border: none;
    }
  }
`
const Wrapper = styled.div`
  display: flex;
  gap: 15px;
  padding: 10px;
  width: 100%;
  overflow: scroll visible;
  scroll-snap-type: x mandatory;
  transition: height .25s ease;
  &::-webkit-scrollbar {
    height: .33em;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cccccc33;
  }
  & > * {
    scroll-snap-align: start;
  }
`

export function Slider({ children, title }: PropsWithChildren<{title: any}>) {
  const ref = useRef<HTMLDivElement>(null!)
  const scrll = (x: number) => {
    ref.current.scrollBy({ left: 1 * x, behavior: 'smooth' })
  }

  return (
    <>
      <Header>
        {title}
        <div className="arrows">
          <button onClick={() => scrll(-1)}>
            <Svg.ArrowLeft />
          </button>
          <button onClick={() => scrll(1)}>
            <Svg.ArrowRight />
          </button>
        </div>
      </Header>
      <Wrapper ref={ref}>
        {children}
      </Wrapper>
    </>
  )
}
