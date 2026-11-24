"""Ton-Bibliothek für die Blockstadt-Folgen: Musik nach Stimmung + Geräusche + Mischung.

Jonathan 23.11.: „Musik soll auf die Stimmung angepasst sein.“ Jede Zeile des Drehbuchs bekommt eine Stimmung.
Aufeinanderfolgende Zeilen mit gleicher Stimmung bilden einen Abschnitt, jeder Abschnitt seine eigene Musik
(Akkordfolge, Instrumente, Tempo), mit weichen Übergängen. Wie im Vorbild: gehaltene, warme Flächen, kein Schlagzeug.

    from tonbib import Ton
    T = Ton("plan_final.json")                      # Zeitplan der Folge
    T.musik(["staunen"] * 4 + ["spannung"] * 6 + …)  # eine Stimmung pro Zeile
    T.fx(T.wz("knall", 5), T.boom(), 0.6)             # Geräusche an Wortzeiten
    T.mischen("stimme_final.wav", "mix.wav")

Stimmungen: staunen, geheimnis, spannung, grusel, action, aufbau, triumph, froh, traurig, stille
"""
from __future__ import annotations
import json
import os
import numpy as np
import soundfile as sf

SR = 48000
f = lambda m: 440 * 2 ** ((m - 69) / 12)

AKKORDE = {"Am": [57, 60, 64], "F": [53, 57, 60], "C": [48, 55, 60, 64], "G": [55, 59, 62], "Dm": [50, 57, 62, 65], "E": [52, 56, 59],
           "Em": [52, 55, 59], "Fmaj7": [53, 57, 60, 64], "Bb": [46, 53, 58, 62], "Asus": [57, 62, 64], "Cmaj7": [48, 55, 59, 64],
           "Am7": [57, 60, 64, 67], "Dsus": [50, 55, 57, 62], "Bbmaj7": [46, 53, 57, 62], "Gsus": [55, 60, 62]}
# Stimmung → (Akkordfolge, Sekunden je Akkord, Lautstärke Fläche, Glocken-Melodie?, Pulse (Abstand s, Ton) oder None, Tremolo, Helligkeit)
STIMMUNGEN = {
    "staunen":   (["Am", "F", "C", "G"], 4.2, 0.32, True, None, 0.0, 5),
    "geheimnis": (["Am7", "Fmaj7", "Dsus", "Em"], 4.6, 0.28, True, None, 0.15, 4),
    "spannung":  (["Am", "F", "Dm", "E"], 3.6, 0.26, False, (0.66, 33), 0.4, 5),
    "grusel":    (["Am", "Bb", "Am", "E"], 4.0, 0.22, False, (1.15, 31), 0.3, 3),
    "action":    (["Dm", "Bb", "C", "Am"], 2.4, 0.28, False, (0.40, 38), 0.5, 6),
    "aufbau":    (["F", "G", "Asus", "E"], 2.6, 0.28, False, (0.30, 45), 0.5, 6),
    "triumph":   (["F", "C", "G", "Fmaj7"], 3.2, 0.40, True, None, 0.0, 7),
    "froh":      (["C", "G", "Am", "F"], 2.8, 0.30, False, None, 0.0, 5),
    "traurig":   (["Am", "F", "C", "G"], 5.0, 0.24, False, None, 0.0, 3),
    "stille":    ([], 0, 0, False, None, 0, 0),
}


def env(d, a=0.01, r=0.1):
    k = int(d * SR); e = np.ones(k); ka = min(k, max(1, int(a * SR))); kr = min(k, max(1, int(r * SR)))
    e[:ka] = np.linspace(0, 1, ka); e[-kr:] *= np.linspace(1, 0, kr); return e


