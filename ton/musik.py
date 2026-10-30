"""Prozedural komponierte Hintergrundmusik – lizenzfrei, passend zur Stimmung.

musik("spannung", dauer=40) -> Stereo-Array. Instrumente setzen nach und nach ein,
damit sich auch lange Kapitel nicht wie eine Endlosschleife anhören.
Das Serienmotiv („24. Stock“) taucht in Titel, Cliffhanger und Outro auf.
"""
from __future__ import annotations

import zlib

import numpy as np
from scipy import signal

from . import audio as A

SR = A.SR

# Serienmotiv in d-Moll (MIDI): D5 A4 F5 E5 – D5
MOTIV = [(74, 0.0, 1.0), (69, 1.0, 0.5), (77, 1.5, 1.0), (76, 2.5, 0.5), (74, 3.0, 2.0)]


def hz(midi):
    return 440.0 * 2 ** ((np.asarray(midi) - 69) / 12)


AKKORDE = {
    "": [0, 4, 7], "m": [0, 3, 7], "sus2": [0, 2, 7], "7": [0, 4, 7, 10], "m7": [0, 3, 7, 10],
    "maj7": [0, 4, 7, 11], "add9": [0, 4, 7, 14],
}
NOTEN = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
         "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11, "H": 11}


def akkord(name: str):
    """'Am' -> (Grundton-MIDI in Oktave 3, Intervalle)."""
    wurzel = name[:2] if len(name) > 1 and name[1] in "#b" else name[:1]
    art = name[len(wurzel):]
    return 48 + NOTEN[wurzel], AKKORDE[art]


# ---------- Instrumente ----------

def _phase(f, n):
    return 2 * np.pi * np.cumsum(np.broadcast_to(f, (n,))) / SR


def saege(f, n):
    return (2 * ((_phase(f, n) / (2 * np.pi)) % 1) - 1).astype(np.float32)


def pad(noten, dauer, hell=0.5, rng=None):
    n = A.sek(dauer)
    l = np.zeros(n, np.float32)
    r = np.zeros(n, np.float32)
    for m in noten:
        f = hz(m)
        for d, kanal in ((-0.0025, l), (0.0, None), (0.0025, r)):
            s = saege(f * (1 + d), n)
            if kanal is None:
                l += s * 0.5
                r += s * 0.5
            else:
                kanal += s
    t = np.arange(n) / SR
    cut = 500 + 1800 * hell * (0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * t))
    # zwei feste Tiefpässe überblenden statt zeitvariablem Filter
    lo_l, lo_r = A.lp(l, 500 + 600 * hell, 2), A.lp(r, 500 + 600 * hell, 2)
    hi_l, hi_r = A.lp(l, 1000 + 2400 * hell, 2), A.lp(r, 1000 + 2400 * hell, 2)
    w = ((cut - cut.min()) / (np.ptp(cut) + 1e-9)).astype(np.float32)
    x = np.stack([lo_l * (1 - w) + hi_l * w, lo_r * (1 - w) + hi_r * w], axis=1)
    return x * A.huelle(n, min(1.2, dauer * 0.3), r=min(1.4, dauer * 0.4))[:, None] / (len(noten) * 2.5)


def streicher(noten, dauer, rng):
    n = A.sek(dauer)
    t = np.arange(n) / SR
    x = np.zeros((n, 2), np.float32)
    for i, m in enumerate(noten):
        f = hz(m)
        for k, d in enumerate((-0.004, -0.0015, 0.0015, 0.004)):
            vib = 1 + 0.004 * np.sin(2 * np.pi * (5.2 + 0.3 * k) * t + rng.random() * 6)
            s = saege(f * (1 + d) * vib, n)
            x[:, k % 2] += s
    x = A.lp(A.hp(x, 180), 2600)
    return x * A.huelle(n, min(1.8, dauer * 0.35), r=min(1.6, dauer * 0.4))[:, None] / (len(noten) * 4)


