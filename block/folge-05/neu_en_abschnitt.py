# Englisch, Abschnitt 4 (Zeilen 15–19) neu anfragen (28.11.: Gemini sprach Zeile 19 auf Deutsch, Zeilen 16–18 verändert)
# und in en/stimme.wav + en/plan.json einsetzen. Stimme unbearbeitet (Issue #41): nur ausgeschnitten und aneinandergelegt.
import sys, json, os, shutil; sys.path.insert(0, ".."); os.makedirs("en_neu", exist_ok=True)
import numpy as np, soundfile as sf
from stimme import erzeugen
import tempfile; from pathlib import Path; from ton import gemini as G; G.CACHE = Path(tempfile.mkdtemp())   # frische Versuche, nicht die alten aus dem Zwischenspeicher
A, B = int(sys.argv[1]), int(sys.argv[2])            # Zeilen A … B-1
zeilen = json.load(open("zeilen_en.json"))
if "--nur-einsetzen" not in sys.argv: erzeugen(zeilen[A:B], "en_neu", gruppe=int(os.environ.get("GRUPPE", B - A)))
alt, sr = sf.read("en/stimme.wav", dtype="float32"); neu, sr2 = sf.read("en_neu/stimme.wav", dtype="float32"); assert sr == sr2
pa = json.load(open("en/plan.json")); pn = json.load(open("en_neu/plan.json"))
t0 = pa["zeilen"][A]["start"]; t1 = pa["zeilen"][B]["start"] if B < len(zeilen) else len(alt) / sr
# gleiche Spitze wie die alte Spur (gleichmäßiger Faktor, verändert die Stimme nicht)
neu = neu * (np.abs(alt).max() / max(1e-6, np.abs(neu).max()))
y = np.concatenate([alt[:int(t0 * sr)], neu, alt[int(t1 * sr):]]); d = len(neu) / sr - (t1 - t0)
z = []
for i, zl in enumerate(pa["zeilen"]):
    if A <= i < B:
        n = pn["zeilen"][i - A]; z.append({"text": n["text"], "start": n["start"] + t0, "dauer": n["dauer"], "woerter": [[w[0] + t0, w[1] + t0, w[2]] for w in n["woerter"]]})
    elif i >= B: z.append({**zl, "start": zl["start"] + d, "woerter": [[w[0] + d, w[1] + d, w[2]] for w in zl["woerter"]]})
    else: z.append(zl)
if not os.path.exists("en/stimme_vorher.wav"): shutil.copy("en/stimme.wav", "en/stimme_vorher.wav")
sf.write("en/stimme.wav", y, sr)
json.dump({**pa, "dauer": len(y) / sr, "zeilen": z}, open("en/plan.json", "w"), ensure_ascii=False, indent=1); print("eingesetzt, Länge", round(len(y) / sr, 2))
