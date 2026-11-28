"""Synthetische Geräusche und Atmos – komplett selbst erzeugt, daher lizenzfrei.

Jedes Geräusch ist eine Funktion (rng, **parameter) -> np.ndarray (mono oder stereo).
Aufruf über erzeugen("name", seed=..., dauer=..., ...).
"""
from __future__ import annotations

import numpy as np

from . import audio as A

SR = A.SR
GERAEUSCHE: dict = {}
ATMOS: set = set()


def geraeusch(name, atmo=False):
    def deko(f):
        GERAEUSCHE[name] = f
        if atmo:
            ATMOS.add(name)
        return f
    return deko


def erzeugen(name: str, seed: int = 0, **kw) -> np.ndarray:
    if name not in GERAEUSCHE:
        raise KeyError(f"Unbekanntes Geräusch '{name}'. Verfügbar: {', '.join(sorted(GERAEUSCHE))}")
    rng = np.random.default_rng(seed)
    x = GERAEUSCHE[name](rng, **kw).astype(np.float32)
    spitze = np.abs(x).max() + 1e-9
    return x / spitze * 0.9


# ---------- kleine Bausteine ----------

def _t(dauer):
    return np.arange(A.sek(dauer)) / SR


def _rausch(rng, n, farbe="weiss"):
    w = rng.standard_normal(n).astype(np.float32)
    if farbe == "weiss":
        return w
    if farbe == "rosa":
        from scipy import signal
        b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
        a = [1, -2.494956002, 2.017265875, -0.522189400]
        return (signal.lfilter(b, a, w) * 8).astype(np.float32)
    y = np.cumsum(w) * 0.02
    return A.hp(y - y.mean(), 20)


def _abkling(dauer, tau, a=0.001):
    t = _t(dauer)
    h = np.exp(-t / tau)
    an = A.sek(a)
    if an:
        h[:an] *= np.linspace(0, 1, an)
    return h.astype(np.float32)


def _ton(f, dauer, form="sin", phase=0.0):
    t = _t(dauer)
    if callable(f):
        ph = 2 * np.pi * np.cumsum(f(t)) / SR
    else:
        ph = 2 * np.pi * f * t
    ph = ph + phase
    if form == "sin":
        return np.sin(ph)
    if form == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if form == "square":
        return np.sign(np.sin(ph))
    if form == "tri":
        return 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
    raise ValueError(form)


def _einfuegen(ziel, quelle, t):
    s = A.sek(t)
    if s >= len(ziel):
        return ziel
    e = min(len(ziel), s + len(quelle))
    ziel[s:e] += quelle[: e - s]
    return ziel


def _plopp(rng, f0=1000, dauer=0.06, steigung=1.8):
    """Wassertropfen / Blase: Sinus mit ansteigender Tonhöhe."""
    t = _t(dauer)
    f = f0 * (1 + (steigung - 1) * t / dauer)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dauer * 0.35))


def _entfernung(x, entfernung):
    """0 = nah, 1 = weit weg: leiser, dumpfer."""
    if entfernung <= 0:
        return x
    x = A.lp(x, 9000 * (1 - entfernung) + 700)
    return x * (1 - 0.6 * entfernung)


# ---------- Alltag / Wohnung ----------

@geraeusch("wecker")
def wecker(rng, dauer=4.0, f=2400):
    """Digitaler Wecker: beep-beep-beep-beep, Pause."""
    x = np.zeros(A.sek(dauer), np.float32)
    piep = _ton(f, 0.07, "square") * 0.5 + _ton(f * 2, 0.07) * 0.2
    piep = A.lp(piep * A.huelle(len(piep), 0.002, r=0.01), 6000)
    t = 0.0
    while t < dauer:
        for k in range(4):
            _einfuegen(x, piep, t + k * 0.13)
        t += 1.0
    return x


@geraeusch("wecker_klingel")
def wecker_klingel(rng, dauer=4.0):
    """Mechanischer Klingelwecker (Hammer auf Glocke)."""
    x = np.zeros(A.sek(dauer + 0.5), np.float32)
    teil = [1, 2.76, 5.40, 8.93]
    glocke = sum(_ton(1850 * p, 0.35) * np.exp(-_t(0.35) / (0.15 / (i + 1))) / (i + 1) for i, p in enumerate(teil))
    t = 0.0
    while t < dauer:
        _einfuegen(x, glocke * (0.8 + 0.2 * rng.random()), t)
        t += 1 / 22 + rng.normal(0, 0.002)
    return x * A.huelle(len(x), 0.01, r=0.4)


@geraeusch("handy_vibration")
def handy_vibration(rng, dauer=2.0):
    x = np.zeros(A.sek(dauer), np.float32)
    brumm = (_ton(170, 0.4, "square") * 0.6 + _rausch(rng, A.sek(0.4)) * 0.1)
    brumm = A.lp(brumm, 1200) * A.huelle(A.sek(0.4), 0.01, r=0.03)
    for t in np.arange(0, dauer, 0.9):
        _einfuegen(x, brumm, t)
    return x