def klavier(m, dauer=2.5, staerke=0.8, rng=None):
    n = A.sek(dauer)
    t = np.arange(n) / SR
    f = hz(m)
    x = np.zeros(n, np.float32)
    B = 0.0004
    for k in range(1, 11):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > SR / 2 - 1000:
            break
        tau = 1.6 * (60 / max(m, 30)) / (1 + 0.35 * k)
        amp = staerke ** (0.5 + 0.2 * k) / k ** 1.1
        x += np.sin(2 * np.pi * fk * t) * amp * np.exp(-t / tau)
        x += np.sin(2 * np.pi * fk * 1.0008 * t) * amp * 0.5 * np.exp(-t / tau)
    a = A.sek(0.003)
    x[:a] *= np.linspace(0, 1, a)
    if rng is not None:
        x[: A.sek(0.01)] += A.hp(rng.standard_normal(A.sek(0.01)), 2000) * 0.02 * staerke
    return x * A.huelle(n, 0.002, r=0.3) * 0.25


def zupf(m, dauer=1.2, hell=0.996, rng=None):
    """Karplus-Strong-Zupfinstrument."""
    n = A.sek(dauer)
    N = int(SR / hz(m))
    rng = rng or np.random.default_rng(0)
    anreg = np.zeros(n, np.float32)
    anreg[:N] = A.lp(rng.standard_normal(N), 6000)
    a = np.zeros(N + 2)
    a[0], a[N], a[N + 1] = 1, -0.5 * hell, -0.5 * hell
    y = signal.lfilter([1.0], a, anreg).astype(np.float32)
    return y * A.huelle(n, 0.001, r=0.1) * 0.35


def glocke(m, dauer=2.5):
    n = A.sek(dauer)
    t = np.arange(n) / SR
    f = hz(m)
    x = sum(np.sin(2 * np.pi * f * p * t) * np.exp(-t / (1.2 / (i + 1))) / (i + 1)
            for i, p in enumerate([1, 2.0, 3.0, 4.07, 5.4]))
    return (x * 0.2).astype(np.float32)


def bass(m, dauer, art="weich"):
    n = A.sek(dauer)
    f = hz(m)
    s = np.sin(_phase(f, n)).astype(np.float32)
    if art == "hart":
        s = s * 0.6 + A.lp(saege(f, n), 600) * 0.6
        hk = A.huelle(n, 0.003, d=0.15, s=0.5, r=0.05)
    else:
        s = s + 0.25 * np.sin(2 * _phase(f, n))
        hk = A.huelle(n, 0.01, r=0.08)
    return s * hk * 0.5


def kick(staerke=1.0):
    d = 0.5
    t = np.arange(A.sek(d)) / SR
    f = 48 + 120 * np.exp(-t / 0.025)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    return (x * 0.9 * staerke).astype(np.float32)


def snare(rng, staerke=1.0):
    d = 0.3
    t = np.arange(A.sek(d)) / SR
    ton = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05)
    r = A.hp(rng.standard_normal(len(t)), 1500) * np.exp(-t / 0.09)
    return ((ton * 0.4 + r * 0.45) * staerke).astype(np.float32)


def hihat(rng, offen=False, staerke=1.0):
    d = 0.3 if offen else 0.06
    t = np.arange(A.sek(d)) / SR
    return (A.hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / (0.09 if offen else 0.018)) * 0.25 * staerke).astype(np.float32)


def tick(rng):
    d = 0.03
    t = np.arange(A.sek(d)) / SR
    x = A.bp(rng.standard_normal(len(t)), 2500, 7000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 2900 * t) * np.exp(-t / 0.006) * 0.3
    return (x * 0.35).astype(np.float32)


def trommel(staerke=1.0):
    """Tiefe Taiko-artige Trommel für Titel/Action."""
    d = 1.2
    t = np.arange(A.sek(d)) / SR
    f = 62 + 50 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
    return (np.tanh(x * 1.8) * 0.8 * staerke).astype(np.float32)


def drone(grundton, dauer, rng):
    n = A.sek(dauer)
    t = np.arange(n) / SR
    f = hz(grundton)
    x = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.5 * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
         + 0.3 * np.sin(2 * np.pi * f * 2.003 * t))
    luft = A.bp(rng.standard_normal(n), f * 2, f * 8) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t)) * 0.2
    x = (x * 0.25 + luft) * A.huelle(n, min(3, dauer * 0.3), r=min(3, dauer * 0.3))
    return A.breite(x.astype(np.float32), 17)


# ---------- Sequenzer ----------

