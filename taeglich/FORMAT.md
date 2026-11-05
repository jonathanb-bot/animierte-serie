# Kurzvideo-Staffeln („taeglich“) – Format

Jonathans Auftrag vom 1.11.2026:
- **Alle 2 Tage**, gestartet **nachts zwischen 23 und 1 Uhr**, entsteht **eine ganze Staffel**, nicht nur ein Video.
- **Posten:** alles **hinten an die bestehende Warteschlange anhängen**. Nichts läuft parallel.
- **Aufbau** wie bei sehr großen YouTube-Kanälen.
- **Kulissen** wechseln, in Richtung „Dinge Erklärt – Kurzgesagt“ (Vorbild-Video „KI hat das Undenkbare getan – Was jetzt?“): groß, leuchtend, mit Tiefe. Der Stil bleibt immer gleich.
- **Stimmung** wechselt: mal düster, mal fröhlicher oder trauriger, mal geht es darum, wie wichtig Zeit mit Freunden und Familie ist.
- Alles in Du-Form, es **betrifft dich direkt**. **Keine Quizze, keine Fragen ans Publikum.**
- **KI-Haken beim Posten immer aus** (Jonathans Vorgabe 2.11., Issue #15), besonders auf TikTok (`posten/zernio.mjs` auf `main`: `videoMadeWithAi: false`).

Diese Datei ist verbindlich für die geplante Aufgabe „Kurzvideo-Staffel alle 2 Tage“. Außerdem gelten alle offenen GitHub-Issues mit Label `dringlich`. **Jeder Lauf startet in einem neuen Chat** (Jonathans Vorgabe 1.11., wegen der Credits); die Abläufe stehen in `taeglich/laeufe/` (siehe README dort).

## Tempo (Jonathans Vorgabe 1.11. abends: bessere Analyse, mehr Videos pro Tag, damit es schneller geht)

- **Posten:** TikTok **4× am Tag (08, 12, 16, 20 Uhr)**, **Instagram alle 2 Stunden, YouTube jeweils :30** (Jonathans Vorgabe 2.11., Issue #14: höchstens 1 Tag hinter TikTok). Neue Posts weiterhin hinten anhängen.
- **Produktion jede Nacht um 23:44 prüfen (Jonathans Vorgabe 2.11., Issue #16):** `python taeglich/vorrat.py`. Erst wird der bestehende Vorrat abgearbeitet. **PRODUZIEREN**, sobald der TikTok-Vorrat unter 2 Tagen liegt, sonst AUSSETZEN. Danach entsteht jede Nacht eine Staffel, und ihre Posts beginnen gleich am nächsten Tag (TikTok ab 08/12 Uhr, Instagram/YouTube alle 2 Stunden). So wird jede Staffel an dem Tag gepostet, an dem sie fertig wird, ohne mehrtägigen Vorrat.
- **Analyse jeden Abend um 21:39** (Zernio kostenlos), vidIQ nach Credit-Plan nur jeden 2. Abend.
- In `staffeln.json` bekommt jede Staffel `datum` (JJJJ-MM-TT), sonst erkennt `vorrat.py` sie nicht.

## Test- und Analysephase bis 22.11.2026 (Jonathans Vorgabe 4.11.)

Bis zum 22. November wird viel ausprobiert und alles genau ausgewertet. **Möglichst viel Vielfalt bei Kulissen, Welten, Geschichten, Genres, Erzählformen, Figuren, Hooks und Längen. Gleich bleiben nur die Stimme (Gemini „Orus“, `@vortrag lebendig`) und der Stil („leuchtend“, Kurzgesagt-Richtung, Figuren aus `figuren.json`).** Regeln und Ideen-Vorrat: `taeglich/analyse/experimente.md`.
- Jede Staffel spielt in einer **neuen Welt**: Hauptort und mindestens 60 % der Kulissen-Einstellungen (ohne `gesicht`/`handy`) überschneiden sich nicht mit den beiden Staffeln davor.
- **Genre und Erzählform** wechseln gegenüber der Staffel davor, kein Genre zweimal in 3 Staffeln. Hook-Art und Figuren-Fokus ebenfalls abwechseln.
- **Pro Staffel 1–2 neue Kulissen** für die neue Welt (mindestens 1 im Stil „leuchtend“, Skill `serien-stil`).
- Genau **1 Haupt-Experiment** pro Staffel (eine Sache verändern, Hypothese und Messgröße in `experimente.md`).
- In `staffeln.json` bekommt jede Staffel `vielfalt` (`welt`, `genre`, `erzaehlform`, `hook_art`, `vorbild_kurz`, `figuren_fokus`, `laenge`, `folgen`, `tiktok`, `experiment`, `neue_kulissen`) und `cliffhanger` (Art je Folge). Die Analyse vergleicht danach.
- Die Format-Rotation unten läuft weiter. **Ab s07 bis 22.11. wird nicht auf einen Gewinner festgelegt**, sondern weiter abgewechselt (Folgenzahl 6–12, Länge 62–120 s, TikTok einzeln oder Sammelteile).

## Horror-Geschichten (Jonathans Wunsch 4.11., Issue #23)

Jonathan möchte mehr Horror testen, **ohne Blut**: unheimliche Wesen im Stil moderner Internet-Gruselgeschichten (Creepypasta, Kryptiden), kurz als Test mit Folgen von **2–3 Minuten**, um zu sehen, ob es die Leute packt.
- **Format „horror“:** 3–5 Folgen à 120–180 s (330–430 Wörter, 30–40 Einstellungen), TikTok jede Folge ein eigener Post, Instagram/YouTube jede Folge ein Post (Reels und Shorts erlauben bis 3 min; `staffel_veroeffentlichen.py` erlaubt bei `laengenband` „horror …“ bis 185 s). In `staffeln.json` → `format.laengenband` mit „horror“ beginnen. Stimme bei Folgen über 2 min mit `--anfragen 2`.
- **Gruseln statt Gewalt:** kein Blut, keine Verletzungen, keine Leichen, keine Gewalt gegen Kinder, nie Suizid. Die Angst entsteht aus Stille, Geräuschen, einer Stimme, die jemanden nachahmt, Licht, das ausgeht, und dem Wesen, das man nie ganz sieht (nur Umriss, Augen, Schatten). Am Ende jeder Folge der Cliffhanger, die letzte Folge darf offen und unheimlich enden.
- **Nur eigene Wesen:** keine bekannten Figuren nachbauen (z. B. nicht Siren Head, der Figur eines Künstlers, und nicht den Skinwalker aus der Navajo-Überlieferung), sondern eigene Wesen nach dem gleichen Prinzip, z. B. etwas, das Stimmen deiner Familie nachahmt, ein Wesen so hoch wie die Strommasten am Feldrand, ein Ruf aus dem Wald, der näher kommt. Name und Aussehen sind neu.
- **Düsterer, nicht so farbenfroh (Jonathans Wunsch 4.11.):** Stil „leuchtend“ bleibt, aber Kopf mit `@look 0.75`, `@kino 0.5`, `@palette blau`, jede Einstellung `palette=blau palette_staerke=0.6` (fast einfarbig, dunkel). `lila` nur sparsam für einen einzelnen Schreckmoment, keine warmen Paletten (`orange`, `rosa`, `gruen`). Licht nur aus Taschenlampe, Mond, einem Fenster. Geprüft 4.11.: Figuren bleiben gut sichtbar (Maske), der Hintergrund wird dunkel.
- **Stimme bleibt:** Orus, `@vortrag lebendig` (leise, langsamer, Pausen vor der Wendung). Du-Form, keine Fragen ans Publikum.
- **Kulissen dafür (neu bauen, Stil „leuchtend“):** Wald bei Nacht mit Nebel und Taschenlampe, Feldweg mit Strommasten, Hütte oder Camping am See, verlassene Tankstelle, Funkmast. Höchstens 2 neue pro Staffel.

## Jedes Genre einmal ausprobieren (Jonathans Wunsch 4.11.)

Bis zum 22.11. bekommt möglichst **jedes Genre** eine eigene Staffel (Plan in `taeglich/analyse/experimente.md`): Horror (ohne Blut, zweimal), Krimi/Rätsel, Sci-Fi/Zukunft, Psychologie über dich, Naturgewalt, Familiengeheimnis, Lebenszeit/Philosophie, Tierfreundschaft, Wettlauf gegen die Zeit. **Nicht:** reine Komödie („lustig jetzt nicht“), Romantik und Abenteuer/Reise (Jonathan 4.11.: „raus“). Ein trockener Satz pro Folge bleibt.

## Zitat-Video nach jeder Staffel (Jonathans Wunsch 4.11., Issue #24)

Nach jeder Staffel kommt **ein Zitat-Video** (etwa 1 Minute, immer über 62 s, #12): kurze, starke Sätze zum Thema der Staffel, z. B. „Wer dir sagt, Geld geht über alles, von dem halt dich fern.“ Darunter läuft **tiefe, ruhige Musik**.
- **Drehbuch:** `taeglich/episoden/sNNz-f01.txt` (Vorlage `s02z-f01.txt`) (Titel `# <Staffeltitel> – Zitate: <Titel>`), 10–14 Einstellungen, 170–200 Wörter, je Satz ein Wow-Bild (Panorama, Licht, kleine Figur), Stil „leuchtend“, Stimme Orus wie immer. Erster Satz mit `hooktext`. Kein Endkarte, keine Fragen ans Publikum, die letzte Zeile ist eine kurze Aufforderung (z. B. „Ruf deinen Opa an. Heute.“).
- **Keine erfundenen Zitate berühmter Leute:** eigene Sätze in Du-Form oder alte Sprichwörter ohne Namen. Ein Satz mit Namen nur, wenn die Quelle sicher belegt ist.
- **Musik macht Jonathan selbst (4.11.):** Er legt einen eigenen, gemeinfreien Song darüber. Wir liefern das Video **ohne Musik** (nur Stimme und leise Geräusche wie bei den Folgen). `taeglich/zitat_musik.py` nur benutzen, wenn Jonathan es ausdrücklich will.
- **Sätze sehr simpel, aber tiefgründig** (Jonathan 4.11.): kurz, ein Gedanke, Alltagssprache. Bekannte Redewendungen ohne Namen sind erlaubt (z. B. „Geld ist nicht alles.“), gern mit einem zweiten Satz, der sie vertieft.
- **Posten macht Jonathan selbst** (4.11.): Der geplante Lauf `taeglich/laeufe/zitate.md` (täglich 08:47) baut nach jeder veröffentlichten Staffel das Zitat-Video, schickt die Datei in den Chat zum Herunterladen und sagt per PushNotification Bescheid. Jonathan lädt es mit eigenem Song auf TikTok, Instagram und YouTube hoch. **Nicht** bei Zernio einplanen. In `staffeln.json` als Eintrag `id: "sNNz"`, `art: "zitate"`, `geliefert`, `posten: "manuell"`. `vorrat.py` zählt Zitat-Videos nicht als Staffel.

## Abwechslung bei Länge und Folgenzahl (Jonathans Wunsch 2.11., Issue #13)

Damit die Analyse herausfinden kann, was am besten ankommt, ändert sich das Format **von Staffel zu Staffel** nach einer festen Rotation. Feste Grenzen bleiben: jede Folge **62–90 s** (über 1 Minute, #12; bis 90 s ein Post auf Instagram/YouTube, Jonathans Vorgabe 2.11.), TikTok-Teile höchstens 10 min.

| Staffel | Folgen | Länge pro Folge | Wörter pro Folge | Einstellungen | TikTok |
|---|---|---|---|---|---|
| s01 (fertig) | 10 | frei (66–79 s gemessen) | 186–207 | 18–20 | 4 Sammelteile |
| s02 (fertig) | 8 | **kurz** 60–70 s (65–81 s gemessen) | 189–201 | 18–20 | **jede Folge ein eigener Post** |
| s03 **Horror-Test** (Jonathans Wunsch 4.11., Issue #23) | 4 | **horror** 2–3 min (120–180 s) | 330–430 | 30–40 | **jede Folge ein eigener Post** |
| s04 | 12 | **lang** 80–90 s | 215–230 | 22–26 | 5 Sammelteile |
| s05 | 6 | **XL** 90–120 s (bis 2 min) | 240–310 | 24–30 | **jede Folge ein eigener Post** |
| s06 | 10 | **mittel** 70–80 s | 195–210 | 20–24 | 4 Sammelteile |
| s07 | 10 | **gemischt**: 3 Folgen ~60 s, 4 ~80 s, 3 ~110 s | je nach Länge | | jede Folge ein eigener Post |
| ab s08 | bis 22.11. weiter abwechseln (Testphase), danach nach Abschlussbericht | Gewinner erst ab 22.11. festlegen | | | |

Jonathans Wunsch vom 2.11. abends: Abwechslung, auch **Kurzvideos von 1 bis 2 Minuten** und solche mit **höchstens 90 s**, und schauen, wie sie ankommen. Dazu testen wir auf TikTok **einzelne Folgen** statt Sammelteile: die Zahlen vom 2.11. zeigen, dass bei den 7-Minuten-Teilen nach einem Viertel nur noch 3–9 % zuschauen.
- **Instagram/YouTube:** jede Folge ist ein Post, auch die XL-Folgen bis 2 min (beide Plattformen erlauben das). Nie in Teile unter 1 Minute schneiden (#12).
- **TikTok einzeln:** in `staffeln.json` `"tiktok_teile": [[1], [2], …]`; jede Folge wird ein eigener TikTok-Post im normalen TikTok-Takt.

- Das gewählte Format steht in `staffeln.json` → `format` (`folgen`, `laengenband`, `tiktok_teile`).
- Die Gemini-Stimme schwankt je Anfrage (s01: 2,4–3,0 Wörter/s). Nach dem Vertonen zählt die **gemessene** Länge: liegt eine Folge außerhalb ihres Bands oder unter 62 s, eine Einstellung ergänzen bzw. kürzen und neu vertonen. Über 90 s lehnt `staffel_veroeffentlichen.py` ab.
- Innerhalb einer Staffel dürfen die Folgen um einige Sekunden schwanken; das wird mitgemessen.
- **Dokumentieren:** Nach dem Veröffentlichen `python taeglich/videodaten.py sNN`. Das schreibt pro Video Länge, Band, Wörter, Sprechtempo, Einstellungen, Kurzgesagt-Kulissen, Nahaufnahmen, Faktenkarten, Stimmung, Hook-Satz, Hook-Text, Figuren, Folgenzahl und die Post-Termine nach `taeglich/videodaten.json` und `videodaten.md`. `analyse_auswerten.py` vergleicht damit Längenband, Folgen pro Staffel, Hook-Text und Staffel (Aufrufe/h, Wiedergabe in s und in % der Länge).

## Die Staffel

- **6–12 Folgen** nach der Rotation oben (Standard 10), jede im Längenband der Staffel, immer **62–90 s**. **Jedes Video muss über 1 Minute lang sein** (Jonathans dringende Vorgabe vom 1.11., Issue #12: TikTok zahlt im Creator Rewards Program ab 10.000 Followern nur für Videos über 1 Minute). Unter 90 s bleibt jede Folge ein einzelner Post auf Instagram und YouTube. Die Stimme hat ca. 170–210 Wörter, 18–26 Einstellungen. Ist eine Folge nach dem Vertonen kürzer als 62 s, schreib eine Einstellung dazu, statt zu dehnen.
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

**Keine Statusanzeige oben links** (Jonathans Vorgabe 3.11., Issue #19): kein `@hud` im Drehbuch, also kein Kasten mit Tag/Uhrzeit, Handy, Netz, Konsole o. Ä. Uhrzeit oder Akku erzählt bei Bedarf die Szene selbst (z. B. `[handy …]`). Prüfen: `grep -n "@hud" taeglich/episoden/sNN-*.txt` muss leer sein.

**Verboten:** Fragen ans Publikum („Was hättest du gemacht?“, „Schreib es in die Kommentare“, „Was ist richtig?“), Quiz und Check (#8). Ebenso „Echter Fakt“ (#2) und Erfundenes, das als Tatsache verkauft wird: Fantasie-Szenarien werden als „Stell dir vor …“ erzählt, Schätzungen als Schätzung. Fragen der Figuren in der Handlung sind erlaubt. Nicht predigen. Kein Suizid, keine Selbstverletzung, keine Essstörungen und keine Gewalt gegen Kinder. Tod und Abschied nur behutsam.

**Sprache:** Du-Erzählung, kurze Sätze, gesprochenes Deutsch, Zahlen als Wörter. `*Wort*` hebt ein Wort hervor, „…“ ist ein Zitat (Mund bewegt sich).

## Stil „leuchtend“ – Standard für alle neuen Folgen (Jonathans Vorgabe 2.11., Issue #17)

Jonathan hat Referenzbilder in Kurzgesagt-Richtung geschickt und die Probe „Wüste“ abgenommen („genau so ist perfekt“). **Ab jetzt hat jede neue Folge diesen Look, jedes Mal passend zur Szene:**
- **Kopf jedes Drehbuchs:** `@qualitaet max`, `@vortrag lebendig`, `@look 0` (kein Abdunkeln), `@kino 0.35`, `@stil leuchtend`, dazu `@palette <Farbfamilie>` als Standard der Folge (siehe „Qualität“ unten, seit 3.11.).
- **Eine Farbfamilie pro Einstellung** (`palette=lila|orange|tuerkis|rosa|gruen|blau`): Der Hintergrund wird eingefärbt, die Figuren behalten ihre Farben. Die Palette passt zu Ort, Tageszeit und Stimmung:

| Stimmung | Paletten | Beispiele |
|---|---|---|
| düster | `lila`, `blau` | Stadt bei Nacht, Krankenhaus, Rechenzentrum |
| spannend | `lila`, `rosa`, `blau` | Netz, Großstadt, Weltall |
| traurig | `blau`, `tuerkis` | Regen, Park im Herbst, See |
| freudig | `orange`, `gruen`, `tuerkis` | Wüste, Wald, Landschaft am Tag |
| warm | `orange`, `rosa` | Wohnzimmer, Esstisch, Abendlandschaft |

- In einer Folge wechseln die Paletten mit den Orten (2–4 verschiedene). Gleicher Ort, gleiche Palette, damit es einheitlich wirkt.
- **Tiefe:** Der Hintergrund ist automatisch leicht weich (`tiefe=1.6`, `tiefe=0` aus), die Figuren bleiben scharf. Nahaufnahmen (`gesicht`) sind schon unscharf.
- **Kulissen im neuen Stil** (`engine/leuchtend.js`): `kiosk` (Lotto-Kiosk bei Nacht, s02), `duenen` (Wüste mit Tafelbergen, Oase, Tiefenunschärfe, dunklen Pflanzen vorne, Sonnenstrahlen; `zeit=tag|abend`, `gross` für nahe Figuren). Weitere Kulissen in diesem Stil kommen nach und nach dazu (Stadt von oben, Dschungel, Wolkenhimmel, Innenräume in einer Farbe). Bis dahin werden alle bestehenden Kulissen mit `@stil leuchtend` und Palette benutzt.
- Merkmale, an denen sich neue Kulissen orientieren: eine Farbfamilie, Tiefenunschärfe in Ebenen, dunkle Silhouetten am Rand, Licht (Strahlen, Glühen, Linsenreflexe), Wechsel aus Detail und Ruhe, Panorama mit kleiner Figur. Nie Figuren, Vögel, Logo oder Szenen von Kurzgesagt nachbauen.
- Die alten Serien (24. Stock, Der Alien, Der letzte Mann, s01) bleiben im bisherigen Look.

## Qualität: schärfer, flüssiger, detailreicher, bessere Geschichten (Jonathans Wunsch 3.11., Issue #20)

Gilt für alle neuen Folgen. Die alten Serien und schon gerenderte Videos bleiben, wie sie sind (pixelgleich geprüft).

**Technik**
- `@qualitaet max` statt `hoch`: **60 Bilder/s** und **1440×2560**. Die Engine zeichnet direkt in dieser Auflösung (`engine/ss.js` rechnet die 1080er-Koordinaten um), also echte, feinere Vektorkanten statt Hochskalieren. YouTube nutzt ab 1440p den besseren Codec; TikTok und Instagram skalieren sauber herunter. Datenrate automatisch unter 95 MB pro Datei (GitHub-Grenze).
- Rechenzeit (gemessen 3.11., 4 Kerne): ca. 18-fache Echtzeit, also **ca. 20 min pro 70-s-Folge**. Immer 2 Folgen gleichzeitig im Hintergrund rendern und gleich nach der Stimme anfangen. Wird die Zeit knapp (Posting ab 08:00): `--fps 30` halbiert sie.
- `--ss 2` zeichnet intern sogar in 2160×3840 (echte 4K-Kantenglättung), braucht aber noch einmal doppelt so lang. Nur für einzelne Vorzeige-Folgen.
- Standbilder (`--bilder`) kommen jetzt in 1440×2560. Ausschnitte in voller Auflösung ansehen.

**Bilder (zusätzlich zur Detail-Prüfliste unten)**
- **Jede Folge hat mindestens 3 „Wow-Bilder“:** Panorama mit kleiner Figur, großes Licht (Sonne, Polarlicht, Stadt bei Nacht) oder eine Bibliotheks-Platte. Mindestens eines davon in den ersten 3 Einstellungen.
- **Bibliotheks-Platten bevorzugen** (`[bild id=…]`): Sie sind in doppelter Auflösung gerechnet und zeigen ihre Details erst jetzt ganz.
- **Keine leeren Hintergründe:** Auch Nahaufnahmen (`gesicht`, `handy`) bekommen einen Ort (`ort=…`), nie eine einfarbige Fläche.
- **Immer etwas Bewegung:** jede Einstellung mit Kamerabewegung (`zoom-rein`, `zoom-raus`, `schwenk-…`) oder leiser Bewegung im Bild (Teilchen, Lichter, Regen, Glühwürmchen). Bei 60 fps wirkt das jetzt flüssig.
- **Pro Staffel mindestens 1 neue Kulisse im Stil „leuchtend“** (`engine/leuchtend.js`) für den wichtigsten Ort der Geschichte, nach dem Skill `serien-stil`. Danach Katalog und Tabelle ergänzen, alte Serien pixelgleich prüfen.
- Figuren in Panoramas klein, in Gefühlsmomenten groß (`gesicht`). Wechsel aus Weite und Nähe in jedem Kapitel.

**Geschichten**
- **Jede Folge hat ein konkretes Ziel, ein Hindernis und eine Entscheidung** der Du-Figur. Wer nur diese Folge sieht, versteht das in einem Satz.
- **Zeigen statt erklären:** ein genaues Detail statt einer Zusammenfassung („Opas Brille liegt noch auf dem Tisch“ statt „Opa ist weg“). Pro Folge mindestens 3 solche Sinnes-Details (Geräusch, Licht, Geruch, Uhrzeit, Zahl).
- **Dialoge kurz und eigen:** höchstens ca. 8 Wörter pro Zitat; jede Figur hat eine erkennbare Art zu reden (Opa: ruhig, alte Redewendungen; Lina: kurze, direkte Sätze; Ben: Witze, wenn er Angst hat). Mindestens 2 Zitate pro Folge, damit es lebt.
- **Vorbereiten und einlösen:** Was in einer frühen Folge beiläufig gezeigt wird (ein Gegenstand, ein Satz), löst später etwas aus. Pro Staffel mindestens 2 solche Bögen, in `staffeln.json` unter `boegen` notieren.
- **Cliffhanger abwechseln:** nicht nur Gefahr, auch Entdeckung, Entscheidung, Ankunft, Geständnis, Wiedersehen. Zwei Folgen hintereinander nie dieselbe Art.
- **Mindestens eine echte Überraschung pro Staffel**, die vorher fair angedeutet war.
- **Streichprobe vor der Stimme:** jedes Drehbuch einmal von oben lesen und jede Zeile streichen oder ersetzen, die nichts Neues bringt (keine Wiederholung dessen, was das Bild schon zeigt).
- **Vortrag:** `@vortrag lebendig` (`ton/gemini.py`): gleiche Stimme „Orus“, aber Schlüsselwörter betont, schneller bei Gefahr, leiser bei Gefühl, kleine Pause vor jeder Wendung. Die Tonhöhe gleicht `ton.folge` wie immer an. Klingt eine Folge übertrieben: Zeile entschärfen und neu vertonen.

## Look: Kurzgesagt-Richtung, viel Detail, hohe Bildqualität

**Ab der ersten Staffel (heute, 1.11.) und für jede weitere Serie (Jonathans Vorgabe, 1.11. abends):** Look wie „Dinge Erklärt – Kurzgesagt“, genau wie im Katalog-Bild. Vor jedem Kulissen- oder Figurenbau den Skill `serien-stil` laden (`.claude/skills/serien-stil/SKILL.md`): erst Katalog prüfen und wiederverwenden, Bilder nur als Code in der Engine, keine Bild-APIs, ChatGPT nur für Referenzbilder. Nie Kurzgesagt-Figuren, -Logo oder -Musik übernehmen.

**Jonathans Vorgabe (1.11., nach dem Katalog-Bild):** „Ja, diesen Stil auch bitte künftig, mehr Aufwand in die Details und generell die Bildqualität hoch halten.“ Das gilt für alle künftigen Videos und Staffeln.

- Jedes Drehbuch hat **`@qualitaet max`** (seit 3.11., siehe „Qualität“; vorher `hoch`: Einzelbilder JPEG 100, x264 slow/crf 16, Animations-Tuning, aq-mode 3 gegen Treppen in dunklen Verläufen), **`@kino 1`** (nur echte Lichter glühen, stehende Papier-Körnung) und `@look` nach Stimmung (düster 0.8–1, spannend 0.6, traurig 0.5, warm 0.35, freudig 0.1–0.2).
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
| `polarlicht` | Nachthimmel mit wehenden Lichtvorhängen, Berge im Dunst, Stadt mit Notstrom-Fenstern, Funkturm (neu in s01) | `farbe=#hex`, `stadt=false`, `see` |
| `kiosk` (leuchtend) | Lotto-Kiosk an der Straßenecke bei Nacht: Neonschild „LOTTO“, leuchtendes Schaufenster mit Regalen, Markise, Laterne mit Lichtkegel, nasser Asphalt mit Spiegelungen, unscharfe Stadt mit Lichtpunkten (neu in s02) | `zeit=nacht\|abend`, `regen`, `gross` |

**Hook-Text** (Experiment aus der Analyse vom 1.11., ab s01): `hooktext="…"` in der ersten Einstellung zeigt bis zu 7 Wörter in Großbuchstaben oben im Bild, nur die ersten 2,5 s (`engine/kurzgesagt.js`).

**Alltags-Kulissen** (`engine/alltag.js`, Katalog: `taeglich/episoden/katalog.txt`): `wohnzimmer` (`licht=an`, `tv`, `sofa_sitzen`, `foto=…`), `zimmer` (`im_bett=du`, `lichterkette`, `laptop`), `esstisch` (`leer=2`, `gedeckt`, `kerzen`, `torte`), `park` (`jahreszeit=…`, `sitzen`), `klassenzimmer` (`tafel="…|…"`, `uhr=`), `krankenhaus` (`patient=opa`, `monitor=flach`), `see` (`sitzen`), `haltestelle` (`bus=kommt`). Überall: `regen`, `blaetter`, `lichter`, `gluehwuermchen`, `zeit`. Icons für `objekt` u. a.: `lottoschein`, `geld` (neu in s02), `herz`, `uhr`, `schluessel`. Dazu `gesicht` (Nahaufnahme, jede Kulisse als `ort=`), `objekt` (Infokarte mit Icons), `titel`, `handy`, `strasse`, `supermarkt`, `bahnhof`, `kueche`. Pose `du:handy`.

## Bildbibliothek (Jonathans Wunsch 2.11.: Hunderte bis Tausende fertige Bilder, nur noch herausgreifen und zoomen)

- **Was:** fertige Hintergründe („Platten“) jeder Kurzgesagt-Kulisse in vielen Varianten (Tageszeit × Wetter × `variante=1…N` mit anderer Skyline, anderen Bergen, Bäumen, Wolken), doppelte Auflösung (2700 × 4800), damit Zoom scharf bleibt. Katalog: `taeglich/bibliothek/katalog.json` (im Git), Bilder: `ausgabe/bibliothek/<id>.jpg` (reproduzierbar, nicht im Git).
- **Erzeugen:** `node taeglich/bibliothek.mjs` (alle, mit Übersichtsblättern `ausgabe/bibliothek/uebersicht-*.jpg`), `--nur id,…`, `--fuer <drehbuch>` (vor dem Rendern im frischen Container). Neue Varianten in `VARIANTEN()` ergänzen.
- **Freigabe:** Übersichten einmal ansehen, Jonathan gibt frei: `node taeglich/bibliothek.mjs --freigeben <ids|kulisse|alle>`, schlechte `--sperren`. Ein verändertes Bild (anderer Fingerabdruck) muss neu freigegeben werden.
- **Im Drehbuch:** `[bild id=grossstadt-nacht-v07 du ben zoom-rein] Text …`: Bild aus der Bibliothek, Figuren, Posen und Kamera wie gewohnt. Großstadt: `-v07` mit Dach für Figuren, `-weit-v07` nur Skyline. Nur **freigegebene** Bilder benutzen (render.mjs meldet sonst einen Hinweis).
- **Prüfung:** Einstellungen mit freigegebenen Bibliotheksbildern müssen nicht mehr einzeln angesehen werden. Pro Folge ansehen: erstes und letztes Bild, alle Einstellungen ohne Bibliothek (Gesichter, Karten, Handy, neue Kulissen) und 1 Ausschnitt in voller Auflösung.
- **Wirkung (gemessen 2.11.):** gleiches Bild wie live (≤ 2 % abweichende Pixel, nur bewegte Kleinigkeiten), Zeichnen ca. 25 % schneller; die alten Serien bleiben pixelgleich.

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

## Auswertung (Aufgabe „Analyse vor der Staffel“, 21:39 Uhr)

Die Auswertung macht eine eigene Aufgabe vor jeder Produktion, der Ablauf steht in `taeglich/ANALYSE.md`. Sie nutzt Zernio (Zahlen aller Posts auf TikTok, Instagram und YouTube), vidIQ und eine Recherche von außen. Das Ergebnis steht in **`taeglich/analyse/aktuell.md`**. **Die Produktion liest diese Datei vor dem Planen und setzt die Punkte um** (Mehr davon / Weniger davon / 1 Experiment / Themenvorschläge). Feste Regeln gehen immer vor. Ist `aktuell.md` älter als 1 Tag oder fehlt sie, macht die Produktion nur die kostenlosen vidIQ-Abfragen und plant nach dem letzten Bericht.

### vidIQ (Jonathan hat vidIQ am 1.11. verbunden) **Credits sind knapp:** 150 pro Monat (kostenloser Tarif), die meisten Abfragen kosten 5. Immer zuerst `vidiq_balance` (kostenlos) und mindestens 10 Credits Reserve lassen.

| Abfrage | Kosten | Wann |
|---|---|---|
| `vidiq_user_channels`, `vidiq_balance`, `vidiq_instagram_connected_accounts` | 0 | jeder Lauf: YouTube-Abonnenten und -Aufrufe |
| `vidiq_instagram_owner_insights` (nur wenn `ownerInsightsAvailable: true`) | 0 | jeder Lauf: Wiedergabezeit, Abbruchquote der Reels |
| `vidiq_channel_analytics` Kanal `UCDJfvYxtgy9sp6kyNDzaTcw`, `report=top_videos`, Metriken `engagedViews, averageViewDuration, averageViewPercentage, subscribersGained`, letzte 28 Tage | 5 | jeder Lauf |
| `vidiq_instagram_tiktok_outlier_search` (Vorbild-Recherche: was bei deutschen Story-/Animations-Reels und TikToks gerade überdurchschnittlich läuft) | 5 | jeder 2. Lauf, statt WebSearch |
| `vidiq_ig_profile` `sto.rys4you` (Follower) | 5 | einmal pro Woche |

- Ergebnisse in `taeglich/kennzahlen.json` → `verlauf` eintragen (Datum, Zahlen, wichtigste Erkenntnis in einem Satz).
- **Was die Zahlen ändern:** Folgen und Stimmungen mit hoher `averageViewPercentage` bzw. vielen `engagedViews` öfter, Hooks der schwächsten Folgen nicht wiederholen. Die Länge bleibt 65–85 s (Issue #12).
- **Schwellen** (`kennzahlen.json` → `schwellen`): Wird eine erreicht (TikTok 10.000 Follower = Creator Rewards, YouTube 1.000 Abonnenten, Instagram 10.000), in `meilensteine` vermerken und Jonathan sofort per PushNotification melden. TikTok-Follower liefert vidIQ nicht; die Zahl kommt von Jonathan oder später über eine andere Verbindung.

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
node render.mjs taeglich/episoden/sNN-fXX.txt                 # 6. rendern mit @qualitaet max (1440×2560, 60 fps; ca. 20 min pro 70-s-Folge, 2 gleichzeitig im Hintergrund – früh starten!)
python taeglich/staffel_veroeffentlichen.py sNN               # 7. prüfen, TikTok-Teile schneiden, ablegen, hinten anhängen
git add -A taeglich engine && git commit && git push -u origin taeglich                 # 8. sichern
```

- Kopf jedes Drehbuchs: `# <Staffeltitel> – Folge N: <Folgentitel>`, `@stimmung …`, `@vortrag lebendig`, `@mund zitate`, `@qualitaet max`, dazu der Stil „leuchtend“ (siehe oben), `@zeit …`. Über jeder Zeile steht ein `// Bildbeschreibung`.
- **Untertitel im Wechsel (Jonathans Vorgabe 5.11., Experiment E4):** jede zweite Staffel ohne Untertitel (`@untertitel aus`): ungerade Staffeln (s03, s05, s07, s09, s11) **aus**, gerade (s04, s06, s08, s10, s12) **an**. Hook-Text, `gross=` und Schrift im Bild bleiben immer. Das Zitat-Video und die englische Fassung folgen ihrer Staffel. Die Analyse vergleicht beide Gruppen; entschieden wird erst nach dem 22.11.
- **Staffelplan s04–s12** (Jonathan über ChatGPT, 5.11.): `taeglich/analyse/staffelplan-s04-s12.md` ist die Vorlage für Thema, Figuren, Folgen, Hooks und Cliffhanger. Die Produktion schreibt daraus die Drehbücher; feste Regeln gehen vor.
- Gemini: 5 Schlüssel (Proxy + `GEMINI_API_KEY_2` … `_5`), je ca. 10 Anfragen am Tag. Sind alle erschöpft: nichts posten, die fertigen Folgen sichern, Jonathan Bescheid geben. Beim nächsten Lauf geht es mit dieser Staffel weiter.
- Meldet `stimme_pruefen.py` einen Fehler: genauer hinhören. Ist es wirklich falsch, die Zeile eindeutiger formulieren und die Folge neu vertonen.
- **Standbilder prüfen:** Gesichter nicht unter den Untertiteln, nichts am Rand abgeschnitten, nichts scheint durch, Text lesbar, jedes Bild passt zum Satz.

## Posten (hinten anhängen)

`staffel_veroeffentlichen.py` erledigt Folgendes:
- jede Folge auf ca. −15 LUFS bringen und prüfen (Ton da, so lang wie das Bild, > −24 LUFS, **62–90 s**; kürzer als 62 s wird nicht gepostet)
- die TikTok-Sammelteile schneiden (Standard 10 Folgen → Folge 1–3, 4–5, 6–8, 9–10, einfach aneinandergehängt; eine versehentliche „Fortsetzung folgt“-Karte würde überall herausgeschnitten) und prüfen
- alles auf `youtube-upload` ablegen (`taeglich/sNN-fXX.mp4`, `taeglich-tiktok/sNN-teil-N.mp4`, `geprueft.json`)
- alle Posts **pro Plattform hinter den letzten geplanten Post** hängen, im Takt TikTok 08/12/16/20 Uhr, Instagram alle 2 Stunden, YouTube jeweils :30 (Issue #14)

IDs: `taeglich-tiktok-sNN-teil-N`, `taeglich-insta-sNN-fXX`, `taeglich-yt-sNN-fXX`. Bis der Workflow „Posts einplanen“ fertig ist, nichts auf `main` pushen. Danach im Log prüfen, dass alles mit ✓ eingeplant ist.

## Themen aus dem echten Leben (Jonathans Vorgabe 1.11. abends)

Neben Überleben und Mysterium kommen **regelmäßig Themen, die jedem im Leben passieren**. Sie werden in Du-Form erzählt, sodass es dich direkt trifft, und **immer im gleichen Kurzgesagt-Stil** mit denselben Figuren, Kulissen und derselben Stimme. Mindestens jede 2. Staffel hat so ein Lebensthema als Hauptthema. In jeder Staffel greift mindestens eine Folge eines davon auf.

- **Das Leben:** Geburt eines Geschwisterkinds, der erste Schultag, erste Liebe, der beste Freund, Streit und Versöhnung, Schulabschluss, Ausziehen, der erste Job, Eltern werden älter, alt werden, „Wie viel Zeit bleibt uns?“ (Kulisse `lebenszeit`)
- **Der Tod:** Opa oder Oma stirbt, das Haustier, Abschied im Krankenhaus, was bleibt (Erinnerungen, Fotos, Gewohnheiten), Trauer und wie es weitergeht, die Frage, was danach kommt (nur als Gedanke, nie als Tatsache)
- **Erzählweise beim Tod:** behutsam, ehrlich, nie reißerisch, keine Bilder von Verletzungen. Am Ende steht immer etwas Tröstendes oder Hoffnungsvolles (Zeit mit den Menschen, die noch da sind). **Nie Suizid oder Selbstverletzung.** Weiterhin kein Erfundenes als Tatsache.
- Gute Kulissen dafür: `krankenhaus`, `esstisch` (leerer Stuhl), `wohnzimmer` (Fotos), `lebenszeit`, `see`, `landschaft`, `park` im Herbst und Winter, `weltall` (wie klein wir sind).

## Themenspeicher (Staffel-Ideen, nicht verpflichtend)

- **Der leere Stuhl:** Opa ist gestorben, und am Esstisch steht sein Stuhl. Zehn Folgen über das letzte Jahr mit ihm und das, was bleibt. (esstisch, krankenhaus, wohnzimmer, see, lebenszeit)
- **Ein ganzes Leben in 10 Minuten:** Von deiner Geburt bis du alt bist, jede Folge ein Lebensabschnitt. (lebenszeit, zimmer, klassenzimmer, grossstadt, wohnzimmer, weltall)

- **Wenn die KI alles kann:** Stell dir vor, eine KI kann über Nacht alles, was du kannst. Deine Schule, dein Traumjob, deine Freunde, und was keine Maschine ersetzt. (rechenzentrum, auge, netz, grossstadt)
- **Die letzten 1000 Sommer:** Lebenszeit, Freunde, die auseinanderziehen, der eine Sommer am See. (lebenszeit, see, landschaft, park)
- **Funkstille:** Weltweit fällt das Internet aus. Sieben Tage ohne Handy, und plötzlich redet deine Familie wieder. (grossstadt, haltestelle, esstisch, weltall)
- **Der Komet:** Ein Komet ist in 30 Tagen da. Was du mit der Zeit machst. (weltall, landschaft, wohnzimmer)
- **Dein 80-jähriges Ich:** Ein Brief von dir selbst aus der Zukunft. (lebenszeit, wald, krankenhaus, park)
- **Allein im Wald:** Verlaufen, eine Nacht, ein Weg zurück. (wald, landschaft)
- **Die Stadt, die nie schläft:** Großstadt, Einsamkeit, ein Fremder, der Freund wird. (grossstadt, haltestelle, netz)
- **Das Experiment:** Psychologie-Tricks, die dein Gehirn jeden Tag mit dir macht. (netz, auge, klassenzimmer)
