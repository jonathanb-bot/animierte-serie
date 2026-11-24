import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {1: 0.3, 2: 0.2, 6: 0.3, 10: 0.3, 11: 0.35, 12: 0.3, 13: 0.35, 14: 0.45, 15: 0.3, 16: 0.25, 17: 0.4, 18: 0.4, 19: 0.4, 20: 0.45, 21: 0.15, 22: 0.25}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=5)
zusammen(".", extra=EXTRA)
zusammen(".", extra=EXTRA, yt=True, ohne=[set(), {2}, {2, 7}, {2, 7, 13}])