class Spur:
    def __init__(self, dauer):
        self.x = np.zeros((A.sek(dauer + 6), 2), np.float32)
        self.n = A.sek(dauer)

    def setze(self, klang, t, gain=1.0, pan=0.0):
        if t * SR >= self.n:
            return
        k = A.stereo(klang, pan) if klang.ndim == 1 else klang
        s = A.sek(t)
        e = min(len(self.x), s + len(k))
        self.x[s:e] += k[: e - s] * gain


# Stimmung: tempo, Akkordfolge (1 Akkord = 1 Takt à 4 Schläge), Helligkeit
STIMMUNGEN = {
    "tag":        dict(bpm=92, folge=["C", "G", "Am", "F"], hell=0.7),
    "erklaeren":  dict(bpm=100, folge=["D", "A", "Bm", "G"], hell=0.75),
    "abend":      dict(bpm=72, folge=["Am", "F", "C", "G"], hell=0.45),
    "nacht":      dict(bpm=60, folge=["Dm", "Bb", "Gm", "A"], hell=0.25),
    "spannung":   dict(bpm=100, folge=["Dm", "Dm", "Bb", "A"], hell=0.4),
    "action":     dict(bpm=128, folge=["Em", "C", "D", "B"], hell=0.55),
    "rueckblick": dict(bpm=84, folge=["Am", "Em", "F", "G"], hell=0.45),
    "traurig":    dict(bpm=64, folge=["Am", "F", "Dm", "E"], hell=0.35),
    "hoffnung":   dict(bpm=88, folge=["F", "C", "Dm", "Bb"], hell=0.65),
    "outro":      dict(bpm=90, folge=["F", "Am", "Bb", "C"], hell=0.6),
    "titel":      dict(bpm=80, folge=["Dm", "Bb", "F", "A"], hell=0.5),
    "cliffhanger": dict(bpm=70, folge=["Dm", "Bb"], hell=0.3),
    # Kurzgeschichten-Stil (Vorlage): dunkler Dauer-Drone auf A, kaum Höhen
    "dunkel":      dict(bpm=60, folge=["Am", "F", "Dm", "Am"], hell=0.2),
    "dunkel_puls": dict(bpm=66, folge=["Am", "F", "Dm", "E"], hell=0.2),
}


def musik(stimmung: str, dauer: float, seed: int = 0, intensitaet: float = 1.0,
          hoehepunkt: float | None = None) -> np.ndarray:
    """hoehepunkt: Sekunde, auf die Titel/Cliffhanger ihren Schlag legen."""
    if stimmung not in STIMMUNGEN:
        raise KeyError(f"Unbekannte Stimmung '{stimmung}'. Verfügbar: {', '.join(STIMMUNGEN)}")
    rng = np.random.default_rng(seed + zlib.crc32(stimmung.encode()) % 997)
    cfg = STIMMUNGEN[stimmung]
    beat = 60 / cfg["bpm"]
    takt = 4 * beat
    trocken = Spur(dauer)
    nass = Spur(dauer)  # bekommt Hall
    takte = int(np.ceil(dauer / takt)) + 1
    folge = cfg["folge"]
    hell = cfg["hell"]

    def akk(i):
        return akkord(folge[i % len(folge)])

    arranger = {
        "tag": _tag, "erklaeren": _erklaeren, "abend": _abend, "nacht": _nacht, "spannung": _spannung,
        "action": _action, "rueckblick": _rueckblick, "traurig": _traurig, "hoffnung": _hoffnung,
        "outro": _outro, "titel": _titel, "cliffhanger": _cliffhanger,
        "dunkel": _dunkel, "dunkel_puls": _dunkel_puls,
    }[stimmung]
    arranger(trocken, nass, takte, takt, beat, akk, hell, rng, intensitaet, dauer, hoehepunkt)

    x = trocken.x + A.hall(nass.x, "halle", 0.55)[: len(trocken.x)]
    x = A.kompressor(x, -16, 2.0, 0.02, 0.3)
    n = A.sek(dauer)
    x = x[:n]
    spitze = np.abs(x).max() + 1e-9
    return A.fade(x / spitze * 0.8, 0.05, min(2.0, dauer * 0.15))


# ---------- Arrangements ----------

