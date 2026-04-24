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
  uniform float uIntensity;  // 0..1
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
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = p * 2.02 + vec2(13.7, 5.3);
      a *= 0.5;
    }
    return v;
  }

  // A single flame tongue centered at axisX with given height, scaled by base width.
  float tongue(vec2 uv, float axisX, float height, float width, float t) {
    // Sampling coords rise upward with time
    vec2 sp = vec2((uv.x - axisX) * 3.5, uv.y * 2.2 - t * 0.8);
    // Two warps for organic shape
    float w1 = fbm(sp + vec2(0.0, t * 0.3));
    float w2 = fbm(sp + vec2(4.2, t * 0.5));
    float n = fbm(sp + vec2(w1, w2) * 1.0);

    // Base gradient: 1 at bottom, falls to 0 past height
    float yFall = smoothstep(height, 0.0, uv.y);

    // Horizontal taper: narrower toward top, proportional to remaining height
    float widthAtY = width * (1.0 - uv.y / max(height, 0.01) * 0.8);
    float hDistance = abs(uv.x - axisX) / max(widthAtY, 0.01);
    float hFall = 1.0 - smoothstep(0.3, 1.1, hDistance);

    float body = yFall * hFall;

    // Carve edges with noise
    body -= (1.0 - n) * 0.45;

    return body;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;

    // Three parallel flame tongues (center, left, right) with slight time offsets
    // creates a wider, more cinematic fire rather than a single pyramid
    float centerAxis = 0.5 + (fbm(vec2(uv.y * 2.0, t * 0.6)) - 0.5) * 0.06;
    float leftAxis = 0.32 + (fbm(vec2(uv.y * 2.2, t * 0.7 + 9.1)) - 0.5) * 0.05;
    float rightAxis = 0.68 + (fbm(vec2(uv.y * 2.4, t * 0.5 + 3.7)) - 0.5) * 0.05;

    // Each tongue: height + width vary slightly with intensity and time
    float heightBoost = 0.2 + uIntensity * 0.35;
    float mainH = 0.85 + heightBoost + sin(t * 1.1) * 0.04;
    float sideH = 0.55 + heightBoost * 0.7;

    float f1 = tongue(uv, centerAxis, mainH, 0.22, t);
    float f2 = tongue(uv, leftAxis, sideH, 0.18, t + 2.1);
    float f3 = tongue(uv, rightAxis, sideH, 0.18, t + 5.3);

    // Union: take max (so tongues don't double-lighten the overlap)
    float flame = max(max(f1, f2), f3);

    // Add a wider low-base glow that unifies the fire bed
    float bed = smoothstep(0.3, 0.0, uv.y) * smoothstep(0.92, 0.05, abs(uv.x - 0.5) * 2.0);
    flame = max(flame, bed * 0.6);

    // Ambient noise subtle detail
    float detail = fbm(uv * vec2(6.0, 12.0) - vec2(0.0, t * 1.2)) - 0.5;
    flame += detail * 0.08;

    float flameMask = smoothstep(-0.05, 0.30, flame);

    // Color palette — temperature-based (hot at center, cool at edges/tips)
    vec3 cInner = vec3(1.0, 0.88, 0.55);   // hot white-yellow
    vec3 cAmber = vec3(0.98, 0.58, 0.08);  // amber
    vec3 cOrange = vec3(0.85, 0.32, 0.02); // darker orange
    vec3 cViolet = vec3(0.45, 0.30, 0.85); // cooler violet
    vec3 cIndigo = vec3(0.39, 0.40, 0.95); // #6366f1

    // Vertical ramp for tip coloring
    float tipMix = smoothstep(0.1, 0.65, uv.y);
    vec3 color = mix(cAmber, cOrange, smoothstep(0.0, 0.15, uv.y));
    color = mix(color, cAmber, smoothstep(0.05, 0.3, uv.y));
    color = mix(color, cViolet, tipMix);
    color = mix(color, cIndigo, smoothstep(0.5, 0.9, uv.y));

    // Hot inner core
    float hot = smoothstep(0.6, 1.0, flameMask) * smoothstep(0.45, 0.0, uv.y);
    color = mix(color, cInner, hot * 0.55);

    // Flame brightness modulation — measured, let bloom do the heavy lifting
    color *= 0.75 + flameMask * 0.45;
    color *= 0.9 + uIntensity * 0.25;

    float alpha = smoothstep(0.02, 0.28, flameMask);

    gl_FragColor = vec4(color, alpha);
  }
`;
