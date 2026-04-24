import React from 'react';
import { AbsoluteFill } from 'remotion';

const BG = '#06060e';
const SURF = '#0e0e1a';
const ACC = '#6366f1';
const AMB = '#f59e0b';
const EMR = '#10b981';
const RED = '#ef4444';
const TXT = '#f5f5f7';
const DIM = '#6b7280';

const SANS: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFeatureSettings: '"tnum","ss01"',
};
const MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
};

const Grain: React.FC = () => (
  <AbsoluteFill style={{
    pointerEvents: 'none',
    backgroundImage:
      'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
    backgroundSize: '3px 3px',
    mixBlendMode: 'overlay',
    opacity: 0.5,
  }} />
);

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 92% 90% at 50% 50%, transparent 22%, rgba(0,0,0,0.78) 100%)',
    }} />
  </AbsoluteFill>
);

// ─── A ── Pain-reveal: "$14,501" dominates, amber micro-eyebrow ───────────────
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    {/* ambient glow behind the number */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 900, height: 900, borderRadius: '50%',
      background: `radial-gradient(circle, ${RED}28 0%, transparent 60%)`,
      filter: 'blur(40px)',
    }} />

    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: '0 80px',
    }}>
      {/* eyebrow */}
      <div style={{
        ...MONO, fontSize: 28, fontWeight: 600, color: AMB,
        textTransform: 'uppercase', letterSpacing: '0.24em',
      }}>
        ONE MONTH. CLAUDE CODE.
      </div>

      {/* the number */}
      <div style={{
        ...SANS, fontWeight: 900,
        fontSize: 320, lineHeight: 0.88,
        letterSpacing: '-0.05em',
        color: TXT,
        textShadow: `0 0 80px ${RED}70, 0 0 220px ${RED}40`,
      }}>
        <span style={{ color: RED, marginRight: 8 }}>$</span>14,501
      </div>

      {/* kicker */}
      <div style={{
        ...SANS, fontSize: 40, fontWeight: 700, color: DIM,
        marginTop: 8, letterSpacing: '-0.02em',
      }}>
        here's the leak i found <span style={{ color: EMR }}>↓</span>
      </div>
    </div>

    {/* brand tag bottom-right */}
    <div style={{
      position: 'absolute', bottom: 36, right: 48,
      ...MONO, fontSize: 22, color: ACC, letterSpacing: '0.02em',
    }}>
      getburnd.vercel.app
    </div>

    <Vignette />
    <Grain />
  </AbsoluteFill>
);

// ─── B ── Product shot: terminal with highlighted leak row ────────────────────
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 1100, height: 640,
      background: SURF,
      borderRadius: 18,
      border: `1.5px solid ${ACC}40`,
      boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 80px ${ACC}20`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* title bar */}
      <div style={{
        height: 40, background: '#1a1a24',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px',
        borderBottom: `1px solid ${ACC}20`,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
        <div style={{ ...MONO, fontSize: 14, color: DIM, marginLeft: 16 }}>
          ~/projects — npx getburnd
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, padding: '28px 40px', ...MONO, fontSize: 22, lineHeight: 1.55, color: TXT }}>
        <div style={{ color: AMB }}>$ npx getburnd</div>
        <div style={{ color: DIM, marginTop: 4 }}>scanning .claude/projects/…  239 sessions</div>
        <div style={{ marginTop: 16, color: DIM }}>TOTAL SPEND (30d)</div>
        <div style={{ ...SANS, fontSize: 68, fontWeight: 900, color: TXT, marginTop: 6, letterSpacing: '-0.03em' }}>
          $14,501.55
        </div>

        <div style={{ marginTop: 28, color: DIM, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          LEAK DETECTED
        </div>

        {/* highlighted leak row */}
        <div style={{
          marginTop: 10,
          padding: '14px 20px',
          background: `${AMB}14`,
          border: `1.5px solid ${AMB}80`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ color: TXT }}>
            <span style={{ color: AMB, marginRight: 12 }}>▸</span>
            Opus on routine tasks <span style={{ color: DIM }}>· 47 sessions</span>
          </div>
          <div style={{ color: AMB, fontWeight: 700, ...SANS, fontSize: 28 }}>
            $2,140.39
          </div>
        </div>

        <div style={{ marginTop: 18, color: EMR, fontSize: 20 }}>
          ↳ fixable. switch routine work to Sonnet.
        </div>
      </div>
    </div>

    {/* top eyebrow */}
    <div style={{
      position: 'absolute', top: 44, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      ...MONO, fontSize: 26, fontWeight: 600, color: AMB,
      letterSpacing: '0.22em', textTransform: 'uppercase',
    }}>
      FOUND A $2,140 LEAK IN 3 SECONDS
    </div>

    {/* bottom brand */}
    <div style={{
      position: 'absolute', bottom: 44, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      ...MONO, fontSize: 22, color: ACC, letterSpacing: '0.02em',
    }}>
      getburnd.vercel.app
    </div>

    <Grain />
  </AbsoluteFill>
);

// ─── C ── Split promise: LOST vs FIXABLE, diagonal divider ────────────────────
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    {/* left half — LOST */}
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '58%', height: '100%',
      background: `linear-gradient(135deg, ${RED}22 0%, ${BG} 70%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', justifyContent: 'center',
      padding: '0 80px',
      clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
    }}>
      <div style={{
        ...MONO, fontSize: 26, fontWeight: 600, color: RED,
        textTransform: 'uppercase', letterSpacing: '0.2em',
      }}>
        LOST
      </div>
      <div style={{
        ...SANS, fontWeight: 900, fontSize: 220, lineHeight: 0.88,
        letterSpacing: '-0.05em', color: TXT, marginTop: 12,
        textShadow: `0 0 70px ${RED}60`,
      }}>
        $14,501
      </div>
      <div style={{
        ...SANS, fontSize: 26, color: DIM, marginTop: 16, letterSpacing: '-0.01em',
      }}>
        one month of Claude Code
      </div>
    </div>

    {/* right half — FIXABLE */}
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: '50%', height: '100%',
      background: `linear-gradient(225deg, ${EMR}18 0%, ${BG} 70%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 80px',
      clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 15% 100%)',
    }}>
      <div style={{
        ...MONO, fontSize: 26, fontWeight: 600, color: EMR,
        textTransform: 'uppercase', letterSpacing: '0.2em',
      }}>
        FIXABLE
      </div>
      <div style={{
        ...SANS, fontWeight: 900, fontSize: 220, lineHeight: 0.88,
        letterSpacing: '-0.05em', color: TXT, marginTop: 12,
        textShadow: `0 0 70px ${EMR}70`,
      }}>
        $2,140
      </div>
      <div style={{
        ...SANS, fontSize: 26, color: DIM, marginTop: 16, letterSpacing: '-0.01em',
        textAlign: 'right',
      }}>
        find it in 3 seconds
      </div>
    </div>

    {/* bottom band */}
    <div style={{
      position: 'absolute', bottom: 30, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
      ...MONO, fontSize: 22, color: TXT, letterSpacing: '0.02em',
    }}>
      <span style={{ color: AMB }}>▸</span>
      <span style={{ color: DIM }}>npx</span>
      <span style={{ color: TXT, fontWeight: 600 }}>getburnd</span>
      <span style={{ color: DIM }}>·</span>
      <span style={{ color: ACC }}>getburnd.vercel.app</span>
    </div>

    <Vignette />
    <Grain />
  </AbsoluteFill>
);
