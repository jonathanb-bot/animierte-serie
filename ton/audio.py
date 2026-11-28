"""Grundbausteine: Laden, Filter, Hall, Kompressor, Panning, Schreiben.

Alles arbeitet mit float32-Arrays bei SR Hz. Mono = shape (n,), Stereo = shape (n, 2).
"""
from __future__ import annotations

import subprocess
import zlib
from functools import lru_cache

import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(24)


def sek(s: float) -> int:
    return int(round(s * SR))


def laden(pfad: str) -> np.ndarray:
    """Beliebige Audiodatei per ffmpeg als Mono-float laden."""
    roh = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", pfad, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(roh, dtype=np.float32).copy()


def schreiben_wav(pfad: str, x: np.ndarray) -> None:
    import soundfile as sf
    sf.write(pfad, x, SR, subtype="PCM_24")


def stereo(x: np.ndarray, pan: float = 0.0) -> np.ndarray:
    """Mono -> Stereo mit Panorama (-1 links, +1 rechts, Constant-Power)."""
    if x.ndim == 2:
        return x
    w = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(w), x * np.sin(w)], axis=1) * np.sqrt(2)


def breite(x: np.ndarray, verz_ms: float = 11.0) -> np.ndarray:
    """Pseudo-Stereo: rechter Kanal leicht verzögert und dekorreliert."""
    m = x if x.ndim == 1 else x.mean(axis=1)
    d = sek(verz_ms / 1000)
    r = np.concatenate([np.zeros(d, np.float32), m[:-d] if d else m])
    return np.stack([m, 0.6 * m + 0.4 * r], axis=1)


