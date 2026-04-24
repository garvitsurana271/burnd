import { Act1Hero } from '../scenes/Act1Hero.js';

export function LandingPage(): JSX.Element {
  return (
    <div className="bg-[#09090f] text-white">
      <Act1Hero />
      {/* Placeholder for scroll-room while subsequent acts are built */}
      <div style={{ height: '100vh' }} />
    </div>
  );
}
