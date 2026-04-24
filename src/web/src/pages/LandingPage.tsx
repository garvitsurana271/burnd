import { useDeviceCapabilities } from '../lib/useDeviceCapabilities.js';
import { Act1Hero } from '../scenes/Act1Hero.js';
import { Act2Terminal } from '../scenes/Act2Terminal.js';
import { Act3Embers } from '../scenes/Act3Embers.js';
import { Act4Dashboard } from '../scenes/Act4Dashboard.js';
import { Act5Pricing } from '../scenes/Act5Pricing.js';
import { Act6Ignition } from '../scenes/Act6Ignition.js';
import { MobileLanding } from '../motion-fallback/MobileLanding.js';

export function LandingPage(): JSX.Element {
  const caps = useDeviceCapabilities();
  if (!caps.shouldRender3D) {
    return <MobileLanding />;
  }

  return (
    <div className="bg-[#09090f] text-[#F5E8D4] font-sans antialiased">
      <Act1Hero />
      <Act2Terminal />
      <Act3Embers />
      <Act4Dashboard />
      <Act5Pricing />
      <Act6Ignition />
    </div>
  );
}
