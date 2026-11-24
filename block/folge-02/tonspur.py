# Ton Folge 2 „Krümel“: Musik nach Stimmung je Zeile, Geräusche, Mischung mit Stimme 12 LU über dem Hintergrund
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
from tonbib import Ton, env
from zeilen import stimmungen
T = Ton()
T.musik(stimmungen)
# Lichtschalter, kleines Zittern, Lampe aus
T.fx(T.wz("angemacht", 0), T.klick(1.0), 1); T.fx(T.wz("angemacht", 0) + 0.02, T.zisch(0.15), 0.03)
for i in range(6): T.fx(T.Z[2] + 0.4 + i * 0.35, T.rausch(0.12, 300, 1200) * env(0.12, 0.01, 0.08), 0.03)
T.fx(T.wz("ausgemacht", 4), T.klick(1.0), 1); T.glitzer(T.wz("lichterkette", 4), 1.6)
T.fx(T.wz("krümel", 6), T.glocke(88, 1.2), 0.05)
T.schritte(T.Z[7], T.E[7] - T.Z[7])
# Brötchen weg, Papa sucht (Uhr), Tafel, Lehrer schreibt
T.fx(T.wz("angeknabbert", 8), T.rausch(0.3, 800, 3000) * env(0.3, 0.01, 0.2), 0.05); T.fx(T.wz("weg", 8), T.sweep(900, 300, 0.35), 0.05)
T.uhr(T.Z[9], T.E[9] - T.Z[9], 0.05)
T.fx(T.Z[10] + 0.1, T.glocke(84, 1.6), 0.05)
for i in range(8): T.fx(T.wz("tafel", 10) + i * 0.16, T.rausch(0.1, 1500, 5000) * env(0.1, 0.01, 0.08), 0.025)
for i in range(10): T.fx(T.Z[11] + i * 0.2, T.rausch(0.08, 2500, 7000) * env(0.08, 0.005, 0.06), 0.03)
# Meldung + Zähler
T.fx(T.Z[13] + 0.1, T.piep(1400, 0.12), 0.05); T.fx(T.Z[13] + 0.3, T.piep(1400, 0.12), 0.05)
for i in range(10): T.fx(T.Z[14] + i * 0.12, T.klick(0.5))
T.fx(T.wz("euro", 14) + 0.3, T.glocke(96, 0.9), 0.08)
# Nacht: Stromausfall, Riese, Polizei
ta = T.wz("viertel", 18) - 0.6
T.fx(ta, T.sweep(500, 40, 1.6), 0.22)
for i in range(8): T.fx(ta + 0.4 + i * 0.3, T.klick(0.25))
T.fx(T.wz("öffneten", 19), T.boom(2.5), 0.25); T.fx(T.wz("öffneten", 19), T.knurren(2.0), 0.15)
T.fx(T.wz("größer", 20), T.brumm(2.5), 0.12)
for i in range(3): T.fx(T.wz("gepiepst", 21, ende=True) + 0.05 + i * 0.16, T.piep(2600 + i * 200, 0.08), 0.04)
T.fx(T.Z[22] + 0.2, T.sirene(2.8), 0.12)
T.kartenToene(23, ["mama", "verstecken", "papa"])
T.mischen()
