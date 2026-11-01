# Analyse vor jeder Staffel

Jonathans Wunsch vom 1.11.2026: Vor jeder Staffel gründlich auswerten, **was bei den Leuten gut ankam**, und das in ähnlicher Form wieder einbauen. Die geplante Aufgabe „Analyse vor der Staffel“ läuft jeden 2. Abend um 21:39 Uhr, also vor der Produktion um 23:44 Uhr. Die Produktion liest das Ergebnis (`taeglich/analyse/aktuell.md`) und setzt es um.

Feste Regeln (Issues mit Label `dringlich`, `taeglich/FORMAT.md`) gehen immer vor: Eine Analyse darf nie dazu führen, dass Videos kürzer als 1 Minute werden, Fragen ans Publikum bekommen oder „Fortsetzung folgt“ zeigen.

## Datenquellen

1. **Zernio: eigene Zahlen von TikTok, Instagram und YouTube, kostenlos.** Den Workflow „Posts einplanen“ mit `analyse=true` starten (`mcp__github__actions_run_trigger`, `run_workflow`, `posten.yml`, ref `main`, inputs `{"analyse": "true"}`). Warten, bis `posten/analyse.json` auf `main` ein neues `erstellt` hat (ca. 2–5 min; `git fetch origin main`), dann lesen. Für jeden veröffentlichten Post stehen dort die Analytics (Aufrufe, Likes, Kommentare, Shares, Saves, Reichweite, bei Reels Wiedergabezeit und Abbruchquote) und für jedes Konto die Zahlen der letzten 30 Tage. Fehler stehen unter `fehler`. Läuft gerade ein anderer Posting-Lauf, wartet der Analyse-Lauf in der Warteschlange.
2. **vidIQ:** YouTube-Analytics (Zuschauerbindung, Traffic-Quellen), Trends und Ausreißer. Credit-Plan siehe `FORMAT.md` → „Auswertung mit vidIQ“. Immer zuerst `vidiq_balance` abfragen und 10 Credits Reserve lassen. Diese Abfragen macht jetzt die Analyse-Aufgabe, nicht mehr die Produktion.
3. **Was in jedem Video steckt:** `posten/plan.json` (welcher Post = welches Video, welche Uhrzeit), `taeglich/staffeln.json` (Thema, Stimmung, Hook und Kulissen je Folge) und die Drehbücher. Für die alten Serien stehen die Folgentitel in `geprueft.json` auf `youtube-upload`.
4. **Außen:** WebSearch (`mode: extended` erlaubt, 3–6 Suchen) zu dem, was bei deutschsprachigen Story-, Animations- und Erklär-Shorts gerade gut läuft, dazu `vidiq_instagram_tiktok_outlier_search` nach Credit-Plan. Nur Muster übernehmen (Hook-Art, Tempo, Thema, Länge, Stimmung), nie fremde Inhalte.

## Auswertung

`python taeglich/analyse_auswerten.py` liest `posten/analyse.json` und `posten/plan.json` und erstellt daraus die Tabellen:

- **pro Post:** Aufrufe, Likes, Kommentare, Shares, Saves, Engagement-Rate und, falls vorhanden, Wiedergabezeit und Abbruchquote. Dazu **Aufrufe pro Stunde seit Veröffentlichung**, höchstens über 72 h gerechnet. So lassen sich alte und neue Posts fair vergleichen.
- **Gruppen:** pro Plattform, pro Serie bzw. Staffel, pro Stimmung, pro Uhrzeit und pro Länge.
- **Top 5 und Flop 5 je Plattform:** Bei jedem Video ansehen, warum es so lief (Hook im ersten Satz, Thema, Stimmung, Kulissen, Länge, Uhrzeit).
- **Vorsicht bei wenig Daten:** Unter ca. 10 Posts pro Gruppe ist ein Ergebnis nur eine „Tendenz“, noch keine Regel. Posts jünger als 24 h nur mit Hinweis werten.

## Ergebnis (jedes Mal)

1. `taeglich/analyse/JJJJ-MM-TT.md`: der Bericht mit Zahlen, Top und Flop, Erkenntnissen und Trends von außen.
2. `taeglich/analyse/aktuell.md`: **kurze, verbindliche Vorgaben für die nächste Staffel** (höchstens 12 Punkte) in vier Abschnitten:
   - **Mehr davon:** was gut ankam, zum Beispiel „Hooks mit einer Zahl über dein Leben“, „Stimmung warm + Großstadt bei Nacht“, „Familie-Folgen“
   - **Weniger davon:** was schwach lief
   - **Ausprobieren:** genau 1 Experiment pro Staffel, damit wir dazulernen
   - **Themenvorschläge:** 2–3 Staffel-Ideen, die zu den Ergebnissen passen
3. `taeglich/kennzahlen.json`: Verlauf (Datum, Follower/Abonnenten je Plattform, Summen der letzten 30 Tage) und `meilensteine`. Ist eine Schwelle erreicht (TikTok 10.000 = Creator Rewards, YouTube 1.000, Instagram 10.000), sofort eine PushNotification an Jonathan.
4. Branch `taeglich` committen und pushen. Eine PushNotification sonst nur bei etwas Auffälligem (Meilenstein, starker Absturz, Posting-Fehler bei Zernio).
