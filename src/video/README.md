# burnd — YouTube video (Remotion)

Programmatic 90-second video: **"I spent $13,631 on Claude Code. Here's where every dollar went."**

Built with [Remotion](https://remotion.dev) — React renders to video frames. No face cam, no screen recording, no editing. Pure code.

## Scenes

| Scene | Time | Description |
|-------|------|-------------|
| Title | 0–10s | "$13,631" amber number reveal on AXIS dark bg |
| Terminal | 9–25s | CLI output animates line by line |
| Numbers | 24–45s | Counter animations: all-time / 7-day / fixable waste |
| Leaks | 44–66s | Bar chart reveals, 5 cost leak patterns |
| Fixes | 65–80s | Fix cards slide in with savings estimates |
| CTA | 79–90s | `npx getburnd` command box, URL |

## Commands

```bash
# Preview in browser (hot reload)
npm start

# Render full 90s MP4 (takes ~10-15 min on CPU)
npm run build

# Quick preview GIF (first 2s only, fast)
npm run render:gif
```

## Output

- `out/burnd.mp4` — 1920×1080 H.264, ready to upload to YouTube
- Title: "I spent $13,631 on Claude Code. Here's where every dollar went."
- Description template: see `notes/youtube-description.md`

## Customizing numbers

Edit the constants at the top of `src/BurndVideo.tsx`:
- Scene timing: `SCENE` object
- Numbers: `CountUp` targets in `NumbersScene`
- Leak list: `LEAKS` array in `LeaksScene`
- Fixes: `FIXES` array in `FixesScene`
