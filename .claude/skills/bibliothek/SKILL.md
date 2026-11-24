---
name: bibliothek
description: Blockstadt-Bibliothek mit einem Vorbild-Video abgleichen und verbessern. Jonathan schickt einen TikTok-, Reel- oder YouTube-Link (meist Blockfiguren- oder Story-Videos wie „In my town …“), oft mit „vergleichen“, „Elemente übernehmen“ oder „Bibliothek“ – oder nur den Link mit einer kurzen Notiz zu Bild, Figuren oder Stil. Dann das Video ansehen, in einzelne Elemente zerlegen (Kulissen, Objekte, Figuren, Wesen/Tiere, Effekte, Kamera, Schnitt, Text im Bild, Ton, Erzählmittel), jedes Element mit unserer Bibliothek in block/ vergleichen (Vorschaubilder aus dem Fotostudio), fehlende Elemente neu bauen und schwächere verbessern, bis sie mindestens gleich gut aussehen. Immer nutzen, wenn ein Video als Vorbild für die Blockstadt-Serie dient oder die Bibliothek wachsen soll – auch wenn das Wort „Bibliothek“ nicht fällt. Nicht für Song-Edits (MP3 oder Reel ohne Blockfiguren → edits/README.md) und nicht für reine Zahlen-Auswertungen (serien-analytics).
---

# Bibliothek: Vorbild-Video zerlegen, vergleichen, verbessern

