"""Englische Fassung einer Kurzvideo-Staffel auf TikTok @storys4you_eng posten (Jonathans Wunsch 3.11.).

    python taeglich/staffel_englisch.py s02            # alles
    python taeglich/staffel_englisch.py s02 --probe    # prüfen und vorbereiten, nichts pushen

- Nur TikTok, Account storys4you_eng (2. Zernio-Konto). Sammelteile wie auf Deutsch (Issue #7), gleiche Teilgrenzen.
- Takt: 1 Teil pro Tag um 01:00 Uhr Berlin (= 19:00 New York, 16:00 Los Angeles, 00:00 London: Abendspitze der
  englischsprachigen Zuschauer, kollidiert mit keinem deutschen Slot). Hinten angehängt an den letzten englischen Post.
- Sobald der englische TikTok-Account so viele Follower hat wie der deutsche (Zahlen aus posten/analyse.json), gleich oft
  wie Deutsch: 08, 12, 16, 20 Uhr.
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
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import veroeffentlichen as V  # noqa: E402
import staffel_veroeffentlichen as S  # noqa: E402

ROOT = V.ROOT
KONTO_EN, KONTO_DE = "storys4you_eng", "storys4you.de1"
TAKT_START = [(1, 0)]  # 1 pro Tag


def takt_en(analyse: Path) -> list:
    try:
        konten = json.loads(analyse.read_text(encoding="utf-8")).get("konten", [])
        f = {k.get("username"): k.get("follower") for k in konten if k.get("platform") == "tiktok"}
        de, en = f.get(KONTO_DE), f.get(KONTO_EN)
        if de is not None and en is not None and en >= de:
            print(f"Englischer Account hat aufgeholt ({en} ≥ {de} Follower) → gleich oft wie Deutsch")
            return S.TAKT["tiktok"]
        print(f"Follower TikTok: Deutsch {de}, Englisch {en} → 1 Teil pro Tag um 01:00")
    except Exception as e:  # noqa: BLE001
        print(f"Follower nicht lesbar ({e}) → 1 Teil pro Tag")
    return TAKT_START


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("staffel")
    ap.add_argument("--probe", action="store_true")
    a = ap.parse_args(argv)

    daten = json.loads(S.STAFFELN.read_text(encoding="utf-8"))
    st = next((x for x in daten["staffeln"] if x["id"] == a.staffel), None)
    en = (st or {}).get("en") or {}
    for feld in ("titel", "beschreibung", "hashtags", "folgen"):
        if not en.get(feld):
            print(f"staffeln.json → {a.staffel}.en.{feld} fehlt"); return 1
    max_folge = S.MAX_XL if str((st.get("format") or {}).get("laengenband", "")).lower().startswith(("xl", "gemischt")) else S.MAX_FOLGE

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

    yu = V.klonen("youtube-upload", ["/geprueft.json", "/pruefen.py", "/README.md", "/taeglich-tiktok-en/"], "youtube-upload")
    g = json.loads((yu / "geprueft.json").read_text(encoding="utf-8"))
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
        for t in teile:
            V.warten_auf_raw(S.RAW.format(pfad=t["pfad"]), t["datei"].stat().st_size)

    repo_main = V.klonen("main", ["/posten/"], "main")
    plan_datei = repo_main / "posten" / "plan.json"
    plan = json.loads(plan_datei.read_text(encoding="utf-8"))
    loeschen, ids = set(plan.get("loeschen") or []), {p["id"] for p in plan["posts"]}
    takt = takt_en(repo_main / "posten" / "analyse.json")
    frueh = dt.datetime.now(V.BERLIN).replace(tzinfo=None, second=0, microsecond=0) + S.VORLAUF
    letzte = S.letzte_zeit(plan["posts"], loeschen, "tiktok", KONTO_EN)
    start = max(letzte, frueh) if letzte else frueh
    tags_txt, em = " ".join(en["hashtags"]), st.get("emoji", "")
    neu_teile = [t for t in teile if f"taeglich-tiktok-en-{a.staffel}-teil-{t['k']}" not in ids]
    neu = []
    for t, z in zip(neu_teile, S.naechste_slots("tiktok", start, len(neu_teile), takt)):
        post = {"id": f"taeglich-tiktok-en-{a.staffel}-teil-{t['k']}", "platform": "tiktok", "konto": KONTO_EN,
                "zeit": z.strftime("%Y-%m-%dT%H:%M:00"), "serie": "taeglich-en", "video": S.RAW.format(pfad=t["pfad"]),
                "text": (f"{en['titel']} – Part {t['k']}/{len(teile)} (Episode {t['folgen'][0]}–{t['folgen'][-1]}) {em}\n"
                         + " · ".join(en["folgen"][n - 1] for n in t["folgen"])
                         + f"\n{en['beschreibung']}\nFollow so you don't miss a part!\n\n{tags_txt} #fyp")}
        plan["posts"].append(post); neu.append(post); print(f"  {post['id']}: {post['zeit']}")
    if not neu:
        print("Alle englischen Posts stehen schon im Plan."); return 0
    plan_datei.write_text(json.dumps(plan, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    V.lauf("git", "add", "posten/plan.json", cwd=repo_main)
    V.lauf("git", "commit", "-q", "-m", V.commit_text(f"Kurzvideo-Staffel {a.staffel} englisch hinten anhängen ({len(neu)} TikTok-Posts @{KONTO_EN})"), cwd=repo_main)
    if a.probe:
        print("(Probe) main: Commit vorbereitet, nicht gepusht"); return 0
    V.pushen(repo_main, "main")
    print("Plan gepusht – der Workflow „Posts einplanen“ plant bei Zernio auf @storys4you_eng ein.")
    en["veroeffentlicht"] = {p["id"]: p["zeit"] for p in neu}
    S.STAFFELN.write_text(json.dumps(daten, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("staffeln.json aktualisiert – jetzt den Branch „taeglich“ committen und pushen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
