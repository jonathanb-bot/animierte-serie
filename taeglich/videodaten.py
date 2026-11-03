"""Messwerte jedes Kurzvideos für die Analyse festhalten (Jonathans Wunsch 2.11.: Länge, Folgenzahl und alles dokumentieren).

    python taeglich/videodaten.py s01          # misst die Staffel und schreibt taeglich/videodaten.json + videodaten.md
    python taeglich/videodaten.py --alle       # alle Staffeln aus staffeln.json neu messen (soweit Dateien da sind)

Pro Video (Schlüssel = Pfad auf Branch youtube-upload, z. B. „taeglich/s01-f03.mp4“, so wie Zernio ihn in analyse.json führt):
Staffel, Folge, Titel, gemessene Länge, Längenband, Wörter, Einstellungen, Sprechtempo, Stimmung, Look, erster Satz (Hook),
Hook-Text, Kulissen (davon Kurzgesagt-Kulissen), Faktenkarten, Figuren, Format der Staffel (Folgenzahl, Längenband) und die
geplanten Posts je Plattform mit Uhrzeit. TikTok-Sammelteile bekommen einen eigenen Eintrag mit ihren Folgen.
`taeglich/analyse_auswerten.py` verbindet diese Daten mit den Zahlen von Zernio (Länge, Folgenzahl, Hook-Text …).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATEN = ROOT / "taeglich" / "videodaten.json"
KURZGESAGT = {"weltall", "grossstadt", "rechenzentrum", "auge", "landschaft", "wald", "netz", "lebenszeit", "polarlicht", "duenen", "kiosk"}
BAENDER = [("kurz", 60, 70), ("mittel", 70, 80), ("lang", 80, 90), ("xl", 90, 125)]


def band(dauer: float | None) -> str:
    if dauer is None:
        return ""
    for name, a, b in BAENDER:
        if a <= dauer < b:
            return name
    return "zu kurz" if dauer < 60 else "zu lang"


def ffdauer(pfad: Path) -> float | None:
    if not pfad.exists():
        return None
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(pfad)], capture_output=True, text=True)
    try:
        return round(float(r.stdout.strip()), 2)
    except ValueError:
        return None


def drehbuch(pfad: Path) -> dict:
    szenen, kopf = [], {}
    for z in pfad.read_text(encoding="utf-8").splitlines():
        z = z.strip()
        if z.startswith("@"):
            k, *rest = z[1:].split(maxsplit=1)
            kopf[k] = rest[0] if rest else ""
        m = re.match(r"^\[([^\]]*)\]\s*(.*)$", z)
        if m:
            attr, text = m.groups()
            typ = attr.split()[0]
            hook = re.search(r'hooktext="([^"]*)"', attr)
            figuren = [t.split(":")[0] for t in attr.split()[1:] if "=" not in t and re.match(r"^[a-z0-9_]+(:[a-z_]+)?$", t)]
            szenen.append({"typ": typ, "text": text, "hooktext": hook.group(1) if hook else None, "figuren": figuren})
    woerter = sum(len(s["text"].split()) for s in szenen)
    erster = szenen[0]["text"] if szenen else ""
    satz = re.split(r"(?<=[.!?…])\s", erster)[0] if erster else ""
    kulissen = [s["typ"] for s in szenen]
    return {
        "woerter": woerter, "einstellungen": len(szenen), "stimmung": kopf.get("stimmung", ""),
        "look": float(kopf["look"]) if kopf.get("look") else None, "hook_satz": satz,
        "hooktext": szenen[0]["hooktext"] if szenen else None,
        "kulissen": sorted(set(kulissen)), "kurzgesagt_einstellungen": sum(k in KURZGESAGT for k in kulissen),
        "kurzgesagt_kulissen": sorted({k for k in kulissen if k in KURZGESAGT}),
        "nahaufnahmen": kulissen.count("gesicht"), "faktenkarten": sum(k in ("titel", "objekt") for k in kulissen),
        "figuren": sorted({f for s in szenen for f in s["figuren"] if f not in ("ruhig",)} & set(json.loads((ROOT / "taeglich" / "figuren.json").read_text()).keys())),
        "letzte_zeile": szenen[-1]["text"] if szenen else "",
    }


def posts_fuer(st: dict) -> dict:
    """Geplante Posts (aus staffeln.json → veroeffentlicht) je Video-Pfad."""
    out: dict[str, dict] = {}
    for pid, zeit in (st.get("veroeffentlicht") or {}).items():
        m = re.match(r"taeglich-(insta|yt)-(s\d+-f\d+)$", pid)
        if m:
            out.setdefault(f"taeglich/{m.group(2)}.mp4", {})[{"insta": "instagram", "yt": "youtube"}[m.group(1)]] = {"id": pid, "zeit": zeit}
        m = re.match(r"taeglich-tiktok-(s\d+)-teil-(\d+)$", pid)
        if m:
            out.setdefault(f"taeglich-tiktok/{m.group(1)}-teil-{m.group(2)}.mp4", {})["tiktok"] = {"id": pid, "zeit": zeit}
    return out


def messen(st: dict) -> dict:
    sid, folgen = st["id"], st["folgen"]
    posts = posts_fuer(st)
    fmt = st.get("format") or {}
    eintraege = {}
    for f in folgen:
        fid = f"{sid}-f{f['nr']:02d}"
        db = ROOT / "taeglich" / "episoden" / f"{fid}.txt"
        if not db.exists():
            continue
        dauer = ffdauer(ROOT / "ausgabe" / f"taeglich-{fid}-fertig.mp4") or ffdauer(ROOT / "ausgabe" / f"taeglich-{fid}.mp4")
        d = drehbuch(db)
        pfad = f"taeglich/{fid}.mp4"
        eintraege[pfad] = {
            "art": "folge", "staffel": sid, "staffel_titel": st["titel"], "folge": f["nr"], "titel": f["titel"],
            "folgen_in_staffel": len(folgen), "format_laengenband": fmt.get("laengenband", ""),
            "dauer_s": dauer, "laengenband": band(dauer),
            "woerter_pro_s": round(d["woerter"] / dauer, 2) if dauer else None,
            "familie_freunde": bool(f.get("familie")), **d, "posts": posts.get(pfad, {}),
        }
    teile = st.get("tiktok_teile") or []
    for k, nrn in enumerate(teile, 1):
        pfad = f"taeglich-tiktok/{sid}-teil-{k}.mp4"
        dauer = ffdauer(ROOT / "ausgabe" / f"taeglich-{sid}-tiktok-teil-{k}.mp4")
        if dauer is None:  # Summe der Folgen
            ds = [eintraege.get(f"taeglich/{sid}-f{n:02d}.mp4", {}).get("dauer_s") for n in nrn]
            dauer = round(sum(ds), 2) if all(ds) else None
        erste = eintraege.get(f"taeglich/{sid}-f{nrn[0]:02d}.mp4", {})
        eintraege[pfad] = {
            "art": "tiktok_teil", "staffel": sid, "staffel_titel": st["titel"], "teil": k, "teile_in_staffel": len(teile),
            "folgen": nrn, "folgen_in_staffel": len(folgen), "format_laengenband": fmt.get("laengenband", ""), "dauer_s": dauer,
            "hook_satz": erste.get("hook_satz", ""), "hooktext": erste.get("hooktext"), "stimmung": erste.get("stimmung", ""),
            "posts": posts.get(pfad, {}),
        }
    return eintraege


def md(daten: dict) -> str:
    z = ["# Videodaten der Kurzvideo-Staffeln", "", "Automatisch aus `python taeglich/videodaten.py`. Grundlage für die Analyse (Länge, Folgenzahl, Hook …).", ""]
    for sid in sorted({v["staffel"] for v in daten.values()}):
        vs = {k: v for k, v in daten.items() if v["staffel"] == sid}
        erste = next(iter(vs.values()))
        z += [f"## {sid} „{erste['staffel_titel']}“ ({erste['folgen_in_staffel']} Folgen, Format-Längenband: {erste.get('format_laengenband') or '–'})", "",
              "| Video | Länge s | Band | Wörter | Wörter/s | Einst. | Kurzgesagt-Einst. | Nah | Fakten | Stimmung | Hook-Text | Instagram | YouTube |",
              "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for k, v in sorted(vs.items()):
            if v["art"] != "folge":
                continue
            p = v["posts"]
            z.append(f"| F{v['folge']} {v['titel']} | {v['dauer_s']} | {v['laengenband']} | {v['woerter']} | {v['woerter_pro_s']} | {v['einstellungen']} | "
                     f"{v['kurzgesagt_einstellungen']} | {v['nahaufnahmen']} | {v['faktenkarten']} | {v['stimmung']} | {v['hooktext'] or ''} | "
                     f"{p.get('instagram', {}).get('zeit', '')[5:16]} | {p.get('youtube', {}).get('zeit', '')[5:16]} |")
        z += ["", "| TikTok-Teil | Folgen | Länge s | Termin |", "|---|---|---|---|"]
        for k, v in sorted(vs.items()):
            if v["art"] == "tiktok_teil":
                z.append(f"| {v['teil']} | {v['folgen'][0]}–{v['folgen'][-1]} | {v['dauer_s']} | {v['posts'].get('tiktok', {}).get('zeit', '')[5:16]} |")
        z.append("")
    return "\n".join(z) + "\n"


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("staffel", nargs="?")
    ap.add_argument("--alle", action="store_true")
    a = ap.parse_args(argv)
    staffeln = json.loads((ROOT / "taeglich" / "staffeln.json").read_text(encoding="utf-8"))["staffeln"]
    wahl = staffeln if a.alle else [s for s in staffeln if s["id"] == a.staffel]
    if not wahl:
        print("Staffel nicht gefunden"); return 1
    daten = json.loads(DATEN.read_text(encoding="utf-8")) if DATEN.exists() else {}
    for st in wahl:
        neu = messen(st)
        fehlt = [k for k, v in neu.items() if v["dauer_s"] is None]
        if fehlt:  # alte Messung behalten, wenn die Videos lokal nicht (mehr) da sind
            for k in fehlt:
                if k in daten and daten[k].get("dauer_s"):
                    neu[k]["dauer_s"] = daten[k]["dauer_s"]; neu[k]["laengenband"] = band(daten[k]["dauer_s"])
        daten = {k: v for k, v in daten.items() if v.get("staffel") != st["id"]}
        daten.update(neu)
        print(f"{st['id']}: {len(neu)} Videos gemessen" + (f", ohne Länge: {len(fehlt)}" if fehlt else ""))
    DATEN.write_text(json.dumps(dict(sorted(daten.items())), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (ROOT / "taeglich" / "videodaten.md").write_text(md(daten), encoding="utf-8")
    print(f"→ {DATEN.relative_to(ROOT)} und taeglich/videodaten.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
