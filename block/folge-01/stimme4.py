# Erzählstimme Folge 1, neu (Jonathan 22./23.11.: „Stimme wie im Vorbild“, lebendiger, natürlicher):
# kurze Abschnitte (3 Zeilen) mit der Anweisung, die bei der Hörprobe am lebendigsten klang (Melodie 5,7 HT wie im Vorbild),
# keine Rundfunk-Kette, kein starkes Umpitchen (nur kleiner Angleich auf ~200 Hz), etwas wärmerer Klang.
import sys, json, subprocess, tempfile, os
from pathlib import Path
HIER = Path(__file__).resolve().parent
sys.path.insert(0, str(HIER.parents[1])); sys.path.insert(0, str(HIER))
import numpy as np
from ton import gemini as G, audio as A
from zeilen_f1 import zeilen
G.stimm_kette = lambda y: y
G._rauschtor = lambda y, **k: y.astype(np.float32)
G.figur_setzen("ein zwölfjähriger Junge, der aufgeregt eine spannende Geschichte erzählt: junge, helle, natürliche Stimme, "
               "lebendig und ausdrucksstark, betont die wichtigen Wörter, mit Spannung und Staunen, wie ein echtes Kind, nicht vorgelesen, "
               "nach jedem Satz eine kleine Pause")
BASIS = G.STIL; ZIEL = 200.0; GR = list(range(0, len(zeilen), 3)) + [len(zeilen)]
def f0s(y):
    x = y[::3]; sr = A.SR // 3; fs = []
    for i in range(0, len(x) - 1024, 320):
        q = x[i:i+1024]
        if np.sqrt((q**2).mean()) < 0.02: continue
        c = np.correlate(q, q, 'full')[1023:]; lo, hi = sr // 500, sr // 70; k = lo + np.argmax(c[lo:hi])
        if c[k] > 0.55 * c[0]: fs.append(sr / k)
    return np.array(fs)
out, ANP, info = [], [], []
for gi in range(len(GR) - 1):
    teil = zeilen[GR[gi]:GR[gi+1]]; kand = []
    for v in range(int(os.environ.get("VERSUCHE", "3"))):
        G.STIL = BASIS.replace("Nur den Text sprechen", " " * (v + 11) + "Nur den Text sprechen")
        try: o = G.sprechen(teil, [0] * len(teil), stimme="Puck", anfragen=1)
        except G.KontingentErschoepft:
            if kand: break
            raise
        y = np.concatenate([g.audio for g in o]); fs = f0s(y); f0 = float(np.median(fs)); mel = float(np.std(12 * np.log2(fs / f0)))
        score = abs(12 * np.log2(f0 / ZIEL)) - 0.6 * (mel - 4.5)
        print(f"  Abschnitt {gi+1} Versuch {v+1}: F0 {f0:.0f} Hz, Melodie {mel:.1f}, Wert {score:.2f}", flush=True)
        kand.append((score, f0, mel, o))
        if abs(12 * np.log2(f0 / ZIEL)) < 1.5 and mel > 5.0: break
    s, f0, mel, o = min(kand, key=lambda k: k[0]); info.append((round(f0), round(mel, 1)))
    out += o; ANP += [ZIEL / f0] * len(teil)
def angleich(y, r):
    r = float(np.clip(r, 2 ** (-2 / 12), 2 ** (2 / 12)))
    if abs(12 * np.log2(r)) < 0.4: return y
    with tempfile.TemporaryDirectory() as d:
        A.schreiben_wav(d + '/a.wav', y); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', d + '/a.wav', '-af', f'rubberband=pitch={r:.4f}:formant=preserved:pitchq=quality', d + '/b.wav'], check=True)
        return A.laden(d + '/b.wav')
pause = 0.2; t = 0.0; teile = []; plan = []
for z, g, r in zip(zeilen, out, ANP):
    y = angleich(g.audio, r)
    plan.append({"text": z, "start": t, "dauer": len(y)/A.SR, "woerter": [[t+a, t+b, w] for a, b, w, *_ in g.woerter]})
    teile += [y, np.zeros(int(pause*A.SR), dtype=np.float32)]; t += len(y)/A.SR + pause
x = np.concatenate(teile).astype(np.float32)
x = A.hp(x, 70); x = A.kompressor(x, -20, 2.0, 0.006, 0.15, makeup_db=2)
with tempfile.TemporaryDirectory() as d:
    A.schreiben_wav(d + "/v.wav", x)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", d + "/v.wav", "-af", "equalizer=f=250:t=q:w=1:g=1.5,highshelf=f=4500:g=-3", "-ar", "48000", str(HIER / "stimme.wav")], check=True)
json.dump({"dauer": len(x)/A.SR, "zeilen": plan, "abschnitte": info}, open(HIER / "plan.json", "w"), ensure_ascii=False, indent=1)
print("Dauer", round(len(x)/A.SR, 1), "Abschnitte (F0, Melodie):", info)
