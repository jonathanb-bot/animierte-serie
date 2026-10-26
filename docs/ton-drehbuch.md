# Ton-Drehbuch (`ton.yaml`)

Jede Folge hat ein Ton-Drehbuch. Daraus baut `python -m ton` Stimme, Musik, Geräusche, Atmo,
Untertitel, HUD und Timing. Die Zeitachse ergibt sich von selbst: Zeilen laufen nacheinander ab.

## Serien-Stil („kurzgeschichte“) – nach der Vorlage eingemessen

Die Vorlage (Hochkant-Kurzgeschichte, ~12 s analysiert) klingt so – und genau so ist der Standard-Stil eingestellt:

| Vorlage | Umsetzung |
|---|---|
| **eine** tiefe Erzählstimme (~110 Hz), trocken, nah, keine Figurenstimmen – Zitate spricht der Erzähler | `de-DE-ConradNeural`, kein Hall, Zitate einfach in den Erzähltext |
| zügig: ~4 Wörter/s, Pausen ~0,4–0,8 s | Tempo +18 %, Emotionen ändern das Tempo nur halb so stark |
| durchgehender dunkler Drone auf A, fast ohne Höhen, ~12 dB unter der Stimme, kaum Ducking | Musik `dunkel` (Spannung: `dunkel_puls`) |
| harte **Stille-Schnitte** beim Szenenwechsel (alles fällt auf digitale Stille) | `- schnitt: 0.45` |
| kaum Geräusche | Geräusche leise und sparsam (`sfx` nur für Schlüsselmomente) |
| Wort-für-Wort-Untertitel, GROSS, dunkle Box, aktuelles Wort unterstrichen, Schlüsselwörter orange/gelb | automatisch; `*Wort*` = orange, `_Wort_` = gelb |
| große orange Einblendung („ZU SCHMAL“) | `- einblendung: "Zu schmal"` |
| HUD oben links: „☀ TAG 4 \| 10:05“ + Statusbalken | `hud:` pro Kapitel |
| Hochkant 9:16, −14 LUFS | Standard |

Der alte Stil mit Figurenstimmen, Raumhall und komponierter Musik bleibt mit `stil: hoerspiel` verfügbar.

### Schreibregeln

1. **Du-Form, Präsens.** „Du hörst Schritte.“ – nicht „Er hörte Schritte.“
2. **Kurze Sätze, 2–8 Wörter.** Ein Gedanke pro Satz. Details als Ein-Wort-Sätze: „Eine junge Stimme. *Heiser*.“
3. **Fakten knapp und konkret:** Zahlen, Namen, Uhrzeiten („Er heißt _Ben_. Er ist _19_.“).
4. **Zitate spricht der Erzähler** direkt mit: „Bitte, ich bin allein.“
5. **Pro Satz höchstens ein markiertes Schlüsselwort** – Gefahr `*…*` (orange), Namen/Zahlen/Lösungen `_…_` (gelb).
6. **Szenenwechsel = Stille-Schnitt** (`schnitt: 0.45`), danach sofort weiter sprechen.
7. Pro Kapitel höchstens 1–2 **Einblendungen** mit 1–3 Wörtern.
8. Jede Folge endet mit dem **Überlebens-Check** (siehe unten).

## Beispiel

```yaml
titel: "24. Stock – Folge 2: Wasser"
stil: kurzgeschichte          # Standard; alternativ: hoerspiel
format: hochkant              # hochkant (1080×1920, Standard) | quer (1920×1080)
video: folge-02.mp4           # optional: Video ohne Ton, wird mit dem Ton zusammengeführt
untertitel_einbrennen: true   # Standard im Serien-Stil

kapitel:
  - titel: Der Hahn
    musik: dunkel
    hud: {tag: 2, uhr: "07:12", uhr_bis: "07:15", anzeige: "Wasser", wert: 0.7, text: "70 %"}
    ablauf:
      - erzaehler: "Tag zwei. Du drehst den Hahn auf."
      - sfx: wasser_stockt
      - erzaehler: "Nichts. Nur ein *Gurgeln*."
        emotion: spannend
      - einblendung: "Kein Wasser"
      - schnitt: 0.45
      - erzaehler: "Gut, dass du gestern die _Badewanne_ gefüllt hast."
```

## Bausteine im `ablauf`

| Eintrag | Wirkung |
|---|---|
| `erzaehler: "Text"` | Zeile sprechen. Optional: `emotion`, `pegel` (dB), `luecke`, `parallel: true`, `versatz` |
| `sfx: name` | Geräusch, läuft parallel. Optional: `dauer`, `pegel`, `ort`, `pan`, `versatz`, `warten: true`, `parameter: {…}` |
| `pause: 1.5` | Stille in der Stimme (Drone läuft weiter) |
| `schnitt: 0.45` | **Stille-Schnitt:** alles hart auf digitale Stille, dann hart weiter |
| `einblendung: "Text"` | große Texteinblendung oben. Optional: `farbe: orange\|gelb`, `dauer`, `versatz` |
| `atmo: name` / `atmo_stop: name` | Hintergrundgeräusch ab hier starten / beenden |
| `musik_aus: 0.3` | Musik in 0,3 s ausblenden (bleibt bis Kapitelende aus) |
| `hoehepunkt: true` | Schlag der `titel`-/`cliffhanger`-Musik (nur Stil `hoerspiel`) |
| `bei: 12.0` | Springe auf Sekunde 12 im Kapitel (zum Synchronisieren mit fertigem Video) |

