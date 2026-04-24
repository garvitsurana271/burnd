import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { flameVertexShader, flameFragmentShader } from './shaders/flame.js';

interface FlameShaderProps {
  intensity: number;
}

export function FlameShader({ intensity }: FlameShaderProps): JSX.Element {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    const u = mat.uniforms as {
      uTime: { value: number };
      uIntensity: { value: number };
      uResolution: { value: THREE.Vector2 };
    };
    u.uTime.value = state.clock.getElapsedTime();
    u.uIntensity.value = intensity;
    u.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
