"""Flackern und Ruckeln in fertigen Einzelbildern finden und beheben (Jonathan 24.11. abends: „das Ruckeln und die flackernden Stellen verbessern“).

Gefunden am 24.11.: In einzelnen Bildern fehlt kurz eine Fläche (Klassenboden für 1 Bild dunkelgrün, Gras blass, Bett-Textur weg).
Der Fehler kommt reproduzierbar bei genau diesem Zeitpunkt aus dem Software-Renderer, neu rendern hilft also nicht.
Deshalb wird jedes Einzelbild, das sich von beiden Nachbarn stark unterscheidet, während die Nachbarn untereinander fast gleich sind
(kein Schnitt), durch die Mitte seiner Nachbarn ersetzt. Bei 60 fps ist das unsichtbar. Gleiches für 2 Bilder hintereinander.

    python3 entflackern.py <ordner>/frames                 # beheben (Originale → <ordner>/frames_flacker/)
    python3 entflackern.py <ordner>/frames --nur-zeigen    # nur auflisten
    python3 entflackern.py <ordner>/frames --wisch-liste liste.txt   # stark waagerecht verwischte Bilder (alter Wisch-Übergang) → Liste zum Neu-Rendern
                                                                    # (render.cjs mit LISTE=liste.txt)
Vor dem Kodieren jeder Folge laufen lassen (steht in README.md).
"""
import sys, os, shutil
import numpy as np
from PIL import Image

W, H, TX, TY = 90, 160, 3, 6


def klein(pfad):
    return np.asarray(Image.open(pfad).convert("L").resize((W, H), Image.BILINEAR), np.float32)


def kachel(a, b):
    """größter mittlerer Unterschied einer Kachel (3×6 Kacheln) – findet auch Fehler in nur einem Bildteil"""
    d = np.abs(a - b)
    return max(d[y * H // TY:(y + 1) * H // TY, x * W // TX:(x + 1) * W // TX].mean() for y in range(TY) for x in range(TX))


def main():
    ordner = sys.argv[1]; nur = "--nur-zeigen" in sys.argv
    namen = sorted(n for n in os.listdir(ordner) if n.endswith(".jpg"))
    f = [klein(os.path.join(ordner, n)) for n in namen]
    if "--wisch-liste" in sys.argv:
        ziel = sys.argv[sys.argv.index("--wisch-liste") + 1]
        r = []
        for a in f:
            gx = np.abs(np.diff(a, axis=1)).mean(); gy = np.abs(np.diff(a, axis=0)).mean(); r.append(gx / max(gy, 1e-3))
        r = np.array(r); weg = set()
        for i in range(len(r)):
            lo, hi = max(0, i - 40), min(len(r), i + 41); ref = np.median(r[lo:hi])
            if r[i] < 0.72 * ref: weg.update(range(max(0, i - 2), min(len(r), i + 3)))
        nr = sorted(int(namen[i][:5]) for i in weg)
        open(ziel, "w").write("\n".join(map(str, nr)) + "\n"); print(f"{len(nr)} verwischte Bilder → {ziel}"); return
    schlecht = []
    i = 1
    while i < len(f) - 1:
        d0 = kachel(f[i - 1], f[i + 1]); d1 = kachel(f[i - 1], f[i]); d2 = kachel(f[i], f[i + 1])
        if d1 > 6 and d2 > 6 and d1 > 3 * max(d0, 1.0) and d2 > 3 * max(d0, 1.0):
            schlecht.append((i, 1)); i += 2; continue
        if i < len(f) - 2:                                   # zwei Bilder hintereinander
            e0 = kachel(f[i - 1], f[i + 2]); e1 = kachel(f[i - 1], f[i]); e2 = kachel(f[i + 1], f[i + 2])
            if e1 > 6 and e2 > 6 and e1 > 3 * max(e0, 1.0) and e2 > 3 * max(e0, 1.0) and kachel(f[i], f[i + 1]) < 0.5 * e1:
                schlecht.append((i, 2)); i += 3; continue
        i += 1
    print(f"{len(schlecht)} flackernde Stellen:", [(int(namen[i][:5]), n) for i, n in schlecht][:80])
    if nur or not schlecht: return
    sicher = ordner.rstrip("/") + "_flacker"; os.makedirs(sicher, exist_ok=True)
    for i, n in schlecht:
        a = np.asarray(Image.open(os.path.join(ordner, namen[i - 1])).convert("RGB"), np.float32)
        b = np.asarray(Image.open(os.path.join(ordner, namen[i + n])).convert("RGB"), np.float32)
        for k in range(n):
            q = (k + 1) / (n + 1); p = os.path.join(ordner, namen[i + k])
            if not os.path.exists(os.path.join(sicher, namen[i + k])): shutil.copy2(p, sicher)
            Image.fromarray(np.clip(a * (1 - q) + b * q + 0.5, 0, 255).astype(np.uint8)).save(p, quality=93)
    print("behoben, Originale in", sicher)


if __name__ == "__main__":
    main()
