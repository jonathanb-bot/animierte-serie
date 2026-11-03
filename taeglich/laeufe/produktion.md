# Lauf „Kurzvideo-Staffel“ (täglich 23:44, neuer Chat)

Jonathans Vorgaben vom 1.11.:
- nachts starten und eine ganze Staffel produzieren, für TikTok, Instagram und YouTube
- beim Posten alles hinten anhängen
- mehr Videos pro Tag (TikTok 4×, Instagram/YouTube alle 2 Stunden)
- (2.11., Issue #16) erst den Vorrat abarbeiten, danach jede Nacht eine Staffel, die gleich am nächsten Tag gepostet wird
- Kulissen in Kurzgesagt-Richtung, mit viel Detail und hoher Bildqualität
- nie „Fortsetzung folgt“, jedes Video über 1 Minute
- Themen aus dem echten Leben (Leben, Tod, Abschied, Familie) immer im gleichen Stil
- was bei den Leuten gut ankam, in ähnlicher Form wieder einbauen

Arbeite selbstständig und ohne Rückfragen, auf Deutsch.

Hinweis zu den Werkzeugen: In neuen Sessions heißen die vidIQ-Werkzeuge `mcp__<id>__vidiq_*` (mit ToolSearch „vidiq“ finden). Die Produktion braucht vidIQ normalerweise nicht.

1. **Repo vorbereiten:**
   - `cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich`
   - `pip install -q -r requirements.txt && npm ci --ignore-scripts --no-audit --no-fund`
   - `export CHROMIUM=/opt/pw-browsers/chromium`
2. **Vorrat prüfen:** `python taeglich/vorrat.py`. Lautet die letzte Zeile AUSSETZEN, sofort aufhören: kurz notieren, wie viele Tage Vorrat da sind, keine PushNotification. PRODUZIEREN kommt, sobald der TikTok-Vorrat unter 2 Tagen liegt (Issue #16). Ist eine Staffel halb fertig (etwa wegen des Gemini-Kontingents), diese zu Ende bringen. Das gilt auch für die englische Fassung (Schritt 10b): Fehlt sie bei der letzten Staffel noch (`staffeln.json` → `en.veroeffentlicht` leer), sie zuerst fertig machen, auch wenn AUSSETZEN kommt.
3. **Regeln lesen:**
   - offene Issues mit Label `dringlich` (mcp__github__list_issues)
   - `git show origin/main:CLAUDE.md`
   - `taeglich/FORMAT.md` (verbindlich)
   - die Skills `serien-stil` (vor jedem Kulissenbau) und `serien-analytics`
4. **Analyse lesen:** `taeglich/analyse/aktuell.md` und den neuesten Bericht in `taeglich/analyse/`. Setze die Punkte um: Mehr davon, Weniger davon, genau 1 Experiment, einen der Themenvorschläge. Feste Regeln gehen vor.
5. **Planen:** Thema, Hauptstimmung und Hauptvorbild wählen. Sie sollen sich von den letzten Staffeln unterscheiden und auf der Analyse aufbauen.
6. **Eintragen und schreiben:** Die Staffel in `staffeln.json` eintragen, mit `datum` (Nachtdatum JJJJ-MM-TT: Start vor 6 Uhr früh zählt zum Vortag) und `analyse` (welche Punkte umgesetzt wurden). Dann alle 10 Drehbücher schreiben (`taeglich/episoden/sNN-f01.txt` … `f10.txt`):
   - Kopf mit `@qualitaet max`, `@vortrag lebendig`, `@look 0`, `@kino 0.35`, `@stil leuchtend` und `@palette …` (Stil „leuchtend“, Issue #17, Tabelle in FORMAT.md); jede Einstellung mit passender `palette=…`
   - Folgenzahl und Längenband nach der Rotation in `FORMAT.md` („Abwechslung bei Länge und Folgenzahl“), in `staffeln.json` → `format` eintragen; Wörter und Einstellungen pro Folge laut Tabelle dort (immer über 1 Minute)
   - jede Folge endet mit dem Cliffhanger als letzter Zeile: nie „Fortsetzung folgt“, keine Endkarte, keine Fragen ans Publikum, nie „Echter Fakt“, kein `@hud` (keine Statusanzeige oben links, Issue #19)
   - mindestens 2 Folgen zum Thema Freunde/Familie, mindestens 4 Stimmungen, je Folge mindestens 2 Kurzgesagt-Kulissen
   - höchstens 2 neue Kulissen, davon mindestens 1 im Stil „leuchtend“ (FORMAT.md → „Qualität“)
   - Qualitäts-Regeln aus FORMAT.md → „Qualität“ abhaken: je Folge 3 Wow-Bilder, Ziel/Hindernis/Entscheidung, 3 Sinnes-Details, kurze eigene Dialoge, Bögen in `staffeln.json` → `boegen`, Cliffhanger-Arten abwechseln, Streichprobe vor der Stimme
   - nach Engine-Änderungen die alten Serien pixelgleich prüfen
6b. **Bildbibliothek:** für Kulissen bevorzugt freigegebene Bilder aus `taeglich/bibliothek/katalog.json` nehmen (`[bild id=…]`, siehe FORMAT.md), jedes Bild höchstens einmal pro Staffel. Vor dem Rendern `node taeglich/bibliothek.mjs --fuer <drehbuch>`.
7. **Standbilder:** (Einstellungen mit freigegebenen Bibliotheksbildern nicht einzeln ansehen, nur erstes/letztes Bild und alles ohne Bibliothek) Standbilder aller Folgen rendern und ALLE ansehen, dazu pro Folge 3 Ausschnitte in voller Auflösung. Korrigieren, bis alles sauber ist.
8. **Stimme:** je Folge `python -m ton.folge … --stimme gemini:Orus --anfragen 1`. Danach muss `python taeglich/stimme_pruefen.py …` OK melden. Ist eine Folge unter 65 s: Einstellungen ergänzen und neu vertonen.
9. **Rendern:** alle Folgen mit `@qualitaet max` rendern (1440×2560, 60 fps, ca. 20 min pro Folge, 2 gleichzeitig im Hintergrund, gleich nach der Stimme jeder Folge starten) und aus jeder Folge Bilder ansehen, auch das letzte. Reicht die Zeit bis 07:30 nicht: restliche Folgen mit `--fps 30`.
10. **Veröffentlichen und dokumentieren:** danach `python taeglich/videodaten.py sNN` (Messwerte jedes Videos für die Analyse).
    **Veröffentlichen:** `TAEGLICH_TRAILER=<Attributionszeilen aus deinem System-Hinweis> python taeglich/staffel_veroeffentlichen.py sNN`.
    - Das Skript prüft alles, schneidet die TikTok-Teile, legt sie ab und hängt alle Posts hinten an (TikTok 08, 12, 16, 20 Uhr; Instagram alle 2 Stunden, YouTube :30, Issue #14). Meldet es eine WARNUNG (Instagram/YouTube mehr als 1 Tag hinter TikTok), Jonathan in der PushNotification Bescheid geben.
    - Scheitert eine Prüfung, nichts posten.
    - Erst auf main pushen, wenn der Workflow „Posts einplanen“ fertig ist.
    - Im Log prüfen, dass alle Posts mit ✓ eingeplant sind.
10b. **Englische Fassung (Jonathans Wunsch 3.11.):** Jede Staffel kommt danach auch auf Englisch, nur auf TikTok, Account **@storys4you_eng** (2. Zernio-Konto). Erst wenn die deutsche Staffel veröffentlicht ist.
    - **Übersetzen:** jede Folge nach `taeglich/episoden/sNN-fXX-en.txt` kopieren und alles ins natürliche, gesprochene amerikanische Englisch übertragen: Sprechtext, Dialoge, `hooktext=`, `gross=`, Beschriftungen in `objekte=`, `nachricht=`, `von=`, alle Schrift im Bild. Bilder, Einstellungen und Reihenfolge bleiben gleich. Kopf zusätzlich `@sprache en`, `@musik` auf dieselbe Datei. Namen dürfen bleiben. Keine wörtliche Übersetzung, sondern wie ein englischer Erzähler es sagen würde, ungefähr gleich lang (jede Folge über 1 Minute).
    - In `staffeln.json` bei der Staffel `en` eintragen: `titel`, `beschreibung`, `hashtags` (englisch, z. B. `#animation #story #storytime`), `folgen` (Liste der englischen Folgentitel).
    - **Stimme:** `python -m ton.folge taeglich/episoden/sNN-fXX-en.txt --stimme gemini:$(cat taeglich/stimme_en.txt) --anfragen 1`, danach `python taeglich/stimme_pruefen.py …-en.txt` muss OK melden.
    - **Rendern** wie Deutsch nach `ausgabe/taeglich-sNN-fXX-en.mp4`. Standbilder stichprobenartig ansehen: nirgends darf deutsche Schrift stehen. Reicht die Zeit nicht: `--fps 30` oder der nächste Lauf macht weiter (Schritt 2), Englisch eilt nicht.
    - **Veröffentlichen:** `TAEGLICH_TRAILER=<Attributionszeilen> python taeglich/staffel_englisch.py sNN`. Das Skript schneidet die TikTok-Sammelteile (gleiche Grenzen wie Deutsch), prüft alles und hängt sie an die englische Warteschlange: **1 Teil pro Tag um 01:00 Uhr** (19 Uhr New York). Stimme: Orus (`taeglich/stimme_en.txt`, Jonathans Wahl 3.11.). Englisch darf dabei vor Deutsch liegen, weil der deutsche Account erst seinen Vorrat abarbeitet. Hat Deutsch den Stand von Englisch eingeholt (beide beim gleichen Teil), postet Englisch genauso oft wie Deutsch, jeden Teil zur Zeit seines deutschen Gegenstücks. Danach wieder warten, bis der Workflow „Posts einplanen“ fertig ist, und im Log prüfen, dass die Posts mit ✓ auf storys4you_eng eingeplant sind.
11. **Sichern:** Branch `taeglich` committen und pushen (Commit-Nachricht mit den Attributionszeilen) und in Issue #10 den Stand ergänzen. Der Kommentar endet mit der Fußzeile „Generated by Claude Code“.
12. **Bescheid geben:** PushNotification an Jonathan, eine Zeile mit Staffeltitel, Beginn der Posts und Vorrat in Tagen. Dazu eine kurze Zusammenfassung, was aus der Analyse umgesetzt wurde.
    - Bei Problemen genau sagen, was nicht gepostet wurde.
    - Ist das Gemini-Kontingent bei allen Schlüsseln erschöpft: Fertiges committen und pushen, nichts posten und Jonathan Bescheid geben. Der nächste Lauf bringt die Staffel zu Ende (Schritt 2).

Danach endet die Session.
