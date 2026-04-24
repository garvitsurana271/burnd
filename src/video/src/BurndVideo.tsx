import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile,
} from 'remotion';

// ─── Music ────────────────────────────────────────────────────────────────────
// 1. Download a free dark-phonk / dark-trap track (~132 BPM) from pixabay.com/music
//    Search: "dark phonk" or "dark trap" — pick anything around 130-135 BPM
// 2. Save it as:  src/video/public/music.mp3
// 3. Uncomment the <MusicTrack /> line at the bottom of BurndVideo

// ─── Real beat data from librosa analysis of public/music.mp3 ──────────────────
// Regenerate with: `python analyze-beats.py public/music.mp3 > src/beats.json`
// This gives us ACTUAL beat frame indices (vs a theoretical BPM grid) — matters
// because music has lead-in silence, tempo drift, and swing that a theoretical
// grid won't capture.
import beatsData from './beats.json';

const DETECTED_BPM = beatsData.detected_tempo_bpm;          // e.g. 132.51
const BEAT_FRAMES: number[] = beatsData.beat_frames;        // real beat frame indices
const RMS_PER_FRAME: number[] = beatsData.rms_per_frame;    // continuous energy [0,1]
const BASS_PER_FRAME: number[] = beatsData.bass_per_frame;  // bass-band energy [0,1]

// Legacy theoretical grid — kept for non-bp() callers that want abstract bar length
const BPM       = 132;
const FPB       = (60 / BPM) * 30;   // 13.636 frames per beat
const BAR       = FPB * 4;           // 54.5  frames per bar

// Beat pulse: returns >1 just AFTER every actual detected beat, decays sharply
// over the next ~7 frames (~230ms kick-punch-and-fade). Using actual beat
// frames instead of a theoretical grid means the animation locks to the
// music's real rhythm including any swing/drift.
const bp = (f: number, strength = 0.02): number => {
  let nearestBeat = 0;
  let beatIdx = 0;
  for (let i = 0; i < BEAT_FRAMES.length; i++) {
    if (BEAT_FRAMES[i] > f) break;
    nearestBeat = BEAT_FRAMES[i];
    beatIdx = i;
  }
  const framesSinceBeat = f - nearestBeat;
  // Sharper decay (5 frames ≈ 166ms) for snappier kick feel
  const decay = Math.max(0, 1 - framesSinceBeat / 5);
  // Every 4th beat is a bar downbeat — hit 60% harder
  const isDownbeat = beatIdx % 4 === 0;
  const mult = isDownbeat ? 1.6 : 1.0;
  return 1 + strength * decay * mult;
};

// True if frame f is exactly on a detected downbeat (every 4th beat)
const onDownbeat = (f: number, windowFrames = 2): boolean => {
  for (let i = 0; i < BEAT_FRAMES.length; i += 4) {
    const b = BEAT_FRAMES[i];
    if (b > f) break;
    if (f - b < windowFrames) return true;
  }
  return false;
};

// Is frame f at or within a few frames after a scene-cut boundary?
const SCENE_CUTS = [0, 41, 204, 355, 464, 654, 805, 927];
const onSceneCut = (f: number, windowFrames = 4): boolean => {
  for (const cut of SCENE_CUTS) {
    if (cut > f) break;
    if (f - cut < windowFrames) return true;
  }
  return false;
};

// Bass-reactive multiplier: returns the instantaneous bass energy [0,1] at
// frame f. Useful for continuous subtle pulse on anything that should breathe
// with the music.
const bass = (f: number): number => {
  return BASS_PER_FRAME[Math.min(f, BASS_PER_FRAME.length - 1)] ?? 0;
};

// Is frame f within N frames after a detected beat? For boolean flash triggers.
const onBeat = (f: number, windowFrames = 3): boolean => {
  for (let i = 0; i < BEAT_FRAMES.length; i++) {
    const b = BEAT_FRAMES[i];
    if (b > f) break;
    if (f - b < windowFrames) return true;
  }
  return false;
};

const MusicTrack = () => <Audio src={staticFile('music.mp3')} volume={0.72} startFrom={15} />;

// ─── Real data  (from `npx getburnd` run 2026-04-15) ─────────────────────────
const D = {
  total:    14501.55,
  week:      1496.22,
  fixable:   2140.39,
  sessions:    239,
  topSave:   2100.82,
  topSess:     47,    // sessions that had Opus on routine work
};

