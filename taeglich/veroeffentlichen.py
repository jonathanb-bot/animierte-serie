"""Ein fertig gerendertes Kurzvideo veröffentlichen: Lautheit angleichen, prüfen, auf `youtube-upload` ablegen,
TikTok + Instagram + YouTube in `posten/plan.json` auf `main` eintragen (GitHub plant dann über Zernio ein).

    python taeglich/veroeffentlichen.py video-001 --zeit 2026-11-01T18:00            # YouTube automatisch 30 min später
    python taeglich/veroeffentlichen.py video-001 --zeit 2026-11-01T18:00 --probe    # alles prüfen, nichts pushen

Voraussetzungen:
- `ausgabe/taeglich-video-001.mp4` ist gerendert (`node render.mjs taeglich/episoden/video-001.txt`).
- `taeglich/verlauf.json` hat einen Eintrag mit "id": "video-001" (titel, beschreibung, hashtags, tags, emoji …).

Prüfung wie überall im Projekt (Jonathans feste Vorgabe): Tonspur da, so lang wie das Bild (±0,5 s), Stimme hörbar
(> −24 LUFS). Dazu hier: höchstens 89 s (darunter ein Post auf jeder Plattform). Lautheit wird auf −15 LUFS gebracht.
Optional hängt die Umgebungsvariable TAEGLICH_TRAILER (z. B. Co-Authored-By-Zeilen) an jede Commit-Nachricht.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
REPO = "https://github.com/jonathanb-bot/animierte-serie"
RAW = "https://raw.githubusercontent.com/jonathanb-bot/animierte-serie/youtube-upload/taeglich/{id}.mp4"
ZIEL_LUFS = -15.0
MAX_DAUER = 89.0
BERLIN = ZoneInfo("Europe/Berlin")
VERLAUF = ROOT / "taeglich" / "verlauf.json"
KURZ = {"tiktok": "tiktok", "instagram": "insta", "youtube": "yt"}
ARBEIT = Path(os.environ.get("TAEGLICH_ARBEIT") or tempfile.gettempdir()) / "taeglich-veroeffentlichen"


def lauf(*cmd, cwd=None, check=True) -> str:
    r = subprocess.run([str(c) for c in cmd], cwd=cwd, capture_output=True, text=True)
    if check and r.returncode:
        raise RuntimeError(f"{' '.join(map(str, cmd))} → {r.returncode}\n{r.stdout[-1500:]}\n{r.stderr[-1500:]}")
    return r.stdout.strip()


def commit_text(titel: str) -> str:
    t = os.environ.get("TAEGLICH_TRAILER", "").strip()
    return titel + ("\n\n" + t if t else "")


def dauer(f: Path, s: str) -> float:
    out = lauf("ffprobe", "-v", "error", "-select_streams", s, "-show_entries", "stream=duration", "-of", "csv=p=0", f, check=False)
    return float(out) if out else 0.0


def lufs(f: Path) -> float | None:
    err = subprocess.run(["ffmpeg", "-nostats", "-i", str(f), "-map", "0:a:0", "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = re.search(r"I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold", err)
    return float(m.group(1)) if m else None


def pruefe(f: Path) -> dict:
    """Gleiche Regel wie pruefen.py auf youtube-upload, dazu die Höchstdauer."""
    v, a = dauer(f, "v:0"), dauer(f, "a:0")
    l = lufs(f) if a else None
    grund = None
    if not v: grund = "keine Bildspur"
    elif not a: grund = "keine Tonspur"
    elif abs(v - a) > 0.5: grund = "Ton und Bild unterschiedlich lang"
    elif l is None: grund = "Lautheit nicht messbar"
    elif l < -24: grund = "zu leise, Stimme fehlt vermutlich"
    elif v > MAX_DAUER: grund = f"zu lang ({v:.1f} s, höchstens {MAX_DAUER:.0f} s)"
    return {"ok": grund is None, "bild_s": round(v, 2), "ton_s": round(a, 2), "lufs": l, **({"grund": grund} if grund else {})}


def angleichen(roh: Path, ziel: Path) -> None:
    """Ton auf −15 LUFS bringen (Bild unverändert kopiert)."""
    l = lufs(roh)
    if l is None:
        raise RuntimeError("Lautheit des gerenderten Videos nicht messbar – fehlt die Tonspur?")
    gain = max(-6.0, min(8.0, ZIEL_LUFS - l))
    lauf("ffmpeg", "-y", "-v", "error", "-i", roh, "-c:v", "copy", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.95",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", ziel)
    print(f"Lautheit: {l:.1f} → {lufs(ziel):.1f} LUFS")


def pushen(repo: Path, branch: str) -> None:
    for i, warte in enumerate([0, 2, 4, 8, 16]):
        if warte:
            time.sleep(warte)
        lauf("git", "pull", "-q", "--rebase", "origin", branch, cwd=repo, check=False)
        r = subprocess.run(["git", "push", "-q", "origin", f"HEAD:{branch}"], cwd=repo, capture_output=True, text=True)
        if not r.returncode:
            return
        print(f"  Push nach {branch} fehlgeschlagen (Versuch {i + 1}): {r.stderr.strip()[-300:]}")
    raise RuntimeError(f"Push nach {branch} nicht möglich")


def klonen(branch: str, pfade: list[str], name: str) -> Path:
    """Nur die nötigen Dateien eines Branches holen (Teil-Klon, die Videos bleiben auf dem Server)."""
    ziel = ARBEIT / name
    shutil.rmtree(ziel, ignore_errors=True)
    ziel.parent.mkdir(parents=True, exist_ok=True)
    lauf("git", "clone", "-q", "--filter=blob:none", "--no-checkout", "--depth", "1", "--single-branch", "--branch", branch, REPO, ziel)
    lauf("git", "sparse-checkout", "set", "--no-cone", *pfade, cwd=ziel)
    lauf("git", "checkout", "-q", branch, cwd=ziel)
    for k, v in (("user.name", "Claude"), ("user.email", "noreply@anthropic.com")):
        if not lauf("git", "config", k, cwd=ziel, check=False):
            lauf("git", "config", k, v, cwd=ziel)
    return ziel


def ablegen(vid: str, datei: Path, ergebnis: dict, eintrag: dict, probe: bool) -> None:
    yu = klonen("youtube-upload", ["/geprueft.json", "/pruefen.py", "/README.md", "/taeglich/"], "youtube-upload")
    (yu / "taeglich").mkdir(exist_ok=True)
    shutil.copy(datei, yu / "taeglich" / f"{vid}.mp4")
    g = json.loads((yu / "geprueft.json").read_text(encoding="utf-8"))
    g.setdefault("dateien", {})[f"taeglich/{vid}.mp4"] = ergebnis
    g.setdefault("taeglich", {})[vid] = {"titel": eintrag["titel"], "datei": f"taeglich/{vid}.mp4"}
    (yu / "geprueft.json").write_text(json.dumps(g, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    # pruefen.py soll die Kurzvideos bei einem kompletten Lauf mitprüfen (einmalig ergänzen)
    pp = (yu / "pruefen.py").read_text(encoding="utf-8")
    if '"taeglich"' not in pp:
        pp = pp.replace('+ sorted((ROOT / "24-stock-kurz").glob("*.mp4")):',
                        '+ sorted((ROOT / "24-stock-kurz").glob("*.mp4")) + sorted((ROOT / "taeglich").glob("*.mp4")):')
        (yu / "pruefen.py").write_text(pp, encoding="utf-8")
    lauf("git", "add", "-A", cwd=yu)
    lauf("git", "commit", "-q", "-m", commit_text(f"Kurzvideo {vid}: {eintrag['titel']} (geprüft: {ergebnis['lufs']} LUFS, {ergebnis['bild_s']} s)"), cwd=yu)
    if probe:
        print("(Probe) youtube-upload: Commit vorbereitet, nicht gepusht")
        return
    pushen(yu, "youtube-upload")
    print(f"Abgelegt: youtube-upload/taeglich/{vid}.mp4")


def warten_auf_raw(url: str, groesse: int, max_s=600) -> None:
    t0 = time.time()
    while time.time() - t0 < max_s:
        try:
            req = urllib.request.Request(url, method="HEAD")
            with urllib.request.urlopen(req, timeout=30) as r:
                if int(r.headers.get("Content-Length", 0)) == groesse:
                    print(f"Video abrufbar: {url}")
                    return
        except Exception:
            pass
        time.sleep(15)
    raise RuntimeError(f"Video nach {max_s} s noch nicht unter {url} abrufbar")


def freie_zeit(posts: list, loeschen: set, platform: str, zeit: dt.datetime) -> dt.datetime:
    """Keine zwei Posts derselben Plattform innerhalb von 30 Minuten: sonst in 30-Minuten-Schritten nach hinten."""
    belegt = [dt.datetime.fromisoformat(p["zeit"]) for p in posts if p["platform"] == platform and p["id"] not in loeschen]
    while any(abs((zeit - b).total_seconds()) < 1800 for b in belegt):
        zeit += dt.timedelta(minutes=30)
    return zeit


def einplanen(vid: str, eintrag: dict, zeit: dt.datetime, yt_zeit: dt.datetime, url: str, probe: bool) -> dict:
    nr = vid.split("-")[-1]
    repo_main = klonen("main", ["/posten/"], "main")
    plan_datei = repo_main / "posten" / "plan.json"
    plan = json.loads(plan_datei.read_text(encoding="utf-8"))
    loeschen = set(plan.get("loeschen") or [])
    ids = {p["id"] for p in plan["posts"]}
    titel, em = eintrag["titel"], eintrag.get("emoji", "")
    tags_txt = " ".join(eintrag.get("hashtags", ["#animation", "#story", "#storytime"]))
    kopf = f"{titel} {em}".strip()
    neu = []
    for platform, z in (("tiktok", zeit), ("instagram", zeit), ("youtube", yt_zeit)):
        pid = f"taeglich-{KURZ[platform]}-{nr}"
        if pid in ids:
            print(f"{pid} steht schon im Plan – übersprungen")
            continue
        z = freie_zeit(plan["posts"], loeschen, platform, z)
        post = {"id": pid, "platform": platform, "zeit": z.strftime("%Y-%m-%dT%H:%M:00"), "serie": "taeglich", "video": url}
        if platform == "tiktok":
            post["text"] = f"{kopf}\n{eintrag['beschreibung']}\nFolg mir für die nächste Geschichte!\n\n{tags_txt} #fyp"
        elif platform == "instagram":
            post["text"] = f"{kopf}\n{eintrag['beschreibung']}\n\n{tags_txt} #reels"
        else:
            post["titel"] = f"{kopf} #shorts"[:100]
            post["tags"] = (eintrag.get("tags") or ["animation", "story"]) + ["shorts"]
            post["text"] = f"{eintrag['beschreibung']}\nAbonnieren für die nächste Geschichte!\n\n{tags_txt} #shorts"
        plan["posts"].append(post)
        neu.append(post)
    if not neu:
        return {}
    plan_datei.write_text(json.dumps(plan, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    lauf("git", "add", "posten/plan.json", cwd=repo_main)
    lauf("git", "commit", "-q", "-m", commit_text(f"Kurzvideo {vid} einplanen: {titel}"), cwd=repo_main)
    for p in neu:
        print(f"  {p['id']}: {p['zeit']}")
    if probe:
        print("(Probe) main: Commit vorbereitet, nicht gepusht")
    else:
        pushen(repo_main, "main")
        print("Plan gepusht – der Workflow „Posts einplanen“ prüft das Video und plant bei Zernio ein.")
    return {p["platform"]: p["zeit"] for p in neu}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("id", help="z. B. video-001")
    ap.add_argument("--zeit", required=True, help="TikTok + Instagram, Europe/Berlin, z. B. 2026-11-01T18:00")
    ap.add_argument("--yt-zeit", help="YouTube (Standard: 30 Minuten nach --zeit)")
    ap.add_argument("--probe", action="store_true", help="alles prüfen und vorbereiten, aber nichts pushen")
    a = ap.parse_args(argv)

    verlauf = json.loads(VERLAUF.read_text(encoding="utf-8"))
    eintrag = next((e for e in verlauf["videos"] if e["id"] == a.id), None)
    if not eintrag:
        print(f"Kein Eintrag „{a.id}“ in {VERLAUF.relative_to(ROOT)}"); return 1
    for feld in ("titel", "beschreibung", "hashtags"):
        if not eintrag.get(feld):
            print(f"Feld „{feld}“ fehlt im Verlauf-Eintrag"); return 1
    zeit = dt.datetime.fromisoformat(a.zeit)
    yt_zeit = dt.datetime.fromisoformat(a.yt_zeit) if a.yt_zeit else zeit + dt.timedelta(minutes=30)
    jetzt = dt.datetime.now(BERLIN).replace(tzinfo=None)
    if zeit < jetzt + dt.timedelta(minutes=20):
        print(f"--zeit {zeit} liegt zu nah oder in der Vergangenheit (jetzt {jetzt:%Y-%m-%d %H:%M})"); return 1

    roh = ROOT / "ausgabe" / f"taeglich-{a.id}.mp4"
    if not roh.exists():
        print(f"{roh.relative_to(ROOT)} fehlt – erst rendern"); return 1
    fertig = ROOT / "ausgabe" / f"taeglich-{a.id}-fertig.mp4"
    angleichen(roh, fertig)
    ergebnis = pruefe(fertig)
    print("Prüfung:", json.dumps(ergebnis, ensure_ascii=False))
    if not ergebnis["ok"]:
        print("NICHT veröffentlicht – Prüfung fehlgeschlagen."); return 1

    ablegen(a.id, fertig, ergebnis, eintrag, a.probe)
    url = RAW.format(id=a.id)
    if not a.probe:
        warten_auf_raw(url, fertig.stat().st_size)
    geplant = einplanen(a.id, eintrag, zeit, yt_zeit, url, a.probe)

    if not a.probe:
        eintrag["veroeffentlicht"] = {"video": url, "geplant": geplant, "lufs": ergebnis["lufs"], "dauer_s": ergebnis["bild_s"]}
        VERLAUF.write_text(json.dumps(verlauf, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print("verlauf.json aktualisiert – jetzt den Branch „taeglich“ committen und pushen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