Kapitel-Optionen: `titel`, `musik`, `musik_pegel`, `ort`, `atmo`, `hud`, `dauer` (Mindestlänge),
`start` (absolute Startzeit in der Folge), `vorlauf`, `nachlauf`.

**HUD** (`hud:`): `tag`, `uhr` (Uhrzeit am Kapitelanfang), `uhr_bis` (läuft bis Kapitelende hoch),
`anzeige` (Name des Balkens, z. B. Wasser, Akku, Essen), `wert` (0–1), `text` (z. B. „70 %“).
Werte gelten weiter, bis ein Kapitel sie ändert; `hud: aus` blendet das HUD aus.

**Emotionen** (wirken im Serien-Stil gedämpft): `erzaehlend` (Standard), `neutral`, `ruhig`, `ernst`, `spannend`,
`dramatisch`, `leise`, `aufgeregt`, `panisch`, `froh`, `erleichtert`, `traurig`, `wuetend`, `fragend`,
`erklaerend`, `cool`. `...` im Text = lange Pause, `?` hebt die Stimme.

**Weitere Sprecher** sind möglich (`sprecher:` mit `stimme`, `tempo`, `hoehe`, `pan`, `im_raum`), die Vorlage
nutzt aber nur den Erzähler. Kostenlose Stimmen: `de-DE-ConradNeural`, `de-DE-KillianNeural`,
`de-DE-FlorianMultilingualNeural`, `de-DE-SeraphinaMultilingualNeural`, `de-DE-KatjaNeural`, `de-DE-AmalaNeural`.

## Musik

- Serien-Stil: `dunkel` (Standard), `dunkel_puls` (Spannung, tiefer Puls)
- Weitere: `titel`, `rueckblick`, `tag`, `erklaeren`, `abend`, `nacht`, `spannung`, `action`, `traurig`,
  `hoffnung`, `cliffhanger`, `outro`, `keine`

## Geräusche & Atmos

`python -m ton --liste` zeigt alles. Auswahl:

- **Wohnung:** wecker, wecker_klingel, handy_vibration, kein_netz, stromausfall, strom_an, tuer_klopfen, tuer_zu,
  schloss, taschenlampe, streichholz, glas_klirren, dose_oeffnen, rucksack, papier, schreiben
- **Wasser:** wasserhahn, wasser_stockt, badewanne, tropfen, eingiessen, spuelung
- **Hochhaus:** schritte (`parameter: {boden: beton|holz|metall, rennen: true}`), treppenhaus_tuer, aufzug_ding,
  aufzug_steckt, haemmern, moebel_ruecken
- **Draußen:** autoalarm (`entfernung`), sirene_fern, hubschrauber, donner, hund_fern
- **Zombies:** zombie, zombie_kratzen, zombie_horde (Atmo, `dichte`, `entfernung`)
- **Signale:** sos_pfeife, sos_licht, funk_klick
- **Schnitt/Grafik:** whoosh, riser, hit, ui_pop, ui_ding
- **Atmos:** stille_raum, kuehlschrank, kerze_knistern, feuer, treppenhaus_atmo, wind, regen, stadt_fern,
  zombie_horde, herzschlag, atmen, funk_rauschen

Räume (`ort`): trocken, wohnung, bad, flur, treppenhaus, keller, draussen, dach, halle.

## Feste Teile jeder Folge

1. **Was bisher geschah** (ab Folge 2) – 2–4 kurze Sätze, dann `schnitt`.
2. **10 Kapitel** der Handlung.
3. **Cliffhanger** – `musik: dunkel_puls`, letzter Satz mit Wendung, dann `schnitt: 0.6`.
4. **Überlebens-Check** – `hud: aus`, Einblendung „Überlebens-Check“, immer mit diesen Fragen:
   - „Was denkst du: Was passiert als Nächstes?“
   - „Und wie würdest du reagieren? A: … B: … C: …“
   - „Schreib es in die Kommentare.“

Vorlage: [`folgen/vorlage/ton.yaml`](../folgen/vorlage/ton.yaml) · Hörprobe: [`folgen/demo/ton.yaml`](../folgen/demo/ton.yaml)

## Ausgabe (`<folge>/ausgabe/`)

| Datei | Inhalt |
|---|---|
| `ton.wav` | fertige Tonspur, −14 LUFS, Spitzen ≤ −1 dBTP (YouTube/TikTok-tauglich) |
| `stem_stimme.wav`, `stem_musik.wav`, `stem_geraeusche.wav` | Einzelspuren zum Nachmischen |
| `untertitel.ass` | Wort-für-Wort-Untertitel + HUD + Einblendungen im Serien-Look |
| `untertitel.srt` | satzweise Untertitel zum Hochladen (zuschaltbar) |
| `timing.json` | Start/Ende jedes Kapitels, jeder Zeile, jedes Satzes und **jedes Wortes**, dazu Schnitte, Einblendungen, HUD – damit kann der Video-Renderer Szenen, Mundbewegungen und Grafiken an die Stimme anpassen |
| `<video>_mit_ton.mp4` | wenn `video` angegeben: Video + Ton (+ eingebrannte Untertitel/HUD) + zuschaltbare Untertitel |
| `vorschau.mp4` | mit `--vorschau`: Prüfvideo ohne Animation, aber mit Untertiteln/HUD |
