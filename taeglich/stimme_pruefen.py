"""Prüft jede Einstellung eines Kurzvideos per Spracherkennung gegen den Drehbuchtext.

    python taeglich/stimme_pruefen.py taeglich/episoden/video-001.txt

Für jede Zeile: Was sagt die Stimme (faster-whisper), was steht im Drehbuch, wie gut passt es (0–1)?
Ausgabe am Ende: OK, wenn jede Einstellung >= 0.85 (Wörter) oder >= 0.95 (Buchstaben) passt und keine Stilanweisung mitgelesen wurde, sonst FEHLER (Exit-Code 1).
"""
from __future__ import annotations

import difflib
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STIL_WOERTER = {"erzähler", "kurzgeschichte", "männerstimme", "lies", "vor", "pause", "tiktok",
                "narrator", "voice", "male", "short", "story"}


ZAHLEN = {w: str(i) for i, w in enumerate("null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn "
                                           "fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig".split())}
ZAHLEN.update({"dreißig": "30", "vierzig": "40", "fünfzig": "50", "sechzig": "60", "siebzig": "70",
               "achtzig": "80", "neunzig": "90", "hundert": "100", "tausend": "1000"})
# englische Fassung (3.11.)
ZAHLEN.update({w: str(i) for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen "
                                               "fourteen fifteen sixteen seventeen eighteen nineteen twenty".split())})
ZAHLEN.update({"thirty": "30", "forty": "40", "fifty": "50", "hundred": "100", "thousand": "1000"})


def norm(t: str) -> list[str]:
    t = t.lower().replace("%", " prozent")
    t = re.sub(r"[^a-z0-9äöüß ]+", " ", t)
    # Zahlwörter wie Ziffern behandeln (Whisper schreibt „18“, das Drehbuch „achtzehn“)
    return [ZAHLEN.get(w, w).replace("ß", "ss") for w in t.split()]


def zeilen(drehbuch: Path) -> list[str]:
    out = []
    for z in drehbuch.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\s*\[[^\]]*\]\s*(.*)$", z)
        if m:
            out.append(m.group(1).replace("*", ""))
    return out


def main(pfad: str) -> int:
    import numpy as np
    from faster_whisper import WhisperModel
    globals()['np'] = np
    d = Path(pfad).resolve()
    audio = d.parent.parent / "audio" / d.stem
    texte = zeilen(d)
    sprache = "en" if re.search(r"^@sprache\s+en\b", d.read_text(encoding="utf-8"), re.M) else "de"
    modell = WhisperModel("medium", device="cpu", compute_type="int8")  # "small" verhört sich zu oft
    fehler = 0
    for i, soll in enumerate(texte, 1):
        f = audio / f"{i:03d}.mp3"
        if not norm(soll):
            continue
        if not f.exists():
            print(f"{i:03d} FEHLT  {soll}"); fehler += 1; continue
        roh = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                             capture_output=True, check=True).stdout
        segs, _ = modell.transcribe(np.frombuffer(roh, dtype=np.float32), language=sprache, beam_size=5)
        ist = " ".join(s.text for s in segs).strip()
        a, b = norm(soll), norm(ist)
        q = difflib.SequenceMatcher(None, a, b).ratio()
        # Buchstabenvergleich fängt Verschleifungen ab („leg das“ klingt wie „legt das“), aber keine falschen Wörter
        qb = difflib.SequenceMatcher(None, " ".join(a), " ".join(b)).ratio()
        stil = len(set(b) & STIL_WOERTER) >= 2 and len(set(a) & STIL_WOERTER) < 2
        ok = (q >= 0.85 or qb >= 0.95) and not stil
        fehler += not ok
        print(f"{i:03d} {'ok ' if ok else 'XX '} {q:.2f}  soll: {soll}\n{'':12}ist:  {ist}" + ("  [Stilanweisung mitgelesen]" if stil else ""))
    print("OK – alle Einstellungen passen" if not fehler else f"FEHLER – {fehler} Einstellung(en) prüfen/neu erzeugen")
    return 1 if fehler else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
