# Kurzvideos („taeglich“) – Format

Jonathans Auftrag vom 1.11.2026: Alle **2 Tage** ein neues, eigenständiges Kurzvideo, aufgebaut wie bei sehr großen YouTube-Kanälen. Die Kulissen wechseln, der Stil bleibt gleich. Die Stimmung wechselt zwischen düster, freudig, traurig und warm. Manchmal geht es darum, wie wichtig Zeit mit Freunden und Familie ist. Jedes Video soll **dich direkt betreffen**. Es gibt **keine Quizze und keine Fragen ans Publikum**.

Diese Datei ist verbindlich für die geplante Aufgabe. Außerdem gelten alle offenen GitHub-Issues mit Label `dringlich`.

## Rhythmus und Länge

- Ein Video pro Lauf, alle 2 Tage.
- **40–58 s** fertige Länge (Stimme ca. 110–140 Wörter, 12–18 Einstellungen). Das ist ein Post pro Plattform und wird nicht gekürzt oder geteilt (Issue #4/#9: unter 90 s ein Post).
- Posten am selben Tag: **TikTok + Instagram 18:00, YouTube 18:30** (Europe/Berlin). Ist die Zeit belegt, schiebt `veroeffentlichen.py` in 30-Minuten-Schritten weiter. Ist es für heute zu spät (nach 17:30 fertig), am nächsten Tag 18:00.

## Vorbilder: Aufbau übernehmen, nie Inhalte

Jedes Mal **einen** großen Kanal als Vorbild für den *Aufbau* wählen (Hook-Art, Tempo, Wendung, Schluss) und kurz recherchieren, was dort gerade gut läuft (WebSearch, z. B. „<Kanal> most viewed shorts 2026“). Nie eine bestimmte Folge nachbauen, keine Titel, Figuren, Geschichten oder Formulierungen übernehmen.

| Kanal | Was wir vom Aufbau lernen |
|---|---|
| Kurzgesagt – In a Nutshell | Eine überraschende Zahl über *dein* Leben, ruhige Steigerung, am Ende Hoffnung statt Angst |
| Zack D. Films | „Was passiert, wenn du …“: Szenario in der ersten Sekunde, Schnitt alle 1,5–3 s, harte Steigerung, Pointe in der letzten Zeile |
| Psych2Go | Psychologie über dich: kleine Zeichen im Alltag, die etwas Großes bedeuten |
| The Infographics Show / What If | Gedankenexperiment, das Schritt für Schritt eskaliert |
| Jaiden Animations, illumeably | Persönliche Geschichte mit Humor oder Traurigkeit, ein konkreter Moment statt allgemeiner Sätze |
| Dhar Mann | Klare Folge einer Entscheidung, Wendung, Lehre (bei uns nie belehrend, nur zeigen) |
| Wait But Why („The Tail End“) | Lebenszeit sichtbar machen: Tage, Wochen, Sommer, die du noch hast |
| MrBeast (Shorts) | Erste Sekunde = stärkstes Bild, nie langsam anfangen, jede Einstellung bringt etwas Neues |

## Bauplan (12–18 Einstellungen)

1. **Hook** (Einstellung 1, gesprochen höchstens ca. 3 s): eine Du-Aussage, die trifft oder überrascht. Keine Begrüßung, kein Titel und keine Titelkarte am Anfang.
2. **Wiedererkennen** (2–4): ein Alltagsmoment, den jeder kennt (Handy im Bett, „Gleich!“, Schulweg, Gruppenchat).
3. **Steigerung** (3–5): eine Zahl, eine Rechnung, eine Folge oder ein Konflikt. Jede Einstellung bringt etwas Neues.
4. **Wendung** (1–2): der Moment, in dem es kippt.
5. **Schluss** (2–3): ein Gefühl und ein kleiner, konkreter Schritt. Die letzte Zeile ist kurz und stark, gern als Loop zum Anfang.

**Verboten:** Fragen ans Publikum („Was hättest du gemacht?“, „Schreib es in die Kommentare“, „Was ist richtig?“), Quiz und Check (Issue #8). Ebenso „Echter Fakt“ (Issue #2) und Erfundenes, das als Tatsache verkauft wird. Schätzungen werden als Schätzung gesagt („Wenn es so kommt …“). Fragen der Figuren in der Handlung sind erlaubt. Nicht predigen: zeigen statt belehren. Kein Suizid, keine Selbstverletzung, keine Essstörungen und keine Gewalt gegen Kinder als Thema. Tod und Abschied (Oma, Haustier, Freundschaft) nur behutsam.

**Sprache:** Du-Erzählung, kurze Sätze, gesprochenes Deutsch, Zahlen als Wörter („achtzehn“). `*Wort*` hebt ein Wort hervor. Text in „…“ ist ein Zitat (Mund bewegt sich).

## Stimmungen (abwechseln!)

| Stimmung | `@stimmung` (Vortrag) | Bild | Typische Themen |
|---|---|---|---|
| düster | `duester` | `@look 0.9`, `nacht`/`abend`, `regen`, `vignette=0.7`, `haltestelle`, `zimmer licht=aus` | Was dein Handy nachts mit dir macht, der Tag, an dem niemand anruft, Angst vor der Zukunft |
| spannend | `spannend` | `@look 0.7`, `nacht`, `wackeln=0.4`, schnelle Schnitte | Was wäre, wenn …, Entscheidung in letzter Sekunde |
| traurig | `traurig` | `@look 0.6`, `abend`, `jahreszeit=herbst blaetter`, `regen`, `krankenhaus` | Der letzte Besuch bei Opa, der Freund, mit dem du nicht mehr schreibst |
| freudig | `freudig` | `@look 0.1`, `tag`/`morgen`, `jahreszeit=sommer`, `see`, `lichter` (nur abends sichtbar schön) | Der beste Sommertag, kleine Dinge, die dein Leben besser machen, Mut |
| warm (Freunde/Familie) | `warm` | `@look 0.35`, `abend`, `licht=an`, `kerzen`, `lichterkette`, `esstisch`, `wohnzimmer` | Zeit mit Eltern, Großeltern, Geschwistern, alten Freunden |

**Regeln für den Wechsel** (aus `verlauf.json` ablesen):
- Nie zweimal hintereinander dieselbe Stimmung.
- In 5 Videos mindestens 4 verschiedene Stimmungen.
- Etwa jedes 2. bis 3. Video hat die Botschaft „Zeit mit Freunden/Familie“, aber jedes Mal aus einem anderen Blickwinkel (Eltern, Großeltern, Geschwister, beste Freunde, alte Freunde, Haustier). Das darf auch in einer düsteren oder traurigen Geschichte stecken.
- Thema und Hook dürfen sich nicht wiederholen.

## Kulissen

Neu für die Kurzvideos (`engine/alltag.js`, Katalog: `taeglich/episoden/katalog.txt`):

| Typ | Zeigt | Angaben |
|---|---|---|
| `wohnzimmer` | Sofa, Fenster, Stehlampe, Familienfotos | `licht=an`, `tv`, `sofa_sitzen`, `foto="mama,papa,du"`, `aussen=stadt`, `vorhang=false` |
| `zimmer` | Jugendzimmer: Bett, Schreibtisch, Poster | `im_bett=du`, `lichterkette`, `laptop`, `licht=an/aus`, `decke=#hex` |
| `esstisch` | Familie am Tisch unter der Hängelampe | `leer=2` (Stuhl 2 bleibt leer), `gedeckt`, `kerzen`, `torte`, `licht=aus` |
| `park` | Weg, Bäume, Bank, Laterne | `jahreszeit=sommer/herbst/winter/fruehling`, `sitzen` (auf der Bank), `bank=false` |
| `klassenzimmer` | Tafel, Uhr, Pulte | `tafel="Zeile 1\|Zeile 2"`, `uhr=11:55`, `uhr_laeuft`, `pulte=false` |
| `krankenhaus` | Bett mit Patient, Monitor, Blumen | `patient=opa`, `monitor=flach/aus`, `jalousie=false` |
| `see` | Steg, Berge, Sonnenuntergang | `sitzen`, Standard `abend` |
| `haltestelle` | Bushaltestelle, Laterne, Pfützen | `bus=kommt`, Standard `nacht` |

Überall: `regen`, `blaetter`, `lichter`, `gluehwuermchen`, `zeit` (`tag morgen abend nacht`), `wand=#hex`. Nahaufnahmen: `[gesicht du ort=park jahreszeit=herbst traurig]` (jede Kulisse geht als `ort`). Für alle Kulissen gibt es außerdem `objekt` (Infokarte mit Icons), `titel` (Textkarte), `handy`, `strasse`, `skyline`, `supermarkt`, `bahnhof`, `kueche`, `bad`, `dach` (ohne Zombies, Rauch mit `rauch=false` aus). Pose `du:handy` zeigt dich mit Handy.

**Abwechslung:** Jedes Video zeigt mindestens 3 verschiedene Kulissen. Die Hauptkulisse (die häufigste) ist eine andere als im letzten Video. Fehlt für eine Geschichte ein Ort (Strand, Auto, Kinderzimmer früher, Fußballplatz, Kino …), darfst du **pro Lauf höchstens eine** neue Kulisse in `engine/alltag.js` bauen. Dabei gilt: gleicher Stil (Flat-Vektor, keine Konturen, weiche Schattierung, gedämpfte Farben, `A.figurenZeigen(s, t, ~1630, 0.95)`), in den Katalog eintragen, Standbilder ansehen. „24. Stock“, „Der Alien“ und „Der letzte Mann“ dürfen sich nicht verändern: nur neue Kulissen-Namen, keine bestehenden ändern.

## Figuren

`taeglich/figuren.json`: `du` (immer du, der Zuschauer), `mama`, `papa`, `oma`, `opa`, `lina` (kleine Schwester), `ben` (bester Freund), `mia` (Freundin), `lehrerin`, `fremder`. Die Besetzung bleibt in allen Videos gleich. So erkennen Zuschauer sie wieder. Neue Figuren nur dort ergänzen.

## Ablauf eines Laufs

```bash
pip install -q -r requirements.txt && npm ci --ignore-scripts --no-audit --no-fund
export CHROMIUM=/opt/pw-browsers/chromium            # Browser der Sitzung (sonst fehlt Playwrights Chromium)
# 1. Drehbuch schreiben: taeglich/episoden/video-NNN.txt (nächste freie Nummer) + Eintrag in taeglich/verlauf.json
node render.mjs taeglich/episoden/video-NNN.txt --bilder                 # 2. Standbilder ansehen, bis alles sauber ist
python -m ton.folge taeglich/episoden/video-NNN.txt --stimme gemini:Orus --anfragen 1   # 3. Stimme
python taeglich/stimme_pruefen.py taeglich/episoden/video-NNN.txt         # 4. jede Einstellung gegen den Text (muss OK sagen)
node render.mjs taeglich/episoden/video-NNN.txt                           # 5. Video rendern
python taeglich/veroeffentlichen.py video-NNN --zeit YYYY-MM-DDT18:00     # 6. Lautheit, Prüfung, Ablage, Posts einplanen
git add -A taeglich engine && git commit && git push -u origin taeglich   # 7. Stand sichern
```

- Drehbuchkopf: `# Titel`, `@stimmung …`, `@mund zitate`, `@look …`, `@zeit …`. Über jeder Zeile steht ein `// Bildbeschreibung`.
- Meldet `stimme_pruefen.py` einen Fehler: mit genauerem Hinhören prüfen. Ist es wirklich falsch, die Zeile eindeutiger formulieren und die Stimme neu erzeugen (eine Gemini-Anfrage).
- **Standbilder prüfen:** Gesichter nicht unter den Untertiteln, nichts am Rand abgeschnitten, kein Durchscheinen, Text lesbar, jede Einstellung passt zum Satz.
- Gemini-Kontingent bei allen Schlüsseln aufgebraucht: nichts posten, Jonathan Bescheid geben.

## Untertitel, Beschreibung, Hashtags

`verlauf.json` → `titel` (kurz, neugierig, ohne Frage), `beschreibung` (1–2 Sätze, Hook aufgreifen, **keine Frage ans Publikum**), `hashtags` (5–8, deutsch + `#animation #story #storytime`), `tags` (YouTube), `emoji` (eins, passend zur Stimmung). `veroeffentlichen.py` baut daraus die Texte für TikTok (`#fyp`), Instagram (`#reels`) und YouTube (`#shorts`).

## Themenspeicher (Ideen, nicht verpflichtend)

- warm: Der Anruf, den du immer verschiebst (Oma) · Die Sommer, die du mit deinen Freunden noch hast · Dein Geschwister erinnert sich an Dinge, die du vergessen hast · Papa fragt „Wie war's?“ und du sagst „Gut.“
- traurig: Der letzte Tag, an dem ihr alle zusammen gespielt habt, und niemand wusste es · Opas Stuhl · Der Gruppenchat, der still wurde
- freudig: Der Tag, an dem du Ja gesagt hast statt Nein · Ein Fremder, der deinen Tag gerettet hat · Was 10 Minuten am Tag in einem Jahr aus dir machen
- düster: Was um 3 Uhr nachts in deinem Kopf passiert · Der Tag ohne Handy · Wenn niemand merkt, dass du fehlst (behutsam, mit Hoffnung am Ende)
- spannend: Du hast 10 Sekunden, um dich zu entscheiden · Der Bus fährt ohne dich · Was wäre, wenn du heute alles sagst, was du denkst
