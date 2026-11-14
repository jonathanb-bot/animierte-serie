# Bis zum Mond – Serienbibel (Entwurf, Jonathans Idee 14.11.2026)

Angelehnt an ein Vergleichsvideo (TikTok „meine.inselwelt“: Städte bauen Türme um die Wette), aber mit eigener Grafik, eigener Erzählung und eigenen Regeln. **Folge 1 „Der Startschuss“** liegt in `taeglich/episoden/mond-m001.txt`. Folge 1 gepostet am 14.11. (TikTok 20:46, Instagram 21:20, YouTube 21:34; Jonathan: „Einplanen bitte“).

## Idee
Jede Stadt bekommt einen Bauplatz auf einem schwebenden Turmplatz. Die Zuschauer bauen den Turm ihrer Stadt mit Kommentaren. Ziel: bis zum Mond.

## Regeln der Welt
- **Kommentar mit Stadtnamen = 1 Stockwerk** für diese Stadt. **Jedes Like auf so einen Kommentar = 1 weiteres Stockwerk.** Gezählt wird unter allen Folgen, alle Plattformen (Quelle wie bei „Deine Welt“: `posten/kommentare.json`).
- Stadtnamen vereinheitlichen (z. B. „münchen“, „Munich“ → München). Orte ohne eindeutige Stadt (nur „Bayern“) zählen für das Bundesland als eigene „Stadt“.
- 1 Stockwerk = 3 m. Ziele (echte Höhen): Wolken 333 (1 km), Flugzeuge 1.000 (3 km), Mount Everest 2.950 (8.849 m), Weltall 33.333 (100 km), Raumstation 133.333 (400 km), Mond 128 Mio. (384.400 km).
- Keine erfundenen Zahlen: Türme wachsen nur durch echte Kommentare und Likes. Folge 1 zeigt deshalb einen leeren Platz.
- Nichts Beleidigendes, keine Politik, keine Werbung. Nutzernamen dürfen wie bei „Deine Welt“ (Jonathan 12.11.) eingeblendet werden.

## Format
- **Stimme verbindlich (Jonathan 14.11.): Gemini „Fenrir“ für alle Folgen dieser Serie**, mit `@stimmung aufbau`, `@vortrag lebendig`: `python -m ton.folge taeglich/episoden/mond-mNNN.txt --stimme gemini:Fenrir --anfragen 1`, danach `python taeglich/stimme_pruefen.py …` (muss OK melden). Fenrir wird nicht auf Orus' Tonhöhe angeglichen; die Tonhöhen-Warnung von `ton.folge` bezieht sich auf Orus und gilt hier nicht.
- 62–90 s. Kopf wie „Deine Welt“ (`@qualitaet max`, `@stil leuchtend`, `@look 0`, `@kino 0.35`, `@einblenden aus`).
- Ab Folge 2: Hook mit dem Stand („Tag 2: 14 Städte, München vorne mit 41 Stockwerken“), Wachstum der Türme (`tuerme="München:12>41|…"`), Rangliste der Top 3, eine Fahrt am höchsten Turm hoch (`modus=hoehe`), nächstes Ziel, Aufruf „Kommentier deine Stadt!“.

## Kulisse `turm` (engine/turm.js)
- `[turm modus=feld tuerme="Stadt:alt>neu|…" nah=… blick=i,j markiere=i,j leer="Deine Stadt?" leer_zeigen=N zeit=tag|abend|nacht]` – Turmplatz 8×8, Städte in Reihenfolge von der Mitte nach außen.
- `[turm modus=hoehe hoehe=von>bis stadt="…" farbe=#…]` – Kamerafahrt am Turm hoch (logarithmisch, Wolken, Ballon, Flugzeug, Everest, Raumstation, Satellit, Mond), Höhenanzeige in Metern und Stockwerken.
- `[turm modus=ziele]` – Zielkarte.
- Noch zu bauen für Folge 2: Rangliste (`modus=rangliste`).
