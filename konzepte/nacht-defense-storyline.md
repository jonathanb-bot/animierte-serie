# „Die 13. Glocke“ – Horror-Storyline für das Dorf-Abwehrspiel (Entwurf 24.11., wartet auf Jonathans Abnahme)

Grundlage: `konzepte/stadtverteidigung.md` (Plan B „Dorf-Defense“, Horror-Fassung), Figuren aus `block/horror.js` (Liste `block/vorlagen/horrorfiguren.md`).
Regeln: Du-Erzählung (#31), Blutrot nur stilisiert (#43), Stimme unverändert (#41), Marken/Figuren erlaubt (#42), kein Flackern, erstes Bild nie schwarz.

## Die Welt

**Dein Dorf heißt Schattental.** Bunte Häuser (Buntdorf), aber für immer Nacht: Nebel, roter Mond, eine alte Kapelle am Waldrand.
Jede Nacht um **3:00 Uhr** schlägt die Kirchenglocke – **13-mal**. Beim 13. Schlag kommt etwas aus dem Wald.
Bis zum Sonnenaufgang um 6:00 musst du das Dorf halten. Die Uhr läuft oben im Bild mit (3:00 → 6:00).

**Du bist Teil des Dorfes.** Jede Waffe, die du in die Kommentare schreibst und die die meisten Likes bekommt, wird ins Dorf gebaut – und bleibt für immer.
Jedes Wesen hat eine **geheime Schwäche und eine geheime Fähigkeit**. Die Zuschauer müssen sie aus den Hinweisen erraten.

**Das große Rätsel (zieht sich durch die Staffel):** Wer läutet die Glocke? Der Glockenturm ist seit 100 Jahren zugemauert.
Hinweise tauchen in jeder Folge klein im Bild auf (Fußspuren im Schnee zur Kapelle, ein Schlüssel an Omas Haken, ein Licht im Turm).

## Spielregeln (fair und nachvollziehbar, Datei `defense/stand.json`)
- Jede Waffe hat eine **Art** (Wasser, Feuer, Licht, Lärm, Wucht, Fangen, Kälte, Heilig) und **Schaden** (10–40).
- Jedes Wesen hat **Leben** (steigt pro Nacht ×1,4), **Immunität** (eine Art = 0 Schaden) und **Schwäche** (eine Art = doppelt).
- Das Dorf hat **10 Häuser**. Kommt ein Wesen durch, wird ein Haus dunkel und ein Dorfbewohner verschwindet im Nebel (roter Fleck bleibt).
- Ohne Häuser ist das Dorf gefallen → Staffelende, Neustart mit einem neuen Dorf (meistgenannte Stadt aus den Kommentaren).
- Gibt es keine gültige Waffe in den Kommentaren, kommt eine aus der Reserve-Liste – dann sagt das Video **nicht** „ihr habt gewählt“.

## Staffel 1 – 12 Nächte

| Nacht | Wesen | Geheime Fähigkeit | Hinweis im Video | Schwäche | Rätsel-Spur |
|---|---|---|---|---|---|
| 1 | **The Nun** | Kugeln/Wucht gehen durch sie hindurch | Steine fliegen durch ihren Habit | Licht, Heilig | Glocke läutet, obwohl der Turm zugemauert ist |
| 2 | The Nun (stärker) | löscht Laternen im Umkreis | Laternen gehen nacheinander aus | Heilig | Fußspuren von der Kapelle zum Dorf |
| 3 | **Siren Head** | wird von Lärm angelockt und heilt sich durch Lärm | wächst bei jedem Alarm | Stille, Fangen (Netz), Kälte | er „ruft“ mit der Stimme deiner Oma |
| 4 | Siren Head + Schatten | schickt kleine Schatten voraus | Schatten krabbeln aus den Sirenen | Licht, Feuer | Omas Stimme kam aus der Kapelle |
| 5 | **Slender Man** | teleportiert, sobald man hinsieht | verschwindet in jedem Schnitt, ist näher | Fallen, Spiegel | an jedem Baum hängt ein Zettel „13“ |
| 6 | Slender Man (Tentakel) | greift über Dächer | Tentakel erscheinen erst jetzt | Feuer | ein Zettel trägt Omas Handschrift |
| 7 | **Pennywise** | verwandelt sich in das, was du fürchtest | roter Ballon schwebt über dem Haus, das er wählt | Lachen/Lärm (!) | Ballon fliegt zum Glockenturm |
| 8 | **Huggy Wuggy** + Kissy Missy | zu zweit; trennt man sie, werden sie wütend | Arme reichen über die Mauer | Fangen, Wucht | ein Plüsch-Schlüsselanhänger an Omas Tür |
| 9 | **Jason** | steht immer wieder auf | fällt, steht auf, fällt, steht auf | Wasser (See!) | Jason geht nicht ins Dorf, sondern zur Kapelle |
| 10 | **Michael Myers** | ist unsichtbar, solange niemand schreit | taucht nur im Hintergrund auf | Licht + Lärm zusammen | im Turm brennt Licht |
| 11 | **Alle zusammen** (Boss-Nacht 1) | – | – | das ganze Dorf | du gehst in die Kapelle |
| 12 | **Die Glöcknerin** (Wendung) | – | – | – | Auflösung |

**Die Wendung in Nacht 12:** In der Kapelle steht nicht ein Monster, sondern **deine Oma** mit dem Glockenseil.
„Ich läute nicht, um sie zu rufen“, sagt sie. „Ich läute, um sie **bei uns** zu halten. Wenn die Glocke schweigt, gehen sie in die Stadt.“
Ein Blick ins Tal: Hinter dem Wald liegt eine große Stadt – voller Lichter. → **Frage an die Zuschauer:** „Läuten oder schweigen? Und welche Stadt liegt hinter dem Wald?“
→ Staffel 2 spielt in der meistgenannten Stadt aus den Kommentaren (verbindet die Idee „Schreib deine Stadt“ mit dem Dorf-Spiel).

## Ablauf jeder Folge (60–75 s)
1. **Hook (0–3 s):** roter Mond, Glocke schlägt, rote gemalte Schrift „NACHT 5“, Wellen-/Uhr-Anzeige. Erstes Wort mit „du/dein“.
2. **Neue Waffe (3–15 s):** „Eure Waffe: Weihwasser-Kanone.“ Sie wird nachts im Laternenlicht aufgebaut, kurzer Probeschuss.
3. **Der 13. Schlag (15–20 s):** Stille, Nebel zieht auf, Kamera auf den Waldrand – etwas bewegt sich.
4. **Angriff (20–55 s):** Das Wesen erscheint (Figur aus `horror.js`). Waffen feuern, Schadenszahlen; dann **„0 SCHADEN“** – die Fähigkeit.
   Ein Haus wird dunkel, ein Dorfbewohner wird ins Dunkel gezogen, ein roter Spritzer an der Hauswand.
5. **Ausgang (55–63 s):** Sonnenaufgang + Glocke verstummt (geschafft) **oder** rote Schrift „3 HÄUSER ÜBRIG“.
6. **Rätsel-Spur (63–66 s):** ein kurzer Blick auf den Hinweis (Fußspur, Zettel, Licht im Turm) – ohne Erklärung.
7. **Aufruf (66–72 s):** „Morgen kommt [Wesen] zurück – stärker. Was hilft gegen das? Schreib eine Waffe. Die meisten Likes kommen in dein Dorf.“

## Pilot: Nacht 1 – „Die Nonne“ (Drehbuch-Entwurf, 20 Zeilen, ca. 70 s)
| # | Sprechtext | Bild |
|---|---|---|
| 0 | „Du wohnst in Schattental. Und heute Nacht musst du dein Dorf verteidigen.“ | roter Mond über dem Buntdorf, Nebel, Schrift „NACHT 1“ |
| 1 | „Jede Nacht um drei schlägt die Glocke. Dreizehnmal.“ | Uhr springt auf 3:00, Glockenturm, Glocke schwingt |
| 2 | „Beim dreizehnten Schlag kommt etwas aus dem Wald.“ | Waldrand, Nebel kriecht über die Straße |
| 3 | „Das Dorf hat zehn Häuser. Und zum Start nur eine Waffe: Papas Wasserwerfer.“ | Häuser-Anzeige 10, Papa mit Wasserwerfer am Brunnen |
| 4 | „Elf. Zwölf. Dreizehn.“ | Glockenschläge, Schnitt pro Zahl |
| 5 | „Stille.“ | Laternen summen, nichts bewegt sich |
| 6 | „Dann geht am Waldrand eine Laterne aus. Dann noch eine.“ | Laternen erlöschen nacheinander auf die Kamera zu |
| 7 | „Und mitten auf der Straße steht sie. The Nun.“ | The Nun im Nebel, gelbe Augen leuchten |
| 8 | „Papa schießt. Volltreffer.“ | Wasserstrahl trifft, Zahl „−25“ |
| 9 | „Aber sie kommt näher. Sie schwebt.“ | Nun gleitet ohne Schritte |
| 10 | „Die Nachbarn werfen Steine. Und die fliegen einfach durch sie hindurch.“ | Steine gehen durch, rote Schrift „0 SCHADEN“ |
| 11 | „Bei Haus Nummer neun geht das Licht aus.“ | Haus wird dunkel, Tür steht offen |
| 12 | „Herr Krause ist weg. Nur ein roter Fleck an der Tür.“ | stilisierter roter Handabdruck an der Tür |
| 13 | „Neun Häuser.“ | Anzeige 10 → 9 |
| 14 | „Dann fällt dir etwas auf: Vor dem Licht der Kapelle weicht sie zurück.“ | Nun zuckt vor dem Kapellen-Fenster zurück |
| 15 | „Fünf Uhr. Sechs Uhr. Die Sonne geht auf.“ | Uhr 5:00 → 6:00, Himmel wird orange |
| 16 | „Sie ist weg. Für heute.“ | leere Straße, Nebel löst sich |
| 17 | „Aber im Glockenturm, der seit hundert Jahren zugemauert ist, schwingt noch das Seil.“ | Nahaufnahme Turmfenster, Seil schwingt |
| 18 | „Morgen Nacht kommt sie zurück. Stärker.“ | Nun-Silhouette im Fenster der Kapelle |
| 19 | „Was hilft gegen sie? Schreib eine Waffe in die Kommentare. Die meisten Likes kommen in dein Dorf.“ | Dorf von oben, leere Bauplätze leuchten |

## Produktion
- Figuren: realistisch in echter Größe mit `real("nun")` aus `block/horror_real.js` (The Nun, Slender Man, Jason, Michael Myers, Pennywise, Huggy Wuggy, Kissy Missy; weitere folgen), Siren Head aus `horror("sirenhead")` (~12 m). Blockfiguren-Fassungen bleiben in `horror.js`.
- Kulissen: `block/horrorwelt.js` (SCHATTENTAL, KAPELLE, WALDWEG, viel Blut und Details).
- Alt: `horror("nun")` usw. (fertig, Fotostudio-Bilder in `block/katalog/horror-*.jpg`).
- Neu zu bauen: Glockenturm/Kapelle, roter Mond + Nebel (Bilderbuch-Nacht), Häuser-Anzeige, Uhr-Anzeige, Waffen-Baukasten (Wasserwerfer, Weihwasser-Kanone, Flutlicht, Netzwerfer, Feuer, Glocke …), stilisierte Blut-Decals (fest, flackerfrei).
- Stimme: Gemini „Puck“ (normale Kinderstimme), unbearbeitet (#41), nie flüstern; Horrorfiguren sprechen nie. Musik: tiefe Flächen, Herzschlag, Glocke – die Stimme bleibt klar darüber.
- Arbeit pro Folge nach dem Aufbau: ca. 1 h + 1,5 h Rendern.

## Offene Fragen an Jonathan
1. Passt „Die 13. Glocke“ als Rahmen? Dorfname „Schattental“ oder eine echte Stadt von Anfang an?
2. Stimme: Orus (ernst) oder Puck (Kind, wie Blockstadt)?
3. Eigene Serie oder statt Blockstadt?

## Keine Jumpscares (Jonathan 24.11. abends)
Jumpscares sind komplett gestrichen. Der Grusel kommt aus Stimmung, Rätsel-Spuren, Andeutung und dem Cliffhanger, nie aus einem plötzlichen Schreck.
Die Bausteine (`block/jumpscare.js`, `T.jumpscare`) bleiben in der Bibliothek, werden in dieser Serie aber nicht benutzt.

## Zeitplan: parallel zur Blockstadt (Vorschlag 24.11. abends, wartet auf Jonathans OK)
Jonathan will zwei Serien parallel: täglich 1 Blockstadt-Folge („In meiner Stadt …“) und 1 Dorf-Folge. Das sind genau die erlaubten
2 Videos pro Tag und Plattform, die deutschen Nischen-Videos bleiben pausiert.
- **25.11.:** Hörproben der düsteren Stimmen (nach 09:15, wenn das Gemini-Kontingent frisch ist), Jonathan wählt. Waffen-Set,
  Häuser und Glocken-Uhr für den Piloten bauen, Standbilder zur Abnahme.
- **26.11.:** Pilot „Nacht 1“ mit Stimme, Rendern, Abnahme durch Jonathan.
- **ab 27.11.:** täglich 1 Dorf-Folge, der Top-Kommentar bestimmt die Waffe der nächsten Nacht.
- **Uhrzeiten (Berlin, ±30 min gestreut):** Blockstadt wie bisher (Instagram 12:00, YouTube 17:30, TikTok 19:00),
  Dorf am Abend: Instagram 18:00, YouTube 20:30, TikTok 21:30. Zwei Posts derselben Plattform liegen so immer über 2 h auseinander.
- **Kontingent:** Zwei Folgen am Tag brauchen doppelt so viele Gemini-Anfragen. Ist das Kontingent knapp, kommt die Blockstadt zuerst.

## Stimme (Jonathan 24.11. abends)
Keine düstere Stimme: eine normale Erzählstimme, gern kindlich wie bei der Blockstadt (Gemini „Puck“), **unbearbeitet** (Issue #41).
Die Horrorfiguren sprechen nie. Die Hörproben düsterer Stimmen entfallen. Uhrzeiten (Instagram 18:00, YouTube 20:30, TikTok 21:30) sind von Jonathan bestätigt.
