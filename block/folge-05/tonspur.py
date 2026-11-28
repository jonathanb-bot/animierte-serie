# Ton „Akku“: fester Hintergrundsound (Issue #44), Stimme unbearbeitet (Issue #41).
# Geräusche: Akku-leer-Piepen + Abschalt-Ton beim Einschlafen, Schnarchen, Lade-Ton bei Papa, Pling bei 100 %, Spiel-Blips (Minecraft),
# Schritte beim Rennen, leises Funkeln beim Lichtfaden, absteigende Töne bei 90/70/50.
# Englisch: SPRACHE=en PLAN=en/plan_final.json STIMME=en/stimme_final.wav MIX=en/mix.wav python3 tonspur.py
import sys, os; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np
from tonbib import Ton, env, SR
from zeilen import stimmungen
EN = os.environ.get("SPRACHE") == "en"
W = {"sofort": "instantly", "satz": "sentence", "null": "zero", "hundert": "hundred", "ein": "one", "setzte": "sat",
     "neunzig": "ninety", "siebzig": "seventy", "fünfzig": "fifty", "hand": "hand", "suppe": "soup", "sofa": "couch", "licht": "light"}
T = Ton()
_wz = T.wz; T.wz = lambda wort, zeile, *a, **k: _wz(W.get(wort, wort) if EN else wort, zeile, *a, **k)
T.musik(stimmungen[:len(T.Z)])

def leer_piep(t, g=0.05):      # zwei kurze tiefe Warn-Piepser (Akku fast leer)
    for i in range(2): T.fx(t + i * 0.18, T.piep(880, 0.09), g)
def aus(t, g=0.06):            # Abschalt-Ton: fallender Ton
    T.fx(t, T.sweep(520, 140, 0.55) * env(0.55, 0.01, 0.3), g)
def schnarch(t0, d, g=0.05):    # weiches Schnarchen: gefiltertes Rauschen, langsam an- und abschwellend
    n = int(d * SR); tt = np.arange(n) / SR; y = T.rausch(d, 90, 700) * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 1.6 - np.pi / 2)) ** 2
    T.fx(t0, y * env(d, 0.2, 0.3), g)
def pling(t, g=0.07): T.fx(t, T.glocke(96, 1.0), g); T.fx(t + 0.09, T.glocke(103, 0.9), g * 0.7)

# 1 Mann auf der Bank: Piepen, Abschalten, Schnarchen
ts = T.wz("sofort", 1); leer_piep(ts - 0.75); aus(ts - 0.05); schnarch(ts + 0.6, T.E[1] - ts + 0.2, 0.035)
# 2–3 Lehrer: Piepen bei 2 %, Abschalten mitten im Satz, Kreide-Klick
leer_piep(T.Z[2] + 0.6, 0.04); aus(T.Z[3] + 0.25); T.fx(T.Z[3] + 0.5, T.klick(0.8), 0.06); schnarch(T.Z[3] + 1.0, T.E[3] - T.Z[3] - 0.6, 0.03)
# 4–5 Oma: Löffel-Klirren, 0 %, Abschalten, Schnarchen über der Suppe
T.fx(T.Z[4] + 0.3, T.glocke(100, 0.4), 0.025); tn = T.wz("null", 4); leer_piep(tn - 0.4, 0.04); aus(tn + 0.15)
schnarch(T.Z[5] - 0.1, T.E[5] - T.Z[5] + 0.4, 0.05)
# 6 Papa lädt: Lade-Ton (aufsteigend) + leises Summen
T.fx(T.Z[6] + 0.25, T.sweep(300, 900, 0.5) * env(0.5, 0.02, 0.2), 0.04); T.fx(T.Z[6] + 0.3, T.brumm(T.E[6] - T.Z[6], 100) * env(T.E[6] - T.Z[6], 0.3, 0.4), 0.01)
# 8 100 %: Pling; 10 Minecraft: Spiel-Blips, Pling bei „hundert“; 11 Schritte beim Rennen, Pling
pling(T.wz("hundert", 8))
for i in range(6): T.fx(T.Z[10] + 0.2 + i * 0.28, T.piep(660 + 220 * (i % 3), 0.05), 0.025)
pling(T.wz("hundert", 10)); T.schritte(T.Z[11], T.E[11] - T.Z[11], abst=0.16, g=0.05); pling(T.wz("hundert", 11))
# 12–22 Kinderzimmer: Wecker-Ticken leise, Schritte von Mama, Funkeln beim Lichtfaden, Abschalten bei Mama, absteigende Töne
T.uhr(T.Z[12], T.E[12] - T.Z[12] + 0.4, g=0.03); T.schritte(T.Z[13] + 0.1, T.wz("setzte", 13) - T.Z[13] - 0.2, abst=0.42, g=0.035)
T.glitzer(T.Z[15] + 0.4, T.E[15] - T.Z[15], dichte=5, g=0.02); T.glitzer(T.Z[16], T.E[17] - T.Z[16], dichte=3, g=0.012)
tn = T.wz("null", 18); leer_piep(tn - 0.45, 0.035); aus(tn + 0.1, 0.05)
for w, m in (("neunzig", 88), ("siebzig", 84), ("fünfzig", 79)): T.fx(T.wz(w, 20), T.glocke(m, 1.2), 0.05)
T.glitzer(T.Z[20], T.E[20] - T.Z[20], dichte=4, g=0.015)
T.mischen()
