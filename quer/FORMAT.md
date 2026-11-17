# Querformat-Serie („quer“) – Format (Jonathan 17.11.2026, Issue #37)

Lange animierte Du-Geschichten im **Querformat 16:9** für YouTube, **8–12 min**, **Deutsch + Englisch**, **3× pro Woche (Mo/Mi/Fr)**. Läuft **getrennt von der Analyse** der Kurzvideos: Serie `quer`/`quer-en`, sie zählt nicht in den Vergleich Masse- gegen Qualitätsphase (#34, #36). Bauanleitung aus der Vorlagen-Analyse: `quer/vorlagen.md`.

## Feste Regeln (wie überall)
Stimme Orus (`@vortrag lebendig`, `@klang studio`, nie flüstern), Stil „leuchtend“, `@qualitaet max`, Du-Erzählung (#31: alle Figuren gehören zu dir), nie „Fortsetzung folgt“ (#11), **keine Fragen ans Publikum** (#8), nie „Echter Fakt“ (#2), kein `@hud` (#19), KI-Haken aus (#15), erstes Bild nie schwarz, Blut höchstens angedeutet. Fakten nur, wenn sie stimmen (vorher prüfen). Nie fremde Figuren, Marken oder Szenen nachbauen.

## Drehbuch
- Datei `taeglich/episoden/quer-qNN.txt` (Englisch `quer-qNN-en.txt`), Metadaten in `quer/folgen.json`.
- Kopf: `@format quer`, `@qualitaet max`, `@vortrag lebendig`, `@klang studio`, `@mund zitate`, `@einblenden aus`, `@look 0`, `@kino 0.35`, `@stil leuchtend`, `@palette …`, `@whoosh aus`, `@musik musik/quer-qNN.mp3`, Untertitel an (Querformat, unten).
- **Umfang:** 1350–1750 Wörter, 110–150 Einstellungen, 6–8 Kapitel (`== Minute 0 ==`, `== Stunde 3 ==` …; die Überschriften werden später YouTube-Kapitel).
- **Aufbau** (aus den Vorlagen):
  1. *0–20 s Hook:* alltäglicher Moment mit „du/dein“, dann der Bruch und ein Versprechen (wie es ausgeht oder warum es einmalig ist). Hook-Text im Bild.
  2. *Kapitel nach Zeit:* jede Kapitelüberschrift nennt Uhrzeit oder Dauer, die erste Einstellung jedes Kapitels zeigt sie (Titelkarte oder Uhr im Bild).
  3. *Alle 60–90 s* eine neue Gefahr, Entdeckung oder Wendung, nie zwei ruhige Minuten am Stück.
  4. *Pro Minute 1–2 Einblendungen* (`ein=`) mit echten Zahlen und Fakten, dazu je Kapitel 1 Wow-Bild (Panorama, großes Licht).
  5. *Familie und Gefühl:* deine Mama, dein Opa, dein bester Freund kommen in Gedanken, am Telefon oder in Erinnerungen vor. Sinnesdetails statt Erklärungen. Figurenstimmen (Kore/Gacrux/Zephyr) sparsam, höchstens 6 Zeilen pro Video.
  6. *Ende:* Auflösung + Nachwirkung („Seitdem …“), letzter Satz stark. Kein Aufruf, keine Frage, keine Endkarte. Ums Abonnieren bittet nur die Beschreibung.
- **Bild im Querformat:** Die Kamera zeigt automatisch einen breiteren Weltausschnitt (Zoom 0,6). Figuren stehen in der Mitte, die Ränder füllt die Kulisse. Für Totalen `zoom-raus`, für Gefühl `gesicht`. Anzeigen oben im Bild (z. B. `nachtbus`) mit `anzeige_y` tiefer setzen. Einblendungen und Untertitel sind im Verhältnis zur Bildhöhe gleich groß wie auf dem Handy, `ein_y` gilt in Hochkant-Koordinaten (sichtbar 0–1920).

## Ablauf (Lauf `taeglich/laeufe/quer.md`)
1. Drehbuch DE schreiben → Standbilder `node render.mjs taeglich/episoden/quer-qNN.txt --bilder` (Querformat-Bilder ansehen).
2. Stimme: `python -m ton.folge taeglich/episoden/quer-qNN.txt --stimme gemini:Orus --anfragen 7` → `python taeglich/stimme_pruefen.py …` muss OK melden, Tonhöhe unter 1,5 HT.
3. Englisch übersetzen (`quer-qNN-en.txt`, `@sprache en`), vertonen, prüfen.
4. Rendern auf GitHub: Workflow „Querformat rendern (lange Videos)“ (`quer-rendern.yml` auf `main`) mit `folge=quer-qNN` und `folge=quer-qNN-en`. Ergebnis: Release `quer-qNN` mit `quer-qNN.mp4` (2560×1440, 60 fps, −14 LUFS).
5. Veröffentlichen: `TAEGLICH_TRAILER=<Attribution> python quer/veroeffentlichen.py qNN` und `… qNN --en`. Termine Mo/Mi/Fr, Deutsch 17:00, Englisch 23:30, jeweils ±30 min. Danach den Workflow „Posts einplanen“ abwarten und im Log auf ✓ prüfen.

## Technik
- `@format quer` (`drehbuch.mjs`) → `render.mjs`: Bildschirm 1920×1080 bzw. 2560×1440 bei `@qualitaet max`, `window.QUER` → `engine/kern.js` (`A.SW`, `A.SH`, `A.OV`, `A.ovBasis`), Kamera in `engine/engine.js`. Die Welt bleibt 1080×1920, alle Kulissen funktionieren unverändert. Ohne `@format quer` sind alle Serien pixelgleich (geprüft 17.11.: s04-f01, 24. Stock F1, Der Alien F1).
- Stückweise rendern: `node render.mjs <datei> --von 0 --bis 120`, Gesamtdauer mit `--nur-dauer`, Ton am Ende mit `--nur-ton`.