class Ton:
    def __init__(self, planpfad=None, dauer=None):
        planpfad = planpfad or os.environ.get("PLAN", "plan_final.json")
        self.p = json.load(open(planpfad))
        self.Z = [z["start"] for z in self.p["zeilen"]]; self.E = [z["start"] + z["dauer"] for z in self.p["zeilen"]]
        self.DAUER = dauer or (self.E[-1] + 1.6); self.n = int(self.DAUER * SR)
        self.m = np.zeros(self.n); self.f = np.zeros(self.n); self.js = np.zeros(self.n); self.rng = np.random.default_rng(5)

    # ---------- Zeiten ----------
    def leer(self, i): return not self.p["zeilen"][i]["woerter"]
    def wz(self, wort, zeile, ende=False):
        zl = self.p["zeilen"][zeile]
        if not zl["woerter"]: return zl["start"]
        w = next(w for w in zl["woerter"] if w[2].strip(".,!?:„“\"").lower() == wort.lower()); return w[1] if ende else w[0]

    # ---------- Bausteine ----------
    def add(self, buf, t0, y, g=1.0):
        a = int(t0 * SR)
        if a < 0: y = y[-a:]; a = 0
        b = min(self.n, a + len(y))
        if b > a: buf[a:b] += y[:b - a] * g
    def flaeche(self, ms, d, hell=6, a=1.2, r=1.6, trem=0.0):
        t = np.arange(int(d * SR)) / SR; y = np.zeros_like(t)
        for m in ms:
            for det in (-0.08, 0.0, 0.07):
                fr = f(m) * 2 ** (det / 12)
                for h in range(1, hell + 1): y += np.sin(2 * np.pi * fr * h * t + h * 1.3 + det * 40) / h ** 1.6
        y /= max(1, len(ms)) * 3 * 1.7
        if trem: y *= 1 - trem * 0.5 * (1 + np.sin(2 * np.pi * 7.5 * t))
        return y * env(d, a, r)
    def glocke(self, m, d=2.5):
        t = np.arange(int(d * SR)) / SR; fr = f(m)
        return (np.sin(2*np.pi*fr*t) + 0.4*np.sin(2*np.pi*fr*2.76*t)*np.exp(-t*3) + 0.2*np.sin(2*np.pi*fr*5.4*t)*np.exp(-t*6)) * np.exp(-t * 1.6) * env(d, 0.003, 0.2)
    def klavier(self, m, d=2.0):
        t = np.arange(int(d * SR)) / SR; fr = f(m)
        return sum(np.sin(2*np.pi*fr*h*t) * np.exp(-t*(1.5 + h)) / h for h in range(1, 6)) * env(d, 0.004, 0.3)
    def puls(self, m, d=0.35):
        t = np.arange(int(d * SR)) / SR; fr = f(m)
        return (np.sin(2*np.pi*fr*t) + 0.3*np.sin(4*np.pi*fr*t)) * np.exp(-t * 9) * env(d, 0.005, 0.05)
    @staticmethod
    def hall(y, mix=0.3):
        out = y.copy()
        for d, g in [(0.089, 0.6), (0.137, 0.5), (0.211, 0.42), (0.297, 0.34), (0.401, 0.26), (0.533, 0.18), (0.71, 0.12)]:
            k = int(d * SR); z = np.zeros_like(y); z[k:] = y[:-k] * g; out += z * mix
        return out

    # ---------- Musik nach Stimmung ----------
    def musik(self, stimmungen, start=0.0, hall=0.35):
        """stimmungen: eine Stimmung pro Zeile (Liste) → Abschnitte mit eigener Musik."""
        assert len(stimmungen) == len(self.Z), f"{len(stimmungen)} Stimmungen für {len(self.Z)} Zeilen"
        abschnitte = []; i = 0
        while i < len(stimmungen):
            j = i
            while j + 1 < len(stimmungen) and stimmungen[j + 1] == stimmungen[i]: j += 1
            a = start if i == 0 else self.Z[i] - 0.4; b = self.Z[j + 1] - 0.4 if j + 1 < len(stimmungen) else self.DAUER
            abschnitte.append((stimmungen[i], a, b)); i = j + 1
        roh = np.zeros(self.n)
        for st, a, b in abschnitte:
            folge, dauer, laut, glocken, puls, trem, hell = STIMMUNGEN[st]
            if not folge: continue
            t = a; k = 0
            while t < b:
                ch = AKKORDE[folge[k % len(folge)]]; d = min(dauer, b - t) + 1.0
                self.add(roh, t, self.flaeche([m + 12 for m in ch] + [ch[0]], d, hell=hell, a=0.6 if k else 0.9, r=1.0, trem=trem), laut)
                if glocken:
                    for s in range(2):
                        self.add(roh, t + 0.4 + s * dauer / 2, self.glocke(ch[(k + s) % len(ch)] + 24, 2.2), 0.09)
                t += dauer; k += 1
            if puls:
                abst, ton = puls; t = a
                while t < b - 0.2: self.add(roh, t, self.puls(ton, 0.4), 0.42); t += abst
            if st == "aufbau":   # Anstieg zum Ende des Abschnitts
                d = b - a; tt = np.arange(int(d * SR)) / SR; self.add(roh, a, np.sin(2 * np.pi * np.cumsum(220 + 600 * (tt / d) ** 2) / SR) * (tt / d) ** 2 * 0.22)
            if st == "froh":
                for s, m in enumerate([72, 76, 79, 84, 79, 76, 74, 79]):
                    if a + s * 0.45 < b: self.add(roh, a + s * 0.45, self.klavier(m, 1.4), 0.12)
        self.m += self.hall(roh, hall)
        self.abschnitte = abschnitte
        return abschnitte

    # ---------- Geräusche ----------
    def rausch(self, d, lo=200, hi=2000):
        x = self.rng.normal(0, 1, int(d * SR)); X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X[(fr < lo) | (fr > hi)] = 0
        y = np.fft.irfft(X, len(x)); return y / (np.abs(y).max() + 1e-9)
    def sweep(self, f0, f1, d):
        t = np.arange(int(d * SR)) / SR; fr = f0 * (f1 / f0) ** (t / d); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, 0.01, d * 0.5)
    def klick(self, g=1.0):
        k = int(0.03 * SR); return self.rng.normal(0, 1, k) * np.exp(-np.arange(k) / SR * 220) * g
    def brumm(self, d, fr=50):
        t = np.arange(int(d * SR)) / SR; return (np.sin(2*np.pi*fr*t) + 0.5*np.sin(2*np.pi*fr*2*t) + 0.09*np.sign(np.sin(2*np.pi*fr*3*t))) * env(d, 0.2, 0.2)
    def knurren(self, d, g=1.0):
        t = np.arange(int(d * SR)) / SR; fr = 55 + 10 * np.sin(2 * np.pi * 3 * t); y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t))
        return (y + self.rausch(d, 80, 400) * 0.3) * env(d, 0.15, 0.3) * g
    def boom(self, d=2.5):
        t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * (60 - 30 * t / d) * t) * np.exp(-t * 2.2) + self.rausch(d, 30, 3000) * np.exp(-t * 4) * 0.8
    def zisch(self, d=0.4): return self.rausch(d, 2000, 9000) * env(d, 0.01, 0.25)
    def piep(self, fr=2200, d=0.12):
        t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * fr * t) * env(d, 0.005, 0.02)
    def sirene(self, d=1.2):
        t = np.arange(int(d * SR)) / SR; fr = 700 + 500 * np.sin(np.pi * t / d); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, 0.05, 0.3)
    def glitzer(self, t0, dauer, dichte=8, g=0.035):
        t = t0
        while t < t0 + dauer: self.add(self.f, t, self.glocke(int(self.rng.integers(84, 100)), 0.8), g); t += self.rng.random() / dichte
    def jubel(self, t0, d):
        t = t0
        while t < t0 + d:
            k = int(0.03 * SR); self.add(self.f, t, self.rng.normal(0, 1, k) * np.exp(-np.arange(k) / SR * 120), 0.05); t += 0.03 + self.rng.random() * 0.05
        self.add(self.f, t0, self.rausch(d, 300, 3000) * env(d, 0.4, 0.8), 0.06)
    def voegel(self, t0, d):
        t = t0
        while t < t0 + d:
            dd = 0.12; tt = np.arange(int(dd * SR)) / SR; fr = 3000 + 1500 * np.sin(2 * np.pi * 18 * tt)
            self.add(self.f, t, np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(dd, 0.01, 0.05), 0.03); t += 0.15 + self.rng.random() * 0.5
    def schritte(self, t0, d, abst=0.32, g=0.08):
        t = t0
        while t < t0 + d: self.add(self.f, t, self.klick(1.0) * 0.6, g); self.add(self.f, t, self.puls(40, 0.08) * 0.4, g); t += abst   # getrennt: Klick und Puls sind unterschiedlich lang (24.11.)
    def uhr(self, t0, d, g=0.08):
        for i in range(int(d)): self.add(self.f, t0 + i, self.klick(1.0), g)
    def fx(self, t0, y, g=1.0): self.add(self.f, t0, y, g)
    def jumpscare(self, t0, g=1.0):
        """Jumpscare-Schrei (Jonathan 24.11.: laut und gruselig, sehr hochwertig). Schichten: harter Anschlag, dissonantes Streicher-Kreischen
        mit Abwärtsrutsch, Schrei mit Vokal-Formanten, Metallschlag, Sub-Schlag, kurzer Hall. Eigene, ungedeckelte Spur – nur in Sprechpausen.
        Davor wird der Hintergrund 0,6 s fast still (Stille macht den Schreck)."""
        n = len(self.m); a = max(0, int((t0 - 0.6) * SR)); b = min(n, int(t0 * SR))
        if b > a: k = np.linspace(1, 0.04, b - a); self.m[a:b] *= k; self.f[a:b] *= k
        rng = np.random.default_rng(13); d = 2.2; t = np.arange(int(d * SR)) / SR
        def band(x, lo, hi):
            X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
        anschlag = band(rng.standard_normal(len(t)), 2500, 12000) * np.exp(-t * 60)
        rutsch = 1 - 0.12 * (1 - np.exp(-t * 2.5)); trem = 1 + 0.35 * np.sin(2 * np.pi * 9 * t)
        streicher = sum(sum(np.sin(2 * np.pi * f0 * h * np.cumsum(rutsch) / SR) / h for h in (1, 2, 3, 5)) for f0 in (1046.5, 1108.7, 1174.7, 1244.5, 1661.2)) / 9
        streicher = streicher * trem * np.exp(-t * 1.6) * (1 - np.exp(-t * 300))
        rau = rng.standard_normal(len(t)); schrei = sum(band(rau, f - bw, f + bw) * a2 for f, bw, a2 in ((820, 120, 1.0), (1180, 150, 0.8), (2900, 300, 0.5), (3400, 350, 0.3)))
        schrei = schrei / (np.abs(schrei).max() + 1e-9) * np.exp(-t * 2.2) * (1 - np.exp(-t * 200)) * (1 + 0.25 * np.sin(2 * np.pi * 6 * t))
        metall = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (3 + i)) for i, f in enumerate((317, 529, 863, 1397, 2251))) / 5
        sub = np.sin(2 * np.pi * (55 * np.exp(-t * 1.8) + 30) * t) * np.exp(-t * 3.5)
        y = 0.55 * anschlag + 0.8 * streicher + 0.75 * schrei + 0.35 * metall + 1.0 * sub
        ir = rng.standard_normal(int(1.1 * SR)) * np.exp(-np.arange(int(1.1 * SR)) / SR * 5); hall = np.convolve(y, ir)[:len(y)] / 40
        y = y + 0.35 * hall; y = y / np.abs(y).max()
        self.add(self.js, t0, y, g)
    def kartenToene(self, zeile_frage, woerter):
        """Mitmach-Frage: leise Fläche + Ton pro Antwortkarte (woerter: Wort in der Zeile nach der Frage, je Karte)."""
        self.add(self.m, self.Z[zeile_frage] - 0.3, self.flaeche([57, 60, 64, 69], self.DAUER - self.Z[zeile_frage] + 0.5, hell=4, a=0.8, r=1.2), 0.22)
        for w in woerter: self.fx((self.wz(w, zeile_frage + 1) if w else self.Z[zeile_frage + 1]) - 0.15, self.glocke(88, 1.2), 0.08)

    # ---------- Mischung ----------
    @staticmethod
    def _lufs(x):
        """Integrierte Lautheit (EBU R128) über ffmpeg."""
        import subprocess, tempfile
        with tempfile.TemporaryDirectory() as d:
            sf.write(d + "/a.wav", x.astype(np.float32), SR)
            o = subprocess.run(["ffmpeg", "-v", "info", "-i", d + "/a.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
        return float(o.rsplit("I:", 1)[1].split("LUFS")[0])

    def mischen(self, stimme_pfad=None, ziel=None, abstand=None, musik_laut=None):
        """Stimme + Musik + Geräusche. Jonathan 23.11.: Stimme war zu leise gegenüber dem Hintergrund. Seitdem wird der
        Hintergrund (Musik + Geräusche) automatisch so gepegelt, dass die Stimme `abstand` LU (Standard 12, wie im
        Vorbild) lauter ist. In Sprechpausen kommt die Musik um bis zu 6 dB hoch, Geräusch-Spitzen bleiben unter der Stimme.
        musik_laut: alter fester Faktor (Folge 1), nur noch für alte Folgen."""
        stimme_pfad = stimme_pfad or os.environ.get("STIMME", "stimme_final.wav"); ziel = ziel or os.environ.get("MIX", "mix.wav")
        st, sr2 = sf.read(stimme_pfad, dtype="float64"); st = st.mean(1) if st.ndim > 1 else st
        assert sr2 == SR; stimme = np.zeros(self.n); stimme[:min(self.n, len(st))] = st[:self.n]
        def glatt(x, s):   # gleitender Mittelwert über s Sekunden (wie np.convolve(..., "same"), aber O(n))
            k = max(1, int(s * SR)); c = np.concatenate([[0.0], np.cumsum(x)]); a = np.arange(len(x)) - k // 2
            lo = np.clip(a, 0, len(x)); hi = np.clip(a + k, 0, len(x)); return (c[hi] - c[lo]) / k
        db = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
        if musik_laut is not None:   # altes Verhalten (Folge 1)
            hk = glatt(np.abs(stimme), 0.25); duck = 1 - 0.6 * np.clip(hk / (hk.max() * 0.25), 0, 1)
            mix = stimme + self.m * musik_laut * duck + self.f * 0.9 * (0.5 + 0.5 * duck)
        else:
            abstand = float(abstand if abstand is not None else os.environ.get("ABSTAND", 12))
            hk = glatt(np.abs(stimme), 0.3); spricht = np.clip(hk / (np.percentile(hk[hk > 1e-4], 50) * 0.5 + 1e-9), 0, 1)
            spricht = glatt(spricht, 0.35)                       # weiches Ein- und Ausblenden
            duck = 1 - 0.5 * spricht                             # −6 dB unter der Stimme, voll in Pausen
            bett = self.m * duck + self.f * (0.6 + 0.4 * duck)
            g = 10 ** ((self._lufs(stimme) - abstand - self._lufs(bett)) / 20); bett *= g
            # Geräusch-Spitzen: kurzzeitiger Pegel (0,4 s) nie über Stimme −3 dB
            w = int(0.4 * SR); ref = np.sqrt(np.mean(stimme[np.abs(stimme) > 0.02] ** 2)) * 10 ** (-3 / 20)
            kurz = np.sqrt(glatt(bett ** 2, 0.4)) + 1e-9; bett *= np.minimum(1.0, glatt(np.minimum(1.0, ref / kurz), 0.1))
            mix = stimme + bett
            print(f"   Abstand Stimme–Hintergrund: {self._lufs(stimme) - self._lufs(bett):.1f} LU (Ziel {abstand:.0f})")
        if np.abs(self.js).max() > 0:   # Jumpscare-Spur: so laut wie die Stimmspitzen, ungedeckelt
            mix = mix + self.js * (np.percentile(np.abs(stimme[np.abs(stimme) > 0.02]), 99.5) * 1.1)
        spitze = np.abs(mix).max()
        # 24.11. abends: kein weicher Begrenzer mehr (veränderte die Stimme), nur noch gleichmäßige Verstärkung
        mix *= 0.9 / np.abs(mix).max()
        sf.write(ziel, mix.astype(np.float32), SR)
        v = np.abs(stimme) > 0.02
        print(f"{ziel}: {self.DAUER:.2f} s, Stimme {db(stimme[v]):.1f} dB, Hintergrund unter Stimme {db((mix - stimme)[v]):.1f} dB")
