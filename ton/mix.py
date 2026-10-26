"""Ton-Drehbuch (YAML) -> fertige Tonspur, Stems, Untertitel, Timing, optional fertiges Video.

Format: siehe docs/ton-drehbuch.md
"""
from __future__ import annotations

import json
import re
import subprocess
import zlib
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import yaml

from . import audio as A
from . import geraeusche as G
from . import musik as M
from . import stimmen as S

# Grundpegel (dBFS RMS bzw. Peak) – im Drehbuch nur relativ dazu mit "pegel: +3"
STIMME_RMS = -18.0
MUSIK_RMS = -24.0
MUSIK_DUCKING = -9.0
ATMO_RMS = -36.0
SFX_PEAK = -9.0
SFX_PEGEL = {  # Feinabstimmung pro Geräusch (dB relativ zu SFX_PEAK)
    "hit": 4, "riser": -2, "whoosh": -4, "ui_pop": -8, "ui_ding": -7, "taschenlampe": -4,
    "papier": -5, "schreiben": -8, "herzschlag": 2, "zombie_horde": 0, "donner": 2,
    "autoalarm": -2, "wecker": -3, "stromausfall": 0, "kein_netz": -6, "funk_klick": -6,
}
MUSIK_PEGEL = {"titel": 5, "cliffhanger": 5, "action": 2, "spannung": 1, "nacht": -2, "traurig": -1}
ATMO_PEGEL = {"stille_raum": -6, "kuehlschrank": -4, "kerze_knistern": -2, "herzschlag": 8, "atmen": 4,
              "zombie_horde": 6, "regen": 2, "wind": 2, "funk_rauschen": 0}
LUECKE = 0.25          # Standard-Abstand zwischen zwei Sprechzeilen
UEBERBLENDUNG = 1.5    # Musik-Überblendung zwischen Kapiteln
ZIEL_LUFS = -14.0      # YouTube-Lautheit


@dataclass
class Zeile:
    sprecher: str
    text: str
    emotion: str
    start: float = 0.0
    ende: float = 0.0
    kapitel: int = 0
    cues: list = field(default_factory=list)


def _rms_db(x):
    m = x if x.ndim == 1 else x.mean(axis=1)
    aktiv = m[np.abs(m) > 0.003]
    if len(aktiv) == 0:
        return -120.0
    return 20 * np.log10(np.sqrt(np.mean(aktiv ** 2)) + 1e-12)


def _auf_rms(x, ziel_db):
    return x * A.db(ziel_db - _rms_db(x))


def _seed(*teile):
    return zlib.crc32("|".join(map(str, teile)).encode())


def _sprecher_laden(cfg: dict) -> dict[str, S.Sprecher]:
    out = {}
    for name, c in (cfg or {}).items():
        c = dict(c or {})
        out[name] = S.Sprecher(
            name=name,
            stimme=c.get("stimme", S.STANDARD_STIMMEN.get(name, "de-DE-ConradNeural")),
            tempo=int(c.get("tempo", 0)), hoehe=int(c.get("hoehe", 0)),
            lautstaerke=int(c.get("lautstaerke", 0)),
            im_raum=bool(c.get("im_raum", name != "erzaehler")), pan=float(c.get("pan", 0.0)),
        )
    if "erzaehler" not in out:
        out["erzaehler"] = S.Sprecher("erzaehler", S.STANDARD_STIMMEN["erzaehler"], im_raum=False)
    return out


def _atmo_eintrag(e):
    if isinstance(e, str):
        return {"name": e}
    return dict(e)


