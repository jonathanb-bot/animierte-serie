# Der letzte Mann – Laufzeitplan Staffel 1

Verbindliche Grenzen: Staffel höchstens **20:00 min**, Folge höchstens **119 s** (Ziel 100–115 s), jeder Teil höchstens **60 s**.

Zeitbudget pro Folge: Kapitel je 20–22 s · Titelkarte 1 s · Rückblick ab Folge 2 12–15 s · „Fortsetzung folgt“ 1 s · Check mit Kommentaraufruf höchstens 14 s.

Geschnitten wird immer nach Kapitel 2:
- **Teil 1** = Kapitel 1 + Titelkarte + Was bisher geschah + Kapitel 2
- **Teil 2** = Kapitel 3 + Kapitel 4 + Fortsetzung folgt + Check

Die Werte sind mit `node der-letzte-mann/dauer.mjs <storyline>` berechnet (gleiche Formel wie `render.mjs` ohne Stimme). Alle Storylines sind geschrieben. „Schätzung“ ist die Formel ohne Stimme, „mit Stimme“ ist gemessen an der fertigen Gemini-Stimme („Orus“) aus `der-letzte-mann/audio/` (inklusive 0,35 s Nachlauf pro Einstellung, wie beim Rendern).

## Folgen

| Folge | Titel | K1 | Titel­karte | Rück­blick | K2 | **Teil 1** | K3 | K4 | Fortsetzung | Check | **Teil 2** | **Folge (Schätzung)** | Teil 1 mit Stimme | Teil 2 mit Stimme | **Folge mit Stimme** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Außer dir | 22,4 | 1,0 | – | 22,2 | **45,6** | 22,1 | 22,2 | 1,0 | 13,5 | **58,7** | **104,4** | 37,3 | 47,6 | **84,9** |
| 2 | Bleib vom Fenster weg | 20,7 | 1,0 | 12,4 | 22,2 | **56,3** | 21,5 | 24,3 | 1,0 | 13,0 | **59,7** | **116,0** | 43,0 | 49,9 | **92,8** |
| 3 | Sie kennen deinen Namen | 22,3 | 1,0 | 12,0 | 22,1 | **57,4** | 21,2 | 22,5 | 1,0 | 11,7 | **56,4** | **113,8** | 47,5 | 46,5 | **94,0** |
| 4 | Die falsche Rettung | 21,0 | 1,0 | 12,7 | 22,2 | **56,9** | 22,2 | 22,2 | 1,0 | 12,4 | **57,8** | **114,7** | 46,7 | 48,3 | **95,0** |
| 5 | Unter deiner Wohnung | 21,9 | 1,0 | 12,2 | 22,3 | **57,4** | 21,8 | 21,4 | 1,0 | 13,5 | **57,7** | **115,1** | 43,5 | 51,1 | **94,6** |
| 6 | Das tote Telefon | 22,4 | 1,0 | 12,5 | 21,2 | **57,2** | 23,1 | 21,7 | 1,0 | 12,1 | **57,9** | **115,0** | 53,5 | 50,3 | **103,8** |
| 7 | Zehn Sekunden | 20,2 | 1,0 | 12,9 | 21,2 | **55,3** | 21,5 | 22,0 | 1,0 | 13,4 | **57,8** | **113,1** | 51,1 | 45,6 | **96,8** |
| 8 | Du warst nicht vorgesehen | 19,7 | 1,0 | 12,3 | 22,2 | **55,3** | 22,0 | 22,1 | 1,0 | 11,8 | **57,0** | **112,2** | 47,0 | 48,2 | **95,2** |
| 9 | Die zweite Ausnahme | 21,8 | 1,0 | 13,6 | 21,3 | **57,7** | 20,9 | 21,4 | 1,0 | 12,9 | **56,2** | **113,9** | 46,5 | 49,9 | **96,5** |
| 10 | Die Stimme | 19,3 | 1,0 | 13,0 | 22,2 | **55,5** | 23,0 | 23,7 | 1,0 | 12,3 | **60,1** | **115,6** | 51,2 | 49,8 | **101,1** |
| | **Staffel** | | | | | | | | | | | **1133,8 s = 18:54 min** | | | **954,7 s = 15:55 min** |

