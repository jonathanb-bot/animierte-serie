# Hinweise für Claude

- Projekt: animierte Serie „24. Stock“ (Zombie-Apokalypse im Hochhaus) für Jonathan. Format und Felder stehen in README.md, die Handlung in serienplan.md.
- Stil: **clean** Flat-Vektor, keine Konturen, weiche Schattierung. Jonathan legt großen Wert darauf, dass es sauber aussieht.
- Folgen sind `episoden/folge-XX.txt` (Drehbuch-Format). Ziel ca. 5 Minuten, 10 Kapitel, ~50–65 Einstellungen. Du-Erzählung, Cliffhanger am Ende, danach „Überlebens-Check“.
- Vor jedem Push: `node render.mjs <datei> --bilder` und die Standbilder ansehen.
- Figuren nur in `figuren.json` ändern, dann bleiben sie in allen Folgen gleich.
- Stimme: `audio/folge-XX/NNN.mp3` pro Einstellung, **immer Gemini-TTS mit der Stimme „Orus“** (kein ElevenLabs). Der Gemini-Schlüssel ist im Proxy hinterlegt (`generativelanguage.googleapis.com`, kein eigener Key nötig; weitere Kontingente `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`), es kostet nichts. Code und Anleitung: `ton/` auf Branch `claude/split-episodes-social-media-qc5pr0` bzw. `claude/der-letzte-mann`.
- Push → GitHub Actions rendert (Matrix, max. 5 parallel) → Releases.
- Sprache: Deutsch.
- **Posten:** TikTok + Instagram über Zernio (`posten/plan.json` → GitHub-Workflow „Posts einplanen“, Secret `ZERNIO_API_KEY`). YouTube Shorts lädt eine geplante Claude-Aufgabe über den Browser auf Jonathans iMac hoch (Dateien auf Branch `youtube-upload`). Postplan-Seite: https://claude.ai/artifact/2uMnGJstTDisHy67YchaHL
- **Vor jedem Post prüfen, ob alles vorhanden ist (Jonathans feste Vorgabe):** Tonspur da, so lang wie das Bild, Stimme hörbar (> -24 LUFS). `posten/zernio.mjs` prüft das automatisch, für YouTube gilt `geprueft.json` auf Branch `youtube-upload` (`python3 pruefen.py`). Jonathan braucht vorher keine Bestätigung, er kontrolliert danach im Profil.
- „24. Stock“ und danach „Der Alien“ laufen nacheinander. **„Der letzte Mann“ läuft ab 30.10. parallel dazu** (Jonathans Vorgabe, Issue #6), immer 2 Stunden versetzt zu den anderen: Instagram und YouTube 3 Teile am Tag (10, 14, 18 Uhr; YouTube jeweils :30 = 2 h nach dem Vormittags- und Mittagsslot, 2 h vor dem Abendslot), TikTok 1 Folge früh und 1 abends (10 und 18 Uhr = 2 h nach früh, 2 h vor abends). IDs `mann-tiktok-XX`, `mann-insta-XX-N`, `mann-yt-XX-N` in `posten/plan.json`.
- **Arbeitsablauf bei neuen Folgen (Jonathans Vorgabe):** alle Folgen auf einmal schreiben (Storylines → Drehbücher), danach sofort und ohne Rückfrage die Stimme mit Gemini „Orus“ erzeugen und jede Einstellung gegen den Text prüfen. Details in `CLAUDE.md` auf Branch `claude/der-letzte-mann`.
- Dritte Serie „Der letzte Mann“ (10 Folgen à ca. 1,5 min, je 2 Teile ≤ 60 s): Ordner `der-letzte-mann/` auf Branch `claude/der-letzte-mann` (Serienbibel, Storylines, Drehbücher, Stimme).
- **DRINGLICH – vor jeder Arbeit die offenen GitHub-Issues mit Label `dringlich` lesen** (dort stehen Jonathans feste Regeln) und neue wichtige Vorgaben ebenfalls als Issue mit Label `dringlich` bzw. `regel` festhalten.
- **Nie „Echter Fakt“** (Jonathans feste Vorgabe, Issue #2): Fakten werden direkt erzählt, ohne diese Einleitung, weder im Sprechtext noch als Überschrift auf der Infokarte. Gilt für alle künftigen Folgen und Serien.
- **Fertige Videos (Issue #4):** TikTok bekommt immer die ganze Folge. Instagram und YouTube: Folgen unter 90 s ungeschnitten, längere in Teile von höchstens 60 s (nur an Kapitelgrenzen). Ablage auf Branch `youtube-upload` (`<serie>-folgen/` ganze Folgen, `<serie>/` Teile, danach `python3 pruefen.py`).
