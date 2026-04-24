"""
Extract actual beat positions from the music file via librosa onset detection.
Outputs JSON with beat frame indices at 30fps so Remotion can trigger
animations on genuine kick hits instead of a theoretical BPM grid.

Usage:
    python analyze-beats.py public/music.mp3 > src/beats.json
"""

import sys
import json
import librosa
import numpy as np

if len(sys.argv) < 2:
    print("Usage: analyze-beats.py <audio.mp3>", file=sys.stderr)
    sys.exit(1)

audio_path = sys.argv[1]
FPS = 30

# Load audio
y, sr = librosa.load(audio_path, sr=None, mono=True)
duration = len(y) / sr

# --- Detect tempo and beat positions ---
# beat_track returns (tempo, beat_frame_indices). We also compute onset envelope
# for kick detection.
tempo, beat_samples = librosa.beat.beat_track(y=y, sr=sr, units='samples')
beat_times = librosa.samples_to_time(beat_samples, sr=sr)

# Convert to video frame indices (30 fps)
beat_frames = [int(round(t * FPS)) for t in beat_times]

# --- Also detect onsets (general percussive/kick hits) ---
# Focus on low-frequency energy for kick-like detection
# Filter to 20-200 Hz (kick drum range)
y_kick = librosa.effects.percussive(y, margin=3.0)
onset_env = librosa.onset.onset_strength(y=y_kick, sr=sr)
onset_samples = librosa.onset.onset_detect(
    onset_envelope=onset_env, sr=sr, units='samples', delta=0.3
)
onset_times = librosa.samples_to_time(onset_samples, sr=sr)
onset_frames = [int(round(t * FPS)) for t in onset_times]

# --- Compute per-frame energy (useful for continuous visual reactivity) ---
# RMS energy in 1/30-second windows → one value per video frame
hop_length = int(sr / FPS)
rms = librosa.feature.rms(y=y, frame_length=hop_length * 2, hop_length=hop_length)[0]
rms_per_frame = rms[:int(duration * FPS)].tolist()
# Normalize to [0, 1] for easy use as scale/opacity multiplier
rms_max = max(rms_per_frame) if rms_per_frame else 1.0
rms_normalized = [float(v / rms_max) for v in rms_per_frame]

# Low-frequency (bass) energy — for kick-reactive effects specifically
# Separate bass by low-pass filter
y_bass = librosa.effects.preemphasis(y, coef=-0.97)  # inverse emphasis → bass boost
S_bass = np.abs(librosa.stft(y_bass, hop_length=hop_length))
# Sum energy in the 20-200 Hz range (bins 1-9 at 44.1k sr, approximately)
freq_bins = librosa.fft_frequencies(sr=sr, n_fft=2048)
bass_mask = (freq_bins >= 20) & (freq_bins <= 200)
bass_energy = S_bass[bass_mask].sum(axis=0)
bass_per_frame = bass_energy[:int(duration * FPS)].tolist()
bass_max = max(bass_per_frame) if bass_per_frame else 1.0
bass_normalized = [float(v / bass_max) for v in bass_per_frame]

output = {
    "fps": FPS,
    "duration_seconds": round(duration, 3),
    "duration_frames": int(round(duration * FPS)),
    "detected_tempo_bpm": round(float(tempo), 2) if np.isscalar(tempo) else round(float(tempo[0]), 2),
    "beat_frames": beat_frames,
    "beat_count": len(beat_frames),
    "onset_frames": onset_frames,
    "onset_count": len(onset_frames),
    # Per-frame continuous data (one value per video frame, [0,1] normalized)
    "rms_per_frame": [round(v, 4) for v in rms_normalized],
    "bass_per_frame": [round(v, 4) for v in bass_normalized],
}

print(json.dumps(output, indent=2))
