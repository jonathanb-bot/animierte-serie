---
name: serien-stil
description: Bilder, Kulissen und Figuren für Jonathans animierte Serien im flachen Erklärvideo-Stil (Kurzgesagt-Richtung) bauen, sparsam und ohne Bild-API. Nutzen bei neuen Kulissen, Figuren, Props, Referenzbildern aus ChatGPT oder wenn ein Bild „schöner/detaillierter“ werden soll.
---

# Serien-Stil: Bibliothek statt Einzelbilder

Alle Bilder entstehen als **Code in der eigenen Engine** (Canvas, `engine/*.js`), nicht als generierte Rasterbilder. Das ist die Bibliothek: einmal gebaut, in jeder Folge wiederverwendet, immer gleich aussehend, ohne Zusatzkosten. Jonathan hat Claude Pro und ChatGPT Pro – mehr braucht es nicht. **Keine bezahlten Bild-APIs** (Gemini-Bildausgabe braucht Billing, Recraft/Ideogram kosten pro Bild) und kein KI-Video.

Feste Regeln gehen immer vor: offene Issues mit Label `dringlich`, `CLAUDE.md`, `taeglich/FORMAT.md` (Branch `taeglich`).

## Sparsam arbeiten (wenig Nutzung)

1. **Erst nachschlagen, nicht lesen:** Kataloge `taeglich/episoden/katalog-kurzgesagt.txt` und `katalog.txt` sowie die Tabelle in `FORMAT.md` zeigen, was es schon gibt. `engine/kurzgesagt.js` (große Datei) nie ganz lesen, sondern mit Grep die passende Kulisse suchen und nur diesen Abschnitt öffnen.
2. **Wiederverwenden vor Neubauen:** Fast jeder Ort lässt sich mit vorhandenen Kulissen + Angaben (`zeit`, `regen`, `nebel`, `farbe=`, `lichter` …) darstellen. Neu bauen nur, wenn die Geschichte es wirklich braucht – höchstens 2 neue Kulissen pro Lauf (FORMAT.md).
3. **Neue Kulissen aus Bausteinen:** vorhandene Helfer nutzen (`glut`, `nebel`, `sterne`, `lgrad`/`rgrad`, `shade`, `mix`, `rnd`) statt neue zu schreiben. Eine ähnliche bestehende Kulisse als Vorlage kopieren und abwandeln.
4. **Kontrolle billig halten:** erst `node render.mjs <datei> --bilder` (Standbilder), nur bei Bedarf 3 Ausschnitte in voller Auflösung, kein komplettes Video zum Ansehen rendern.
5. Bestehende Kulissen und Figuren nie verändern, nur neue Namen – alte Serien müssen pixelgleich bleiben.

## Stilregeln (eigener Look in Kurzgesagt-Richtung)

- Flach, keine Konturen, runde Formen, gedämpfte Grundfarben mit 1–2 leuchtenden Akzenten, 5–7 Farben pro Bild.
- Tiefe: 3–5 Ebenen, hinten heller und dunstiger, Nebelbänder.
- Licht: mindestens eine Lichtquelle mit Glühen (`glut`), Randlicht und zweitönige Schattenseite an großen Formen (gleiche Farbe, dunkler – kein Schwarz).
- Mindestens 3 kleine Details und leise Bewegung (Teilchen, Lichter, Wolken, Vögel); Kontaktschatten unter Figuren.
- Drehbuch mit `@qualitaet hoch`, `@kino 1`, `@look` nach Stimmung (Tabelle in FORMAT.md).
- **Nie** Figuren, Vögel/Enten, Logo, Musik oder Bilder von Kurzgesagt kopieren oder als Vorlage nachbauen – nur der allgemeine Flat-Stil ist erlaubt.
- Figuren nur über `figuren.json` bzw. `taeglich/figuren.json` (neue Figuren mit Staffel-Vorsilbe), damit sie überall gleich aussehen.

## Referenzbilder aus ChatGPT (optional)

Wenn Jonathan einen neuen Ort oder eine Stimmung „so wie auf dem Bild“ will, erzeugt er ein Referenzbild in ChatGPT und hängt es im Chat an oder legt es in `referenzen/` ab. Claude baut daraus eine **Code-Kulisse** nach (Aufbau, Farben, Lichtführung) – das Bild selbst kommt nie ins Video (sonst passt es nicht zur Bibliothek, wird unscharf und schwankt von Bild zu Bild).

Vorschlag für Jonathans ChatGPT-Prompt:

> Flache Vektor-Illustration im Hochformat 9:16 für ein Erklärvideo, ohne Konturen, runde Formen, gedämpfte Farben mit leuchtenden Akzenten, Tiefe durch Dunst, weiches Glühen der Lichter, keine Figuren, kein Text. Motiv: <Ort, Tageszeit, Stimmung>.

Beim Nachbauen: Farben aus dem Bild als Hex übernehmen (mit Python/PIL Pipette, nicht schätzen), dann in die Stilregeln oben übersetzen.

## Nach dem Bauen

1. Neue Kulisse in den passenden Katalog und die Tabelle in `taeglich/FORMAT.md` eintragen (Name, was sie zeigt, Angaben).
2. Standbilder ansehen, Detail-Prüfliste aus FORMAT.md abhaken.
3. Eine alte Folge pixelgleich gegenprüfen, dann committen und pushen.
