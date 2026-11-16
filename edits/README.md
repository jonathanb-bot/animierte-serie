# Songtext-Edits (Jonathans Idee 14./15.11.)

Kurze Lyric-Edits zu Liedern, die Jonathan schickt: jedes Wort erscheint genau dann, wenn es gesungen wird, zu jeder Zeile ein passendes Bild oder Objekt, Zoom-Stöße auf dem Beat, 1440×2560, 60 fps.

## Ablauf pro Lied
1. **MP3** von Jonathan (nie aus dem Netz laden). Ausschnitt festlegen (meist Intro + erste Lines, 20–30 s, Ende auf einem Beat und am Zeilenende).
2. **Lyrics immer aus dem Internet** holen (Genius über Apify `web-fetch`; direkte Abrufe blockieren die Seiten) und mit der Spracherkennung abgleichen: `faster-whisper medium` mit den Lyrics als `initial_prompt`, `word_timestamps=True` → Wortzeiten → `zeitleiste.json`.
3. **Takt** messen (Spektral-Flux + Autokorrelation) → `beat0`, `beat` in der Zeitleiste.
4. **Bilder:** Orte als frei nutzbare Fotos von Pexels (Suche über Apify `web-fetch` mit `formats: links`, Bild direkt von `images.pexels.com`). Objekte (z. B. Gucci-Cap) als realistisches 3D-Modell mit three.js (`cap.html`, Drehung mit `drehung.cjs`, 96 Bilder mit Transparenz). Marken/Logos sind erlaubt (Jonathan 15.11.).
5. **Szenen** in `edit.html` (eine Funktion pro Zeile), Standbilder mit `standbilder.cjs`, dann `rendern.cjs <ausgabe.mp4>`.
6. **Liefern:** Version mit Ton (zum Ansehen) und ohne Ton (zum Posten: Jonathan legt den Song in TikTok/Instagram als Sound ab 0:00 darüber).

**Realistische Objekte über ChatGPT (Jonathans Weg, 15.11.):** Gemini-Bildgenerierung ist im kostenlosen Kontingent gesperrt, Shop-Fotos lassen sich nicht automatisch laden. Deshalb schicke ich Jonathan zu Beginn jedes Lieds **einen fertigen Prompt** für alle Objekte aus dem Text (Raster aus Ansichten 0°, 45° … 315°, gleiche Größe, gleiche Kamera, hellgrauer Hintergrund, viel Abstand zwischen den Zellen). Er lässt die Bilder in ChatGPT erzeugen und lädt sie hoch (einzeln oder als ZIP). Ich stelle frei, richte aus, vergrößere mit Nachschärfen und baue die Drehung aus den Ansichten (`capZeichnen` in `edit.html`: Überblendung + Bewegungsunschärfe). Erfahrung Lounge City: Die Ansichten waren nur ca. 376×333 px; weiße Objekte (Polo) auf Hellgrau lassen sich schlecht freistellen und wurden beim Zuschneiden oben abgeschnitten. Deshalb künftig: dunkelgrauer Hintergrund für helle Objekte, jede Zelle mit großem Rand, oder jede Ansicht als eigenes Bild in voller Größe.

## Wünsche von Jonathan für künftige Edits (Stand 16.11.)
- **Auch Videos von Instagram verwenden, nicht nur Bilder** (Jonathan 16.11., nach „Film“): kurze Clips (1–2 s) aus Reels/Snippets der Künstler (Apify `apify/instagram-scraper` liefert `videoUrl`), als Hintergrund oder in einer Handy-Karte, auf den Beat geschnitten, farblich an den Look angepasst. Mischung etwa halb Video, halb Foto. Chromium im Container hat evtl. kein H.264: Clips vorher nach VP9/WebM wandeln oder als Bildfolge ausschneiden.
- Bilder der Künstler gern von Instagram und Genius; Fotos, die genau zur Zeile passen (z. B. Kino-Leuchttafel bei „Film“, Porsche-Plakette bei „Carrera S“).
- Der Ausschnitt richtet sich nach Jonathans Angabe (z. B. „von Ralphs Part zu Lucios Part“), 30–45 s sind gut.
- **Liefern:** volle Qualität direkt im Chat (SendUserFile), zusätzlich Download-Link auf Branch `edits-download` (dort unter 100 MB, sonst zweipassig auf ca. 15 Mbit/s komprimieren).
- Waffen und Drogen nur als Text, nie als Bild.

## film/
Gangsta Ralph & Lucio101 – „Film“, Song 31,20–76,88 s (Ende Part Ralph, Pre-Hook + Hook, Part Lucio bis „Carrera S“), 100 BPM, Kino-Look. Fotos von Instagram (@gangsta__ralph, @luciobene101) und Genius. Jonathan: „wirklich perfekt“.

## lounge-city/
Pashanim – „Lounge City“, 0:00–0:26,05 (Intro, Hook, 2 Lines von Part 1). Bilder (Pexels-IDs): 19149720, 11290329, 18883058, 23319096, 24286572, 36701796, 12767295, 12039633 (T-Shirt, freigestellt), 29957529, 31876128; Albumcover von Genius.
