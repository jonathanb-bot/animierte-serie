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
from . import untertitel as U

# Stil-Profile. "kurzgeschichte" ist der Standard und ist nach der Vorlage eingemessen:
# eine tiefe, trockene, zügige Erzählstimme; dunkler Dauer-Drone ~12 dB unter der Stimme,
# kaum Ducking; wenige, dezente Geräusche; harte Stille-Schnitte; Wort-für-Wort-Untertitel; Hochkant.
STILE = {
    "kurzgeschichte": dict(
        erzaehler=dict(stimme="de-DE-ConradNeural", tempo=18, emotion_staerke=0.5),
        figuren_im_raum=False, musik_rms=-31.5, ducking=-2.5, atmo_rms=-40.0, sfx_peak=-13.0,
        luecke=0.4, vorlauf=0.2, nachlauf=0.3, musik="dunkel", ort="trocken", format=(1080, 1920),
        einbrennen=True,
    ),
    "hoerspiel": dict(
        erzaehler=dict(stimme="de-DE-FlorianMultilingualNeural", tempo=0),
        figuren_im_raum=True, musik_rms=-24.0, ducking=-9.0, atmo_rms=-36.0, sfx_peak=-9.0,
        luecke=0.25, vorlauf=0.6, nachlauf=0.8, musik="keine", ort="wohnung", format=(1280, 720),
        einbrennen=False,
    ),
}
FORMATE = {"hochkant": (1080, 1920), "quer": (1920, 1080)}

STIMME_RMS = -18.0  # Grundpegel Stimme (dBFS RMS); alles andere relativ dazu
SFX_PEGEL = {  # Feinabstimmung pro Geräusch (dB relativ zum Stil-Grundpegel)
    "hit": 4, "riser": -2, "whoosh": -4, "ui_pop": -8, "ui_ding": -7, "taschenlampe": -4,
    "papier": -5, "schreiben": -8, "herzschlag": 2, "zombie_horde": 0, "donner": 2,
    "autoalarm": -2, "wecker": -3, "stromausfall": 0, "kein_netz": -6, "funk_klick": -6,
}
MUSIK_PEGEL = {"titel": 5, "cliffhanger": 5, "action": 2, "spannung": 1, "nacht": -2, "traurig": -1}
ATMO_PEGEL = {"stille_raum": -6, "kuehlschrank": -4, "kerze_knistern": -2, "herzschlag": 8, "atmen": 4,
              "zombie_horde": 6, "regen": 2, "wind": 2, "funk_rauschen": 0}
OHNE_HALL = {"hit", "riser", "whoosh", "ui_pop", "ui_ding"}
UEBERBLENDUNG = 1.5    # Musik-Überblendung zwischen Kapiteln
ZIEL_LUFS = -14.0      # YouTube-Lautheit
SCHLUESSEL = {"emotion", "sfx", "pause", "bei", "pegel", "dauer", "parallel", "warten", "versatz", "pan", "atmo",
              "atmo_stop", "ort", "parameter", "luecke", "musik", "hoehepunkt", "musik_aus", "schnitt",
              "einblendung", "farbe"}


@dataclass
class Zeile:
    sprecher: str
    text: str
    emotion: str
    start: float = 0.0
    ende: float = 0.0
    kapitel: int = 0
    cues: list = field(default_factory=list)
    woerter: list = field(default_factory=list)


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


def _sprecher_laden(cfg: dict, stil: dict) -> dict[str, S.Sprecher]:
    cfg = dict(cfg or {})
    cfg.setdefault("erzaehler", {})
    out = {}
    for name, c in cfg.items():
        c = dict(c or {})
        basis = stil["erzaehler"] if name == "erzaehler" else {}
        out[name] = S.Sprecher(
            name=name,
            stimme=c.get("stimme", basis.get("stimme", "de-DE-KillianNeural")),
            tempo=int(c.get("tempo", basis.get("tempo", 0))), hoehe=int(c.get("hoehe", 0)),
            lautstaerke=int(c.get("lautstaerke", 0)),
            im_raum=bool(c.get("im_raum", name != "erzaehler" and stil["figuren_im_raum"])),
            pan=float(c.get("pan", 0.0)), pausen=float(c.get("pausen", 1.0)),
            emotion_staerke=float(c.get("emotion_staerke", basis.get("emotion_staerke", 1.0))),
        )
    return out


def _atmo_eintrag(e):
    if isinstance(e, str):
        return {"name": e}
    return dict(e)


