"""Erzählstimme für Blockstadt-Folgen (gemeinsam für alle Folgen, ersetzt die Kopien von stimme4.py/zusammen*.py).

Jonathan 23.11. abends: „Die Stimme ist zu leise im Vergleich zum Hintergrund und hat noch nicht dieses Etwas,
damit es spannend ist – mehr freudige Stimme wie im Vorbild.“ Gemessen am Vorbild (Monster-im-Dunkeln-Video):
  Vorbild: Stimme 12 dB über dem Hintergrund, Pausen Ø 0,47 s, Melodie-Spanne ~20 Halbtöne, F0 ~204 Hz
  Folge 1: Stimme  3 dB über dem Hintergrund, Pausen Ø 0,81 s, Melodie-Spanne ~16 Halbtöne, F0 ~200 Hz
Darum: fröhliche Storytime-Anweisung (Hörproben 23.11., höchste Melodie), Auswahl nach Melodie, kurze Pausen.
Die Lautstärke regelt tonbib.Ton.mischen (Abstand 12 LU).
Seit 24.11. abends (Jonathan): Die Stimme bleibt unverändert – keine Tonhöhen-Anpassung, kein Kompressor/EQ, kein Tempo.

    import sys; sys.path.insert(0, "..")
    from stimme import erzeugen, zusammen
    erzeugen(zeilen, ".")                                  # → stimme.wav + plan.json (Gemini „Puck“)
    zusammen(".", extra={5: 0.3, 19: 0.4})                 # → stimme_final.wav + plan_final.json
    zusammen(".", extra={...}, yt=True, ohne=[{3}, {3, 9}])  # → stimme_yt.wav + plan_yt.json (≤ 88,9 s)
"""
from __future__ import annotations
import json, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np

WURZEL = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WURZEL))

ANWEISUNG = ("ein fröhliches Kind, das ein Storytime-Video für TikTok erzählt: hell, energiegeladen und verspielt, "
             "hörbar lächelnd, zügig und ohne lange Pausen, stark betonte Schlüsselwörter, Spannung mit hoher Stimme "
             "aufbauen und bei Pointen kurz innehalten")
# Jonathans Regel bleibt: nie flüstern oder hauchen. „Gleichbleibende Lautstärke“ fällt hier weg, weil sie den Vortrag
# flach machte; die Lautstärke gleicht danach der Kompressor an.
VOLL = ", immer mit voller, klarer Sprechstimme, niemals flüstern oder hauchen"
ZIEL_HZ = 200.0
PAUSE = 0.12        # zwischen zwei Zeilen (vorher 0,2 + 0,2)
EXTRA_MAX = 0.45    # längste Spannungspause zusätzlich (Vorbild: Ø 0,47 s)


def _f0s(y, sr):
    x = y[::3]; sr = sr // 3; fs = []
    for i in range(0, len(x) - 1024, 320):
        q = x[i:i + 1024]
        if np.sqrt((q ** 2).mean()) < 0.02: continue
        c = np.correlate(q, q, 'full')[1023:]; lo, hi = sr // 600, sr // 80; k = lo + np.argmax(c[lo:hi])
        if c[k] > 0.5 * c[0]: fs.append(sr / k)
    return np.array(fs) if fs else np.array([ZIEL_HZ])


def _ruhe_kuerzen(y, sr, max_s=0.1):
    """Stille am Anfang und Ende einer Zeile auf max_s kürzen."""
    e = np.convolve(np.abs(y), np.ones(240) / 240, "same"); laut = np.where(e > 0.01)[0]
    if not len(laut): return y, 0.0
    a = max(0, laut[0] - int(max_s * sr)); b = min(len(y), laut[-1] + int(max_s * sr))
    return y[a:b], a / sr