def bauen(drehbuch_pfad: str, ausgabe: str | None = None, video: str | None = None,
          nur_stimme: bool = False, vorschau: bool = False, log=print) -> dict:
    pfad = Path(drehbuch_pfad)
    db = yaml.safe_load(pfad.read_text(encoding="utf-8"))
    sprecher = _sprecher_laden(db.get("sprecher"))
    raus = Path(ausgabe or db.get("ausgabe") or (pfad.parent / "ausgabe"))
    if not raus.is_absolute() and ausgabe is None and db.get("ausgabe"):
        raus = pfad.parent / raus
    raus.mkdir(parents=True, exist_ok=True)
    video = video or db.get("video")
    if video and not Path(video).is_absolute():
        kandidat = pfad.parent / video
        video = str(kandidat) if kandidat.exists() else video

    kapitel = db["kapitel"]
    sprech_namen = set(sprecher)

    # 1) Alle Sprechzeilen einsammeln und in einem Rutsch synthetisieren
    auftraege, zeilen = [], []
    for ki, kap in enumerate(kapitel):
        for item in kap.get("ablauf", []):
            wer = next((k for k in item if k in sprech_namen), None)
            if wer:
                text = str(item[wer])
                emo = item.get("emotion", "erzaehlend" if wer == "erzaehler" else "neutral")
                auftraege.append((sprecher[wer], text, emo))
                zeilen.append(Zeile(wer, text, emo, kapitel=ki))
            else:
                unbekannt = [k for k in item if k not in {"emotion", "sfx", "pause", "bei", "pegel", "dauer",
                                                          "parallel", "warten", "versatz", "pan", "atmo",
                                                          "atmo_stop", "ort", "parameter", "luecke", "musik",
                                                          "hoehepunkt", "musik_aus"}]
                if unbekannt:
                    raise ValueError(f"Kapitel {ki + 1}: unbekannter Sprecher/Schlüssel {unbekannt} "
                                     f"(Sprecher: {', '.join(sorted(sprech_namen))})")
    log(f"Stimmen: {len(auftraege)} Zeilen werden gesprochen …")
    gesprochen = S.sprechen_viele(auftraege)

    # 2) Zeitachse aufbauen
    stimme = np.zeros((A.sek(10), 2), np.float32)
    sfx = np.zeros((A.sek(10), 2), np.float32)
    atmo = np.zeros((A.sek(10), 2), np.float32)
    kap_info = []
    zi = 0
    t_kap = 0.0
    for ki, kap in enumerate(kapitel):
        if "start" in kap:
            soll = float(kap["start"])
            if soll + 0.01 < t_kap:
                log(f"  ⚠ Kapitel {ki + 1} soll bei {soll:.1f}s starten, vorheriges endet erst bei {t_kap:.1f}s")
            t_kap = max(t_kap, soll)
        ort = kap.get("ort", "wohnung")
        cursor = float(kap.get("vorlauf", 0.6 if ki else 0.3))
        hoehepunkt = kap.get("hoehepunkt")
        musik_aus = None
        laufende_atmos = {}  # name -> (start, cfg)
        fertige_atmos = []
        for a in kap.get("atmo", []) or []:
            a = _atmo_eintrag(a)
            laufende_atmos[a["name"]] = (0.0, a)

        for item in kap.get("ablauf", []):
            wer = next((k for k in item if k in sprech_namen), None)
            if "bei" in item:
                cursor = float(item["bei"])
            if wer:
                z, g = zeilen[zi], gesprochen[zi]
                zi += 1
                sp = sprecher[wer]
                faktor = max(0.05, 1 + (sp.lautstaerke + S.EMOTIONEN.get(z.emotion, S.EMOTIONEN["neutral"])[2]) / 100)
                x = _auf_rms(g.audio, STIMME_RMS + float(item.get("pegel", 0)) + 20 * np.log10(faktor))
                raum = item.get("ort", ort) if sp.im_raum else "trocken"
                xs = A.hall(A.stereo(x, float(item.get("pan", sp.pan))), raum)
                start = t_kap + cursor + float(item.get("versatz", 0))
                stimme = A.einmischen(stimme, xs, A.sek(start))
                z.start, z.ende = start, start + g.dauer
                z.cues = [(start + a, start + b, txt) for a, b, txt in g.cues]
                if not item.get("parallel"):
                    cursor += g.dauer + float(item.get("luecke", LUECKE))
            elif "sfx" in item:
                name = item["sfx"]
                kw = dict(item.get("parameter", {}) or {})
                if "dauer" in item:
                    kw["dauer"] = float(item["dauer"])
                x = G.erzeugen(name, seed=_seed(name, ki, cursor), **kw)
                gain = A.db(SFX_PEAK + SFX_PEGEL.get(name, 0) + float(item.get("pegel", 0)))
                raum = item.get("ort", ort)
                xs = A.stereo(x, float(item.get("pan", 0))) if x.ndim == 1 else x
                if raum != "trocken" and name not in {"hit", "riser", "whoosh", "ui_pop", "ui_ding"}:
                    xs = A.hall(xs, raum, None)
                start = t_kap + cursor + float(item.get("versatz", 0))
                sfx = A.einmischen(sfx, xs * gain, A.sek(start))
                if item.get("warten"):
                    cursor += len(x) / A.SR + float(item.get("luecke", 0.1))
            elif "pause" in item:
                cursor += float(item["pause"])
            elif "atmo" in item:
                a = _atmo_eintrag(item["atmo"])
                if "pegel" in item:
                    a.setdefault("pegel", item["pegel"])
                laufende_atmos[a["name"]] = (cursor, a)
            elif "hoehepunkt" in item:
                hoehepunkt = cursor + float(item.get("versatz", 0))
            elif "musik_aus" in item:
                musik_aus = (cursor, float(item["musik_aus"] or 0.3))
            elif "atmo_stop" in item:
                n = item["atmo_stop"]
                if n in laufende_atmos:
                    s0, a = laufende_atmos.pop(n)
                    fertige_atmos.append((s0, cursor, a))

        dauer = max(cursor + float(kap.get("nachlauf", 0.8)), float(kap.get("dauer", 0)))
        for n, (s0, a) in laufende_atmos.items():
            fertige_atmos.append((s0, dauer, a))
        for s0, s1, a in fertige_atmos:
            laenge = max(0.5, s1 - s0)
            roh = G.erzeugen(a["name"], seed=_seed(a["name"], ki), dauer=min(laenge + 1, 20.0),
                             **(a.get("parameter") or {}))
            roh = A.stereo(roh) if roh.ndim == 1 else roh
            roh = A.loop_auf(roh, A.sek(laenge))
            roh = _auf_rms(roh, ATMO_RMS + ATMO_PEGEL.get(a["name"], 0) + float(a.get("pegel", 0)))
            roh = A.fade(roh, float(a.get("einblenden", 0.8)), float(a.get("ausblenden", 0.8)))
            atmo = A.einmischen(atmo, roh, A.sek(t_kap + s0))
        kap_info.append({"nr": ki + 1, "titel": kap.get("titel", f"Kapitel {ki + 1}"), "start": round(t_kap, 3),
                         "ende": round(t_kap + dauer, 3), "musik": kap.get("musik", "keine"), "ort": ort,
                         "hoehepunkt": None if hoehepunkt is None else round(t_kap + float(hoehepunkt), 3),
                         "musik_aus": None if musik_aus is None else [round(t_kap + musik_aus[0], 3), musik_aus[1]]})
        t_kap += dauer

    gesamt = t_kap + 1.0
    n = A.sek(gesamt)

    def zuschneiden(x):
        return np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]

    stimme, sfx, atmo = zuschneiden(stimme), zuschneiden(sfx), zuschneiden(atmo)

    # 3) Musik pro Kapitel, mit Überblendung und Ducking unter der Stimme
    musik = np.zeros((n, 2), np.float32)
    if not nur_stimme:
        log("Musik wird komponiert …")
        for k, info in zip(kapitel, kap_info):
            st = k.get("musik", "keine")
            if not st or st == "keine":
                continue
            a = max(0.0, info["start"] - UEBERBLENDUNG / 2)
            d = info["ende"] - a + UEBERBLENDUNG / 2
            hp = None if info["hoehepunkt"] is None else info["hoehepunkt"] - a
            x = M.musik(st, d, seed=_seed(st, info["nr"]), intensitaet=float(k.get("intensitaet", 1.0)), hoehepunkt=hp)
            x = _auf_rms(x, MUSIK_RMS + MUSIK_PEGEL.get(st, 0) + float(k.get("musik_pegel", 0)))
            x = A.fade(x, UEBERBLENDUNG if info["nr"] > 1 else 0.3, UEBERBLENDUNG)
            if info["musik_aus"]:
                t_aus, f_aus = info["musik_aus"]
                s_aus, f_n = A.sek(t_aus - a), max(1, A.sek(f_aus))
                if 0 <= s_aus < len(x):
                    rampe = np.ones(len(x), np.float32)
                    rampe[s_aus:s_aus + f_n] = np.linspace(1, 0, len(rampe[s_aus:s_aus + f_n]))
                    rampe[s_aus + f_n:] = 0
                    x = x * rampe[:, None]
            musik = A.einmischen(musik, x, A.sek(a))
        musik = A.ducking(musik[:n], stimme, MUSIK_DUCKING)
        sfx_hall = sfx  # SFX schon im Raum
    else:
        sfx_hall = sfx * 0
        atmo = atmo * 0

    # 4) Master
    mix = stimme + musik + sfx_hall + atmo
    mix = A.kompressor(mix, -14, 1.8, 0.01, 0.25)
    mix = _lautheit(mix, ZIEL_LUFS, raus)
    mix = A.limiter(mix, -1.5)  # Reserve, damit True Peak nach AAC unter -1 dBTP bleibt
    log("Schreibe Dateien …")
    A.schreiben_wav(str(raus / "ton.wav"), mix)
    for name, x in (("stimme", stimme), ("musik", musik), ("geraeusche", sfx_hall + atmo)):
        A.schreiben_wav(str(raus / f"stem_{name}.wav"), A.limiter(x, -1.0))

    srt = _srt(zeilen)
    (raus / "untertitel.srt").write_text(srt, encoding="utf-8")
    timing = {
        "titel": db.get("titel", ""), "dauer": round(gesamt, 3), "kapitel": kap_info,
        "zeilen": [{"sprecher": z.sprecher, "emotion": z.emotion, "text": z.text, "start": round(z.start, 3),
                    "ende": round(z.ende, 3), "kapitel": z.kapitel + 1,
                    "saetze": [{"start": round(a, 3), "ende": round(b, 3), "text": t} for a, b, t in z.cues]}
                   for z in zeilen],
    }
    (raus / "timing.json").write_text(json.dumps(timing, ensure_ascii=False, indent=2), encoding="utf-8")

    ergebnis = {"ton": str(raus / "ton.wav"), "untertitel": str(raus / "untertitel.srt"),
                "timing": str(raus / "timing.json"), "dauer": gesamt}
    if video and not Path(video).exists():
        log(f"  ⚠ Video '{video}' nicht gefunden – nur Tonspur erzeugt.")
        video = None
    if video:
        ziel = raus / (Path(video).stem + "_mit_ton.mp4")
        _muxen(video, str(raus / "ton.wav"), str(raus / "untertitel.srt"), str(ziel), gesamt, log)
        ergebnis["video"] = str(ziel)
    elif vorschau:
        ziel = raus / "vorschau.mp4"
        log(f"Vorschau-Video → {ziel}")
        _vorschau(str(raus / "ton.wav"), str(raus / "untertitel.srt"), timing, str(ziel), raus)
        ergebnis["video"] = str(ziel)
    return ergebnis


