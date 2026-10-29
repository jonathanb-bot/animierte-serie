#!/usr/bin/env python3
"""Prüft alle Videos auf diesem Branch und schreibt geprueft.json.
ok = Tonspur vorhanden, Ton so lang wie das Bild (±0,5 s), Lautheit über -24 LUFS (Stimme hörbar)."""
import json, re, subprocess, pathlib

ROOT = pathlib.Path(__file__).parent
TITEL = {1: "Der erste Tag", 2: "Kein Druck", 3: "Das Treppenhaus", 4: "Licht aus", 5: "Wasserdiebe",
         6: "Auf dem Dach", 7: "Fieber", 8: "Die Apotheke", 9: "Die Horde", 10: "Das Dach"}

def dauer(f, s):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", s, "-show_entries", "stream=duration",
                          "-of", "csv=p=0", str(f)], capture_output=True, text=True).stdout.strip()
    return float(out) if out else 0.0

def lufs(f):
    err = subprocess.run(["ffmpeg", "-nostats", "-i", str(f), "-map", "0:a:0", "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = re.search(r"I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold", err)
    return float(m.group(1)) if m else None

def pruefe(f):
    v, a = dauer(f, "v:0"), dauer(f, "a:0")
    l = lufs(f) if a else None
    grund = None
    if not v: grund = "keine Bildspur"
    elif not a: grund = "keine Tonspur"
    elif abs(v - a) > 0.5: grund = "Ton und Bild unterschiedlich lang"
    elif l is None: grund = "Lautheit nicht messbar"
    elif l < -24: grund = "zu leise, Stimme fehlt vermutlich"
    return {"ok": grund is None, "bild_s": round(v, 2), "ton_s": round(a, 2), "lufs": l, **({"grund": grund} if grund else {})}

ergebnis = {"serie": "24. Stock", "regel": "ok = Tonspur da, so lang wie das Bild, Stimme hörbar (> -24 LUFS)",
            "folgen": {}, "dateien": {}}
for f in sorted((ROOT / "24-stock").glob("*.mp4")) + sorted((ROOT / "24-stock-folgen").glob("*.mp4")):
    rel = f.relative_to(ROOT).as_posix()
    ergebnis["dateien"][rel] = pruefe(f)
    print(rel, ergebnis["dateien"][rel])
for n in TITEL:
    teile = sorted(int(m.group(1)) for p in (ROOT / "24-stock").glob(f"folge-{n:02d}-teil-*.mp4")
                   if (m := re.search(r"teil-(\d+)", p.name)))
    ergebnis["folgen"][f"{n:02d}"] = {"titel": TITEL[n], "teile": len(teile)}
(ROOT / "geprueft.json").write_text(json.dumps(ergebnis, ensure_ascii=False, indent=1) + "\n")
print("fertig:", sum(d["ok"] for d in ergebnis["dateien"].values()), "ok von", len(ergebnis["dateien"]))
