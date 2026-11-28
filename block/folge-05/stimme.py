# Stimme Folge 05 „Akku“: Puck, unbearbeitet (Issue #41). Eine Fassung für alle Plattformen (≤ 89 s, keine A/B/C-Frage, Issue #45).
import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {1: 0.3, 3: 0.2, 5: 0.25, 6: 0.3, 7: 0.3, 9: 0.35, 11: 0.4, 12: 0.4, 13: 0.3, 14: 0.45, 15: 0.4, 16: 0.4, 17: 0.45, 18: 0.4, 19: 0.45, 20: 0.4, 21: 0.45}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=5)
zusammen(".", extra=EXTRA)
