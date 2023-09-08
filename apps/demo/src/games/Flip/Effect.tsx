import { useFrame } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'

const tmp = new THREE.Object3D

export const Effect = ({ color }: {color: string}) => {
  const mesh = React.useRef<THREE.InstancedMesh>(null!)
  const animation = React.useRef(0)
  const startTime = React.useMemo(() => Date.now(), [])

  useFrame(() => {
    let i = 0
    for (let line = 0; line < 10; line ++) {
      const angle = line * startTime
      for (let dot = 0; dot < 10; dot ++) {
        tmp.scale.setScalar(animation.current * .1 * (1 - animation.current))
        tmp.rotation.z = angle
        const len = .5 + 2 * animation.current
        tmp.position.set(
          Math.cos(angle) * len,
          Math.sin(angle) * len,
          0,
        )
        tmp.updateMatrix()
        mesh.current.setMatrixAt(i, tmp.matrix)
        i++
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true
    animation.current += (1 - animation.current) * .1
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 10 * 10]}>
      <sphereGeometry args={[5]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}