Ziel (Jonathan 23.11.): Die Blockstadt-Folgen bauen sich aus fertigen, geprüften Teilen zusammen (`block/KATALOG.md`). Jedes Vorbild-Video soll die Bibliothek ein Stück besser machen. Wir übernehmen dabei, **wie** etwas gemacht ist, nie **was** gezeigt wird. Das hat zwei Gründe: Jonathans feste Regel (nur den Aufbau von Vorbildern übernehmen, nie Inhalte; eigene Wesen, nie bekannte nachbauen). Seit 24.11. gilt: Marken und Spiele dürfen genannt und gezeigt werden, auch mit Logos, möglichst detailgetreu (Jonathan 24.11., Issue #42) – Marken, Spiele und Logos aus dem Vorbild dürfen also vorkommen; die Handlung bleibt trotzdem unsere eigene., und die Folgen sollen eigenständig bleiben.

Arbeite selbstständig und ohne Rückfragen, auf Deutsch. Qualität vor Menge: lieber 4 Elemente richtig gut als 15 halb.

## Werkzeuge

| Was | Wie |
|---|---|
| Video ansehen | `python3 .claude/skills/watch/scripts/watch.py "<URL>" --engine local --question "<Notiz von Jonathan>"`. Gibt Bilder mit Zeitstempeln und einen Arbeitsordner aus. |
| Sprache im Video | Ohne Untertitel: faster-whisper auf `<arbeitsordner>/download/*/video.mp4`. Das Audio vorher mit ffmpeg nach 16 kHz mono wandeln und als numpy-Array übergeben, weil `av.open` hier scheitert. |
| Kontaktbogen | `ffmpeg -pattern_type glob -i '<frames>/*.jpg' -vf "scale=300:-1,tile=10x3" -frames:v 1 bogen.jpg`. Ein Bild statt 60 Einzelbilder spart viel Platz im Kontext. |
| Unsere Vorschaubilder | Server: `python3 -m http.server 8767 --directory block` (im Hintergrund), dann `node block/katalog_bilder.cjs alle` → `block/katalog/<name>.jpg` und `uebersicht.jpg`. Einzelne Elemente: `node block/katalog_bilder.cjs objekt-baum,figur-lehrer`. |
| Nebeneinander | `python3 .claude/skills/bibliothek/scripts/vergleich.py bogen.jpg "Name=VORBILD[@x0,y0,x1,y1]:UNSER" …`. Mit `@…` wird das Element im Vorbild herausgeschnitten (Anteile 0…1). Ohne UNSER steht dort „FEHLT“. |
| Probe in Bewegung | Für Kamera, Schnitt und Effekte eine kleine Probe-Szene wie `block/probe-alltag/` (szene.js + plan_final.json), Standbilder mit `FOLGE=probe-… node block/mitten.cjs <zeiten>`. |

## Ablauf

### 1. Ansehen
Video mit dem watch-Skill holen und den Kontaktbogen ansehen. Den Text mitlesen (Untertitel oder Spracherkennung), damit klar ist, welche Bilder zu welcher Erzählstelle gehören. Länge, Anzahl der Szenenwechsel und Sekunden pro Einstellung notieren: Tempo ist selbst ein Element.

### 2. Zerlegen
Jedes sichtbare oder hörbare Gestaltungsmittel ist ein Element. Gehe die Kategorien einzeln durch, damit nichts untergeht:

- **Kulissen:** Straße, Platz, Innenräume, Möbel, Tag/Nacht, Farbwelt
- **Objekte:** Requisiten, Fahrzeuge, Pflanzen, Schilder, Bildschirme
- **Figuren:** Körper, Gesichter und Ausdrücke, Haare, Kleidung (Struktur, Falten), Posen, Gehen
- **Wesen und Tiere**
- **Effekte:** Licht, Partikel, Wetter, Feuer, Konfetti
- **Kamera:** Höhe, Fahrten, Über-die-Schulter, Ich-Sicht, Flug in einen Bildschirm
- **Schnitt und Tempo**
- **Text im Bild:** Untertitel-Stil, Schrift in der Welt, Karten
- **Ton:** Stimme, Musik je Stimmung, Geräusche
- **Erzählmittel:** Hook, Beweis-Montage, Gags, Wendepunkt, Ende/Frage

Zu jedem Element den Zeitpunkt im Video notieren (für den Ausschnitt im Vergleich).

### 3. Vergleichen
Für jedes Element das passende Gegenstück in `block/KATALOG.md` suchen und die Vorschaubilder erzeugen. Dann mit `vergleich.py` einen Bogen bauen und **wirklich ansehen**. Bewerte jedes Element ehrlich mit einer von vier Stufen:

- **fehlt:** gibt es bei uns nicht
- **schwächer:** gibt es, sieht aber deutlich schlechter aus (weniger Details, schlechtere Form, Licht oder Farbe, steifere Bewegung)
- **gleich gut**
- **besser:** unseres ist besser, nichts tun

Typische Unterschiede, auf die du achten solltest: Struktur auf Stoff und Haaren, Kanten-Rundung, Augen und Brauen, Farbsättigung, Kontaktschatten am Boden, Detaildichte (wie viele kleine Dinge in einer Kulisse stehen), Kamerahöhe.

### 4. Auswählen
Nicht alles auf einmal. Wähle die 3–6 Elemente, die am meisten bringen. Am meisten bringt, was in unseren Folgen oft oder lange zu sehen ist (Figuren, Stadt, Gesichter vor Requisiten) und was als „fehlt“ oder „schwächer“ bewertet ist. Inhaltliche Dinge des Vorbilds (bestimmte Tiere, Monster, Orte, Markennamen) werden zu einem **eigenen** Element umgedacht. Beispiel: Aus „Riesen-Mammuts in der Stadt“ wird „Riesen-Tier in der Straße“ als allgemeiner Baustein mit eigenem Aussehen.

### 5. Bauen oder verbessern – immer in der Bibliothek
- **Wohin:**
  - Objekte: `block/objekte.js` (Funktion, die eine Group zurückgibt, in `ALLE` eintragen; dann erscheint sie automatisch im Fotostudio)
  - Figuren und Gesichter: `block/figuren.js`
  - Wesen und Effekte: `block/wesen.js`
  - Kulissen und Sets: `block/requisiten.js` oder `block/alltag.js`
  - Kamera und Gerüst: `block/folge.js`
  - Ton: `block/tonbib.py`
  - Neue Kulissen zusätzlich als Eintrag in `K` in `block/katalog.js`
- **Nie in eine einzelne Folge bauen.** Sonst kann die nächste Folge es nicht benutzen.
- **Bestehende Folgen nicht verändern:** Neue Optionen mit Standardwerten einführen, die das alte Aussehen behalten. Zum Beispiel `stoffStruktur: true` nur, wenn man es übergibt. Fertig gerenderte Videos bleiben, wie sie sind.
- **Feste Bildregeln:**
  - kein Flackern: Zufall immer mit festem Startwert (`zufall(saat)`), nie `Math.random()` pro Bild
  - kein Kamera-Wackeln
  - Maßstab: Figur etwa 4,1 m
  - die Nachtstadt bleibt unser Wiedererkennungszeichen; helle Szenen sind die Abwechslung
- **Leistung:** viele gleiche Dinge als `InstancedMesh`. Texturen aus Canvas einmal erzeugen und zwischenspeichern. Das Rendern läuft in SwiftShader, jede Lichtquelle kostet in allen Materialien Zeit.

### 6. Prüfen und nachbessern
Nach dem Bauen die Vorschaubilder neu erzeugen und den Vergleichsbogen **noch einmal** bauen. Ein Element ist erst fertig, wenn es im Bogen mindestens gleich gut aussieht. Sonst gezielt nachbessern und erneut vergleichen, höchstens etwa 3 Runden pro Element. Bewegte Elemente (Kamera, Effekte) zusätzlich in einer Probe-Szene an mehreren Zeitpunkten prüfen, auch am Übergang zwischen zwei Einstellungen.

### 7. Festhalten
- `block/KATALOG.md`: neue oder verbesserte Elemente mit Name, Was und Steuerung eintragen.
- Bericht `block/vergleiche/<JJJJ-MM-TT>-<kurzname>.md` nach der Vorlage unten. Den Vergleichsbogen (vorher und nachher) in den Chat schicken; die Bilder selbst werden nicht eingecheckt (`*.jpg` steht in der .gitignore).
- Erzählmittel, die für künftige Folgen gelten sollen, kurz in `taeglich/laeufe/blockstadt.md` → „Erzählmittel“ ergänzen.
- Commit auf den aktuellen Branch mit `[skip ci]` und den Attributionszeilen, dann pushen.

## Vorlage Bericht

```markdown
# Vergleich <Datum>: <kurzer Titel des Vorbilds>
Quelle: <Link> · Länge <s> · <n> Szenenwechsel (≈ <s> pro Einstellung)

| Element | Kategorie | Vorbild (Zeit) | Unser Gegenstück | Stufe vorher | Maßnahme | Stufe nachher |
|---|---|---|---|---|---|---|
| Lehrer mit Jacke | Figur | 0:13 | figur-lehrer | schwächer (Stoff glatt) | Stoff-Struktur in figuren.js (`stoff: "falten"`) | gleich gut |

Nicht übernommen (Inhalt statt Mittel): …
Offen für später: …
```

## Abschluss im Chat
Kurz und ohne Fachwörter: was im Video auffiel, was wir schon gleich gut hatten, was neu gebaut oder verbessert wurde (mit Vorher-Nachher-Bogen) und was bewusst nicht übernommen wurde.
