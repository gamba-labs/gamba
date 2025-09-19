import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence, animate } from 'framer-motion'

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

const Wrap = styled(motion.div)`
  display: flex;
  gap: 20px;
  margin-top: 10px;
  justify-content: center;
  color: #fff;
  flex-wrap: wrap;
  text-align: center;
`

const Stat = styled(motion.div)`
  background: #23233b;
  padding: 10px 14px;
  border-radius: 12px;
  min-width: 120px;
  line-height: 1.2;
  font-size: 0.9rem;
  border: 1px solid #4a4a7c;

  & > div:first-child {
    opacity: 0.7;
    font-size: 0.8rem;
  }
  & > div:last-child {
    font-weight: bold;
    color: #f1c40f;
  }
`

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface Props {
  betSOL: number
  chancePct: number
}

export function MyStats({ betSOL, chancePct }: Props) {
  return (
    <AnimatePresence>
      <Wrap
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <Stat variants={itemVariants}>
          <div>My Bet</div>
          <div>
            <AnimatedNumber value={betSOL} /> SOL
          </div>
        </Stat>
        <Stat variants={itemVariants}>
          <div>Chance</div>
          <div>
            <AnimatedNumber value={chancePct} /> %
          </div>
        </Stat>
      </Wrap>
    </AnimatePresence>
  )
}