// ─── Scene schedule  (total = 1050 frames = 35 s at 30fps) ───────────────────
//   Each transition has a 25-frame crossfade overlap.
const S = {
  cold:   { f:   0, d:   76 },
  title:  { f:  41, d:  198 },
  term:   { f: 204, d:  186 },
  revl:   { f: 355, d:  144 },
  leak:   { f: 464, d:  225 },
  dash:   { f: 654, d:  186 },
  pro:    { f: 805, d:  157 },
  cta:    { f: 927, d:  123 },
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG   = '#06060e';
const SURF = '#0e0e1a';
const ACC  = '#6366f1';
const AMB  = '#f59e0b';
const EMR  = '#10b981';
const RED  = '#ef4444';
const TXT  = '#f1f5f9';
const MUT  = '#94a3b8';
const DIM  = '#64748b';
const BDR  = 'rgba(99,102,241,0.15)';

const MONO: React.CSSProperties = { fontFamily:'"JetBrains Mono","Fira Code","Courier New",monospace' };
const SANS: React.CSSProperties = { fontFamily:'system-ui,-apple-system,sans-serif' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ramp(f:number, i0:number, i1:number, o0:number, o1:number, ease?:(t:number)=>number): number {
  return interpolate(f,[i0,i1],[o0,o1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
}
const eoc = (t:number) => 1-Math.pow(1-t,3);
const eoq = (t:number) => 1-Math.pow(1-t,5);
const fi  = (f:number,s:number,d=22) => ramp(f,s,s+d,0,1,eoc);
const fo  = (f:number,s:number,d=22) => ramp(f,s,s+d,1,0);
function rng(s:number): number { const x=Math.sin(s*9301+49297)*233280; return x-Math.floor(x); }
function tw(text:string,f:number,st:number,spd=3.5): string { return text.slice(0,Math.max(0,Math.floor((f-st)*spd))); }

// ─── Persistent overlays ──────────────────────────────────────────────────────
const PTCL = Array.from({length:45},(_,i)=>({
  x:rng(i*11.1)*100, y:rng(i*7.7)*100, r:rng(i*3.3)*1.4+0.4,
  drift:rng(i*5.9)*0.1+0.02, phi:rng(i*2.1)*Math.PI*2, op:rng(i*13.7)*0.2+0.04,
}));

const Particles: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents:'none'}}>
      {PTCL.map((p,i)=>(
        <div key={i} style={{
          position:'absolute',left:`${p.x}%`,top:`${((p.y+f*p.drift)%110)-5}%`,
          width:p.r,height:p.r,borderRadius:'50%',background:ACC,
          opacity:p.op*(0.5+0.5*Math.sin(f*0.04+p.phi)),
        }}/>
      ))}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents:'none'}}>
      <svg width="1920" height="1080" style={{position:'absolute',top:0,left:0,opacity:0.05}}>
        <defs>
          <filter id="gfx">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed={f} stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
        </defs>
        <rect width="1920" height="1080" filter="url(#gfx)"/>
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{pointerEvents:'none'}}>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 86% 86% at 50% 50%, transparent 28%, rgba(0,0,0,0.84) 100%)'}}/>
  </AbsoluteFill>
);

// Beat-reactive flash — fires a subtle white flash ON each actual detected
// beat (from librosa analysis, not theoretical grid). Decays over 4 frames
// (~133ms). Peak opacity 10% — visible without being seizure-inducing.
const BeatFlash: React.FC = () => {
  const f = useCurrentFrame();
  let nearestBeat = 0;
  let beatIdx = 0;
  for (let i = 0; i < BEAT_FRAMES.length; i++) {
    if (BEAT_FRAMES[i] > f) break;
    nearestBeat = BEAT_FRAMES[i];
    beatIdx = i;
  }
  const framesSince = f - nearestBeat;
  const isDownbeat = beatIdx % 4 === 0;
  // Regular beat: 10% over 4 frames. Downbeat: 22% over 6 frames. Scene cut: 35% over 8.
  let intensity = 0;
  if (onSceneCut(f, 8)) {
    const cut = SCENE_CUTS.filter(c => c <= f).pop() ?? 0;
    intensity = 0.35 * (1 - (f - cut) / 8);
  } else if (isDownbeat && framesSince < 6) {
    intensity = 0.22 * (1 - framesSince / 6);
  } else if (framesSince < 4) {
    intensity = 0.10 * (1 - framesSince / 4);
  }
  if (intensity <= 0) return null;
  return (
    <AbsoluteFill style={{
      pointerEvents:'none',
      background:'rgba(255,255,255,1)',
      opacity: intensity,
      mixBlendMode:'overlay' as const,
    }}/>
  );
};

