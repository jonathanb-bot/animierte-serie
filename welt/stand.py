"""Stand der Welt für die nächste Folge von „Deine Welt“ (Issue #32): Einwohner und Top-Kommentar.

    python welt/stand.py            # zeigt Einwohner (alle Konten zusammen) und die Kommentar-Kandidaten
    python welt/stand.py --json     # dasselbe maschinenlesbar

Quellen (beide auf `main`, vorher frisch holen):
- Einwohner = Summe der Follower aller verbundenen Konten aus `posten/analyse.json`
  (Workflow „Posts einplanen“ mit `analyse=true`).
- Kommentare unter den Posts der Serie aus `posten/kommentare.json`
  (Workflow „Posts einplanen“ mit `kommentare=true`). Gezählt wird nur die zuletzt veröffentlichte Folge
  auf allen Plattformen. Der Top-Kommentar ist der mit den meisten Likes; bei Gleichstand der frühere.

Das Skript sortiert nur. Ob ein Kommentar in die Welt passt (Weltregeln, Ressourcen, keine Beleidigung,
keine Gewalt, keine Werbung), entscheidet Claude beim Planen nach `welt/serienbibel.md` → „Top-Kommentar umsetzen“.
Nutzernamen kommen nie ins Video.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEDAECHTNIS = ROOT / "welt" / "gedaechtnis.json"
SERIE = "Deine Welt"


def main_json(pfad: str):
    return json.loads(subprocess.check_output(["git", "-C", str(ROOT), "show", f"origin/main:{pfad}"]))


def einwohner() -> dict:
    a = main_json("posten/analyse.json")
    konten = [{"plattform": k.get("platform"), "konto": k.get("username"), "follower": k.get("follower")} for k in a.get("konten", [])]
    summe = sum(int(k["follower"] or 0) for k in konten)
    return {"einwohner": summe, "stand": a.get("erstellt"), "konten": konten}


def folgen_nr(text: str) -> int | None:
    m = re.search(r"Folge\s+(\d+)", text or "")
    return int(m.group(1)) if m else None


def kommentare() -> dict:
    k = main_json("posten/kommentare.json")
    posts = [p for p in k.get("posts", []) if SERIE.lower() in (p["post"].get("content") or "").lower()]
    if not posts:
        return {"stand": k.get("erstellt"), "folge": None, "kandidaten": []}
    letzte = max((folgen_nr(p["post"]["content"]) or 0) for p in posts)
    kand = []
    for p in posts:
        if (folgen_nr(p["post"]["content"]) or 0) != letzte:
            continue
        for c in p.get("kommentare", []):
            if (c.get("from") or {}).get("isOwner"):
                continue
            kand.append({"likes": int(c.get("likeCount") or 0), "antworten": int(c.get("replyCount") or 0), "text": c.get("message", ""),
                         "plattform": p["post"]["platform"], "zeit": c.get("createdTime")})
    kand.sort(key=lambda c: (-c["likes"], -c["antworten"], c["zeit"] or ""))
    return {"stand": k.get("erstellt"), "folge": letzte, "kandidaten": kand}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    e, k = einwohner(), kommentare()
    g = json.loads(GEDAECHTNIS.read_text(encoding="utf-8")) if GEDAECHTNIS.exists() else {}
    vorher = g.get("einwohner")
    if a.json:
        print(json.dumps({"einwohner": e, "vorher": vorher, "kommentare": k}, ensure_ascii=False, indent=1))
        return 0
    diff = f" ({e['einwohner'] - vorher:+d} seit der letzten Folge)" if isinstance(vorher, int) else ""
    print(f"Einwohner: {e['einwohner']}{diff}  – Stand Follower {e['stand']}")
    for kt in e["konten"]:
        print(f"  {kt['plattform']}:{kt['konto']} {kt['follower']}")
    print(f"\nKommentare (Stand {k['stand']}) unter Folge {k['folge']}:")
    if not k["kandidaten"]:
        print("  keine – dann entscheidet die Welt selbst (serienbibel.md → „Kein Kommentar“)")
    for i, c in enumerate(k["kandidaten"][:15], 1):
        print(f"  {i:2}. ({c['likes']} Likes, {c['antworten']} Antworten, {c['plattform']}) {c['text'][:200]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
