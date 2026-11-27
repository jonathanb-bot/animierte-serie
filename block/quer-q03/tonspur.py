# Ton q03 „100 Wörter am Tag“: Musik nach Stimmung je Zeile (fester Hintergrundsound, Issue #44), Geräusche, Stimme 12 LU darüber (unbearbeitet, Issue #41)
# Englisch: SPRACHE=en … (lang.py setzt PLAN/STIMME/MIX). Englische Stichwörter beim Freitag-Teil in W eintragen.
import sys, os; sys.path.insert(0, ".."); sys.path.insert(0, ".")
from tonbib import Ton
from zeilen import stimmungen
EN = os.environ.get("SPRACHE") == "en"
W = {}
w = lambda x, i: W.get(f"{i}:{x}", W.get(x, x)) if EN else x
T = Ton()
T.musik(stimmungen)
Z = T.Z
def sicher(f):
    try: f()
    except Exception as e: print("Geräusch übersprungen:", e)
# Hook: Zahlen-Pling, Null-Ton
T.glitzer(Z[0] + 0.3, 1.0)
T.fx(Z[2] + 0.2, T.piep(400, 0.25), 0.03)
# 6:00 Wecker
for i in range(4): T.fx(Z[6] + 0.3 + i * 0.28, T.piep(1800, 0.1), 0.05)
# Bello bellt (Küche)
for i in range(4): T.fx(Z[12] + 0.6 + i * 0.7, T.knurren(0.22, 1.8), 0.07)
# Bushaltestelle: Handy-Ton, Schulbus
T.fx(Z[20] + 0.6, T.piep(2600, 0.08), 0.03); T.fx(Z[20] + 0.75, T.piep(3100, 0.08), 0.03)
T.fx(Z[26] + 0.05, T.boom(0.6), 0.05)
T.fx(Z[28] + 0.3, T.brumm(2.6, 48), 0.06)
# Schule: Rückblick laut (Hupen, Menge), Megafon, Vögel
T.fx(Z[33] + 0.2, T.brumm(2.6, 70), 0.05); T.jubel(Z[34] + 0.1, 2.6)
for i in range(3): T.fx(Z[34] + 0.4 + i * 0.9, T.sirene(0.35), 0.025)
T.voegel(Z[36], 3.5)
# Eiffelturm: Glitzern, Lachen der Klasse, Kreide
T.glitzer(Z[42] + 0.6, 1.4); T.jubel(Z[43] + 0.1, 1.6)
sicher(lambda: T.fx(T.wz(w("eins", 44), 44), T.klick(0.6), 0.2))
# Wörtermarkt: Wörter wandern (Pling)
for i in range(5): T.fx(Z[48] + 0.6 + i * 0.35, T.piep(2200 + i * 200, 0.06), 0.025)
# Bild malen, TV an
T.fx(Z[62] + 0.1, T.zisch(0.25), 0.03)
# Kiosk: Spannung beim Handschlag
T.fx(Z[78] + 0.2, T.brumm(2.2, 55), 0.04)
# 18:00 Nachrichten-Jingle
T.fx(Z[81] + 0.2, T.glocke(76, 0.6), 0.05); T.fx(Z[81] + 0.5, T.glocke(81, 0.6), 0.05); T.fx(Z[81] + 0.8, T.glocke(84, 0.9), 0.05)
# Ball, Bus, Bremsen, Bellen
T.fx(Z[89] + 1.6, T.klick(0.5), 0.08); T.fx(Z[89] + 2.0, T.klick(0.4), 0.05)
T.fx(Z[92] + 0.3, T.brumm(5.0, 42), 0.10)
for i in range(3): T.fx(Z[93] + 0.4 + i * 0.6, T.knurren(0.22, 1.8), 0.07)
T.fx(Z[97] + 0.1, T.zisch(1.4), 0.10); T.fx(Z[97] + 0.2, T.brumm(2.4, 40), 0.06)
# Nacht: Wecker stellen, Schnarchen, Wecker 23:45
T.fx(Z[104] + 0.4, T.piep(2000, 0.06), 0.03); T.fx(Z[104] + 0.7, T.piep(2000, 0.06), 0.03)
for i in range(3): T.fx(Z[116] + 0.2 + i * 1.1, T.knurren(0.7, 0.6), 0.04)
for i in range(3): T.fx(Z[117] + 0.2 + i * 1.1, T.knurren(0.7, 0.6), 0.04)
for i in range(4): T.fx(Z[119] + 0.3 + i * 0.28, T.piep(1800, 0.1), 0.05)
# 23:59 Tür, Glitzern bei „Auch“, Kirchturm schlägt zwölf, Zahlen springen auf 100
T.fx(Z[120] + 0.6, T.rausch(1.6, 200, 900), 0.02)
T.glitzer(Z[129] + 0.2, 1.4)
for i in range(6): T.fx(Z[132] + 0.2 + i * 0.55, T.glocke(52, 2.2), 0.07)
T.fx(Z[133] + 0.2, T.sweep(300, 1200, 0.9), 0.04); T.glitzer(Z[133] + 0.4, 1.6, dichte=12)
T.mischen()