def _vorschau(ton, srt, timing, ziel, tmpdir: Path):
    """Schlichtes Prüfvideo: dunkler Hintergrund, Kapiteltitel, eingebrannte Untertitel."""
    filter_ = []
    for k in timing["kapitel"]:
        txt = tmpdir / f"_kap{k['nr']}.txt"
        txt.write_text(f"{k['nr']}. {k['titel']}", encoding="utf-8")
        filter_.append(
            f"drawtext=textfile='{txt}':fontcolor=0xE6EDF3:fontsize=46:x=(w-tw)/2:y=h*0.30:"
            f"font='Inter':enable='between(t,{k['start']},{k['ende']})'")
    titel = tmpdir / "_titel.txt"
    titel.write_text(timing.get("titel", ""), encoding="utf-8")
    filter_.append(f"drawtext=textfile='{titel}':fontcolor=0x7D8590:fontsize=28:x=(w-tw)/2:y=h*0.12:font='Inter'")
    stil = "FontName=Inter,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BorderStyle=1,Outline=2,MarginV=40"
    filter_.append(f"subtitles='{srt}':force_style='{stil}'")
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c=0x0D1117:s=1280x720:r=25:d={timing['dauer']:.2f}",
        "-i", ton, "-vf", ",".join(filter_), "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", ziel,
    ], check=True)
    for f in tmpdir.glob("_*.txt"):
        f.unlink()


