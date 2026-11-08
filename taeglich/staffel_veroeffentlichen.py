"""Eine fertig gerenderte Kurzvideo-Staffel veröffentlichen: alle Posts HINTEN an die bestehende Warteschlange hängen.

    python taeglich/staffel_veroeffentlichen.py s01            # alles
    python taeglich/staffel_veroeffentlichen.py s01 --probe    # alles prüfen und vorbereiten, nichts pushen

Jonathans Vorgaben:
- Posten: alles hinten anhängen (1.11.). Pro Plattform geht es direkt nach dem letzten geplanten Post weiter, im festen
  Takt: TikTok 08:00, 12:00, 16:00, 20:00, Instagram 08/11/14/17/20 Uhr, YouTube jeweils :30 danach (5× am Tag, 6.11.), jeder Post zufällig 0–30 min früher oder später (5.11.). Nie parallel.
- TikTok (Issue #7): Folgen zu wenigen Sammelteilen zusammenschneiden (10 Folgen → 4 Teile, jeder höchstens 10 min).
- Nie „Fortsetzung folgt“ (Issue #11, 1.11.): Die Folgen enden mit dem Cliffhanger. Steht doch eine solche Karte am Ende,
  wird sie überall herausgeschnitten (in der einzelnen Folge und im TikTok-Teil).
- Instagram + YouTube: jede Folge ein Post (die Folgen sind 65–85 s, also über 1 Minute und unter 90 s, siehe FORMAT.md).
- Jedes Video muss über 1 Minute lang sein (Jonathans Vorgabe 1.11., Issue #12; TikTok zahlt nur für Videos über 1 Minute).
- Vor jedem Post: Ton da, so lang wie das Bild, Stimme hörbar (> −24 LUFS). Lautheit wird auf ca. −15 LUFS gebracht.

Voraussetzungen: `taeglich/staffeln.json` hat die Staffel (Titel, Folgen, Hashtags …), alle Folgen sind gerendert:
`ausgabe/taeglich-s01-f01.mp4` …
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import veroeffentlichen as V  # noqa: E402  (gemeinsame Werkzeuge: prüfen, Lautheit, Teil-Klon, Push)

ROOT = V.ROOT
STAFFELN = ROOT / "taeglich" / "staffeln.json"
RAW = "https://raw.githubusercontent.com/jonathanb-bot/animierte-serie/youtube-upload/{pfad}"
TAKT = {"tiktok": [(8, 0), (12, 0), (16, 0), (20, 0)],  # 4× am Tag (Jonathans Vorgabe 1.11.: mehr Videos pro Tag)
         # Instagram/YouTube 5× am Tag (Jonathans Vorgabe 6.11., ersetzt „alle 2 Stunden“ aus Issue #14)
         "instagram": [(8, 0), (11, 0), (14, 0), (17, 0), (20, 0)], "youtube": [(8, 30), (11, 30), (14, 30), (17, 30), (20, 30)]}
MIN_DAUER = 62.0   # jedes Video über 1 Minute (Issue #12), mit kleinem Puffer
MAX_FOLGE = 90.0   # bis 90 s: ein Post auf Instagram/YouTube (Jonathans Vorgabe 2.11.)
MAX_XL = 125.0     # Format „XL“/„gemischt“: Folgen bis ca. 2 min (Jonathans Wunsch 2.11.)
MIN_HORROR = 120.0 # Format „horror“: jede Folge mindestens 2 min (FORMAT.md, 120–180 s)
MAX_HORROR = 185.0 # Format „horror“: Folgen 2–3 min (Jonathans Wunsch 4.11., Issue #23); Reels/Shorts erlauben bis 3 min
MAX_TEIL = 600.0
VORLAUF = dt.timedelta(minutes=60)


def tiktok_teile_standard(n: int) -> list[list[int]]:
    """10 Folgen → 4 Teile (3, 2, 3, 2) wie bei „Der letzte Mann“; sonst etwa 2–3 Folgen pro Teil."""
    if n == 10:
        return [[1, 2, 3], [4, 5], [6, 7, 8], [9, 10]]
    k = max(1, round(n * 0.4))
    teile, start = [], 1
    for i in range(k):
        groesse = (n - start + 1) // (k - i)
        teile.append(list(range(start, start + groesse)))
        start += groesse
    return teile


def karten_dauer(drehbuch: Path) -> float:
    """Dauer der „Fortsetzung folgt“-Karte am Ende (0, wenn die letzte Einstellung keine solche Karte ist)."""
    zeilen = [z for z in drehbuch.read_text(encoding="utf-8").splitlines() if z.strip().startswith("[")]
    letzte = zeilen[-1] if zeilen else ""
    if "Fortsetzung folgt" not in letzte:
        return 0.0
    m = re.search(r"\bdauer=([\d.]+)", letzte)
    return float(m.group(1)) if m else 2.0


def teil_schneiden(folgen: list[dict], ziel: Path) -> None:
    """Folgen aneinanderhängen; eine „Fortsetzung folgt“-Karte am Ende wird bei jeder Folge abgeschnitten (Issue #11)."""
    args, filt = [], []
    for i, f in enumerate(folgen):
        laenge = V.dauer(f["datei"], "v:0")
        bis = laenge - f["karte"]
        args += ["-i", f["datei"]]
        filt.append(f"[{i}:v]trim=0:{bis:.3f},setpts=PTS-STARTPTS[v{i}];"
                    f"[{i}:a]atrim=0:{bis:.3f},asetpts=PTS-STARTPTS,afade=t=out:st={max(0, bis - 0.04):.3f}:d=0.04[a{i}]")
    kette = "".join(f"[v{i}][a{i}]" for i in range(len(folgen)))
    roh = ziel.with_name(ziel.stem + "-roh.mp4")
    gesamt = sum(V.dauer(f["datei"], "v:0") for f in folgen)
    # Hohe Qualität wie render.mjs mit @qualitaet hoch; Datenrate so begrenzt, dass die Datei unter 95 MB bleibt (GitHub-Grenze 100 MB)
    deckel = int(min(12000, 95 * 8 * 1000 / max(gesamt, 1) - 220))
    V.lauf("ffmpeg", "-y", "-v", "error", *args, "-filter_complex", ";".join(filt) + f";{kette}concat=n={len(folgen)}:v=1:a=1[v][a]",
           "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-tune", "animation", "-profile:v", "high",
           "-x264-params", "aq-mode=3", "-maxrate", f"{deckel}k", "-bufsize", f"{deckel * 2}k", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", roh)
    V.angleichen(roh, ziel)
    roh.unlink()


def letzte_zeit(posts: list, loeschen: set, platform: str, konto: str | None = None) -> dt.datetime | None:
    # Posts mit eigenem "konto" (z. B. englischer TikTok-Account, 3.11.) laufen in einer eigenen Warteschlange
    zeiten = [dt.datetime.fromisoformat(p["zeit"]) for p in posts
              if p["platform"] == platform and p["id"] not in loeschen and p.get("konto") == konto]
    return max(zeiten) if zeiten else None


# Test (Jonathan 8.11.): deutsches TikTok nach den schon geplanten Posts 3 Tage lang nur 1 Video am Tag (20 Uhr, gestreut).
# Gilt nur für die deutsche Warteschlange (staffel_veroeffentlichen), nicht für Englisch und nicht für Instagram/YouTube.
TIKTOK_EINMAL = {dt.date(2026, 11, 12), dt.date(2026, 11, 13), dt.date(2026, 11, 14)}
TIKTOK_EINMAL_TAKT = [(20, 0)]


def naechste_slots(platform: str, nach: dt.datetime, anzahl: int, takt: list | None = None,
                   einmal_test: bool = False) -> list[dt.datetime]:
    """Die nächsten `anzahl` Takt-Zeiten (ohne Streuung) mehr als 30 min nach `nach`.

    `nach` ist meist ein schon gestreuter Post (±30 min, Vorgabe 5.11.). Der Puffer sorgt dafür,
    dass dessen eigene Takt-Zeit nicht noch einmal vergeben wird und gestreute Zeiten nie vor `nach` liegen."""
    nach = nach + dt.timedelta(minutes=V.STREUUNG_MIN)
    out, tag = [], nach.replace(hour=0, minute=0, second=0, microsecond=0)
    while len(out) < anzahl:
        tagestakt = takt or TAKT[platform]
        if einmal_test and platform == "tiktok" and tag.date() in TIKTOK_EINMAL:
            tagestakt = TIKTOK_EINMAL_TAKT
        for h, m in tagestakt:
            z = tag.replace(hour=h, minute=m)
            if z > nach and len(out) < anzahl:
                out.append(z)
        tag += dt.timedelta(days=1)
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("staffel", help="z. B. s01")
    ap.add_argument("--probe", action="store_true", help="alles prüfen und vorbereiten, aber nichts pushen")
    ap.add_argument("--ab", type=int, default=1, help="nur Folgen ab dieser Nummer posten (z. B. 2: Folge 1 bleibt, Jonathan 6.11.)")
    ap.add_argument("--ersetzen", metavar="SUFFIX", help="neu vertonte Fassung: neue Post-IDs mit -SUFFIX (die alten vorher in plan.loeschen eintragen)")
    a = ap.parse_args(argv)

    daten = json.loads(STAFFELN.read_text(encoding="utf-8"))
    st = next((x for x in daten["staffeln"] if x["id"] == a.staffel), None)
    if not st:
        print(f"Staffel „{a.staffel}“ fehlt in {STAFFELN.relative_to(ROOT)}"); return 1
    for feld in ("titel", "beschreibung", "hashtags", "folgen"):
        if not st.get(feld):
            print(f"Feld „{feld}“ fehlt bei {a.staffel}"); return 1

    # XL-Staffeln (Format-Rotation, Jonathans Wunsch 2.11.): Folgen bis 2 min, ungeteilt auf allen Plattformen
    band = str((st.get("format") or {}).get("laengenband", "")).lower()
    max_folge = MAX_HORROR if band.startswith(("horror", "lang-2-3")) else MAX_XL if band.startswith(("xl", "gemischt")) else MAX_FOLGE
    min_folge = MIN_HORROR if band.startswith("horror") else MIN_DAUER
    # 1) Jede Folge: Lautheit angleichen, prüfen
    folgen, fehler = [], []
    for f in st["folgen"]:
        fid = f"{a.staffel}-f{f['nr']:02d}"
        roh = ROOT / "ausgabe" / f"taeglich-{fid}.mp4"
        if not roh.exists():
            fehler.append(f"{fid}: nicht gerendert"); continue
        fertig = ROOT / "ausgabe" / f"taeglich-{fid}-fertig.mp4"
        V.angleichen(roh, fertig)
        erg = V.pruefe(fertig, max_dauer=max_folge, min_dauer=min_folge)
        print(f"{fid}: {json.dumps(erg, ensure_ascii=False)}")
        if not erg["ok"]:
            fehler.append(f"{fid}: {erg['grund']}")
        folgen.append({**f, "id": fid, "datei": fertig, "pruefung": erg, "karte": karten_dauer(ROOT / "taeglich" / "episoden" / f"{fid}.txt")})
    if fehler:
        print("NICHT veröffentlicht:\n  " + "\n  ".join(fehler)); return 1
    # Nie „Fortsetzung folgt“ (Issue #11): steht die Karte doch am Ende, aus der einzelnen Folge herausschneiden
    for f in folgen:
        if f["karte"]:
            print(f"{f['id']}: „Fortsetzung folgt“-Karte am Ende gefunden – wird herausgeschnitten")
            ohne = f["datei"].with_name(f["datei"].stem + "-ohne-karte.mp4")
            teil_schneiden([{**f, "karte": f["karte"]}], ohne)
            f["datei"], f["karte"] = ohne, 0.0
            f["pruefung"] = V.pruefe(ohne, max_dauer=max_folge, min_dauer=MIN_DAUER)
            if not f["pruefung"]["ok"]:
                print(f"NICHT veröffentlicht: {f['id']}: {f['pruefung']['grund']}"); return 1

    # 2) TikTok-Sammelteile
    teile_def = st.get("tiktok_teile") or tiktok_teile_standard(len(folgen))
    teile = []
    for k, nrn in enumerate(teile_def, 1):
        ziel = ROOT / "ausgabe" / f"taeglich-{a.staffel}-tiktok-teil-{k}.mp4"
        teil_schneiden([folgen[n - 1] for n in nrn], ziel)
        erg = V.pruefe(ziel, max_dauer=MAX_TEIL, min_dauer=MIN_DAUER)
        print(f"TikTok Teil {k} (Folge {nrn[0]}–{nrn[-1]}): {json.dumps(erg, ensure_ascii=False)}")
        if not erg["ok"]:
            print("NICHT veröffentlicht."); return 1
        teile.append({"k": k, "folgen": nrn, "datei": ziel, "pruefung": erg})

    # 3) Ablage auf youtube-upload (Teil-Klon) + geprueft.json
    yu = V.klonen("youtube-upload", ["/geprueft.json", "/pruefen.py", "/README.md", "/taeglich/", "/taeglich-tiktok/"], "youtube-upload")
    g = json.loads((yu / "geprueft.json").read_text(encoding="utf-8"))
    dateien = []
    for f in folgen:
        pfad = f"taeglich/{f['id']}.mp4"; dateien.append((pfad, f["datei"])); g.setdefault("dateien", {})[pfad] = f["pruefung"]
    for t in teile:
        pfad = f"taeglich-tiktok/{a.staffel}-teil-{t['k']}.mp4"; dateien.append((pfad, t["datei"])); g["dateien"][pfad] = t["pruefung"]
    for pfad, quelle in dateien:
        mb = quelle.stat().st_size / 1e6
        if mb > 95:
            print(f"{pfad}: {mb:.0f} MB – zu groß für GitHub (höchstens 95 MB). Nichts veröffentlicht."); return 1
        (yu / pfad).parent.mkdir(parents=True, exist_ok=True); shutil.copy(quelle, yu / pfad)
    g.setdefault("taeglich_staffeln", {})[a.staffel] = {"titel": st["titel"], "folgen": len(folgen), "tiktok_teile": teile_def}
    (yu / "geprueft.json").write_text(json.dumps(g, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    pp = (yu / "pruefen.py").read_text(encoding="utf-8")
    if '"taeglich-tiktok"' not in pp and 'sorted((ROOT / "taeglich").glob("*.mp4")):' in pp:
        pp = pp.replace('sorted((ROOT / "taeglich").glob("*.mp4")):', 'sorted((ROOT / "taeglich").glob("*.mp4")) + sorted((ROOT / "taeglich-tiktok").glob("*.mp4")):')
        (yu / "pruefen.py").write_text(pp, encoding="utf-8")
    V.lauf("git", "add", "-A", cwd=yu)
    V.lauf("git", "commit", "-q", "-m", V.commit_text(f"Kurzvideo-Staffel {a.staffel}: {st['titel']} ({len(folgen)} Folgen, {len(teile)} TikTok-Teile, alle geprüft)"), cwd=yu)
    if a.probe:
        print("(Probe) youtube-upload: Commit vorbereitet, nicht gepusht")
    else:
        V.pushen(yu, "youtube-upload")
        for pfad, quelle in dateien:
            V.warten_auf_raw(RAW.format(pfad=pfad), quelle.stat().st_size)

    # 4) Posts hinten anhängen
    repo_main = V.klonen("main", ["/posten/"], "main")
    plan_datei = repo_main / "posten" / "plan.json"
    plan = json.loads(plan_datei.read_text(encoding="utf-8"))
    loeschen, ids = set(plan.get("loeschen") or []), {p["id"] for p in plan["posts"]}
    endung = f"-{a.ersetzen}" if a.ersetzen else ""
    # neue Fassung: Text leicht anders, sonst lehnt Zernio den Post als Doppel ab (gleicher Inhalt innerhalb von 24 h, 5./6.11.)
    neu_txt = ""
    frueh = dt.datetime.now(V.BERLIN).replace(tzinfo=None, second=0, microsecond=0) + VORLAUF
    em, tags_txt, titel = st.get("emoji", ""), " ".join(st["hashtags"]), st["titel"]
    if a.ersetzen:  # neue Fassung: Text leicht anders, sonst sperrt Zernio den gleichen Inhalt 24 h
        tags_txt += " #serie"
    neu = []

    def anhaengen(platform: str, eintraege: list[dict]) -> None:
        eintraege = [e for e in eintraege if e["id"] not in ids]
        if not eintraege:
            return
        letzte = letzte_zeit(plan["posts"], loeschen, platform)
        start = max(letzte, frueh) if letzte else frueh
        for e, z in zip(eintraege, naechste_slots(platform, start, len(eintraege), einmal_test=True)):
            z = V.streuen(z)  # 0–30 min früher oder später (Vorgabe 5.11.)
            post = {"id": e.pop("id"), "platform": platform, "zeit": z.strftime("%Y-%m-%dT%H:%M:00"), "serie": "taeglich", **e}
            plan["posts"].append(post); neu.append(post)

    def weiter(f: dict, konto: str | None) -> str:
        # Analyse 1.11. (Punkt 8): nicht mehr zu TikTok schicken, sondern ums Folgen bitten (ohne Frage)
        letzte = f["nr"] >= len(folgen)
        if konto:
            return (f"Folg {konto} für die nächste Staffel." if letzte
                    else f"Folge {f['nr'] + 1} kommt als Nächstes. Folg {konto}, damit du sie nicht verpasst.")
        return ("Abonnier den Kanal für die nächste Staffel." if letzte
                else f"Folge {f['nr'] + 1} kommt als Nächstes. Abonnier den Kanal, damit du sie nicht verpasst.")

    anhaengen("tiktok", [{
        "id": f"taeglich-tiktok-{a.staffel}-teil-{t['k']}{endung}",
        "video": RAW.format(pfad=f"taeglich-tiktok/{a.staffel}-teil-{t['k']}.mp4"),
        "text": (f"{titel} – Teil {t['k']}/{len(teile)} (Folge {t['folgen'][0]}–{t['folgen'][-1]}) {em}\n"
                 + " · ".join(st["folgen"][n - 1]["titel"] for n in t["folgen"])
                 + f"\n{st['beschreibung']}\n"
                 # neue Fassung: Text leicht anders, Zernio sperrt identischen Inhalt 24 h (5.11.)
                 + ("Folg mir, damit du den nächsten Teil nicht verpasst!" if endung else "Folg mir, damit du keinen Teil verpasst!")
                 + f"\n\n{tags_txt} #fyp")} for t in teile if t["folgen"][0] >= a.ab])
    anhaengen("instagram", [{
        "id": f"taeglich-insta-{f['id']}{endung}", "video": RAW.format(pfad=f"taeglich/{f['id']}.mp4"),
        "text": f"{titel} – Folge {f['nr']}: {f['titel']} {em}\n{f.get('beschreibung') or st['beschreibung']}\n{weiter(f, '@sto.rys4you')}{neu_txt}\n\n{tags_txt} #reels"} for f in folgen if f["nr"] >= a.ab])
    anhaengen("youtube", [{
        "id": f"taeglich-yt-{f['id']}{endung}", "video": RAW.format(pfad=f"taeglich/{f['id']}.mp4"),
        "titel": f"{titel} – Folge {f['nr']}: {f['titel']} {em} #shorts"[:100],
        "tags": (st.get("tags") or ["animation", "story"]) + ["shorts"],
        "text": f"{f.get('beschreibung') or st['beschreibung']}\n{weiter(f, None)}{neu_txt}\n\n{tags_txt} #shorts"} for f in folgen if f["nr"] >= a.ab])

    for p in neu:
        print(f"  {p['id']}: {p['zeit']}")
    # Issue #14: Instagram/YouTube höchstens 1 Tag hinter TikTok
    erste = {pl: min((p["zeit"] for p in neu if p["platform"] == pl), default=None) for pl in ("tiktok", "instagram", "youtube")}
    if erste["tiktok"]:
        for pl in ("instagram", "youtube"):
            if erste[pl] and dt.datetime.fromisoformat(erste[pl]) - dt.datetime.fromisoformat(erste["tiktok"]) > dt.timedelta(days=1):
                print(f"WARNUNG: {pl} beginnt {erste[pl]}, mehr als 1 Tag nach TikTok ({erste['tiktok']}) – Issue #14: Jonathan Bescheid geben")
    if not neu:
        print("Alle Posts stehen schon im Plan."); return 0
    plan_datei.write_text(json.dumps(plan, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    V.lauf("git", "add", "posten/plan.json", cwd=repo_main)
    V.lauf("git", "commit", "-q", "-m", V.commit_text(f"Kurzvideo-Staffel {a.staffel} hinten anhängen: {titel} ({len(neu)} Posts)"), cwd=repo_main)
    if a.probe:
        print("(Probe) main: Commit vorbereitet, nicht gepusht"); return 0
    V.pushen(repo_main, "main")
    print("Plan gepusht – der Workflow „Posts einplanen“ prüft jedes Video und plant bei Zernio ein. Bis er fertig ist, nichts auf main pushen.")

    if a.ersetzen:
        st["ersetzt"] = {**(st.get("ersetzt") or {}), **(st.get("veroeffentlicht") or {})}
    st["veroeffentlicht"] = {p["id"]: p["zeit"] for p in neu}
    STAFFELN.write_text(json.dumps(daten, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("staffeln.json aktualisiert – jetzt den Branch „taeglich“ committen und pushen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
