"""Erzählstimme über Gemini-TTS (natürlicher als Edge, kostenloses Kontingent: 10 Anfragen/Tag).

Um mit dem Kontingent auszukommen, werden mehrere Kapitel am Stück angefragt (eine Zeile pro Einstellung).
Gemini liefert keine Wortzeiten: eine lokale Spracherkennung (faster-whisper, kostenlos) hört das Ergebnis ab,
ordnet die erkannten Wörter dem Drehbuchtext zu, schneidet daran die Einstellungen und liefert die Wortzeiten
für die Untertitel. Liest Gemini versehentlich die Stilanweisung mit vor, fällt das dabei weg.
Rohaudio wird gecacht, ein zweiter Lauf mit gleichem Text kostet keine Anfrage.
"""
from __future__ import annotations

import base64
import difflib
import hashlib
import io
import json
import os
import re
import time
import urllib.error
import urllib.request

import numpy as np

from . import audio as A
from .stimmen import CACHE, Gesprochen, markierungen, norm, stimm_kette

MODELL = os.environ.get("GEMINI_TTS_MODELL", "gemini-3.8-flash-tts")
STIL = ("Du bist der Erzähler einer düsteren Kurzgeschichte für TikTok: tiefe, trockene, nahe Männerstimme, "
        "zügig, ruhig bedrohlich, Deutsch. Sprich ausschließlich den Text der Nachricht, nichts davon vorlesen, "
        "was hier steht. Nach jeder Zeile eine kurze Pause.")
MAX_PAUSE = 0.6    # längere Pausen werden darauf gekürzt
TEMPO = 1.0
_WHISPER = None


class KontingentErschoepft(RuntimeError):
    pass


def _post(body: dict) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODELL}:generateContent"
    schluessel = os.environ.get("GEMINI_API_KEY")
    kopf = {"Content-Type": "application/json", **({"x-goog-api-key": schluessel} if schluessel else {})}
    for versuch in range(4):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=kopf)
            return json.load(urllib.request.urlopen(req, timeout=300))
        except urllib.error.HTTPError as e:
            info = e.read().decode(errors="replace")
            if e.code == 429 and ("per day" in info.lower() or "PerDay" in info):
                raise KontingentErschoepft("Gemini-Tageskontingent aufgebraucht (kostenlos: 10 Anfragen/Tag).") from e
            if versuch == 3 or e.code not in (429, 500, 503):
                raise RuntimeError(f"Gemini-TTS: HTTP {e.code}: {info[:300]}") from e
            time.sleep(15 * (versuch + 1))
    raise RuntimeError("Gemini-TTS: keine Antwort")