def hp(x, f, ordnung=2):
    sos = signal.butter(ordnung, f, "highpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def lp(x, f, ordnung=2):
    sos = signal.butter(ordnung, min(f, SR / 2 - 100), "lowpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def bp(x, f1, f2, ordnung=2):
    sos = signal.butter(ordnung, [f1, min(f2, SR / 2 - 100)], "bandpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def peak_eq(x, f, gain_db, q=1.0):
    """Glocken-EQ (RBJ-Cookbook)."""
    a = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f / SR
    alpha = np.sin(w0) / (2 * q)
    b = [1 + alpha * a, -2 * np.cos(w0), 1 - alpha * a]
    an = [1 + alpha / a, -2 * np.cos(w0), 1 - alpha / a]
    return signal.lfilter(b, an, x, axis=0).astype(np.float32)


def huelle(n, a=0.005, d=0.0, s=1.0, r=0.05):
    """ADSR-Hüllkurve über n Samples (Zeiten in Sekunden)."""
    a, d, r = sek(a), sek(d), sek(r)
    h = np.full(n, s, np.float32)
    a = min(a, n)
    h[:a] = np.linspace(0, 1, a, endpoint=False) if a else h[:a]
    if d and a + d < n:
        h[a:a + d] = np.linspace(1, s, d)
    if r:
        r = min(r, n)
        h[n - r:] *= np.linspace(1, 0, r)
    return h


def fade(x, ein=0.01, aus=0.01):
    x = x.copy()
    e, a = min(sek(ein), len(x)), min(sek(aus), len(x))
    if e:
        x[:e] *= np.linspace(0, 1, e)[:, None] if x.ndim == 2 else np.linspace(0, 1, e)
    if a:
        x[-a:] *= np.linspace(1, 0, a)[:, None] if x.ndim == 2 else np.linspace(1, 0, a)
    return x


def db(g):
    return 10 ** (g / 20)


def rauschen(n, farbe="weiss"):
    w = RNG.standard_normal(n).astype(np.float32)
    if farbe == "weiss":
        return w
    if farbe == "rosa":
        # Paul-Kellet-Approximation
        b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
        a = [1, -2.494956002, 2.017265875, -0.522189400]
        return (signal.lfilter(b, a, w) * 8).astype(np.float32)
    if farbe == "braun":
        y = np.cumsum(w) * 0.02
        return hp(y - np.mean(y), 20).astype(np.float32)
    raise ValueError(farbe)


@lru_cache(maxsize=32)
def _impuls(dauer: float, daempfung: float, hell: float, vordelay_ms: float, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = sek(dauer)
    t = np.arange(n) / SR
    links = rng.standard_normal(n) * np.exp(-6.9 * t / daempfung)
    rechts = rng.standard_normal(n) * np.exp(-6.9 * t / daempfung)
    ir = np.stack([links, rechts], axis=1).astype(np.float32)
    # Höhen klingen schneller ab: zeitvariabler Tiefpass grob über zwei Bänder
    dunkel = lp(ir, 1500 + 6000 * hell)
    mix = np.exp(-t / (daempfung * 0.25))[:, None]
    ir = ir * mix + dunkel * (1 - mix)
    vd = sek(vordelay_ms / 1000)
    ir = np.concatenate([np.zeros((vd, 2), np.float32), ir])
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


RAEUME = {
    # name: (dauer, rt60, helligkeit, vordelay_ms, nass)
    "trocken": None,
    "wohnung": (0.6, 0.35, 0.5, 6, 0.10),
    "bad": (1.0, 0.7, 0.9, 4, 0.22),
    "treppenhaus": (3.2, 2.6, 0.7, 18, 0.38),
    "flur": (1.2, 0.9, 0.6, 10, 0.18),
    "draussen": (1.5, 1.0, 0.4, 40, 0.07),
    "dach": (1.2, 0.8, 0.5, 30, 0.05),
    "keller": (1.6, 1.3, 0.3, 8, 0.25),
    "halle": (4.0, 3.5, 0.5, 30, 0.35),
}


def hall(x: np.ndarray, raum: str = "wohnung", nass: float | None = None) -> np.ndarray:
    """Faltungshall mit synthetischer Raumantwort. Gibt Stereo zurück (länger als Eingang)."""
    cfg = RAEUME.get(raum)
    xs = stereo(x) if x.ndim == 1 else x
    if cfg is None:
        return xs
    dauer, rt, hell, vd, n_default = cfg
    ir = _impuls(dauer, rt, hell, vd, zlib.crc32(raum.encode()) % 1000)
    nass = n_default if nass is None else nass
    mono = xs.mean(axis=1)
    l = signal.fftconvolve(mono, ir[:, 0])
    r = signal.fftconvolve(mono, ir[:, 1])
    wet = np.stack([l, r], axis=1).astype(np.float32)
    trocken = np.zeros_like(wet)
    trocken[: len(xs)] = xs
    return trocken * (1 - nass * 0.5) + wet * nass


def kompressor(x, schwelle_db=-18, ratio=3.0, attack=0.005, release=0.12, makeup_db=0.0):
    """Einfacher Feed-forward-Kompressor (RMS-Detektor)."""
    m = x if x.ndim == 1 else x.mean(axis=1)
    pegel = _folger(np.abs(m), attack, release)
    pdb = 20 * np.log10(pegel + 1e-9)
    ueber = np.maximum(pdb - schwelle_db, 0)
    gain = db(-ueber * (1 - 1 / ratio) + makeup_db).astype(np.float32)
    return x * (gain[:, None] if x.ndim == 2 else gain)


def _folger(e, attack, release, step=64):
    """Hüllkurvenfolger, blockweise für Geschwindigkeit."""
    n = len(e)
    nb = (n + step - 1) // step
    blk = np.pad(e, (0, nb * step - n)).reshape(nb, step).max(axis=1)
    aa = np.exp(-step / (attack * SR))
    ar = np.exp(-step / (release * SR))
    out = np.empty(nb, np.float32)
    v = 0.0
    for i, s in enumerate(blk):
        k = aa if s > v else ar
        v = k * v + (1 - k) * s
        out[i] = v
    return np.repeat(out, step)[:n]


def ducking(musik: np.ndarray, stimme: np.ndarray, tiefe_db=-11.0, attack=0.08, release=0.6,
            schwelle=0.015) -> np.ndarray:
    """Musik leiser machen, wenn jemand spricht (Sidechain)."""
    m = stimme if stimme.ndim == 1 else np.abs(stimme).max(axis=1)
    aktiv = (_folger(np.abs(m), 0.01, 0.25) > schwelle).astype(np.float32)
    weich = _folger(aktiv, attack, release)
    gain = (1 - weich) + weich * db(tiefe_db)
    gain = gain[: len(musik)]
    if len(gain) < len(musik):
        gain = np.pad(gain, (0, len(musik) - len(gain)), constant_values=1.0)
    return musik * (gain[:, None] if musik.ndim == 2 else gain)


def limiter(x, ceiling_db=-1.0, release=0.08, lookahead_ms=3.0):
    ceil = db(ceiling_db)
    peak = np.abs(x).max(axis=1) if x.ndim == 2 else np.abs(x)
    la = sek(lookahead_ms / 1000)
    peak = _laufmax(peak, la)  # Lookahead: Spitzen etwas früher erkennen
    soll = np.minimum(1.0, ceil / (peak + 1e-9))
    g = 1 - _folger(1 - soll, 0.0005, release)
    g = np.minimum(g, soll)  # harte Sicherheit
    return x * (g[:, None] if x.ndim == 2 else g)


def _laufmax(x, fenster):
    if fenster <= 1:
        return x
    from scipy.ndimage import maximum_filter1d
    return maximum_filter1d(x, size=fenster * 2 + 1, origin=0)


def einmischen(ziel: np.ndarray, quelle: np.ndarray, start: int, gain: float = 1.0) -> np.ndarray:
    """quelle ab Sample start in ziel addieren; ziel wird bei Bedarf verlängert."""
    if start < 0:
        quelle = quelle[-start:]
        start = 0
    q = stereo(quelle) if ziel.ndim == 2 and quelle.ndim == 1 else quelle
    ende = start + len(q)
    if ende > len(ziel):
        pad = [(0, ende - len(ziel))] + ([(0, 0)] if ziel.ndim == 2 else [])
        ziel = np.pad(ziel, pad)
    ziel[start:ende] += q * gain
    return ziel


def loop_auf(x: np.ndarray, n: int, xfade: float = 1.5) -> np.ndarray:
    """Material durch Überblenden auf Länge n loopen."""
    if len(x) >= n:
        return x[:n]
    xf = min(sek(xfade), len(x) // 3)
    out = x[: len(x)].copy()
    while len(out) < n:
        rampe = np.linspace(0, 1, xf)
        if x.ndim == 2:
            rampe = rampe[:, None]
        ueber = out[-xf:] * (1 - rampe) + x[:xf] * rampe
        out = np.concatenate([out[:-xf], ueber, x[xf:]])
    return out[:n]