def erzeugen(zeilen, ordner=".", gruppe=3, versuche=None):
    from ton import gemini as G, audio as A
    G.stimm_kette = lambda y: y
    G._rauschtor = lambda y, **k: y.astype(np.float32)
    G.MAX_PAUSE = 0.35
    G.figur_setzen(ANWEISUNG); G.STIL = G.STIL.replace(G.NORMAL, VOLL)
    basis = G.STIL; versuche = versuche or int(os.environ.get("VERSUCHE", "3"))
    ordner = Path(ordner); GR = list(range(0, len(zeilen), gruppe)) + [len(zeilen)]
    out, anp, info = [], [], []
    for gi in range(len(GR) - 1):
        teil = zeilen[GR[gi]:GR[gi + 1]]; kand = []
        for v in range(versuche):
            G.STIL = basis.replace("Nur den Text sprechen", " " * (v + 11) + "Nur den Text sprechen")
            try: o = G.sprechen(teil, [0] * len(teil), stimme="Puck", anfragen=1)
            except G.KontingentErschoepft:
                if kand: break
                raise
            y = np.concatenate([g.audio for g in o]); fs = _f0s(y, A.SR); f0 = float(np.median(fs))
            st = 12 * np.log2(fs / f0); spanne = float(np.percentile(st, 95) - np.percentile(st, 5))
            wert = abs(12 * np.log2(f0 / ZIEL_HZ)) - 0.35 * (spanne - 16)
            print(f"  Abschnitt {gi + 1} Versuch {v + 1}: F0 {f0:.0f} Hz, Spanne {spanne:.1f} HT, Wert {wert:.2f}", flush=True)
            kand.append((wert, f0, spanne, o))
            if abs(12 * np.log2(f0 / ZIEL_HZ)) < 1.5 and spanne > 17: break
        wert, f0, spanne, o = min(kand, key=lambda k: k[0]); info.append((round(f0), round(spanne, 1)))
        out += o; anp += [ZIEL_HZ / f0] * len(teil)

    def angleich(y, r):
        return y   # Jonathan 24.11. abends: Stimme auf natürlicher Höhe lassen, keine Tonhöhen-Änderung mehr
        r = float(np.clip(r, 2 ** (-2 / 12), 2 ** (2 / 12)))
        if abs(12 * np.log2(r)) < 0.4: return y
        with tempfile.TemporaryDirectory() as d:
            A.schreiben_wav(d + '/a.wav', y)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', d + '/a.wav', '-af',
                            f'rubberband=pitch={r:.4f}:formant=preserved:pitchq=quality', d + '/b.wav'], check=True)
            return A.laden(d + '/b.wav')
    t = 0.0; teile = []; plan = []
    for z, g, r in zip(zeilen, out, anp):
        y, ab = _ruhe_kuerzen(angleich(g.audio, r), A.SR)
        plan.append({"text": z, "start": t, "dauer": len(y) / A.SR, "woerter": [[t + a - ab, t + b - ab, w] for a, b, w, *_ in g.woerter]})
        teile += [y, np.zeros(int(PAUSE * A.SR), dtype=np.float32)]; t += len(y) / A.SR + PAUSE
    x = np.concatenate(teile).astype(np.float32)
    # Jonathan 24.11. abends: Stimme NICHT verändern – kein Kompressor, kein EQ, kein Hochpass, keine Tonhöhe.
    # Nur gleichmäßig verstärkt (Spitze −1 dBFS), damit sie nicht zu leise im Mix landet.
    x = x * (10 ** (-1 / 20) / max(1e-6, float(np.abs(x).max())))
    with tempfile.TemporaryDirectory() as d:
        A.schreiben_wav(d + "/v.wav", x)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", d + "/v.wav", "-ar", "48000", str(ordner / "stimme.wav")], check=True)
    json.dump({"dauer": len(x) / A.SR, "zeilen": plan, "abschnitte": info}, open(ordner / "plan.json", "w"), ensure_ascii=False, indent=1)
    print("Dauer", round(len(x) / A.SR, 1), "Abschnitte (F0, Spanne):", info)


def zusammen(ordner=".", extra=None, yt=False, ohne=None, ziel=88.9, tempo=None, start0=0.25):
    """Zeilen mit Pausen aneinanderlegen. extra: {Zeile: zusätzliche Pause in s} (wird auf EXTRA_MAX begrenzt).
    yt=True: schneller (tempo, Standard 1,05) und ggf. Zeilen weglassen (ohne = Liste von Mengen, erste passende gilt)."""
    import soundfile as sf
    ordner = Path(ordner); extra = {k: min(EXTRA_MAX, v) for k, v in (extra or {}).items()}
    quelle = ordner / "stimme.wav"; p = json.load(open(ordner / "plan.json"))
    if yt:
        tempo = 1.0   # Issue #41 (Jonathan 24.11.): Stimme nie bearbeiten – kein Tempo, keine Tonhöhe; für YouTube lieber Zeilen weglassen
        x, sr = sf.read(str(quelle), dtype="float32")
        for z in p["zeilen"]:
            z["start"] /= tempo; z["dauer"] /= tempo; z["woerter"] = [[w[0] / tempo, w[1] / tempo, w[2]] for w in z["woerter"]]
    else:
        x, sr = sf.read(quelle, dtype="float32")
    x = x.mean(1) if x.ndim > 1 else x
    weg, fak = set(), 1.0
    if yt:
        for kand in (ohne or [set()]):
            sprache = sum(z["dauer"] for i, z in enumerate(p["zeilen"]) if i not in kand); n = len(p["zeilen"]) - len(kand)
            rest = sum(v for k, v in extra.items() if k not in kand) or 1
            fak = (ziel - start0 - 1.6 - sprache - n * PAUSE) / rest; weg = set(kand)
            if fak >= 0.3: break
        fak = min(1.0, max(0.0, fak))
    teile = [np.zeros(int(start0 * sr), np.float32)]; t = start0; neu = []
    for i, z in enumerate(p["zeilen"]):
        if i in weg:
            vorher = neu[-1]["start"] + neu[-1]["dauer"]; neu.append({"text": z["text"], "start": vorher - 0.25, "dauer": 0.0, "woerter": []}); continue
        a = int(z["start"] * sr); b = int((z["start"] + z["dauer"]) * sr); y = x[a:b]; off = t - z["start"]
        neu.append({"text": z["text"], "start": t, "dauer": len(y) / sr, "woerter": [[w[0] + off, w[1] + off, w[2]] for w in z["woerter"]]})
        pause = PAUSE + fak * extra.get(i, 0); teile += [y, np.zeros(int(pause * sr), np.float32)]; t += len(y) / sr + pause
    y = np.concatenate(teile); name = "yt" if yt else "final"
    sf.write(ordner / f"stimme_{name}.wav", y, sr)
    json.dump({"dauer": len(y) / sr, "zeilen": neu}, open(ordner / f"plan_{name}.json", "w"), ensure_ascii=False, indent=1)
    print(f"{name}: Stimme {len(y) / sr:.2f} s, Video {neu[-1]['start'] + neu[-1]['dauer'] + 1.6:.2f} s"
          + (f", ohne Zeilen {sorted(weg)}, Pausenfaktor {fak:.2f}" if yt else ""))
    return neu
