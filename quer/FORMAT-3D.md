# Querformat lang im 3D-Stil (Umstieg, Jonathan 24.11. abends)

Jonathan: Die langen Querformat-Videos sollen ab jetzt aussehen wie die Blockstadt-Folgen (3D-Klötzchenwelt, Detailgrad wie im
Keller-Bild bzw. im Vorbild-TikTok), nur länger und mit längeren Geschichten. **Kompletter Umstieg**, der alte Stil (Drehbuch-Engine,
`render.mjs`) wird für neue lange Folgen nicht mehr benutzt.

## Was dafür nötig ist (einmalig)
1. **Engine im Querformat:** `block/welt.js` hat feste Maße 720×1280. Neu: Format über die Adresse (`?format=quer`) → 1280×720,
   mit `SKALA=2` gerendert 2560×1440 (wie bisher bei „quer“). Untertitel, Texttafeln und Kamera-Hilfen (`kamera.*`) auf 16:9 anpassen.
   Aufwand: etwa ein halber Tag mit Prüfen.
2. **Rendern auf GitHub statt lokal:** 10 min bei 60 fps sind 36 000 Bilder. Lokal wären das bei 1440p etwa 10–12 Stunden pro Video.
   Darum wie beim alten Querformat ein Workflow, der in 2-Minuten-Stücken parallel rendert und als Release ablegt (bis 2 GB).
   Aufwand: einige Stunden einmalig, danach ca. 1–1,5 h Renderzeit pro Video ohne Arbeit für uns.
3. **Stimme in größeren Abschnitten:** Die Blockstadt fragt Gemini in Dreiergruppen an (pro Abschnitt 1–2 Versuche). Ein langes Video
   hat etwa 150 Zeilen → 50–100 Anfragen, das ist das ganze Tageskontingent (5 Schlüssel × 10). Für lange Folgen deshalb 8–10 Zeilen
   pro Anfrage und 1 Versuch (ca. 15–20 Anfragen pro Video und Sprache). Die Stimme bleibt unbearbeitet (Issue #41).

## Aufwand pro Video
- **Geschichte:** 1350–1750 Wörter, 6–8 Kapitel wie bisher in `quer/FORMAT.md` (Hook, Wendung alle 60–90 s, Kapitel nach Zeit).
- **Szenen:** Im 3D-Stil wird jede Einstellung einzeln gebaut (Kamera, Figuren, Bewegung). Ein 10-min-Video entspricht etwa
  6–7 Blockstadt-Folgen. Neue Welten kosten am meisten (1–3 h je Welt), danach sind sie in der Bibliothek.
  Am günstigsten: die langen Geschichten spielen in Welten, die es schon gibt (Blockstadt, Vorstadt, Keller, Schattental …).
- **Realistisch:** 1 langes Video in neuer Welt ≈ 1 voller Arbeitstag, in bekannter Welt ≈ ein halber.
  Mit 2 Kurzvideos am Tag (Blockstadt + Dorf) sind **3 lange Videos pro Woche zu viel** – Vorschlag: zum Start 1 pro Woche,
  bei guten Zahlen 2.

## Englisch
- Übersetzen: wenig Aufwand (natürliches amerikanisches Englisch).
- Text im Bild (Schilder, Tafeln, Handy): Szenen bekommen eine Sprachweiche (`SPRACHE = "de" | "en"`, Texte in einer Tabelle).
  Marken und Logos bleiben gleich.
- Stimme: noch einmal 15–20 Gemini-Anfragen.
- Rendern: noch einmal komplett, weil die englische Stimme andere Längen hat und die Schnitte an der Stimme hängen.
  Das läuft aber auf GitHub ohne Arbeit für uns.
- **Insgesamt kostet Englisch etwa 25–30 % zusätzliche Arbeit** (Übersetzung, Texte im Bild, Prüfen), dazu das doppelte Kontingent.
  Wird das knapp, kommt die englische Fassung einen Tag später.

## Festgelegt (Jonathan 24.11.)
- **1 langes Video pro Woche, immer samstags** (Deutsch 17:00, Englisch 23:30, ±30 min). Der Lauf startet donnerstags 21:23.

## Gemini-Verbrauch (Rechnung 24.11.)
| Was | Anfragen |
|---|---|
| Blockstadt täglich (≈24 Zeilen, Dreiergruppen, 1–2 Versuche) | 8–16 |
| Dorf täglich (≈20 Zeilen) | 7–14 |
| Nische englisch täglich | 1–3 |
| **Montag–Freitag zusammen** | **16–33 pro Tag** |
| Langes Video Deutsch (≈150 Zeilen, 8–10 pro Anfrage) | 16–20 |
| Langes Video Englisch | 16–20 |

Kontingent: etwa 10 Anfragen pro Schlüssel und Tag, 5 Schlüssel ≈ 50. Die Stimme des langen Videos wird deshalb verteilt:
**Donnerstag Deutsch, Freitag Englisch** (je Tag dann 32–53, im ungünstigsten Fall knapp über 50). Mit 1–2 zusätzlichen Schlüsseln
(`GEMINI_API_KEY_6`, `_7`) ist immer Luft.

## Offene Entscheidungen (Jonathan)
- Erzähler: Ich-Erzählung mit Puck wie die Blockstadt, oder Du-Erzählung wie bisher im Querformat?
- 60 fps oder 30 fps (30 fps halbiert die Renderzeit, bei langen Videos kaum sichtbar)?
