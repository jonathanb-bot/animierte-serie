# Englische Fassung (SPRACHE=en VERSUCHE=2 python3 stimme_en.py): Puck, unbearbeitet (Issue #41) → en/
# Ohne A/B/C-Frage (Issue #45): endet mit Zeile 20, eine Fassung für alle Plattformen (≤ 89 s).
import sys, json, os; sys.path.insert(0, ".."); os.makedirs("en", exist_ok=True)
from stimme import erzeugen, zusammen
zeilen = json.load(open("zeilen_en.json"))
EXTRA = {1: 0.3, 2: 0.2, 6: 0.3, 10: 0.3, 11: 0.35, 12: 0.3, 13: 0.35, 14: 0.45, 15: 0.3, 16: 0.25, 17: 0.4, 18: 0.4, 19: 0.4, 20: 0.45}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, "en", gruppe=5)
zusammen("en", extra=EXTRA)
