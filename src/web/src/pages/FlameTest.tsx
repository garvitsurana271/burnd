import { Canvas } from '@react-three/fiber';
import { FlameShader } from '../3d/FlameShader.js';

export function FlameTest(): JSX.Element {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#09090f' }}>
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }}>
        <FlameShader intensity={0.7} />
      </Canvas>
    </div>
  );
}
