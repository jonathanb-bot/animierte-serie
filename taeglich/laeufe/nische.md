# Lauf „Was wäre, wenn du …“ (täglich 06:17, neuer Chat) – ein Video am Tag nach den Analysedaten

Jonathans Vorgabe 21.11.: **Keine Staffel und keine Serie wird mehr fortgesetzt. Es wird nur noch nach den Analysedaten produziert und hochgeladen.** Grundlage: große Auswertung `taeglich/analyse/2026-11-22-abschluss.md` (Datum 21.11.) und die jeweils aktuellen Vorgaben in `taeglich/analyse/aktuell.md` (schreibt der Lauf „Wochenanalyse“). Arbeite selbstständig, ohne Rückfragen, auf Deutsch. Qualität vor Quantität (#30): lieber einen Tag aussetzen als ein schwaches Video.

**Pro Tag genau 1 neues Video**, eigenständig (ohne Vorwissen verständlich, keine Teile, keine Fortsetzung), deutsch und englisch neu eingesprochen. Mehr nicht: Der Masse-Test hat beide TikTok-Konten an die 0-Grenze gebracht (Bericht Abschnitt 2).

## Upload-Plan (gilt bis die Wochenanalyse ihn ändert)

| Konto | Takt | Uhrzeit (Berlin, das Skript streut ±30 min, #26) |
|---|---|---|
| Instagram deutsch (sto.rys4you) | 1/Tag | 12:00 |
| YouTube deutsch | 1/Tag | 17:30 |
| TikTok deutsch (storys4you.de1) | 1/Tag (7-Tage-Erholungstest bis 28.11.) | 19:00 |
| Instagram englisch | 1/Tag | 22:00 |
| YouTube englisch | 1/Tag | 23:30 |
| TikTok englisch (storys4you_eng) | 1/Tag (Erholungstest bis 28.11.) | 01:00 (Nacht danach, US-Abend) |

- Englisch nie vor dem deutschen Gegenstück.
- Legt Jonathan neue YouTube-Kanäle an (Empfehlung im Bericht, Abschnitt 10), gehen die YouTube-Posts erst nach seinen 5–7 Tagen Aufwärmen dorthin; bis dahin auf die bisherigen Kanäle. Nichts löschen, nichts privat stellen.
- Höchstens 2 Hashtags (macht `veroeffentlichen.py` automatisch, die zwei passendsten zuerst eintragen).

## Ablauf

1. **Repo vorbereiten:** `cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich`, dann `pip install --default-timeout=30 --retries 5 -q -r requirements.txt && npm ci --ignore-scripts --no-audit --no-fund`, `export CHROMIUM=/opt/pw-browsers/chromium`.
2. **Schon erledigt?** Steht in `posten/plan.json` auf `main` (`git show origin/main:posten/plan.json`) schon ein Post `taeglich-insta-n…` mit heutigem Datum (nicht in `loeschen`): aufhören. Ist das gestrige Video deutsch veröffentlicht, aber nicht englisch (`taeglich/verlauf.json` → `en.veroeffentlicht` fehlt): erst Englisch fertig machen (Schritt 9).
3. **Regeln lesen:** offene Issues mit Label `dringlich` (vor allem #38 und das Issue zur Gewinner-Nische), `git show origin/main:CLAUDE.md`, `taeglich/FORMAT.md` (Abschnitt „Regeln aus Issue #38“ zuerst, dann „Qualität“, „Einblendungen“, „Stil leuchtend“), `taeglich/analyse/aktuell.md`, Skill `serien-stil` vor jeder neuen Kulisse.
4. **Idee wählen:** die nächste offene Idee in `taeglich/nische.json` (Reihenfolge aus `aktuell.md`, falls dort eine steht). Höchstens jedes 4. Video `art: grusel`. Id = `nische-nNNN` (fortlaufend, dreistellig). In `nische.json` `id`, `datum` und `status: "in Arbeit"` eintragen.
5. **Drehbuch** `taeglich/episoden/nische-nNNN.txt`, Kopf: `@qualitaet max`, `@vortrag lebendig`, `@klang studio`, `@einblenden aus`, `@look 0`, `@kino 0.35`, `@stil leuchtend`, `@palette …` (bei Grusel `@look 0.75`, `palette=blau`), Untertitel aus (E4 ohne Unterschied, ruhigeres Bild). Bauplan nach den Analysedaten:
   - **Aufbau = Dopamin-Loop, zwei Schleifen hintereinander** (Jonathan 21.11., Vorbild-Video „Dopamin Loop“, Regeln in `taeglich/FORMAT.md` → „Dopamin-Loop“). Jede Schleife hat 4 Schritte:
     1. **Einsatz** – Figur zum Mitfiebern (du + jemand aus deiner Familie), was auf dem Spiel steht, Zeitdruck. Schleife 1: Satz 1 = die Prämisse über dich, mit „du/dein“, Konflikt in 1–2 s, höchstens ca. 14 Wörter, Hook-Text groß im ersten Bild. Kein Einstieg mit Ort, Regel oder Aufzählung, keine Vorgeschichte.
     2. **Große Frage** – nur so viel Kontext, dass im Kopf eine konkrete Frage aufploppt („Wofür reichen die letzten Abende?“). Als Aussage erzählt, nie als Frage ans Publikum (#8).
     3. **Finte** – alles deutet auf A, dann dreht die Geschichte auf B (die naheliegende Erklärung stimmt nicht). Das ist der Moment, der die Leute hält.
     4. **Rehook** – sofort eine neue, größere Frage, die die nächste Schleife startet.
     - **Zeitplan (ca. 70 s):** Schleife 1 von 0 bis ca. 30 s (Finte bei ca. 20–25 s, Rehook bei ca. 28–32 s), Schleife 2 von ca. 30 bis 70 s, eine Einstellung davon warm mit Familie (Esstisch, Kinderzimmer). Die **zweite Finte ist das Ende**: harte Pointe oder starkes Schlussbild, das die Prämisse umdreht. Der letzte Rehook bleibt im Kopf, öffnet aber keine nächste Folge (es gibt keine), nie „Fortsetzung folgt“, kein Aufruf, keine Endkarte (#8, #11). Nie „Echter Fakt“ (#2), kein `@hud` (#19).
     - In den Storyboard-Zeilen jeden Schritt benennen (`// 22 s – Finte 1: …`).
   - **Alle 3–5 s ein Bildwechsel oder sichtbare Bewegung**, keine Einstellung ohne neue Information, mindestens 6 Einblendungen/Textschilder an Schlüsselmomenten (#38 P. 10, #29), 3 Wow-Bilder. Wie im Vorbild-Video: bei Einsatz, Frage, Finte und Rehook je ein großes Schlüsselwort im Bild (`gross=`/`ein=`, z. B. „0 ABENDE“, „FALSCH“).
   - **62–75 s**, ca. 170–200 Wörter, ca. 20–22 Einstellungen. Eine Figurenstimme (Kore/Zephyr/Gacrux) für 1–2 Zeilen ist erlaubt.
   - Eigene Kulisse/Welt pro Video, keine Klon-Vorlage (#38 P. 1). Kulissen aus der Bildbibliothek bevorzugt (`node taeglich/bibliothek.mjs --fuer <drehbuch>`), höchstens 1 neue Kulisse.
   - Streichprobe: jeden Satz streichen, der die Geschichte nicht weiterbringt.
   - **Storyboard-Zeilen** (`taeglich/analyse/opus-videos-techniken.md`): über jeder Einstellung `// <Sekunde> – <Absicht>`, Schnitte auf ein festes Raster von ca. 3–4 s, das Bild zeigt die Prämisse (z. B. Zähler, der rückwärts läuft), statt sie nur zu begleiten.
6. **Standbilder:** `node render.mjs taeglich/episoden/nische-nNNN.txt --bilder`, zuerst als Kontaktbogen ansehen (`montage ausgabe/taeglich-nische-nNNN-bilder/*.jpg -tile 6x -geometry 240x427+4+4 ausgabe/taeglich-nische-nNNN-kontakt.jpg`: Tempo, Abwechslung, keine Schrift unter den TikTok-/Reels-Knöpfen rechts und im unteren Fünftel), dann alle einzeln ansehen (erstes Bild hell und klar, nichts unter den Untertiteln, Schrift lesbar), korrigieren, bis alles sauber ist.
7. **Stimme:** `python -m ton.folge taeglich/episoden/nische-nNNN.txt --stimme gemini:Orus --anfragen 1`, danach muss `python taeglich/stimme_pruefen.py taeglich/episoden/nische-nNNN.txt` OK melden (Orus normal und voll, nie flüstern, ca. 118 Hz). Unter 62 s oder über 75 s: Text anpassen, neu vertonen.
8. **Englisch übersetzen und vertonen:** `taeglich/episoden/nische-nNNN-en.txt` wie `produktion.md` Schritt 10b (natürliches amerikanisches Englisch, alle Schrift im Bild, Kopf `@sprache en`), Stimme `gemini:$(cat taeglich/stimme_en.txt)` `--anfragen 1`, `stimme_pruefen.py` muss OK melden, Tonhöhe unter 1,5 Halbtönen Abstand.
9. **Rendern auf GitHub:** Drehbücher, Stimme, ggf. Engine committen (`[skip ci]`), auf `taeglich` pushen, Workflow „Kurzvideos rendern (taeglich)“ (`taeglich-rendern.yml`, `main`) mit `folgen=nische-nNNN,nische-nNNN-en` starten, einmal warten, `git fetch origin taeglich-ausgabe`, beide Videos nach `ausgabe/taeglich-nische-nNNN.mp4` bzw. `…-en.mp4` holen. Erstes Bild, letztes Bild und 3 Ausschnitte in voller Auflösung ansehen, im englischen Video darf keine deutsche Schrift stehen. Nie mit weniger Qualität rendern (#30).
10. **Eintrag in `taeglich/verlauf.json`:** `id` nische-nNNN, `titel` (echter Titel, kurz, neugierig, z. B. „Dein Handy zählt die Abende“), `beschreibung` (2 Sätze, die Prämisse), `hashtags` (die 2 passendsten zuerst, z. B. `#waswärewenn`, `#animation`), `tags`, `emoji`, `stimme` Orus, dazu `en` mit `titel`, `beschreibung`, `hashtags`, `tags`.
11. **Veröffentlichen** (Zeiten aus dem Upload-Plan, heutiges Datum; ist eine Zeit schon vorbei, den nächsten Tag nehmen):
    - Deutsch: `TAEGLICH_TRAILER=<Attributionszeilen> python taeglich/veroeffentlichen.py nische-nNNN --insta-zeit <heute>T12:00 --yt-zeit <heute>T17:30 --zeit <heute>T19:00`
    - warten, bis „Posts einplanen“ fertig ist, im Log prüfen, dass alle 3 Posts mit ✓ eingeplant sind
    - Englisch: `TAEGLICH_TRAILER=<Attributionszeilen> python taeglich/veroeffentlichen.py nische-nNNN --englisch --insta-zeit <heute>T22:00 --yt-zeit <heute>T23:30 --zeit <morgen>T01:00`, wieder im Log prüfen (Konten storys4you_eng und zernio:3)
    - Scheitert eine Prüfung (Ton, Länge, schwarzes erstes Bild): nichts posten, Fehler beheben.
12. **Angeheftete Frage (#38 P. 7):** eine kurze, zum Video passende Frage für den ersten Kommentar formulieren (nie im Video selbst) und in `verlauf.json` → `kommentar_frage` (deutsch) und `en.kommentar_frage` eintragen. Posten und Anheften macht die iMac-Aufgabe (Zernio kann nicht anheften). Solange es dafür keinen Ablauf gibt, nur eintragen.
13. **Sichern:** `nische.json` → `status: "veröffentlicht"`, alles committen und auf `taeglich` pushen (Attributionszeilen). Keine PushNotification, außer bei Problemen (eine Zeile: was nicht gepostet wurde und warum).

Danach endet die Session.
