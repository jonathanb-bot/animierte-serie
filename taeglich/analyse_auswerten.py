"""Wertet die Zernio-Analytics aller veröffentlichten Posts aus (für die Aufgabe „Analyse vor der Staffel“).

    python taeglich/analyse_auswerten.py                 # liest posten/analyse.json + plan.json von origin/main
    python taeglich/analyse_auswerten.py --datei a.json  # andere Analyse-Datei

Gibt Markdown-Tabellen aus: Überblick je Plattform und Serie, Top 5 / Flop 5 je Plattform (nach Aufrufen pro Stunde,
höchstens über 72 h gerechnet, damit alte und neue Posts vergleichbar sind), Uhrzeiten, Stimmungen der Kurzvideo-Staffeln.
Zernio liefert je Plattform andere Feldnamen; das Skript sucht die passenden Werte selbst.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import statistics
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
STAFFELN_DATEI = ROOT / "taeglich" / "staffeln.json"
BERLIN = ZoneInfo("Europe/Berlin")
# bevorzugte Namen je Kennzahl (letztes Pfadstück, klein geschrieben, ohne _)
KENNZAHLEN = {
    "aufrufe": ["views", "videoviews", "plays", "videoplays", "playcount", "viewcount"],
    "likes": ["likes", "likecount", "reactions"],
    "kommentare": ["comments", "commentcount"],
    "shares": ["shares", "sharecount", "reposts"],
    "saves": ["saves", "saved", "bookmarks"],
    "reichweite": ["reach", "accountsreached"],
    "impressionen": ["impressions"],
    "wiedergabe_s": ["averagewatchtime", "avgwatchtime", "igreelsavgwatchtime", "averageviewduration"],
    "abbruch": ["reelsskiprate", "skiprate"],
    "abschluss": ["completionrate"],
}


def git_show(pfad: str) -> str:
    return subprocess.run(["git", "show", f"origin/main:{pfad}"], cwd=ROOT, capture_output=True, text=True, check=True).stdout


def wert(analytics: dict, namen: list[str]) -> float | None:
    """Erste passende Zahl; bei mehreren Treffern desselben Namens die größte (z. B. Summe vs. Teilwert)."""
    norm = {}
    for k, v in analytics.items():
        if isinstance(v, (int, float)):
            letzter = re.sub(r"\[\d+\]", "", k).split(".")[-1].lower().replace("_", "")
            norm.setdefault(letzter, []).append(v)
    for n in namen:
        if n in norm:
            return max(norm[n])
    return None


def folge_von(video: str | None, staffeln: dict, text: str = "") -> dict:
    """Was steckt im Video? Serie, Folge, bei Kurzvideo-Staffeln Titel und Stimmung."""
    if not video:
        return {"inhalt": (text or "extern")[:50], "stimmung": ""}
    m = re.match(r"taeglich/(s\d+z?)-f(\d+)\.mp4", video)
    if m:
        st = staffeln.get(m.group(1), {})
        f = next((x for x in st.get("folgen", []) if x.get("nr") == int(m.group(2))), {})
        return {"inhalt": f"{st.get('titel', m.group(1))} F{int(m.group(2))}: {f.get('titel', '')}", "stimmung": f.get("stimmung", "")}
    m = re.match(r"taeglich-tiktok/(s\d+z?)-teil-(\d+)\.mp4", video)
    if m:
        return {"inhalt": f"{staffeln.get(m.group(1), {}).get('titel', m.group(1))} TikTok-Teil {m.group(2)}", "stimmung": ""}
    m = re.match(r"taeglich/(video-\d+)\.mp4", video)
    if m:
        return {"inhalt": f"Einzelvideo {m.group(1)}", "stimmung": "warm" if m.group(1) == "video-001" else ""}
    return {"inhalt": video.replace(".mp4", ""), "stimmung": ""}


def tabelle(zeilen: list[list], kopf: list[str]) -> str:
    out = ["| " + " | ".join(kopf) + " |", "|" + "---|" * len(kopf)]
    for z in zeilen:
        out.append("| " + " | ".join("–" if v is None else (f"{v:,.0f}".replace(",", ".") if isinstance(v, float) and v >= 100 else (f"{v:.1f}" if isinstance(v, float) else str(v))) for v in z) + " |")
    return "\n".join(out)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--datei", help="Analyse-JSON (Standard: posten/analyse.json auf origin/main)")
    a = ap.parse_args(argv)
    subprocess.run(["git", "fetch", "-q", "origin", "main"], cwd=ROOT)
    daten = json.loads(Path(a.datei).read_text() if a.datei else git_show("posten/analyse.json"))
    plan = json.loads(git_show("posten/plan.json"))
    stp = ROOT / "taeglich" / "staffeln.json"
    staffeln = {s["id"]: s for s in json.loads(stp.read_text()).get("staffeln", [])} if stp.exists() else {}
    erstellt = dt.datetime.fromisoformat(daten["erstellt"].replace("Z", "+00:00")).astimezone(BERLIN).replace(tzinfo=None)

    posts = []
    for p in daten["posts"]:
        if not p.get("analytics"):
            continue
        k = {name: wert(p["analytics"], namen) for name, namen in KENNZAHLEN.items()}
        if k["wiedergabe_s"] and k["wiedergabe_s"] > 300:  # Instagram liefert Millisekunden
            k["wiedergabe_s"] = k["wiedergabe_s"] / 1000
        if not p.get("zeit"):
            continue
        alter_h = max(0.5, (erstellt - dt.datetime.fromisoformat(p["zeit"])).total_seconds() / 3600)
        basis = k["aufrufe"] or k["impressionen"] or k["reichweite"]
        interaktion = sum(v or 0 for v in (k["likes"], k["kommentare"], k["shares"], k["saves"]))
        posts.append({**p, **k, **folge_von(p.get("video"), staffeln, p.get("text", "")), "id": p.get("id") or "extern", "alter_h": alter_h,
                      "pro_h": (basis or 0) / min(alter_h, 72), "eng": 100 * interaktion / basis if basis else None,
                      "uhrzeit": p["zeit"][11:16]})

    print(f"# Zernio-Auswertung vom {erstellt:%d.%m.%Y %H:%M}\n")
    print(f"{len(posts)} Posts mit Zahlen, {len(daten['posts']) - len(posts)} ohne, {len(daten.get('fehler', []))} Fehler.")
    if daten.get("fehler"):
        print("Fehler (Auszug): " + "; ".join(daten["fehler"][:5]))
    print("\n## Konten (letzte 30 Tage)\n")
    for kto in daten.get("konten", []):
        zahlen = {k: v for k, v in kto.get("insights_30_tage", {}).items() if isinstance(v, (int, float))}
        print(f"- **{kto['platform']} {kto.get('username')}**: Follower {kto.get('follower')}; "
              + (", ".join(f"{k}={v}" for k, v in list(zahlen.items())[:14]) or kto.get("insights_fehler", "keine Insights")))
    for plat, bt in (daten.get("best_time") or {}).items():
        slots = bt.get("slots") or bt.get("bestTimes") or bt.get("data") or []
        if isinstance(slots, list) and slots:
            print(f"- Beste Zeiten {plat} (UTC, laut Zernio): " + ", ".join(str({k: v for k, v in x.items() if k in ("day_of_week", "dayOfWeek", "hour", "avg_engagement", "avgEngagement", "post_count", "postCount")}) for x in slots[:5]))

    print("\n## Überblick je Plattform und Serie\n")
    gruppen = defaultdict(list)
    for p in posts:
        gruppen[(p["platform"], p["serie"])].append(p)
    zeilen = []
    for (plat, serie), g in sorted(gruppen.items()):
        med = lambda key: statistics.median([x[key] for x in g if x[key] is not None]) if any(x[key] is not None for x in g) else None
        zeilen.append([plat, serie, len(g), sum(x["aufrufe"] or 0 for x in g), med("aufrufe"), med("pro_h"), med("eng"), med("wiedergabe_s")])
    print(tabelle(zeilen, ["Plattform", "Serie", "Posts", "Aufrufe gesamt", "Median Aufrufe", "Median Aufrufe/h", "Median Engagement %", "Median Wiedergabe s"]))

    for plat in sorted({p["platform"] for p in posts}):
        g = sorted([p for p in posts if p["platform"] == plat and p["alter_h"] >= 12], key=lambda x: x["pro_h"], reverse=True)
        if not g:
            continue
        kopf = ["Post", "Inhalt", "Stimmung", "Uhrzeit", "Alter h", "Aufrufe", "Aufrufe/h", "Likes", "Kommentare", "Shares", "Engagement %", "Wiedergabe s", "Abbruch", "Abschluss"]
        z = lambda p: [p["id"], p["inhalt"], p["stimmung"], p["zeit"][5:16].replace("T", " "), p["alter_h"], p["aufrufe"], p["pro_h"], p["likes"], p["kommentare"], p["shares"], p["eng"], p["wiedergabe_s"], p["abbruch"], p["abschluss"]]
        print(f"\n## {plat}: Top 5 (Aufrufe pro Stunde, Posts ab 12 h alt)\n")
        print(tabelle([z(p) for p in g[:5]], kopf))
        rest = g[5:]
        if rest:  # Flop nur aus Posts, die nicht schon in den Top 5 stehen
            print(f"\n## {plat}: Flop {min(5, len(rest))}\n")
            print(tabelle([z(p) for p in rest[-5:][::-1]], kopf))

    print("\n## Uhrzeiten (Median Aufrufe pro Stunde)\n")
    uhr = defaultdict(list)
    for p in posts:
        if p["alter_h"] >= 12:
            uhr[(p["platform"], p["uhrzeit"])].append(p["pro_h"])
    print(tabelle([[pl, u, len(v), statistics.median(v)] for (pl, u), v in sorted(uhr.items())], ["Plattform", "Uhrzeit", "Posts", "Median Aufrufe/h"]))

    stim = defaultdict(list)
    for p in posts:
        if p["stimmung"] and p["alter_h"] >= 12:
            stim[(p["platform"], p["stimmung"])].append(p["pro_h"])
    if stim:
        print("\n## Stimmungen der Kurzvideos (Median Aufrufe pro Stunde)\n")
        print(tabelle([[pl, s, len(v), statistics.median(v)] for (pl, s), v in sorted(stim.items())], ["Plattform", "Stimmung", "Posts", "Median Aufrufe/h"]))
    # Format-Vergleich (Jonathans Wunsch 2.11.): Länge, Folgenzahl, Hook-Text – aus taeglich/videodaten.json
    vd_datei = ROOT / "taeglich" / "videodaten.json"
    vd = json.loads(vd_datei.read_text(encoding="utf-8")) if vd_datei.exists() else {}
    def vdaten(p):
        v = str(p.get("video") or "")
        v = v.split("youtube-upload/")[-1]
        return vd.get(v)
    format_gruppen = {"Längenband": defaultdict(list), "Folgen pro Staffel": defaultdict(list), "Hook-Text": defaultdict(list), "Staffel": defaultdict(list)}
    # Test- und Analysephase bis 22.11. (Jonathans Vorgabe 4.11.): Vielfalt je Staffel/Folge vergleichen.
    # Quelle: staffeln.json → vielfalt {welt, genre, erzaehlform, hook_art, …} und cliffhanger (Liste je Folge).
    st_info = {x["id"]: x for x in json.loads(STAFFELN_DATEI.read_text(encoding="utf-8")).get("staffeln", [])} if STAFFELN_DATEI.exists() else {}
    VIELFALT = {"welt": "Welt/Hauptort", "genre": "Genre", "erzaehlform": "Erzählform", "hook_art": "Hook-Art", "vorbild_kurz": "Vorbild"}
    for titel in list(VIELFALT.values()) + ["Cliffhanger-Art", "Kulisse (Video enthält)"]:
        format_gruppen[titel] = defaultdict(list)
    for p in posts:
        v = vdaten(p)
        if not v or p["alter_h"] < 12:
            continue
        anteil = 100 * p["wiedergabe_s"] / v["dauer_s"] if p.get("wiedergabe_s") and v.get("dauer_s") else None
        eintrag = (p["pro_h"], p["wiedergabe_s"], anteil)
        art = "TikTok-Teil" if v["art"] == "tiktok_teil" else "Folge"
        format_gruppen["Längenband"][(p["platform"], f"{art} {v.get('laengenband') or (str(round(v['dauer_s'] or 0)) + ' s')}")].append(eintrag)
        format_gruppen["Folgen pro Staffel"][(p["platform"], str(v.get("folgen_in_staffel")))].append(eintrag)
        format_gruppen["Hook-Text"][(p["platform"], "ja" if v.get("hooktext") else "nein")].append(eintrag)
        format_gruppen["Staffel"][(p["platform"], v["staffel"])].append(eintrag)
        si = st_info.get(v["staffel"], {})
        for k, titel in VIELFALT.items():
            if (si.get("vielfalt") or {}).get(k):
                format_gruppen[titel][(p["platform"], str(si["vielfalt"][k]))].append(eintrag)
        nr = v.get("folge") or (v.get("folgen") or [None])[0]
        ch = si.get("cliffhanger") or []
        if nr and len(ch) >= nr and (v["art"] != "tiktok_teil" or len(v.get("folgen") or []) == 1):
            format_gruppen["Cliffhanger-Art"][(p["platform"], ch[nr - 1])].append(eintrag)
        for kul in v.get("kulissen") or []:
            format_gruppen["Kulisse (Video enthält)"][(p["platform"], kul)].append(eintrag)
    if any(format_gruppen[g] for g in format_gruppen):
        md = lambda xs: statistics.median(xs) if xs else None
        for name, g in format_gruppen.items():
            if not g:
                continue
            print(f"\n## Format-Vergleich: {name} (Median, Posts ab 12 h alt)\n")
            print(tabelle([[pl, k, len(v), md([x[0] for x in v]), md([x[1] for x in v if x[1]]), md([x[2] for x in v if x[2]])]
                           for (pl, k), v in sorted(g.items())], ["Plattform", name, "Posts", "Aufrufe/h", "Wiedergabe s", "Wiedergabe % der Länge"]))
    print("\nHinweis: Unter ca. 10 Posts pro Gruppe ist das nur eine Tendenz.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
