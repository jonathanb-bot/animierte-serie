#!/usr/bin/env python3
"""Zusätzliche Kennzahlen zu posten/analyse.json (ergänzt taeglich/analyse_auswerten.py).

Aufruf:  python3 .claude/skills/serien-analytics/kennzahlen.py [posten/analyse.json]

Rechnet, was das Grundskript nicht macht:
- Hook: Anteil der Zuschauer, die nach 3 s noch da sind (aus TikToks retentionCurve)
- Bindung bei 25/50/75 % der Videolänge
- Ø Wiedergabe in Sekunden und in % der Länge
- Anteil "Für dich", Anteil neue Zuschauer, Follows und Shares pro 1.000 Aufrufe
- Leistungsfaktor: Aufrufe / Median der Aufrufe derselben Plattform (>2 Ausreißer, <0,5 Flop)
- Serien-Durchhalten: Aufrufe Folge/Teil n+1 im Verhältnis zu n (gleiche Serie, gleiche Plattform)
"""
import json
import re
import statistics
import sys
from datetime import datetime


def kurve(a: dict) -> dict[int, float]:
    return {int(k.split(".", 1)[1]): float(v) for k, v in a.items() if k.startswith("retentionCurve.") and v is not None}


def bei(rc: dict[int, float], sek: float):
    """Lineare Interpolation der Bindung (0–1) bei `sek` Sekunden."""
    if not rc:
        return None
    ks = sorted(rc)
    if sek <= ks[0]:
        return rc[ks[0]]
    for a, b in zip(ks, ks[1:]):
        if a <= sek <= b:
            return rc[a] + (rc[b] - rc[a]) * (sek - a) / (b - a or 1)
    return rc[ks[-1]]


def pct(x):
    return "–" if x is None else f"{x * 100:.0f} %"


def num(x, d=1):
    return "–" if x is None else f"{x:.{d}f}"


def tabelle(zeilen, kopf):
    out = ["| " + " | ".join(kopf) + " |", "|" + "---|" * len(kopf)]
    out += ["| " + " | ".join(str(z) for z in r) + " |" for r in zeilen]
    return "\n".join(out)


def main(pfad="posten/analyse.json"):
    d = json.load(open(pfad, encoding="utf8"))
    jetzt = datetime.fromisoformat(d.get("erstellt", datetime.now().isoformat())[:19])
    posts = []
    for p in d.get("posts", []):
        a = p.get("analytics") or {}
        views = a.get("views")
        if not views:
            continue
        rc = kurve(a)
        dauer = a.get("videoDurationSeconds") or (max(rc) if rc else None)
        watch_ms = a.get("igReelsAvgWatchTime")
        watch = watch_ms / 1000 if watch_ms else None
        imp = a.get("impressions") or 0
        fy = a.get("impressionSources.forYou")
        neu = a.get("audienceTypes.newViewer")
        alter = None
        try:
            alter = (jetzt - datetime.fromisoformat(p["zeit"][:19])).total_seconds() / 3600
        except Exception:
            pass
        posts.append({
            "id": p.get("id") or "(extern)", "pl": p["platform"], "serie": p.get("serie") or "", "video": p.get("video") or "",
            "views": views, "alter_h": alter,
            "hook3": bei(rc, 3), "b25": bei(rc, dauer * .25) if dauer and rc else None,
            "b50": bei(rc, dauer * .5) if dauer and rc else None, "b75": bei(rc, dauer * .75) if dauer and rc else None,
            "watch": watch, "watch_pct": watch / dauer if watch and dauer else None,
            # Instagram/YouTube liefern über Zernio meist 0 statt "keine Angabe"
            "abschluss": a.get("completionRate") if (a.get("completionRate") or p["platform"] == "tiktok") else None,
            # Zernio liefert Anteile teils als 0–1, teils als 0–100 bzw. als absolute Zahl
            "fy": (fy / 100 if fy and fy > 1 else fy) if fy is not None else None,
            "neu": (neu / 100 if neu and neu > 1 else neu) if neu is not None else None,
            "follows_k": (a.get("follows") or 0) * 1000 / views, "shares_k": (a.get("shares") or 0) * 1000 / views,
        })
    if not posts:
        print("Keine Posts mit Aufrufen in", pfad)
        return 1

    for pl in sorted({x["pl"] for x in posts}):
        g = [x for x in posts if x["pl"] == pl]
        med = statistics.median(x["views"] for x in g)
        for x in g:
            x["faktor"] = x["views"] / med if med else None
        print(f"\n## {pl} ({len(g)} Posts, Median {med:.0f} Aufrufe)\n")
        zeilen = []
        for x in sorted(g, key=lambda x: -x["views"]):
            urteil = "Ausreißer" if x["faktor"] and x["faktor"] >= 2 else "Flop" if x["faktor"] and x["faktor"] < .5 else ""
            if x["alter_h"] is not None and x["alter_h"] < 24:
                urteil = (urteil + " (jünger 24 h)").strip()
            zeilen.append([x["id"], x["views"], num(x["faktor"]), pct(x["hook3"]), pct(x["b25"]), pct(x["b50"]), pct(x["b75"]),
                           num(x["watch"], 0), pct(x["watch_pct"]), pct(x["abschluss"]), pct(x["fy"]), pct(x["neu"]),
                           num(x["follows_k"]), num(x["shares_k"]), urteil])
        print(tabelle(zeilen, ["Post", "Aufrufe", "Faktor", "Hook 3 s", "25 %", "50 %", "75 %", "Ø s", "Ø %",
                               "Abschluss", "Für dich", "Neue", "Follows/1k", "Shares/1k", "Urteil"]))
        h = [x["hook3"] for x in g if x["hook3"] is not None]
        if h:
            print(f"\nMedian Hook (3 s): {pct(statistics.median(h))} – Anteil, der in den ersten 3 Sekunden bleibt.")

    print("\n## Serien-Durchhalten (Aufrufe Teil n+1 / Teil n)\n")
    zeilen = []
    for (pl, serie) in sorted({(x["pl"], x["serie"]) for x in posts if x["serie"] and x["serie"] != "extern"}):
        def nr(x):
            m = re.findall(r"\d+", x["video"])
            return tuple(int(n) for n in m) if m else (0,)
        g = sorted([x for x in posts if x["pl"] == pl and x["serie"] == serie], key=nr)
        for a, b in zip(g, g[1:]):
            zeilen.append([pl, serie, f"{a['id']} → {b['id']}", a["views"], b["views"], pct(b["views"] / a["views"])])
    print(tabelle(zeilen, ["Plattform", "Serie", "Schritt", "Aufrufe n", "Aufrufe n+1", "Verhältnis"]) if zeilen else "Zu wenig Daten.")
    print("\nHinweis: Unter ca. 10 Posts pro Gruppe nur als Tendenz werten. Jüngere Posts haben weniger Aufrufe, "
          "deshalb Faktor nur zwischen ähnlich alten Posts vergleichen (oder Aufrufe/h aus analyse_auswerten.py nehmen).")
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:2]))
