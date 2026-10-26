"""Mischt eine Folge so wie render.mjs (Hintergrund + Stimmen, Summe, Limiter) und misst sie gegen die Vorlage.

    python -m ton.pruefen folge-01 [--wav ziel.wav]
    python -m ton.pruefen folge-01 --video ausgabe/folge-01.mp4   # nur Ton im fertigen Video neu mischen
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

from . import audio as A

ROOT = Path(__file__).resolve().parent.parent
VORLAGE = {"lufs": -14.8, "abstand": 12.1}


def mischen(fid: str) -> np.ndarray:
    t = json.loads((ROOT / "audio" / fid / "timing.json").read_text())
    n = A.sek(t["dauer"])
    bett = A.laden(str(ROOT / "musik" / f"{fid}.mp3"))[:n]
    mix = np.pad(bett, (0, max(0, n - len(bett))))
    for e in t["einstellungen"]:
        f = ROOT / "audio" / fid / f"{e['nr']:03d}.mp3"
        if f.exists():
            x = A.laden(str(f))
            s = A.sek(e["start"])
            mix[s:s + len(x)] += x[: max(0, n - s)]
    return np.clip(mix, -0.95, 0.95)


def lufs(x: np.ndarray, tmp: Path) -> float:
    A.schreiben_wav(str(tmp), x)
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(tmp), "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])


def abstand(fid: str, m: np.ndarray) -> tuple[float, float]:
    t = json.loads((ROOT / "audio" / fid / "timing.json").read_text())["einstellungen"]
    sr = A.SR

    def rms(a, b):
        s = m[int(a * sr):int(b * sr)]
        return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-12)
    sp, gaps = [], []
    for e in t:
        f = ROOT / "audio" / fid / f"{e['nr']:03d}.json"
        if not f.exists():
            continue
        w = json.loads(f.read_text())
        if not w:
            continue
        sp.append(rms(e["start"] + w[0]["start"], e["start"] + w[-1]["ende"]))
        for a, b in zip(w, w[1:]):
            if b["start"] - a["ende"] > 0.4:
                gaps.append(rms(e["start"] + a["ende"] + 0.12, e["start"] + b["start"] - 0.03))
    return float(np.mean(sp)), float(np.mean(gaps)) if gaps else -120.0


def ton_ersetzen(fid: str, video: str, ziel: str) -> None:
    """Tonspur im fertigen Video neu mischen – exakt wie render.mjs (amix ohne Normalisierung, alimiter 0.95).
    Nützlich, wenn sich nur Pegel geändert haben: die Bilder hängen nur vom Timing ab."""
    t = json.loads((ROOT / "audio" / fid / "timing.json").read_text())
    gesamt = t["dauer"]
    inputs = ["-i", video, "-i", str(ROOT / "musik" / f"{fid}.mp3")]
    filt = [f"[1:a]atrim=0:{gesamt},volume=1,afade=t=out:st={max(0, gesamt - 1.5)}:d=1.5[m]"]
    mix, n = ["[m]"], 2
    for e in t["einstellungen"]:
        f = ROOT / "audio" / fid / f"{e['nr']:03d}.mp3"
        if f.exists():
            ms = round(e["start"] * 1000)
            inputs += ["-i", str(f)]
            filt.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms},volume=1.0[v{n}]")
            mix.append(f"[v{n}]")
            n += 1
    filt.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{gesamt},alimiter=limit=0.95[out]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "0:v", "-map", "[out]",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-shortest",
                    "-movflags", "+faststart", ziel], check=True)


def main(argv=None):
    p = argparse.ArgumentParser(prog="python -m ton.pruefen")
    p.add_argument("folge")
    p.add_argument("--wav")
    p.add_argument("--video", help="fertiges Video: Tonspur neu mischen (Pegeländerung ohne neu zu rendern)")
    p.add_argument("--ziel", help="Ausgabe für --video (Standard: <video>-neu.mp4)")
    a = p.parse_args(argv)
    if a.video:
        ziel = a.ziel or str(Path(a.video).with_name(Path(a.video).stem + "-neu.mp4"))
        ton_ersetzen(a.folge, a.video, ziel)
        print("→", ziel)
    m = mischen(a.folge)
    tmp = Path(a.wav) if a.wav else ROOT / "ausgabe" / f".{a.folge}-pruef.wav"
    tmp.parent.mkdir(exist_ok=True)
    l = lufs(m, tmp)
    sp, bett = abstand(a.folge, m)
    if not a.wav:
        tmp.unlink()
    print(f"{a.folge}: {l:.1f} LUFS (Vorlage {VORLAGE['lufs']}), Sprache {sp:.1f} dB, Hintergrund in Pausen {bett:.1f} dB, "
          f"Abstand {sp - bett:.1f} dB (Vorlage {VORLAGE['abstand']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
