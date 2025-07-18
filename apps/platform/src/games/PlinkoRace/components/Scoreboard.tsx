import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerInfo }               from '../engine/types';

const POINTS_PER_CROSS = 50;

interface Props {
  roster      : PlayerInfo[];
  scores      : number[];
  crossings   : number[][];
  targetPoints: number;
}

export default function Scoreboard({
  roster, scores, crossings, targetPoints,
}: Props) {
  return (
    <div style={{
      position:'absolute', top:10, left:10, zIndex:100,
      background:'rgba(0,0,0,.5)', padding:'8px 12px', borderRadius:8,
      color:'#fff', fontSize:14,
    }}>
      <AnimatePresence>
        {roster.map((p,i)=>{
          const score   = scores[i]    ?? 0;
          const recent  = crossings[i] ?? [];
          const shake   = recent.length>0 && score%POINTS_PER_CROSS===0;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{opacity:0,y:-10}}
              animate={{opacity:1,y:0}}
              exit   ={{opacity:0,y:10}}
              style={{display:'flex',alignItems:'center',marginBottom:6}}
            >
              <div style={{
                width:12,height:12,background:p.color,borderRadius:4,
                marginRight:8,
              }}/>
              <div style={{flex:1,whiteSpace:'nowrap',overflow:'hidden'}}>
                {p.id.slice(0,4)}…{p.id.slice(-4)}
              </div>
              <div style={{
                width:50,textAlign:'right',fontFamily:'monospace',
                marginRight:8,
              }}>
                {score.toString().padStart(
                  targetPoints.toString().length,' '
                )}
              </div>
              <motion.div
                animate={shake ? {scale:[1,1.2,0.9,1.1,1]} : {scale:1}}
                transition={{duration:0.5}}
                style={{
                  padding:'2px 6px',background:'#222',
                  color:p.color,borderRadius:4,fontFamily:'monospace',
                }}
              >
                /{targetPoints}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
