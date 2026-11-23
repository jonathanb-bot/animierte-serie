import sys, json, subprocess
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2])); sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np
from ton import gemini as G, audio as A
zeilen = [
 "In meiner Stadt geht nachts nie ein Licht aus. Nicht ein einziges.",
 "Denn sobald es irgendwo dunkel wird, kommen die Schatten.",
 "Sie kriechen aus jeder dunklen Ecke. Und alles, was sie berühren, verschwindet.",
 "Darum brennen bei uns die ganze Nacht Laternen, Scheinwerfer und Millionen Fenster.",
 "Mein Papa leitet das Kraftwerk, das die ganze Stadt beleuchtet.",
 "Und letzte Nacht ist dort etwas kaputtgegangen.",
 "Um zwei Uhr nachts ging in der ganzen Stadt der Strom aus.",
 "Ein Viertel nach dem anderen wurde dunkel.",
 "Und aus den Gassen krochen die Schatten.",
 "Die Leute rannten zu ihren Autos und schalteten die Scheinwerfer an.",
 "Papa schrie: Alle Lichter auf die Straße!",
 "Die Polizei stellte ihre Wagen im Kreis auf, alle Lichter nach außen.",
 "Und die Schatten blieben genau an der Grenze zum Licht stehen.",
 "Aber die Notlampen hielten nur noch zehn Minuten.",
 "Da fiel mir das Lager von meiner Oma ein.",
 "Oma verkauft Himmelslaternen. Tausende davon.",
 "Wir rannten los. Papa leuchtete mit der Taschenlampe, und ich schleppte die Kisten.",
 "Wir verteilten die Laternen an alle Leute auf dem großen Platz.",
 "Die Notlampen flackerten. Noch eine Minute.",
 "Papa rief: Jetzt!",
 "Und alle ließen ihre Laternen gleichzeitig los.",
 "Tausende Lichter stiegen in den Himmel, und die ganze Stadt leuchtete golden.",
 "Überall, wo das Licht hinkam, lösten sich die Schatten auf.",
 "Am Morgen lief das Kraftwerk wieder, und die ganze Stadt hat gefeiert.",
 "Aber heute Nacht, als ich ins Bett ging, flackerte meine Nachttischlampe.",
 "Und unter meinem Bett hat sich etwas bewegt.",
]
G.figur_setzen("ein zwölfjähriger Junge, der aufgeregt eine spannende Geschichte erzählt: junge, helle, natürliche Stimme, "
               "lebendig und ausdrucksstark, zügig, betont die wichtigen Wörter, mit Spannung und Staunen, wie ein echtes Kind, nicht vorgelesen, "
               "nach jeder Zeile eine kurze Pause")
ZIEL = 187.0
def f0(y):
    x = y[::3]; sr = A.SR // 3; fs = []
    for i in range(0, len(x) - 1024, 320):
        q = x[i:i+1024]
        if np.sqrt((q**2).mean()) < 0.03: continue
        c = np.correlate(q, q, 'full')[1023:]; lo, hi = sr // 500, sr // 70; k = lo + np.argmax(c[lo:hi])
        if c[k] > 0.55 * c[0]: fs.append(sr / k)
    return float(np.median(fs))
BESCHR = G.STIL
out = []
GR = [0, 4, 9, 13, 17, 21, 26]
ANP = []
for gi in range(6):
    teil = zeilen[GR[gi]:GR[gi+1]]
    beste = None
    for v in range(4):
        G.STIL = BESCHR.replace("Nur den Text sprechen", " " * v + "Nur den Text sprechen")
        o = G.sprechen(teil, [0] * len(teil), stimme="Puck", anfragen=1)
        y = np.concatenate([g.audio if hasattr(g, "audio") else g[0] for g in o]); h = f0(y)
        print("  Versuch", v + 1, "F0", round(h))
        if beste is None or abs(np.log2(h / ZIEL)) < abs(np.log2(beste[0] / ZIEL)): beste = (h, o)
        if abs(12 * np.log2(h / ZIEL)) < 1.0: break
    print("gewählt F0", round(beste[0])); ANP += [ZIEL / beste[0]] * len(teil); out += beste[1]
pause = 0.2; t = 0.0; teile = []; plan = []
import tempfile, soundfile as sf
def angleich(y, r):
    if abs(12*np.log2(r)) < 0.3: return y
    with tempfile.TemporaryDirectory() as d:
        A.schreiben_wav(d + '/a.wav', y); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', d + '/a.wav', '-af', f'rubberband=pitch={r:.4f}:formant=preserved', d + '/b.wav'], check=True)
        return A.laden(d + '/b.wav')
for z, g, r in zip(zeilen, out, ANP):
    y = angleich(g.audio if hasattr(g, "audio") else g[0], r)
    ws = g.woerter if hasattr(g, "woerter") else g[2]
    plan.append({"text": z, "start": t, "dauer": len(y)/A.SR, "woerter": [[t+a, t+b, w] for a, b, w, *_ in ws]})
    teile += [y, np.zeros(int(pause*A.SR), dtype=y.dtype)]; t += len(y)/A.SR + pause
x = np.concatenate(teile)
A.schreiben_wav("roh.wav", x)
json.dump({"dauer": len(x)/A.SR, "zeilen": plan}, open("plan.json", "w"), ensure_ascii=False, indent=1)
# kindlicher: wie Probe Nr. 2 (Tonhöhe +1 HT mit Formanten, +1 HT ohne), gleiche Länge
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "roh.wav", "-af", f"asetrate={int(A.SR*1.06)},aresample={A.SR},atempo={1/1.06:.6f},rubberband=pitch=1.06:formant=preserved", "stimme.wav"], check=True)
print("Dauer", round(len(x)/A.SR, 1))
for p in plan: print(round(p["start"],2), round(p["dauer"],2), p["text"])
