import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {1: 0.25, 5: 0.2, 7: 0.3, 8: 0.25, 11: 0.2, 12: 0.35, 15: 0.4, 16: 0.2, 17: 0.3, 19: 0.3, 20: 0.45, 21: 0.15, 22: 0.25}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=4)
zusammen(".", extra=EXTRA)
zusammen(".", extra=EXTRA, yt=True, ohne=[set(), {3}, {3, 8}, {3, 8, 17}])