def _pad_spur(sp, takte, takt, akk, hell, rng, oktave=0, gain=1.0, ab=0):
    for i in range(ab, takte):
        g, iv = akk(i)
        noten = [g + 12 + oktave + v for v in iv] + [g + oktave]
        sp.setze(pad(noten, takt + 1.0, hell, rng), i * takt, gain)


def _bass_spur(sp, takte, takt, beat, akk, muster, gain=1.0, art="weich", ab=0):
    """muster: Liste (schlag_offset, dauer_in_schlägen)."""
    for i in range(ab, takte):
        g, _ = akk(i)
        for off, d in muster:
            sp.setze(bass(g - 12, d * beat * 0.95, art), i * takt + off * beat, gain)


def _arp(sp, takte, takt, beat, akk, rng, muster, instrument="zupf", gain=1.0, ab=0, oktave=12, pan=0.25):
    for i in range(ab, takte):
        g, iv = akk(i)
        toene = [g + oktave + v for v in iv] + [g + oktave + 12]
        for j, (off, idx) in enumerate(muster):
            m = toene[idx % len(toene)]
            k = zupf(m, 1.4, 0.995, rng) if instrument == "zupf" else klavier(m, 2.0, 0.6, rng)
            sp.setze(k, i * takt + off * beat, gain * rng.uniform(0.8, 1.0), pan * (1 if j % 2 else -1))


def _beat(sp, takte, takt, beat, rng, ab=0, kicks=(0, 2), snares=(1, 3), hats=8, gain=1.0, hat_gain=1.0):
    for i in range(ab, takte):
        for k in kicks:
            sp.setze(kick(), i * takt + k * beat, gain)
        for s in snares:
            sp.setze(snare(rng), i * takt + s * beat, gain * 0.8)
        for h in range(hats):
            sp.setze(hihat(rng, staerke=0.7 + 0.3 * (h % 2 == 0)), i * takt + h * 4 / hats * beat, gain * hat_gain, 0.3)


def _motiv(sp, start, beat, instrument="glocke", transponieren=0, gain=1.0):
    for m, off, d in MOTIV:
        klang = glocke(m + transponieren, 3.0) if instrument == "glocke" else klavier(m + transponieren, 3.0, 0.7)
        sp.setze(klang, start + off * beat, gain)


