import sys; sys.path.insert(0, "..")
from stimme import erzeugen, zusammen
from zeilen import zeilen
EXTRA = {1: 0.2, 4: 0.25, 5: 0.2, 6: 0.3, 9: 0.3, 11: 0.2, 14: 0.3, 15: 0.3, 16: 0.3}
if "--nur-zusammen" not in sys.argv: erzeugen(zeilen, ".", gruppe=5)
zusammen(".", extra=EXTRA)
