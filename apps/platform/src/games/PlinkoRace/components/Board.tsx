// src/components/Board.tsx
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { GambaUi } from 'gamba-react-ui-v2';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMultiPlinko } from '../hooks/useMultiPlinko';
import {
  WIDTH, HEIGHT, PEG_RADIUS, BALL_RADIUS,
  BUCKET_DEFS, BUCKET_HEIGHT,
  BucketType, DYNAMIC_SEQUENCE, DYNAMIC_EXTRA_MULT, CENTER_BUCKET,
} from '../engine/constants';
import {
  PlayerInfo, RecordedRace, RecordedRaceEvent,
} from '../engine/types';
import Scoreboard from './Scoreboard';

/* ───── visuals & constants ──────────────────── */
const SPEED_FACTOR = 4;                    // sim‑steps per paint
const HIT_DIST_SQ  = (BALL_RADIUS + PEG_RADIUS) ** 2;
const ARROW_W = 12, ARROW_H = 10;          // arrow triangle

/* particle + simple lerp state types */
type Particle   = { x:number; y:number; size:number; opacity:number; life:number; vx:number; vy:number; };
type LerpState  = { px:number; py:number };   // previous (smoothed) pos

/* helper – bucket hue / label */
function bucketVisual(def:(typeof BUCKET_DEFS)[number], dynMode:number){
  const r = def.type===BucketType.Dynamic
    ? { type:DYNAMIC_SEQUENCE[dynMode], value:DYNAMIC_SEQUENCE[dynMode]===BucketType.Multiplier?DYNAMIC_EXTRA_MULT:def.value }
    : def;
  switch(r.type){
    case BucketType.Score     : return {hue:220,label:`${r.value} ▼`};
    case BucketType.Multiplier: return {hue:120,label:`${r.value}×`};
    case BucketType.ExtraBall : return {hue: 60,label:'+1'};
    case BucketType.Kill      : return {hue:  0,label:'☠'};
    case BucketType.Blank     : return {hue: 30,label:'–'};
  }
}

