# Animierte Serie – „24. Stock“

Animierte Story-Videos im Hochformat (1080×1920) für TikTok, Reels und Shorts, im sauberen Flat-Vektor-Stil. Jede Folge ist eine **einfache Textdatei** in `episoden/`. Daraus entsteht automatisch das fertige Video mit Figuren, Kamerafahrten, Wort-für-Wort-Untertiteln, HUD, Licht, Effekten, Musik und Stimme.

- `serienplan.md`: Staffelplan, Figuren, Cliffhanger
- `figuren.json`: alle Figuren. Sie sehen in jeder Folge gleich aus.
- `episoden/folge-XX.txt`: die Drehbücher
- `engine/`: die Animation (Figuren, Szenen, Objekte)
- `render.mjs`: rendert eine Folge zur MP4
- `der-alien/`: zweite Serie „Der Alien“ (Serienbibel, Storylines, Figuren)

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
node render.mjs episoden/folge-01.txt --teile     # zusätzlich Teile für TikTok/Insta (je max. 59 s)
node render.mjs episoden/folge-01.txt --teile-plan  # nur anzeigen, wie geteilt wird
```

## Teile für TikTok und Instagram

Mit `--teile` wird die fertige Folge in Clips von **höchstens 1 Minute** zerlegt: `ausgabe/folge-02-teil-1.mp4`, `folge-02-teil-2.mp4` … und eine Liste `folge-02-teile.txt` (Teil 1/6, Zeiten, Kapitel). Inhalt, Bild und Ton bleiben unverändert. Geschnitten wird nur an Kapitelgrenzen (`== … ==`), mit möglichst wenigen und etwa gleich langen Teilen. Die Länge richtet sich nach der echten Szenenlänge, mit Stimme also nach den Audiodateien. Andere Grenze: `--max 89`. GitHub macht das bei jedem Render automatisch, die Teile liegen mit im Release.

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
| `titel` | Titelkarte | `oben=`, `gross=` (Zeilenumbruch mit `\|`), `unten=`, `groesse=` |

**Allgemein:**
- **Figuren:** `du`, `lena`, `mila`, `walter`, `kai`, `pilotin`, `zombie3` … Für Posen oder Ausdrücke pro Figur: `lena:psst`, `walter:besorgt`.
- **Ausdrücke:** `neutral froh traurig schreck angst wuetend muede entschlossen besorgt misstrauisch`
- **Posen:** `steht winkt zeigt zeigt_links zeigt_hoch haende_hoch angst psst denkt huefte traegt taschenlampe lauscht geht rennt`
- **Tageszeit:** `tag morgen abend nacht`
- **Kamera:** `ruhig zoom-rein zoom-raus schwenk-hoch schwenk-runter schwenk-links schwenk-rechts nah fahrt` oder exakt mit `fokus=540,900 zoom=1.2 fokus_bis=… zoom_bis=…`
- **Effekte:** `staub asche schnee wackeln=1 blitz alarm blende dauer=3 hud=false`
- **Icons:** wasserflasche kanister badewanne boiler eimer topf kerze taschenlampe dose funkgeraet powerbank medizin wecker plane kocher decke tropfen ohr auge gluehbirne toilette spuelkasten feuer kreuz batterie zombiekopf regen solar schluessel rucksack treppe uhr herz muell

## Stimme

Pro Einstellung eine Audiodatei mit genau dem Text der Zeile, z. B. mit ElevenLabs über Shotstack, als eigene Aufnahme oder aus einem anderen TTS. Gespeichert als `audio/folge-01/001.mp3`, `002.mp3` … Die Nummer entspricht der Reihenfolge der `[…]`-Zeilen.
