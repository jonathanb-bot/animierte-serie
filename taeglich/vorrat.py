"""Wie viele Tage reichen die schon eingeplanten Posts noch? Entscheidet, ob heute Nacht produziert wird.

    python taeglich/vorrat.py          # Ausgabe + letzte Zeile PRODUZIEREN oder AUSSETZEN

Jonathans Vorgabe (1.11.): normalerweise alle 2 Tage eine Staffel; reicht der Vorrat nicht, jeden Tag produzieren.
Regel: PRODUZIEREN, wenn gestern keine Staffel fertig wurde ODER der TikTok-Vorrat unter 3 Tagen liegt.
"""
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
PRO_TAG = {"tiktok": 4, "instagram": 12, "youtube": 12}  # Issue #14: Instagram/YouTube alle 2 Stunden
MIN_TAGE = 3.0

subprocess.run(["git", "fetch", "-q", "origin", "main"], cwd=ROOT)
plan = json.loads(subprocess.run(["git", "show", "origin/main:posten/plan.json"], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
jetzt = dt.datetime.now(ZoneInfo("Europe/Berlin")).replace(tzinfo=None)
loeschen = set(plan.get("loeschen") or [])
tage = {}
for plat, n in PRO_TAG.items():
    zeiten = sorted(dt.datetime.fromisoformat(p["zeit"]) for p in plan["posts"] if p["platform"] == plat and p["id"] not in loeschen)
    zukunft = [z for z in zeiten if z > jetzt]
    ende = zukunft[-1] if zukunft else jetzt
    tage[plat] = (ende - jetzt).total_seconds() / 86400
    print(f"{plat:10s} {len(zukunft):3d} Posts geplant, letzter {ende:%d.%m. %H:%M} → Vorrat {tage[plat]:.1f} Tage")

staffeln = json.loads((ROOT / "taeglich" / "staffeln.json").read_text()).get("staffeln", [])
# Nachtdatum: Läufe bis 6 Uhr früh zählen zur Nacht davor (z. B. Start 00:44 am 2.11. = Nacht vom 1.11.)
nacht = (jetzt - dt.timedelta(hours=6)).date()
gestern = (nacht - dt.timedelta(days=1)).isoformat()
gestern_fertig = any(str(s.get("datum", "")).startswith(gestern) and s.get("veroeffentlicht") for s in staffeln)
if not gestern_fertig:
    print("Gestern wurde keine Staffel fertig → PRODUZIEREN"); print("PRODUZIEREN"); sys.exit(0)
if tage["tiktok"] < MIN_TAGE:
    print(f"TikTok-Vorrat unter {MIN_TAGE:.0f} Tagen → PRODUZIEREN"); print("PRODUZIEREN"); sys.exit(0)
print("Gestern produziert und Vorrat reicht → AUSSETZEN"); print("AUSSETZEN")