export default function Board({
  players, winnerIdx, metadata={},
  youIndexOverride, gamePk, targetPoints=50,
  payouts, onFinished,
}:{
  players:PublicKey[]; winnerIdx:number|null; metadata?:Record<string,string>;
  youIndexOverride?:number; gamePk:string; targetPoints?:number;
  payouts?:number[]; onFinished?:()=>void;
}){
  /* roster & “you” */
  const roster:PlayerInfo[] = useMemo(()=>players.map((p,i)=>({
    id:p.toBase58(),
    color:['#ff9aa2','#ffb7b2','#ffdac1','#e2f0cb','#b5ead7','#c7ceea'][i%6],
  })),[players]);
  const { publicKey } = useWallet();
  const youIdx = useMemo(()=>youIndexOverride ?? roster.findIndex(r=>r.id===publicKey?.toBase58()),[roster,publicKey,youIndexOverride]);

  /* hooks & state */
  const { engine, recordRace, replayRace } = useMultiPlinko(roster, gamePk);
  const [scores,setScores]   = useState<number[]>([]);
  const [mults,setMults]     = useState<number[]>([]);
  const [dynMode,setDynMode] = useState(0);
  const [finished,setFinished]=useState(false);

  const bucketAnim = useRef<Record<number,number>>({}).current;
  const pegAnim    = useRef<Record<number,number>>({}).current;
  const particles  = useRef<Particle[]>([]).current;

  /* smoothed positions for arrows & name‑labels, keyed by Matter.Body.id */
  const arrowPos  = useRef<Map<number,LerpState>>(new Map()).current;
  const labelPos  = useRef<Map<number,LerpState>>(new Map()).current;

  /* reset on roster change */
  useEffect(()=>{
    setScores(Array(roster.length).fill(0));
    setMults (Array(roster.length).fill(1));
    setDynMode(0); setFinished(false);
    Object.keys(bucketAnim).forEach(k=>bucketAnim[+k]=0);
    Object.keys(pegAnim).forEach(k=>pegAnim[+k]=0);
    particles.length=0; arrowPos.clear(); labelPos.clear();
  },[roster]);

  useEffect(()=>{ if(finished) onFinished?.();},[finished,onFinished]);

  /* record + replay */
  useEffect(()=>{
    if(!engine||winnerIdx==null) return;
    const rec = recordRace(winnerIdx,targetPoints);
    const ev  = [...rec.events];
    const runMults=Array(roster.length).fill(1);
    replayRace(rec,frame=>{
      while(ev.length&&ev[0].frame===frame){
        const e=ev.shift()!;
        if(e.kind==='bucketMode'){setDynMode(e.value??0);bucketAnim[CENTER_BUCKET]=1;continue;}
        if(e.bucket!==undefined) bucketAnim[e.bucket]=1;
        if(e.kind==='mult'){runMults[e.player]=Math.min(runMults[e.player]*(e.value||1),64);setMults(m=>{const c=[...m];c[e.player]=runMults[e.player];return c;});}
        if(e.kind==='score'){setScores(s=>{const c=[...s];c[e.player]+=e.value||0;return c;});runMults[e.player]=1;setMults(m=>{const c=[...m];c[e.player]=1;return c;});}
      }
      if(frame===rec.totalFrames-1) setFinished(true);
    });
  },[engine,winnerIdx,recordRace,replayRace,targetPoints,roster]);

  /* settled with zero players */
  if(roster.length===0&&winnerIdx!==null){
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',color:'#fff',background:'#0b0b13'}}>Game settled with 0 players</div>;
  }

  /* ─────────── render ─────────── */
  return (
    <div style={{position:'relative',width:'100%',height:'100%'}}>
      <GambaUi.Canvas render={({ctx,size})=>{
        if(!engine) return;

        /* clear & scale */
        ctx.clearRect(0,0,size.width,size.height);
        ctx.fillStyle='#0b0b13'; ctx.fillRect(0,0,size.width,size.height);
        const scale=Math.min(size.width/WIDTH,size.height/HEIGHT);
        const ox=(size.width-WIDTH*scale)/2, oy=(size.height-HEIGHT*scale)/2;
        ctx.save(); ctx.translate(ox,oy); ctx.scale(scale,scale);

        const bodies=engine.getBodies();
        const balls=bodies.filter(b=>b.label==='Ball');
        const pegs =bodies.filter(b=>b.label==='Peg');

        /* quick lerp helper */
        const mix=(a:number,b:number,f:number)=>a+(b-a)*f;
        const lerpF=0.15; // smooth factor for arrows & names

        /* peg hit pulse */
        balls.forEach(ball=>{
          const {x:bx,y:by}=ball.position;
          pegs.forEach(peg=>{
            const {x:px,y:py}=peg.position;
            const dx=bx-px,dy=by-py;
            if(dx*dx+dy*dy<HIT_DIST_SQ){
              const ix=(peg as any).plugin?.pegIndex??-1;
              if(ix>=0) pegAnim[ix]=1;
            }
          });
        });

        /* particles update */
        for(let i=particles.length-1;i>=0;i--){
          const p=particles[i];
          if(--p.life<=0){particles.splice(i,1);continue;}
          p.x+=p.vx; p.y+=p.vy; p.opacity*=0.96; p.size*=0.98;
          ctx.fillStyle=`rgba(255,180,0,${p.opacity})`;
          ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,2*Math.PI);ctx.fill();
        }

        /* draw buckets */
        const bw=WIDTH/BUCKET_DEFS.length;
        BUCKET_DEFS.forEach((def,i)=>{
          let a=bucketAnim[i]||0; if(a>0) bucketAnim[i]=a*0.85; a=bucketAnim[i]||0;
          const x0=i*bw, top=HEIGHT-BUCKET_HEIGHT, cx=x0+bw/2, ly=top+BUCKET_HEIGHT/2;
          const {hue,label}=bucketVisual(def,dynMode);
          if(a>0.02){
            const h=BUCKET_HEIGHT*3*a;
            const g=ctx.createLinearGradient(0,top,0,top-h);
            g.addColorStop(0,`hsla(${hue},80%,70%,${0.4*a})`);
            g.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=g; ctx.fillRect(x0,top-h,bw,h);
          }
          ctx.fillStyle=`hsla(${hue},70%,50%,0.3)`; ctx.fillRect(x0,top,bw,BUCKET_HEIGHT);
          ctx.font='bold 18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.lineWidth=3; ctx.strokeStyle=`hsla(${hue},60%,20%,1)`; ctx.strokeText(label,cx,ly);
          ctx.fillStyle=`hsla(${hue},80%,75%,1)`; ctx.fillText(label,cx,ly);
        });

        /* barriers & pegs */
        bodies.forEach(b=>{
          if(b.label==='Barrier'){
            ctx.beginPath(); b.vertices.forEach((pt,j)=>j?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y));
            ctx.closePath(); ctx.fillStyle='#444'; ctx.fill(); return;
          }
          if(b.label==='Peg'){
            const ix=(b as any).plugin?.pegIndex??-1;
            let a=pegAnim[ix]||0; if(a>0) pegAnim[ix]=a*0.9;
            ctx.save(); ctx.translate(b.position.x,b.position.y); ctx.scale(1+a*0.4,1+a*0.4);
            const hue=(b.position.x+b.position.y+Date.now()*0.05)%360;
            ctx.fillStyle=`hsla(${hue},75%,60%,${(1+a*2)*0.2})`;
            ctx.beginPath();ctx.arc(0,0,PEG_RADIUS+4,0,2*Math.PI);ctx.fill();
            ctx.fillStyle=`hsla(${hue},85%,${75+a*25}%,1)`;
            ctx.beginPath();ctx.arc(0,0,PEG_RADIUS,0,2*Math.PI);ctx.fill();
            ctx.restore(); return;
          }
        });

        /* draw balls, arrows, names */
        balls.forEach(b=>{
          const idx=(b as any).plugin?.playerIndex as number;
          const m=mults[idx]??1;
          const {x,y}=b.position; if(!Number.isFinite(x)||!Number.isFinite(y)) return;
          const playerId=roster[idx].id; const name=metadata[playerId];

          /* multiplier glow & flames */
          if(m>1){ctx.globalCompositeOperation='lighter';
            const r=BALL_RADIUS*2, g=ctx.createRadialGradient(x,y,0,x,y,r);
            g.addColorStop(0,'rgba(255,255,200,0.5)');g.addColorStop(1,'rgba(255,255,200,0)');
            ctx.fillStyle=g; ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();
            ctx.globalCompositeOperation='source-over';
          }
          if(m>=5&&particles.length<200){
            ctx.globalCompositeOperation='lighter';
            const base=BALL_RADIUS*1.2,f=0.8+Math.random()*0.4;
            const r1=base*2.3*f, fg=ctx.createRadialGradient(x,y,0,x,y,r1);
            fg.addColorStop(0,`rgba(255,180,0,${0.6*f})`); fg.addColorStop(1,'rgba(255,0,0,0)');
            ctx.fillStyle=fg; ctx.beginPath();ctx.arc(x,y,r1,0,2*Math.PI);ctx.fill();
            const r2=base*0.8*f, ig=ctx.createRadialGradient(x,y,0,x,y,r2);
            ig.addColorStop(0,'rgba(255,255,220,1)'); ig.addColorStop(1,'rgba(255,200,0,0)');
            ctx.fillStyle=ig; ctx.beginPath();ctx.arc(x,y,r2,0,2*Math.PI);ctx.fill();
            ctx.globalCompositeOperation='source-over';
            particles.push({x:x+(Math.random()-0.5)*5,y:y+(Math.random()-0.5)*5,size:2+Math.random()*2,opacity:0.5+Math.random()*0.5,life:20+Math.random()*10,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5-0.5});
          }

          /* ball */
          ctx.fillStyle=roster[idx%roster.length].color;
          ctx.beginPath();ctx.arc(x,y,BALL_RADIUS,0,2*Math.PI);ctx.fill();

          /* arrow for your balls */
          if(idx===youIdx){
            const destX=x,destY=y-BALL_RADIUS-2;
            const st=arrowPos.get(b.id)??{px:destX,py:destY};
            st.px=mix(st.px,destX,lerpF); st.py=mix(st.py,destY,lerpF);
            arrowPos.set(b.id,st);
            ctx.fillStyle='#fff';
            ctx.beginPath();ctx.moveTo(st.px,st.py);
            ctx.lineTo(st.px-ARROW_W/2,st.py-ARROW_H);
            ctx.lineTo(st.px+ARROW_W/2,st.py-ARROW_H);
            ctx.closePath(); ctx.fill();
          }

          /* name label if metadata present */
          if(name){
            const yOffset = BALL_RADIUS + 6 + (idx===youIdx ? ARROW_H : 0);
            const destX = x, destY = y - yOffset;
            const st = labelPos.get(b.id) ?? {px:destX,py:destY};
            st.px=mix(st.px,destX,lerpF); st.py=mix(st.py,destY,lerpF);
            labelPos.set(b.id,st);

            ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
            ctx.lineWidth=3; ctx.strokeStyle='rgba(0,0,0,0.7)';
            ctx.strokeText(name,st.px,st.py);
            ctx.fillStyle='#ffffff'; ctx.fillText(name,st.px,st.py);
          }
        });

        /* cleanup maps for vanished bodies */
        const ids=new Set(balls.map(b=>b.id));
        arrowPos.forEach((_,id)=>{if(!ids.has(id))arrowPos.delete(id);});
        labelPos.forEach((_,id)=>{if(!ids.has(id))labelPos.delete(id);});

        ctx.restore();
      }}/>

      <Scoreboard
        roster={roster}
        scores={scores}
        mults={mults}
        targetPoints={targetPoints}
        final={finished}
        payouts={payouts}
        metadata={metadata}
      />
    </div>
  );
}