// Bass-driven camera shake — tiny translate/rotate so the whole frame
// breathes with the low end. Amplitude stays under 2px so it never
// feels like jitter, just physical weight.
const CameraShake: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const b = bass(f);
  const kick = bp(f, 0) - 1; // 0 baseline; rises to ~0.08 on downbeat-decay
  const amp = b * 1.4 + kick * 18;
  // Pseudo-random direction from frame index so shake isn't uniform
  const dx = Math.sin(f * 0.73) * amp;
  const dy = Math.cos(f * 0.91) * amp * 0.6;
  const rot = Math.sin(f * 0.41) * b * 0.25;
  return (
    <AbsoluteFill style={{
      transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`,
    }}>
      {children}
    </AbsoluteFill>
  );
};

// Bass-reactive vignette — continuously breathes based on the actual bass
// energy per frame. When the kick hits, the vignette lightens (opens up);
// when bass drops, it tightens. Feels physical because it's driven by the
// actual low-frequency content of the track, not an abstract sinusoid.
const BeatVignette: React.FC = () => {
  const f = useCurrentFrame();
  const b = bass(f); // [0, 1]
  // Edge darkness: quieter bass = tighter vignette (0.88), punchy bass = opened (0.72)
  const edge = 0.88 - b * 0.16;
  return (
    <AbsoluteFill style={{pointerEvents:'none'}}>
      <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 86% 86% at 50% 50%, transparent 28%, rgba(0,0,0,${edge}) 100%)`}}/>
    </AbsoluteFill>
  );
};

// ─── SCENE 1: Cold open ───────────────────────────────────────────────────────
function ColdOpen() {
  const f = useCurrentFrame();
  const blink = (f<10)||(f>=20&&f<30);
  const op  = f<30 ? (blink?1:0) : ramp(f,30,50,1,0);
  const sc  = f<30 ? 1 : ramp(f,30,50,1,5);
  const bg  = fo(f,28,22);
  return (
    <AbsoluteFill style={{background:'#000',display:'flex',alignItems:'center',justifyContent:'center',opacity:bg}}>
      <span style={{...MONO,fontSize:64,color:TXT,opacity:op,transform:`scale(${sc})`,display:'inline-block',lineHeight:1}}>│</span>
    </AbsoluteFill>
  );
}