@geraeusch("kein_netz")
def kein_netz(rng):
    """Telefon-Fehlerton: tü-tü-tüü (Sonderinformationston)."""
    x = np.zeros(A.sek(1.4), np.float32)
    for i, (f, t) in enumerate([(950, 0.0), (1400, 0.33), (1800, 0.66)]):
        x = _einfuegen(x, _ton(f, 0.28) * A.huelle(A.sek(0.28), 0.005, r=0.02), t)
    return A.bp(x, 300, 3400) * 0.7


@geraeusch("tuer_klopfen")
def tuer_klopfen(rng, anzahl=3, hart=0.5):
    x = np.zeros(A.sek(0.3 * anzahl + 0.5), np.float32)
    for i in range(anzahl):
        d = 0.12
        k = (_ton(140 + 30 * rng.random(), d) * 0.8 + _ton(330, d) * 0.4) * _abkling(d, 0.025)
        k += A.bp(_rausch(rng, len(k)), 800, 4000) * _abkling(d, 0.006) * (0.4 + hart)
        _einfuegen(x, k * (0.8 + 0.2 * rng.random()), i * (0.24 + rng.normal(0, 0.02)))
    return x


@geraeusch("haemmern")
def haemmern(rng, anzahl=4, pause=0.45):
    """Hammer auf Nagel/Holz (Barrikade bauen)."""
    x = np.zeros(A.sek(pause * anzahl + 0.6), np.float32)
    for i in range(anzahl):
        d = 0.25
        metall = sum(_ton(f, d) * _abkling(d, 0.03 + 0.02 * j) for j, f in enumerate([2100, 3350, 5200]))
        holz = (_ton(180, d) + _ton(95, d) * 0.6) * _abkling(d, 0.05)
        knack = A.hp(_rausch(rng, A.sek(d)), 1500) * _abkling(d, 0.004)
        _einfuegen(x, metall * 0.25 + holz + knack * 0.6, i * pause + rng.normal(0, 0.03))
    return x


@geraeusch("moebel_ruecken")
def moebel_ruecken(rng, dauer=2.2):
    """Schrank/Tisch über den Boden schieben (Stick-Slip)."""
    n = A.sek(dauer)
    ruck = np.clip(A.lp(_rausch(rng, n), 40) * 6, 0, None)
    stoss = (np.sin(2 * np.pi * np.cumsum(35 + 25 * rng.random(n)) / SR) > 0.3).astype(np.float32)
    kratz = A.bp(_rausch(rng, n), 180, 1600) * (ruck * 0.7 + 0.3) * (0.6 + 0.4 * stoss)
    poltern = A.lp(_rausch(rng, n), 120) * 3 * ruck
    return (kratz + poltern) * A.huelle(n, 0.15, r=0.3)


@geraeusch("tuer_zu")
def tuer_zu(rng, hart=0.7):
    d = 1.2
    wumm = _ton(lambda t: 70 - 25 * t, d) * _abkling(d, 0.12)
    klapp = A.bp(_rausch(rng, A.sek(d)), 400, 3000) * _abkling(d, 0.02)
    klinke = sum(_ton(f, d) * _abkling(d, 0.04) for f in [1900, 3100]) * 0.15
    x = wumm + klapp * hart + _einfuegen(np.zeros(A.sek(d), np.float32), klinke[: A.sek(0.3)], 0.05)
    return x


@geraeusch("schloss")
def schloss(rng):
    """Schlüssel dreht im Schloss / Riegel."""
    x = np.zeros(A.sek(0.9), np.float32)
    for t, f in [(0.0, 2600), (0.18, 3100), (0.42, 1800)]:
        k = sum(_ton(f * m, 0.08) * _abkling(0.08, 0.01) for m in (1, 1.6)) + A.hp(_rausch(rng, A.sek(0.08)), 2000) * _abkling(0.08, 0.004)
        _einfuegen(x, k, t)
    _einfuegen(x, A.lp(_rausch(rng, A.sek(0.3)), 300) * _abkling(0.3, 0.05) * 2, 0.45)
    return x


@geraeusch("schritte")
def schritte(rng, dauer=3.0, tempo=1.8, boden="beton", rennen=False):
    """Schritte; tempo = Schritte/s. rennen=True: schneller und härter."""
    if rennen:
        tempo = max(tempo, 3.2)
    x = np.zeros(A.sek(dauer + 0.4), np.float32)
    grund = {"beton": (95, 2500), "holz": (140, 1600), "metall": (220, 4200)}[boden]
    t, links = 0.0, True
    while t < dauer:
        d = 0.18
        hart = 1.4 if rennen else 1.0
        ferse = _ton(grund[0] * (0.9 + 0.2 * rng.random()), d) * _abkling(d, 0.03) * hart
        klick = A.bp(_rausch(rng, A.sek(d)), 300, grund[1]) * _abkling(d, 0.012)
        sohle = A.bp(_rausch(rng, A.sek(d)), 500, 5000) * _abkling(d, 0.03) * 0.25
        tritt = ferse + klick * 0.8
        _einfuegen(x, tritt * (0.85 + 0.15 * rng.random()) * (1.0 if links else 0.9), t)
        _einfuegen(x, sohle, t + 0.05)
        t += 1 / tempo + rng.normal(0, 0.02)
        links = not links
    return x


