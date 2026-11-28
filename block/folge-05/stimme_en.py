# Englische Fassung (SPRACHE=en VERSUCHE=2 python3 stimme_en.py): Puck, unbearbeitet (Issue #41) → en/
import sys, json, os; sys.path.insert(0, ".."); os.makedirs("en", exist_ok=True)
from stimme import erzeugen, zusammen
zeilen = json.load(open("zeilen_en.json"))
EXTRA = {1: 0.3, 3: 0.2, 5: 0.25, 6: 0.3, 7: 0.3, 9: 0.35, 11: 0.4, 12: 0.4, 13: 0.3, 14: 0.45, 15: 0.4, 16: 0.4, 17: 0.45, 18: 0.4, 19: 0.45, 20: 0.4, 21: 0.45}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, "en", gruppe=5)
zusammen("en", extra=EXTRA)
