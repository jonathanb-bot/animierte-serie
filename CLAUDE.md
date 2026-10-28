# Hinweise für Claude

- Projekt: animierte Serie „24. Stock“ (Zombie-Apokalypse im Hochhaus) für Jonathan. Format und Felder stehen in README.md, die Handlung in serienplan.md.
- Stil: **clean** Flat-Vektor, keine Konturen, weiche Schattierung. Jonathan legt großen Wert darauf, dass es sauber aussieht.
- Folgen sind `episoden/folge-XX.txt` (Drehbuch-Format). Ziel ca. 5 Minuten, 10 Kapitel, ~50–65 Einstellungen. Du-Erzählung, Cliffhanger am Ende, danach „Überlebens-Check“.
- Vor jedem Push: `node render.mjs <datei> --bilder` und die Standbilder ansehen.
- Figuren nur in `figuren.json` ändern, dann bleiben sie in allen Folgen gleich.
- Stimme: `audio/folge-XX/NNN.mp3` pro Einstellung (ElevenLabs via Shotstack, vorher Kosten nennen).
- Push → GitHub Actions rendert (Matrix, max. 5 parallel) → Releases. Änderungen an `engine/`, `render.mjs`, `drehbuch.mjs` rendern alle Folgen beider Serien neu; für Zwischenstände `[skip ci]` in die Commit-Nachricht.
- Sprache: Deutsch.
- Zweite Serie „Der Alien“ liegt in `der-alien/`. Dort ist `serienbibel.md` verbindlich (Weltregeln, Figuren, NEU ZU BAUEN). Storylines liegen in `der-alien/storylines/`, die Dauer prüfst du mit `node der-alien/dauer.mjs <storyline>`. Kulissen und Angaben stehen in `der-alien/README.md`, die Grafik in `engine/alien.js`. „24. Stock“ darf sich dadurch nicht verändern.
