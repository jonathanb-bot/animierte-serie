import json, numpy as np, soundfile as sf
x, sr = sf.read("stimme.wav", dtype="float32"); x = x.mean(1) if x.ndim > 1 else x
p = json.load(open("plan.json"))
extra = {1: 0.3, 2: 0.2, 4: 0.2, 5: 0.5, 7: 0.3, 8: 0.2, 11: 0.2, 12: 0.4, 13: 0.3, 15: 0.2, 17: 0.3, 18: 0.4, 19: 0.6, 20: 0.4, 21: 0.8, 22: 0.6, 23: 0.8, 24: 0.3, 25: 0.9, 26: 0.15, 27: 0.3}
start0 = 0.3
teile = [np.zeros(int(start0*sr), np.float32)]; t = start0; neu = []
for i, z in enumerate(p["zeilen"]):
    a = int(z["start"]*sr); b = int((z["start"]+z["dauer"])*sr); y = x[a:b]; off = t - z["start"]
    neu.append({"text": z["text"], "start": t, "dauer": len(y)/sr, "woerter": [[w[0]+off, w[1]+off, w[2]] for w in z["woerter"]]})
    pause = 0.2 + extra.get(i, 0); teile += [y, np.zeros(int(pause*sr), np.float32)]; t += len(y)/sr + pause
y = np.concatenate(teile); sf.write("stimme_final.wav", y, sr)
json.dump({"dauer": len(y)/sr, "zeilen": neu}, open("plan_final.json", "w"), ensure_ascii=False, indent=1)
print(round(len(y)/sr, 2)); [print(i, round(z["start"],2), round(z["start"]+z["dauer"],2), z["text"]) for i, z in enumerate(neu)]
