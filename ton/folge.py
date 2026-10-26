"""Ton für eine Folge des Renderers (episoden/folge-XX.txt) im Serien-Stil der Vorlage.

    python -m ton.folge episoden/folge-01.txt

Erzeugt:
- audio/folge-XX/NNN.mp3  Erzählstimme pro Einstellung (eine tiefe, trockene, zügige Stimme – auch Zitate)
- audio/folge-XX/NNN.json Wortzeiten (render.mjs legt die Untertitel damit exakt auf die Stimme)
- musik/folge-XX.mp3      Hintergrundspur: dunkler Drone, harte Stille-Schnitte an Kapitelgrenzen,
                          dezente Geräusche passend zum Bild (Alarm, Klopfen, Stromausfall, Wasser …)
- audio/folge-XX/timing.json  Szenenzeiten (gleiche Rechnung wie render.mjs)
Im Drehbuch werden dafür `@musik musik/folge-XX.mp3`, `@musik_lautstaerke 1` und `@whoosh aus` gesetzt.

Pro Einstellung lässt sich in der Klammer steuern: `emotion=spannend`, `ton=zombie,wind` oder `ton=aus`.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import zlib
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from . import audio as A
from . import geraeusche as G
from . import musik as M
from . import stimmen as S

ROOT = Path(__file__).resolve().parent.parent
STIMME_RMS = -12.5      # Stimme (aktive Anteile) – ergibt im Mix ~ -14,5 LUFS wie die Vorlage
BETT_RMS = STIMME_RMS - 17.0     # ergibt im Mix ~12 dB Abstand Stimme/Drone wie in der Vorlage gemessen
SFX_PEAK = -14.0
SCHNITT = 0.42          # Länge der Stille an Kapitelgrenzen (Vorlage: ~0,45 s)
NACH_STIMME = 0.35      # render.mjs: Szene = Sprechdauer + 0,35 s

ERZAEHLER = S.Sprecher("erzaehler", "de-DE-ConradNeural", tempo=18, im_raum=False, emotion_staerke=0.5)

AUSDRUCK_EMOTION = {
    "schreck": "spannend", "angst": "spannend", "besorgt": "ernst", "misstrauisch": "ernst",
    "entschlossen": "ernst", "froh": "froh", "wuetend": "wuetend", "traurig": "traurig", "muede": "ruhig",
}


@dataclass
class Einstellung:
    nr: int
    typ: str
    text: str
    attr: dict
    flags: set
    kapitel: int
    start: float = 0.0
    dauer: float = 0.0
    sprechdauer: float = 0.0
    sfx: list = field(default_factory=list)


def _tokens(s: str):
    return re.findall(r'([\w\-äöüÄÖÜß]+)=("([^"]*)"|[^\s\]]+)|("[^"]*")|([^\s]+)', s)


def lesen(pfad: Path) -> tuple[list[Einstellung], list[str]]:
    """Einfacher Leser für das Drehbuch-Format von drehbuch.mjs (nur was der Ton braucht)."""
    einst, kopf, kap = [], [], -1
    for roh in pfad.read_text(encoding="utf-8").splitlines():
        z = roh.strip()
        if not z or z.startswith("//"):
            continue
        if z.startswith("==") :
            kap += 1
            continue
        if z.startswith("#") or z.startswith("@"):
            if z.startswith("@"):
                kopf.append(z)
            continue
        m = re.match(r"^\[([^\]]*)\]\s*(.*)$", z)
        if not m:
            if einst:
                einst[-1].text += " " + z
            continue
        attr, flags, typ = {}, set(), None
        for k, v, vq, q, nackt in _tokens(m.group(1)):
            if typ is None:
                typ = nackt or v
                continue
            if k:
                attr[k] = vq if vq else v
            else:
                flags.add((q or nackt).strip('"'))
        einst.append(Einstellung(len(einst) + 1, typ or "", m.group(2).strip(), attr, flags, max(kap, 0)))
    return einst, kopf


def sprechtext(text: str) -> str:
    """Untertiteltext -> was gesprochen wird: Markierungen raus, Zitate spricht der Erzähler mit."""
    t = text.replace("*", "")
    t = re.sub(r"[„“\"»«]", "", t)
    return " ".join(t.split())


def emotion_fuer(e: Einstellung) -> str:
    if "emotion" in e.attr:
        return e.attr["emotion"]
    if e.typ in ("objekt", "karte"):
        return "erklaerend"
    for f in e.flags:
        name = f.split(":")[-1]
        if name in AUSDRUCK_EMOTION:
            return AUSDRUCK_EMOTION[name]
    return "erzaehlend"


def geraeusche_fuer(e: Einstellung) -> list[dict]:
    """Dezente Geräusche aus dem, was im Bild passiert. Überschreibbar mit ton=… / ton=aus."""
    if e.attr.get("ton") == "aus":
        return []
    if "ton" in e.attr:
        return [{"name": n.strip()} for n in e.attr["ton"].split(",") if n.strip()]
    t = e.text.lower()
    out = []
    if "alarm" in e.flags:
        out.append({"name": "autoalarm", "dauer": max(3.0, e.dauer), "parameter": {"entfernung": 0.7}, "pegel": -4})
    if "klopfen" in e.flags:
        heftig = float(e.attr.get("wackeln", 0) or 0) >= 1
        out.append({"name": "tuer_klopfen", "parameter": {"anzahl": 7 if heftig else 3, "hart": 1.0 if heftig else 0.3},
                    "versatz": 0.3, "pegel": 2 if heftig else -2})
    if "blitz" in e.flags or "klack" in t:
        out.append({"name": "stromausfall", "versatz": 0.0, "pegel": 2})
    if e.attr.get("fuell_bis"):
        out.append({"name": "badewanne", "dauer": max(2.0, e.dauer), "pegel": -4})
    if e.attr.get("hahn") == "tropft":
        out.append({"name": "wasser_stockt" if "gurgel" in t else "tropfen", "versatz": 0.8})
    elif e.attr.get("hahn") == "an":
        out.append({"name": "wasserhahn", "dauer": max(2.0, e.dauer), "pegel": -8})
    if "schritte" in t:
        out.append({"name": "schritte", "dauer": max(2.5, e.dauer - 0.5), "versatz": 0.4, "pegel": -2,
                    "parameter": {"rennen": "schnell" in t, "boden": "beton"}, "ort": "treppenhaus"})
    if "vibriert" in t:
        out.append({"name": "handy_vibration", "versatz": 0.9, "dauer": 2.4, "pegel": -2})
    if "heli" in e.flags or e.attr.get("heli"):
        out.append({"name": "hubschrauber", "dauer": max(4.0, e.dauer), "pegel": -6})
    if "regen" in e.flags:
        out.append({"name": "regen", "dauer": e.dauer, "pegel": -6})
    if "kühlschrank" in t and "brumm" in t:
        out.append({"name": "kuehlschrank", "dauer": e.dauer, "pegel": -12, "versatz": 0.0})
    if "sirenen" in t:
        out.append({"name": "sirene_fern", "dauer": max(4.0, e.dauer), "pegel": -10})
    if e.typ == "strasse" and e.attr.get("horde"):
        out.append({"name": "zombie_horde", "dauer": e.dauer, "parameter": {"entfernung": 0.8, "dichte": 0.6},
                    "pegel": -10})
    return out


def _dauer_datei(p: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True).stdout.strip()
    return float(out or 0)


def _schaetzung(text: str) -> float:
    """Gleiche Schätzung wie render.mjs für Einstellungen ohne Audio."""
    roh = [w for w in re.sub(r"[„“\"»«]", "", text).split() if w]
    d = 0.0
    for w in roh:
        d += 0.2 + len(w.replace("*", "")) * 0.035 + (0.25 if re.search(r"[.!?…]$", w) else 0.12 if re.search(r"[,:;]$", w) else 0)
    return d


def _mp3(x: np.ndarray, ziel: Path, bitrate="160k"):
    tmp = ziel.with_suffix(".tmp.wav")
    A.schreiben_wav(str(tmp), x)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-c:a", "libmp3lame", "-b:a", bitrate, str(ziel)],
                   check=True)
    tmp.unlink()


def _rms_db(x):
    m = x if x.ndim == 1 else x.mean(axis=1)
    aktiv = m[np.abs(m) > 0.003]
    return 20 * np.log10(np.sqrt(np.mean(aktiv ** 2)) + 1e-12) if len(aktiv) else -120.0


def _seed(*t):
    return zlib.crc32("|".join(map(str, t)).encode())


def drehbuch_kopf_setzen(pfad: Path, musik_rel: str):
    """@musik/@musik_lautstaerke/@whoosh direkt unter den Titel schreiben (idempotent)."""
    zeilen = pfad.read_text(encoding="utf-8").splitlines()
    zeilen = [z for z in zeilen if not re.match(r"^@(musik|musik_lautstaerke|whoosh)\b", z.strip())]
    pos = next((i + 1 for i, z in enumerate(zeilen) if z.startswith("# ")), 0)
    neu = [f"@musik {musik_rel}", "@musik_lautstaerke 1", "@whoosh aus"]
    zeilen[pos:pos] = neu
    pfad.write_text("\n".join(zeilen) + "\n", encoding="utf-8")


def bauen(drehbuch: str, nur_stimme=False, log=print) -> dict:
    pfad = Path(drehbuch).resolve()
    fid = pfad.stem
    einst, _ = lesen(pfad)
    audio_dir = ROOT / "audio" / fid
    audio_dir.mkdir(parents=True, exist_ok=True)

    # 1) Stimmen
    sprechend = [e for e in einst if sprechtext(e.text)]
    log(f"{fid}: {len(einst)} Einstellungen, {len(sprechend)} mit Text – Stimmen werden erzeugt …")
    gesprochen = S.sprechen_viele([(ERZAEHLER, sprechtext(e.text), emotion_fuer(e)) for e in sprechend])
    for e, g in zip(sprechend, gesprochen):
        x = g.audio * A.db(STIMME_RMS - _rms_db(g.audio) + 20 * np.log10(
            max(0.05, 1 + S.EMOTIONEN.get(emotion_fuer(e), S.EMOTIONEN["neutral"])[2] / 100)))
        x = A.limiter(x, -1.0)
        ziel = audio_dir / f"{e.nr:03d}.mp3"
        _mp3(x, ziel)
        woerter = [{"w": w, "start": round(a, 3), "ende": round(b, 3)} for a, b, w, _ in g.woerter]
        (audio_dir / f"{e.nr:03d}.json").write_text(json.dumps(woerter, ensure_ascii=False), encoding="utf-8")
        e.sprechdauer = _dauer_datei(ziel)
    # verwaiste Dateien früherer Fassungen entfernen
    gueltig = {f"{e.nr:03d}" for e in sprechend}
    for f in audio_dir.glob("[0-9][0-9][0-9].*"):
        if f.stem not in gueltig:
            f.unlink()

    # 2) Zeitachse – identisch zu render.mjs
    t = 0.0
    for e in einst:
        if "dauer" in e.attr:
            e.dauer = float(e.attr["dauer"])
        elif e.sprechdauer:
            e.dauer = e.sprechdauer + NACH_STIMME
        else:
            e.dauer = max(2.0, _schaetzung(e.text) + 0.55) if e.text else 3.0
        e.start = t
        t += e.dauer
    gesamt = t
    timing = [{"nr": e.nr, "typ": e.typ, "kapitel": e.kapitel + 1, "start": round(e.start, 3), "dauer": round(e.dauer, 3),
               "emotion": emotion_fuer(e) if e.sprechdauer else None, "text": e.text} for e in einst]
    (audio_dir / "timing.json").write_text(json.dumps({"dauer": round(gesamt, 3), "einstellungen": timing},
                                                      ensure_ascii=False, indent=1), encoding="utf-8")
    log(f"  Länge: {int(gesamt // 60)}:{gesamt % 60:04.1f} min")
    if nur_stimme:
        return {"dauer": gesamt}

    # 3) Hintergrundspur: Drone + Geräusche + Stille-Schnitte
    log("  Drone, Geräusche und Stille-Schnitte …")
    n = A.sek(gesamt + 1)
    bett = np.zeros((n, 2), np.float32)
    kapitel_start = {}
    for e in einst:
        kapitel_start.setdefault(e.kapitel, e)
    # Spannung (dunkel_puls) in Kapiteln mit Angst/Schreck/Klopfen, sonst dunkel
    for k, e0 in kapitel_start.items():
        teile = [e for e in einst if e.kapitel == k]
        a, b = teile[0].start, teile[-1].start + teile[-1].dauer
        spannung = any(f.split(":")[-1] in ("angst", "schreck") for e in teile for f in e.flags) and \
            any("klopfen" in e.flags or "wackeln" in e.attr for e in teile)
        st = "dunkel_puls" if spannung else "dunkel"
        x = M.musik(st, b - a + 1.5, seed=_seed(fid, k, st))
        x = A.fade(x * A.db(BETT_RMS - _rms_db(x)), 0.8 if k else 1.5, 1.0)
        bett = A.einmischen(bett, x, A.sek(max(0, a - 0.75)))
    bett = bett[:n]
    for e in einst:
        for s in geraeusche_fuer(e):
            kw = dict(s.get("parameter", {}))
            if "dauer" in s:
                kw["dauer"] = float(s["dauer"])
            try:
                x = G.erzeugen(s["name"], seed=_seed(fid, e.nr, s["name"]), **kw)
            except TypeError:
                kw.pop("dauer", None)
                x = G.erzeugen(s["name"], seed=_seed(fid, e.nr, s["name"]), **kw)
            xs = A.stereo(x) if x.ndim == 1 else x
            if s.get("ort"):
                xs = A.hall(xs, s["ort"])
            xs = A.fade(xs, 0.02, 0.3)
            bett = A.einmischen(bett, xs * A.db(SFX_PEAK + float(s.get("pegel", 0))),
                                A.sek(e.start + float(s.get("versatz", 0.1))))
    bett = bett[:n]
    # Stille-Schnitte: vor jedem neuen Kapitel fällt alles hart auf null
    maske = np.ones(n, np.float32)
    r = A.sek(0.008)
    schnitte = []
    for k, e0 in kapitel_start.items():
        if k == 0 or e0.start <= 0:
            continue
        s1 = A.sek(e0.start + 0.03)
        s0 = max(0, s1 - A.sek(SCHNITT))
        maske[s0:s1] = 0
        maske[max(0, s0 - r):s0] = np.linspace(1, 0, len(maske[max(0, s0 - r):s0]))
        maske[s1:s1 + r] = np.linspace(0, 1, len(maske[s1:s1 + r]))
        schnitte.append(round(e0.start, 2))
    bett = bett * maske[:, None]
    musik_dir = ROOT / "musik"
    musik_dir.mkdir(exist_ok=True)
    ziel = musik_dir / f"{fid}.mp3"
    _mp3(A.limiter(bett, -3.0), ziel, "192k")
    drehbuch_kopf_setzen(pfad, f"musik/{fid}.mp3")
    log(f"  {len(schnitte)} Stille-Schnitte, Geräusche in "
        f"{sum(1 for e in einst if geraeusche_fuer(e))} Einstellungen → {ziel.relative_to(ROOT)}")
    return {"dauer": gesamt, "musik": str(ziel), "audio": str(audio_dir)}


def main(argv=None):
    p = argparse.ArgumentParser(prog="python -m ton.folge", description="Stimme + Hintergrund für eine Folge")
    p.add_argument("drehbuch", nargs="+", help="episoden/folge-XX.txt")
    p.add_argument("--nur-stimme", action="store_true")
    a = p.parse_args(argv)
    for d in a.drehbuch:
        bauen(d, nur_stimme=a.nur_stimme)
    return 0


if __name__ == "__main__":
    sys.exit(main())