Puffer bis 20:00 min: Schätzung 66 s, mit Stimme 245 s. Die echte Stimme ist ca. 16 % schneller als die Formel. Maßgeblich ist die Messung mit Stimme: Damit liegen alle Folgen und Teile sicher unter den Höchstgrenzen (längster Teil 53,5 s, längste Folge 103,8 s). Die Schätzung von Folge 10, Teil 2 liegt mit 60,1 s knapp über 60 s, gemessen sind es 49,8 s. Die Folgen sind aber kürzer als das Ziel von 100–115 s. Wer näher ans Ziel will, ergänzt pro Kapitel eine Einstellung und vertont die Folge neu (2 Gemini-Anfragen).

## Die 20 Veröffentlichungsteile

| Nr. | Teil | Inhalt | Schätzung | mit Stimme | Grenze 60 s |
|---|---|---|---|---|---|
| 1 | Folge 1 · Teil 1 | K1, Titelkarte, K2 | 45,6 s | 37,3 s | ok |
| 2 | Folge 1 · Teil 2 | K3, K4, Fortsetzung, Check | 58,7 s | 47,6 s | ok |
| 3 | Folge 2 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 56,3 s | 43,0 s | ok |
| 4 | Folge 2 · Teil 2 | K3, K4, Fortsetzung, Check | 59,7 s | 49,9 s | ok |
| 5 | Folge 3 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 57,4 s | 47,5 s | ok |
| 6 | Folge 3 · Teil 2 | K3, K4, Fortsetzung, Check | 56,4 s | 46,5 s | ok |
| 7 | Folge 4 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 56,9 s | 46,7 s | ok |
| 8 | Folge 4 · Teil 2 | K3, K4, Fortsetzung, Check | 57,8 s | 48,3 s | ok |
| 9 | Folge 5 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 57,4 s | 43,5 s | ok |
| 10 | Folge 5 · Teil 2 | K3, K4, Fortsetzung, Check | 57,7 s | 51,1 s | ok |
| 11 | Folge 6 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 57,2 s | 53,5 s | ok |
| 12 | Folge 6 · Teil 2 | K3, K4, Fortsetzung, Check | 57,9 s | 50,3 s | ok |
| 13 | Folge 7 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 55,3 s | 51,1 s | ok |
| 14 | Folge 7 · Teil 2 | K3, K4, Fortsetzung, Check | 57,8 s | 45,6 s | ok |
| 15 | Folge 8 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 55,3 s | 47,0 s | ok |
| 16 | Folge 8 · Teil 2 | K3, K4, Fortsetzung, Check | 57,0 s | 48,2 s | ok |
| 17 | Folge 9 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 57,7 s | 46,5 s | ok |
| 18 | Folge 9 · Teil 2 | K3, K4, Fortsetzung, Check | 56,2 s | 49,9 s | ok |
| 19 | Folge 10 · Teil 1 | K1, Titelkarte, Rückblick, K2 | 55,5 s | 51,2 s | ok |
| 20 | Folge 10 · Teil 2 | K3, K4, Fortsetzung, Check | 60,1 s | 49,8 s | ZU LANG |

## Regeln beim Schreiben

- Ein Kapitel mit 4–6 Einstellungen und zusammen ca. 40–48 gesprochenen Wörtern ergibt nach der Formel ca. 20–22 s, mit Gemini-Stimme ca. 17–20 s.
- Eine Einstellung mit 8 Wörtern dauert nach der Formel ca. 4 s, mindestens aber 2 s.
- Der Check bleibt kurz: Frage und Antwort zusammen ca. 15 Wörter, dazu der feste Satz „Was hättest du gemacht? Schreib es in die Kommentare.“
- Kapitel werden nie durch zusätzliche Einleitungen verlängert, um auf eine Minute zu kommen.
