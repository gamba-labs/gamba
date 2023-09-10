import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React from 'react'
import { Group } from 'three'

import TEXTURE_HEADS from './heads.png'
import TEXTURE_TAILS from './tails.png'

const COIN_COLOR = '#ffd630'

function CoinModel() {
  const [heads, tails] = useTexture([TEXTURE_HEADS, TEXTURE_TAILS])

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <cylinderGeometry args={[1, 1, .29]} />
        <meshBasicMaterial
          color={COIN_COLOR}
        />
      </mesh>
      <mesh position-z={.15}>
        <planeGeometry args={[1.3, 1.3, 1.3]} />
        <meshBasicMaterial transparent map={heads} />
      </mesh>
      <group rotation-y={Math.PI}>
        <mesh position-z={.15}>
          <planeGeometry args={[1.3, 1.3, 1.3]} />
          <meshBasicMaterial transparent map={tails} />
        </mesh>
      </group>
    </>
  )
}

interface CoinFlipProps {
  flipping: boolean
  result: number | null
}

export function Coin({ flipping, result }: CoinFlipProps) {
  const group = React.useRef<Group>(null!)
  const target = React.useRef(0)

  React.useEffect(() => {
    if (!flipping && result !== null) {
      const fullTurns = Math.floor(group.current.rotation.y / (Math.PI * 2))
      target.current = (fullTurns + 1) * Math.PI * 2 + result * Math.PI
    }
  }, [flipping, result])

  useFrame((_, dt) => {
    if (flipping) {
      group.current.rotation.y += 25 * dt
    } else if (result !== null) {
      group.current.rotation.y += (target.current - group.current.rotation.y) * .1
    }
    const scale = flipping ? 1.25 : 1
    group.current.scale.y += (scale - group.current.scale.y) * .1
    group.current.scale.setScalar(group.current.scale.y)
  })

  return (
    <group ref={group}>
      <CoinModel />
    </group>
  )
}
