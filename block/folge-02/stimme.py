import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {1: 0.25, 3: 0.3, 5: 0.25, 6: 0.2, 7: 0.15, 9: 0.2, 11: 0.2, 12: 0.3, 13: 0.2, 14: 0.3, 15: 0.35, 17: 0.3, 18: 0.3, 19: 0.4, 20: 0.3, 21: 0.3, 22: 0.3, 23: 0.15, 24: 0.25}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=4)
zusammen(".", extra=EXTRA)
zusammen(".", extra=EXTRA, yt=True, ohne=[set(), {9}, {9, 17}, {9, 17, 11}, {9, 17, 11, 3}])