def _anfrage(text: str, stimme: str) -> np.ndarray:
    body = {"contents": [{"role": "user", "parts": [{"text": text}]}],
            "systemInstruction": {"parts": [{"text": STIL}]},
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": stimme}}}}}
    try:
        d = _post(body)
    except RuntimeError as e:
        if "HTTP 400" not in str(e):
            raise
        body.pop("systemInstruction")  # Modell kennt keine Systemanweisung -> nur der Text
        d = _post(body)
    p = d["candidates"][0]["content"]["parts"][0]["inlineData"]
    roh = base64.b64decode(p["data"])
    if "wav" in p["mimeType"]:
        import soundfile as sf
        x, sr = sf.read(io.BytesIO(roh), dtype="float32")
    else:
        x, sr = np.frombuffer(roh, "<i2").astype(np.float32) / 32768, 24000
    if x.ndim > 1:
        x = x.mean(axis=1)
    from scipy.signal import resample_poly
    g = np.gcd(A.SR, sr)
    return resample_poly(x, A.SR // g, sr // g).astype(np.float32)


def _block_audio(zeilen: list[str], stimme: str, log=print) -> np.ndarray:
    text = "\n".join(zeilen)
    h = hashlib.sha1(f"{MODELL}|{stimme}|{STIL}|{text}".encode()).hexdigest()[:20]
    ziel = CACHE / f"gemini_{h}.f32"
    if ziel.exists():
        return np.fromfile(ziel, np.float32)
    log(f"    Gemini ({stimme}): {len(zeilen)} Zeilen …")
    x = _anfrage(text, stimme)
    CACHE.mkdir(parents=True, exist_ok=True)
    x.tofile(ziel)
    return x


def _kuerzen(x: np.ndarray, max_s: float) -> np.ndarray:
    """Stille länger als max_s auf max_s kürzen."""
    fr = A.sek(0.01)
    n = len(x) // fr
    rms = np.sqrt(np.mean(x[:n * fr].reshape(n, fr) ** 2, axis=1))
    still = rms < max(0.004, 0.08 * np.percentile(rms, 90))
    behalten, lauf = np.ones(n, bool), 0
    for i in range(n):
        lauf = lauf + 1 if still[i] else 0
        if lauf > max_s / 0.01:
            behalten[i] = False
    return np.concatenate([x[i * fr:(i + 1) * fr] for i in np.flatnonzero(behalten)] + [x[n * fr:]])


def _erkennen(x: np.ndarray) -> list[tuple[float, float, str]]:
    global _WHISPER
    from scipy.signal import resample_poly
    if _WHISPER is None:
        from faster_whisper import WhisperModel
        _WHISPER = WhisperModel(os.environ.get("WHISPER_MODELL", "small"), device="cpu", compute_type="int8")
    x16 = resample_poly(x, 16000 // np.gcd(A.SR, 16000), A.SR // np.gcd(A.SR, 16000)).astype(np.float32)
    segs, _ = _WHISPER.transcribe(x16, language="de", word_timestamps=True)
    return [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]


_ZAHLEN = {"23": "dreiundzwanzig", "24": "vierundzwanzig", "20": "zwanzig", "10": "zehn", "12": "zwölf"}


def _vergleichsform(w: str) -> str:
    w = norm(w)
    return _ZAHLEN.get(w, w)


def _zuordnen(skript: list[str], erkannt: list[tuple[float, float, str]]) -> list[tuple[float, float]]:
    """Zeiten für jedes Skriptwort: direkte Treffer übernehmen, Lücken linear auffüllen."""
    a = [_vergleichsform(w) for w in skript]
    b = [_vergleichsform(w) for _, _, w in erkannt]
    zeiten: list[tuple[float, float] | None] = [None] * len(a)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            zeiten[blk.a + k] = erkannt[blk.b + k][:2]
    # unscharfe Treffer (z. B. "Zombie-Apokalypse" vs. "Zombieapokalypse") über ähnliche Nachbarschaft
    i = 0
    while i < len(a):
        if zeiten[i] is not None:
            i += 1
            continue
        j = i
        while j < len(a) and zeiten[j] is None:
            j += 1
        t0 = zeiten[i - 1][1] if i > 0 else (erkannt[0][0] if erkannt else 0.0)
        t1 = zeiten[j][0] if j < len(a) else (erkannt[-1][1] if erkannt else t0)
        gew = np.array([len(a[k]) + 1 for k in range(i, j)], float)
        grenzen = t0 + np.concatenate([[0], np.cumsum(gew)]) / gew.sum() * max(0.0, t1 - t0)
        for k in range(i, j):
            zeiten[k] = (float(grenzen[k - i]), float(grenzen[k - i + 1]))
        i = j
    return zeiten


def _ruhigste(x: np.ndarray, t0: float, t1: float) -> float:
    """Leiseste Stelle (Mitte des leisesten 30-ms-Fensters) zwischen t0 und t1."""
    a, b = A.sek(max(0.0, t0)), A.sek(max(t0, t1))
    if b - a < A.sek(0.04):
        return (t0 + t1) / 2
    fr = A.sek(0.01)
    e = np.convolve(x[a:b] ** 2, np.ones(3 * fr) / (3 * fr), "valid")
    return (a + int(np.argmin(e)) + 1.5 * fr) / A.SR


def sprechen(zeilen: list[str], kapitel: list[int], stimme="Orus", kapitel_pro_anfrage=2,
             log=print) -> list[Gesprochen]:
    """Eine Folge sprechen. zeilen = Sprechtext je Einstellung (mit *Markierungen*), kapitel = Kapitel je Zeile."""
    import subprocess
    import tempfile
    bloecke: dict[int, list[int]] = {}
    for i, k in enumerate(kapitel):
        bloecke.setdefault(k // kapitel_pro_anfrage, []).append(i)
    out: list[Gesprochen | None] = [None] * len(zeilen)
    for idx in bloecke.values():
        texte = [" ".join(markierungen(zeilen[i])[0].split()) for i in idx]
        x = _kuerzen(_block_audio(texte, stimme, log), MAX_PAUSE)
        if TEMPO != 1.0:
            with tempfile.TemporaryDirectory() as d:
                A.schreiben_wav(f"{d}/a.wav", x)
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{d}/a.wav", "-af", f"atempo={TEMPO}",
                                f"{d}/b.wav"], check=True)
                x = A.laden(f"{d}/b.wav")
        erkannt = _erkennen(x)
        woerter = [(z, w) for z, t in enumerate(texte) for w in t.split()]
        zeiten = _zuordnen([w for _, w in woerter], erkannt)
        # Zeilengrenzen: Mitte der Lücke zwischen letztem Wort der Zeile und erstem der nächsten
        erste = {z: min(k for k, (zz, _) in enumerate(woerter) if zz == z) for z in range(len(texte))}
        letzte = {z: max(k for k, (zz, _) in enumerate(woerter) if zz == z) for z in range(len(texte))}
        start = [max(0.0, zeiten[erste[0]][0] - 0.05)]
        for z in range(1, len(texte)):
            # Whisper setzt Wortanfänge oft zu früh -> leiseste Stelle bis kurz vor Ende des ersten Wortes
            start.append(_ruhigste(x, zeiten[letzte[z - 1]][1] - 0.15, zeiten[erste[z]][1] - 0.08))
        ende = start[1:] + [min(len(x) / A.SR, zeiten[letzte[len(texte) - 1]][1] + 0.25)]
        for z, i in enumerate(idx):
            a, b = A.sek(start[z]), A.sek(ende[z])
            laut = np.flatnonzero(np.abs(x[a:b]) > 0.01)
            if len(laut):  # Stille am Rand weg (wie beim Edge-Weg)
                b = min(b, a + laut[-1] + A.sek(0.12))
                a = max(a, a + laut[0] - A.sek(0.03))
                start[z] = a / A.SR
            y = x[a:b]
            _, akzente = markierungen(zeilen[i])
            dauer = len(y) / A.SR
            ws = [(min(dauer, max(0.0, zeiten[k][0] - start[z])), min(dauer, max(0.0, zeiten[k][1] - start[z])), w,
                   akzente.get(norm(w)))
                  for k, (zz, w) in enumerate(woerter) if zz == z]
            out[i] = Gesprochen(stimm_kette(y), [(0.0, len(y) / A.SR, zeilen[i])], ws)
        log(f"    {len(idx)} Zeilen zugeordnet ({len(erkannt)} Wörter erkannt, Skript {len(woerter)})")
    return out