@geraeusch("taschenlampe")
def taschenlampe(rng):
    x = np.zeros(A.sek(0.25), np.float32)
    for t, f in [(0.0, 3200), (0.07, 2400)]:
        k = A.bp(_rausch(rng, A.sek(0.03)), f * 0.6, f * 1.6) * _abkling(0.03, 0.003)
        _einfuegen(x, k, t)
    return x


@geraeusch("streichholz")
def streichholz(rng):
    """Streichholz anreißen + Flamme zündet + leises Knistern."""
    x = np.zeros(A.sek(1.8), np.float32)
    n = A.sek(0.18)
    reib = A.bp(_rausch(rng, n), 1800, 9000) * A.huelle(n, 0.01, r=0.05) * (0.6 + 0.4 * rng.random(n))
    _einfuegen(x, reib, 0.0)
    n2 = A.sek(0.6)
    fauch = A.lp(_rausch(rng, n2, "rosa"), 1800) * A.huelle(n2, 0.03, d=0.2, s=0.35, r=0.3)
    _einfuegen(x, fauch * 1.3, 0.14)
    _einfuegen(x, kerze_knistern(rng, dauer=1.2) * 0.5, 0.5)
    return x


@geraeusch("kerze_knistern", atmo=True)
def kerze_knistern(rng, dauer=8.0):
    n = A.sek(dauer)
    x = A.lp(_rausch(rng, n, "rosa"), 600) * 0.08
    for t in rng.uniform(0, dauer, int(dauer * 4)):
        k = A.bp(_rausch(rng, A.sek(0.01)), 1500, 7000) * _abkling(0.01, 0.0015) * rng.uniform(0.2, 1.0)
        _einfuegen(x, k, t)
    return x


@geraeusch("feuer", atmo=True)
def feuer(rng, dauer=8.0):
    n = A.sek(dauer)
    roar = A.lp(_rausch(rng, n, "braun"), 500) * (0.7 + 0.3 * A.lp(_rausch(rng, n), 3) * 8)
    x = roar * 0.6
    for t in rng.uniform(0, dauer, int(dauer * 14)):
        k = A.bp(_rausch(rng, A.sek(0.015)), 1000, 8000) * _abkling(0.015, 0.002) * rng.uniform(0.2, 1.0)
        _einfuegen(x, k, t)
    return x


@geraeusch("wasserhahn")
def wasserhahn(rng, dauer=3.0, stark=1.0):
    n = A.sek(dauer)
    strahl = A.bp(_rausch(rng, n), 600, 7000) * (0.8 + 0.2 * A.lp(_rausch(rng, n), 12) * 6)
    x = strahl * 0.35 * stark
    for t in rng.uniform(0, dauer, int(dauer * 60 * stark)):
        _einfuegen(x, _plopp(rng, rng.uniform(500, 2500), rng.uniform(0.01, 0.03)) * rng.uniform(0.05, 0.25), t)
    return x * A.huelle(n, 0.08, r=0.15)


@geraeusch("wasser_stockt")
def wasser_stockt(rng):
    """Wasserhahn: läuft, spuckt, gurgelt, versiegt – das Wasser im 24. Stock fällt aus."""
    n = A.sek(4.0)
    t = _t(4.0)
    menge = np.clip(1.2 - t / 2.4, 0, 1) ** 1.5
    stotter = np.where(t > 1.2, (np.sin(2 * np.pi * 3.5 * t + 4 * np.sin(2 * np.pi * 0.7 * t)) > -0.2), 1.0)
    strahl = A.bp(_rausch(rng, n), 500, 6000) * menge * stotter * 0.4
    for tt in rng.uniform(0.8, 3.0, 40):
        strahl = _einfuegen(strahl, _plopp(rng, rng.uniform(150, 500), 0.08, 2.5) * 0.35, tt)
    luft = A.bp(_rausch(rng, n), 200, 1200) * np.exp(-((t - 2.6) / 0.5) ** 2) * 0.3
    tropf = np.zeros(n, np.float32)
    for tt in (3.1, 3.7):
        _einfuegen(tropf, _plopp(rng, 1100, 0.05) * 0.5, tt)
    return strahl + luft + tropf


@geraeusch("badewanne")
def badewanne(rng, dauer=6.0):
    """Badewanne läuft ein: voller, tiefer, wird mit Füllstand heller."""
    n = A.sek(dauer)
    t = _t(dauer)
    tief = A.bp(_rausch(rng, n, "rosa"), 150, 1500) * 0.6
    hoch = A.bp(_rausch(rng, n), 1500, 8000) * (0.2 + 0.25 * t / dauer)
    x = (tief + hoch) * (0.85 + 0.15 * A.lp(_rausch(rng, n), 8) * 6)
    for tt in rng.uniform(0, dauer, int(dauer * 40)):
        _einfuegen(x, _plopp(rng, rng.uniform(300, 1200) * (1 + tt / dauer), 0.04) * 0.15, tt)
    return x * A.huelle(n, 0.3, r=0.6)