def _lautheit(x, ziel, tmpdir: Path):
    """Integrierte Lautheit (EBU R128) per ffmpeg messen und auf Ziel bringen."""
    tmp = tmpdir / "_mess.wav"
    A.schreiben_wav(str(tmp), x)
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(tmp), "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    tmp.unlink(missing_ok=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", out)
    if not m:
        return x
    return x * A.db(ziel - float(m[-1]))


def _zeit(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _umbrechen(text, breite=42):
    if len(text) <= breite:
        return text
    woerter = text.split()
    mitte = len(text) / 2
    besten = min(range(1, len(woerter)), key=lambda i: abs(len(" ".join(woerter[:i])) - mitte))
    return " ".join(woerter[:besten]) + "\n" + " ".join(woerter[besten:])


def _srt(zeilen):
    cues = []
    for z in zeilen:
        for a, b, text in z.cues:
            # sehr lange Sätze in mehrere Untertitel teilen
            woerter = text.split()
            stuecke, akt = [], []
            for w in woerter:
                if len(" ".join(akt + [w])) > 80 and akt:
                    stuecke.append(" ".join(akt))
                    akt = []
                akt.append(w)
            stuecke.append(" ".join(akt))
            gesamt = sum(len(s) for s in stuecke)
            t = a
            for s in stuecke:
                d = (b - a) * len(s) / gesamt
                cues.append((t, t + d, s))
                t += d
    zeilen_srt = []
    for i, (a, b, text) in enumerate(cues, 1):
        zeilen_srt.append(f"{i}\n{_zeit(a)} --> {_zeit(b + 0.15)}\n{_umbrechen(text)}\n")
    return "\n".join(zeilen_srt)


def _dauer(pfad):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", pfad],
                         capture_output=True, text=True).stdout.strip()
    return float(out or 0)


def _muxen(video, ton, srt, ziel, ton_dauer, log):
    v_dauer = _dauer(video)
    log(f"Video {v_dauer:.1f}s, Ton {ton_dauer:.1f}s → {ziel}")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", video, "-i", ton, "-i", srt, "-map", "0:v:0", "-map", "1:a:0",
           "-map", "2:s:0", "-c:a", "aac", "-b:a", "192k", "-c:s", "mov_text", "-metadata:s:s:0", "language=deu"]
    if ton_dauer > v_dauer + 0.5:
        log("  Ton ist länger als das Video – letztes Bild wird gehalten.")
        cmd += ["-vf", f"tpad=stop_mode=clone:stop_duration={ton_dauer - v_dauer:.2f}", "-c:v", "libx264",
                "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p"]
    else:
        cmd += ["-c:v", "copy", "-af", "apad", "-t", f"{v_dauer:.3f}"]
    cmd += ["-movflags", "+faststart", ziel]
    subprocess.run(cmd, check=True)
