# Kurzvideo-Staffeln („taeglich“) – Format

Jonathans Auftrag vom 1.11.2026:
- **Alle 2 Tage**, gestartet **nachts zwischen 23 und 1 Uhr**, entsteht **eine ganze Staffel**, nicht nur ein Video.
- **Posten:** alles **hinten an die bestehende Warteschlange anhängen**. Nichts läuft parallel.
- **Aufbau** wie bei sehr großen YouTube-Kanälen.
- **Kulissen** wechseln, in Richtung „Dinge Erklärt – Kurzgesagt“ (Vorbild-Video „KI hat das Undenkbare getan – Was jetzt?“): groß, leuchtend, mit Tiefe. Der Stil bleibt immer gleich.
- **Stimmung** wechselt: mal düster, mal fröhlicher oder trauriger, mal geht es darum, wie wichtig Zeit mit Freunden und Familie ist.
- Alles in Du-Form, es **betrifft dich direkt**. **Keine Quizze, keine Fragen ans Publikum.**

Diese Datei ist verbindlich für die geplante Aufgabe „Kurzvideo-Staffel alle 2 Tage“. Außerdem gelten alle offenen GitHub-Issues mit Label `dringlich`.

## Die Staffel

- **10 Folgen**, jede **65–85 s**. **Jedes Video muss über 1 Minute lang sein** (Jonathans dringende Vorgabe vom 1.11., Issue #12: TikTok zahlt im Creator Rewards Program ab 10.000 Followern nur für Videos über 1 Minute). Unter 90 s bleibt jede Folge ein einzelner Post auf Instagram und YouTube. Die Stimme hat ca. 170–210 Wörter, 18–26 Einstellungen. Ist eine Folge nach dem Vertonen kürzer als 62 s, schreib eine Einstellung dazu, statt zu dehnen.
- **Eine durchgehende Geschichte** in Du-Form mit eigenem Titel und eigener Welt. Jede Staffel bekommt ein neues Thema.
- **Jede Folge außer der letzten endet mit einem Cliffhanger, und zwar mit der letzten gesprochenen Zeile.** **Nie „Fortsetzung folgt“** (Jonathans feste Vorgabe vom 1.11., Issue #11): keine Karte, kein Text, kein Satz „Fortsetzung folgt“, auch nicht als Überschrift. Ebenso keine andere Endkarte.
- **Folge 10** schließt die Geschichte mit einer starken letzten Zeile, ebenfalls ohne Endkarte.
- **Folge 1** zeigt direkt nach dem Hook eine kurze Titelkarte (`[titel oben="Folge 1" gross="<STAFFELTITEL>" unten="<Folgentitel>" … dauer=1 hud=false]`). Ab Folge 2 steht im Hook in einem Satz, wo wir stehen. Es gibt keinen Rückblick „Was bisher geschah“ (#9).
- **Stimmungsbogen innerhalb der Staffel:** Jede Folge hat eine eigene Stimmung (`@stimmung`), über die Staffel gemischt, z. B. spannend → düster → freudig → traurig → warm. Mindestens 4 verschiedene pro Staffel, nie dreimal dieselbe hintereinander.
- **Freunde und Familie:** In jeder Staffel tragen mindestens 2 Folgen die Botschaft, wie wichtig Zeit mit Freunden und Familie ist. Das gehört zur Handlung und wird jedes Mal aus einem neuen Blickwinkel erzählt (Eltern, Großeltern, Geschwister, bester Freund, alte Freunde).
- **Hauptstimmung der Staffel** wechselt von Staffel zu Staffel (`staffeln.json` → `hauptstimmung`).

## Vorbilder: Aufbau übernehmen, nie Inhalte

Pro Staffel einen großen Kanal als Hauptvorbild wählen (abwechseln!) und kurz recherchieren, was dort gerade gut läuft (WebSearch). Nie eine bestimmte Folge nachbauen, keine Titel, Figuren, Geschichten oder Formulierungen übernehmen.

| Kanal | Was wir vom Aufbau lernen |
|---|---|
| Dinge Erklärt – Kurzgesagt | Eine große Frage über *dein* Leben oder die Zukunft, Zahlen, die treffen, ruhige Steigerung, Hoffnung am Ende. **Leitbild für die Kulissen.** |
| Zack D. Films | „Was passiert, wenn du …“: Szenario in der ersten Sekunde, Schnitt alle 1,5–3 s, harte Steigerung, Pointe in der letzten Zeile |
| Psych2Go | Psychologie über dich: kleine Zeichen im Alltag, die etwas Großes bedeuten |
| The Infographics Show / What If | Gedankenexperiment, das Schritt für Schritt eskaliert |
| Jaiden Animations, illumeably | Persönliche Geschichte mit Humor oder Traurigkeit, ein konkreter Moment statt allgemeiner Sätze |
| Dhar Mann | Klare Folge einer Entscheidung, Wendung, Lehre (bei uns nie belehrend, nur zeigen) |
| Wait But Why („The Tail End“) | Lebenszeit sichtbar machen: Tage, Wochen, Sommer, die du noch hast |
| MrBeast (Shorts) | Erste Sekunde = stärkstes Bild, nie langsam anfangen, jede Einstellung bringt etwas Neues |

## Bauplan einer Folge

1. **Hook** (Einstellung 1, gesprochen höchstens ca. 3 s): eine Du-Aussage, die trifft oder überrascht. Ab Folge 2 knüpft sie an den letzten Cliffhanger an.
2. **Wiedererkennen** (3–5): ein Moment, den jeder kennt.
3. **Steigerung** (6–9): eine Zahl, eine Folge oder ein Konflikt, gern mit einer zweiten Stufe. Jede Einstellung bringt etwas Neues.
4. **Wendung** (2–3).
5. **Cliffhanger** (1) als letzte Einstellung. Danach kommt nichts mehr, keine Karte „Fortsetzung folgt“.

**Verboten:** Fragen ans Publikum („Was hättest du gemacht?“, „Schreib es in die Kommentare“, „Was ist richtig?“), Quiz und Check (#8). Ebenso „Echter Fakt“ (#2) und Erfundenes, das als Tatsache verkauft wird: Fantasie-Szenarien werden als „Stell dir vor …“ erzählt, Schätzungen als Schätzung. Fragen der Figuren in der Handlung sind erlaubt. Nicht predigen. Kein Suizid, keine Selbstverletzung, keine Essstörungen und keine Gewalt gegen Kinder. Tod und Abschied nur behutsam.

**Sprache:** Du-Erzählung, kurze Sätze, gesprochenes Deutsch, Zahlen als Wörter. `*Wort*` hebt ein Wort hervor, „…“ ist ein Zitat (Mund bewegt sich).

## Look: Kurzgesagt-Richtung, viel Detail, hohe Bildqualität

**Jonathans Vorgabe (1.11., nach dem Katalog-Bild):** „Ja, diesen Stil auch bitte künftig, mehr Aufwand in die Details und generell die Bildqualität hoch halten.“ Das gilt für alle künftigen Videos und Staffeln.

- Jedes Drehbuch hat **`@qualitaet hoch`** (render.mjs: Einzelbilder JPEG 100, x264 slow/crf 16, Animations-Tuning, aq-mode 3 gegen Treppen in dunklen Verläufen), **`@kino 1`** (nur echte Lichter glühen, stehende Papier-Körnung) und `@look` nach Stimmung (düster 0.8–1, spannend 0.6, traurig 0.5, warm 0.35, freudig 0.1–0.2).
- Keine bewegte Körnung und kein Rauschen, das sich pro Bild ändert. Das verdreifacht die Datenrate und wird auf TikTok/Instagram/YouTube zu Matsch.
- **Detail-Prüfliste für jedes Bild:** Vorder-, Mittel- und Hintergrund sind erkennbar, mit Dunst nach hinten. Mindestens eine Lichtquelle mit Glühen. Schattenseite und Randlicht an großen Formen. Mindestens 3 kleine Detailelemente (Dachaufbauten, Pilze, Bücher, Lichterkette …). Etwas bewegt sich leise (Teilchen, Lichter, Wolken, Vögel). Keine leeren, flachen Flächen. Kontaktschatten unter Figuren und Möbeln.
- **Neue Kulissen** müssen das Detailniveau von `grossstadt`, `wald`, `landschaft` und `weltall` erreichen (Referenz in `engine/kurzgesagt.js`).
- **Bildkontrolle:** Neben den Standbild-Streifen pro Folge mindestens 3 Ausschnitte in voller Auflösung ansehen (`ffmpeg -vf crop=720:900:…`): Kanten sauber, keine Treppen in Verläufen, Text scharf, nichts verpixelt.
- **Jede Folge hat mindestens 2 große Kulissen** aus der Kurzgesagt-Reihe, dazu Alltagsorte für die Nähe. Pro Staffel mindestens 8 verschiedene Kulissen.
- Fehlt für die Geschichte ein Ort: **pro Lauf höchstens 2 neue Kulissen** in `engine/kurzgesagt.js` bauen. Im Stil heißt das: Ebenen mit Tiefe (hinten heller und dunstiger), Nebelbänder, Glühen (`glut`), Randlicht, gedämpfte Grundfarben mit leuchtenden Akzenten, keine Konturen. Danach in den Katalog eintragen, Standbilder ansehen und die alten Serien pixelgleich prüfen. Bestehende Kulissen nicht verändern, nur neue Namen.

**Kurzgesagt-Kulissen** (`engine/kurzgesagt.js`, Katalog: `taeglich/episoden/katalog-kurzgesagt.txt`):

| Typ | Zeigt | Angaben |
|---|---|---|
| `weltall` | Erde mit Atmosphäre, Nachtseite mit Stadtlichtern, Sterne, Nebel | `sonne`, `mond`, `satellit`, `erde=false`, `erde_y=…` |
| `grossstadt` | Skyline-Schichten mit Nebel, leuchtende Fenster, Lichtspuren | `zeit`, Figuren stehen auf einem Dach vorne |
| `rechenzentrum` | Serverhalle in Fluchtperspektive, LEDs, Bodennebel | `kern` (leuchtender KI-Kern), `farbe=#hex` |
| `auge` | Riesenauge mit Strahlen (wie das Vorschaubild) | `farbe=#hex`, `text="…"` (groß oben) |
| `landschaft` | Bergketten mit Dunst, Sonne, Vögel, Hügel vorne | `zeit`, `see`, `voegel=false`, `regen` |
| `wald` | Stämme in Schichten, Lichtstrahlen, schwebende Teilchen | `zeit`, `nebel` |
| `netz` | leuchtende Knoten mit wandernden Impulsen | `farbe=#hex`, `mitte=du` (Kopf im Zentrum) |
| `lebenszeit` | dein Leben in Wochen (90 × 52 Kästchen) | `jahre=16`, `markiert="16-18"`, `fuellen`, `oben="…"` |

**Alltags-Kulissen** (`engine/alltag.js`, Katalog: `taeglich/episoden/katalog.txt`): `wohnzimmer` (`licht=an`, `tv`, `sofa_sitzen`, `foto=…`), `zimmer` (`im_bett=du`, `lichterkette`, `laptop`), `esstisch` (`leer=2`, `gedeckt`, `kerzen`, `torte`), `park` (`jahreszeit=…`, `sitzen`), `klassenzimmer` (`tafel="…|…"`, `uhr=`), `krankenhaus` (`patient=opa`, `monitor=flach`), `see` (`sitzen`), `haltestelle` (`bus=kommt`). Überall: `regen`, `blaetter`, `lichter`, `gluehwuermchen`, `zeit`. Dazu `gesicht` (Nahaufnahme, jede Kulisse als `ort=`), `objekt` (Infokarte mit Icons), `titel`, `handy`, `strasse`, `supermarkt`, `bahnhof`, `kueche`. Pose `du:handy`.

## Stimmungen

| Stimmung | `@stimmung` | Bild |
|---|---|---|
| düster | `duester` | `@look 0.9`, `nacht`, `regen`, `auge`, `rechenzentrum farbe=#ff5a3d`, `haltestelle` |
| spannend | `spannend` | `@look 0.6`, `nacht`, `wackeln=0.4`, schnelle Schnitte, `grossstadt`, `netz` |
| traurig | `traurig` | `@look 0.5`, `abend`, `jahreszeit=herbst blaetter`, `regen`, `krankenhaus`, `landschaft zeit=abend` |
| freudig | `freudig` | `@look 0.15`, `tag`/`morgen`, `landschaft see`, `wald`, `park jahreszeit=sommer` |
| warm | `warm` | `@look 0.35`, `abend`, `licht=an`, `kerzen`, `lichterkette`, `esstisch`, `wohnzimmer`, `lebenszeit` |

## Figuren

`taeglich/figuren.json`: `du` (immer du), `mama`, `papa`, `oma`, `opa`, `lina` (kleine Schwester), `ben` (bester Freund), `mia` (Freundin), `lehrerin`, `fremder`. Neue Figuren einer Staffel nur dort ergänzen, mit Staffel-Vorsilbe (z. B. `s02_kapitaenin`). Die Grundbesetzung bleibt in allen Staffeln gleich, damit man sie wiedererkennt.

## Ablauf eines Laufs (nachts)

```bash
pip install -q -r requirements.txt && npm ci --ignore-scripts --no-audit --no-fund
export CHROMIUM=/opt/pw-browsers/chromium
# 1. Staffel planen: Eintrag in taeglich/staffeln.json (id sNN, titel, beschreibung, thema, hauptstimmung, vorbild,
#    hashtags, tags, emoji, folgen[{nr, titel, stimmung, beschreibung}], optional tiktok_teile an den stärksten Cliffhangern)
# 2. Alle 10 Drehbücher schreiben: taeglich/episoden/sNN-f01.txt … sNN-f10.txt
node render.mjs taeglich/episoden/sNN-fXX.txt --bilder        # 3. Standbilder JEDER Folge ansehen, korrigieren
python -m ton.folge taeglich/episoden/sNN-fXX.txt --stimme gemini:Orus --anfragen 1     # 4. Stimme (je Folge 1 Anfrage)
python taeglich/stimme_pruefen.py taeglich/episoden/sNN-fXX.txt                         # 5. muss OK melden
node render.mjs taeglich/episoden/sNN-fXX.txt                 # 6. rendern in hoher Qualität (ca. 6 min pro Folge, 2 gleichzeitig im Hintergrund)
python taeglich/staffel_veroeffentlichen.py sNN               # 7. prüfen, TikTok-Teile schneiden, ablegen, hinten anhängen
git add -A taeglich engine && git commit && git push -u origin taeglich                 # 8. sichern
```

- Kopf jedes Drehbuchs: `# <Staffeltitel> – Folge N: <Folgentitel>`, `@stimmung …`, `@mund zitate`, `@qualitaet hoch`, `@look …`, `@kino 1`, `@zeit …`. Über jeder Zeile steht ein `// Bildbeschreibung`.
- Gemini: 5 Schlüssel (Proxy + `GEMINI_API_KEY_2` … `_5`), je ca. 10 Anfragen am Tag. Sind alle erschöpft: nichts posten, die fertigen Folgen sichern, Jonathan Bescheid geben. Beim nächsten Lauf geht es mit dieser Staffel weiter.
- Meldet `stimme_pruefen.py` einen Fehler: genauer hinhören. Ist es wirklich falsch, die Zeile eindeutiger formulieren und die Folge neu vertonen.
- **Standbilder prüfen:** Gesichter nicht unter den Untertiteln, nichts am Rand abgeschnitten, nichts scheint durch, Text lesbar, jedes Bild passt zum Satz.

## Posten (hinten anhängen)

`staffel_veroeffentlichen.py` erledigt Folgendes:
- jede Folge auf ca. −15 LUFS bringen und prüfen (Ton da, so lang wie das Bild, > −24 LUFS, **62–89 s**; kürzer als 62 s wird nicht gepostet)
- die TikTok-Sammelteile schneiden (Standard 10 Folgen → Folge 1–3, 4–5, 6–8, 9–10, einfach aneinandergehängt; eine versehentliche „Fortsetzung folgt“-Karte würde überall herausgeschnitten) und prüfen
- alles auf `youtube-upload` ablegen (`taeglich/sNN-fXX.mp4`, `taeglich-tiktok/sNN-teil-N.mp4`, `geprueft.json`)
- alle Posts **pro Plattform hinter den letzten geplanten Post** hängen, im Takt TikTok 08:00/20:00, Instagram alle 4 Stunden, YouTube jeweils :30

IDs: `taeglich-tiktok-sNN-teil-N`, `taeglich-insta-sNN-fXX`, `taeglich-yt-sNN-fXX`. Bis der Workflow „Posts einplanen“ fertig ist, nichts auf `main` pushen. Danach im Log prüfen, dass alles mit ✓ eingeplant ist.

## Themenspeicher (Staffel-Ideen, nicht verpflichtend)

- **Wenn die KI alles kann:** Stell dir vor, eine KI kann über Nacht alles, was du kannst. Deine Schule, dein Traumjob, deine Freunde, und was keine Maschine ersetzt. (rechenzentrum, auge, netz, grossstadt)
- **Die letzten 1000 Sommer:** Lebenszeit, Freunde, die auseinanderziehen, der eine Sommer am See. (lebenszeit, see, landschaft, park)
- **Funkstille:** Weltweit fällt das Internet aus. Sieben Tage ohne Handy, und plötzlich redet deine Familie wieder. (grossstadt, haltestelle, esstisch, weltall)
- **Der Komet:** Ein Komet ist in 30 Tagen da. Was du mit der Zeit machst. (weltall, landschaft, wohnzimmer)
- **Dein 80-jähriges Ich:** Ein Brief von dir selbst aus der Zukunft. (lebenszeit, wald, krankenhaus, park)
- **Allein im Wald:** Verlaufen, eine Nacht, ein Weg zurück. (wald, landschaft)
- **Die Stadt, die nie schläft:** Großstadt, Einsamkeit, ein Fremder, der Freund wird. (grossstadt, haltestelle, netz)
- **Das Experiment:** Psychologie-Tricks, die dein Gehirn jeden Tag mit dir macht. (netz, auge, klassenzimmer)
