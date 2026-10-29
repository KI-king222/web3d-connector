#!/usr/bin/env python3
"""Regenerate HASHPOOL sfx/*.wav from beep.js parameters. Run from repo root or sfx/."""
import math, struct, wave
from pathlib import Path

OUT = Path(__file__).resolve().parent
SR = 44100

def osc_samples(freq, dur, wave_type, vol):
    n = int(SR * (dur + 0.02))
    out = []
    for i in range(n):
        t = i / SR
        if t >= dur:
            out.append(0.0)
            continue
        amp = vol * math.exp(math.log(max(0.001 / max(vol, 1e-6), 1e-9)) * (t / max(dur, 1e-6)))
        phase = 2 * math.pi * freq * t
        if wave_type == "square":
            s = 1.0 if math.sin(phase) >= 0 else -1.0
        elif wave_type == "triangle":
            p = (freq * t) % 1.0
            if p < 0.25:
                s = 4 * p
            elif p < 0.75:
                s = 2 - 4 * p
            else:
                s = 4 * p - 4
        else:
            s = math.sin(phase)
        out.append(amp * s)
    return out

def write_wav(path, samples, peak_norm=0.9):
    peak = max((abs(x) for x in samples), default=1.0) or 1.0
    scale = peak_norm / peak if peak > peak_norm else 1.0
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        for s in samples:
            v = max(-1.0, min(1.0, s * scale))
            w.writeframes(struct.pack("<h", int(v * 32767)))
    print("wrote", path.name)

def mix_at(timeline, offset_s, clip):
    pos = int(offset_s * SR)
    need = pos + len(clip)
    if need > len(timeline):
        timeline.extend([0.0] * (need - len(timeline)))
    for i, s in enumerate(clip):
        timeline[pos + i] += s
    return timeline

def main():
    # Must match js/beep.js
    write_wav(OUT / "click.wav", osc_samples(520, 0.055, "sine", 0.16))
    crit = []
    mix_at(crit, 0.0, osc_samples(880, 0.055, "triangle", 0.20))
    mix_at(crit, 0.040, osc_samples(1320, 0.10, "triangle", 0.18))
    write_wav(OUT / "crit.wav", crit)
    buy = []
    mix_at(buy, 0.0, osc_samples(320, 0.055, "square", 0.12))
    mix_at(buy, 0.045, osc_samples(480, 0.09, "square", 0.12))
    write_wav(OUT / "buy.wav", buy)
    install = []
    for i, delay_ms in enumerate([0, 60, 120, 180]):
        mix_at(install, delay_ms / 1000.0, osc_samples(720 - i * 40, 0.035, "square", 0.10))
    write_wav(OUT / "install.wav", install)
    halving = []
    for i, f in enumerate([300, 450, 650, 900]):
        mix_at(halving, i * 0.090, osc_samples(f, 0.14, "triangle", 0.18))
    write_wav(OUT / "halving.wav", halving)
    for src, dst in [
        ("click.wav", "mine_click.wav"),
        ("crit.wav", "crit_damage.wav"),
        ("install.wav", "pc_build_install.wav"),
    ]:
        (OUT / dst).write_bytes((OUT / src).read_bytes())
        print("alias", dst)

if __name__ == "__main__":
    main()
