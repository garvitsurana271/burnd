import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ScreenQuad } from '@react-three/drei';
import * as THREE from 'three';
import { flameFragmentShader } from './shaders/flame.js';

interface FlameShaderProps {
  intensity: number;
}

// Vertex shader for ScreenQuad: bypasses camera, fills NDC.
const screenVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

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
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={screenVertexShader}
        fragmentShader={flameFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </ScreenQuad>
  );
}
