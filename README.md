# Animierte Serie

Animierte Story-Videos im Hochformat (1080×1920, TikTok/Reels/Shorts). Jede Folge ist **eine JSON-Datei** in `episoden/`. Daraus entsteht automatisch das fertige Video mit Animation, Kamerafahrten, Wort-für-Wort-Untertiteln, HUD, Effekten, Stimme und Musik.

## So läuft es

1. Claude schreibt eine Folge nach `episoden/folge-XX.json`.
2. Optional kommt die Stimme dazu, eine Datei pro Szene: `audio/folge-XX/01.mp3`, `02.mp3` …
   Die Länge jeder Szene und das Timing der Untertitel passen sich dann automatisch an.
3. Optional kommt Musik dazu: `musik/xyz.mp3`, eingetragen in der Folge unter `"musik"`.
4. **Push → GitHub Actions rendert automatisch.** Das fertige Video liegt danach unter **Releases** zum Download, siehe Tab „Actions“ bzw. „Releases“ im Repo.

Lokal rendern:

```bash
npm install && npx playwright install chromium   # einmalig, dazu ffmpeg
node render.mjs episoden/folge-00-test.json       # volles Video -> ausgabe/
node render.mjs episoden/folge-00-test.json --vorschau   # schnell, kleine Auflösung
node render.mjs episoden/folge-00-test.json --bilder     # nur ein Standbild pro Szene
```

## Aufbau einer Folge

```json
{
  "titel": "…",
  "fps": 30,
  "musik": "musik/spannung.mp3",
  "musik_lautstaerke": 0.16,
  "figuren": {
    "luca": { "typ": "junge", "haut": "#f1cfb1", "haare": "#2f2520", "jacke": "#4f6d8a", "hose": "#2d3340" }
  },
  "szenen": [
    { "typ": "gesicht", "figur": "luca", "ausdruck": "schreck", "text": "Dann *klopft* es.", "hud": { "tag": 4, "zeit": "10:07", "co2": 1.0 } }
  ]
}
```

**Figuren** (`typ`): `junge`, `maedchen`, `mann`, `glatze`. Dazu die Farben `haut`, `haare`, `jacke`, `hose`, `schuhe`, `augen`, optional `muetze` und `bart`.

**Szenentypen**

| typ | Zeigt | Wichtige Felder |
|---|---|---|
| `gesicht` | Nahaufnahme, Figur spricht, blinzelt | `figur`, `ausdruck`, `blick: [x,y]` |
| `figur` | Ganze Figur(en) im Bunkerraum | `figur` oder `figuren: [..]`, `geste`, `gesten`, `ausdruecke`, `sprecher` |
| `schnitt` | Querschnitt: Erde, Schacht, Bunker | `figuren`, `himmel: "tag"/"nacht"`, `im_schacht`, `luft`, `alarm` |
| `luke` | Blick durch die Luke nach oben | `figur`, `zappeln`, `schuhe: false` |
| `titel` | Großer Text-Knall | `gross`, `groesse`, `farbe`, `textfarbe` |

**Ausdrücke:** `neutral`, `froh`, `traurig`, `schreck`, `angst`, `wuetend`, `muede`
**Gesten:** `steht`, `winkt`, `zeigt`, `haende_hoch`

**Für jede Szene:**
- `text`: der Erzähltext, gleichzeitig der Untertitel. Mit `*Wort*` wird ein Wort hervorgehoben (gelb und unterstrichen).
- `dauer`: Sekunden, optional. Sonst ergibt sie sich aus dem Audio bzw. der Textlänge.
- `kamera`: `{ "von": {"zoom":1, "x":540, "y":960}, "bis": {...}, "kurve": "sanft|linear|raus|rein" }`. Die Welt ist 1080×1920 groß, x/y geben den Bildmittelpunkt an.
- `hud`: `{ "tag": 4, "zeit": "10:07", "co2": 1.0 }`
- Effekte: `partikel` (`staub|asche|schnee`), `wackeln` (0–2), `blitz`, `alarm`, `tint` + `tint_staerke`, `vignette`, `uebergang: "blende"`, `punch: false`

## Stimme erzeugen

Pro Szene eine Audiodatei, egal ob ElevenLabs (z. B. über Shotstack), eine eigene Aufnahme oder etwas anderes. Den Text der Szene sprechen lassen und als `audio/<folge>/<NN>.mp3` speichern. Die Nummerierung beginnt bei 01.
