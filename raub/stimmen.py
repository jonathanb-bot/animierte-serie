"""Abstimmung „Der letzte Raub – Ihr entscheidet“ auswerten (Jonathans Auftrag 16.11.): Der Top-Kommentar entscheidet.

    python raub/stimmen.py 1            # Kommentare unter Folge 1 (alle Plattformen) auswerten
    python raub/stimmen.py 1 --json

Quelle: posten/kommentare.json auf origin/main (vorher Workflow „Posts einplanen“ mit kommentare=true, dann git fetch origin main).
Regeln (raub/serienbibel.md): Gültig ist ein Kommentar, der klar A oder B wählt (nicht beides). Der gültige Kommentar mit den
meisten Likes entscheidet. Bei Gleichstand zählt die Option mit mehr Kommentaren, danach der frühere Kommentar. Kein gültiger
Kommentar mit Likes: Mehrheit aller A/B-Nennungen. Gar keine Nennung: KEINE Entscheidung (nie erfinden).
Kommentare ohne A/B werden als mögliche eigene Ideen aufgelistet (Claude prüft: plausibel, hebt nichts Feststehendes auf).
Gesperrte Kommentar-IDs (Beleidigung, Politik, Werbung) stehen in raub/gedaechtnis.json → "gesperrt".
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GED = ROOT / "raub" / "gedaechtnis.json"
SERIE = "Der letzte Raub"


def wahl(text: str) -> str | None:
    t = re.sub(r"[^\wäöüß ]+", " ", text.lower())
    w = t.split()
    a = any(x in ("a", "optiona", "antworta") for x in w) or bool(re.search(r"\boption a\b|\bantwort a\b", t))
    b = any(x in ("b", "optionb", "antwortb") for x in w) or bool(re.search(r"\boption b\b|\bantwort b\b", t))
    if a and not b:
        return "A"
    if b and not a:
        return "B"
    return None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folge", type=int)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    k = json.loads(subprocess.check_output(["git", "-C", str(ROOT), "show", "origin/main:posten/kommentare.json"]))
    g = json.loads(GED.read_text(encoding="utf-8")) if GED.exists() else {}
    gesperrt = set(g.get("gesperrt", []))
    muster = re.compile(rf"{SERIE}\s*[–-]\s*Folge\s+{a.folge}\b", re.I)
    posts = [p for p in k.get("posts", []) if muster.search(p["post"].get("content") or p["post"].get("title") or "")]
    gesehen, gueltig, ideen = set(), [], []
    for p in posts:
        for c in p.get("kommentare", []):
            von = c.get("from") or {}
            cid = c.get("id")
            if von.get("isOwner") or cid in gesehen or cid in gesperrt:
                continue
            gesehen.add(cid)
            e = {"id": cid, "wer": ("@" + von["username"]) if von.get("username") else (von.get("name") or "?"),
                 "text": c.get("message", ""), "likes": int(c.get("likeCount") or 0), "zeit": c.get("createdTime", ""),
                 "plattform": p["post"]["platform"]}
            w = wahl(e["text"])
            if w:
                e["wahl"] = w
                gueltig.append(e)
            elif e["text"].strip(" 🔥❤️👍😂😮"):
                ideen.append(e)
    zaehl = {o: sum(1 for e in gueltig if e["wahl"] == o) for o in "AB"}
    ergebnis, grund, top = None, "", None
    if gueltig:
        top = sorted(gueltig, key=lambda e: (-e["likes"], -zaehl[e["wahl"]], e["zeit"]))[0]
        if top["likes"] > 0:
            ergebnis, grund = top["wahl"], f"Top-Kommentar {top['wer']} ({top['likes']} Likes)"
        elif zaehl["A"] != zaehl["B"]:
            ergebnis = "A" if zaehl["A"] > zaehl["B"] else "B"
            grund = f"kein Kommentar mit Likes, Mehrheit {zaehl['A']}:{zaehl['B']}"
        else:
            ergebnis, grund = top["wahl"], f"Gleichstand ohne Likes, frühester Kommentar {top['wer']}"
    out = {"folge": a.folge, "stand": k.get("erstellt"), "posts": len(posts), "stimmen": zaehl, "ergebnis": ergebnis,
           "grund": grund or "keine gültige Stimme – KEINE Entscheidung", "top": top,
           "gueltig": sorted(gueltig, key=lambda e: -e["likes"])[:20], "ideen": sorted(ideen, key=lambda e: -e["likes"])[:20]}
    if a.json:
        print(json.dumps(out, ensure_ascii=False, indent=1))
        return 0
    print(f"Folge {a.folge}: {len(posts)} Posts, Kommentare Stand {out['stand']}")
    print(f"Stimmen A {zaehl['A']} · B {zaehl['B']}")
    print(f"ERGEBNIS: {ergebnis or '—'}  ({out['grund']})")
    for e in out["gueltig"][:10]:
        print(f"  {e['wahl']} {e['likes']:3} Likes  {e['plattform']:9} {e['wer']}: {e['text'][:80]}")
    if ideen:
        print("Kommentare ohne A/B (eigene Ideen prüfen):")
        for e in out["ideen"][:10]:
            print(f"    {e['likes']:3} Likes  {e['plattform']:9} {e['wer']}: {e['text'][:100]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
