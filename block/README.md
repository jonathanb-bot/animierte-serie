# Blockstadt – Kurzvideos mit Blockfiguren (Test ab 23.11.2026)

Jonathans Auftrag (22./23.11.): Videos im Stil seines Vorbild-Videos, also eine Nachtstadt mit Blockfiguren und einer Ich-Erzählung („In meiner Stadt …“), dazu eine Kinderstimme.

Am Ende steht eine **offene Frage mit 3 Antworten (A/B/C)**. Die Zuschauer schreiben ihre Wahl in die Kommentare, und **das nächste Video setzt die meistgewählte Antwort um**.

**Test:** 3 Videos, eins pro Tag:

| Folge | Datum | Inhalt |
|---|---|---|
| 1 | 23.11. | erste Folge |
| 2 | 24.11. | nach den Kommentaren zu Folge 1 |
| 3 | 25.11. | nach den Kommentaren zu Folge 2 |

Ausgewertet wird in der nächsten großen Analyse.

**Plattformen und Posten:**
- TikTok und Instagram bekommen die volle Länge.
- YouTube erlaubt höchstens 90 s, dafür gibt es eine eigene gekürzte Fassung (`zusammen_yt.py`).
- Zusätzlich zum täglichen Nischen-Video, höchstens 2 pro Tag und Plattform.

**Dateien:**

| Datei | Inhalt |
|---|---|
| `welt.js` | Stadt (Instanzen + Fenster-Shader), Himmel, Boden, Laternen, Autos, Kraftwerk, Lichtkegel |
| `figuren.js` | Blockfiguren (Hauttöne, Helm, Weste, Mütze, Brille …), `pose()` |
| `wesen.js` | Schatten-Wesen, Himmelslaternen, Funken, Goldstaub |
| `requisiten.js` | Polizei, Notlampen, Gasse, Laden, Lager, Schlafzimmer, Menge, Konfetti |
| `folge-XX/szene.html` | Einstellungen der Folge (Zeiten aus `plan_final.json` bzw. `?plan=plan_yt.json`) |
| `render.cjs` / `mitten.cjs` | Bild für Bild rendern bzw. Standbilder (`FOLGE=folge-01`, `PLAN=plan_yt.json`, `VON`/`BIS` für parallele Teile) |

**Ablauf einer Folge:**

1. `npm ci --ignore-scripts`, dann den Server starten: `python3 -m http.server 8767 --directory block`.
2. Stimme erzeugen mit `stimme.py` (gemeinsam für alle Folgen, seit 23.11. abends):
   - `erzeugen(zeilen, ordner)`: Gemini „Puck“, fröhliche Storytime-Anweisung, kurze Abschnitte, Auswahl nach Sprachmelodie, keine Rundfunk-Kette, kleiner Tonhöhen-Angleich auf etwa 200 Hz.
   - `zusammen(ordner, extra)` (volle Fassung) und `zusammen(ordner, extra, yt=True, ohne=[…])` (YouTube, höchstens 89 s).
   - Folge 1 nutzt noch ihre eigenen Skripte (`folge-01/stimme4.py`, `zusammen*.py`).
3. Standbilder prüfen: `node mitten.cjs alle`.
4. Rendern: in 3 parallelen Teilen, 60 fps. Für eine 95-s-Folge dauert das etwa 55 min.
5. Ton erzeugen: `python3 tonspur.py` mit `Ton.mischen()`. Die Stimme liegt automatisch 12 LU über dem Hintergrund (wie im Vorbild), für YouTube mit `PLAN=plan_yt.json STIMME=stimme_yt.wav MIX=mix_yt.wav`.
6. Kodieren: unter 100 MB, weil GitHub keine größeren Dateien annimmt. Zum Beispiel `-c:v libx264 -preset slow -crf 22 -maxrate 7M -bufsize 14M`, Ton auf −14 LUFS.
7. Veröffentlichen:
   - `ausgabe/taeglich-block-bNN.mp4` mit `taeglich/veroeffentlichen.py block-bNN --max-dauer 120 --plattformen tiktok,instagram`.
   - `ausgabe/taeglich-block-bNNk.mp4` mit `--plattformen youtube`.

**Feste Regeln für diese Videos:**
- Kein Kamera-Wackeln.
- Nichts darf flackern: Menge pro Einstellung fest, Fenster in der Ferne geglättet, keine Körnung.
- Ein-Wort-Untertitel in Gelb.
- Große Autos.
- Mitmach-Frage am Ende als 3 Karten A/B/C.


## Flackern und Ruckeln (Jonathan 24.11. abends)

- **Flackern:** Der Software-Renderer lässt in einzelnen Bildern reproduzierbar eine Textur weg (Gras blass, Klassenboden dunkelgrün). Vor dem Kodieren immer `python3 block/entflackern.py <folge>/frames` laufen lassen: ersetzt einzelne (oder 2) Ausreißer-Bilder durch die Mitte der Nachbarn, Originale landen in `<folge>/frames_flacker/`.
- **Ruckeln:** Der Wisch-Übergang dauert seit 24.11. abends nur noch 0,1 s pro Seite (vorher 0,22 s) und ist weicher (`folge.js` → `wisch`, Shader in `welt.js`). Alte Bilder neu rendern: `entflackern.py <frames> --wisch-liste liste.txt`, dann `LISTE=liste.txt node render.cjs` (mit `FOLGE`, `PLAN`).
