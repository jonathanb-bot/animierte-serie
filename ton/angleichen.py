"""Erzählstimme angleichen: Gemini liest dieselbe Stimme („Orus“) mal tiefer, mal höher.
Ziel seit 13.11. (Jonathan: „zu tief“): Grundton ca. 118 Hz; bis 12.11. war es die Stimme aus den ersten Folgen von „24. Stock“ (106 Hz).
Pro Folge wird der mittlere Grundton gemessen und die ganze Folge einheitlich auf die Referenz
verschoben (Tempo und Klangfarbe bleiben, Wortzeiten in den .json-Dateien bleiben gültig).

    python -m ton.angleichen der-letzte-mann/audio/folge-03 [weitere Ordner …] [--nur-messen]
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

ZIEL_HZ = 118.0      # Jonathan 13.11.: „Die Stimme ist zu tief“ – neue Folgen ca. 2 Halbtöne höher als „24. Stock“ (106 Hz),
                     # etwa dort, wo Gemini „Orus“ (lebendig) von selbst spricht; so wird kaum noch nachgepitcht
REFERENZ_ALT_HZ = 106.0  # Grundton der fertigen Folgen bis 12.11. (24. Stock, Folge 1–3); alte Folgen bleiben so
TOLERANZ_HT = 0.5    # kleinere Abweichungen (Halbtöne) bleiben unangetastet


def _lesen(p: Path, sr=16000) -> np.ndarray:
    roh = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(roh, np.int16).astype(np.float32)


def grundton(p: Path) -> float:
    """Median-Grundton (Hz) der stimmhaften Abschnitte, einfache Autokorrelation."""
    return _grundton(_lesen(p))


def grundton_array(x: np.ndarray, sr: int) -> float:
    """Wie grundton(), für ein Signal im Speicher (float, -1..1)."""
    from scipy.signal import resample_poly
    g = np.gcd(sr, 16000)
    return _grundton(resample_poly(x, 16000 // g, sr // g).astype(np.float32) * 32768)


def _grundton(x: np.ndarray) -> float:
    sr, n = 16000, 640
    werte = []
    for i in range(0, len(x) - n, 320):
        fr = x[i:i + n]
        if np.sqrt((fr ** 2).mean()) < 800:
            continue
        fr = fr - fr.mean()
        ac = np.correlate(fr, fr, "full")[n - 1:]
        lo, hi = int(sr / 300), int(sr / 60)
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.4 * ac[0]:
            werte.append(sr / k)
    return float(np.median(werte)) if werte else 0.0


def angleichen(ordner: Path, nur_messen=False, log=print) -> float:
    dateien = sorted(Path(ordner).glob("[0-9][0-9][0-9].mp3"))
    # Figurenstimmen (figurstimme=…, 7.11.) behalten ihre eigene Tonhöhe: nicht messen, nicht verschieben
    fs = Path(ordner) / "figurenstimmen.json"
    if fs.exists():
        import json
        figuren = set(json.loads(fs.read_text(encoding="utf-8")))
        dateien = [d for d in dateien if d.stem not in figuren]
    werte = [g for g in (grundton(d) for d in dateien) if g > 0]
    if not werte:
        log(f"{ordner}: keine Stimme gefunden")
        return 0.0
    ist = float(np.median(werte))
    ht = 12 * np.log2(ZIEL_HZ / ist)
    log(f"{ordner}: {len(dateien)} Dateien, Grundton {ist:.0f} Hz → Ziel {ZIEL_HZ:.0f} Hz ({ht:+.1f} Halbtöne)")
    if nur_messen or abs(ht) < TOLERANZ_HT:
        return ist
    faktor = ZIEL_HZ / ist
    for d in dateien:
        tmp = d.with_suffix(".tmp.mp3")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(d),
                        "-af", f"rubberband=pitch={faktor:.5f}:formant=preserved:pitchq=quality",
                        "-c:a", "libmp3lame", "-b:a", "160k", str(tmp)], check=True)
        tmp.replace(d)
    return ist


def main(argv=None):
    a = list(sys.argv[1:] if argv is None else argv)
    nur = "--nur-messen" in a
    for o in [x for x in a if not x.startswith("--")]:
        angleichen(Path(o), nur)


if __name__ == "__main__":
    main()