@geraeusch("tropfen")
def tropfen(rng, dauer=4.0, abstand=0.9):
    x = np.zeros(A.sek(dauer), np.float32)
    t = 0.2
    while t < dauer - 0.1:
        _einfuegen(x, _plopp(rng, rng.uniform(900, 1400), 0.06, 1.9), t)
        t += abstand * rng.uniform(0.8, 1.25)
    return x


@geraeusch("eingiessen")
def eingiessen(rng, dauer=2.0):
    """Wasser in Glas/Kanister gießen – Tonhöhe steigt mit dem Füllstand."""
    n = A.sek(dauer)
    t = _t(dauer)
    f = 500 + 1600 * t / dauer
    res = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    x = A.bp(_rausch(rng, n), 400, 6000) * 0.4 + res * A.lp(np.abs(_rausch(rng, n)), 30)
    return x * A.huelle(n, 0.05, r=0.15)


@geraeusch("spuelung")
def spuelung(rng):
    n = A.sek(5.0)
    t = _t(5.0)
    x = A.bp(_rausch(rng, n, "rosa"), 200, 4000) * np.clip(np.minimum(t / 0.2, (5 - t) / 2.5), 0, 1)
    gurgel = A.lp(_rausch(rng, n), 300) * (np.sin(2 * np.pi * 6 * t) > 0) * np.exp(-((t - 2.5) / 0.8) ** 2)
    return x + gurgel * 0.5


@geraeusch("kuehlschrank", atmo=True)
def kuehlschrank(rng, dauer=8.0):
    """Elektrisches Brummen der Wohnung (fällt beim Stromausfall weg)."""
    t = _t(dauer)
    brumm = sum(np.sin(2 * np.pi * 50 * k * t) / k ** 1.3 for k in (1, 2, 3, 4, 6))
    return brumm * 0.3 + A.lp(_rausch(rng, len(t), "rosa"), 400) * 0.05


@geraeusch("stromausfall")
def stromausfall(rng):
    """Brummen sackt ab, Relais klackt, alles verstummt."""
    d = 2.5
    t = _t(d)
    f = 50 * np.clip(1 - (t - 0.6) / 1.6, 0.25, 1)
    brumm = sum(np.sin(2 * np.pi * k * np.cumsum(f) / SR) / k for k in (1, 2, 3, 5))
    brumm *= np.clip(1.6 - t / 1.4, 0, 1) ** 2 * 0.5
    knack = A.hp(_rausch(rng, len(t)), 1000) * np.exp(-np.maximum(t - 0.55, 0) / 0.004) * (t > 0.55)
    surr = _ton(lambda tt: 8000 * np.exp(-tt * 2), d) * np.exp(-t / 0.6) * 0.04
    return brumm + knack * 0.8 + surr


@geraeusch("strom_an")
def strom_an(rng):
    return stromausfall(rng)[::-1].copy()


# ---------- Hochhaus ----------

@geraeusch("aufzug_ding")
def aufzug_ding(rng):
    d = 1.6
    x = np.zeros(A.sek(d + 0.4), np.float32)
    for f, t in [(1318.5, 0.0), (1046.5, 0.35)]:
        glock = sum(_ton(f * p, d) * _abkling(d, 0.5 / (i + 1)) / (i + 1) for i, p in enumerate([1, 2.0, 3.01, 4.2]))
        _einfuegen(x, glock, t)
    return x


@geraeusch("aufzug_steckt")
def aufzug_steckt(rng):
    """Aufzug ruckt, Seile ächzen, Stopp mit dumpfem Schlag – dann Stille."""
    d = 4.0
    t = _t(d)
    motor = sum(np.sin(2 * np.pi * f * t) for f in (110, 220.5, 331)) * 0.15 * np.clip((2.2 - t) / 0.3, 0, 1)
    aechz = A.bp(_rausch(rng, len(t)), 300, 900) * (np.sin(2 * np.pi * 0.8 * t) > 0.6) * 0.5 * (t < 2.2)
    schlag = np.zeros_like(t, dtype=np.float32)
    _einfuegen(schlag, (_ton(lambda tt: 60 - 20 * tt, 1.5) * _abkling(1.5, 0.25) + A.lp(_rausch(rng, A.sek(1.5)), 600) * _abkling(1.5, 0.05)), 2.2)
    return motor + aechz + schlag * 1.4


