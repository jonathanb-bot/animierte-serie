import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {4: 0.25, 6: 0.35, 7: 0.2, 8: 0.45, 9: 0.3, 11: 0.3, 13: 0.4, 14: 0.45, 15: 0.3, 16: 0.45, 17: 0.3, 18: 0.35, 19: 0.3, 20: 0.4, 21: 0.45, 22: 0.2, 23: 0.25}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=5)
zusammen(".", extra=EXTRA)
zusammen(".", extra=EXTRA, yt=True, ohne=[set(), {3}, {3, 10}, {3, 10, 20}])
