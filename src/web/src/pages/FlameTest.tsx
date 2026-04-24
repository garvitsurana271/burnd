import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { FlameVideo } from '../3d/FlameVideo.js';

export function FlameTest(): JSX.Element {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#09090f' }}>
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }}>
        <FlameVideo intensity={0.7} />
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
