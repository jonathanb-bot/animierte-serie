"""Englische Fassung einer Kurzvideo-Staffel auf TikTok @storys4you_eng posten, dazu auf dem englischen Instagram und
YouTube (3. Zernio-Konto, Jonathans Wunsch 3.11.).

    python taeglich/staffel_englisch.py s02            # alles
    python taeglich/staffel_englisch.py s02 --probe    # prüfen und vorbereiten, nichts pushen
    python taeglich/staffel_englisch.py s02 --ersetzen v2   # neu gerenderte Fassung: alte englische Posts zurückziehen
                                                            # (plan.loeschen) und alles neu einplanen, IDs mit „-v2“

- Nur TikTok, Account storys4you_eng (2. Zernio-Konto). Sammelteile wie auf Deutsch (Issue #7), gleiche Teilgrenzen.
- Takt: 1 Teil pro Tag um 01:00 Uhr Berlin (= 19:00 New York, 16:00 Los Angeles, 00:00 London: Abendspitze der
  englischsprachigen Zuschauer, kollidiert mit keinem deutschen Slot). Hinten angehängt an den letzten englischen Post.
- Eingeholt (Jonathans Erklärung 3.11.): Ist der englische Account beim gleichen Teil wie der deutsche (z. B. beide bei
  „Funkstille“ Teil 5), postet er genauso oft wie der deutsche, also jeden Teil zur selben Zeit wie das deutsche Gegenstück.
  Ein englischer Teil kommt nie vor seinem deutschen Gegenstück.
- Instagram + YouTube englisch (3. Zernio-Konto, Secret ZERNIO_API_KEY_3): jede Folge ein Post wie auf Deutsch,
  eigene Warteschlange, Takt wie Deutsch (Instagram 5× am Tag 08/11/14/17/20, YouTube :30, seit 6.11.), nie vor dem deutschen Gegenstück.
  Konto: "zernio:3" (das Instagram- bzw. YouTube-Konto im 3. Zernio-Konto, ohne Namen). Fehlt der Schlüssel noch,
  meldet der Workflow „kein Konto verbunden“ und versucht es beim nächsten Lauf wieder.
- Alle Regeln der deutschen Staffel gelten: über 1 Minute, Prüfung von Bild/Ton/Lautheit, nie „Fortsetzung folgt“,
  keine Fragen ans Publikum, kein KI-Haken.

Voraussetzungen: `staffeln.json` → Staffel hat `en` mit `titel`, `beschreibung`, `hashtags` und `folgen` (Liste der
englischen Folgentitel), die Drehbücher `taeglich/episoden/sNN-fXX-en.txt` (Kopf mit `@sprache en`) sind vertont und als
`ausgabe/taeglich-sNN-fXX-en.mp4` gerendert.
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
import veroeffentlichen as V  # noqa: E402
import staffel_veroeffentlichen as S  # noqa: E402

ROOT = V.ROOT
KONTO_EN, KONTO_DE = "storys4you_eng", "storys4you.de1"
# Englisches Instagram und YouTube im 3. Zernio-Konto (Jonathan 3.11.). "zernio:3" = das Konto dieser Plattform im
# 3. Zernio-Konto, egal wie es heißt (posten/zernio.mjs). None = aus.
KONTO_EN_INSTA: str | None = "zernio:3"
KONTO_EN_YT: str | None = "zernio:3"
TAKT_START = [(1, 0)]  # 1 pro Tag


def zeiten_en(plan: dict, loeschen: set, staffel: str, teile: list, frueh: dt.datetime) -> list[dt.datetime]:
    """Zeit je englischem Teil (Jonathans Erklärung 3.11.): Englisch startet mit den neuen Staffeln und läuft 1 Teil pro
    Tag um 01:00, hinten an die englische Warteschlange. Der deutsche Account arbeitet währenddessen seinen Vorrat ab.
    Hat Deutsch den Stand von Englisch eingeholt (der deutsche Teil läuft spätestens zum nächsten englischen Tagesslot),
    postet Englisch genauso oft wie Deutsch: jeder Teil zur Zeit seines deutschen Gegenstücks (oder im nächsten
    TikTok-Takt 08/12/16/20, wenn diese Zeit schon vorbei ist)."""
    zeit = {p["id"]: dt.datetime.fromisoformat(p["zeit"]) for p in plan["posts"] if p["id"] not in loeschen}
    en = sorted((z, i) for i, z in zeit.items() if i.startswith("taeglich-tiktok-en-"))
    letzte = en[-1][0] if en else None
    # einmal eingeholt, bleibt es dabei: der letzte englische Teil lief zur Zeit seines deutschen Gegenstücks
    eingeholt = bool(en) and zeit.get(re.sub(r"-v\d+$", "", en[-1][1]).replace("tiktok-en-", "tiktok-")) == letzte
    out = []
    for t in teile:
        de = zeit.get(f"taeglich-tiktok-{staffel}-teil-{t['k']}")
        start = max(letzte, frueh) if letzte else frueh
        taeglich = V.streuen(S.naechste_slots("tiktok", start, 1, TAKT_START)[0])  # ±30 min (5.11.)
        if de and (eingeholt or de <= taeglich):  # Deutsch hat aufgeholt → gleich oft wie Deutsch
            z = de if de > start else V.streuen(S.naechste_slots("tiktok", start, 1)[0])
            art, eingeholt = "eingeholt, Takt wie Deutsch", z == de
        else:
            z, art = taeglich, "1 pro Tag"
        out.append(z); letzte = z
        print(f"  Teil {t['k']}: Deutsch {de}, Englisch {z} ({art})")
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("staffel")
    ap.add_argument("--probe", action="store_true")
    ap.add_argument("--ersetzen", metavar="SUFFIX", help="alte englische Posts der Staffel zurückziehen, neue IDs mit -SUFFIX")
    a = ap.parse_args(argv)

    daten = json.loads(S.STAFFELN.read_text(encoding="utf-8"))
    st = next((x for x in daten["staffeln"] if x["id"] == a.staffel), None)
    en = (st or {}).get("en") or {}
    for feld in ("titel", "beschreibung", "hashtags", "folgen"):
        if not en.get(feld):
            print(f"staffeln.json → {a.staffel}.en.{feld} fehlt"); return 1
    band = str((st.get("format") or {}).get("laengenband", "")).lower()
    max_folge = S.MAX_HORROR if band.startswith(("horror", "lang-2-3")) else S.MAX_XL if band.startswith(("xl", "gemischt")) else S.MAX_FOLGE

    folgen, fehler = [], []
    for f in st["folgen"]:
        fid = f"{a.staffel}-f{f['nr']:02d}"
        roh = ROOT / "ausgabe" / f"taeglich-{fid}-en.mp4"
        if not roh.exists():
            fehler.append(f"{fid}-en: nicht gerendert"); continue
        fertig = ROOT / "ausgabe" / f"taeglich-{fid}-en-fertig.mp4"
        V.angleichen(roh, fertig)
        erg = V.pruefe(fertig, max_dauer=max_folge, min_dauer=S.MIN_DAUER)
        print(f"{fid}-en: {json.dumps(erg, ensure_ascii=False)}")
        if not erg["ok"]:
            fehler.append(f"{fid}-en: {erg['grund']}")
        folgen.append({**f, "id": fid, "datei": fertig, "pruefung": erg,
                       "karte": S.karten_dauer(ROOT / "taeglich" / "episoden" / f"{fid}-en.txt")})
    if fehler:
        print("NICHT veröffentlicht:\n  " + "\n  ".join(fehler)); return 1

    teile_def = st.get("tiktok_teile") or S.tiktok_teile_standard(len(folgen))
    teile = []
    for k, nrn in enumerate(teile_def, 1):
        ziel = ROOT / "ausgabe" / f"taeglich-{a.staffel}-tiktok-en-teil-{k}.mp4"
        S.teil_schneiden([folgen[n - 1] for n in nrn], ziel)
        erg = V.pruefe(ziel, max_dauer=S.MAX_TEIL, min_dauer=S.MIN_DAUER)
        print(f"TikTok EN Teil {k} (Folge {nrn[0]}–{nrn[-1]}): {json.dumps(erg, ensure_ascii=False)}")
        if not erg["ok"]:
            print("NICHT veröffentlicht."); return 1
        teile.append({"k": k, "folgen": nrn, "datei": ziel, "pruefung": erg})

    mit_folgen = bool(KONTO_EN_INSTA or KONTO_EN_YT)
    yu = V.klonen("youtube-upload", ["/geprueft.json", "/pruefen.py", "/README.md", "/taeglich-tiktok-en/", "/taeglich-en/"], "youtube-upload")
    g = json.loads((yu / "geprueft.json").read_text(encoding="utf-8"))
    for f in (folgen if mit_folgen else []):  # jede Folge einzeln für Instagram/YouTube englisch
        pfad = f"taeglich-en/{f['id']}.mp4"
        if f["datei"].stat().st_size / 1e6 > 95:
            print(f"{pfad}: zu groß für GitHub (höchstens 95 MB). Nichts veröffentlicht."); return 1
        (yu / pfad).parent.mkdir(parents=True, exist_ok=True); shutil.copy(f["datei"], yu / pfad)
        g.setdefault("dateien", {})[pfad] = f["pruefung"]; f["pfad"] = pfad
    for t in teile:
        pfad = f"taeglich-tiktok-en/{a.staffel}-teil-{t['k']}.mp4"
        if t["datei"].stat().st_size / 1e6 > 95:
            print(f"{pfad}: zu groß für GitHub (höchstens 95 MB). Nichts veröffentlicht."); return 1
        (yu / pfad).parent.mkdir(parents=True, exist_ok=True); shutil.copy(t["datei"], yu / pfad)
        g.setdefault("dateien", {})[pfad] = t["pruefung"]; t["pfad"] = pfad
    (yu / "geprueft.json").write_text(json.dumps(g, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    V.lauf("git", "add", "-A", cwd=yu)
    V.lauf("git", "commit", "-q", "-m", V.commit_text(f"Kurzvideo-Staffel {a.staffel} englisch: {en['titel']} ({len(teile)} TikTok-Teile, geprüft)"), cwd=yu)
    if a.probe:
        print("(Probe) youtube-upload: Commit vorbereitet, nicht gepusht")
    else:
        V.pushen(yu, "youtube-upload")
        for x in teile + [f for f in folgen if f.get("pfad")]:
            V.warten_auf_raw(S.RAW.format(pfad=x["pfad"]), x["datei"].stat().st_size)

    repo_main = V.klonen("main", ["/posten/"], "main")
    plan_datei = repo_main / "posten" / "plan.json"
    plan = json.loads(plan_datei.read_text(encoding="utf-8"))
    loeschen, ids = set(plan.get("loeschen") or []), {p["id"] for p in plan["posts"]}
    endung = f"-{a.ersetzen}" if a.ersetzen else ""
    if a.ersetzen:  # 5.11.: Stimme neu – alte Fassung überall zurückziehen, auch schon gelaufene Teile
        alt = [p["id"] for p in plan["posts"] if p.get("serie") == "taeglich-en" and p["id"] not in loeschen
               and re.match(rf"taeglich-(tiktok|insta|yt)-en-{a.staffel}-", p["id"]) and not p["id"].endswith(endung)]
        plan.setdefault("loeschen", []).extend(alt); loeschen |= set(alt)
        print(f"  {len(alt)} alte englische Posts zurückgezogen")
    frueh = dt.datetime.now(V.BERLIN).replace(tzinfo=None, second=0, microsecond=0) + S.VORLAUF
    tags_txt, em = " ".join(en["hashtags"]), st.get("emoji", "")
    neu_teile = [t for t in teile if f"taeglich-tiktok-en-{a.staffel}-teil-{t['k']}{endung}" not in ids]
    neu = []
    for t, z in zip(neu_teile, zeiten_en(plan, loeschen, a.staffel, neu_teile, frueh)):
        post = {"id": f"taeglich-tiktok-en-{a.staffel}-teil-{t['k']}{endung}", "platform": "tiktok", "konto": KONTO_EN,
                "zeit": z.strftime("%Y-%m-%dT%H:%M:00"), "serie": "taeglich-en", "video": S.RAW.format(pfad=t["pfad"]),
                "text": (f"{en['titel']} – Part {t['k']}/{len(teile)} (Episode {t['folgen'][0]}–{t['folgen'][-1]}) {em}\n"
                         + " · ".join(en["folgen"][n - 1] for n in t["folgen"])
                         + f"\n{en['beschreibung']}\nFollow so you don't miss a part!\n\n{tags_txt} #fyp")}
        plan["posts"].append(post); neu.append(post); print(f"  {post['id']}: {post['zeit']}")

    # Instagram + YouTube englisch: jede Folge ein Post, eigene Warteschlange je Konto, nie vor dem deutschen Gegenstück
    zeit_de = {p["id"]: dt.datetime.fromisoformat(p["zeit"]) for p in plan["posts"] if p["id"] not in loeschen}
    for platform, konto, kurz in (("instagram", KONTO_EN_INSTA, "insta"), ("youtube", KONTO_EN_YT, "yt")):
        if not konto:
            print(f"{platform} englisch: noch kein Konto eingetragen (KONTO_EN_{kurz.upper()}), übersprungen"); continue
        letzte = S.letzte_zeit(plan["posts"], loeschen, platform, konto)
        for f in folgen:
            pid = f"taeglich-{kurz}-en-{f['id']}{endung}"
            if pid in ids:
                continue
            start = max(letzte, frueh) if letzte else frueh
            de = zeit_de.get(f"taeglich-{kurz}-{f['id']}")
            if de and de > start:
                start = de - dt.timedelta(minutes=1)  # frühestens zur Zeit des deutschen Gegenstücks
            z = V.streuen(S.naechste_slots(platform, start, 1)[0])  # ±30 min (5.11.)
            nr, n = f["nr"], len(folgen)
            weiter = ("Follow for the next season." if nr >= n else f"Episode {nr + 1} is up next. Follow so you don't miss it.")
            post = {"id": pid, "platform": platform, "konto": konto, "zeit": z.strftime("%Y-%m-%dT%H:%M:00"), "serie": "taeglich-en",
                    "video": S.RAW.format(pfad=f["pfad"])}
            if platform == "youtube":
                post["titel"] = f"{en['titel']} – Episode {nr}: {en['folgen'][nr - 1]} {em} #shorts"[:100]
                post["tags"] = (en.get("tags") or ["animation", "story"]) + ["shorts"]
                post["text"] = f"{en['beschreibung']}\n{weiter}\n\n{tags_txt} #shorts"
            else:
                post["text"] = f"{en['titel']} – Episode {nr}: {en['folgen'][nr - 1]} {em}\n{en['beschreibung']}\n{weiter}\n\n{tags_txt} #reels"
            plan["posts"].append(post); neu.append(post); letzte = z; print(f"  {pid}: {post['zeit']}")
    if not neu:
        print("Alle englischen Posts stehen schon im Plan."); return 0
    plan_datei.write_text(json.dumps(plan, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    V.lauf("git", "add", "posten/plan.json", cwd=repo_main)
    V.lauf("git", "commit", "-q", "-m", V.commit_text(f"Kurzvideo-Staffel {a.staffel} englisch hinten anhängen ({len(neu)} Posts: TikTok @{KONTO_EN}"
                                                        f"{', Instagram/YouTube englisch' if mit_folgen else ''})"), cwd=repo_main)
    if a.probe:
        print("(Probe) main: Commit vorbereitet, nicht gepusht"); return 0
    V.pushen(repo_main, "main")
    print("Plan gepusht – der Workflow „Posts einplanen“ plant bei Zernio auf den englischen Konten ein.")
    if a.ersetzen:
        en["ersetzt"] = {**(en.get("ersetzt") or {}), **(en.get("veroeffentlicht") or {})}
    en["veroeffentlicht"] = {p["id"]: p["zeit"] for p in neu}
    S.STAFFELN.write_text(json.dumps(daten, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("staffeln.json aktualisiert – jetzt den Branch „taeglich“ committen und pushen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