// ─── SCENE 2: Title ───────────────────────────────────────────────────────────
function TitleScene() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const cam   = ramp(f,0,180,1.0,1.04);          // slow dolly
  const enter = fi(f,0,18);
  const exit  = fo(f,158,22);
  const opacity = Math.min(enter,exit);

  // "I SPENT" label
  const topO = fi(f,8,12);
  const topY = ramp(f,8,24,18,0,eoc);

  // Big number: blur-to-focus count-up
  const ns = 22;
  const np = ramp(f,ns,ns+45,0,1,eoq);
  const nv = Math.round(D.total * np);
  const nb = ramp(f,ns,ns+20,20,0);
  const nO = fi(f,ns-4,10);

  // Lock-in impact
  const impF = ns+45;
  const impScale = (f>=impF&&f<=impF+25)
    ? spring({frame:f-impF,fps,config:{stiffness:420,damping:7},from:1.0,to:1.03})
    : 1.0;

  // "ON CLAUDE CODE"
  const subO = fi(f,78,18);
  const subX = ramp(f,78,100,36,0,eoc);

  // Stat strip
  const statO = fi(f,106,14);

  // Divider line
  const ruleW = ramp(f,92,148,0,380,eoc);

  // Beat pulse on number (once per bar)
  const bPulse = bp(f,0.05);

  return (
    <AbsoluteFill style={{background:BG,opacity:opacity}}>
      <Particles/>
      {/* Bottom glow */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:440,background:`radial-gradient(ellipse 80% 100% at 50% 100%, ${ACC}0f, transparent 70%)`,pointerEvents:'none'}}/>
      {/* Grid */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:`linear-gradient(${ACC}05 1px,transparent 1px),linear-gradient(90deg,${ACC}05 1px,transparent 1px)`,backgroundSize:'80px 80px'}}/>

      {/* Camera dolly */}
      <div style={{position:'absolute',inset:0,transform:`scale(${cam})`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>

        {/* I SPENT */}
        <div style={{opacity:topO,transform:`translateY(${topY}px)`,...SANS,fontSize:20,fontWeight:300,color:MUT,letterSpacing:'0.4em',textTransform:'uppercase',marginBottom:10}}>
          I SPENT
        </div>

        {/* The number */}
        <div style={{
          opacity:nO,filter:`blur(${nb}px)`,
          transform:`scale(${impScale * bPulse})`,
          ...SANS,fontSize:168,fontWeight:900,color:AMB,lineHeight:1,letterSpacing:'-0.04em',
          textShadow:`0 0 100px ${AMB}55, 0 0 250px ${AMB}18`,
        }}>
          ${nv.toLocaleString('en-US')}
        </div>

        {/* ON CLAUDE CODE */}
        <div style={{opacity:subO,transform:`translateX(${subX}px)`,...SANS,fontSize:28,fontWeight:300,color:DIM,letterSpacing:'0.18em',textTransform:'uppercase',marginTop:16}}>
          ON CLAUDE CODE.
        </div>

        {/* Divider */}
        <div style={{width:ruleW,height:1,marginTop:36,background:`linear-gradient(90deg,transparent,${ACC}45,transparent)`}}/>

        {/* Stats */}
        <div style={{opacity:statO,marginTop:18,display:'flex',gap:20,...MONO,fontSize:15,color:MUT,letterSpacing:'0.07em'}}>
          <span>{D.sessions} sessions</span><span style={{opacity:0.3}}>·</span>
          <span>14 months</span><span style={{opacity:0.3}}>·</span>
          <span>one developer</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 3: Terminal ────────────────────────────────────────────────────────
const TLINES = [
  {d:3,  col:MUT,   t:'$ npx getburnd',                            ty:true  },
  {d:18, col:ACC,   t:'  burnd v0.0.8 · scanning 239 sessions…',  ty:true  },
  {d:47, col:'',    t:'',                                           ty:false },
  {d:52, col:TXT,   t:'  All-time spend     $14,501.55',           ty:false },
  {d:61, col:TXT,   t:'  Last 7 days          $1,496.22',          ty:false },
  {d:71, col:EMR,   t:'  Fixable waste        $2,140.39  (14.8%)', ty:false },
  {d:80, col:'',    t:'',                                           ty:false },
  {d:84, col:AMB,   t:'  ── top leaks ──────────────────────────', ty:false },
  {d:94, col:TXT,   t:'  1.  Opus on routine work        $2,100',  ty:false },
  {d:105,col:TXT,   t:'  2.  Project cost outlier            $32',  ty:false },
  {d:117,col:TXT,   t:'  3.  Bash overuse (80% of calls)      $8', ty:false },
  {d:128,col:'',    t:'',                                           ty:false },
  {d:132,col:ACC,   t:'  share → getburnd.vercel.app/share#…',     ty:false },
];

function TerminalScene() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const winY = spring({frame:f,fps,config:{stiffness:85,damping:14},from:-80,to:0});
  const winO = fi(f,0,10);
  const exit = fo(f,122,28);
  const scan = ramp(f,18,45,0,100,eoc);

  return (
    <AbsoluteFill style={{background:BG,display:'flex',alignItems:'center',justifyContent:'center',opacity:Math.min(winO,exit)}}>
      {/* Glow behind window */}
      <div style={{position:'absolute',width:1000,height:620,background:`radial-gradient(ellipse,${ACC}0d,transparent 70%)`,borderRadius:'50%',pointerEvents:'none'}}/>

      <div style={{
        transform:`translateY(${winY}px)`,width:860,
        background:SURF,border:`1px solid ${BDR}`,borderRadius:14,overflow:'hidden',
        boxShadow:`0 0 110px ${ACC}12, 0 50px 110px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}>
        {/* Title bar */}
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'13px 22px',background:'rgba(0,0,0,0.38)',borderBottom:`1px solid ${BDR}`}}>
          {['#ff5f57','#ffbd2e','#28c840'].map((c,i)=>(
            <div key={i} style={{width:13,height:13,borderRadius:'50%',background:c,boxShadow:`0 0 6px ${c}70`}}/>
          ))}
          <span style={{...MONO,fontSize:12,color:DIM,marginLeft:18}}>bash — burnd</span>
        </div>

        {/* Body */}
        <div style={{padding:'24px 32px'}}>
          {TLINES.map((line,i)=>{
            const vis = f>=line.d;
            const op  = vis ? fi(f,line.d,6) : 0;
            const txt = line.ty ? tw(line.t,f,line.d,5.5) : (vis?line.t:'');
            return (
              <React.Fragment key={i}>
                {i===1 && f>=26 && f<70 && (
                  <div style={{height:3,background:'#111',borderRadius:2,width:250,marginTop:4,marginBottom:8,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${scan}%`,background:`linear-gradient(90deg,${ACC},${EMR})`,boxShadow:`0 0 10px ${ACC}`,borderRadius:2}}/>
                  </div>
                )}
                <div style={{...MONO,fontSize:17,color:line.col||'transparent',lineHeight:1.88,opacity:op,minHeight:line.t?undefined:5}}>
                  {txt}
                  {line.ty&&vis&&i===1&&f<47&&<span style={{opacity:Math.floor(f/10)%2===0?1:0}}>▊</span>}
                </div>
              </React.Fragment>
            );
          })}
          {f>=140&&<span style={{...MONO,fontSize:17,color:ACC,opacity:Math.floor(f/12)%2===0?1:0}}>▊</span>}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 4: Revelation ─────────────────────────────────────────────────────
