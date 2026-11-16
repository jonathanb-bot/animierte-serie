# Lauf „Masse-Test“ (täglich 00:44 und 12:44, neuer Chat) – nur bis zur großen Analyse am 22.11.2026

Jonathans Vorgabe vom 16.11.: Bis zum 22.11. **8–10 Videos am Tag auf jeder Plattform** (TikTok, Instagram, YouTube, deutsch und englisch), alles vorproduziert. Am 22.11. wird alles pausiert, dann läuft die große Analyse (`analyse-22-11.md`), die die Massephase mit der Qualitätsphase davor vergleicht. Die Song-Edits (Branch `edits-download`) laufen auf einem anderen Konto und haben damit nichts zu tun.

Arbeite selbstständig, ohne Rückfragen, auf Deutsch. Grundlage ist `taeglich/laeufe/produktion.md` (Schritte 1–12) mit diesen **Abweichungen**:

- **Qualität in Kurzform (Issue „Masse-Test“, setzt #30 bis 22.11. aus):** Stil „leuchtend“, Stimme Orus, `@qualitaet max`, erstes Bild nie schwarz, nie „Fortsetzung folgt“, keine Fragen ans Publikum, nie „Echter Fakt“, Du-Erzählung (#31) bleiben Pflicht. Weniger Feinschliff: Standbilder nur je Folge erstes Bild, letztes Bild und 3 Stichproben ansehen (statt alle), höchstens 1 neue Kulisse pro Staffel, sonst vorhandene Kulissen und die Bildbibliothek nutzen. `stimme_pruefen.py` muss weiter OK melden. Nie unter 62 s.
- **Vorrat ignorieren:** `vorrat.py` nicht abwarten (kein AUSSETZEN).
- **Format:** 10 Folgen à 62–75 s pro Staffel (für s05 gilt der Staffelplan: 8 Folgen à 63–70 s). Jede Staffel eine neue Welt (Testphase #22), Staffelplan `taeglich/analyse/staffelplan-s04-s12.md` der Reihe nach.
- **Veröffentlichen mit `--masse`:** `TAEGLICH_TRAILER=<Attributionszeilen> python taeglich/staffel_veroeffentlichen.py sNN --masse` (jede Folge einzeln, auch TikTok, 9 Takt-Zeiten am Tag 07:30–19:30 ±30 min, 21 Uhr bleibt für „Bis zum Mond“; es wird nur bis 21.11. eingeplant, der Rest bleibt ungeplant). Englisch genauso: `python taeglich/staffel_englisch.py sNN --masse` (US-Abend 14:00–02:00 Berlin, jede Folge einzeln auf TikTok @storys4you_eng, Instagram und YouTube englisch).

## Was dieser Lauf tut (in dieser Reihenfolge)
1. Repo vorbereiten wie `produktion.md` Schritt 1, Regeln lesen (Schritt 3, inkl. offener Issues mit Label `dringlich`).
2. **Heute schon 22.11. oder später?** Dann nichts produzieren und nichts posten; diesen Lauf mit `update_trigger` (`enabled=false`) ausschalten (Namen „Masse-Test (neuer Chat, 00:44)“ und „Masse-Test (neuer Chat, 12:44)“) und aufhören.
3. **Englisch nachziehen:** Hat die letzte deutsche Staffel (`staffeln.json`) schon `veroeffentlicht`, aber `en.veroeffentlicht` fehlt: zuerst die englische Fassung fertig machen (`produktion.md` Schritt 10b, mit `--masse`).
4. **Neue Staffel nötig?** Zähle in `posten/plan.json` (main) die deutschen TikTok-Posts der Serie `taeglich` mit Zeit ab jetzt (nicht in `loeschen`). Liegen weniger als 14 in der Zukunft und ist heute höchstens der 20.11.: eine neue Staffel produzieren (Schritte 4–10 von `produktion.md` mit den Abweichungen oben), veröffentlichen mit `--masse`, dann gleich die englische Fassung (Schritt 3 hier). Eine angefangene Staffel (Drehbücher/Stimme da, aber nicht veröffentlicht) immer zuerst fertig machen.
5. **Rendern** immer über den GitHub-Workflow „Kurzvideos rendern (taeglich)“ (bis 6 Folgen gleichzeitig), deutsch und englisch können im selben Durchgang laufen.
6. **Notieren** für die Analyse: in `taeglich/analyse/experimente.md` bei der Zeile „E-Masse“ die Staffel, Zahl der Posts und das Datum ergänzen (die Zeile beim ersten Lauf anlegen: Hypothese „Mehr Posts am Tag bringen insgesamt mehr Aufrufe und Follower, auch wenn der Schnitt pro Video sinkt“, Messgröße: Aufrufe/Tag, Follower/Tag, Schnitt pro Video, Vergleich zur Woche davor).
7. Sichern (Schritt 11) und Bescheid geben (Schritt 12, eine Zeile: Staffel, Zahl der eingeplanten Posts je Plattform, bis wann eingeplant ist).

Reicht die Zeit oder das Gemini-Kontingent nicht: Fertiges sichern, nichts halb posten, der nächste Lauf (12 Stunden später) macht weiter.
