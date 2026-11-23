"""Abstimmung einer Blockstadt-Folge auswerten (Jonathan 23.11.: „Was die meisten sagen, mache ich.“).

    python3 block/stimmen.py 1          # Kommentare unter Folge 1 (alle Plattformen, volle + YouTube-Fassung)
    python3 block/stimmen.py 1 --json

Quelle: posten/kommentare.json auf origin/main (vorher Workflow „Posts einplanen“ mit kommentare=true, dann git fetch origin main).
Posts werden über den Titel der Verlauf-Einträge block-bNN / block-bNNk erkannt. Gültig: ein Kommentar, der genau eine Antwort
wählt – Buchstabe A/B/C oder ein Stichwort aus den Antworten (verlauf.json → antworten). Es gewinnt die Antwort mit den meisten
Nennungen (je Person eine Stimme); bei Gleichstand zählen die Likes, danach der frühere Kommentar. Keine Stimme: KEINE Entscheidung.
"""
from __future__ import annotations
import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STOPP = {"das", "die", "der", "den", "selbst", "unter", "an", "anmachen", "rufen", "schauen", "ein", "eine", "und", "oder", "zu", "ins", "in"}


def stichwoerter(antworten: dict) -> dict:
    out = {}
    for b, txt in antworten.items():
        out[b] = [w for w in re.findall(r"[a-zäöüß]+", txt.lower()) if w not in STOPP and len(w) > 2]
    return out


def wahl(text: str, sw: dict) -> str | None:
    t = re.sub(r"[^\wäöüß ]+", " ", text.lower()); w = t.split()
    treffer = set()
    for b in sw:
        if b.lower() in w or f"option{b.lower()}" in w or re.search(rf"\b(option|antwort)\s+{b.lower()}\b", t): treffer.add(b)
        if any(s in w for s in sw[b]): treffer.add(b)
    return treffer.pop() if len(treffer) == 1 else None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folge", type=int); ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    nr = f"b{a.folge:02d}"
    verlauf = json.loads((ROOT / "taeglich" / "verlauf.json").read_text(encoding="utf-8"))
    eintraege = [e for e in verlauf["videos"] if e["id"] in (f"block-{nr}", f"block-{nr}k")]
    if not eintraege: print(f"Kein Verlauf-Eintrag block-{nr}"); return 1
    titel = {e["titel"] for e in eintraege}; sw = stichwoerter(eintraege[0].get("antworten", {"A": "", "B": "", "C": ""}))
    k = json.loads(subprocess.check_output(["git", "-C", str(ROOT), "show", "origin/main:posten/kommentare.json"]))
    posts = [p for p in k.get("posts", []) if any(ti in (p["post"].get("content") or p["post"].get("title") or "") for ti in titel)]
    gesehen, personen, gueltig, sonst = set(), set(), [], []
    for p in posts:
        for c in p.get("kommentare", []):
            von = c.get("from") or {}; cid = c.get("id")
            if von.get("isOwner") or cid in gesehen: continue
            gesehen.add(cid)
            wer = ("@" + von["username"]) if von.get("username") else (von.get("name") or "?")
            e = {"id": cid, "wer": wer, "text": c.get("message", ""), "likes": int(c.get("likeCount") or 0), "zeit": c.get("createdTime", ""), "plattform": p["post"]["platform"]}
            w = wahl(e["text"], sw)
            if w and (wer, p["post"]["platform"]) not in personen:
                personen.add((wer, p["post"]["platform"])); e["wahl"] = w; gueltig.append(e)
            elif not w and e["text"].strip(" 🔥❤️👍😂😮"): sonst.append(e)
    zaehl = {b: sum(1 for e in gueltig if e["wahl"] == b) for b in sw}
    likes = {b: sum(e["likes"] for e in gueltig if e["wahl"] == b) for b in sw}
    ergebnis = None
    if gueltig:
        ergebnis = sorted(sw, key=lambda b: (-zaehl[b], -likes[b], min([e["zeit"] for e in gueltig if e["wahl"] == b] or ["9"])))[0]
    out = {"folge": a.folge, "stand": k.get("erstellt"), "posts": len(posts), "stimmen": zaehl, "likes": likes, "ergebnis": ergebnis,
           "antwort": eintraege[0].get("antworten", {}).get(ergebnis) if ergebnis else None,
           "gueltig": gueltig[:30], "sonst": sorted(sonst, key=lambda e: -e["likes"])[:20]}
    if a.json: print(json.dumps(out, ensure_ascii=False, indent=1)); return 0
    print(f"Folge {a.folge}: {len(posts)} Posts, Kommentare Stand {out['stand']}")
    print("Stimmen " + " · ".join(f"{b} {zaehl[b]}" for b in sw))
    print(f"ERGEBNIS: {ergebnis or '— keine gültige Stimme, KEINE Entscheidung'} {('(' + out['antwort'] + ')') if ergebnis else ''}")
    for e in gueltig[:12]: print(f"  {e['wahl']} {e['likes']:3} Likes  {e['plattform']:9} {e['wer']}: {e['text'][:80]}")
    if sonst:
        print("Andere Kommentare (Ideen prüfen):")
        for e in out["sonst"][:10]: print(f"    {e['likes']:3} Likes  {e['plattform']:9} {e['wer']}: {e['text'][:100]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
