"""Stand für „Bis zum Mond“ (Jonathans Idee 14.11.): Städte und Stockwerke aus den Kommentaren zählen.

    python mond/stand.py              # Rangliste, Beiträge, unbekannte Kommentare, Vorschlag für tuerme=/rangliste=
    python mond/stand.py --json       # dasselbe maschinenlesbar
    python mond/stand.py --speichern  # neuen Stand in mond/gedaechtnis.json schreiben (nach dem Drehbuch, vor dem Commit)

Regeln (mond/serienbibel.md): Jeder Kommentar mit einer Stadt = 1 Stockwerk, jedes Like auf diesen Kommentar = 1 weiteres.
Gezählt werden alle Kommentare unter allen Folgen der Serie, alle Plattformen, jeder Kommentar nur einmal. Es wird jedes Mal
alles neu gezählt (Likes ändern sich); der letzte Stand liegt in mond/gedaechtnis.json, daraus entsteht „alt>neu“ fürs Wachsen.
Quelle: posten/kommentare.json auf origin/main (vorher Workflow „Posts einplanen“ mit kommentare=true, dann git fetch origin main).
Unbekannte Orte meldet das Skript; passende in mond/staedte.json ergänzen (staedte oder aliase) und neu laufen lassen.
Beleidigendes, Politik, Werbung: Claude prüft die Liste und trägt solche Kommentar-IDs in gedaechtnis.json → "gesperrt" ein.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GED = ROOT / "mond" / "gedaechtnis.json"
STAEDTE = ROOT / "mond" / "staedte.json"
SERIE = "Bis zum Mond"
# Orte, die auch normale Wörter sind: zählen nur, wenn sie im Kommentar großgeschrieben stehen
MEHRDEUTIG = {"essen", "halle", "baden", "hamm", "zug", "marl", "wels", "traun", "thun", "biel", "hagen", "worms", "celle", "unna", "moers", "bern"}


def ascii_form(s: str) -> str:
    return s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")


def norm(s: str) -> str:
    s = s.lower().replace("-", " ").replace(".", " ")
    s = re.sub(r"[^a-zäöüßéè0-9 ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def lexikon() -> dict:
    d = json.loads(STAEDTE.read_text(encoding="utf-8"))
    lx = {}
    for name in d["staedte"]:
        for f in {norm(name), norm(ascii_form(name))}:
            lx[f] = name
    for a, name in d["aliase"].items():
        lx[norm(a)] = name
    return lx


def stadt_finden(text: str, lx: dict) -> str | None:
    """Erste (längste) Stadt im Kommentar; mehrdeutige Wörter nur großgeschrieben."""
    toks_orig = re.sub(r"[^\wäöüÄÖÜß.\- ]+", " ", text).replace("-", " ").replace(".", " ").split()
    toks = [norm(t) for t in toks_orig]
    best = None
    for i in range(len(toks)):
        for n in (3, 2, 1):
            if i + n > len(toks):
                continue
            k = " ".join(toks[i:i + n])
            if k in lx:
                if n == 1 and k in MEHRDEUTIG and not toks_orig[i][:1].isupper():
                    continue
                if best is None or n > best[1] or (n == best[1] and i < best[0]):
                    best = (i, n, lx[k])
                break
        if best and best[0] == i:
            break
    return best[2] if best else None


def main_json(pfad: str):
    return json.loads(subprocess.check_output(["git", "-C", str(ROOT), "show", f"origin/main:{pfad}"]))


def zaehlen() -> dict:
    lx = lexikon()
    g = json.loads(GED.read_text(encoding="utf-8")) if GED.exists() else {}
    gesperrt = set(g.get("gesperrt", []))
    k = main_json("posten/kommentare.json")
    posts = [p for p in k.get("posts", []) if SERIE.lower() in (p["post"].get("content") or "").lower()]
    gesehen, staedte, unbekannt = set(), {}, []
    for p in posts:
        for c in p.get("kommentare", []):
            von = c.get("from") or {}
            cid = c.get("id")
            if von.get("isOwner") or cid in gesehen or cid in gesperrt:
                continue
            gesehen.add(cid)
            likes = int(c.get("likeCount") or 0)
            wer = ("@" + von["username"]) if von.get("username") else (von.get("name") or "?")
            st = stadt_finden(c.get("message", ""), lx)
            eintrag = {"id": cid, "wer": wer, "text": c.get("message", ""), "likes": likes, "plattform": p["post"]["platform"]}
            if not st:
                unbekannt.append(eintrag)
                continue
            s = staedte.setdefault(st, {"stockwerke": 0, "kommentare": 0, "likes": 0, "von": []})
            s["stockwerke"] += 1 + likes
            s["kommentare"] += 1
            s["likes"] += likes
            s["von"].append(eintrag)
    rang = sorted(staedte.items(), key=lambda kv: (-kv[1]["stockwerke"], kv[0]))
    alt = g.get("tuerme", {})
    reihe = list(g.get("reihenfolge", []))
    for name, _ in rang:  # neue Städte hinten anhängen (fester Platz auf dem Turmplatz)
        if name not in reihe:
            reihe.append(name)
    tuerme = "|".join(f"{n}:{alt.get(n, 0)}>{staedte[n]['stockwerke']}" if alt.get(n, 0) != staedte.get(n, {}).get("stockwerke", 0)
                      else f"{n}:{alt.get(n, 0)}" for n in reihe if n in staedte or n in alt)
    rangliste = "|".join(f"{n}#{reihe.index(n)}:{alt.get(n, 0)}>{s['stockwerke']}" for n, s in rang[:5])  # #n = Platz → gleiche Farbe wie der Turm
    return {"stand": k.get("erstellt"), "folgen_mit_kommentaren": len(posts), "rang": rang, "unbekannt": unbekannt,
            "reihenfolge": reihe, "tuerme_vorschlag": tuerme, "rangliste_vorschlag": rangliste, "alt": alt}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--speichern", action="store_true")
    a = ap.parse_args(argv)
    z = zaehlen()
    if a.json:
        print(json.dumps(z, ensure_ascii=False, indent=1))
    else:
        print(f"Kommentare Stand {z['stand']}, {z['folgen_mit_kommentaren']} Posts der Serie")
        print(f"\nRangliste ({len(z['rang'])} Städte):")
        for i, (n, s) in enumerate(z["rang"], 1):
            print(f"  {i:2}. {n}: {s['stockwerke']} Stockwerke (vorher {z['alt'].get(n, 0)}) – {s['kommentare']} Kommentare, {s['likes']} Likes – "
                  + ", ".join(e["wer"] for e in s["von"][:5]))
        print(f"\nOhne erkannte Stadt ({len(z['unbekannt'])}) – prüfen, ggf. mond/staedte.json ergänzen:")
        for e in z["unbekannt"][:30]:
            print(f"  ({e['likes']} Likes, {e['plattform']}, {e['wer']}) {e['text'][:120]}")
        print(f"\ntuerme=\"{z['tuerme_vorschlag']}\"\nrangliste=\"{z['rangliste_vorschlag']}\"")
    if a.speichern:
        g = json.loads(GED.read_text(encoding="utf-8")) if GED.exists() else {}
        g["tuerme"] = {n: s["stockwerke"] for n, s in z["rang"]}
        g["reihenfolge"] = z["reihenfolge"]
        g["stand_kommentare"] = z["stand"]
        GED.write_text(json.dumps(g, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"\ngespeichert: {GED.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
