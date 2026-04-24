import { lazy, Suspense } from 'react';
import { useDeviceCapabilities } from '../lib/useDeviceCapabilities.js';
import { Act1Hero } from '../scenes/Act1Hero.js';
import { MobileLanding } from '../motion-fallback/MobileLanding.js';

const Act2Terminal = lazy(() => import('../scenes/Act2Terminal.js').then(m => ({ default: m.Act2Terminal })));
const Act3Embers = lazy(() => import('../scenes/Act3Embers.js').then(m => ({ default: m.Act3Embers })));
const Act4Dashboard = lazy(() => import('../scenes/Act4Dashboard.js').then(m => ({ default: m.Act4Dashboard })));
const Act5Pricing = lazy(() => import('../scenes/Act5Pricing.js').then(m => ({ default: m.Act5Pricing })));
const Act6Ignition = lazy(() => import('../scenes/Act6Ignition.js').then(m => ({ default: m.Act6Ignition })));

export function LandingPage(): JSX.Element {
  const caps = useDeviceCapabilities();
  if (!caps.shouldRender3D) {
    return <MobileLanding />;
  }
  return (
    <div className="bg-[#09090f] text-[#F5E8D4] font-sans antialiased">
      <Act1Hero />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Act2Terminal />
        <Act3Embers />
        <Act4Dashboard />
        <Act5Pricing />
        <Act6Ignition />
      </Suspense>
    </div>
  );
}
