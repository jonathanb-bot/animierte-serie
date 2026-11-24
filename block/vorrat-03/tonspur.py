# Ton „Das leere Glas“: leise, warme Musik nach Stimmung, Stern-Glitzern, Husten, Schulgong, Herzmonitor; Stimme 12 LU über dem Hintergrund
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
from tonbib import Ton, env
from zeilen import stimmungen
T = Ton()
T.musik(stimmungen)
pling = lambda t, g=0.07: (T.fx(t, T.glocke(100, 1.2), g), T.fx(t + 0.09, T.glocke(105, 1.0), g * 0.7))
# Sterne: Glitzern beim Aufsteigen und Plopp beim Landen im Glas
T.glitzer(T.wz("stern", 0) - 0.4, 1.0); pling(T.wz("stern", 0))
T.glitzer(T.Z[1], T.E[1] - T.Z[1] - 0.3); pling(T.E[1] - 0.35, 0.09)
pling(T.wz("zweihundert", 2), 0.05); pling(T.wz("fünfzig", 3), 0.05); pling(T.wz("zwölf", 4), 0.05)
T.voegel(T.Z[0], T.E[4] - T.Z[0], ) if hasattr(T, "voegel") else None
# Hausmeister fegt (leises Wischen), leeres Glas: tiefer Ton
for t in [T.Z[5] + 0.3 + i * 0.66 for i in range(8)]: T.fx(t, T.rausch(0.35, 800, 3000) * env(0.35, 0.05, 0.25), 0.025)
T.fx(T.wz("leer", 6), T.sweep(330, 220, 0.6), 0.04)
T.jubel(T.Z[7] + 0.4, 1.4) if False else None
# Husten
for t in [T.wz("gehustet", 11) - 0.1, T.wz("gehustet", 11) + 0.35]: T.fx(t, T.rausch(0.22, 300, 1800) * env(0.22, 0.01, 0.18), 0.09)
# Schulgong, Kreide
T.fx(T.Z[12] + 0.05, T.glocke(84, 1.6), 0.05)
T.schritte(T.Z[14] + 0.4, T.E[14] - T.Z[14] + 0.3, 0.45, 0.05)
T.schritte(T.wz("nur", 16) - 0.1, T.E[16] - T.wz("nur", 16) + 0.4, 0.2, 0.07)
# Krankenhaus: Herzmonitor piept ruhig
for zeilen in ([17], [22, 23, 24]):
    t0 = T.Z[zeilen[0]]; t1 = T.E[zeilen[-1]] + (1.6 if zeilen[-1] == 24 else 0.2); t = t0 + 0.2
    while t < t1: T.fx(t, T.piep(1250, 0.07), 0.02); t += 1.0
# Rückblick und Nacht: Sterne fliegen zu den Fenstern
T.fx(T.wz("repariert", 18), T.klick(0.6))
for i in range(4): pling(T.Z[19] + 1.6 + i * 0.75, 0.04)
T.glitzer(T.Z[20], T.E[20] - T.Z[20]); pling(T.E[20] - 0.5, 0.05)
T.glitzer(T.Z[21] - 0.1, 1.2, 4, 0.02)
T.kartenToene(22, ["entschuldigung", "danke", "sterne"])
T.mischen()
