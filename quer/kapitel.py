#!/usr/bin/env python3
"""YouTube-Kapitel aus Drehbuch-Kapiteln (`== Name ==`) und den echten Zeiten (audio/<folge>/timing.json).
Aufruf: python quer/kapitel.py quer-q01  → druckt „0:00 Minute 0“ usw."""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent

def kapitel(folge: str) -> list[str]:
    namen = [m.group(1).strip() for m in re.finditer(r"^== (.+?) ==\s*$", (ROOT / "taeglich/episoden" / f"{folge}.txt").read_text(encoding="utf-8"), re.M)]
    t = json.loads((ROOT / "taeglich/audio" / folge / "timing.json").read_text(encoding="utf-8"))["einstellungen"]
    start = {}
    for e in t:
        start.setdefault(e["kapitel"], e["start"])
    out = []
    for k, name in enumerate(namen, 1):
        s = int(start.get(k, 0)) if k > 1 else 0
        out.append(f"{s // 60}:{s % 60:02d} {name}")
    return out

if __name__ == "__main__":
    print("\n".join(kapitel(sys.argv[1])))
