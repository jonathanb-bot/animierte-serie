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

ALIEN = {1: "Im Badezimmer", 2: "Nur bis morgen", 3: "Deine Nachbarin", 4: "Das Versprechen", 5: "Was Nox gestohlen hat",
         6: "Raus aus dem Haus", 7: "Das falsche Gesicht", 8: "Du oder er", 9: "Auf dem Dach", 10: "Wieder zu Hause"}
LETZTER = {1: "Außer dir", 2: "Bleib vom Fenster weg", 3: "Sie kennen deinen Namen", 4: "Die falsche Rettung", 5: "Unter deiner Wohnung",
           6: "Das tote Telefon", 7: "Zehn Sekunden", 8: "Du warst nicht vorgesehen", 9: "Die zweite Ausnahme", 10: "Die Stimme"}
ergebnis = {"serie": "24. Stock", "regel": "ok = Tonspur da, so lang wie das Bild, Stimme hörbar (> -24 LUFS)",
            "reihenfolge": ["24-stock", "der-alien", "der-letzte-mann"], "folgen": {}, "dateien": {}, "serien": {}}
for f in sorted((ROOT / "24-stock").glob("*.mp4")) + sorted((ROOT / "24-stock-folgen").glob("*.mp4")) \
       + sorted((ROOT / "der-alien").glob("*.mp4")) + sorted((ROOT / "der-alien-folgen").glob("*.mp4")) \
       + sorted((ROOT / "der-letzte-mann").glob("*.mp4")) + sorted((ROOT / "der-letzte-mann-folgen").glob("*.mp4")) \
       + sorted((ROOT / "der-letzte-mann-tiktok").glob("*.mp4")) + sorted((ROOT / "der-alien-tiktok").glob("*.mp4")) \
       + sorted((ROOT / "der-alien-kurz").glob("*.mp4")) + sorted((ROOT / "der-letzte-mann-kurz").glob("*.mp4")) + sorted((ROOT / "24-stock-kurz").glob("*.mp4")):
    rel = f.relative_to(ROOT).as_posix()
    ergebnis["dateien"][rel] = pruefe(f)
    print(rel, ergebnis["dateien"][rel])
for n in TITEL:
    teile = sorted(int(m.group(1)) for p in (ROOT / "24-stock").glob(f"folge-{n:02d}-teil-*.mp4")
                   if (m := re.search(r"teil-(\d+)", p.name)))
    ergebnis["folgen"][f"{n:02d}"] = {"titel": TITEL[n], "teile": len(teile)}
for ordner, name, titel in (("24-stock", "24. Stock", TITEL), ("der-alien", "Der Alien", ALIEN), ("der-letzte-mann", "Der letzte Mann", LETZTER)):
    fo = {}
    for n in titel:
        teile = sorted(int(m.group(1)) for p in (ROOT / ordner).glob(f"folge-{n:02d}-teil-*.mp4") if (m := re.search(r"teil-(\d+)", p.name)))
        fo[f"{n:02d}"] = {"titel": titel[n], "teile": len(teile)}
    ergebnis["serien"][ordner] = {"name": name, "folgen": fo}
# TikTok-Sammelteile (Jonathans Vorgabe 31.10.): mehrere Folgen am Stück, "Fortsetzung folgt" nur am Ende des Teils
ergebnis["tiktok"] = {"der-letzte-mann": {"teil-1": [1, 2, 3], "teil-2": [4, 5], "teil-3": [6, 7, 8], "teil-4": [9, 10]},
                      "der-alien": {"teil-1": [1, 2], "teil-2": [3, 4], "teil-3": [5, 6], "teil-4": [7, 8], "teil-5": [9, 10]}}
(ROOT / "geprueft.json").write_text(json.dumps(ergebnis, ensure_ascii=False, indent=1) + "\n")
print("fertig:", sum(d["ok"] for d in ergebnis["dateien"].values()), "ok von", len(ergebnis["dateien"]))
