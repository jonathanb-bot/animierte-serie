"""Untertitel im Stil der Vorlage (ASS): Wort für Wort, Großbuchstaben, dunkle Box,
aktuelles Wort unterstrichen, Schlüsselwörter farbig. Dazu HUD (Tag/Uhrzeit/Balken)
und große Einblendungen („ZU SCHMAL“).
"""
from __future__ import annotations

import re
from pathlib import Path

SCHRIFT = "Oswald"
SCHRIFT_ORDNER = Path(__file__).resolve().parent.parent / "assets" / "schriften"

# ASS-Farben sind &HAABBGGRR
WEISS = "&H00FFFFFF"
ORANGE = "&H003A83E8"   # #E8833A
GELB = "&H004CC9F2"     # #F2C94C
GRAU = "&H00A0A0A0"
FARBE = {"orange": ORANGE, "gelb": GELB}

_SATZENDE = re.compile(r"[.!?…:;,]$")


def _zeit(t: float) -> str:
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def _esc(text: str) -> str:
    return text.replace("\\", "").replace("{", "(").replace("}", ")")


def bloecke(zeilen: list[dict], max_woerter=4, max_zeichen=20, max_luecke=0.35) -> list[list[dict]]:
    """Wörter (pro Zeile: {'woerter': [(start, ende, wort, akzent)], 'text': originaltext})
    zu kurzen Untertitel-Blöcken gruppieren."""
    alle = []
    for z in zeilen:
        token = z["text"].replace("*", "").replace("_", " ").split()
        ti = 0
        block: list[dict] = []
        for start, ende, wort, akzent in z["woerter"]:
            # passendes Original-Token finden (für Satzzeichen)
            satzende = False
            for k in range(ti, min(ti + 4, len(token))):
                if _norm(token[k]).startswith(_norm(wort)) or _norm(wort).startswith(_norm(token[k]) or "#"):
                    satzende = bool(_SATZENDE.search(token[k]))
                    ti = k + 1
                    break
            anzeige = re.sub(r"^\W+|\W+$", "", wort).upper()
            if not anzeige:
                continue
            w = {"start": start, "ende": ende, "wort": anzeige, "akzent": akzent}
            laenge = sum(len(x["wort"]) for x in block) + len(w["wort"])
            if block and (len(block) >= max_woerter or laenge > max_zeichen
                          or start - block[-1]["ende"] > max_luecke):
                alle.append(block)
                block = []
            block.append(w)
            if satzende:
                alle.append(block)
                block = []
        if block:
            alle.append(block)
    return alle


def _norm(w: str) -> str:
    return "".join(c for c in w.lower() if c.isalnum())


