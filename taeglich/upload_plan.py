"""Kurzer Upload-Plan: was wann auf TikTok, Instagram und YouTube kommt (aus posten/plan.json auf origin/main).

    python taeglich/upload_plan.py          # schreibt taeglich/UPLOAD-PLAN.md und zeigt ihn an
"""
from __future__ import annotations

import datetime as dt
import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
SERIEN = {"24-stock": "24. Stock", "der-alien": "Der Alien", "der-letzte-mann": "Der letzte Mann", "taeglich": "Kurzvideo"}
TAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]


def label(p: dict, staffeln: dict) -> str:
    i = p["id"]
    m = re.search(r"(s\d+)-teil-(\d+)$", i)
    if m:
        st = staffeln.get(m.group(1), {})
        nrn = (st.get("tiktok_teile") or [[]])[int(m.group(2)) - 1] if st.get("tiktok_teile") else []
        return f"„{st.get('titel', m.group(1))}“ Teil {m.group(2)}" + (f" (F{nrn[0]}–{nrn[-1]})" if nrn else "")
    m = re.search(r"(s\d+)-f(\d+)$", i)
    if m:
        return f"„{staffeln.get(m.group(1), {}).get('titel', m.group(1))}“ F{int(m.group(2))}"
    if re.match(r"taeglich-(tiktok|insta|yt)-video-?\d+$|taeglich-(tiktok|insta|yt)-\d+$", i):
        return "Einzelvideo „Die Zeit, die dir bleibt“" if i.endswith("001") else f"Einzelvideo {i}"
    m = re.search(r"-(\d+)(?:-(\d))?$", i)
    serie = SERIEN.get(p.get("serie", ""), p.get("serie", ""))
    if "teil" in i and m:
        return f"{serie} Teil {int(m.group(1))}"
    if m:
        return f"{serie} F{int(m.group(1))}" + (f"/{m.group(2)}" if m.group(2) else "")
    return f"{serie} {i}"


def main() -> int:
    subprocess.run(["git", "fetch", "-q", "origin", "main"], cwd=ROOT)
    plan = json.loads(subprocess.run(["git", "show", "origin/main:posten/plan.json"], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    staffeln = {s["id"]: s for s in json.loads((ROOT / "taeglich" / "staffeln.json").read_text(encoding="utf-8"))["staffeln"]}
    jetzt = dt.datetime.now(ZoneInfo("Europe/Berlin")).replace(tzinfo=None)
    loeschen = set(plan.get("loeschen") or [])
    posts = sorted((p for p in plan["posts"] if p["id"] not in loeschen and dt.datetime.fromisoformat(p["zeit"]) > jetzt), key=lambda p: p["zeit"])
    tage = defaultdict(lambda: defaultdict(list))
    for p in posts:
        z = dt.datetime.fromisoformat(p["zeit"])
        tage[z.date()][p["platform"]].append(f"{z:%H:%M} {label(p, staffeln)}")
    z = [f"# Upload-Plan (Stand {jetzt:%d.%m.%Y %H:%M})", "",
         "Automatisch aus `posten/plan.json` (`python taeglich/upload_plan.py`). Takt: TikTok 08/12/16/20 Uhr für neue Staffeln, Instagram alle 4 h, YouTube jeweils :30. Neue Staffeln werden hinten angehängt.", ""]
    for plat in ("tiktok", "instagram", "youtube"):
        ps = [p for p in posts if p["platform"] == plat]
        if ps:
            z.append(f"- **{plat.capitalize()}:** {len(ps)} Posts geplant, letzter {dt.datetime.fromisoformat(ps[-1]['zeit']):%d.%m. %H:%M}")
    z += ["", "| Tag | TikTok | Instagram | YouTube |", "|---|---|---|---|"]
    for tag in sorted(tage):
        d = tage[tag]
        zelle = lambda k: "<br>".join(d.get(k, [])) or "–"
        z.append(f"| {TAGE[tag.weekday()]} {tag:%d.%m.} | {zelle('tiktok')} | {zelle('instagram')} | {zelle('youtube')} |")
    text = "\n".join(z) + "\n"
    (ROOT / "taeglich" / "UPLOAD-PLAN.md").write_text(text, encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
