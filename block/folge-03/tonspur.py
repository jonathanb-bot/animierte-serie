# Ton Folge 3 „Mama“: Musik nach Stimmung je Zeile, Geräusche, Mischung mit Stimme 12 LU über dem Hintergrund (Stimme unbearbeitet, Issue #41)
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
from tonbib import Ton, env
from zeilen import stimmungen
T = Ton()
T.musik(stimmungen)
# Losrennen durch die Einkaufsstraße, Krümel piepst
T.schritte(T.Z[0], T.E[1] - T.Z[0])
for i in range(2): T.fx(T.wz("gepiepst", 1) + i * 0.15, T.piep(2600 + i * 250, 0.07), 0.035)
# Polizei, Großbildschirm, Fahndung
T.fx(T.Z[2] + 0.1, T.sirene(2.6), 0.08)
T.fx(T.Z[3] + 0.2, T.brumm(1.2), 0.06)
T.fx(T.wz("gesucht", 4), T.boom(1.0), 0.12)
for i in range(9): T.fx(T.wz("zehntausend", 4) + i * 0.09, T.klick(0.5), 0.4)
T.fx(T.wz("zehntausend", 4) + 0.85, T.glocke(96, 0.9), 0.07)
# Handy klingelt
for i in range(3): T.fx(T.Z[5] + i * 0.32, T.piep(1320, 0.14), 0.06); T.fx(T.Z[5] + 0.16 + i * 0.32, T.piep(1760, 0.12), 0.05)
# Werkstattwagen, Fahrt, Schranke
T.fx(T.Z[7], T.brumm(2.6), 0.10)
T.fx(T.Z[8], T.rausch(3.0, 80, 600) * env(3.0, 0.4, 0.8), 0.06)
T.fx(T.wz("tor", 9) - 0.9, T.klick(1.0), 0.3); T.fx(T.wz("tor", 9) - 0.8, T.sweep(300, 700, 0.6), 0.04)
# Oben: Wind, riesiges Auge
T.fx(T.Z[10], T.rausch(3.2, 200, 1400) * env(3.2, 0.6, 1.0), 0.05)
T.fx(T.wz("auge", 11), T.knurren(2.0), 0.10); T.fx(T.wz("riesiges", 11), T.boom(1.8), 0.14)
T.glitzer(T.Z[14] + 0.2, 2.2)
T.fx(T.wz("zugemacht", 15), T.sweep(600, 200, 1.4), 0.04)
# Licht geht an: Welle von Klicks, dann Jubel
ta = T.Z[16] + 0.35
T.fx(ta, T.sweep(80, 900, 1.2), 0.12)
for i in range(10): T.fx(ta + 0.1 + i * 0.08, T.klick(0.35))
for i in range(8): T.fx(T.Z[17] + 0.5 + i * 0.12, T.klick(0.3))
T.jubel(T.Z[18], T.E[18] - T.Z[18] + 0.6)
# Zu Hause: Klopfen am Fenster, viele Schatten
for i in range(3): T.fx(T.wz("geklopft", 21) + i * 0.17, T.klick(0.9), 0.3)
T.fx(T.Z[22] + 0.1, T.knurren(1.4), 0.05)
T.fx(T.wz("zettel", 23), T.rausch(0.25, 1500, 5000) * env(0.25, 0.01, 0.2), 0.04)
T.kartenToene(24, ["reinlassen", "oma", "fenster"])
T.mischen()
