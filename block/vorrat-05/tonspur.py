# Ton „Grill-Rakete“: Pusten, Schnarchen, Knopf + Zündung, Raketen-Rauschen, Wind, Flugzeug, Stottern, Fall, Handy, Roller, Trampolin, Sterne
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
import numpy as np
from tonbib import Ton, env
from zeilen import stimmungen
T = Ton()
T.musik(stimmungen)
pling = lambda t, g=0.06: (T.fx(t, T.glocke(100, 1.0), g), T.fx(t + 0.09, T.glocke(105, 0.9), g * 0.7))
T.fx(T.Z[0] + 0.2, T.rausch(0.9, 300, 2500) * env(0.9, 0.05, 0.6), 0.03)                       # Rakete wird weggetragen
for i in range(3): T.fx(T.Z[1] + 0.3 + i * 0.7, T.rausch(0.5, 400, 3000) * env(0.5, 0.05, 0.3), 0.05)   # Papa pustet
for i in range(2): T.fx(T.wz("geschlafen", 3) - 0.3 + i * 1.1, T.brumm(0.7, 70) * env(0.7, 0.2, 0.3), 0.05)   # Wachmann schnarcht
T.fx(T.wz("knopf", 5), T.klick(1.0), 0.12)
t_z = T.Z[6]; T.fx(t_z, T.boom(2.5), 0.22); T.fx(t_z, T.rausch(4.0, 60, 900) * env(4.0, 0.05, 1.5), 0.12)   # Zündung + Raketen-Rauschen
T.fx(T.Z[7], T.rausch(T.E[8] - T.Z[7] + 0.5, 300, 4000) * env(T.E[8] - T.Z[7] + 0.5, 0.3, 0.6), 0.05)   # Wind über den Wolken
T.fx(T.wz("pilot", 8) - 0.3, T.brumm(1.6, 95) * env(1.6, 0.4, 0.8), 0.04)                    # Flugzeug
for i in range(4): T.fx(T.wz("leer", 9) - 0.6 + i * 0.16, T.klick(0.7), 0.08)                     # Triebwerk stottert
T.fx(T.Z[10], T.sweep(900, 250, T.E[10] - T.Z[10] + 0.3) * env(T.E[10] - T.Z[10] + 0.3, 0.05, 0.3), 0.04)   # Fallen
T.fx(T.Z[10], T.rausch(T.E[11] - T.Z[10], 200, 3000) * env(T.E[11] - T.Z[10], 0.2, 0.4), 0.05)
for i in range(3): T.fx(T.wz("bestellt", 12) - 0.5 + i * 0.15, T.piep(1800, 0.05), 0.03)       # Handy tippen
pling(T.wz("bestellt", 12) + 0.1)
T.fx(T.Z[13], T.brumm(T.E[13] - T.Z[13] + 0.3, 130) * env(T.E[13] - T.Z[13] + 0.3, 0.2, 0.4), 0.05)   # Roller
t_b = T.wz("draufgeknallt", 15); boing = np.concatenate([T.sweep(160, 420, 0.25), T.sweep(420, 180, 0.35)]); T.fx(t_b, boing * env(0.6, 0.01, 0.3), 0.12)
for i in range(5): pling(T.wz("sterne", 17) + i * 0.16, 0.035)                                      # fünf Sterne
T.mischen()
