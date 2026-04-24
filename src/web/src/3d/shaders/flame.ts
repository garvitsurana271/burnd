export const flameVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const flameFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uIntensity;  // 0..1, driven by scroll
  uniform vec2 uResolution;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Flame distortion: offset vertical by time, noise by horizontal
    vec2 p = uv * vec2(1.8, 2.6);
    p.y -= uTime * 0.5;

    float n = fbm(p);

    // Flame mask (higher near bottom, tapered toward top)
    float base = smoothstep(0.0, 0.35, 1.0 - uv.y);

    // Horizontal taper so flame is narrow at top
    float horizontal = smoothstep(0.3, 0.5, 1.0 - abs(uv.x - 0.5) * 2.0);

    float flame = n * base * horizontal * (0.8 + uIntensity * 1.6);

    // Color gradient: amber at base, indigo tip
    vec3 amber = vec3(0.96, 0.62, 0.04);   // #f59e0b
    vec3 indigo = vec3(0.39, 0.40, 0.95);  // #6366f1
    vec3 deepAmber = vec3(1.0, 0.85, 0.3); // hot center highlight
    vec3 color = mix(amber, indigo, smoothstep(0.0, 0.75, uv.y));
    // Inject hot highlights based on flame intensity
    color = mix(color, deepAmber, smoothstep(0.4, 0.9, flame) * 0.7);

    // Global intensity boost -- brighten more when scrolled
    color *= flame * (1.2 + uIntensity * 1.4);

    // Alpha: zero outside flame, full in hot core
    float alpha = smoothstep(0.04, 0.35, flame);

    gl_FragColor = vec4(color, alpha);
  }
`;
