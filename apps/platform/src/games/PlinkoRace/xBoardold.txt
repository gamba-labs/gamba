// src/games/PlinkoRace/Board.tsx
import React, { useMemo, useRef, useEffect, useState } from 'react'
import { GambaUi }                from 'gamba-react-ui-v2'
import { PublicKey }              from '@solana/web3.js'
import { useWallet }              from '@solana/wallet-adapter-react'
import { useMultiPlinko }         from './useMultiPlinko'
import { Composite }              from 'matter-js'
import { WIDTH, HEIGHT }          from './engine'

/* colour palette */
const COLORS = [
  '#f80015ff','#0600baff','#0cf700ff','#ffffffff','#b60083ff','#ffee00ff',
]

type Player = { id:string; color:string }
interface Props {
  players   : PublicKey[]
  winnerIdx : number | null
}

export const Board: React.FC<Props> = ({ players, winnerIdx }) => {
  const wallet = useWallet()

  /* stable colours */
  const roster: Player[] = useMemo(
    () => players.map((p,i)=>({ id:p.toBase58(), color:COLORS[i%COLORS.length] })),
    [players],
  )

  const { engine, recordRace, replayRace } = useMultiPlinko(
    { rows:14, players:roster },
    [roster],
  )

  /* flag & finish order */
  const started = useRef(false)
  const [order, setOrder] = useState<number[]>([])   // indices sorted by finish

  useEffect(()=>{ started.current=false; setOrder([]) }, [roster.length, engine])

  /* helper */
  const runRace = (idx:number, tag='')=>{
    if(!engine) return
    const race = recordRace(idx)
    if(!race){ console.warn('recordRace null', tag); return }

    /* compute finish order once (frame where y >= HEIGHT) */
    const finishFrame = race.paths.map(arr=>{
      for(let f=0; f<arr.length/2; f++){
        const y = arr[f*2+1]
        if (y >= HEIGHT) return f
      }
      return Infinity
    })
    const ranking = finishFrame
      .map((f,i)=>({i,f}))
      .sort((a,b)=>a.f-b.f)
      .map(o=>o.i)
    setOrder(ranking)

    console.log('[PlinkoRace]', tag, 'finish order', ranking)
    replayRace(race)
    started.current = true
  }

  /* debug button */
  const forceSimulate = ()=> runRace(Math.floor(Math.random()*roster.length),'(debug)')

  /* on‑chain */
  useEffect(()=>{
    if(winnerIdx===null || !engine || started.current) return
    runRace(winnerIdx,'(on‑chain)')
  },[winnerIdx, engine])

  /* ───────────────────────── render ────────────────────────── */
  return (
    <>
      {/* status overlay */}
      <div style={{
        position:'absolute',top:8,left:8,background:'rgba(0,0,0,.7)',
        color:'#0f0',padding:'6px 12px',borderRadius:6,
        fontFamily:'monospace',fontSize:12,zIndex:999,
      }}>
        <div>engine: {engine?'ready':'…'}</div>
        <div>players: {players.length}</div>
        <div>winnerIdx: {winnerIdx===null?'null':winnerIdx}</div>
        <div>started: {started.current?'yes':'no'}</div>
      </div>

      {/* main canvas */}
      <GambaUi.Canvas render={({ctx,size})=>{
        if(!engine) return
        const bodies  = Composite.allBodies(engine.engine.world)
        const scale   = Math.min(size.width/WIDTH, size.height/HEIGHT)

        ctx.clearRect(0,0,size.width,size.height)
        ctx.fillStyle='#0b0b13'
        ctx.fillRect(0,0,size.width,size.height)

        ctx.save()
        ctx.translate((size.width-WIDTH*scale)/2,(size.height-HEIGHT*scale)/2)
        ctx.scale(scale,scale)

        /* --- checkered finish line --- */
        const square = 20
        for(let i=0; i<Math.ceil(WIDTH/square); i++){
          ctx.fillStyle = i%2 ? '#000' : '#fff'
          ctx.fillRect(i*square, HEIGHT-square, square, square)
        }

        /* world bodies */
        bodies.forEach(b=>{
          ctx.beginPath()
          b.vertices.forEach((v,i)=>
            i===0 ? ctx.moveTo(v.x,v.y) : ctx.lineTo(v.x,v.y))
          ctx.closePath()

          switch(b.label){
            case 'Peg': ctx.fillStyle='#666'; ctx.fill(); break
            case 'Ball': {
              ctx.fillStyle = roster[b.plugin.playerIndex]?.color || '#fff'
              ctx.fill(); break
            }
            default: /* walls etc */ ctx.fillStyle='#999'; ctx.fill()
          }
        })
        ctx.restore()
      }}/>

      {/* debug */}
      <button onClick={forceSimulate} style={{
        position:'absolute',bottom:20,left:20,
        padding:'8px 16px',fontSize:14,fontWeight:600,
        borderRadius:6,background:'#222',color:'#fff',border:'none',
        cursor:'pointer',
      }}>Simulate (debug)</button>

      {/* legend + placement */}
      <div style={{
        position:'absolute',top:20,right:20,
        background:'#0008',padding:'8px 12px',borderRadius:8,
        color:'#fff',fontSize:14,
      }}>
        {roster.map((p,i)=>{
          const place = order.indexOf(i)   // -1 until finished
          return (
            <div key={p.id} style={{display:'flex',alignItems:'center',marginBottom:6}}>
              <div style={{
                width:12,height:12,background:p.color,borderRadius:3,marginRight:8,
              }}/>
              <span style={{minWidth:60}}>
                {p.id===wallet.publicKey?.toBase58()
                  ? 'You'
                  : `${p.id.slice(0,4)}…${p.id.slice(-4)}`}
              </span>
              {place!==-1 && (
                <strong style={{marginLeft:6}}>
                  {place+1}
                  {place===0?'st':place===1?'nd':place===2?'rd':'th'}
                </strong>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
