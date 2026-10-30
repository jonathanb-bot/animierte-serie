# Hinweise für Claude

- Projekt: animierte Serie „24. Stock“ (Zombie-Apokalypse im Hochhaus) für Jonathan. Format und Felder stehen in README.md, die Handlung in serienplan.md.
- Stil: **clean** Flat-Vektor, keine Konturen, weiche Schattierung, angelehnt an „Dinge Erklärt – Kurzgesagt“: **dunkle, gedämpfte Farbwelt, nichts Grelles**. Die Figuren bleiben im bisherigen Stil (Jonathan wollte die abstrakte Variante nicht). Der Farblook in `engine/engine.js` dunkelt Hintergründe ab, Figuren und Icons bleiben warm (Maske). Jonathan legt großen Wert darauf, dass es sauber aussieht.
- Folgen sind `episoden/folge-XX.txt` (Drehbuch-Format). Ziel ca. 5 Minuten, 10 Kapitel, ~50–65 Einstellungen. Du-Erzählung, Cliffhanger am Ende, danach eine Endkarte „Fortsetzung folgt · Teil X“ mit Knopf „Jetzt auf dem Profil“ (keine Fragen ans Publikum).
- Vor jedem Push: `node render.mjs <datei> --bilder` und die Standbilder ansehen.
- Figuren nur in `figuren.json` ändern, dann bleiben sie in allen Folgen gleich.
- Stimme + Hintergrund kostenlos: `python -m ton.folge episoden/folge-XX.txt` (eine tiefe Erzählstimme, Stille-Schnitte, leise Geräusche; **kein Drone/Rauschen** – Jonathan will das nicht; nur Warnsignale wie Alarm/Sirene dürfen lauter sein), danach `python -m ton.pruefen folge-XX` (Ziel ~ -15 LUFS, Hintergrund in Sprechpausen still). ElevenLabs nur nach Kostenangabe.
- Push → GitHub Actions rendert (Matrix, max. 5 parallel) → Releases.
- Sprache: Deutsch.
- **Posten:** TikTok + Instagram über Zernio (`posten/plan.json` → GitHub-Workflow „Posts einplanen“, Secret `ZERNIO_API_KEY`). YouTube Shorts lädt eine geplante Claude-Aufgabe über den Browser auf Jonathans iMac hoch (Dateien auf Branch `youtube-upload`). Postplan-Seite: https://claude.ai/artifact/2uMnGJstTDisHy67YchaHL
- **Vor jedem Post prüfen, ob alles vorhanden ist (Jonathans feste Vorgabe):** Tonspur da, so lang wie das Bild, Stimme hörbar (> -24 LUFS). `posten/zernio.mjs` prüft das automatisch, für YouTube gilt `geprueft.json` auf Branch `youtube-upload` (`python3 pruefen.py`). Jonathan braucht vorher keine Bestätigung, er kontrolliert danach im Profil.
- Eine Serie wird immer komplett gepostet, bevor die nächste beginnt (erst „24. Stock“, dann „Der Alien“).