@geraeusch("treppenhaus_tuer")
def treppenhaus_tuer(rng):
    """Schwere Brandschutztür: Quietschen, Schließer, schwerer Schlag."""
    d = 2.6
    t = _t(d)
    quietsch = _ton(lambda tt: 650 + 300 * np.sin(2 * np.pi * 1.3 * tt) + 60 * np.sin(2 * np.pi * 23 * tt), d, "saw")
    quietsch = A.bp(quietsch, 500, 3000) * np.clip(np.minimum(t / 0.2, (1.3 - t) / 0.2), 0, 1) * 0.3
    schlag = np.zeros_like(t, dtype=np.float32)
    _einfuegen(schlag, tuer_zu(rng, hart=1.0), 1.4)
    return quietsch + schlag


@geraeusch("stille_raum", atmo=True)
def stille_raum(rng, dauer=8.0):
    """Raumton – absolute Stille klingt unnatürlich."""
    return A.lp(_rausch(rng, A.sek(dauer), "rosa"), 1200) * 0.05


@geraeusch("treppenhaus_atmo", atmo=True)
def treppenhaus_atmo(rng, dauer=8.0):
    """Hohler Schacht: tiefes Rauschen, Luftzug, ferne Tropfen."""
    n = A.sek(dauer)
    x = A.bp(_rausch(rng, n, "braun"), 40, 300) * 0.5 + A.bp(_rausch(rng, n), 500, 2000) * 0.03
    for tt in rng.uniform(0, dauer, max(1, int(dauer / 3))):
        _einfuegen(x, _plopp(rng, 900, 0.05) * 0.08, tt)
    return x


# ---------- Draußen ----------

@geraeusch("wind", atmo=True)
def wind(rng, dauer=8.0, staerke=0.5):
    n = A.sek(dauer)
    boe = 0.5 + 0.5 * np.clip(A.lp(_rausch(rng, n), 0.4) * 30, -1, 1)
    l = A.bp(_rausch(rng, n, "rosa"), 150, 900 + 1500 * staerke) * (0.4 + boe * staerke)
    r = A.bp(_rausch(rng, n, "rosa"), 150, 900 + 1500 * staerke) * (0.4 + boe[::-1] * staerke)
    pfeif = _ton(lambda t: 700 + 250 * boe[: len(t)], dauer) * boe * staerke * 0.04
    return np.stack([l + pfeif, r + pfeif * 0.7], axis=1)


@geraeusch("regen", atmo=True)
def regen(rng, dauer=8.0, staerke=0.6):
    n = A.sek(dauer)
    x = np.stack([A.hp(_rausch(rng, n, "rosa"), 400), A.hp(_rausch(rng, n, "rosa"), 400)], axis=1) * 0.35 * staerke
    for tt in rng.uniform(0, dauer, int(dauer * 90 * staerke)):
        k = A.bp(_rausch(rng, A.sek(0.008)), 2000, 9000) * _abkling(0.008, 0.0015) * rng.uniform(0.1, 0.6)
        s = A.sek(tt)
        kanal = rng.integers(0, 2)
        e = min(n, s + len(k))
        x[s:e, kanal] += k[: e - s]
    return x


@geraeusch("donner")
def donner(rng, entfernung=0.4):
    d = 6.0
    t = _t(d)
    krach = A.lp(_rausch(rng, len(t)), 3000) * np.exp(-t / 0.08) * (1 - entfernung)
    grollen = A.lp(_rausch(rng, len(t), "braun"), 250) * (1 - np.exp(-t / 0.15)) * np.exp(-t / 1.6) * 3
    grollen *= 0.7 + 0.3 * np.abs(A.lp(_rausch(rng, len(t)), 4) * 10)
    return krach + grollen


@geraeusch("stadt_fern", atmo=True)
def stadt_fern(rng, dauer=10.0):
    """Ferne, verlassene Stadt: tiefes Rauschen, ab und zu eine Sirene."""
    n = A.sek(dauer)
    x = A.lp(_rausch(rng, n, "braun"), 350) * 0.5
    x = A.stereo(x)
    if dauer >= 6:
        s = sirene_fern(rng, dauer=min(dauer - 1, 7))
        x = A.einmischen(x, A.stereo(s, rng.uniform(-0.7, 0.7)) * 0.25, A.sek(rng.uniform(0, dauer - len(s) / SR)))
    return x[:n]


@geraeusch("sirene_fern")
def sirene_fern(rng, dauer=6.0):
    s = _ton(lambda tt: 750 + 350 * np.sin(2 * np.pi * 0.25 * tt - np.pi / 2), dauer, "tri")
    s = A.lp(s, 1800) * A.huelle(len(s), 1.0, r=1.5)
    return A.hall(s, "draussen", 0.5).mean(axis=1)[: len(s)] * 0.6


@geraeusch("hubschrauber")
def hubschrauber(rng, dauer=8.0):
    """Hubschrauber fliegt vorbei (Hoffnung!)."""
    t = _t(dauer)
    blatt = (np.sin(2 * np.pi * 14 * t) > 0.6).astype(np.float32)
    blatt = A.lp(blatt, 200)
    knatter = A.lp(_rausch(rng, len(t), "rosa"), 900) * (0.3 + blatt * 1.5)
    turb = _ton(4200, dauer) * 0.01
    naehe = np.exp(-((t - dauer / 2) / (dauer / 4)) ** 2)
    x = (knatter + turb) * naehe
    pan = np.clip((t - dauer / 2) / (dauer / 2), -1, 1)
    w = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(w), x * np.sin(w)], axis=1)


