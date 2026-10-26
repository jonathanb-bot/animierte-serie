"""Sprachausgabe (kostenlos) über Microsoft-Edge-Neural-Stimmen.

Gegen Monotonie:
- jede Zeile wird in Sätze zerlegt, jeder Satz bekommt eigene Prosodie
  (Emotion + Satzzeichen + kleine Zufallsvariation),
- echte Pausen zwischen Sätzen ("..." = lange Pause),
- je Figur eine eigene Stimme, Figuren klingen im Raum (Hall), der Erzähler nah und trocken.
"""
from __future__ import annotations

import asyncio
import hashlib
import os
import re
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from . import audio as A

CACHE = Path(os.environ.get("TON_CACHE", Path(__file__).resolve().parent.parent / ".cache" / "tts"))

# Emotion -> (Tempo %, Tonhöhe Hz, Lautstärke %, Pausenfaktor)
EMOTIONEN = {
    "neutral":     (0, 0, 0, 1.0),
    "erzaehlend":  (-3, -1, 0, 1.1),
    "ruhig":       (-7, -2, -5, 1.25),
    "ernst":       (-5, -4, 0, 1.2),
    "spannend":    (-11, -6, -4, 1.5),
    "dramatisch":  (-14, -8, 5, 1.7),
    "leise":       (-10, -5, -25, 1.3),
    "aufgeregt":   (12, 6, 5, 0.7),
    "panisch":     (20, 10, 10, 0.5),
    "froh":        (6, 5, 0, 0.9),
    "erleichtert": (-3, 2, 0, 1.2),
    "traurig":     (-11, -7, -10, 1.5),
    "wuetend":     (9, -3, 15, 0.8),
    "fragend":     (0, 3, 0, 1.0),
    "erklaerend":  (-2, 0, 0, 1.0),
    "cool":        (-4, -3, 0, 1.0),
}

STANDARD_STIMMEN = {
    "erzaehler": "de-DE-FlorianMultilingualNeural",
}

_SATZ = re.compile(r"(.+?(?:\.\.\.|…|[.!?]+|$))(?:\s+|$)", re.S)


@dataclass
class Sprecher:
    name: str
    stimme: str
    tempo: int = 0        # Grundtempo in %
    hoehe: int = 0        # Grundtonhöhe in Hz
    lautstaerke: int = 0  # in %
    im_raum: bool = True  # Hall des Ortes anwenden? (Erzähler: nein)
    pan: float = 0.0


@dataclass
class Satz:
    text: str
    tempo: int
    hoehe: int
    lautstaerke: int
    pause: float


@dataclass
class Gesprochen:
    """Ergebnis einer Zeile: Audio (mono) + Untertitel relativ zum Zeilenstart."""
    audio: np.ndarray
    cues: list = field(default_factory=list)  # (start_s, ende_s, text)

    @property
    def dauer(self) -> float:
        return len(self.audio) / A.SR


def saetze(text: str) -> list[str]:
    text = " ".join(text.replace("*", "").split())
    teile = [m.group(1).strip() for m in _SATZ.finditer(text) if m.group(1).strip()]
    return [t for t in teile if any(c.isalnum() for c in t)]  # nur Satzzeichen -> nichts zu sprechen


def prosodie(sprecher: Sprecher, text: str, emotion: str = "neutral") -> list[Satz]:
    t0, h0, v0, pf = EMOTIONEN.get(emotion, EMOTIONEN["neutral"])
    teile = saetze(text)
    seed = int(hashlib.md5((sprecher.name + text).encode()).hexdigest()[:8], 16)
    rng = np.random.default_rng(seed)
    out = []
    for i, s in enumerate(teile):
        tempo = sprecher.tempo + t0 + int(rng.integers(-3, 4))
        hoehe = sprecher.hoehe + h0 + int(rng.integers(-2, 3))
        laut = sprecher.lautstaerke + v0
        if s.endswith("?"):
            hoehe += 3
            pause = 0.42
        elif s.endswith("!"):
            tempo += 4
            laut += 5
            pause = 0.32
        elif s.endswith(("...", "…")):
            tempo -= 4
            pause = 0.7
        else:
            pause = 0.34
        if i == 0 and len(teile) > 1:
            tempo -= 2  # Einstieg etwas bewusster
        if len(s) < 18:
            tempo -= 3  # kurze Sätze wirken mit etwas Luft
        out.append(Satz(s, tempo, hoehe, laut, pause * pf))
    return out


