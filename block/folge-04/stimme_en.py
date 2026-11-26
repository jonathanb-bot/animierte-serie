# Englische Fassung (SPRACHE=en VERSUCHE=2 python3 stimme_en.py): Puck, unbearbeitet (Issue #41) → en/
import sys, json, os; sys.path.insert(0, ".."); os.makedirs("en", exist_ok=True)
from stimme import erzeugen, zusammen
zeilen = json.load(open("zeilen_en.json"))
EXTRA = {0: 0.15, 1: 0.2, 2: 0.3, 3: 0.2, 4: 0.3, 7: 0.2, 8: 0.15, 10: 0.3, 11: 0.3, 12: 0.2, 13: 0.35, 14: 0.2, 16: 0.2, 17: 0.2, 18: 0.35, 19: 0.3, 20: 0.3, 21: 0.4, 22: 0.3, 23: 0.15, 24: 0.25}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, "en", gruppe=4)
zusammen("en", extra=EXTRA)
zusammen("en", extra=EXTRA, yt=True, ohne=[set(), {15}, {15, 3}, {15, 3, 12}, {15, 3, 12, 1}])
