# Zeilengrenzen an echte Sprechpausen legen (28.11.: Gemini-Wortzeiten der englischen Spur lagen bis 0,8 s zu früh,
# dadurch wären Wörter beim Zusammensetzen abgeschnitten worden). Die Stimme selbst bleibt unverändert (Issue #41).
import sys, json, numpy as np, soundfile as sf
ordner = sys.argv[1]; x, sr = sf.read(f"{ordner}/stimme.wav", dtype="float32"); x = x.mean(1) if x.ndim > 1 else x
p = json.load(open(f"{ordner}/plan.json")); Z = p["zeilen"]
h = int(0.01 * sr); e = np.sqrt(np.convolve(x ** 2, np.ones(h * 3) / (h * 3), "same"))[::h]   # Hüllkurve, 10-ms-Raster
still = e < max(0.004, np.percentile(e, 20) * 1.5)
def pause_bei(t, links=0.4, rechts=1.1):
    a, b = int((t - links) * 100), int((t + rechts) * 100); best = None; i = a
    while i < b:
        if still[i]:
            j = i
            while j < len(still) and still[j]: j += 1
            if best is None or (j - i) > (best[1] - best[0]) * 1.3: best = (i, j)
            i = j
        else: i += 1
    return best
grenzen = []
for i in range(len(Z) - 1):
    g = pause_bei(Z[i]["start"] + Z[i]["dauer"]); grenzen.append(g)
    print(i, "Ende", round(Z[i]["start"] + Z[i]["dauer"], 2), "→ Pause", None if g is None else (g[0] / 100, g[1] / 100))
neu = []
for i, z in enumerate(Z):
    s = z["start"] if i == 0 else grenzen[i - 1][1] / 100 - 0.04
    en = (len(x) / sr) if i == len(Z) - 1 else grenzen[i][0] / 100 + 0.05
    if i == len(Z) - 1:
        laut = np.where(~still)[0]; en = laut[-1] / 100 + 0.08
    d = s - z["start"]; neu.append({**z, "start": s, "dauer": en - s, "woerter": [[w[0] + d, w[1] + d, w[2]] for w in z["woerter"]]})
json.dump({**p, "zeilen": neu}, open(f"{ordner}/plan.json", "w"), ensure_ascii=False, indent=1)
