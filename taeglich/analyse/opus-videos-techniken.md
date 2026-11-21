# Techniken aus „awesome-opus5-5-videos“ (Jonathan 21.11.: „Du kannst auch als GitHub-Verbindung awesome opus5-5 videos“)

Quelle: öffentliches Repo `yihui-dev/awesome-opus5-5-videos` (703 Prompts von Videos, die Opus 5.5 komplett als Code gebaut hat; `data/videos.json`, Kategorien motion 369, 3d 117, explainer 116, interactive 101). Lesen geht ohne Anmeldung: `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/yihui-dev/awesome-opus5-5-videos /home/user/yihui-dev/awesome-opus5-5-videos`.

**Regel wie bei allen Vorbildern (FORMAT.md → „Vorbilder“): nur Machart übernehmen, nie Inhalte, Figuren oder Bilder anderer.** Alle Videos und Prompts gehören ihren Erstellern.

## Was davon zu unserer Engine und zur Gewinner-Nische passt

| Technik | Wo gesehen (Prompt) | Umsetzung bei uns |
|---|---|---|
| **Erst Storyboard, dann bauen:** je Szene Zeit, Bild, Text, Übergang festlegen, dann Szene für Szene bauen | henrygsing-050247 (Kurzgesagt × Pixar-Opening, Storyboard.md) | Im Drehbuch über jeder Einstellung eine `//`-Zeile mit Sekunde und Absicht („0–2 s Prämisse groß“, „8 s Wendung“). Ziel: kein Abschnitt ohne neue Information (Mond F1 verlor genau dort) |
| **Kontaktbogen statt Einzelbilder:** ca. 20 Standbilder in einem Bild prüfen, bevor gerendert wird | l3d1c-632524 | Nach `node render.mjs … --bilder`: `montage ausgabe/taeglich-<id>-bilder/*.jpg -tile 6x -geometry 240x427+4+4 ausgabe/taeglich-<id>-kontakt.jpg`. Einmal ansehen, ob Tempo, Farbe und Abwechslung über das ganze Video stimmen. Danach die Problemstellen einzeln |
| **Schrift in der sicheren Zone:** Untertitel und Texte so messen, dass nichts unter den TikTok/Reels-Knöpfen liegt (rechter Rand, unteres Fünftel) | l3d1c-632524 | Beim Kontaktbogen prüfen: keine Schrift im rechten Randstreifen und im unteren Fünftel, Hook-Text oben/mittig |
| **Schnitte auf einem festen Raster:** jeder Schnitt landet auf einem Takt, „auf jedem Takt passiert etwas“ | l3d1c-632524, verbove-268381 (120 BPM) | Passt zu #38 P. 10 (alle 3–5 s): Einstellungen ca. 3–4 s lang, Einblendungen und Zooms auf diesen Takt legen |
| **Das Bild beweist, die Stimme erzählt nur:** die Mechanik zeigt die Aussage, statt sie zu schmücken | gdgtify-393073 | Die Prämisse sichtbar machen (Zähler auf dem Handy läuft rückwärts, Geldstapel wächst), nicht nur eine Kulisse hinter dem Satz |
| **Ein Element verwandelt sich statt harter Schnitte** (gleiche Form wechselt Größe, Farbe, Inhalt) | verbove-268381 | Übergänge mit `zoom-rein` in ein Detail, das in der nächsten Einstellung groß weiterläuft (z. B. Handy-Display → Esstisch) |
| **Ruhiges, warmes Thema in 30–60 s im Hochformat** („Was macht einen Ort zu deinem Zuhause?“, Scherenschnitt-Stil) | x4b47x-034026 | Bestätigt die Nische: Gefühl + Alltag in Du-Form funktioniert auch als kurze Animation |
| **Alles deterministisch als Code** (`draw(t)`, keine Zufallszustände zwischen Bildern) | verbove-268381, henritoivar-445215 | Macht unsere Engine schon so; gleiches Drehbuch = gleiches Video |

## Nicht übernehmen
- Produktwerbung, Markenlogos, fremde Figuren oder Spielwelten (Minecraft, Pixar usw.), Brainrot-Chaos (widerspricht Stil „leuchtend“ und #30).
- Musik oder Stimmen anderer Anbieter (bei uns nur Gemini Orus, kein ElevenLabs).
