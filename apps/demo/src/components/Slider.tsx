import React from 'react'
import styled from 'styled-components'
import { Button } from './Button'
import { Svg } from './Svg'
import { Section2 } from './Section'

const ScrollWrapper = styled.div`
  display: flex;
  align-items: center;
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

export function Slider({ children, title }: React.PropsWithChildren<{title: JSX.Element | string}>) {
  const ref = React.useRef<HTMLDivElement>(null!)

  const scroll = (x: number) => {
    ref.current.scrollBy({ left: 1 * x, behavior: 'smooth' })
  }

  return (
    <Section2
      title={title}
      stuff={
        <div className="arrows">
          <Button size="small" className="transparent" onClick={() => scroll(-1)}>
            <Svg.ArrowLeft />
          </Button>
          <Button size="small" className="transparent" onClick={() => scroll(1)}>
            <Svg.ArrowRight />
          </Button>
        </div>
      }
    >
      <ScrollWrapper ref={ref}>
        {children}
      </ScrollWrapper>
    </Section2>
  )
}
