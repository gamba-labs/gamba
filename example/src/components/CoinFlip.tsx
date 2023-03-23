import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { Suspense, useEffect, useRef } from 'react'
import { BufferGeometry, Group, MeshStandardMaterial } from 'three'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Coin: THREE.Mesh<BufferGeometry, MeshStandardMaterial>
  }
}

function CoinModel() {
  const coin = useGLTF('/Coin.glb') as GLTFResult
  const heads = useTexture('/coin-heads.png')
  const tails = useTexture('/coin-tails.png')
  return (
    <>
      <primitive object={coin.nodes.Coin}>
        <primitive
          object={coin.nodes.Coin.material}
          color="#ffd630"
          emissive="#ffd630"
          emissiveIntensity={.2}
          roughness={0.3}
        />
      </primitive>
      <group>
        <mesh position-z={.26}>
          <planeGeometry />
          <meshBasicMaterial transparent map={heads} />
        </mesh>
      </group>
      <group rotation-y={Math.PI}>
        <mesh position-z={.26}>
          <planeGeometry />
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

export function CoinFlip({ flipping, result }: CoinFlipProps) {
  const group = useRef<Group>(null!)
  const speed = useRef(0)
  const target = useRef(0)

  useEffect(() => {
    if (flipping) {
      speed.current = 1
    }
    if (!flipping && result !== null) {
      const fullTurns = Math.floor(group.current.rotation.y / (Math.PI * 2))
      target.current = (fullTurns + 2) * Math.PI * 2 + result * Math.PI
      speed.current = 0
    }
  }, [flipping, result])

  useFrame((_, dt) => {
    if (flipping) {
      if (speed.current > .5)
        speed.current *= .99
    } else {
      group.current.rotation.y += (target.current - group.current.rotation.y) * .01
    }
    group.current.rotation.y += dt * speed.current * 30
  })

  return (
    <>
      <ambientLight color="#ffffff" intensity={.5} />
      <directionalLight position={[0, 5, 5]} intensity={.5} />
      <hemisphereLight color="black" groundColor="red" intensity={1} />
      <group ref={group}>
        <Suspense fallback={null}>
          <CoinModel />
        </Suspense>
      </group>
    </>
  )
}