function RevelScene() {
  const f = useCurrentFrame();
  const np  = ramp(f,6,50,0,1,eoq);
  const nv  = Math.round(D.fixable * np);
  const nb  = ramp(f,5,28,22,0);
  const nO  = fi(f,4,10);
  const subO= fi(f,56,16);
  const pctO= fi(f,74,14);
  const exit= fo(f,84,26);

  return (
    <AbsoluteFill style={{background:'#030b06',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',opacity:Math.min(fi(f,0,28),exit)}}>
      <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 72% 72% at 50% 50%, ${EMR}0a, transparent 68%)`,pointerEvents:'none'}}/>

      <div style={{opacity:nO,filter:`blur(${nb}px)`,transform:`scale(${bp(f,0.07)})`,...SANS,fontSize:200,fontWeight:900,color:EMR,lineHeight:1,letterSpacing:'-0.05em',textShadow:`0 0 130px ${EMR}60, 0 0 320px ${EMR}1c`}}>
        ${nv.toLocaleString('en-US')}
      </div>
      <div style={{opacity:subO,marginTop:20,...SANS,fontSize:26,fontWeight:300,color:`${EMR}85`,letterSpacing:'0.3em',textTransform:'uppercase'}}>
        IS FIXABLE WASTE
      </div>
      <div style={{opacity:pctO,marginTop:14,...MONO,fontSize:15,color:DIM}}>
        14.8% of your $14,501 total spend
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 5: The Opus leak story ─────────────────────────────────────────────
function LeakScene() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = fo(f,163,27);

  // Header
  const hO = fi(f,4,14);

  // Big number reveal: sessions
  const sessO = fi(f,18,16);
  const sessN = Math.round(ramp(f,18,50,0,D.topSess,eoq));

  // The dollar amount
  const dolO = fi(f,56,16);
  const dolN = Math.round(ramp(f,56,100,0,D.topSave,eoq));
  const dolB = ramp(f,54,76,14,0);

  // vs Sonnet comparison
  const vsO = fi(f,108,16);
  const sonnetCost = Math.round(D.topSave / 5); // ~$420

  // The fix
  const fixO = fi(f,138,16);
  const fixScale = spring({frame:Math.max(0,f-138),fps,config:{stiffness:100,damping:14},from:0.88,to:1});

  return (
    <AbsoluteFill style={{background:BG,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',opacity:exit}}>
      {/* Top badge */}
      <div style={{opacity:hO,marginBottom:40,display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:RED,boxShadow:`0 0 12px ${RED}`}}/>
        <span style={{...SANS,fontSize:12,fontWeight:300,color:DIM,letterSpacing:'0.3em',textTransform:'uppercase'}}>The #1 leak</span>
      </div>

      {/* Sessions */}
      <div style={{opacity:sessO,display:'flex',alignItems:'baseline',gap:16,marginBottom:8}}>
        <span style={{...SANS,fontSize:88,fontWeight:900,color:AMB,lineHeight:1}}>{sessN}</span>
        <span style={{...SANS,fontSize:18,fontWeight:300,color:DIM,letterSpacing:'0.2em',textTransform:'uppercase'}}>sessions on Opus</span>
      </div>
      <div style={{opacity:sessO,marginBottom:40,...SANS,fontSize:16,fontWeight:300,color:DIM}}>
        for routine work that Sonnet handles just as well
      </div>

      {/* Dollar amount */}
      <div style={{opacity:dolO,filter:`blur(${dolB}px)`,transform:`scale(${bp(f,0.06)})`,...SANS,fontSize:96,fontWeight:900,color:RED,lineHeight:1,textShadow:`0 0 80px ${RED}50`}}>
        -${dolN.toLocaleString('en-US')}
      </div>

      {/* vs Sonnet */}
      <div style={{opacity:vsO,marginTop:20,display:'flex',alignItems:'center',gap:20}}>
        <span style={{...MONO,fontSize:16,color:DIM}}>Opus price:</span>
        <span style={{...MONO,fontSize:16,color:RED,fontWeight:700}}>${D.topSave.toFixed(0)}</span>
        <span style={{...MONO,fontSize:16,color:DIM}}>→</span>
        <span style={{...MONO,fontSize:16,color:EMR}}>Sonnet price: ~${sonnetCost}</span>
      </div>

      {/* The fix */}
      <div style={{opacity:fixO,transform:`scale(${fixScale})`,marginTop:40,background:`rgba(16,185,129,0.06)`,border:`1px solid rgba(16,185,129,0.2)`,borderRadius:12,padding:'16px 32px',display:'flex',alignItems:'center',gap:20}}>
        <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(16,185,129,0.15)',border:`1px solid rgba(16,185,129,0.4)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{...MONO,fontSize:14,color:EMR}}>✓</span>
        </div>
        <div>
          <div style={{...MONO,fontSize:13,color:MUT,marginBottom:4}}>Fix — 30 seconds</div>
          <div style={{...MONO,fontSize:17,color:TXT}}>
            Add <span style={{color:EMR}}>model: claude-sonnet-4-6</span> to CLAUDE.md
          </div>
        </div>
        <div style={{...MONO,fontSize:22,fontWeight:700,color:EMR,marginLeft:16}}>save ${D.topSave.toLocaleString('en-US',{maximumFractionDigits:0})}</div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 6: Dashboard mockup ────────────────────────────────────────────────
function DashScene() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = fi(f,0,20);
  const exit  = fo(f,118,32);
  const scale = spring({frame:f,fps,config:{stiffness:70,damping:14},from:0.94,to:1});

  // Staggered card reveals
  const c1O = fi(f,22,14);
  const c2O = fi(f,36,14);
  const c3O = fi(f,50,14);
  const insO = fi(f,68,16);
  const insY = ramp(f,68,88,18,0,eoc);

  // Counting numbers in cards
  const savN = Math.round(ramp(f,22,62,0,D.fixable,eoq));
  const topN = Math.round(ramp(f,36,76,0,D.topSave,eoq));

  const SIDEBAR_ITEMS = ['Insights','Overview','Projects','Tools','Sessions'];

  return (
    <AbsoluteFill style={{background:BG,display:'flex',alignItems:'center',justifyContent:'center',opacity:Math.min(enter,exit)}}>
      <div style={{transform:`scale(${scale})`,width:1420,height:820,background:'#09090f',borderRadius:16,border:`1px solid ${BDR}`,overflow:'hidden',display:'flex',boxShadow:`0 0 100px ${ACC}12, 0 40px 100px rgba(0,0,0,0.7)`}}>

        {/* Sidebar */}
        <div style={{width:200,background:SURF,borderRight:`1px solid ${BDR}`,display:'flex',flexDirection:'column',padding:'20px 0',flexShrink:0}}>
          {/* Logo */}
          <div style={{padding:'0 20px 24px',...MONO,fontSize:16,fontWeight:700,color:TXT,display:'flex',alignItems:'center',gap:8}}>
            <span>🔥</span><span>burnd</span>
          </div>
          {/* Nav */}
          {SIDEBAR_ITEMS.map((item,i)=>(
            <div key={i} style={{
              padding:'10px 20px',
              ...MONO,fontSize:13,
              color: i===0 ? ACC : DIM,
              background: i===0 ? `${ACC}12` : 'transparent',
              borderLeft: i===0 ? `2px solid ${ACC}` : '2px solid transparent',
            }}>{item}</div>
          ))}
          {/* Upgrade */}
          <div style={{marginTop:'auto',margin:'auto 12px 16px',...MONO,fontSize:12,color:ACC,background:`${ACC}12`,border:`1px solid ${ACC}30`,borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
            Upgrade to BurndPro ↑
          </div>
        </div>

        {/* Main content */}
        <div style={{flex:1,padding:'28px 32px',overflow:'hidden'}}>
          {/* Page header */}
          <div style={{marginBottom:24}}>
            <div style={{...MONO,fontSize:12,color:MUT,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:6}}>The leaks</div>
            <div style={{...SANS,fontSize:26,fontWeight:700,color:TXT}}>Find what's burning your AI budget</div>
          </div>

          {/* Stat cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:24}}>
            {/* Card 1 */}
            <div style={{opacity:c1O,background:SURF,border:`1px solid ${BDR}`,borderRadius:10,padding:'16px 20px'}}>
              <div style={{...MONO,fontSize:12,color:MUT,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:8}}>Potential savings</div>
              <div style={{...MONO,fontSize:26,fontWeight:700,color:AMB}}>${savN.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div style={{...MONO,fontSize:13,color:MUT,marginTop:6}}>across {D.sessions} sessions</div>
            </div>
            {/* Card 2 */}
            <div style={{opacity:c2O,background:SURF,border:`1px solid ${BDR}`,borderRadius:10,padding:'16px 20px'}}>
              <div style={{...MONO,fontSize:12,color:MUT,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:8}}>Top single fix</div>
              <div style={{...MONO,fontSize:26,fontWeight:700,color:EMR}}>${topN.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div style={{...MONO,fontSize:13,color:MUT,marginTop:6}}>Opus → Sonnet swap</div>
            </div>
            {/* Card 3 */}
            <div style={{opacity:c3O,background:SURF,border:`1px solid ${BDR}`,borderRadius:10,padding:'16px 20px'}}>
              <div style={{...MONO,fontSize:12,color:MUT,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:8}}>Total fix effort</div>
              <div style={{...MONO,fontSize:26,fontWeight:700,color:TXT}}>25 min</div>
              <div style={{...MONO,fontSize:13,color:MUT,marginTop:6}}>for full $2,140 back</div>
            </div>
          </div>

          {/* Top insight card */}
          <div style={{opacity:insO,transform:`translateY(${insY}px)`,background:SURF,border:`1px solid rgba(245,158,11,0.2)`,borderRadius:10,padding:'18px 22px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div>
                <div style={{...MONO,fontSize:10,color:AMB,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:5}}>model-substitution</div>
                <div style={{...SANS,fontSize:17,fontWeight:600,color:TXT}}>Opus on routine work — switch to Sonnet</div>
              </div>
              <div style={{...MONO,fontSize:20,fontWeight:700,color:AMB,whiteSpace:'nowrap',marginLeft:24}}>${D.topSave.toFixed(2)}</div>
            </div>
            <div style={{...MONO,fontSize:13,color:MUT,lineHeight:1.6}}>
              47 sessions ran on claude-opus-4-6 for routine edits averaging 202 output tokens/turn.
              Sonnet handles this at 1/5th the cost.
            </div>
            <div style={{marginTop:12,display:'flex',alignItems:'center',gap:12}}>
              <div style={{...MONO,fontSize:12,color:EMR,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:6,padding:'4px 10px'}}>
                ✓ Fix in ~2 min
              </div>
              <div style={{...MONO,fontSize:12,color:MUT}}>Add model: claude-sonnet-4-6 to CLAUDE.md</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 7: BurndPro card ───────────────────────────────────────────────────
function ProScene() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = fi(f,0,20);
  const exit  = fo(f,88,32);
  const sc    = spring({frame:f,fps,config:{stiffness:75,damping:13},from:0.88,to:1});
  const pulse = 0.5+0.5*Math.sin(f*0.09);

  const FEATURES = [
    'Full dashboard  (Overview · Projects · Tools · Sessions)',
    'Weekly email digest — top leak of the week',
    '60-day trend history',
    'Shareable team reports',
  ];

  return (
    <AbsoluteFill style={{background:'#05050d',display:'flex',alignItems:'center',justifyContent:'center',opacity:Math.min(enter,exit)}}>
      <Particles/>
      {/* Central glow */}
      <div style={{position:'absolute',width:900,height:900,background:`radial-gradient(circle,${ACC}10,transparent 65%)`,borderRadius:'50%',pointerEvents:'none'}}/>

      <div style={{
        transform:`scale(${sc})`,
        width:700,
        background:`linear-gradient(135deg,#0c0c1a,#111118)`,
        border:`1.5px solid rgba(99,102,241,${0.35+0.2*pulse})`,
        borderRadius:20,
        padding:'44px 52px',
        boxShadow:`0 0 ${50+30*pulse}px rgba(99,102,241,${0.18*pulse}), 0 40px 100px rgba(0,0,0,0.7)`,
        position:'relative',overflow:'hidden',
      }}>
        {/* Scanline */}
        <div style={{position:'absolute',left:0,right:0,height:1,top:`${((f*2)%700)}px`,background:`linear-gradient(90deg,transparent,${ACC}50,transparent)`,pointerEvents:'none'}}/>

        {/* Badge */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:30}}>
          <span style={{fontSize:28}}>🔥</span>
          <div>
            <div style={{...SANS,fontSize:22,fontWeight:900,color:TXT,letterSpacing:'-0.02em'}}>BurndPro</div>
            <div style={{...MONO,fontSize:10,color:ACC,letterSpacing:'0.2em',textTransform:'uppercase'}}>Founding member pricing</div>
          </div>
        </div>

        {/* Price */}
        <div style={{marginBottom:8,display:'flex',alignItems:'baseline',gap:12}}>
          <span style={{...SANS,fontSize:56,fontWeight:900,color:TXT,lineHeight:1,letterSpacing:'-0.03em'}}>$9</span>
          <span style={{...SANS,fontSize:18,fontWeight:300,color:DIM}}>/month</span>
        </div>
        <div style={{...MONO,fontSize:14,color:MUT,marginBottom:32}}>
          or <span style={{color:TXT,fontWeight:700}}>$79 lifetime</span>
          <span style={{color:DIM}}> → $129 after launch</span>
        </div>

        {/* Features */}
        {FEATURES.map((feat,i)=>{
          const fO = fi(f,38+i*12,12);
          return (
            <div key={i} style={{opacity:fO,display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{...MONO,fontSize:11,color:ACC}}>✓</span>
              </div>
              <span style={{...MONO,fontSize:14,color:MUT}}>{feat}</span>
            </div>
          );
        })}

        {/* CTA button */}
        <div style={{
          opacity:fi(f,90,14),
          marginTop:28,padding:'16px 32px',
          background:`linear-gradient(135deg,${ACC},rgba(99,102,241,0.7))`,
          borderRadius:10,textAlign:'center',
          boxShadow:`0 0 24px ${ACC}40`,
        }}>
          <span style={{...MONO,fontSize:16,fontWeight:700,color:TXT}}>Get BurndPro →</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 8: CTA ─────────────────────────────────────────────────────────────
function CTAScene() {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = fi(f,0,22);
  const logoO = fi(f,18,14);
  const logoSc= spring({frame:Math.max(0,f-18),fps,config:{stiffness:58,damping:14},from:0.84,to:1});
  const tagO  = fi(f,40,14);
  const cmdO  = fi(f,58,16);
  const cmdSc = spring({frame:Math.max(0,f-58),fps,config:{stiffness:78,damping:12},from:0.90,to:1});
  const cmdGl = spring({frame:Math.max(0,f-75),fps,config:{stiffness:58,damping:20},from:0,to:1});
  const metaO = fi(f,82,14);
  const urlO  = fi(f,96,14);

  const breathe = 0.5+0.5*Math.sin(f*0.08);
  const bPulse  = bp(f,0.07);

  return (
    <AbsoluteFill style={{background:BG,opacity:enter,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <Particles/>
      <div style={{position:'absolute',width:800,height:800,background:`radial-gradient(circle,${ACC}11,transparent 65%)`,borderRadius:'50%',pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:`linear-gradient(${ACC}06 1px,transparent 1px),linear-gradient(90deg,${ACC}06 1px,transparent 1px)`,backgroundSize:'80px 80px'}}/>

      <div style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:24}}>
        {/* Logo */}
        <div style={{opacity:logoO,transform:`scale(${logoSc})`,display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:52}}>🔥</span>
          <span style={{...SANS,fontSize:52,fontWeight:900,color:TXT,letterSpacing:'-0.03em'}}>burnd</span>
        </div>

        {/* Tagline */}
        <div style={{opacity:tagO,...SANS,fontSize:22,fontWeight:300,color:MUT,textAlign:'center',maxWidth:620,letterSpacing:'0.02em'}}>
          Find what's burning a hole in your Claude Code budget.
        </div>

        {/* Command */}
        <div style={{
          opacity:cmdO,transform:`scale(${cmdSc * bPulse})`,
          background:SURF,
          border:`1.5px solid rgba(99,102,241,${0.38+0.3*cmdGl*breathe})`,
          borderRadius:14,padding:'22px 60px',
          display:'flex',alignItems:'center',gap:14,
          boxShadow:`0 0 ${36+32*cmdGl*breathe}px rgba(99,102,241,${0.2*cmdGl})`,
        }}>
          <span style={{...MONO,fontSize:30,color:AMB}}>$</span>
          <span style={{...MONO,fontSize:38,fontWeight:700,color:TXT}}>npx getburnd</span>
        </div>

        {/* Meta */}
        <div style={{opacity:metaO,display:'flex',gap:20,...MONO,fontSize:14,color:DIM}}>
          <span>free</span><span>·</span><span>open source</span><span>·</span>
          <span>100% local</span><span>·</span><span>no signup</span>
        </div>

        <div style={{opacity:urlO,...MONO,fontSize:17,color:ACC}}>getburnd.vercel.app</div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export const BurndVideo: React.FC = () => (
  <AbsoluteFill style={{background:'#000'}}>
    <MusicTrack />

    <CameraShake>
      <Sequence from={S.cold.f}  durationInFrames={S.cold.d  +35}><ColdOpen/></Sequence>
      <Sequence from={S.title.f} durationInFrames={S.title.d +35}><TitleScene/></Sequence>
      <Sequence from={S.term.f}  durationInFrames={S.term.d  +35}><TerminalScene/></Sequence>
      <Sequence from={S.revl.f}  durationInFrames={S.revl.d  +35}><RevelScene/></Sequence>
      <Sequence from={S.leak.f}  durationInFrames={S.leak.d  +35}><LeakScene/></Sequence>
      <Sequence from={S.dash.f}  durationInFrames={S.dash.d  +35}><DashScene/></Sequence>
      <Sequence from={S.pro.f}   durationInFrames={S.pro.d   +35}><ProScene/></Sequence>
      <Sequence from={S.cta.f}   durationInFrames={S.cta.d}><CTAScene/></Sequence>
    </CameraShake>

    <BeatVignette/>
    <BeatFlash/>
    <Grain/>
  </AbsoluteFill>
);
