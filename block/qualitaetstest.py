"""Qualitätstest (Jonathan 24.11.): Welche Auflösung und Kodierung sieht nach dem Hochladen auf TikTok am besten aus?

Gleicher 6-s-Ausschnitt aus Vorrat 03 (Bild 1200–1559), gerendert in 720p (vorhanden), 1080p (SKALA=1.5) und 1440p (SKALA=2).
Jede Variante wird kodiert und danach so neu kodiert, wie TikTok es ungefähr macht (1080×1920, H.264, ~3 Mbit/s).
Gemessen wird gegen die beste Fassung (1440p, auf 1080p verkleinert): SSIM (1 = identisch) und PSNR (dB, höher = besser).
Aufruf: python3 qualitaetstest.py   → Tabelle + Vergleichsbild in vorrat-03/qtest/
"""
import json, os, re, subprocess, sys
from pathlib import Path

O = Path("vorrat-03"); Q = O / "qtest"; Q.mkdir(exist_ok=True)
START, N, FPS = 1200, 360, 60
quellen = {"720": O / "frames", "1080": O / "frames_q15", "1440": O / "frames_q2"}
varianten = [  # Name, Quelle, Video-Optionen
    ("A_720p_bisher_h264_7M", "720", ["-c:v", "libx264", "-preset", "slow", "-crf", "22", "-maxrate", "7M", "-bufsize", "14M"]),
    ("B_1080p_h264_8M", "1080", ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "8M", "-bufsize", "16M"]),
    ("C_1080p_h265_8M", "1080", ["-c:v", "libx265", "-preset", "slow", "-crf", "20", "-x265-params", "vbv-maxrate=8000:vbv-bufsize=16000:log-level=error", "-tag:v", "hvc1"]),
    ("D_1080p_h264_25M", "1080", ["-c:v", "libx264", "-preset", "slow", "-crf", "14", "-maxrate", "25M", "-bufsize", "50M"]),
    ("E_1440p_h264_25M", "1440", ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-maxrate", "25M", "-bufsize", "50M"]),
]
TIKTOK = ["-vf", "scale=1080:1920:flags=bicubic", "-c:v", "libx264", "-preset", "medium", "-b:v", "3M", "-maxrate", "3.5M", "-bufsize", "7M", "-pix_fmt", "yuv420p"]

def ff(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
def eingang(ordner): return ["-framerate", str(FPS), "-start_number", str(START), "-i", str(ordner / "%05d.jpg"), "-frames:v", str(N)]

ref = Q / "referenz_1080.mkv"
if not ref.exists(): ff(*eingang(quellen["1440"]), "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "ffv1", str(ref))

def messen(datei):
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", str(datei), "-i", str(ref), "-lavfi",
                        "[0:v]scale=1080:1920:flags=bicubic[a];[a][1:v]ssim;[0:v]scale=1080:1920:flags=bicubic[b];[b][1:v]psnr", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    ssim = float(re.search(r"All:([\d.]+)", r).group(1)); psnr = float(re.search(r"average:([\d.inf]+)", r).group(1))
    return ssim, psnr

zeilen = []
for name, q, opt in varianten:
    v = Q / f"{name}.mp4"; t = Q / f"{name}_tiktok.mp4"
    ff(*eingang(quellen[q]), *opt, "-pix_fmt", "yuv420p", str(v))
    ff("-i", str(v), *TIKTOK, str(t))
    mbit = v.stat().st_size * 8 / (N / FPS) / 1e6; mb90 = v.stat().st_size / (N / FPS) * 90 / 1e6
    s1, p1 = messen(v); s2, p2 = messen(t)
    zeilen.append((name, mbit, mb90, s1, p1, s2, p2)); print(name, "fertig", flush=True)

print(f"\n{'Variante':26} {'Mbit/s':>7} {'MB/90s':>7} | {'SSIM':>7} {'PSNR':>6} | nach TikTok: {'SSIM':>7} {'PSNR':>6}")
for n, m, mb, s1, p1, s2, p2 in zeilen: print(f"{n:26} {m:7.1f} {mb:7.0f} | {s1:7.4f} {p1:6.2f} |              {s2:7.4f} {p2:6.2f}")
json.dump(zeilen, open(Q / "ergebnis.json", "w"), indent=1)

# Vergleichsbild: derselbe Ausschnitt (Gesicht/Details) aus jeder Variante nach der TikTok-Kodierung, 2× vergrößert
bild = 180  # Bild 1380
for name, *_ in zeilen: ff("-ss", str(bild / FPS), "-i", str(Q / f"{name}_tiktok.mp4"), "-frames:v", "1", "-vf", "scale=1080:1920", str(Q / f"{name}.png"))
from PIL import Image, ImageDraw
box = tuple(int(x) for x in os.environ.get("AUSSCHNITT", "300,700,660,1060").split(","))
teile = [Image.open(Q / f"{n}.png").crop(box).resize(((box[2] - box[0]) * 2, (box[3] - box[1]) * 2), Image.NEAREST) for n, *_ in zeilen]
w, h = teile[0].size; c = Image.new("RGB", (w * len(teile), h + 50), "white"); d = ImageDraw.Draw(c)
for k, (t, z) in enumerate(zip(teile, zeilen)): c.paste(t, (k * w, 50)); d.text((k * w + 10, 15), z[0], fill="black")
c.save(Q / "vergleich_nach_tiktok.png"); print("Vergleichsbild:", Q / "vergleich_nach_tiktok.png")