@geraeusch("autoalarm")
def autoalarm(rng, dauer=6.0, entfernung=0.5):
    """Klassische Alarmanlage: Heulen – Trillern – Hupen."""
    x = np.zeros(A.sek(dauer), np.float32)
    teil = dauer / 3
    t = _t(teil)
    heul = _ton(lambda tt: 1000 + 500 * np.sin(2 * np.pi * 2.5 * tt), teil, "square")
    triller = _ton(lambda tt: np.where(np.sin(2 * np.pi * 8 * tt) > 0, 1300, 900), teil, "square")
    hupe = (_ton(420, teil, "square") + _ton(510, teil, "square")) * (np.sin(2 * np.pi * 2 * t) > 0)
    for i, s in enumerate([heul, triller, hupe]):
        _einfuegen(x, A.lp(s, 3500) * 0.4, i * teil)
    x = _entfernung(x, entfernung)
    return A.hall(x, "draussen", 0.15 + 0.3 * entfernung)[: len(x)]


@geraeusch("hund_fern")
def hund_fern(rng, anzahl=3):
    x = np.zeros(A.sek(0.5 * anzahl + 1), np.float32)
    for i in range(anzahl):
        d = 0.22
        f0 = rng.uniform(380, 480)
        q = _ton(lambda tt: f0 * (1 + 0.5 * np.exp(-tt / 0.04)), d, "saw") * A.huelle(A.sek(d), 0.01, r=0.12)
        q = A.bp(q, 600, 2200) + A.bp(_rausch(rng, A.sek(d)), 800, 2500) * 0.3 * A.huelle(A.sek(d), 0.005, r=0.1)
        _einfuegen(x, q, i * rng.uniform(0.4, 0.6))
    return _entfernung(A.hall(x, "draussen", 0.4).mean(axis=1)[: len(x)], 0.6)


# ---------- Zombies ----------

def _formant(x, vokal):
    f = {"a": (750, 1200, 2600), "o": (450, 850, 2600), "u": (350, 700, 2400), "e": (500, 1700, 2500)}[vokal]
    return A.bp(x, f[0] * 0.8, f[0] * 1.25) + A.bp(x, f[1] * 0.85, f[1] * 1.2) * 0.6 + A.bp(x, f[2] * 0.9, f[2] * 1.1) * 0.25


@geraeusch("zombie")
def zombie(rng, dauer=None, tief=0.5):
    """Ein einzelnes Stöhnen/Röcheln."""
    dauer = dauer or rng.uniform(1.4, 2.6)
    n = A.sek(dauer)
    t = _t(dauer)
    f0 = (95 - 30 * tief) * (1 + 0.15 * np.sin(2 * np.pi * rng.uniform(0.3, 0.8) * t)) * (1 + 0.04 * A.lp(_rausch(rng, n), 20) * 20)
    # Knarrstimme: unregelmäßiger Pulszug
    ph = np.cumsum(f0 * (1 + 0.08 * _rausch(rng, n))) / SR
    puls = (np.diff(np.floor(ph), prepend=0) > 0).astype(np.float32)
    quelle = A.lp(puls, 3000) * 3 + _rausch(rng, n) * 0.25
    vokal = rng.choice(["a", "o", "u"])
    x = _formant(quelle, vokal)
    x = np.tanh(x * 3) * 0.6
    hk = np.clip(np.minimum(t / (dauer * 0.35), (dauer - t) / (dauer * 0.5)), 0, 1) ** 1.3
    return x * hk


@geraeusch("zombie_horde", atmo=True)
def zombie_horde(rng, dauer=8.0, dichte=1.0, entfernung=0.5):
    n = A.sek(dauer)
    x = np.zeros((n, 2), np.float32)
    for _ in range(int(dauer * 3 * dichte)):
        z = zombie(rng, tief=rng.uniform(0.2, 1.0))
        z = _entfernung(z, np.clip(entfernung + rng.uniform(-0.2, 0.2), 0, 0.95))
        x = A.einmischen(x, A.stereo(z * rng.uniform(0.3, 1.0), rng.uniform(-0.9, 0.9)), A.sek(rng.uniform(-1, dauer)))
    schlurf = A.bp(_rausch(rng, n), 300, 2000) * (0.5 + 0.5 * np.abs(A.lp(_rausch(rng, n), 3) * 10)) * 0.06
    x = x[:n] + A.stereo(schlurf)
    return A.hall(x, "draussen", 0.3)[:n]


