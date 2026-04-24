import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FlameVideoProps {
  intensity: number;
  src?: string;
}

/**
 * Fullscreen video-based flame. Real fire footage on black background played
 * on a fullscreen plane. Pair with <EffectComposer><Bloom /></EffectComposer>
 * for the cinematic glow halo.
 */
export function FlameVideo({ intensity, src = '/fire.mp4' }: FlameVideoProps): JSX.Element {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const video = useMemo(() => {
    const v = document.createElement('video');
    v.src = src;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    v.crossOrigin = 'anonymous';
    // Must be attached to DOM for reliable decode/play across browsers.
    v.style.position = 'fixed';
    v.style.left = '-9999px';
    v.style.width = '1px';
    v.style.height = '1px';
    v.style.opacity = '0';
    v.style.pointerEvents = 'none';
    document.body.appendChild(v);
    void v.play().catch(() => {
      // Autoplay can fail until user interaction. Harmless — first scroll/click
      // will start it.
    });
    return v;
  }, [src]);

  const texture = useMemo(() => {
    const t = new THREE.VideoTexture(video);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [video]);

  useEffect(() => {
    return () => {
      video.pause();
      video.src = '';
      if (video.parentNode) video.parentNode.removeChild(video);
      texture.dispose();
    };
  }, [video, texture]);

  const uniforms = useMemo(
    () => ({
      uVideo: { value: texture },
      uIntensity: { value: intensity },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uVideoResolution: { value: new THREE.Vector2(1920, 1080) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    function onMeta(): void {
      uniforms.uVideoResolution.value.set(video.videoWidth || 1920, video.videoHeight || 1080);
    }
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();
    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [video, uniforms]);

  useFrame(() => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms as {
      uIntensity: { value: number };
      uResolution: { value: THREE.Vector2 };
    };
    u.uIntensity.value = intensity;
    u.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          precision highp float;

          uniform sampler2D uVideo;
          uniform float uIntensity;
          uniform vec2 uResolution;
          uniform vec2 uVideoResolution;
          varying vec2 vUv;

          void main() {
            float videoAspect = uVideoResolution.x / max(uVideoResolution.y, 1.0);
            float screenAspect = uResolution.x / max(uResolution.y, 1.0);
            vec2 uv = vUv;
            if (screenAspect > videoAspect) {
              float scale = videoAspect / screenAspect;
              uv.y = (uv.y - 0.5) * scale + 0.5;
            } else {
              float scale = screenAspect / videoAspect;
              uv.x = (uv.x - 0.5) * scale + 0.5;
            }

            vec3 c = texture2D(uVideo, uv).rgb;
            float luma = max(max(c.r, c.g), c.b);

            float brightness = 0.6 + uIntensity * 0.6;
            c *= brightness;

            // Subtle indigo cast at the top of the tip to tie into AXIS palette.
            float tipFactor = smoothstep(0.55, 0.95, vUv.y);
            vec3 indigo = vec3(0.39, 0.40, 0.95);
            c = mix(c, c * 0.6 + indigo * 0.4, tipFactor * smoothstep(0.05, 0.15, luma));

            float alpha = smoothstep(0.02, 0.25, luma);
            gl_FragColor = vec4(c, alpha);
          }
        `}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
