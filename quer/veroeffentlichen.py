#!/usr/bin/env python3
"""Lange Querformat-Videos (Jonathan 17.11., Issue #37) auf YouTube einplanen.

Aufruf:  TAEGLICH_TRAILER=<Attributionszeilen> python quer/veroeffentlichen.py q01 [--en] [--probe]

- Video: GitHub-Release `quer-q01` bzw. `quer-q01-en` (ab q03 im 3D-Stil: Workflow „Querformat 3D rendern“
  `block-quer-rendern.yml`, vorher „Querformat rendern (lange Videos)“), wird vorher
  heruntergeladen und geprüft (Ton = Bild, Lautheit, 1920×1080 oder 2560×1440, 7–14 min, erstes Bild nicht schwarz).
- Termin: nächster freier Samstag (quer/FORMAT-3D.md, Jonathan 24.11.: 1 langes Video pro Woche, immer samstags;
  vorher Mo/Mi/Fr). Deutsch 17:00, Englisch 23:30 (US-Nachmittag), jeweils ±30 min gestreut (Issue #26).
- Serie `quer` / `quer-en`: getrennt von der Analyse der Kurzvideos (Jonathan 17.11.: „extern von Analyse“).
- Metadaten aus `quer/folgen.json` (titel, beschreibung, tags; englisch unter `en`).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "taeglich"))
import veroeffentlichen as V  # noqa: E402
sys.path.insert(0, str(ROOT / "quer"))
from kapitel import kapitel  # noqa: E402

REPO = "jonathanb-bot/animierte-serie"
TAGE = (5,)  # Samstag (seit dem 3D-Umstieg, quer/FORMAT-3D.md; vorher Mo/Mi/Fr)
UHR = {"de": (17, 0), "en": (23, 30)}


def release_url(rid: str) -> str:
    return f"https://github.com/{REPO}/releases/download/{rid}/{rid}.mp4"


def laden(url: str, ziel: Path) -> None:
    with urllib.request.urlopen(url) as r, open(ziel, "wb") as f:
        while True:
            b = r.read(1 << 20)
            if not b:
                break
            f.write(b)


def pruefen(datei: Path) -> dict:
    erg = V.pruefe(datei, max_dauer=14 * 60, min_dauer=7 * 60)
    info = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                           "-of", "csv=p=0", str(datei)], capture_output=True, text=True).stdout.strip()
    w, h = (int(x) for x in info.split(",")[:2])
    if erg.get("ok") and w <= h:
        erg = {**erg, "ok": False, "grund": f"kein Querformat ({w}×{h})"}
    erg["format"] = f"{w}x{h}"
    return erg


def naechster_termin(posts: list, sprache: str, serie: str) -> dt.datetime:
    jetzt = dt.datetime.now(V.BERLIN).replace(tzinfo=None)
    belegt = {p["zeit"][:10] for p in posts if p.get("serie") == serie}
    h, m = UHR[sprache]
    tag = jetzt.date()
    while True:
        z = dt.datetime.combine(tag, dt.time(h, m))
        if tag.weekday() in TAGE and z > jetzt + dt.timedelta(hours=2) and tag.isoformat() not in belegt:
            return z
        tag += dt.timedelta(days=1)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folge", help="z. B. q01")
    ap.add_argument("--en", action="store_true", help="englische Fassung (YouTube englisch, 3. Zernio-Konto)")
    ap.add_argument("--probe", action="store_true", help="alles prüfen, nichts pushen")
    a = ap.parse_args(argv)

    meta_all = json.loads((ROOT / "quer" / "folgen.json").read_text(encoding="utf-8"))
    meta = next((f for f in meta_all["folgen"] if f["id"] == a.folge), None)
    if not meta:
        print(f"{a.folge} fehlt in quer/folgen.json"); return 1
    sprache = "en" if a.en else "de"
    m = meta["en"] if a.en else meta
    for feld in ("titel", "beschreibung", "tags"):
        if not m.get(feld):
            print(f"Feld „{feld}“ fehlt ({sprache})"); return 1
    rid = f"quer-{a.folge}" + ("-en" if a.en else "")
    url = release_url(rid)

    with tempfile.TemporaryDirectory() as tmp:
        datei = Path(tmp) / f"{rid}.mp4"
        try:
            laden(url, datei)
        except Exception as e:  # noqa: BLE001
            print(f"NICHT eingeplant: Release {rid} nicht abrufbar ({e})"); return 1
        erg = pruefen(datei)
    print(f"{rid}: {json.dumps(erg, ensure_ascii=False)}")
    if not erg.get("ok"):
        print(f"NICHT eingeplant: {erg.get('grund')}"); return 1

    repo_main = V.klonen("main", ["/posten/"], "main")
    plan_datei = repo_main / "posten" / "plan.json"
    plan = json.loads(plan_datei.read_text(encoding="utf-8"))
    pid = f"quer-yt-{a.folge}" + ("-en" if a.en else "")
    if any(p["id"] == pid for p in plan["posts"]):
        print(f"{pid} steht schon im Plan."); return 0
    serie = "quer-en" if a.en else "quer"
    zeit = V.streuen(naechster_termin(plan["posts"], sprache, serie))
    if a.en:  # nie vor dem deutschen Gegenstück
        de = next((p for p in plan["posts"] if p["id"] == f"quer-yt-{a.folge}"), None)
        if de and zeit.isoformat() < de["zeit"]:
            zeit = dt.datetime.fromisoformat(de["zeit"]) + dt.timedelta(hours=6)
    post = {"id": pid, "platform": "youtube", "zeit": zeit.strftime("%Y-%m-%dT%H:%M:00"), "serie": serie, "video": url,
            "titel": m["titel"][:100], "tags": m["tags"],
            "text": m["beschreibung"] + ("\n\nChapters:\n" if a.en else "\n\nKapitel:\n") + "\n".join(kapitel(rid)) + ("\n\nSubscribe for the next story." if a.en else "\n\nAbonnier den Kanal für die nächste Geschichte.")}
    if a.en:
        post["konto"] = "zernio:3"
    plan["posts"].append(post)
    plan_datei.write_text(json.dumps(plan, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    V.lauf("git", "add", "posten/plan.json", cwd=repo_main)
    V.lauf("git", "commit", "-q", "-m", V.commit_text(f"Querformat {rid} einplanen: {m['titel'][:60]}"), cwd=repo_main)
    print(f"  {pid}: {post['zeit']}  {url}")
    if a.probe:
        print("(Probe) nicht gepusht"); return 0
    V.pushen(repo_main, "main")
    print("Plan gepusht – der Workflow „Posts einplanen“ plant bei Zernio ein. Im Log auf ✓ prüfen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
