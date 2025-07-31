import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerInfo } from '../engine/types';

interface Props {
  roster      : PlayerInfo[];
  scores      : number[];
  mults       : number[];
  targetPoints: number;
}

export default function Scoreboard({
  roster, scores, mults, targetPoints,
}: Props) {
  /* order by score desc for a nice dynamic leaderboard */
  const rows = roster
    .map((p,i)=>({ p, s:scores[i]??0, m:mults[i]??1 }))
    .sort((a,b)=>b.s-a.s);

  return (
    <div style={{
      position:'absolute', top:10, left:10, zIndex:200,
      background:'rgba(0,0,0,0.55)', padding:'8px 12px',
      borderRadius:8, color:'#fff', fontSize:14,
    }}>
      <AnimatePresence>
        {rows.map(({p,s,m})=>(
          <motion.div
            key={p.id}
            layout
            initial={{opacity:0,y:-10}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0,y:10}}
            style={{display:'flex',alignItems:'center',marginBottom:6}}
          >
            <div style={{
              width:12,height:12,
              background:p.color,borderRadius:4,marginRight:8,
            }}/>
            <div style={{flex:1,whiteSpace:'nowrap',overflow:'hidden'}}>
              {p.id.slice(0,4)}…{p.id.slice(-4)}
            </div>

            {/* score */}
            <div style={{
              fontFamily:'monospace',
              width:60,textAlign:'right',
            }}>
              {s.toString().padStart(
                targetPoints.toString().length,' '
              )}
            </div>

            {/* multiplier badge (hide when ×1) */}
            {m>1 && (
              <div style={{
                marginLeft:8,
                padding:'2px 6px',
                background:'#222',
                borderRadius:4,
                fontFamily:'monospace',
                color:p.color,
                fontSize:12,
              }}>
                ×{m}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
