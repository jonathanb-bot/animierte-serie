"""Fertige Mischung gleichmäßig auf Ziel-Lautheit bringen, OHNE Dynamik zu verändern (Jonathan 24.11. abends:
Stimme nicht verändern). ffmpeg-loudnorm im Einzeldurchlauf regelt dynamisch und drückt die Stimme – deshalb nur ein fester Faktor.
Würde die Spitze über −1 dBFS gehen, bleibt es lieber etwas leiser als −14 LUFS (kein Begrenzer).
    python3 lautheit.py mix.wav mix14.wav [-14]"""
import sys, subprocess, re
import numpy as np, soundfile as sf
ein, aus = sys.argv[1], sys.argv[2]; ziel = float(sys.argv[3]) if len(sys.argv) > 3 else -14.0
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", ein, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
x, sr = sf.read(ein, dtype="float64"); g = 10 ** ((ziel - I) / 20); spitze = np.abs(x).max() * g
if spitze > 10 ** (-1 / 20): g *= 10 ** (-1 / 20) / spitze
sf.write(aus, (x * g).astype(np.float32), sr, subtype="FLOAT")
print(f"{ein}: {I:.1f} LUFS → {I + 20 * np.log10(g):.1f} LUFS (Faktor {20 * np.log10(g):+.1f} dB, ohne Begrenzer)")
