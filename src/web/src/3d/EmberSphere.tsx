import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EmberSphereProps {
  position: [number, number, number];
  intensity?: number;
}

export function EmberSphere({ position, intensity = 0.7 }: EmberSphereProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const s = 1 + Math.sin(t * 1.5 + position[0]) * 0.06 * intensity;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.7 + intensity * 0.5}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}
