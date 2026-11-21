"""python -m ton <drehbuch.yaml> [--video folge.mp4] [--ausgabe ordner]
python -m ton --liste
"""
import argparse
import sys
import time

from . import geraeusche as G
from . import musik as M
from . import stimmen as S


def main(argv=None):
    p = argparse.ArgumentParser(prog="python -m ton", description="Tonspur für eine Folge bauen")
    p.add_argument("drehbuch", nargs="*", help="ton.yaml einer oder mehrerer Folgen")
    p.add_argument("--video", help="fertiges Video ohne Ton – wird mit der Tonspur zusammengeführt")
    p.add_argument("--ausgabe", help="Ausgabeordner (Standard: <ordner des drehbuchs>/ausgabe)")
    p.add_argument("--vorschau", action="store_true", help="ohne Video: schlichtes Prüfvideo mit Untertiteln erzeugen")
    p.add_argument("--nur-stimme", action="store_true", help="nur Stimmen (schnell, zum Timing-Prüfen)")
    p.add_argument("--liste", action="store_true", help="verfügbare Geräusche, Atmos, Musik, Emotionen zeigen")
    a = p.parse_args(argv)

    if a.liste:
        print("Geräusche:", ", ".join(sorted(n for n in G.GERAEUSCHE if n not in G.ATMOS)))
        print("Atmos:    ", ", ".join(sorted(G.ATMOS)))
        print("Musik:    ", ", ".join(M.STIMMUNGEN))
        print("Emotionen:", ", ".join(S.EMOTIONEN))
        print("Räume:    ", ", ".join(__import__("ton.audio", fromlist=["RAEUME"]).RAEUME))
        return 0
    if not a.drehbuch:
        p.error("Drehbuch fehlt")
    if a.video and len(a.drehbuch) > 1:
        p.error("--video geht nur mit einem Drehbuch")

    from .mix import bauen
    for d in a.drehbuch:
        t = time.time()
        print(f"▶ {d}")
        erg = bauen(d, ausgabe=a.ausgabe, video=a.video, nur_stimme=a.nur_stimme, vorschau=a.vorschau)
        print(f"✔ {erg['dauer']:.1f}s Ton in {time.time() - t:.0f}s → {erg.get('video', erg['ton'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
