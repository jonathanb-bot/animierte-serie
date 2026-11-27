#!/usr/bin/env python3
"""YouTube-Kapitel aus Drehbuch-Kapiteln (`== Name ==`) und den echten Zeiten (audio/<folge>/timing.json).
3D-Folgen (block/quer-qNN/): KAPITEL = [(zeile, "Name"), …] in zeilen.py, Zeiten aus plan_final.json (englisch: en/,
Namen aus KAPITEL_EN, falls vorhanden).
Aufruf: python quer/kapitel.py quer-q01  → druckt „0:00 Minute 0“ usw."""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent

def kapitel_3d(folge: str) -> list[str]:
    basis = folge[:-3] if folge.endswith("-en") else folge; en = folge.endswith("-en")
    ordner = ROOT / "block" / basis; ns: dict = {}
    exec((ordner / "zeilen.py").read_text(encoding="utf-8"), ns)
    plan = json.loads((ordner / ("en/" if en else "") / "plan_final.json").read_text(encoding="utf-8"))["zeilen"]
    namen = ns.get("KAPITEL_EN") if en and ns.get("KAPITEL_EN") else ns["KAPITEL"]
    out = []
    for k, (zeile, name) in enumerate(namen):
        s = int(plan[zeile]["start"]) if k else 0
        out.append(f"{s // 60}:{s % 60:02d} {name}")
    return out


def kapitel(folge: str) -> list[str]:
    if (ROOT / "block" / (folge[:-3] if folge.endswith("-en") else folge) / "zeilen.py").exists():
        return kapitel_3d(folge)
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
