import { Text, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { ActionBar, Button } from 'gamba/react-ui'
import React, { useRef } from 'react'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import chestModel from './treasure.glb'

type GLTFResult = GLTF & {
  nodes: {
    Box001: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  }
}

function Scene() {
  const ref = useRef<THREE.Group>(null!)
  const model = useGLTF(chestModel) as GLTFResult
  useFrame((_, dt) => {
    ref.current.rotation.y += dt
  })
  return (
    <>
      <group ref={ref}>
        <mesh geometry={model.nodes.Box001.geometry}>
          <meshBasicMaterial map={model.nodes.Box001.material.map} />
        </mesh>
      </group>
      <Text fontSize={.5}>
        Three.js Test
      </Text>
    </>
  )
}

export default function Three() {
  return (
    <>
      <Canvas style={{ background: 'linear-gradient(rgba(36,237,255,1) 0%, rgba(69,77,252,1) 100%)' }} camera={{ position: [0, 1, 12], fov: 30 }}>
        <Scene />
      </Canvas>
      <ActionBar>
        <Button>
          OK
        </Button>
      </ActionBar>
    </>
  )
}
