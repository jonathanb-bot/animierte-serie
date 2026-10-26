# Hinweise für Claude

- Projekt: animierte Serie „24. Stock“ (Zombie-Apokalypse im Hochhaus) für Jonathan. Format und Felder stehen in README.md, die Handlung in serienplan.md.
- Stil: **clean** Flat-Vektor, keine Konturen, weiche Schattierung. Jonathan legt großen Wert darauf, dass es sauber aussieht.
- Folgen sind `episoden/folge-XX.txt` (Drehbuch-Format). Ziel ca. 5 Minuten, 10 Kapitel, ~50–65 Einstellungen. Du-Erzählung, Cliffhanger am Ende, danach „Überlebens-Check“.
- Vor jedem Push: `node render.mjs <datei> --bilder` und die Standbilder ansehen.
- Figuren nur in `figuren.json` ändern, dann bleiben sie in allen Folgen gleich.
- Stimme + Hintergrund kostenlos: `python -m ton.folge episoden/folge-XX.txt` (Stil der Vorlage: eine tiefe Erzählstimme, Drone, Stille-Schnitte, dezente Geräusche), danach `python -m ton.pruefen folge-XX` (Ziel ~ -15 LUFS, ~12 dB Abstand). ElevenLabs nur nach Kostenangabe.
- Push → GitHub Actions rendert (Matrix, max. 5 parallel) → Releases.
- Sprache: Deutsch.
