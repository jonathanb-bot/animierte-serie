# Animierte Serie – „24. Stock“

Animierte Story-Videos im Hochformat (1080×1920) für TikTok, Reels und Shorts, im sauberen Flat-Vektor-Stil. Jede Folge ist eine **einfache Textdatei** in `episoden/`. Daraus entsteht automatisch das fertige Video mit Figuren, Kamerafahrten, Wort-für-Wort-Untertiteln, HUD, Licht, Effekten, Musik und Stimme.

- `serienplan.md`: Staffelplan, Figuren, Cliffhanger
- `figuren.json`: alle Figuren. Sie sehen in jeder Folge gleich aus.
- `episoden/folge-XX.txt`: die Drehbücher
- `engine/`: die Animation (Figuren, Szenen, Objekte)
- `render.mjs`: rendert eine Folge zur MP4

## Ablauf

1. Drehbuch schreiben bzw. ändern: `episoden/folge-XX.txt`
2. Optional die Stimme: pro Einstellung eine Datei `audio/folge-XX/001.mp3`, `002.mp3` … Szenenlänge und Untertitel passen sich automatisch an.
3. Optional Musik: `musik/spannung.mp3` hochladen und im Drehbuch `@musik musik/spannung.mp3` eintragen.
4. **Push → GitHub rendert automatisch** (bis zu 5 Folgen gleichzeitig). Das Video liegt danach unter **Releases**.

Lokal:

```bash
npm install && npx playwright install chromium   # einmalig, dazu ffmpeg
node render.mjs episoden/folge-01.txt             # volles Video -> ausgabe/
node render.mjs episoden/folge-01.txt --bilder    # schnell: ein Standbild pro Einstellung
node render.mjs episoden/folge-01.txt --vorschau  # kleine, schnelle Vorschau
```

## Drehbuch-Format

```
# Folge 1: Der erste Tag
@hud tag=1 zeit=07:40 wasser=12/40L essen=6/10Tage     ← Anzeige oben links (gilt, bis sie geändert wird)
@zeit nacht                                            ← Tageszeit für alle folgenden Einstellungen
== Szene 2: Ein ganz normaler Morgen ==                ← Kapitel (nur zur Gliederung)
[wohnung du walter morgen licht=an zoom-rein] Du stehst in deiner *Küche*.
[gesicht walter ort=treppenhaus besorgt] „Benutz nie den Aufzug.“
```

Jede Zeile `[…] Text` ist eine Einstellung. Der Text ist zugleich Erzählung und Untertitel. `*Wort*` hebt ein Wort hervor. Steht Text in „Anführungszeichen“, bewegt die Figur beim Sprechen den Mund.

In der Klammer steht zuerst der **Typ**, danach beliebige Angaben:

| Typ | Zeigt | Nützliche Angaben |
|---|---|---|
| `skyline` | Stadt von außen, unser Turm | `licht` (oberstes Fenster an), `heli`, `regen`, `fahrt` |
| `hochhaus` | Querschnitt mit 24 Etagen | `etage=24`, `bis_etage=1`, `zombies="1-8"`, `barrikade=20`, `wasser=voll/weg`, `druck=6`, `aufzug=14`, `strom=false`, `horde=12`, `laerm_x=880`, `tank=0.6` |
| `wohnung` | Wohnung im 24. Stock | `licht=an/aus/kerze`, `vorhang=zu/schliesst`, `hahn=an/tropft`, `vorraete=6`, `objekt=topf`, `barrikade`, `klebeband` |
| `bad` | Badewanne, Toilette | `fuell=0.1 fuell_bis=0.8`, `liter=150`, `hahn=an/tropft`, `licht=kerze` |
| `treppenhaus` | Brandschutztür, Etagennummer | `etage=20`, `barrikade` / `barrikade=baut`, `zombies`, `klopfen`, `licht=an` |
| `strasse` | Läden, Autos, Horde | `horde=10`, `laerm_x=800`, `alarm`, `figur_x=200` |
| `dach` | Tank, Regentonnen, SOS | `tank=0.7`, `tonnen=false`, `regen`, `sos` / `sos=malt`, `signal`, `heli` / `heli=kommt` |
| `objekt` | Infokarte mit Icons | `objekte="badewanne:150 Liter\|boiler:80 Liter"`, `gross="Überschrift"`, `durchgestrichen=feuer`, `farbe=#hex` |
| `karte` | Stadtplan | `route="haus>apotheke"`, `horden=supermarkt,bruecke`, `orte=haus,apotheke,stadion` |
| `gesicht` | Nahaufnahme, unscharfer Hintergrund | `ort=wohnung/treppenhaus/dach/bad/strasse`, `licht=kerze/taschenlampe` |
| `titel` | Titelkarte | `oben=`, `gross=` (Zeilenumbruch mit `\|`), `unten=`, `groesse=`, `knopf="Jetzt auf dem Profil"` |

