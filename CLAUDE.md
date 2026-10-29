# Hinweise für Claude

- Projekt: animierte Serie „24. Stock“ (Zombie-Apokalypse im Hochhaus) für Jonathan. Format und Felder stehen in README.md, die Handlung in serienplan.md.
- Stil: **clean** Flat-Vektor, keine Konturen, weiche Schattierung. Jonathan legt großen Wert darauf, dass es sauber aussieht.
- Folgen sind `episoden/folge-XX.txt` (Drehbuch-Format). Ziel ca. 5 Minuten, 10 Kapitel, ~50–65 Einstellungen. Du-Erzählung, Cliffhanger am Ende, danach „Überlebens-Check“.
- Vor jedem Push: `node render.mjs <datei> --bilder` und die Standbilder ansehen.
- Figuren nur in `figuren.json` ändern, dann bleiben sie in allen Folgen gleich.
- Stimme: `audio/folge-XX/NNN.mp3` pro Einstellung (ElevenLabs via Shotstack, vorher Kosten nennen).
- Push → GitHub Actions rendert (Matrix, max. 5 parallel) → Releases.
- Sprache: Deutsch.
- **Posten:** TikTok + Instagram über Zernio (`posten/plan.json` → GitHub-Workflow „Posts einplanen“, Secret `ZERNIO_API_KEY`). YouTube Shorts lädt eine geplante Claude-Aufgabe über den Browser auf Jonathans iMac hoch (Dateien auf Branch `youtube-upload`). Postplan-Seite: https://claude.ai/artifact/2uMnGJstTDisHy67YchaHL
- **Vor jedem Post prüfen, ob alles vorhanden ist (Jonathans feste Vorgabe):** Tonspur da, so lang wie das Bild, Stimme hörbar (> -24 LUFS). `posten/zernio.mjs` prüft das automatisch, für YouTube gilt `geprueft.json` auf Branch `youtube-upload` (`python3 pruefen.py`). Jonathan braucht vorher keine Bestätigung, er kontrolliert danach im Profil.
- Eine Serie wird immer komplett gepostet, bevor die nächste beginnt (erst „24. Stock“, dann „Der Alien“).
