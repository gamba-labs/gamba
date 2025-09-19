import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { animate } from 'framer-motion'

function AnimatedNumber({ value }: { value: number }) {
  const animationRef = useRef<any>(null)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (animationRef.current) {
      try { animationRef.current.stop() } catch {}
      animationRef.current = null
    }
    const startValue = displayValue
    animationRef.current = animate(startValue, value, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate(latest) {
        setDisplayValue(latest)
      },
      onComplete() {
        setDisplayValue(value)
        animationRef.current = null
      },
    })
    return () => {
      if (animationRef.current) {
        try { animationRef.current.stop() } catch {}
        animationRef.current = null
      }
    }
  }, [value])

  return <span>{displayValue.toFixed(2)}</span>
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px 0;
`

const Label = styled.div`
  font-size: 1rem;
  color: #e0e0e0;
`

const Value = styled.div`
  font-size: 3rem;
  line-height: 1.1;
  color: #f1c40f;
  font-weight: bold;
  text-shadow: 0 0 15px #f1c40f;

  @media (max-width: 900px) {
    font-size: 2.5rem;
  }
`

interface PotProps {
  totalPot: number
}

export function Pot({ totalPot }: PotProps) {
  return (
    <Wrapper>
      <Label>Total Pot</Label>
      <Value>
        <AnimatedNumber value={totalPot} /> SOL
      </Value>
    </Wrapper>
  )
}
