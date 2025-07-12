import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScoreboardProps {
  scores: number[]
  multis: number[]
  shaking: Set<number>
  colors: string[]
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  scores,
  multis,
  shaking,
  colors,
}) => {
  // sort teams by descending score
  const display = scores
    .map((score, i) => ({ team: i, score, mult: multis[i] }))
    .sort((a, b) => b.score - a.score)

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '8px 12px',
        borderRadius: 8,
      }}
    >
      <AnimatePresence>
        {display.map(({ team, score, mult }) => (
          <motion.div
            key={team}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors[team],
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <div style={{ flex: 1, color: '#fff' }}>
              <strong>Team {team + 1}</strong>
            </div>
            <div
              style={{
                width: 50,
                textAlign: 'right',
                fontFamily: 'monospace',
                color: '#fff',
              }}
            >
              {score.toString().padStart(3, ' ')}
            </div>
            <motion.div
              animate={
                shaking.has(team)
                  ? { scale: [1, 1.2, 0.9, 1.1, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.5 }}
              style={{
                marginLeft: 10,
                padding: '2px 6px',
                backgroundColor: '#222',
                color: colors[team],
                borderRadius: 4,
                fontFamily: 'monospace',
              }}
            >
              x{mult}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
