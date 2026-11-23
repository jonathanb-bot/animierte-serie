# Ton „Die Lügen-Zahl“: Musik nach Stimmung je Zeile, Geräusche, Mischung mit Stimme 12 LU über dem Hintergrund
import sys; sys.path.insert(0, ".."); sys.path.insert(0, ".")
from tonbib import Ton
from zeilen import stimmungen
T = Ton()
T.musik(stimmungen)
ding = lambda t, g=0.07: (T.fx(t, T.glocke(91, 1.0), g), T.fx(t + 0.08, T.glocke(96, 0.8), g * 0.6))
# Platz am Abend: leises Gemurmel der Menge
for a, b in [(0, T.E[1] + 0.2), (T.Z[13] - 0.3, T.DAUER)]: T.fx(a, T.rausch(b - a, 250, 1800) * __import__("tonbib").env(b - a, 0.6, 0.8), 0.025)
ding(T.wz("gelogen", 1)); ding(T.wz("super", 3) - 0.2); ding(T.wz("sechzig", 4))
t0 = T.wz("tausend", 5) - 0.6
for i in range(10): T.fx(t0 + i * 0.09, T.klick(0.4))                    # Zähler rattert hoch
T.fx(T.Z[9] + 0.1, T.glocke(84, 1.6), 0.05)                                # Schulgong
T.voegel(T.Z[11], T.E[11] - T.Z[11])
T.fx(T.wz("nein", 10), T.sweep(600, 300, 0.4), 0.05)                       # Omas enttäuschtes „Oh“
# Alle Zahlen +1: viele Dings gleichzeitig, Raunen
tp = T.wz("plötzlich", 16) + 0.35
for i in range(14): ding(tp + (i % 7) * 0.03, 0.03)
T.fx(tp + 0.1, T.rausch(1.6, 300, 2500) * __import__("tonbib").env(1.6, 0.2, 1.0), 0.06)
# Das Klicken über meinem Kopf, dann tiefer Ton bei der Eins
T.fx(T.wz("klicken", 18), T.klick(1.0), 0.6); T.fx(T.wz("klicken", 18) + 0.05, T.piep(1400, 0.06), 0.05)
T.fx(T.wz("eins", 20), T.boom(2.0), 0.35); T.fx(T.wz("eins", 20), T.klavier(45, 3.0) + T.klavier(46, 3.0), 0.3)
T.kartenToene(21, ["papa", "bürgermeister", "lüge"])
T.mischen()
