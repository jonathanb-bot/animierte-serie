"""Tiefe Hintergrundmusik für Zitat-Videos (Jonathans Wunsch 4.11., Issue #24).

    python taeglich/zitat_musik.py taeglich/episoden/s02z-f01.txt [--stimmung traurig] [--abstand 14]

Nach `python -m ton.folge …` aufrufen: legt unter die vorhandene Hintergrundspur (`@musik …`) eine durchgehende,
prozedural komponierte Musik (ton/musik.py, lizenzfrei, kein Drone/Rauschen) ca. 14 dB unter der Stimme.
Die Datei `musik/<id>-pur.mp3` bleibt als Original liegen, damit ein zweiter Aufruf nicht doppelt mischt.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
import zlib
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from ton import audio as A  # noqa: E402
from ton import musik as M  # noqa: E402
from ton.folge import STIMME_RMS  # noqa: E402


def lesen(p: Path) -> np.ndarray:
    roh = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "2", "-ar", str(A.SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(roh, np.float32).reshape(-1, 2).copy()


def schreiben(x: np.ndarray, ziel: Path):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(A.SR), "-i", "-",
                    "-c:a", "libmp3lame", "-b:a", "192k", str(ziel)], input=x.astype(np.float32).tobytes(), check=True)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("drehbuch")
    ap.add_argument("--stimmung", default="traurig", help="Stimmung aus ton/musik.py (traurig, hoffnung, abend, nacht …)")
    ap.add_argument("--abstand", type=float, default=14.0, help="dB unter der Stimme (RMS)")
    a = ap.parse_args(argv)
    d = Path(a.drehbuch).resolve()
    m = re.search(r"^@musik\s+(\S+)", d.read_text(encoding="utf-8"), re.M)
    if not m:
        sys.exit("Kein @musik im Drehbuch – erst python -m ton.folge ausführen.")
    spur = d.parent.parent / m.group(1)
    pur = spur.with_name(spur.stem + "-pur.mp3")
    if not pur.exists():
        pur.write_bytes(spur.read_bytes())
    bett = lesen(pur)
    dauer = len(bett) / A.SR
    x = M.musik(a.stimmung, dauer, seed=zlib.crc32(d.stem.encode()) % 10007)
    x = A.stereo(x) if x.ndim == 1 else x
    x = x[: len(bett)]
    rms = 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
    x = A.fade(x * A.db(STIMME_RMS - a.abstand - rms), 2.0, 3.0)
    mix = bett.copy()
    mix[: len(x)] += x
    schreiben(A.limiter(mix, -3.0), spur)
    print(f"Musik „{a.stimmung}“ ({dauer:.1f} s, {a.abstand:.0f} dB unter der Stimme) → {spur.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
