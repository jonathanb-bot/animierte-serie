"""Abend-Kontrolle: die letzten 4 veröffentlichten Videos je Konto prüfen (Stimme, Bild, Ton, Status).

Liest posten/plan.json und posten/status.json von origin/main (vorher den Workflow
„Posts einplanen“ mit status=true laufen lassen, damit der Stand frisch ist),
lädt die Videos (dieselbe Datei, die Zernio hochgeladen hat) und misst:

- Status bei Zernio (published / Fehler) und Link
- Länge, erstes Bild nicht schwarz, schwarze Strecken
- Lautheit (Ziel ca. -15 LUFS), Grundton der Stimme (Ziel 106 Hz, höchstens 1.5 Halbtöne daneben)
- Sprache und Anfang des gesprochenen Texts (Whisper), damit man ihn mit dem Post vergleichen kann
- Kontaktbogen mit 6 Standbildern je Video (zum Ansehen)

    python taeglich/kontrolle.py [--anzahl 4] [--ausgabe <ordner>]

Ergebnis: <ordner>/bericht.md und <ordner>/<post-id>.png
"""
import argparse, json, math, re, subprocess, sys, urllib.request
from pathlib import Path

import numpy as np

WURZEL = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WURZEL))

KONTEN = [  # (Name, Plattform, konto-Feld im Plan, Sprache)
    ("TikTok deutsch", "tiktok", None, "de"),
    ("Instagram deutsch", "instagram", None, "de"),
    ("YouTube deutsch", "youtube", None, "de"),
    ("TikTok englisch", "tiktok", "storys4you_eng", "en"),
    ("Instagram englisch", "instagram", "zernio:3", "en"),
    ("YouTube englisch", "youtube", "zernio:3", "en"),
]
ZIEL_HZ, MAX_HT, ZIEL_LUFS = 106.0, 1.5, -15.0


def git_json(pfad):
    return json.loads(subprocess.check_output(["git", "-C", str(WURZEL), "show", f"origin/main:{pfad}"]))


def laenge(datei):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(datei)]))


def bild(datei, t, breite=270):
    roh = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(t), "-i", str(datei), "-frames:v", "1",
                          "-vf", f"scale={breite}:-2", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    return np.frombuffer(roh, dtype=np.uint8)


