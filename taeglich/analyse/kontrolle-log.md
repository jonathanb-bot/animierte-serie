# Abend-Kontrolle – Log

Je Lauf: Datum, je Konto ✓/✗, Mängel, was getan wurde. Ablauf: `taeglich/laeufe/kontrolle.md`.

## 7.11.2026 (erster Lauf)

| Konto | Ergebnis | geprüft (letzte 4) |
|---|---|---|
| TikTok deutsch | ✓ | Funkstille Teil 2–4, Zeit-Video 001 |
| Instagram deutsch | ✓ | Funkstille F3–F6 |
| YouTube deutsch | ✓ | Funkstille F3–F6 |
| TikTok englisch | ✓ | The Jackpot Teil 4–7 |
| Instagram englisch | ✓ | The Jackpot F5–F8 |
| YouTube englisch | ✓ | The Jackpot F5–F8 |

- Alle 24 Posts `published` mit Link. Stimme 106–109 Hz (höchstens +0,5 HT), −14,5 bis −14,6 LUFS, Sprache passt zum Konto, gesprochener Anfang passt zur Folge im Post-Text. Untertitel (s01/s02 mit) passend, kein falschsprachiger Text im Bild, Bilder sauber.
- **Erstes Bild schwarz** bei 16 Videos (Funkstille s01, The Jackpot s02 F7/F8/Teil 7): alle vor dem 7.11. gerendert → laut Vorgabe nur erwähnt, nicht repariert.
- Kosmetisch: The Jackpot (en) – Uhrzeit auf dem Handy links leicht angeschnitten („7:48 PM“, „7:02 AM“). Bei künftigen Handy-Einblendungen auf Rand achten.
- **Behoben:** Der erste Durchlauf meldete 10 Posts mit „Rate limit exceeded“. Ursache: `posten/zernio.mjs --status` fragte alle vergangenen Posts ohne Pause ab, Zernio drosselte (429), und das überschrieb sogar schon gespeicherte „published“-Ergebnisse. Fix auf `main` (77a9a1b): veröffentlichte und gelöschte Posts überspringen, bei 429 warten und wiederholen, Fehler überschreibt kein gutes Ergebnis. `kontrolle.py` überspringt zurückgezogene Posts und meldet Drosselung als „Stand unbekannt“. Danach Status neu geholt → alles veröffentlicht.
- Bekannt, alt: YouTube-Upload-Limit-Fehler vom 4./5.11. (alien-yt-kurz-07-2, mann-yt-kurz-05/06), stock-yt-kurz-05-1 (1.11.) mit +2,1 HT – schon veröffentlicht, vor Issue #25.
- Keine Benachrichtigung an Jonathan nötig.

## 8.11.2026

| Konto | Ergebnis | geprüft (letzte 4) |
|---|---|---|
| TikTok deutsch | ✓ | Zeit-Video 001, Der Nachahmer Teil 1–3 |
| Instagram deutsch | ✓ | Funkstille F8–F10, Der Nachahmer F1 |
| YouTube deutsch | ✓ | Funkstille F7–F10 |
| TikTok englisch | ✓ | The Jackpot Teil 8, The Mimic Teil 1–3 |
| Instagram englisch | ✓ | The Jackpot F5–F8 |
| YouTube englisch | ✓ | The Jackpot F5–F8 |

- Alle 24 Posts `published` mit Link. Stimme 104–110 Hz (−0,3 bis +0,6 HT), −14,5 bis −14,6 LUFS, Sprache passt zum Konto, gesprochener Anfang passt zur Folge im Post-Text. Untertitel passend (s01/s02 mit, s03 ohne), kein falschsprachiger Text im Bild, Kontaktbögen sauber, Figuren vollständig.
- **Erstes Bild schwarz** bei 10 Videos (Funkstille s01 F7–F9, The Jackpot s02 F7/F8/Teil 8): alle vor dem 7.11. gerendert, laut Vorgabe nur erwähnt, nicht repariert. Die neuen s03-Videos (Der Nachahmer/The Mimic) starten hell (Helligkeit 36–40).
- Kosmetisch (s03 Teil 3, de+en): Opa im Krankenhausbett, Kopf sitzt am linken Bettrand, leicht neben dem Kissen. Schon veröffentlicht, kein Löschgrund. Bei künftigen Bett-Szenen auf die Kopfposition achten.
- Keine Reparatur, keine Benachrichtigung an Jonathan nötig.