def _kopf(b: int, h: int) -> str:
    gross = round(min(h * 0.066, b * 0.118))   # Untertitel (wie Vorlage: bricht bei langen Blöcken um)
    hud = round(min(h * 0.034, b * 0.062))
    einbl = round(min(h * 0.085, b * 0.15))
    rand = round(h * 0.012)
    return f"""[Script Info]
ScriptType: v4.00+
PlayResX: {b}
PlayResY: {h}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Wort,{SCHRIFT},{gross},{WEISS},{WEISS},&H70101010,&H00000000,-1,0,0,0,100,100,1,0,3,{rand},0,2,60,60,{round(h * 0.27)},1
Style: HUD,{SCHRIFT},{hud},{WEISS},{WEISS},&H80141414,&H00000000,-1,0,0,0,100,100,1,0,3,{round(rand * 0.8)},0,7,{round(b * 0.05)},60,{round(h * 0.075)},1
Style: Balken,{SCHRIFT},{hud},{WEISS},{WEISS},&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Einblendung,{SCHRIFT},{einbl},{ORANGE},{ORANGE},&H64000000,&H96000000,-1,0,0,0,100,100,2,0,1,{round(rand * 0.5)},{round(rand * 0.6)},8,60,60,{round(h * 0.13)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _wort_text(block, aktiv):
    teile = []
    for i, w in enumerate(block):
        farbe = FARBE.get(w["akzent"])
        t = _esc(w["wort"])
        if farbe:
            t = f"{{\\c{farbe}}}{t}{{\\c{WEISS}}}"
        if i == aktiv:
            t = f"{{\\u1}}{t}{{\\u0}}"
        teile.append(t)
    return " ".join(teile)


def _uhr_plus(uhr: str, minuten: int) -> str:
    h, m = map(int, uhr.split(":"))
    gesamt = (h * 60 + m + minuten) % (24 * 60)
    return f"{gesamt // 60:02d}:{gesamt % 60:02d}"


def _minuten(uhr: str) -> int:
    h, m = map(int, uhr.split(":"))
    return h * 60 + m


def ass(pfad: str, breite: int, hoehe: int, zeilen: list[dict], einblendungen: list[dict],
        hud: list[dict], ende_gesamt: float) -> None:
    """zeilen: [{'text', 'woerter'}], einblendungen: [{'start','ende','text','farbe'}],
    hud: [{'start','ende','tag','uhr','uhr_bis','anzeige','wert','text'}]"""
    ev = []
    bl = bloecke(zeilen)
    for i, block in enumerate(bl):
        naechster = bl[i + 1][0]["start"] if i + 1 < len(bl) else ende_gesamt
        b_ende = min(naechster, block[-1]["ende"] + 0.45)
        for j, w in enumerate(block):
            a = w["start"]
            e = block[j + 1]["start"] if j + 1 < len(block) else b_ende
            if e - a < 0.02:
                continue
            pop = "{\\fscx86\\fscy86\\t(0,90,\\fscx100\\fscy100)}" if j == 0 else ""
            ev.append(f"Dialogue: 2,{_zeit(a)},{_zeit(e)},Wort,,0,0,0,,{pop}{_wort_text(block, j)}")

    for e in einblendungen:
        farbe = FARBE.get(e.get("farbe", "orange"), ORANGE)
        text = _esc(str(e["text"]).upper())
        an = "{\\fad(80,200)\\fscx120\\fscy120\\t(0,120,\\fscx100\\fscy100)}"
        ev.append(f"Dialogue: 3,{_zeit(e['start'])},{_zeit(e['ende'])},Einblendung,,0,0,0,,{an}{{\\c{farbe}}}{text}")

    rx = round(breite * 0.05)
    ry = round(hoehe * 0.075)
    zeile_h = round(min(hoehe * 0.034, breite * 0.062) * 1.45)
    for h in hud:
        if not h.get("tag") and not h.get("uhr"):
            continue
        uhr0 = h.get("uhr", "")
        schritte = [(h["start"], uhr0)]
        if uhr0 and h.get("uhr_bis"):
            diff = (_minuten(h["uhr_bis"]) - _minuten(uhr0)) % (24 * 60)
            if diff:
                for k in range(1, diff + 1):
                    schritte.append((h["start"] + (h["ende"] - h["start"]) * k / (diff + 1), _uhr_plus(uhr0, k)))
        for k, (t0, uhr) in enumerate(schritte):
            t1 = schritte[k + 1][0] if k + 1 < len(schritte) else h["ende"]
            tag = f"{{\\c{ORANGE}}}☀ TAG {h['tag']}{{\\c{WEISS}}}" if h.get("tag") else ""
            sep = "  |  " if tag and uhr else ""
            ev.append(f"Dialogue: 1,{_zeit(t0)},{_zeit(t1)},HUD,,0,0,0,,{tag}{sep}{uhr}")
        if h.get("anzeige"):
            y = ry + zeile_h + round(hoehe * 0.012)
            breite_b = round(breite * 0.2)
            hb = round(min(hoehe * 0.013, breite * 0.024))
            wert = max(0.0, min(1.0, float(h.get("wert", 0))))
            x0 = rx + round(breite * 0.13)
            ev.append(f"Dialogue: 1,{_zeit(h['start'])},{_zeit(h['ende'])},HUD,,0,0,0,,{{\\pos({rx},{y})}}"
                      f"{{\\c{ORANGE}}}{_esc(str(h['anzeige']).upper())}{{\\c{WEISS}}}")
            balken_y = y + round(zeile_h * 0.35)
            ev.append(f"Dialogue: 2,{_zeit(h['start'])},{_zeit(h['ende'])},Balken,,0,0,0,,"
                      f"{{\\pos({x0},{balken_y})\\c&H00505050&\\p1}}m 0 0 l {breite_b} 0 {breite_b} {hb} 0 {hb}{{\\p0}}")
            if wert > 0:
                fuell = max(2, round(breite_b * wert))
                ev.append(f"Dialogue: 3,{_zeit(h['start'])},{_zeit(h['ende'])},Balken,,0,0,0,,"
                          f"{{\\pos({x0},{balken_y})\\c{ORANGE}\\p1}}m 0 0 l {fuell} 0 {fuell} {hb} 0 {hb}{{\\p0}}")
            if h.get("text"):
                ev.append(f"Dialogue: 1,{_zeit(h['start'])},{_zeit(h['ende'])},HUD,,0,0,0,,"
                          f"{{\\pos({x0 + breite_b + round(breite * 0.02)},{y})}}{_esc(str(h['text']))}")

    Path(pfad).write_text(_kopf(breite, hoehe) + "\n".join(ev) + "\n", encoding="utf-8")
