"""Stimme und Ton für lange Querformat-Folgen im 3D-Stil (quer/FORMAT-3D.md, Jonathan 24./25.11.).

Erzähler: Ich-Erzählung mit Gemini „Puck“ wie in der Blockstadt, Stimme unbearbeitet (Issue #41).
Damit ein 10-min-Video (~150 Zeilen) ins Tageskontingent passt: 9 Zeilen pro Anfrage und 1 Versuch
(≈ 17 Anfragen pro Sprache statt 50–100 bei Dreiergruppen). Gemini-Antworten liegen im Cache (ton/gemini.py),
ein abgebrochener Lauf (Kontingent) macht im selben Container ohne neue Anfragen weiter.

Ordner einer langen Folge: block/quer-qNN/ mit
    zeilen.py        Z = [(text, stimmung), …]   (stimmung wie bei tonbib.musik: froh, spannung, staunen, traurig …)
                     EXTRA = {zeile: zusätzliche Pause in s}   (optional)
    zeilen_en.json   ["english line", …]   (gleiche Zeilenzahl, natürliches amerikanisches Englisch)
    szene.js         Einstellungen (wie Blockstadt, mit B.QUER / B.T({de, en}) für Text im Bild)
    tonspur.py       Geräusche (optional, sonst nur Musik nach Stimmung)

    python3 block/lang.py block/quer-q03                  # Deutsch → stimme_final.wav + plan_final.json
    SPRACHE=en python3 block/lang.py block/quer-q03       # Englisch → en/stimme_final.wav + en/plan_final.json
    python3 block/lang.py block/quer-q03 --nur-zusammen   # nur Pausen neu legen
    python3 block/lang.py block/quer-q03 --ton            # Mischung → ton.m4a (en: en/ton.m4a), −14 LUFS ohne Begrenzer
"""
from __future__ import annotations
import json, os, subprocess, sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
sys.path.insert(0, str(HIER))
GRUPPE = 9      # Zeilen pro Gemini-Anfrage
VERSUCHE = 1


def zeilen_laden(ordner: Path, en: bool):
    ns: dict = {}
    exec(open(ordner / "zeilen.py", encoding="utf-8").read(), ns)
    Z = ns["Z"]; extra = ns.get("EXTRA", {})
    texte = json.load(open(ordner / "zeilen_en.json", encoding="utf-8")) if en else [z[0] for z in Z]
    if len(texte) != len(Z):
        sys.exit(f"zeilen_en.json hat {len(texte)} Zeilen, zeilen.py {len(Z)}")
    return texte, [z[1] for z in Z], extra


def stimme(ordner: Path, en: bool, nur_zusammen: bool):
    from stimme import erzeugen, zusammen
    texte, _, extra = zeilen_laden(ordner, en)
    ziel = ordner / "en" if en else ordner; ziel.mkdir(exist_ok=True)
    if not nur_zusammen:
        print(f"{len(texte)} Zeilen → {-(-len(texte) // GRUPPE)} Anfragen ({'en' if en else 'de'})", flush=True)
        erzeugen(texte, str(ziel), gruppe=GRUPPE, versuche=VERSUCHE)
    zusammen(str(ziel), extra=extra)


def ton(ordner: Path, en: bool):
    ziel = ordner / "en" if en else ordner
    env = dict(os.environ, PLAN=str(ziel / "plan_final.json"), STIMME=str(ziel / "stimme_final.wav"), MIX=str(ziel / "mix.wav"))
    if en: env["SPRACHE"] = "en"
    if (ordner / "tonspur.py").exists():
        subprocess.run([sys.executable, "tonspur.py"], cwd=ordner, env=env, check=True)
    else:   # nur Musik nach Stimmung (fester Hintergrundsound, Issue #44) unter der Stimme
        _, stimmungen, _ = zeilen_laden(ordner, en)
        code = ("import sys; sys.path.insert(0, %r); from tonbib import Ton; T = Ton(); T.musik(%r); T.mischen()" % (str(HIER), stimmungen))
        subprocess.run([sys.executable, "-c", code], cwd=ordner, env=env, check=True)
    subprocess.run([sys.executable, str(HIER / "lautheit.py"), str(ziel / "mix.wav"), str(ziel / "mix14.wav")], check=True)
    # Einmal als AAC kodieren; der Workflow legt die Spur ohne Neukodierung unter das Bild (-c:a copy)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(ziel / "mix14.wav"), "-ar", "48000", "-c:a", "aac", "-b:a", "256k", str(ziel / "ton.m4a")], check=True)
    for f in ("mix.wav", "mix14.wav"): (ziel / f).unlink(missing_ok=True)
    print("fertig:", ziel / "ton.m4a")


if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    ordner = Path(sys.argv[1]).resolve(); en = os.environ.get("SPRACHE") == "en"
    if "--ton" in sys.argv: ton(ordner, en)
    else: stimme(ordner, en, "--nur-zusammen" in sys.argv)
