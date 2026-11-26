# Ton Folge 4 „Leuchten“: Musik nach Stimmung je Zeile (fester Hintergrundsound, Issue #44), Geräusche, Stimme 12 LU über dem Hintergrund (unbearbeitet, Issue #41)
# Englisch: SPRACHE=en PLAN=en/plan_final.json STIMME=en/stimme_final.wav MIX=en/mix.wav python3 tonspur.py
import sys, os, json; sys.path.insert(0, ".."); sys.path.insert(0, ".")
from tonbib import Ton, env
from zeilen import stimmungen
EN = os.environ.get("SPRACHE") == "en"
W = {"vierundvierzig": "little", "aufgegessen": "ate", "aufgemacht": "opened", "gerülpst": "burped", "drei": "three", "gegessen": "ate", "teller": "plate", "leuchten": "glow",
     "golden": "gold", "zweite": "second", "alle": "all", "lastwagen": "truck", "geklingelt": "rang", "gekichert": "giggled"}
w = lambda x: W[x] if EN else x
T = Ton()
T.musik(stimmungen)
# Fenster auf, die Schatten kommen herein (je ein leises Huschen)
T.fx(T.wz(w("aufgemacht"), 0), T.rausch(0.5, 400, 2500) * env(0.5, 0.05, 0.4), 0.05)
t0 = T.Z[1] + 0.1; t1 = T.wz(w("vierundvierzig"), 2) + 0.15; dt = (t1 - t0 - 0.8) / 43
for k in range(0, 44, 2): T.fx(t0 + k * dt + 0.3, T.piep(2400 + (k % 5) * 180, 0.05), 0.02)
T.glitzer(T.Z[2], 1.2)
# Zittern, Hunger-Knurren
T.fx(T.Z[3] + 0.2, T.brumm(1.4, 90), 0.03)
T.fx(T.Z[4] + 0.5, T.knurren(1.2), 0.07)
# 06:00 Wecker piept, dann Mampf
for i in range(3): T.fx(T.Z[5] + 0.1 + i * 0.25, T.piep(1800, 0.1), 0.05)
T.fx(T.wz(w("aufgegessen"), 5), T.boom(0.4), 0.06)
# 07:00 Kühlschrank auf (Brummen + Klick), Rülpser
T.fx(T.Z[6] + 0.9, T.klick(0.8), 0.25); T.fx(T.Z[6] + 0.95, T.brumm(2.2, 60), 0.04)
T.fx(T.wz(w("gerülpst"), 7), T.knurren(0.45, 1.6), 0.12)
# 08:00 Helm
T.fx(T.wz(w("drei"), 8), T.piep(2600, 0.06), 0.03); T.fx(T.wz(w("drei"), 8) + 0.12, T.piep(2900, 0.06), 0.03); T.fx(T.wz(w("drei"), 8) + 0.24, T.piep(3200, 0.06), 0.03)
# Kuchen weg, Teller weg
T.fx(T.wz(w("gegessen"), 9), T.boom(0.35), 0.05); T.fx(T.wz(w("teller"), 9), T.glocke(84, 0.5), 0.04)
# Riese im Fernsehen
T.fx(T.Z[12] + 0.1, T.knurren(1.6), 0.06)
# Leuchten bei Oma
T.glitzer(T.Z[13] + 1.0, 1.2)
# Party
T.jubel(T.Z[14] + 0.6, 1.4)
T.fx(T.wz(w("gekichert"), 16), T.piep(3000, 0.05), 0.02); T.fx(T.wz(w("gekichert"), 16) + 0.1, T.piep(3400, 0.05), 0.02)
# Goldenes Leuchten: einer, zwei, alle
T.fx(T.wz(w("golden"), 17), T.glocke(88, 1.2), 0.06); T.glitzer(T.wz(w("golden"), 17), 1.2)
T.fx(T.wz(w("zweite"), 18), T.glocke(91, 1.0), 0.06)
T.fx(T.wz(w("alle"), 18), T.sweep(300, 1400, 1.2), 0.06); T.glitzer(T.wz(w("alle"), 18), 2.0, dichte=14)
T.fx(T.Z[19] + 0.1, T.sweep(120, 700, 1.6), 0.07)
# Lastwagen kommt und hält, Schriftzug, Klingel
T.fx(T.Z[20], T.brumm(2.8, 45), 0.12); T.fx(T.wz(w("lastwagen"), 20) + 0.3, T.zisch(0.5), 0.05)
T.fx(T.Z[21] + 0.1, T.boom(1.2), 0.10)
T.fx(T.wz(w("geklingelt"), 22) - 0.1, T.glocke(76, 0.9), 0.08); T.fx(T.wz(w("geklingelt"), 22) + 0.35, T.glocke(72, 1.2), 0.08)
T.kartenToene(23, ["door", "roof", "open"] if EN else ["tür", "dach", "aufmachen"])
T.mischen()
