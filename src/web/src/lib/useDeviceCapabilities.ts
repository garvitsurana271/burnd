import { useState, useEffect } from 'react';

export interface DeviceCapabilities {
  hasWebGL: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  // True when we should render the 3D cinematic experience.
  // False => render the 2D Motion-fallback version.
  shouldRender3D: boolean;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>({
    hasWebGL: true,
    isMobile: false,
    prefersReducedMotion: false,
    shouldRender3D: true,
  });

  useEffect(() => {
    const hasWebGL = detectWebGL();
    const mqMobile = window.matchMedia('(max-width: 768px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function compute(): DeviceCapabilities {
      const isMobile = mqMobile.matches;
      const prefersReducedMotion = mqMotion.matches;
      return {
        hasWebGL,
        isMobile,
        prefersReducedMotion,
        shouldRender3D: hasWebGL && !isMobile && !prefersReducedMotion,
      };
    }

    setCaps(compute());
    const handler = (): void => setCaps(compute());
    mqMobile.addEventListener('change', handler);
    mqMotion.addEventListener('change', handler);
    return () => {
      mqMobile.removeEventListener('change', handler);
      mqMotion.removeEventListener('change', handler);
    };
  }, []);

  return caps;
}
