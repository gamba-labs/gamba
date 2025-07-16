// src/games/Jackpot/WinnerAnimation.tsx
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from 'react'
import styled, { keyframes, css } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import type { IdlAccounts } from '@coral-xyz/anchor'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'
import type { PublicKey } from '@solana/web3.js'

/* ─── glowing winner frame ───────────────────────────────────── */
const winnerGlow = keyframes`
  0%,100% { box-shadow:0 0 15px 5px rgba(46,204,113,.7);transform:scale(1.1) }
  50%     { box-shadow:0 0 30px 10px rgba(46,204,113,1);transform:scale(1.15)}
`

/* ─── styled components ──────────────────────────────────────── */
const Wrapper = styled(motion.div)`
  position:absolute;inset:0;
  display:flex;flex-direction:column;justify-content:center;align-items:center;
  background:rgba(26,26,46,.9);backdrop-filter:blur(5px);z-index:100;
`
const ReelContainer = styled.div`
  position:relative;width:100%;max-width:80vw;overflow:hidden;padding:20px 0;
  mask-image:linear-gradient(to right,transparent,black 20%,black 80%,transparent);
`
const Pointer = styled.div`
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:4px;height:100%;background:#f39c12;box-shadow:0 0 10px #f39c12;border-radius:2px;z-index:2;
`
const PlayerReel = styled(motion.div)`display:flex`
const PlayerCard = styled.div<{ $isWinner:boolean;$isYou:boolean }>`
  position:relative;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  width:100px;height:120px;margin:0 5px;border-radius:10px;background:#2c2c54;border:2px solid #4a4a7c;transition:.3s;
  ${({$isYou,$isWinner})=>$isYou&&!$isWinner&&css`
      border-color:#3498db;box-shadow:0 0 10px 2px rgba(52,152,219,.6);`}
  ${({$isWinner})=>$isWinner&&css`
      border-color:#2ecc71;animation:${winnerGlow} 1.5s ease-in-out infinite;`}
`
const YouBadge=styled.div`
  position:absolute;top:-10px;padding:2px 8px;font-size:.7rem;font-weight:700;color:#fff;background:#3498db;border-radius:6px;
`
const Avatar=styled.div`width:50px;height:50px;border-radius:50%;background:#4a4a7c;margin-bottom:10px;`
const PlayerAddress=styled.div`font-size:.8rem;color:#e0e0e0;font-family:monospace;`
const BottomBar=styled.div`height:3rem;display:flex;align-items:center;justify-content:center;`
const WinnerText=styled(motion.div)`
  font-size:1.5rem;color:#fff;font-weight:bold;text-shadow:0 0 10px #2ecc71;
`

/* ─── helpers ────────────────────────────────────────────────── */
type Player = IdlAccounts<Multiplayer>['game']['players'][number]

const TARGET = 100 // where winner should land

const buildReel = (snapshot: Player[], winnerIdx: number): Player[] => {
  const n = snapshot.length
  if (!n) return []

  const winner   = snapshot[winnerIdx] ?? snapshot[0]
  const shuffled = [...snapshot].sort(()=>Math.random()-0.5)

  const reel = Array.from({ length: TARGET*2 }, (_,i)=>shuffled[i%n])
  reel[TARGET] = winner

  if (n>1){
    const neighbour = snapshot.find(p=>!p.user.equals(winner.user)) ?? snapshot[(winnerIdx+1)%n]
    reel[TARGET-1] = neighbour
  }
  return reel
}

const short = (s:string)=>`${s.slice(0,4)}…`

/* ─── component ──────────────────────────────────────────────── */
interface Props{
  players:Player[]
  winnerIndexes:number[]
  currentUser?:PublicKey|null
  onClose?:()=>void
}

const WinnerAnimation:React.FC<Props>=({
  players,
  winnerIndexes,
  currentUser,
  onClose,
})=>{
  if(!players.length||!winnerIndexes.length) return null

  /* ----------------------------------------------------------------
   * 1.  Freeze a snapshot of the player list & reel ONCE
   * ----------------------------------------------------------------*/
  const winnerIdx = winnerIndexes[0]
  const frozenPlayersRef = useRef<Player[]>([])
  const reelRefData      = useRef<Player[]>([])

  if (frozenPlayersRef.current.length===0){
    frozenPlayersRef.current = players.map(p=>p)        // shallow copy
    reelRefData.current      = buildReel(frozenPlayersRef.current, winnerIdx)
  }

  const frozenPlayers = frozenPlayersRef.current
  const reel          = reelRefData.current

  /* ----------------------------------------------------------------
   * 2.  Spin logic
   * ----------------------------------------------------------------*/
  const [closing,setClosing]   = useState(false)
  const [spinDone,setSpinDone] = useState(false)
  const [winner,setWinner]     = useState<Player|null>(null)
  const [offset,setOffset]     = useState(0)

  const reelEl = useRef<HTMLDivElement>(null)

  // centre winner
  useLayoutEffect(()=>{
    if(!reelEl.current) return
    const w = reelEl.current.clientWidth
    const card = reelEl.current.children[TARGET] as HTMLElement|undefined
    if(!card) return
    const centre = card.offsetLeft + card.offsetWidth/2
    setOffset(-(centre - w/2))
  },[])            // ← empty dep => run once (prevents flicker)

  // after spin finishes
  useEffect(()=>{
    if(!spinDone) return
    const t = setTimeout(()=>setWinner(frozenPlayers[winnerIdx]),1500)
    return ()=>clearTimeout(t)
  },[spinDone,winnerIdx,frozenPlayers])

  // auto‑close after reveal
  useEffect(()=>{
    if(!winner) return
    const t = setTimeout(()=>setClosing(true),3000)
    return ()=>clearTimeout(t)
  },[winner])

  // inform parent
  useEffect(()=>{
    if(closing) onClose?.()
  },[closing,onClose])

  const winnerAddr = winner?.user.toBase58() ?? ''
  const meAddr     = currentUser?.toBase58() ?? ''

  /* ----------------------------------------------------------------
   * 3.  Render
   * ----------------------------------------------------------------*/
  return(
    <AnimatePresence>
      {!closing&&(
        <Wrapper
          initial={{opacity:0}}
          animate={{opacity:1}}
          exit={{opacity:0}}
        >
          <ReelContainer>
            <Pointer/>
            <PlayerReel
              ref={reelEl}
              initial={{x:0}}
              animate={{x:offset}}
              transition={{duration:6,ease:[0.22,1,0.36,1],delay:1}}
              onAnimationComplete={()=>setSpinDone(true)}
            >
              {reel.map((p,i)=>{
                const addr = p.user.toBase58()
                const isWinner = addr===winnerAddr && i===TARGET
                const isYou    = addr===meAddr
                return(
                  <PlayerCard key={`${addr}-${i}`} $isWinner={isWinner} $isYou={isYou}>
                    {isYou && !isWinner && <YouBadge>YOU</YouBadge>}
                    <Avatar/>
                    <PlayerAddress>{short(addr)}</PlayerAddress>
                  </PlayerCard>
                )
              })}
            </PlayerReel>
          </ReelContainer>

          <BottomBar>
            <AnimatePresence>
              {winner&&(
                <WinnerText
                  initial={{opacity:0,y:20}}
                  animate={{opacity:1,y:0}}
                  exit={{opacity:0}}
                  transition={{delay:.2}}
                >
                  Winner: {short(winnerAddr)}
                </WinnerText>
              )}
            </AnimatePresence>
          </BottomBar>
        </Wrapper>
      )}
    </AnimatePresence>
  )
}

export default WinnerAnimation