def _schluessel(stimme: str, s: Satz) -> Path:
    h = hashlib.sha1(f"{stimme}|{s.tempo}|{s.hoehe}|{s.lautstaerke}|{s.text}".encode()).hexdigest()[:20]
    return CACHE / f"{h}.mp3"


def _ssl_vorbereiten():
    """Hinter dem Proxy der Cloud-Umgebung das dortige CA-Bundle verwenden."""
    bundle = os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt"
    if os.path.exists(bundle):
        import certifi
        certifi.where = lambda: bundle


async def _synth(stimme: str, s: Satz, sem: asyncio.Semaphore) -> Path:
    ziel = _schluessel(stimme, s)
    if ziel.exists() and ziel.stat().st_size > 0:
        return ziel
    import edge_tts
    async with sem:
        for versuch in range(4):
            try:
                c = edge_tts.Communicate(
                    s.text, stimme,
                    rate=f"{s.tempo:+d}%", pitch=f"{s.hoehe:+d}Hz", volume=f"{max(-90, s.lautstaerke):+d}%",
                    proxy=os.environ.get("HTTPS_PROXY") or None,
                )
                tmp = ziel.with_suffix(".tmp")
                await c.save(str(tmp))
                tmp.rename(ziel)
                return ziel
            except Exception:
                if versuch == 3:
                    raise
                await asyncio.sleep(2 ** versuch)
    return ziel


def _trimmen(x: np.ndarray, schwelle=0.006) -> np.ndarray:
    idx = np.where(np.abs(x) > schwelle)[0]
    if len(idx) == 0:
        return x[:0]
    a = max(0, idx[0] - A.sek(0.02))
    e = min(len(x), idx[-1] + A.sek(0.08))
    return x[a:e]


def stimm_kette(x: np.ndarray) -> np.ndarray:
    """Rundfunk-Kette: Trittschall weg, Präsenz, etwas Wärme, Kompression."""
    x = A.hp(x, 75)
    x = A.peak_eq(x, 180, 1.5, 0.8)
    x = A.peak_eq(x, 3200, 2.5, 1.0)
    x = A.peak_eq(x, 7500, -1.5, 1.5)
    x = A.kompressor(x, -22, 3.0, 0.004, 0.10, makeup_db=4)
    return x


def sprechen_viele(auftraege: list[tuple[Sprecher, str, str]]) -> list[Gesprochen]:
    """Alle Zeilen einer Folge parallel synthetisieren. auftraege: (sprecher, text, emotion)."""
    _ssl_vorbereiten()
    CACHE.mkdir(parents=True, exist_ok=True)
    geplant = [(sp, prosodie(sp, text, emo)) for sp, text, emo in auftraege]

    async def alle():
        sem = asyncio.Semaphore(6)
        jobs = [_synth(sp.stimme, s, sem) for sp, ss in geplant for s in ss]
        return await asyncio.gather(*jobs)

    dateien = iter(asyncio.run(alle()))
    ergebnisse = []
    for sp, ss in geplant:
        stuecke, cues, t = [], [], 0.0
        for j, s in enumerate(ss):
            x = _trimmen(A.laden(str(next(dateien))))
            stuecke.append(x)
            cues.append((t, t + len(x) / A.SR, s.text))
            t += len(x) / A.SR
            if j < len(ss) - 1:
                stuecke.append(np.zeros(A.sek(s.pause), np.float32))
                t += s.pause
        if sum(len(x) for x in stuecke) < A.sek(0.05):
            ergebnisse.append(Gesprochen(np.zeros(A.sek(0.5), np.float32), []))
            continue
        ergebnisse.append(Gesprochen(stimm_kette(np.concatenate(stuecke)), cues))
    return ergebnisse
