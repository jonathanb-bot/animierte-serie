import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {0: 0.15, 3: 0.3, 5: 0.25, 7: 0.35, 9: 0.25, 11: 0.25, 13: 0.3, 15: 0.35, 16: 0.3, 17: 0.45, 18: 0.2, 19: 0.3, 20: 0.45, 21: 0.15, 22: 0.25}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=4)
zusammen(".", extra=EXTRA)
zusammen(".", extra=EXTRA, yt=True, ohne=[set(), {2}, {2, 17}, {2, 17, 5}])
