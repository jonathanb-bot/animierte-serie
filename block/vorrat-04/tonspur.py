# Ton „Lügen-Geld“: Musik nach Stimmung, Kassen-Pling bei jedem +100, tiefer Ton bei −500, Klopfen an der Tür, Karten-Töne
# Englisch (27.11., ohne A/B/C-Frage): SPRACHE=en PLAN=en/plan_final.json STIMME=en/stimme_final.wav MIX=en/mix.wav python3 tonspur.py
import sys, os; sys.path.insert(0, ".."); sys.path.insert(0, ".")
from tonbib import Ton, env
from zeilen import stimmungen
EN = os.environ.get("SPRACHE") == "en"
W = {"hundert": "hundred", "fünfhundert": "five", "zehntausend": "ten", "koffer": "suitcase"}
T = Ton()
_wz = T.wz; T.wz = lambda wort, zeile, *a, **k: _wz(W.get(wort, wort) if EN else wort, zeile, *a, **k)
T.musik(stimmungen[:len(T.Z)])
kasse = lambda t, g=0.08: (T.fx(t, T.klick(0.5), g * 0.6), T.fx(t + 0.03, T.glocke(100, 1.0), g), T.fx(t + 0.12, T.glocke(105, 0.9), g * 0.7))
minus = lambda t, g=0.07: T.fx(t, T.sweep(220, 110, 0.7) * env(0.7, 0.01, 0.4), g)
kasse(T.wz("hundert", 0), 0.06)
minus(T.wz("fünfhundert", 1), 0.05)
for i in range(6): kasse(T.Z[2] + 0.4 + i * 0.3, 0.03)          # Zahlen fliegen über den Platz
for z in (3, 4, 5, 8, 9): kasse(T.wz("hundert", z))
minus(T.wz("fünfhundert", 10))
T.glitzer(T.wz("zehntausend", 11) - 0.2, 1.4); kasse(T.wz("zehntausend", 11), 0.1)
for t in (T.wz("koffer", 15) - 0.6, T.wz("koffer", 15) - 0.35, T.wz("koffer", 15) - 0.1): T.fx(t, T.klick(0.9) + 0.4 * T.puls(45, 0.12)[:len(T.klick(0.9))], 0.12)   # Klopfen
# die zwei Lügen des besten Freundes: Pling, aber tiefer und leiser (unheimlich)
for z in (18, 19): t = T.wz("hundert", z); T.fx(t, T.glocke(76, 1.6), 0.06); T.fx(t + 0.1, T.glocke(77, 1.4), 0.04)
if len(T.Z) > 21: T.kartenToene(21, ["festhalten", "folgen", "anrufen"])
T.mischen()