def _tag(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _pad_spur(na, takte, takt, akk, hell, rng, gain=0.6)
    _arp(na, takte, takt, beat, akk, rng, [(k * 0.5, [0, 1, 2, 3, 2, 1, 0, 2][k]) for k in range(8)], gain=0.5, ab=1)
    _bass_spur(tr, takte, takt, beat, akk, [(0, 1.5), (1.5, 0.5), (2, 2)], 0.5, ab=2)
    if I > 0.6:
        _beat(tr, takte, takt, beat, rng, ab=4, kicks=(0, 2.5), snares=(), hats=4, gain=0.35)


def _erklaeren(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _pad_spur(na, takte, takt, akk, hell, rng, gain=0.45)
    _arp(na, takte, takt, beat, akk, rng, [(k * 0.5, [0, 2, 1, 3][k % 4]) for k in range(8)], gain=0.45)
    _bass_spur(tr, takte, takt, beat, akk, [(0, 1), (1, 1), (2, 1), (3, 1)], 0.45, ab=1)
    _beat(tr, takte, takt, beat, rng, ab=2, kicks=(0, 2), snares=(1, 3), hats=8, gain=0.3, hat_gain=0.7)


def _abend(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _pad_spur(na, takte, takt, akk, hell, rng, gain=0.6)
    for i in range(1, takte):
        g, iv = akk(i)
        for off, idx in [(0, 0), (1.5, 1), (2, 2), (3, 1)]:
            na.setze(klavier(g + 12 + iv[idx % len(iv)] + (12 if idx == 2 else 0), 3.0, 0.5, rng), i * takt + off * beat, 0.6)
    _bass_spur(tr, takte, takt, beat, akk, [(0, 4)], 0.4, ab=2)


def _nacht(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    g0, _ = akk(0)
    tr.setze(drone(g0 - 12, dauer + 2, rng), 0, 0.8)
    _pad_spur(na, takte, takt, akk, hell, rng, gain=0.35, ab=1)
    for i in range(1, takte):
        if rng.random() < 0.7:
            g, iv = akk(i)
            na.setze(klavier(g + 24 + iv[rng.integers(len(iv))], 4.0, 0.35, rng), i * takt + rng.choice([0, 1, 2]) * beat, 0.5, rng.uniform(-0.5, 0.5))


def _spannung(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    g0, _ = akk(0)
    tr.setze(drone(g0 - 12, dauer + 2, rng), 0, 0.5)
    for i in range(takte):
        g, _ = akk(i)
        for s in range(16):
            if i >= 1 or s % 2 == 0:
                tr.setze(bass(g - 12 + (12 if s % 4 == 3 else 0), beat / 4 * 0.8, "hart"), i * takt + s * beat / 4, 0.35)
        for s in range(4):
            tr.setze(tick(rng), i * takt + s * beat, 0.5, 0.5)
    for i in range(2, takte, 2):
        g, iv = akk(i)
        na.setze(streicher([g + 12 + v for v in iv], takt * 2 + 0.5, rng), i * takt, 0.5 * min(1, 0.5 + i / takte))
    if I > 0.7:
        _beat(tr, takte, takt, beat, rng, ab=4, kicks=(0,), snares=(), hats=0, gain=0.5)


def _action(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    for i in range(takte):
        g, _ = akk(i)
        for s in range(8):
            tr.setze(bass(g - 12, beat / 2 * 0.85, "hart"), i * takt + s * beat / 2, 0.45)
        for b in (0, 2.5):
            tr.setze(trommel(0.8), i * takt + b * beat, 0.6)
    _beat(tr, takte, takt, beat, rng, ab=1, kicks=(0, 1, 2, 3), snares=(1, 3), hats=8, gain=0.45)
    for i in range(0, takte, 2):
        g, iv = akk(i)
        na.setze(streicher([g + 12 + v for v in iv] + [g + 24], takt * 2 + 0.3, rng), i * takt, 0.6)


def _rueckblick(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _pad_spur(na, takte, takt, akk, hell * 0.8, rng, gain=0.55)
    for i in range(takte):
        for s in range(4):
            tr.setze(kick(0.5), i * takt + s * beat, 0.3)
            tr.setze(tick(rng), i * takt + (s + 0.5) * beat, 0.25, -0.4)
    _arp(na, takte, takt, beat, akk, rng, [(0, 0), (1, 2), (2, 1), (3, 3)], "klavier", 0.45, ab=1)


def _traurig(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    for i in range(takte):
        g, iv = akk(i)
        na.setze(streicher([g + v for v in iv] + [g + 12 + iv[1]], takt + 0.8, rng), i * takt, 0.7)
    for i in range(1, takte):
        g, iv = akk(i)
        na.setze(klavier(g + 24 + iv[i % len(iv)], 3.5, 0.45, rng), i * takt + 2 * beat, 0.5)


def _hoffnung(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _pad_spur(na, takte, takt, akk, hell, rng, gain=0.55)
    _arp(na, takte, takt, beat, akk, rng, [(k * 0.5, [0, 1, 2, 3, 4, 3, 2, 1][k]) for k in range(8)], "klavier", 0.4, ab=1)
    _bass_spur(tr, takte, takt, beat, akk, [(0, 2), (2, 2)], 0.4, ab=2)
    for i in range(3, takte, 2):
        g, iv = akk(i)
        na.setze(streicher([g + 12 + v for v in iv], takt * 2, rng), i * takt, 0.4)


def _outro(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _pad_spur(na, takte, takt, akk, hell, rng, gain=0.5)
    _arp(na, takte, takt, beat, akk, rng, [(k * 0.5, [0, 2, 1, 3][k % 4]) for k in range(8)], gain=0.4, ab=1)
    _bass_spur(tr, takte, takt, beat, akk, [(0, 1.5), (1.5, 1), (2.5, 1.5)], 0.45, ab=1)
    _beat(tr, takte, takt, beat, rng, ab=2, kicks=(0, 2.5), snares=(1, 3), hats=8, gain=0.3, hat_gain=0.6)
    _motiv(na, takt * 2, beat, "glocke", transponieren=-2, gain=0.5)  # Motiv in F-Dur-Färbung


def _titel(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    """Vorspann: Trommeln, Motiv auf Glocke + Klavier, Riser, Schlag."""
    g0, _ = akk(0)
    tr.setze(drone(g0 - 12, dauer + 1, rng), 0, 0.5)
    _pad_spur(na, takte, takt, akk, hell, rng, gain=0.45)
    for i in range(takte):
        for b in (0, 1.5, 2):
            tr.setze(trommel(0.6 + 0.2 * (b == 0)), i * takt + b * beat, 0.6)
    from .geraeusche import erzeugen
    hit_t = min(dauer, hp if hp is not None else 3.0)
    if hit_t > 0.5:
        tr.setze(erzeugen("riser", dauer=hit_t), 0.0, 0.5)
    tr.setze(erzeugen("hit"), hit_t, 0.9)
    _motiv(na, hit_t + 0.4, beat, "glocke", gain=0.8)
    _motiv(na, hit_t + 0.4 + takt * 1.5, beat, "klavier", gain=0.6)


def _cliffhanger(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    """Spannung zieht an (Ticken wird schneller), Schlag, nur noch Nachhall und Drone."""
    from .geraeusche import erzeugen
    g0, _ = akk(0)
    tr.setze(drone(g0 - 12, dauer + 1, rng), 0, 0.7)
    hit_t = min(dauer, hp if hp is not None else dauer * 0.6)
    t, abstand = 0.0, beat
    while t < hit_t - 0.05:
        tr.setze(tick(rng), t, 0.3 + 0.6 * t / max(hit_t, 0.1))
        t += abstand
        abstand = max(beat / 4, abstand * 0.93)
    r = min(4.0, hit_t)
    if r > 0.5:
        tr.setze(erzeugen("riser", dauer=r), hit_t - r, 0.6)
    tr.setze(erzeugen("hit"), hit_t, 1.0)
    _motiv(na, hit_t + 1.0, beat, "klavier", transponieren=-12, gain=0.6)


def _dunkel_bett(tr, na, takte, takt, akk, rng, dauer):
    """Grundton A als sägezahnreicher Drone, tief gefiltert, atmet langsam; Akkorde nur als Schatten."""
    n = A.sek(dauer + 2)
    t = np.arange(n) / SR
    atem = 0.75 + 0.25 * np.sin(2 * np.pi * 0.06 * t + rng.random() * 6)
    grund = np.zeros(n, np.float32)
    for m, g in ((33, 0.4), (45, 1.0), (52, 0.12)):  # A1, A2, E3
        for d in (-0.0015, 0.0015):
            grund += saege(hz(m) * (1 + d), n) * g
    weich = A.lp(grund, 420, 4)
    hell = A.lp(grund, 900, 2)
    w = (0.5 + 0.5 * np.sin(2 * np.pi * 0.035 * t)).astype(np.float32)
    x = (weich * (1 - w) + hell * w * 0.6) * atem
    luft = A.bp(rng.standard_normal(n).astype(np.float32), 600, 5000) * 0.045 * atem  # Raumluft, wie in der Vorlage
    tr.setze(A.breite((A.hp(x, 50) * 0.18 + luft) * A.huelle(n, 1.5, r=2.0), 14), 0, 1.0)
    for i in range(takte):
        g, iv = akk(i)
        akkord_ = [g + v for v in iv]
        p = pad(akkord_, takt + 1.5, 0.15, rng)
        na.setze(A.lp(p, 700), i * takt, 0.2)


def _dunkel(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _dunkel_bett(tr, na, takte, takt, akk, rng, dauer)
    for i in range(1, takte):
        if rng.random() < 0.35:
            g, iv = akk(i)
            na.setze(A.lp(klavier(g + 12 + iv[rng.integers(len(iv))], 4.0, 0.25, rng), 1200),
                     i * takt + rng.choice([0, 2]) * beat, 0.25, rng.uniform(-0.4, 0.4))


def _dunkel_puls(tr, na, takte, takt, beat, akk, hell, rng, I, dauer, hp=None):
    _dunkel_bett(tr, na, takte, takt, akk, rng, dauer)
    for i in range(takte):
        g, _ = akk(i)
        for b in (0, 1, 2, 3):
            tr.setze(A.lp(bass(g - 12, beat * 0.5, "weich"), 200), i * takt + b * beat, 0.45 if b % 2 == 0 else 0.3)
        for b in (0, 2):
            tr.setze(A.lp(kick(0.7), 120), i * takt + b * beat, 0.35)
