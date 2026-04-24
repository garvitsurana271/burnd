"""
Reads beats.json and the current scene schedule (hardcoded below), then snaps
each scene cut to the nearest actual beat frame (accounting for a 15-frame
intro trim that the Remotion Audio component will apply via startFrom).

Output: the realigned S schedule, printed as TypeScript ready to paste into
BurndVideo.tsx. Also writes a shifted beats file for the animation.
"""

import json
import sys

INTRO_TRIM = 15  # frames to skip from the music (the 0.5s silent intro)
TOTAL_FRAMES = 1050  # video length at 30fps

with open('src/beats.json', 'r') as fp:
    beats = json.load(fp)

# Shift every beat frame left by INTRO_TRIM, drop negatives, clamp to TOTAL_FRAMES
shifted_beats = [b - INTRO_TRIM for b in beats['beat_frames'] if b >= INTRO_TRIM and (b - INTRO_TRIM) < TOTAL_FRAMES]
shifted_onsets = [b - INTRO_TRIM for b in beats['onset_frames'] if b >= INTRO_TRIM and (b - INTRO_TRIM) < TOTAL_FRAMES]

# RMS + bass arrays — slice off the first INTRO_TRIM samples
shifted_rms = beats['rms_per_frame'][INTRO_TRIM:INTRO_TRIM + TOTAL_FRAMES]
shifted_bass = beats['bass_per_frame'][INTRO_TRIM:INTRO_TRIM + TOTAL_FRAMES]

# Current scene schedule (from BurndVideo.tsx)
# Each entry is (name, ideal_start_frame, ideal_duration)
ideal_scenes = [
    ('cold',   0,   50),
    ('title', 35,  180),
    ('term', 210,  150),
    ('revl', 360,  110),
    ('leak', 470,  190),
    ('dash', 660,  150),
    ('pro',  810,  120),
    ('cta',  930,  120),
]

def nearest_beat(f, beat_list):
    """Return the beat frame closest to f."""
    return min(beat_list, key=lambda b: abs(b - f))

# Snap each scene's START to the nearest beat
aligned_scenes = []
for name, f, d in ideal_scenes:
    snapped_f = nearest_beat(f, shifted_beats) if f > 0 else 0
    aligned_scenes.append((name, snapped_f, d, f, snapped_f - f))

# Report + print as TS
print("Aligned scene schedule:")
print(f"{'Scene':6} {'Old':>5} {'New':>5} {'Drift':>6} {'Duration':>8}")
print(f"{'-'*6} {'-'*5} {'-'*5} {'-'*6} {'-'*8}")
for name, new_f, d, old_f, drift in aligned_scenes:
    print(f"{name:6} {old_f:>5} {new_f:>5} {drift:>+6} {d:>8}")

# Adjust durations so total is still TOTAL_FRAMES with correct overlaps
# Recompute durations from the snapped starts so adjacent scenes cover the whole video
print("\nRecomputed schedule (durations span gaps):")
recomputed = []
for i, (name, new_f, _d, _, _) in enumerate(aligned_scenes):
    next_f = aligned_scenes[i+1][1] if i+1 < len(aligned_scenes) else TOTAL_FRAMES
    # Keep a ~35-frame overlap between scenes (crossfade zone)
    duration = (next_f - new_f) + 35
    if i == len(aligned_scenes) - 1:
        duration = TOTAL_FRAMES - new_f  # final scene ends at video end
    recomputed.append((name, new_f, duration))
    print(f"  {name:6}: f={new_f:>4}  d={duration:>4}  (ends at {new_f + duration})")

print("\n--- TypeScript S schedule, paste into BurndVideo.tsx ---")
print("const S = {")
for name, f, d in recomputed:
    print(f"  {name:5}:  {{ f: {f:>4}, d: {d:>4} }},")
print("};")

# Save shifted beats.json for Remotion to import
shifted = dict(beats)
shifted['beat_frames'] = shifted_beats
shifted['onset_frames'] = shifted_onsets
shifted['rms_per_frame'] = shifted_rms
shifted['bass_per_frame'] = shifted_bass
shifted['_shifted_by_frames'] = INTRO_TRIM
shifted['_total_frames_clamp'] = TOTAL_FRAMES

with open('src/beats.json', 'w') as fp:
    json.dump(shifted, fp, indent=2)

print(f"\n✓ Wrote src/beats.json with {len(shifted_beats)} beats shifted by -{INTRO_TRIM}")
print(f"✓ First shifted beat at frame 0, last at frame {shifted_beats[-1] if shifted_beats else 0}")
print(f"✓ Remember to add startFrom={INTRO_TRIM} to the Audio component in BurndVideo.tsx")
