# Abend-Kontrolle (täglich 20:13, neuer Chat)

Jonathans Wunsch vom 7.11.2026: Jeden Abend auf allen Konten die **letzten 4 Videos** prüfen, ob alles passt: Stimme, Bild, Ton, Text, ob sie überhaupt online sind.

## Ablauf

1. Offene Issues mit Label `dringlich` lesen (`mcp__github__list_issues`, Repo `jonathanb-bot/animierte-serie`).
2. Frischen Stand holen: Workflow „Posts einplanen“ (`posten.yml`) auf `main` mit `status=true` starten (`mcp__github__actions_run_trigger`, Methode `run_workflow`). Warten, bis er fertig ist (mit Monitor/Wartezeit, nicht im Sekundentakt abfragen), dann `git fetch origin main`.
3. Im frischen Container: `pip install -r requirements.txt` (faster-whisper, numpy, soundfile). ffmpeg ist da.
4. `python taeglich/kontrolle.py --anzahl 4` ausführen. Der Bericht landet in `ausgabe/kontrolle/bericht.md`, dazu je Video ein Kontaktbogen `ausgabe/kontrolle/<post-id>.png` (6 Standbilder).
5. **Jeden Kontaktbogen ansehen** (Read auf die PNG) und prüfen:
   - Bild sauber, nichts kaputt, keine leeren oder halb gezeichneten Kulissen, Figuren vollständig
   - englische Videos: kein deutscher Text im Bild; deutsche Videos: kein englischer Text
   - Untertitel passend zur Staffel (ungerade Staffeln ab s03 ohne, gerade mit)
   - erstes Bild nicht schwarz. **Ausnahme:** Videos, die vor dem 7.11. gerendert wurden, blenden noch ein (Jonathan: nur für die Zukunft ändern). Das nur erwähnen, nicht reparieren.
6. Messwerte aus dem Bericht prüfen:
   - **Stimme:** Grundton ca. 118 Hz (seit 13.11., Jonathan: „zu tief“; Folgen bis 12.11. haben 106 Hz), höchstens 1,5 Halbtöne daneben (Issue #25). Sprache passt zum Konto.
   - **Gesprochener Anfang** passt zur Folge im Post-Text (richtige Folge, richtige Sprache, keine alte Stimme).
   - Lautheit ca. −15 LUFS (zwischen −18,5 und −12 ist ok).
   - Status bei Zernio `published` mit Link. Fehler bei Zernio (z. B. 429, abgelehnt) sind ein Mangel.
7. **Wenn etwas nicht passt:**
   - Video ist noch geplant (nicht veröffentlicht): reparieren (neu vertonen/rendern, auf `youtube-upload` ersetzen) oder mit `loeschen` in `posten/plan.json` zurückziehen und neu einplanen. Gleiches Video innerhalb 24 h braucht geänderten Text (sonst HTTP 409 bei Zernio).
   - Video ist schon veröffentlicht: Zernio kann es nicht löschen. Jonathan per PushNotification Bescheid geben (welches Konto, welcher Post, Link, was falsch ist), damit er es selbst löscht. Danach die betroffenen Teile neu einplanen, damit die Reihenfolge der Serie stimmt.
   - Gemini-Kontingent ist knapp (siehe `produktion.md`): Reparaturen nur, wenn wirklich nötig.
8. Ergebnis kurz in `taeglich/analyse/kontrolle-log.md` anhängen (Datum, je Konto ✓/✗, Mängel, was getan wurde), committen mit `[skip ci]`, auf `taeglich` pushen.
9. Wenn alles passt: **keine** PushNotification. Nur bei Mängeln eine kurze Nachricht an Jonathan.
