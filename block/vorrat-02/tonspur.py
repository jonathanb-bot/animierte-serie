# Ton „Geld fürs Schlafen“: Musik nach Stimmung je Zeile, Geräusche, Mischung mit Stimme 12 LU über dem Hintergrund
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np
from tonbib import Ton, env
from zeilen import stimmungen
T = Ton()
T.musik(stimmungen)
kasse = lambda t, g=0.08: (T.fx(t, T.glocke(96, 0.9), g), T.fx(t + 0.07, T.glocke(100, 0.7), g * 0.7), T.fx(t, T.klick(0.8), 1))
def schnarch(t0, d, g=0.05):
    t = t0
    while t < t0 + d: T.fx(t, T.rausch(0.7, 120, 700) * env(0.7, 0.25, 0.35), g); t += 1.5
# Geld-Momente
for i in range(6): T.fx(0.4 + i * 0.35, T.rausch(0.2, 2000, 6000) * env(0.2, 0.01, 0.15), 0.03)   # Scheine flattern
kasse(T.wz("zehn", 1)); kasse(T.wz("hundert", 2)); kasse(T.wz("hundert", 9))
tm = T.wz("millionär", 3)
for i in range(12): T.fx(T.Z[3] + 0.6 + i * (tm - T.Z[3] - 0.6) / 12, T.klick(0.5))               # Zähler rattert
kasse(tm, 0.12); T.jubel(tm + 0.1, 1.6)
schnarch(T.Z[0], T.E[0] - T.Z[0]); schnarch(T.Z[1], T.E[1] - T.Z[1]); schnarch(T.Z[5], T.E[5] - T.Z[5], 0.04); schnarch(T.Z[9], T.E[9] - T.Z[9])
T.voegel(T.Z[4] + 0.5, T.E[5] - T.Z[4] - 0.5)
# Nacht: Wecker tickt, Schäfchen-Zähler klickt
T.uhr(T.Z[7], T.E[8] - T.Z[7], 0.05)
for i in range(18): T.fx(T.wz("schäfchen", 8) + i * 0.2, T.piep(1800 + i * 40, 0.04), 0.02)
schnarch(T.wz("schnarchte", 11), T.E[11] - T.wz("schnarchte", 11) + 0.4, 0.06); schnarch(T.Z[13], T.E[13] - T.Z[13], 0.05)
# rote Null: tiefer „Wah-wah“-Ton
for t in [T.wz("zehntausend", 8) + 0.5, T.wz("hellwach", 11), T.wz("nicht", 13), T.wz("null", 15)]: T.fx(t, T.sweep(420, 260, 0.5), 0.05)
T.fx(T.Z[12] + 0.1, T.glocke(84, 1.6), 0.05)                                                        # Schulgong
for i in range(4): T.fx(T.Z[15] + 0.3 + i * 0.6, T.piep(1200, 0.08), 0.04)                          # Scanner piept
# Nachricht: Handy-Ton, dann Stromausfall
T.fx(T.Z[18] + 0.3, T.glocke(88, 0.6), 0.08); T.fx(T.Z[18] + 0.45, T.glocke(93, 0.8), 0.08)
ta = T.wz("moment", 20) + 0.3
T.fx(ta, T.sweep(500, 40, 1.6), 0.25)
for i in range(10): T.fx(ta + 0.4 + i * 0.3, T.klick(0.25))
T.kartenToene(21, ["papa", "rausgehen", "bürgermeister"])
T.mischen()
