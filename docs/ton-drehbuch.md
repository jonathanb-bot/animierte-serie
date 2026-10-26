# Ton-Drehbuch (`ton.yaml`)

Jede Folge hat ein Ton-Drehbuch. Daraus baut `python -m ton` Stimme, Musik, Geräusche, Atmo,
Untertitel und Timing. Die Zeitachse ergibt sich von selbst: Zeilen laufen nacheinander ab.

```yaml
titel: "24. Stock – Folge 2: Wasser"
video: folge-02.mp4          # optional: Video ohne Ton, wird mit dem Ton zusammengeführt

sprecher:
  erzaehler: {stimme: de-DE-FlorianMultilingualNeural}    # nah & trocken (kein Raumhall)
  nachbarin: {stimme: de-DE-SeraphinaMultilingualNeural, pan: -0.15}
  herr_berger: {stimme: de-DE-KillianNeural, hoehe: -6, tempo: -5}

kapitel:
  - titel: Was bisher geschah
    musik: rueckblick           # Stimmung (Liste unten) oder "keine"
    ort: wohnung                # Raumhall für Figuren und Geräusche
    atmo: [stadt_fern, {name: wind, pegel: -4}]
    ablauf:
      - erzaehler: "Text …"
        emotion: spannend
      - sfx: wecker             # läuft PARALLEL zur nächsten Zeile
      - sfx: stromausfall
        warten: true            # … oder: erst abspielen, dann weiter
      - pause: 1.0
      - nachbarin: "Hallo? Ist da wer?"
        emotion: fragend
```

## Bausteine im `ablauf`

| Eintrag | Wirkung |
|---|---|
| `<sprecher>: "Text"` | Zeile sprechen. Optional: `emotion`, `pegel` (dB), `ort`, `pan`, `versatz`, `parallel: true`, `luecke` |
| `sfx: name` | Geräusch. Optional: `dauer`, `pegel`, `ort`, `pan`, `versatz`, `warten: true`, `parameter: {…}` |
| `pause: 1.5` | Stille (Musik/Atmo laufen weiter) |
| `atmo: name` / `atmo_stop: name` | Hintergrund ab hier starten / beenden (z. B. Kühlschrank verstummt beim Stromausfall) |
| `hoehepunkt: true` | Hier fällt der Schlag von `titel`- bzw. `cliffhanger`-Musik |
| `musik_aus: 0.3` | Musik schlagartig (in 0,3 s) ausblenden – für plötzliche Stille |
| `bei: 12.0` | Springe auf Sekunde 12 im Kapitel (zum Synchronisieren mit fertigem Video) |

Kapitel-Optionen: `titel`, `musik`, `musik_pegel`, `intensitaet` (0–1), `ort`, `atmo`, `dauer` (Mindestlänge),
`start` (absolute Startzeit in der Folge), `vorlauf`, `nachlauf`, `hoehepunkt` (Sekunde im Kapitel).

`*Wort*` im Text ist erlaubt (wird ignoriert), `...` erzeugt eine lange Pause, `?` hebt die Stimme.

## Gegen eintönige Stimmen

- **Emotionen:** `erzaehlend` (Standard Erzähler), `neutral`, `ruhig`, `ernst`, `spannend`, `dramatisch`, `leise`,
  `aufgeregt`, `panisch`, `froh`, `erleichtert`, `traurig`, `wuetend`, `fragend`, `erklaerend`, `cool`
- Jede Zeile wird in Sätze zerlegt; jeder Satz bekommt eigenes Tempo/Tonhöhe (+ kleine Zufallsvariation).
- Emotion **pro Zeile wechseln** – lieber drei kurze Zeilen mit verschiedenen Emotionen als ein langer Absatz.
- Kostenlose Stimmen (Microsoft Edge Neural), am lebendigsten: `de-DE-FlorianMultilingualNeural`,
  `de-DE-SeraphinaMultilingualNeural`. Weitere: `de-DE-ConradNeural`, `de-DE-KillianNeural`, `de-DE-KatjaNeural`,
  `de-DE-AmalaNeural`, `de-AT-JonasNeural`, `de-AT-IngridNeural`, `de-CH-JanNeural`, `de-CH-LeniNeural`.

## Musik-Stimmungen

`titel`, `rueckblick`, `tag`, `erklaeren`, `abend`, `nacht`, `spannung`, `action`, `traurig`, `hoffnung`,
`cliffhanger`, `outro` – alle selbst komponiert (lizenzfrei). Das Serienmotiv „24. Stock“ steckt in
`titel`, `cliffhanger` und `outro`. Unter Sprache wird die Musik automatisch leiser (Ducking).

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

1. **Vorspann** – `musik: titel`, Schlag bei Sekunde 3, danach Folgentitel.
2. **Was bisher geschah** (ab Folge 2) – `musik: rueckblick`.
3. **10 Kapitel** der Handlung.
4. **Cliffhanger** – `musik: cliffhanger`, `hoehepunkt: true` direkt nach dem letzten Satz, dann 3–4 s Pause.
5. **Überlebens-Check** – `musik: outro`, immer mit diesen zwei Fragen an die Zuschauer:
   - „Was denkst du: Was passiert als Nächstes?“
   - „Und wie würdest du in dieser Situation reagieren?“ (gern mit Antwort A/B/C)
   - Aufforderung, es in die Kommentare zu schreiben.

Vorlage: [`folgen/vorlage/ton.yaml`](../folgen/vorlage/ton.yaml).

## Ausgabe (`<folge>/ausgabe/`)

| Datei | Inhalt |
|---|---|
| `ton.wav` | fertige Tonspur, −14 LUFS, Spitzen ≤ −1 dBTP (YouTube-tauglich) |
| `stem_stimme.wav`, `stem_musik.wav`, `stem_geraeusche.wav` | Einzelspuren zum Nachmischen |
| `untertitel.srt` | Untertitel, satzgenau |
| `timing.json` | Start/Ende jedes Kapitels, jeder Zeile und jedes Satzes – damit kann der Video-Renderer Szenenlängen und Mundbewegungen an die Stimme anpassen |
| `<video>_mit_ton.mp4` | wenn `video` angegeben: Video + Ton + zuschaltbare Untertitel |
| `vorschau.mp4` | mit `--vorschau`: Prüfvideo (Kapiteltitel + Untertitel) ohne Animation |
