import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {0: 0.15, 2: 0.2, 3: 0.2, 4: 0.35, 5: 0.25, 6: 0.2, 9: 0.2, 10: 0.25, 11: 0.4, 13: 0.35, 14: 0.3, 15: 0.4, 17: 0.2, 19: 0.3, 20: 0.4, 21: 0.3, 22: 0.35, 23: 0.3, 24: 0.15, 25: 0.25}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=4)
zusammen(".", extra=EXTRA)
zusammen(".", extra=EXTRA, yt=True, ohne=[set(), {17}, {17, 8}, {17, 8, 6}, {17, 8, 6, 12}, {17, 8, 6, 12, 1}])
