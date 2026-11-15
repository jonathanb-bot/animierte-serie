# Songtext-Edits (Jonathans Idee 14./15.11.)

Kurze Lyric-Edits zu Liedern, die Jonathan schickt: jedes Wort erscheint genau dann, wenn es gesungen wird, zu jeder Zeile ein passendes Bild oder Objekt, Zoom-Stöße auf dem Beat, 1440×2560, 60 fps.

## Ablauf pro Lied
1. **MP3** von Jonathan (nie aus dem Netz laden). Ausschnitt festlegen (meist Intro + erste Lines, 20–30 s, Ende auf einem Beat und am Zeilenende).
2. **Lyrics immer aus dem Internet** holen (Genius über Apify `web-fetch`; direkte Abrufe blockieren die Seiten) und mit der Spracherkennung abgleichen: `faster-whisper medium` mit den Lyrics als `initial_prompt`, `word_timestamps=True` → Wortzeiten → `zeitleiste.json`.
3. **Takt** messen (Spektral-Flux + Autokorrelation) → `beat0`, `beat` in der Zeitleiste.
4. **Bilder:** Orte als frei nutzbare Fotos von Pexels (Suche über Apify `web-fetch` mit `formats: links`, Bild direkt von `images.pexels.com`). Objekte (z. B. Gucci-Cap) als realistisches 3D-Modell mit three.js (`cap.html`, Drehung mit `drehung.cjs`, 96 Bilder mit Transparenz). Marken/Logos sind erlaubt (Jonathan 15.11.).
5. **Szenen** in `edit.html` (eine Funktion pro Zeile), Standbilder mit `standbilder.cjs`, dann `rendern.cjs <ausgabe.mp4>`.
6. **Liefern:** Version mit Ton (zum Ansehen) und ohne Ton (zum Posten: Jonathan legt den Song in TikTok/Instagram als Sound ab 0:00 darüber).

Grenzen (15.11.): Gemini-Bildgenerierung ist im kostenlosen Kontingent gesperrt; Shop-Produktfotos lassen sich nicht automatisch laden. Für fotorealistische Objekte: Jonathan schickt Fotos aus mehreren Winkeln oder schaltet die bezahlte Bildgenerierung frei.

## lounge-city/
Pashanim – „Lounge City“, 0:00–0:26,05 (Intro, Hook, 2 Lines von Part 1). Bilder (Pexels-IDs): 19149720, 11290329, 18883058, 23319096, 24286572, 36701796, 12767295, 12039633 (T-Shirt, freigestellt), 29957529, 31876128; Albumcover von Genius.
