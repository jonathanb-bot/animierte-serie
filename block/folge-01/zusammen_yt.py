# YouTube-Fassung (Jonathan 22.11.: YouTube nur bis 90 s): Zeile 3 („Darum brennen …“) fällt weg, Spannungspausen gekürzt.
import json, numpy as np, soundfile as sf
x, sr = sf.read("stimme.wav", dtype="float32"); x = x.mean(1) if x.ndim > 1 else x
p = json.load(open("plan.json")); ZIEL = 88.6
extra = {1: 0.3, 2: 0.2, 4: 0.2, 5: 0.5, 7: 0.3, 8: 0.2, 11: 0.2, 12: 0.4, 13: 0.3, 15: 0.2, 17: 0.3, 18: 0.4, 19: 0.6, 20: 0.4, 21: 0.8, 22: 0.6, 23: 0.8, 24: 0.3, 25: 0.9, 26: 0.15, 27: 0.3}
for OHNE in ({3}, {3, 23}, {3, 23, 13}, {3, 23, 13, 2}):
    sprache = sum(z["dauer"] for i, z in enumerate(p["zeilen"]) if i not in OHNE); n = len(p["zeilen"]) - len(OHNE)
    f = (ZIEL - 0.3 - 1.6 - sprache - n * 0.2) / sum(v for k, v in extra.items() if k not in OHNE)
    if f >= 0.35: break
f = min(1.0, max(0.0, f)); print("ohne Zeilen", sorted(OHNE))
start0 = 0.3; teile = [np.zeros(int(start0*sr), np.float32)]; t = start0; neu = []
for i, z in enumerate(p["zeilen"]):
    if i in OHNE:   # bleibt im Plan (gleiche Nummern), aber ohne Länge und ohne Wörter
        vorher = neu[-1]["start"] + neu[-1]["dauer"]; neu.append({"text": z["text"], "start": vorher - 0.25, "dauer": 0.0, "woerter": []}); continue
    a = int(z["start"]*sr); b = int((z["start"]+z["dauer"])*sr); y = x[a:b]; off = t - z["start"]
    neu.append({"text": z["text"], "start": t, "dauer": len(y)/sr, "woerter": [[w[0]+off, w[1]+off, w[2]] for w in z["woerter"]]})
    pause = 0.2 + f * extra.get(i, 0); teile += [y, np.zeros(int(pause*sr), np.float32)]; t += len(y)/sr + pause
y = np.concatenate(teile); sf.write("stimme_yt.wav", y, sr)
json.dump({"dauer": len(y)/sr, "zeilen": neu}, open("plan_yt.json", "w"), ensure_ascii=False, indent=1)
print("Pausenfaktor", round(f, 2), "Stimme", round(len(y)/sr, 2), "Video", round(neu[-1]["start"] + neu[-1]["dauer"] + 1.6, 2))