def schwarz(datei):
    out = subprocess.run(["ffmpeg", "-i", str(datei), "-vf", "blackdetect=d=0.3:pix_th=0.06", "-an", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return [(float(a), float(b)) for a, b in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", out)]


def lufs(datei):
    out = subprocess.run(["ffmpeg", "-i", str(datei), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", out)
    return float(m[-1]) if m else float("nan")


def audio16k(datei, bis=None):
    cmd = ["ffmpeg", "-loglevel", "error", "-i", str(datei)] + (["-t", str(bis)] if bis else []) + ["-ac", "1", "-ar", "16000", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, dtype=np.float32)


def kontaktbogen(datei, ziel, dauer):
    zeiten = [0] + [dauer * k / 6 for k in range(1, 6)]
    ein = []
    for t in zeiten:
        ein += ["-ss", f"{t:.2f}", "-i", str(datei)]
    filt = "".join(f"[{i}:v]scale=300:-2,trim=end_frame=1[v{i}];" for i in range(6)) + "".join(f"[v{i}]" for i in range(6)) + "hstack=6"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y"] + ein + ["-filter_complex", filt, "-frames:v", "1", str(ziel)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anzahl", type=int, default=4)
    ap.add_argument("--ausgabe", default=str(WURZEL / "ausgabe" / "kontrolle"))
    a = ap.parse_args()
    aus = Path(a.ausgabe); aus.mkdir(parents=True, exist_ok=True)
    cache = WURZEL / "ausgabe" / "kontrolle-videos"; cache.mkdir(parents=True, exist_ok=True)

    plan = git_json("posten/plan.json")["posts"]
    status = git_json("posten/status.json")

    from ton.angleichen import grundton_array
    from faster_whisper import WhisperModel
    modell = WhisperModel("medium", device="cpu", compute_type="int8")

    zeilen = ["# Abend-Kontrolle", ""]
    probleme = []
    for name, plat, konto, sprache in KONTEN:
        posts = [p for p in plan if p["platform"] == plat and p.get("konto") == konto]
        fertig = [p for p in posts if str(((status.get(p["id"]) or {}).get("ergebnis") or {}).get("status", "")).startswith("pub")]
        fehler = [p for p in posts if (status.get(p["id"]) or {}).get("ergebnis", {}) and "fehler" in ((status.get(p["id"]) or {}).get("ergebnis") or {})]
        fertig.sort(key=lambda p: p["zeit"])
        zeilen += [f"## {name}", ""]
        if not fertig:
            zeilen += ["Noch keine veröffentlichten Posts mit Status bei Zernio.", ""]
        for p in fehler[-3:]:
            if p["zeit"] > (fertig[-1]["zeit"] if fertig else ""):
                f = status[p["id"]]["ergebnis"]["fehler"]
                probleme.append(f"{name}: {p['id']} ({p['zeit']}) Fehler bei Zernio: {f}")
                zeilen.append(f"- ✗ {p['id']} ({p['zeit']}): Fehler bei Zernio: {f}")
        for p in fertig[-a.anzahl:]:
            erg = status[p["id"]]["ergebnis"]
            datei = cache / (p["id"] + ".mp4")
            if not datei.exists():
                try:
                    urllib.request.urlretrieve(p["video"], datei)
                except Exception as e:  # Video nicht mehr auf youtube-upload
                    probleme.append(f"{name}: {p['id']} Video nicht ladbar ({e})")
                    zeilen.append(f"- ✗ {p['id']}: Video nicht ladbar ({e})"); continue
            d = laenge(datei)
            hell0 = float(bild(datei, 0.05).mean())
            sw = schwarz(datei)
            lu = lufs(datei)
            x = audio16k(datei)
            hz = grundton_array(x, 16000)
            ht = 12 * math.log2(hz / ZIEL_HZ) if hz > 0 else float("nan")
            segs, info = modell.transcribe(audio16k(datei, 25), beam_size=5)
            text = " ".join(s.text.strip() for s in segs)
            kontaktbogen(datei, aus / (p["id"] + ".png"), d)
            mangel = []
            if hell0 < 12: mangel.append(f"erstes Bild schwarz (Helligkeit {hell0:.0f})")
            if any(b - s > 0.6 and s > 0.5 for s, b in sw): mangel.append(f"schwarze Strecke {sw}")
            if not (-18.5 <= lu <= -12): mangel.append(f"Lautheit {lu:.1f} LUFS")
            if not abs(ht) <= MAX_HT: mangel.append(f"Tonhöhe {hz:.0f} Hz ({ht:+.1f} HT)")
            if info.language != sprache: mangel.append(f"Sprache {info.language} statt {sprache}")
            if plat == "instagram" or plat == "youtube":
                if d > 180: mangel.append(f"zu lang für Reel/Short ({d:.0f} s)")
            zeichen = "✗" if mangel else "✓"
            for m in mangel: probleme.append(f"{name}: {p['id']} – {m}")
            zeilen += [f"- {zeichen} **{p['id']}** ({p['zeit']}) {erg.get('url', '')}",
                       f"  Länge {d:.0f} s · erstes Bild {hell0:.0f} · {lu:.1f} LUFS · Grundton {hz:.0f} Hz ({ht:+.1f} HT) · Sprache {info.language}",
                       f"  Anfang gesprochen: „{text[:220]}“",
                       f"  Post-Text: „{p.get('text', '').splitlines()[0][:120]}“",
                       f"  Standbilder: {aus / (p['id'] + '.png')}"]
            if mangel: zeilen.append("  Mängel: " + "; ".join(mangel))
        zeilen.append("")
    zeilen = zeilen[:2] + ["## Zusammenfassung", ""] + ([f"- {x}" for x in probleme] or ["Alles in Ordnung ✓"]) + [""] + zeilen[2:]
    (aus / "bericht.md").write_text("\n".join(zeilen), encoding="utf-8")
    print("\n".join(zeilen))


if __name__ == "__main__":
    main()