@geraeusch("zombie_kratzen")
def zombie_kratzen(rng, dauer=3.0):
    """Fingernägel/Hände an der Tür + Schläge gegen die Tür."""
    n = A.sek(dauer)
    x = np.zeros(n, np.float32)
    for tt in np.arange(0.1, dauer - 0.4, 0.55):
        k = A.bp(_rausch(rng, A.sek(0.35)), 1500, 6000) * A.huelle(A.sek(0.35), 0.05, r=0.15) * 0.35
        _einfuegen(x, k, tt + rng.uniform(-0.05, 0.05))
    for tt in rng.uniform(0, dauer - 0.3, 3):
        _einfuegen(x, (_ton(90, 0.3) * _abkling(0.3, 0.06) + A.lp(_rausch(rng, A.sek(0.3)), 500) * _abkling(0.3, 0.02)), tt)
    _einfuegen(x, zombie(rng, 1.6) * 0.5, dauer * 0.4)
    return x


# ---------- Körper ----------

@geraeusch("herzschlag", atmo=True)
def herzschlag(rng, dauer=6.0, bpm=78):
    x = np.zeros(A.sek(dauer), np.float32)
    d = 0.2
    lub = _ton(lambda t: 55 * (1 + np.exp(-t / 0.02)), d) * _abkling(d, 0.04)
    dub = _ton(lambda t: 70 * (1 + np.exp(-t / 0.02)), d) * _abkling(d, 0.03) * 0.7
    t = 0.0
    while t < dauer:
        _einfuegen(x, lub, t)
        _einfuegen(x, dub, t + 0.16)
        t += 60 / bpm
    return A.lp(x, 180)


@geraeusch("atmen", atmo=True)
def atmen(rng, dauer=6.0, schnell=False):
    n = A.sek(dauer)
    t = _t(dauer)
    f = 0.55 if schnell else 0.25
    zyklus = np.sin(2 * np.pi * f * t)
    hk = np.clip(np.abs(zyklus), 0, 1) ** 2
    farbe = np.where(zyklus > 0, 1.0, 0.7)
    return A.bp(_rausch(rng, n), 400, 3500) * hk * farbe * 0.5


# ---------- Funk / Signal ----------

@geraeusch("funk_rauschen", atmo=True)
def funk_rauschen(rng, dauer=4.0):
    n = A.sek(dauer)
    x = A.bp(_rausch(rng, n), 300, 3200) * 0.4
    for tt in rng.uniform(0, dauer, int(dauer * 6)):
        _einfuegen(x, A.hp(_rausch(rng, A.sek(0.01)), 2000) * rng.uniform(0.5, 1.5), tt)
    return x * (0.75 + 0.25 * np.sin(2 * np.pi * 0.7 * _t(dauer)))


@geraeusch("funk_klick")
def funk_klick(rng):
    """Squelch beim Drücken der Sprechtaste."""
    x = np.zeros(A.sek(0.35), np.float32)
    _einfuegen(x, A.bp(_rausch(rng, A.sek(0.25)), 300, 3500) * A.huelle(A.sek(0.25), 0.002, r=0.05) * 0.6, 0.02)
    _einfuegen(x, A.hp(_rausch(rng, A.sek(0.01)), 1500), 0.0)
    return x


@geraeusch("sos_pfeife")
def sos_pfeife(rng):
    """Trillerpfeife im Morsecode: · · ·  – – –  · · ·"""
    kurz, lang, luecke = 0.15, 0.45, 0.15
    folge = [kurz] * 3 + [None] + [lang] * 3 + [None] + [kurz] * 3
    x = np.zeros(A.sek(6), np.float32)
    t = 0.0
    for d in folge:
        if d is None:
            t += 0.35
            continue
        n = A.sek(d)
        ton = _ton(lambda tt: 3100 + 120 * np.sin(2 * np.pi * 28 * tt), d) + A.bp(_rausch(rng, n), 2500, 4000) * 0.3
        _einfuegen(x, ton * A.huelle(n, 0.01, r=0.02), t)
        t += d + luecke
    return x[: A.sek(t + 0.3)]


@geraeusch("sos_licht")
def sos_licht(rng):
    """Taschenlampe im SOS-Rhythmus (hörbar über Schalter-Klicks)."""
    x = np.zeros(A.sek(6), np.float32)
    t = 0.0
    for d in [0.2] * 3 + [None] + [0.6] * 3 + [None] + [0.2] * 3:
        if d is None:
            t += 0.4
            continue
        _einfuegen(x, taschenlampe(rng)[: A.sek(0.05)], t)
        _einfuegen(x, taschenlampe(rng)[A.sek(0.07):], t + d)
        t += d + 0.2
    return x[: A.sek(t + 0.2)]


# ---------- Schnitt / Grafik ----------

@geraeusch("whoosh")
def whoosh(rng, dauer=0.8, hoch=True):
    n = A.sek(dauer)
    t = _t(dauer)
    form = np.sin(np.pi * t / dauer) ** 2
    rausch = _rausch(rng, n, "rosa")
    # bewegter Bandpass grob über drei Bänder
    teile = [A.bp(rausch, f * 0.7, f * 1.4) for f in (400, 1200, 3500)]
    pos = t / dauer if hoch else 1 - t / dauer
    gew = [np.clip(1 - np.abs(pos * 2 - k), 0, 1) for k in range(3)]
    x = sum(g * b for g, b in zip(gew, teile)) * form
    w = pos * np.pi / 2
    return np.stack([x * np.cos(w), x * np.sin(w)], axis=1) * 1.4


