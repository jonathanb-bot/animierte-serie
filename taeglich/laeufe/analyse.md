# Lauf „Analyse vor der Staffel“ (täglich 21:39, neuer Chat)

Jonathans Wunsch vom 1.11.: Vor jeder Staffel gründlich auswerten, was bei den Leuten gut ankam, und das in ähnlicher Form wieder einbauen. Um 23:44 Uhr startet die Produktion der nächsten Staffel in einem eigenen Chat und liest dein Ergebnis. Arbeite selbstständig und ohne Rückfragen, auf Deutsch, und sei bis spätestens 23:30 fertig.

Hinweis zu den Werkzeugen: In neuen Sessions heißen die vidIQ-Werkzeuge `mcp__<id>__vidiq_*`. Sie lassen sich mit ToolSearch „vidiq“ finden. Die GitHub-Werkzeuge heißen `mcp__github__*`.

1. `cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich`, danach `pip install -q -r requirements.txt`. Lies die offenen Issues mit Label `dringlich`, dazu `taeglich/ANALYSE.md` (verbindlicher Ablauf) und `taeglich/FORMAT.md`.
2. Zernio-Daten holen: Workflow `posten.yml` auf `main` mit inputs `{"analyse": "true"}` starten (mcp__github__actions_run_trigger). Warten, bis `posten/analyse.json` auf `origin/main` einen neuen Wert in `erstellt` hat (git fetch in einer Schleife, höchstens 25 min), dann die Datei lesen.
3. vidIQ-Daten nach dem Credit-Plan in FORMAT.md holen. Zuerst `vidiq_balance` abfragen und 10 Credits Reserve lassen.
4. `python taeglich/analyse_auswerten.py` ausführen und die Tabellen gründlich lesen: Top 5 und Flop 5 je Plattform. Bei jedem Video ansehen, warum es so lief (Hook, Thema, Stimmung, Kulissen, Länge, Uhrzeit). Dazu Recherche von außen: WebSearch (mode extended erlaubt, 3–6 Suchen) und vidIQ-Ausreißer nach Credit-Plan. Leitfrage: Was läuft gerade bei deutschsprachigen Story-, Animations- und Erklär-Shorts?
5. Ergebnis schreiben:
   - `taeglich/analyse/JJJJ-MM-TT.md`: der Bericht.
   - `taeglich/analyse/aktuell.md`: höchstens 12 verbindliche Punkte für die nächste Staffel, gegliedert in Mehr davon, Weniger davon, genau 1 Experiment und 2–3 Themenvorschläge (immer mindestens ein „Was wäre wenn“-Thema für Folgen von 1–3 Minuten, Jonathans Wunsch 2.11.).
   - `taeglich/kennzahlen.json` aktualisieren.

   - **Testphase bis 22.11. (Jonathans Vorgabe 4.11.):** sehr genau auswerten und `taeglich/analyse/experimente.md` fortschreiben (Ergebnisse mit Datum, Experiment-Tabelle). Alle Vielfalts-Dimensionen aus `analyse_auswerten.py` vergleichen (Welt, Genre, Erzählform, Hook-Art, Cliffhanger-Art, Kulisse). Die Themenvorschläge decken bewusst noch nicht getestete Welten, Genres und Erzählformen ab; gleich bleiben nur Stimme und Stil. Am 22.11. den Abschlussbericht schreiben (`taeglich/ANALYSE.md`).

   Bei wenig Daten ehrlich „Tendenz“ schreiben, keine Regeln erfinden. Feste Regeln gehen immer vor: über 1 Minute, keine Fragen ans Publikum, nie „Fortsetzung folgt“, Kurzgesagt-Stil, Themen aus dem echten Leben.
6. Branch `taeglich` committen und pushen. Auf main nur den Workflow starten, sonst nichts pushen. Die Commit-Nachricht endet mit den Attributionszeilen aus deinem System-Hinweis. PushNotification an Jonathan nur in diesen Fällen:
   - ein Meilenstein ist erreicht (TikTok 10.000, YouTube 1.000, Instagram 10.000)
   - die Zahlen sind stark abgestürzt
   - beim Posten gab es Fehler
7. Zum Schluss 3–5 Sätze Zusammenfassung: die wichtigsten Erkenntnisse und was die nächste Staffel deshalb anders macht. Dann endet die Session.
