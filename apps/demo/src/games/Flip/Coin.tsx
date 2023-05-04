import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, CanvasTexture, Group, MeshStandardMaterial } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import assetModel from './Coin.glb'
import assetLogo from './logo.png'

const COIN_COLOR = '#ffd630'
const LABEL_FONT = 'bold 50px Arial'
const LABEL_TEXT_COLOR = 'white'
const LABEL_TEXT_OUTLINE = 'black'
const LABEL_TEXT_OUTLINE_THICKNESS = 15
const OPTIONS = [
  { label: 'Heads' },
  { label: 'Tails' },
]

type GLTFResult = GLTF & {
  nodes: {
    Coin: THREE.Mesh<BufferGeometry, MeshStandardMaterial>
  }
}

/** Creates label textures for HEADS / TAILS */
const createLabelTexture = (label: string, size = 300) => {
  const halfSize = size / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const texture = new CanvasTexture(canvas)
  const ctx = canvas.getContext('2d')!
  const image = document.createElement('img')
  image.src = assetLogo
  image.onload = () => {
    // Draw image
    ctx.save()
    ctx.beginPath()
    ctx.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size)
    // Draw text
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.font = LABEL_FONT
    ctx.fillStyle = LABEL_TEXT_COLOR
    ctx.strokeStyle = LABEL_TEXT_OUTLINE
    ctx.lineWidth = LABEL_TEXT_OUTLINE_THICKNESS
    ctx.strokeText(label.toUpperCase(), halfSize, halfSize)
    ctx.fillText(label.toUpperCase(), halfSize, halfSize)
    texture.needsUpdate = true
  }
  return texture
}

function CoinModel() {
  const coin = useGLTF(assetModel) as GLTFResult
  const [heads, tails] = useMemo(() => OPTIONS.map(({ label }) => createLabelTexture(label)), [])
  return (
    <>
      <primitive object={coin.nodes.Coin}>
        <primitive
          object={coin.nodes.Coin.material}
          color={COIN_COLOR}
          emissive={COIN_COLOR}
          emissiveIntensity={.25}
          roughness={.3}
        />
      </primitive>
      <mesh position-z={.26}>
        <planeGeometry args={[1.3, 1.3, 1.3]} />
        <meshBasicMaterial transparent map={heads} />
      </mesh>
      <group rotation-y={Math.PI}>
        <mesh position-z={.26}>
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
  const group = useRef<Group>(null!)
  const speed = useRef(0)
  const target = useRef(0)

  useEffect(() => {
    if (flipping) {
      speed.current = 1
    }
    if (!flipping && result !== null) {
      const fullTurns = Math.floor(group.current.rotation.y / (Math.PI * 2))
      target.current = (fullTurns + 1) * Math.PI * 2 + result * Math.PI
      speed.current = 0
    }
  }, [flipping, result])

  useFrame((_, dt) => {
    if (flipping) {
      speed.current += (.5 - speed.current) * .99
    } else if (result !== null) {
      group.current.rotation.y += (target.current - group.current.rotation.y) * .01
    } else {
      group.current.rotation.y += .01
    }
    group.current.rotation.y += dt * speed.current * 25
  })

  return (
    <>
      <ambientLight color="#ffffff" intensity={.5} />
      <directionalLight position={[0, 5, 5]} intensity={.5} />
      <hemisphereLight color="black" groundColor="red" intensity={1} />
      <group scale={[.75, .75, .75]} ref={group}>
        <CoinModel />
      </group>
    </>
  )
}
