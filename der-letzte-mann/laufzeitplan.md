# Der letzte Mann – Laufzeitplan Staffel 1

Verbindliche Grenzen: Staffel höchstens **20:00 min**, Folge höchstens **119 s** (Ziel 100–115 s), jeder Teil höchstens **60 s**.

Zeitbudget pro Folge: Kapitel je ca. 20–22 s · Titelkarte 1 s · Rückblick ab Folge 2 12–15 s · „Fortsetzung folgt“ 1 s · Check mit Kommentaraufruf höchstens 14 s.

Geschnitten wird immer nach Kapitel 2:
- **Teil 1** = Kapitel 1 + Titelkarte + Was bisher geschah + Kapitel 2
- **Teil 2** = Kapitel 3 + Kapitel 4 + Fortsetzung folgt + Check

Alle Werte stammen aus `node der-letzte-mann/dauer.mjs <storyline>`:
- **Formel:** die Rechnung von `render.mjs` ohne Stimme.
- **Schätzung:** die Formel, umgerechnet auf die Gemini-Stimme (× 0,84).
- **Gemessen:** die fertige Gemini-Stimme („Orus“) aus `der-letzte-mann/audio/`, inklusive 0,35 s Nachlauf pro Einstellung wie beim Rendern. **Maßgeblich ist die Messung.**

## Folgen

| Folge | Titel | Formel | Schätzung | Teil 1 gemessen | Teil 2 gemessen | **Folge gemessen** |
|---|---|---|---|---|---|---|
| 1 | Außer dir | 118,7 | 100,0 | 43,3 | 51,4 | **94,7** |
| 2 | Bleib vom Fenster weg | 129,7 | 109,3 | 52,9 | 52,7 | **105,6** |
| 3 | Sie kennen deinen Namen | 126,9 | 107,0 | 53,6 | 55,1 | **108,6** |
| 4 | Die falsche Rettung | 126,8 | 106,8 | 57,3 | 48,4 | **105,6** |
| 5 | Unter deiner Wohnung | 124,1 | 104,6 | 55,0 | 49,7 | **104,7** |
| 6 | Das tote Telefon | 114,2 | 96,2 | 49,7 | 50,6 | **100,3** |
| 7 | Zehn Sekunden | 119,8 | 100,9 | 52,4 | 52,8 | **105,1** |
| 8 | Du warst nicht vorgesehen | 125,7 | 105,9 | 56,4 | 54,8 | **111,2** |
| 9 | Die zweite Ausnahme | 121,6 | 102,4 | 54,4 | 47,8 | **102,2** |
| 10 | Die Stimme | 119,2 | 100,4 | 55,7 | 49,8 | **105,5** |
| | **Staffel** | 1226,7 s | 1033,5 s | | | **1043,5 s = 17:24 min** |

Puffer bis 20:00 min: 156 s.

## Die 20 Veröffentlichungsteile

| Nr. | Teil | Inhalt | Schätzung | Gemessen | Grenze 60 s |
|---|---|---|---|---|---|
| 1 | Folge 1 · Teil 1 | K1, Titelkarte, K2 | 43,9 s | **43,3 s** | ok |
| 2 | Folge 1 · Teil 2 | K3, K4, Fortsetzung, Check | 56,1 s | **51,4 s** | ok |
| 3 | Folge 2 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 55,8 s | **52,9 s** | ok |
| 4 | Folge 2 · Teil 2 | K3, K4, Fortsetzung, Check | 53,5 s | **52,7 s** | ok |
| 5 | Folge 3 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 54,5 s | **53,6 s** | ok |
| 6 | Folge 3 · Teil 2 | K3, K4, Fortsetzung, Check | 52,4 s | **55,1 s** | ok |
| 7 | Folge 4 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 58,8 s | **57,3 s** | ok |
| 8 | Folge 4 · Teil 2 | K3, K4, Fortsetzung, Check | 47,9 s | **48,4 s** | ok |
| 9 | Folge 5 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 55,9 s | **55,0 s** | ok |
| 10 | Folge 5 · Teil 2 | K3, K4, Fortsetzung, Check | 48,7 s | **49,7 s** | ok |
| 11 | Folge 6 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 47,4 s | **49,7 s** | ok |
| 12 | Folge 6 · Teil 2 | K3, K4, Fortsetzung, Check | 48,8 s | **50,6 s** | ok |
| 13 | Folge 7 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 49,2 s | **52,4 s** | ok |
| 14 | Folge 7 · Teil 2 | K3, K4, Fortsetzung, Check | 51,8 s | **52,8 s** | ok |
| 15 | Folge 8 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 53,0 s | **56,4 s** | ok |
| 16 | Folge 8 · Teil 2 | K3, K4, Fortsetzung, Check | 52,9 s | **54,8 s** | ok |
| 17 | Folge 9 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 55,8 s | **54,4 s** | ok |
| 18 | Folge 9 · Teil 2 | K3, K4, Fortsetzung, Check | 46,6 s | **47,8 s** | ok |
| 19 | Folge 10 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 49,8 s | **55,7 s** | ok |
| 20 | Folge 10 · Teil 2 | K3, K4, Fortsetzung, Check | 50,6 s | **49,8 s** | ok |

## Regeln beim Schreiben

- Ein Kapitel mit 5–6 Einstellungen und zusammen ca. 45–55 gesprochenen Wörtern ergibt mit Gemini-Stimme ca. 20–22 s.
- Eine Einstellung mit 8 Wörtern dauert mit Stimme ca. 3–3,5 s.
- Der Check bleibt kurz: Frage und Antwort zusammen ca. 15 Wörter, dazu der feste Satz „Was hättest du gemacht? Schreib es in die Kommentare.“
- Kapitel werden nie durch zusätzliche Einleitungen verlängert, um auf eine Minute zu kommen.