**Allgemein:**
- **Figuren:** `du`, `lena`, `mila`, `walter`, `kai`, `pilotin`, `zombie3` … Für Posen oder Ausdrücke pro Figur: `lena:psst`, `walter:besorgt`.
- **Ausdrücke:** `neutral froh traurig schreck angst wuetend muede entschlossen besorgt misstrauisch`
- **Posen:** `steht winkt zeigt zeigt_links zeigt_hoch haende_hoch angst psst denkt huefte traegt taschenlampe lauscht geht rennt`
- **Tageszeit:** `tag morgen abend nacht`
- **Kamera:** `ruhig zoom-rein zoom-raus schwenk-hoch schwenk-runter schwenk-links schwenk-rechts nah fahrt` oder exakt mit `fokus=540,900 zoom=1.2 fokus_bis=… zoom_bis=…`
- **Effekte:** `staub asche schnee wackeln=1 blitz alarm blende dauer=3 hud=false`
- **Icons:** wasserflasche kanister badewanne boiler eimer topf kerze taschenlampe dose funkgeraet powerbank medizin wecker plane kocher decke tropfen ohr auge gluehbirne toilette spuelkasten feuer kreuz batterie zombiekopf regen solar schluessel rucksack treppe uhr herz muell

## Stimme, Hintergrund und Geräusche (kostenlos)

```bash
pip install -r requirements.txt                 # einmalig (Python 3, dazu ffmpeg)
python -m ton.folge episoden/folge-01.txt       # Stimme + Hintergrund für Folge 1
python -m ton.pruefen folge-01                  # Lautheit und Abstand Stimme/Hintergrund messen
```

`ton.folge` macht den Ton im Stil der Vorlage (Hochkant-Kurzgeschichte):

- **Erzählstimme** pro Einstellung als `audio/folge-XX/NNN.mp3`: eine tiefe, trockene, zügige Stimme
  (kostenlose Microsoft-Neural-Stimme „Conrad“, +18 % Tempo). Auch Zitate spricht der Erzähler – wie in der Vorlage.
  Die Betonung richtet sich nach dem Ausdruck in der Klammer (`schreck`, `besorgt` …) oder nach `emotion=…`.
- **Wortzeiten** als `audio/folge-XX/NNN.json` – `render.mjs` legt die Untertitel damit exakt auf die Stimme.
- **Hintergrund** als `musik/folge-XX.mp3`: kein Drone und kein Rauschen (alter Teppich nur mit `--drone`), an jeder Kapitelgrenze (`== … ==`)
  ein harter **Stille-Schnitt**, dazu leise Geräusche passend zum Bild (Warnsignale wie Alarm, Sirene, Wecker etwas lauter) (`alarm`, `klopfen`, `blitz`/„Klack“,
  `hahn=…`, `fuell_bis`, Schritte, Handy …). Pro Einstellung: `ton=zombie,wind` oder `ton=aus`.
- Im Drehbuch werden `@musik musik/folge-XX.mp3`, `@musik_lautstaerke 1` und `@whoosh aus` gesetzt.

**Natürlichere Stimme mit Gemini** (kostenlos 10 Anfragen/Tag – reicht für eine Folge, zwei Kapitel pro Anfrage):

```bash
python -m ton.folge episoden/folge-01.txt --stimme gemini:Orus   # oder gemini:Algenib
python -m ton.folge episoden/folge-03.txt --stimme gemini:Orus --anfragen 4   # Kapitel auf genau 4 Anfragen verteilen
```

Gemini liefert keine Wortzeiten; die ermittelt eine lokale Spracherkennung (faster-whisper) und schneidet daran
auch die Einstellungen. Fertiges Rohaudio liegt im Cache, ein zweiter Lauf kostet keine Anfrage.

Danach pushen – GitHub rendert wie gewohnt. Wer lieber eine andere Stimme nutzt (ElevenLabs, eigene Aufnahme):
einfach `audio/folge-XX/NNN.mp3` ersetzen; ohne `NNN.json` verteilt der Renderer die Wörter wie bisher nach Länge.