@geraeusch("riser")
def riser(rng, dauer=2.5):
    t = _t(dauer)
    ton = _ton(lambda tt: 120 * 2 ** (3 * tt / dauer), dauer, "saw") * 0.2
    x = A.lp(ton, 4000) + A.hp(_rausch(rng, len(t), "rosa"), 800) * (t / dauer) * 0.6
    return A.breite(x * (t / dauer) ** 2)


@geraeusch("hit")
def hit(rng, dauer=4.0):
    """Tiefer Kinoschlag – für Cliffhanger und Titel."""
    t = _t(dauer)
    boom = _ton(lambda tt: 38 + 70 * np.exp(-tt / 0.06), dauer) * np.exp(-t / 1.0)
    knall = A.lp(_rausch(rng, len(t)), 4000) * np.exp(-t / 0.05) * 0.6
    metall = sum(_ton(f, dauer) * np.exp(-t / 0.9) for f in (220, 331, 467)) * 0.07
    return A.hall(np.tanh((boom + knall + metall) * 1.5), "halle", 0.35)[: len(t) + A.sek(1.5)]


@geraeusch("ui_pop")
def ui_pop(rng):
    d = 0.12
    return _ton(lambda t: 700 + 900 * t / d, d) * A.huelle(A.sek(d), 0.003, r=0.06) * 0.7


@geraeusch("ui_ding")
def ui_ding(rng):
    """Infokarte / Check-Haken: kleines Zweiklang-Glöckchen."""
    x = np.zeros(A.sek(0.9), np.float32)
    for f, tt in [(1568, 0), (2093, 0.09)]:
        g = sum(_ton(f * p, 0.8) * _abkling(0.8, 0.25 / (i + 1)) / (i + 1) for i, p in enumerate([1, 2, 3]))
        _einfuegen(x, g * 0.6, tt)
    return x


@geraeusch("papier")
def papier(rng, dauer=1.2):
    """Stadtplan auffalten / Papier rascheln."""
    n = A.sek(dauer)
    knitter = (np.abs(_rausch(rng, n)) > 2.2).astype(np.float32)
    knitter = A.lp(knitter, 3000) * 4
    x = A.bp(_rausch(rng, n), 1200, 9000) * (0.25 + knitter) * (0.5 + 0.5 * np.abs(A.lp(_rausch(rng, n), 6) * 8))
    return x * A.huelle(n, 0.05, r=0.2)


@geraeusch("schreiben")
def schreiben(rng, dauer=2.0):
    """Stift auf Papier (Notizen, Plan)."""
    n = A.sek(dauer)
    striche = (np.sin(2 * np.pi * np.cumsum(4 + 3 * rng.random(n)) / SR) > 0).astype(np.float32)
    return A.bp(_rausch(rng, n), 2500, 9000) * A.lp(striche, 30) * 0.5


@geraeusch("glas_klirren")
def glas_klirren(rng):
    d = 1.5
    x = np.zeros(A.sek(d), np.float32)
    for tt in np.sort(rng.exponential(0.12, 25)):
        if tt > d - 0.3:
            continue
        f = rng.uniform(2500, 9000)
        s = sum(_ton(f * p, 0.3) * _abkling(0.3, rng.uniform(0.02, 0.1)) for p in (1, 1.53, 2.31)) * rng.uniform(0.2, 1)
        _einfuegen(x, s, tt)
    _einfuegen(x, A.hp(_rausch(rng, A.sek(0.05)), 1500) * _abkling(0.05, 0.01) * 2, 0)
    return x


@geraeusch("dose_oeffnen")
def dose_oeffnen(rng):
    x = np.zeros(A.sek(0.8), np.float32)
    _einfuegen(x, A.hp(_rausch(rng, A.sek(0.02)), 2000) * _abkling(0.02, 0.003), 0.0)
    _einfuegen(x, A.hp(_rausch(rng, A.sek(0.5)), 3000) * _abkling(0.5, 0.15) * 0.4, 0.01)
    return x


@geraeusch("rucksack")
def rucksack(rng):
    """Reißverschluss + Rucksack absetzen."""
    n = A.sek(1.0)
    zaehne = (np.sin(2 * np.pi * np.cumsum(np.linspace(60, 140, n)) / SR) > 0.7).astype(np.float32)
    zipp = A.bp(_rausch(rng, n), 1500, 7000) * A.lp(zaehne, 2000) * 1.5 * A.huelle(n, 0.02, r=0.05)
    x = np.zeros(A.sek(1.6), np.float32)
    _einfuegen(x, zipp, 0)
    _einfuegen(x, A.lp(_rausch(rng, A.sek(0.4)), 500) * _abkling(0.4, 0.06) * 1.5, 1.15)
    return x
