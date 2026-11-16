# DER FLUCHTWAGEN · Serienbibel

> Jonathans Wunsch vom 16.11.2026 nach dem Vorbild-Video „Das perfekte Fluchtfahrzeug Teil 2“ (veloanimations). Übernommen sind nur Aufbau und Stimmung: Nacht, Verfolgung, Wärmebild, Zahlen-Einblendungen. Geschichte, Figuren und Grafik sind eigen. Diese Datei ist verbindlich. Ablauf: `taeglich/laeufe/flucht.md`.

## Feste Regeln
- **5 Folgen**, je 62–89 s, Deutsch, Du-Form (du bist der Fahrer, Issue #31), Stimme Gemini **Orus** (`@vortrag lebendig`, `@klang studio`, nie flüstern). Höchstens 2 kurze wörtliche Sätze pro Folge (Funk, Mitfahrer), von Orus gesprochen.
- **Echte 3D-Grafik** mit three.js: Kulisse `[drei …]` (`engine/flucht.js`), Quelle `drei/flucht/szene.js`, gebündelt nach `engine/drei.js` (`cd drei && npm install && npm run bauen`). Nach jeder Änderung neu bündeln und `engine/drei.js` mit committen.
- Kein Stil „leuchtend“: eigener dunkler Nacht-Look (`@look 0`, `@kino 0.2`). Hook-Text, `ein=` und Untertitel wie gewohnt.
- **Analyse statt Anleitung:** Erzählt wird, was passiert ist und warum es klappte oder schiefging (Tempo, Glück, Fehler, Menschen). Es gibt keine Tipps, wie man Polizei, Kameras oder Fahndung austrickst, keine Verfahren zum Fälschen und keine Technik zum Unsichtbarmachen. Tempo-Angaben wie im Vorbild sind erlaubt.
- Keine Waffen, keine Verletzten, kein Blut. Die Polizei wird nicht lächerlich gemacht. Wer etwas falsch macht, trägt am Ende die Folgen (Folge 5).
- Das Auto: ein dunkelroter Sportkombi in RS-Form (Jonathan: Marke/Typ egal, „RS“-Optik), ohne Logo. Im Text heißt es „der rote Kombi“.
- Erstes Bild nie schwarz, kein „Fortsetzung folgt“ (#11), keine Fragen ans Publikum (#8). Cliffhanger am Ende der Folgen 1–4.

## Figuren
| Figur | Rolle | Merkmale |
|---|---|---|
| **Du** | Fahrer, 27, hast Schulden. Ein Bekannter hat dir 5.000 € für „eine Fahrt“ angeboten | sitzt am Steuer, man sieht dich nie (nur das Auto) |
| **Kasper** | Beifahrer, ruhig, gibt die Richtung vor | wird nur über seine Sätze gezeigt |
| **Dario** | Rücksitz, nervös, hält die Tasche | wie oben |
| Pilot von „POL-HELI 2“ | Polizeihubschrauber | nur im Funk („Zielfahrzeug erfasst“) |

## Leitmotive
- **Die Tasche** auf dem Rücksitz, über die keiner spricht (Folge 1 → Inhalt in Folge 3).
- **Das Kennzeichen**, das der Hubschrauber aufgezeichnet hat (Folge 1 → Folge 2 und 5).
- **900 PS**: Das Tempo rettet dich in Folge 1 und wird in Folge 4 zum Problem.

## 3D-Einstellungen (vorhanden)
`verfolger` (tiefe Verfolgerkamera), `seite` (schräg hinten seitlich), `front` (Auto kommt auf die Kamera zu), `boden` (vorn am Straßenrand, Auto und Hubschrauber kommen), `waerme` (Wärmebild aus dem Hubschrauber mit HUD, `hud_oben=`), `weg` (Auto zieht davon, `gas=1`), `totale` (hoch und weit). Angaben: `strahl=1`, `strahl_aus=<s>`, `auto=0`, `heli=0`, `gas=1`, `tempo=`.
**Noch zu bauen (im täglichen Lauf, vor der jeweiligen Folge):** `raststaette` (Folge 3: Tankstellendach mit Neonlicht, Zapfsäulen, leerer Parkplatz), `suv` (Folge 4: schwarzer Geländewagen mit hellen Scheinwerfern als zweiter Verfolger), `morgen` (Folge 5: Morgendämmerung, blaues Licht, Polizeiwache mit Vorplatz). Nur neue Einstellungen ergänzen, bestehende bleiben gleich.

## Rechenzeit
3D ohne Grafikkarte: ca. 2–2,5 s pro Bild (1440×2560, 60 fps), also ca. 2,5 h pro Folge auf GitHub (Grenze dort 4 h). Deshalb früh am Tag rendern.
