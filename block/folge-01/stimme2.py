# Neue Erzählstimme (Jonathan 22.11.: „Stimme wie im Vorbild“): natürliche Gemini-Fassungen ohne Radio-Kette und ohne starkes
# Umpitchen, ruhigeres Erzähltempo. Pro Abschnitt mehrere Fassungen, die beste nach Tonhöhe, Melodie, Tempo und Erkennung.
import sys, json, subprocess, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2])); sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np
from ton import gemini as G, audio as A
from zeilen_f1 import zeilen  # gleiche Zeilen wie Folge 1
G.stimm_kette = lambda y: y                       # keine Rundfunk-Kette (klang künstlich)
G._rauschtor = lambda y, **k: y.astype(np.float32)
STIL = ("ein etwa dreizehnjähriger Junge, der wie ein YouTube-Geschichtenerzähler eine spannende Geschichte erzählt: "
        "natürliche, junge, warme Stimme, ausdrucksstark und mit viel Gefühl, ruhiges, gut verständliches Erzähltempo, "
        "eine kleine Pause nach jedem Satz, nicht gehetzt, betont die wichtigen Wörter, wie ein echter Mensch, nicht vorgelesen")
G.figur_setzen(STIL)
BASIS = G.STIL
ZIEL = 200.0
def f0s(y):
    x = y[::3]; sr = A.SR // 3; fs = []
    for i in range(0, len(x) - 1024, 320):
        q = x[i:i+1024]
        if np.sqrt((q**2).mean()) < 0.02: continue
        c = np.correlate(q, q, 'full')[1023:]; lo, hi = sr // 500, sr // 70; k = lo + np.argmax(c[lo:hi])
        if c[k] > 0.55 * c[0]: fs.append(sr / k)
    return np.array(fs)
GR = [0, 4, 9, 13, 17, 21, 26]
out, ANP, wahl = [], [], []
for gi in range(6):
    teil = zeilen[GR[gi]:GR[gi+1]]; woerter = sum(len(z.split()) for z in teil); kand = []
    for v in range(5):
        G.STIL = BASIS.replace("Nur den Text sprechen", "  " * (v + 3) + "Nur den Text sprechen")
        o = G.sprechen(teil, [0] * len(teil), stimme="Puck", anfragen=1)
        y = np.concatenate([g.audio for g in o]); fs = f0s(y); f0 = float(np.median(fs)); mel = float(np.std(12 * np.log2(fs / f0)))
        rate = woerter / (sum(len(g.audio) for g in o) / A.SR)
        score = abs(12 * np.log2(f0 / ZIEL)) + max(0, rate - 2.6) * 3 - 0.4 * (mel - 4)
        print(f"  Teil {gi+1} Versuch {v+1}: F0 {f0:.0f} Hz, Melodie {mel:.1f}, Tempo {rate:.2f} W/s, Wert {score:.2f}", flush=True)
        kand.append((score, f0, o))
        if score < 1.2 and len(kand) >= 2: break
    s, f0, o = min(kand, key=lambda k: k[0]); print(f"Teil {gi+1}: gewählt F0 {f0:.0f}, Wert {s:.2f}", flush=True)
    out += o; ANP += [ZIEL / f0] * len(teil); wahl.append(round(f0))
def angleich(y, r):
    if abs(12 * np.log2(r)) < 0.6: return y
    r = float(np.clip(r, 2 ** (-2.5 / 12), 2 ** (2.5 / 12)))
    with tempfile.TemporaryDirectory() as d:
        A.schreiben_wav(d + '/a.wav', y); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', d + '/a.wav', '-af', f'rubberband=pitch={r:.4f}:formant=preserved:pitchq=quality', d + '/b.wav'], check=True)
        return A.laden(d + '/b.wav')
pause = 0.2; t = 0.0; teile = []; plan = []
for z, g, r in zip(zeilen, out, ANP):
    y = angleich(g.audio, r)
    ws = g.woerter
    plan.append({"text": z, "start": t, "dauer": len(y)/A.SR, "woerter": [[t+a, t+b, w] for a, b, w, *_ in ws]})
    teile += [y, np.zeros(int(pause*A.SR), dtype=np.float32)]; t += len(y)/A.SR + pause
x = np.concatenate(teile).astype(np.float32)
# sanft: Trittschall weg, leichte Kompression (keine Radio-Präsenz)
x = A.hp(x, 70); x = A.kompressor(x, -20, 2.0, 0.006, 0.15, makeup_db=2)
A.schreiben_wav("v2/stimme.wav", x)
json.dump({"dauer": len(x)/A.SR, "zeilen": plan, "f0_gewaehlt": wahl}, open("v2/plan.json", "w"), ensure_ascii=False, indent=1)
print("Dauer", round(len(x)/A.SR, 1), "F0 je Teil", wahl)