def bauen(drehbuch_pfad: str, ausgabe: str | None = None, video: str | None = None,
          nur_stimme: bool = False, vorschau: bool = False, log=print) -> dict:
    pfad = Path(drehbuch_pfad)
    db = yaml.safe_load(pfad.read_text(encoding="utf-8"))
    stil_name = db.get("stil", "kurzgeschichte")
    if stil_name not in STILE:
        raise ValueError(f"Unbekannter Stil '{stil_name}'. Verfügbar: {', '.join(STILE)}")
    stil = STILE[stil_name]
    format_ = FORMATE.get(db.get("format"), stil["format"])
    einbrennen = bool(db.get("untertitel_einbrennen", stil["einbrennen"]))
    sprecher = _sprecher_laden(db.get("sprecher"), stil)
    raus = Path(ausgabe) if ausgabe else pfad.parent / db.get("ausgabe", "ausgabe")
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
                unbekannt = [k for k in item if k not in SCHLUESSEL]
                if unbekannt:
                    raise ValueError(f"Kapitel {ki + 1}: unbekannter Sprecher/Schlüssel {unbekannt} "
                                     f"(Sprecher: {', '.join(sorted(sprech_namen))})")
    log(f"Stil „{stil_name}“ · Stimmen: {len(auftraege)} Zeilen werden gesprochen …")
    gesprochen = S.sprechen_viele(auftraege)

    # 2) Zeitachse aufbauen
    stimme = np.zeros((A.sek(10), 2), np.float32)
    sfx = np.zeros((A.sek(10), 2), np.float32)
    atmo = np.zeros((A.sek(10), 2), np.float32)
    schnitte, einblendungen, hud, kap_info = [], [], [], []
    hud_zustand: dict = {}
    zi = 0
    t_kap = 0.0
    for ki, kap in enumerate(kapitel):
        if "start" in kap:
            soll = float(kap["start"])
            if soll + 0.01 < t_kap:
                log(f"  ⚠ Kapitel {ki + 1} soll bei {soll:.1f}s starten, vorheriges endet erst bei {t_kap:.1f}s")
            t_kap = max(t_kap, soll)
        ort = kap.get("ort", stil["ort"])
        cursor = float(kap.get("vorlauf", stil["vorlauf"] if ki else 0.2))
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
                z.woerter = [(start + a, start + b, w, akz) for a, b, w, akz in g.woerter]
                if not item.get("parallel"):
                    cursor += g.dauer + float(item.get("luecke", stil["luecke"]))
            elif "sfx" in item:
                name = item["sfx"]
                kw = dict(item.get("parameter", {}) or {})
                if "dauer" in item:
                    kw["dauer"] = float(item["dauer"])
                x = G.erzeugen(name, seed=_seed(name, ki, cursor), **kw)
                gain = A.db(stil["sfx_peak"] + SFX_PEGEL.get(name, 0) + float(item.get("pegel", 0)))
                raum = item.get("ort", ort)
                xs = A.stereo(x, float(item.get("pan", 0))) if x.ndim == 1 else x
                if raum != "trocken" and name not in OHNE_HALL:
                    xs = A.hall(xs, raum, None)
                start = t_kap + cursor + float(item.get("versatz", 0))
                sfx = A.einmischen(sfx, xs * gain, A.sek(start))
                if item.get("warten"):
                    cursor += len(x) / A.SR + float(item.get("luecke", 0.1))
            elif "pause" in item:
                cursor += float(item["pause"])
            elif "schnitt" in item:
                d = float(item["schnitt"] or 0.45)
                schnitte.append((t_kap + cursor, d))
                cursor += d
            elif "einblendung" in item:
                s0 = t_kap + cursor + float(item.get("versatz", 0))
                einblendungen.append({"start": s0, "ende": s0 + float(item.get("dauer", 1.6)),
                                      "text": item["einblendung"], "farbe": item.get("farbe", "orange")})
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

        dauer = max(cursor + float(kap.get("nachlauf", stil["nachlauf"])), float(kap.get("dauer", 0)))
        for n, (s0, a) in laufende_atmos.items():
            fertige_atmos.append((s0, dauer, a))
        for s0, s1, a in fertige_atmos:
            laenge = max(0.5, s1 - s0)
            roh = G.erzeugen(a["name"], seed=_seed(a["name"], ki), dauer=min(laenge + 1, 20.0),
                             **(a.get("parameter") or {}))
            roh = A.stereo(roh) if roh.ndim == 1 else roh
            roh = A.loop_auf(roh, A.sek(laenge))
            roh = _auf_rms(roh, stil["atmo_rms"] + ATMO_PEGEL.get(a["name"], 0) + float(a.get("pegel", 0)))
            roh = A.fade(roh, float(a.get("einblenden", 0.8)), float(a.get("ausblenden", 0.8)))
            atmo = A.einmischen(atmo, roh, A.sek(t_kap + s0))

        # HUD: Werte gelten weiter, bis ein Kapitel sie ändert; "hud: aus" blendet es aus
        h = kap.get("hud")
        if h == "aus" or h is False:
            hud_zustand = {}
        elif isinstance(h, dict):
            hud_zustand = {**hud_zustand, **h}
        if hud_zustand:
            hud.append({**hud_zustand, "start": t_kap, "ende": t_kap + dauer})
            if hud_zustand.get("uhr_bis"):  # Uhr steht danach auf der erreichten Zeit
                hud_zustand["uhr"] = hud_zustand.pop("uhr_bis")

        kap_info.append({"nr": ki + 1, "titel": kap.get("titel", f"Kapitel {ki + 1}"), "start": round(t_kap, 3),
                         "ende": round(t_kap + dauer, 3), "musik": kap.get("musik", stil["musik"]), "ort": ort,
                         "hoehepunkt": None if hoehepunkt is None else round(t_kap + float(hoehepunkt), 3),
                         "musik_aus": None if musik_aus is None else [round(t_kap + musik_aus[0], 3), musik_aus[1]]})
        t_kap += dauer

    gesamt = t_kap + 0.6
    n = A.sek(gesamt)

    def zuschneiden(x):
        return np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]

    stimme, sfx, atmo = zuschneiden(stimme), zuschneiden(sfx), zuschneiden(atmo)

    # 3) Musik pro Kapitel, mit Überblendung und Ducking unter der Stimme
    musik = np.zeros((n, 2), np.float32)
    if not nur_stimme:
        log("Musik wird komponiert …")
        for k, info in zip(kapitel, kap_info):
            st = info["musik"]
            if not st or st == "keine":
                continue
            a = max(0.0, info["start"] - UEBERBLENDUNG / 2)
            d = info["ende"] - a + UEBERBLENDUNG / 2
            hp = None if info["hoehepunkt"] is None else info["hoehepunkt"] - a
            x = M.musik(st, d, seed=_seed(st, info["nr"]), intensitaet=float(k.get("intensitaet", 1.0)), hoehepunkt=hp)
            x = _auf_rms(x, stil["musik_rms"] + MUSIK_PEGEL.get(st, 0) + float(k.get("musik_pegel", 0)))
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
        musik = A.ducking(musik[:n], stimme, stil["ducking"])
    else:
        sfx = sfx * 0
        atmo = atmo * 0

    # Stille-Schnitte: Bett (Musik, Atmo, Geräusche) fällt hart auf null und setzt hart wieder ein
    if schnitte:
        maske = np.ones(n, np.float32)
        r = A.sek(0.008)
        for t0, d in schnitte:
            s0, s1 = A.sek(t0), A.sek(t0 + d)
            maske[s0:s1] = 0
            maske[max(0, s0 - r):s0] = np.linspace(1, 0, len(maske[max(0, s0 - r):s0]))
            maske[s1:s1 + r] = np.linspace(0, 1, len(maske[s1:s1 + r]))
        musik, sfx, atmo = (x * maske[:, None] for x in (musik, sfx, atmo))

    # 4) Master
    mix = stimme + musik + sfx + atmo
    mix = A.kompressor(mix, -14, 1.8, 0.01, 0.25)
    mix = _lautheit(mix, ZIEL_LUFS, raus)
    mix = A.limiter(mix, -1.5)  # Reserve, damit True Peak nach AAC unter -1 dBTP bleibt
    for t0, d in schnitte:  # nach Kompressor/Limiter wirklich digitale Stille, wenn niemand spricht
        s0, s1 = A.sek(t0), A.sek(t0 + d)
        if np.abs(stimme[s0:s1]).max(initial=0) < 1e-4:
            mix[s0:s1] = 0
    log("Schreibe Dateien …")
    A.schreiben_wav(str(raus / "ton.wav"), mix)
    for name, x in (("stimme", stimme), ("musik", musik), ("geraeusche", sfx + atmo)):
        A.schreiben_wav(str(raus / f"stem_{name}.wav"), A.limiter(x, -1.0))

    (raus / "untertitel.srt").write_text(_srt(zeilen), encoding="utf-8")
    ass_daten = dict(zeilen=[{"text": z.text, "woerter": z.woerter} for z in zeilen],
                     einblendungen=einblendungen, hud=hud, ende_gesamt=gesamt)
    U.ass(str(raus / "untertitel.ass"), *format_, **ass_daten)
    timing = {
        "titel": db.get("titel", ""), "stil": stil_name, "dauer": round(gesamt, 3), "kapitel": kap_info,
        "schnitte": [[round(a, 3), d] for a, d in schnitte], "einblendungen": einblendungen, "hud": hud,
        "zeilen": [{"sprecher": z.sprecher, "emotion": z.emotion, "text": z.text, "start": round(z.start, 3),
                    "ende": round(z.ende, 3), "kapitel": z.kapitel + 1,
                    "saetze": [{"start": round(a, 3), "ende": round(b, 3), "text": t} for a, b, t in z.cues],
                    "woerter": [{"start": round(a, 3), "ende": round(b, 3), "wort": w, "akzent": akz}
                                for a, b, w, akz in z.woerter]}
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
        ass_pfad = None
        if einbrennen:
            b, h = _groesse(video)
            ass_pfad = raus / "untertitel_video.ass"
            U.ass(str(ass_pfad), b, h, **ass_daten)
        _muxen(video, str(raus / "ton.wav"), str(raus / "untertitel.srt"), str(ziel), gesamt, log, ass_pfad)
        ergebnis["video"] = str(ziel)
    elif vorschau:
        ziel = raus / "vorschau.mp4"
        log(f"Vorschau-Video ({format_[0]}×{format_[1]}) → {ziel}")
        _vorschau(str(raus / "ton.wav"), str(raus / "untertitel.ass"), timing, str(ziel), format_, raus)
        ergebnis["video"] = str(ziel)
    return ergebnis


def _ass_filter(ass_pfad) -> str:
    return f"ass=filename='{ass_pfad}':fontsdir='{U.SCHRIFT_ORDNER}'"


def _vorschau(ton, ass_pfad, timing, ziel, format_, tmpdir: Path):
    """Prüfvideo ohne Animation: dunkler Verlauf, Kapitelname klein, Untertitel/HUD wie im fertigen Video."""
    b, h = format_
    filter_ = []
    for k in timing["kapitel"]:
        txt = tmpdir / f"_kap{k['nr']}.txt"
        txt.write_text(f"{k['nr']}. {k['titel']}", encoding="utf-8")
        filter_.append(
            f"drawtext=textfile='{txt}':fontcolor=0x7D8590:fontsize={round(h * 0.022)}:x=(w-tw)/2:y=h*0.45:"
            f"font='Inter':enable='between(t,{k['start']},{k['ende']})'")
    filter_.append(_ass_filter(ass_pfad))
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
        f"gradients=s={b}x{h}:r=30:d={timing['dauer']:.2f}:c0=0x0D1117:c1=0x1B2430:x0=0:y0=0:x1=0:y1={h}:speed=0.00001",
        "-i", ton, "-vf", ",".join(filter_), "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
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
    """Satzweise Untertitel (zum Hochladen als zuschaltbare Untertitel)."""
    cues = []
    for z in zeilen:
        for a, b, text in z.cues:
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


def _groesse(pfad):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                          "-of", "csv=p=0", pfad], capture_output=True, text=True).stdout.strip()
    b, h = out.split(",")[:2]
    return int(b), int(h)


def _muxen(video, ton, srt, ziel, ton_dauer, log, ass_pfad=None):
    v_dauer = _dauer(video)
    log(f"Video {v_dauer:.1f}s, Ton {ton_dauer:.1f}s → {ziel}")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", video, "-i", ton, "-i", srt, "-map", "0:v:0", "-map", "1:a:0",
           "-map", "2:s:0", "-c:a", "aac", "-b:a", "192k", "-c:s", "mov_text", "-metadata:s:s:0", "language=deu"]
    vf = []
    if ton_dauer > v_dauer + 0.5:
        log("  Ton ist länger als das Video – letztes Bild wird gehalten.")
        vf.append(f"tpad=stop_mode=clone:stop_duration={ton_dauer - v_dauer:.2f}")
    if ass_pfad:
        vf.append(_ass_filter(ass_pfad))
    if vf:
        cmd += ["-vf", ",".join(vf), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p"]
    else:
        cmd += ["-c:v", "copy"]
    if ton_dauer <= v_dauer + 0.5:
        cmd += ["-af", "apad", "-t", f"{v_dauer:.3f}"]
    cmd += ["-movflags", "+faststart", ziel]
    subprocess.run(cmd, check=True)
