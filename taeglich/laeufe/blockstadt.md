# Lauf „Blockstadt“: täglich 1 eigenständige Folge „In meiner Stadt …“ (07:07, neuer Chat)

> **NEU (Jonathan 26.11., Issue #45) – gilt vor allem, was weiter unten steht:**
> - **Keine fortlaufende Serie mehr** („keine Folge 4“). Jede Folge ist **eigenständig** und hat eine **neue verrückte Regel der Stadt**,
>   z. B. „In meiner Stadt bekommst du Geld fürs Schlafen“, „… Geld, wenn dich jemand anlügt“, „… kein Geld fürs Arbeiten“.
>   Erster Satz = die Regel (Hook), danach Folgen der Regel, Eskalation, Wendung/Pointe am Ende (wie Vorrat 04/05).
> - **Keine Mitmach-Frage A/B/C mehr, kein Top-Kommentar, keine Abstimmung** (Schritt 4 entfällt). Eine einfache Kommentar-Frage
>   im Beschreibungstext ist erlaubt („Welche Regel soll meine Stadt als Nächstes haben?“).
> - Jeden Tag eine **andere Regel und eine andere Welt/Kulisse**, nie eine Regel wiederholen: vorher `taeglich/verlauf.json`
>   (art „blockstadt“) und `block/vorrat-*/zeilen.py` durchsehen und die neue Regel unten in „Benutzte Regeln“ eintragen.
> - **REALISTISCH, KEINE RANDOM-VIDEOS (Jonathan 26.11., Issue #46):** Alles muss sozusagen realistisch aussehen – nichts steckt
>   ineinander (z. B. Rakete nicht in etwas drin), nichts ragt durch Wände/Möbel/Fahrzeuge, alles steht auf dem Boden. Standbilder
>   genau darauf prüfen. Keine Random-Folgen wie „Grill-Rakete“ (v05) mehr, nur noch „In meiner Stadt …“ mit einer Regel.
> - **Nur noch 3D-Videos.** Die Nischen-Videos „Was wäre, wenn du …“ / „So baust du …“ (alter 2D-Stil) sind eingestellt.
>   Die englischen Konten bekommen deshalb täglich die englische Blockstadt-Folge (Abschnitt „Englische Blockstadt“ unten).
> - Fester Hintergrundsound (Issue #44), Stimme Puck unbearbeitet (Issue #41), 1440p rendern, kein Wackeln, kein Flackern.
> - Ist eine fertige eigenständige Folge im Vorrat (`block/vorrat-*`, status „vorrat“ in `verlauf.json`), darf sie bei Zeitnot
>   eingeplant werden; Vorrat-Folgen mit A/B/C-Frage am Ende nur nach Kürzen der Frage (YouTube-/plan-Schnitt über `zusammen(..., ohne=…)`).
>
> **Benutzte Regeln:** Lügen-Zahl über dem Kopf (v01), Geld fürs Schlafen (v02), gute Tat = Stern (v03), angelogen werden = +100 $ (v04), Grill-Rakete (v05, Random – so nicht mehr, #46); gesendet: v05 (26.11.), v04 (27.11., gekürzt ohne Frage) – hier ergänzen

## Alte Fassung (bis 25.11., nur noch als Werkzeug-Referenz)

Jonathans Auftrag vom 22./23.11.: Auf den deutschen Kanälen erscheint jeden Tag 1 Folge der Blockstadt-Serie, auf TikTok, Instagram und YouTube.
- **Ende jeder Folge:** eine offene Frage mit 3 Antworten (A/B/C). Die Zuschauer schreiben ihre Wahl in die Kommentare.
- **Nächste Folge:** setzt das um, was die meisten gewählt haben.
- **Verbindlich:** `block/README.md` und `block/KATALOG.md`, also Bibliothek und Regeln.

Arbeite selbstständig, ohne Rückfragen, auf Deutsch. Qualität vor Quantität (#30).

## Feste Regeln (Jonathan)

- **MARKEN ERLAUBT (24.11., Issue #42):** Marken und Spiele dürfen genannt und gezeigt werden, Logos möglichst detailgetreu.

- **STIMME UNVERÄNDERT (24.11. abends):** Die Stimme wird nicht bearbeitet – keine Tonhöhe, kein Kompressor/EQ, kein Tempo, kein Begrenzer, kein `loudnorm`. Nur Musik und Geräusche anpassen. Zum Kodieren `block/lautheit.py` (fester Faktor). Details: `block/README.md` → „Stimme unverändert“.

- **Stil:** wie Folge 1. Nachtstadt, Blockfiguren, Ich-Erzählung („In meiner Stadt …“ in Folge 1; ab Folge 2 geht es direkt weiter). Papa, Oma und die Schatten-Wesen bleiben.
- **Stimme:** Gemini „Puck“ als Kinderstimme, **fröhlich und mitreißend wie ein Storytime-Kind** (Jonathan 23.11. abends: „noch nicht dieses Etwas, mehr freudige Stimme wie im Vorbild“). Immer über `block/stimme.py` (`erzeugen` + `zusammen`): kurze Abschnitte (3 Zeilen), Auswahl nach Sprachmelodie, kurze Pausen (0,12 s, Spannungspausen höchstens +0,45 s), keine Radio-Kette, **keine** Tonhöhen-Angleichung (Issue #41, die Stimme bleibt unbearbeitet).
- **Lautstärke:** Die Stimme liegt **12 LU über Musik und Geräuschen** wie im Vorbild (Jonathan 23.11.: „Audio zu leise im Vergleich zum Hintergrund“). `Ton.mischen()` in `block/tonbib.py` pegelt das automatisch und gibt den Abstand aus; nie `musik_laut=` setzen (das ist der alte, zu laute Hintergrund von Folge 1).
- **Musik:** passt zur Stimmung jeder Zeile, über `block/tonbib.py` mit `Ton.musik([...])`.
- **Bild:**
  - Kein Kamera-Wackeln, nichts darf flackern. Das Gerüst `block/folge.js` sorgt dafür.
  - Ein-Wort-Untertitel in Gelb.
  - Große Autos.
  - Figuren immer mit `struktur: true` (Stoff und Haare wie im Vorbild, seit 23.11.). Objekte und Straßenzüge aus `block/objekte.js` und `einkaufsstrasse()` nutzen, damit die Kulissen voll und lebendig wirken.
  - Erstes Bild nie schwarz.
- **Ende:** „Was soll ich jetzt tun?“, dann 3 kurze Antworten in einem Satz, dann „Schreibt es in die Kommentare. Was die meisten sagen, mache ich.“ Dazu die Karten A/B/C im Bild.
- **Längen:**
  - TikTok und Instagram: volle Länge, ideal 75–110 s.
  - YouTube: höchstens 89 s. `zusammen_yt.py` lässt Nebensätze weg und läuft höchstens 6 % schneller.
- **Uhrzeiten (Berlin, das Skript streut ±30 min):**
  - Instagram 12:00
  - YouTube 17:30
  - TikTok 19:00

## Erzählmittel aus dem Vorbild-Video (Jonathan 23.11.: „die Elemente auch bei uns verwenden“)

Nur die Mittel übernehmen, nie Inhalte (keine Lava-Stunde, keine Mammuts, keine Werbung). Bausteine dafür in `block/alltag.js` (siehe `KATALOG.md`).
- **Beweis-Montage nach dem Hook:** Auf die Behauptung folgen 2–3 schnelle Alltagsbeweise, jeder an einem neuen Ort (Küche, Schule, Omas Stube, Straße) und jeder mit einem kleinen Witz.
- **Bekannte Personen mit Gag:** Lehrer, Oma, bester Freund und Papa tun etwas Lustiges, das zur Regel der Stadt passt. Zum Beispiel schreibt der Lehrer das falsche Wort an die Tafel, oder Oma bestellt im Internet etwas Verrücktes, mit Preisschild.
- **Bildschirm als Fenster:** Handy, Fernseher oder Großbildschirm zeigen eine zweite Szene. Wo es passt, einmal pro Folge der **Flug ins Handy** (`kamera.insHandy` → `kamera.imHandy`) als Übergang in die Handlung.
- **Text in der Welt:** Tafel, Schild, Handy-Seite, Fehlermeldung. Nur kurze Wörter, groß lesbar, nie mehr als eine Zeile gleichzeitig zum Lesen.
- **Tempo:** Etwa alle 2 s ein neues Bild, jede Zeile mindestens eine eigene Einstellung. Mischen aus Totale, Über-die-Schulter, Gesicht in Nahaufnahme (`staunen`, `angst`) und Blick aufs Handy.
- **Wendepunkt:** „Aber …“ oder „Doch dann …“ nach etwa einem Drittel, danach ein Spektakel-Höhepunkt mit eigenen großen Wesen oder Massen.
- **Zeitraffer mit Uhrzeit (24.11.):** „8 Uhr … 9 Uhr … Mittag …“, jede Uhrzeit ein eigenes kurzes Bild mit Uhr in der Welt (Wecker, Wanduhr, `leinwand`).
- **Laufender Zähler (24.11.):** Wenn es um Geld, Punkte oder Anzahl geht, zählt `Z_.zaehler` sichtbar mit (grün hoch, rot runter). Das ist ein starker Dopamin-Moment.
- **Doppelte Wendung (24.11.):** Der Plan scheint aufzugehen, dann kommt die Wendung („alle hatten denselben Plan“), und danach dreht sich alles um (der Zähler läuft rückwärts). Am Ende steht ein kurzer, witziger Satz einer bekannten Person (Opa, Oma).
- **Bunte Kleinstadt als Ort (Jonathan 23.11. abends):** Außenszenen bevorzugt im `BUNTDORF` (bunte Reihenhäuser, Läden, Dorfplatz mit Brunnen, Skyline), tagsüber oder im Abendrot, wie in den Vorbild-Videos. Die Nachtstadt bleibt für Grusel und Stromausfall.
- **Helle Szenen als Kontrast:** Tag (`U.uTag = 1`, dazu `U.uWolken = 1` für blauen Himmel mit Wolken und bunte Häuser), bunte Innenräume und Feier-Effekte (Konfetti, Ballons, Regenbogen) sind erlaubt. Die Stadt bleibt aber meist nachts, das ist unser Wiedererkennungszeichen.

## Story-Richtung „Herz“ (Jonathan 24.11.: „Story sollte auch mal in die Richtung gehen danach“)

Vorbild: `block/vergleiche/2026-11-24-erstes-wort.md`. Nach dem aktuellen Spannungsbogen (oder wenn die Abstimmung es zulässt) kommen auch **emotionale Geschichten mit Herz** dran, nicht nur Grusel und Action:
- **Aufbau:**
  1. Die Regel der Stadt.
  2. Eine Figur wird von allen missverstanden. Sie gilt als gierig, komisch oder gefährlich, und „ich“ mache mit.
  3. Kleine Hinweise, dass etwas nicht stimmt (müde, Husten, kaputte Schuhe).
  4. Eine falsche Beschuldigung, keiner entschuldigt sich.
  5. Zusammenbruch, „ich“ helfe zum ersten Mal.
  6. Eine dritte Person (Schwester, Oma) erzählt die Wahrheit: Die Figur hat heimlich ein großes Opfer gebracht.
  7. Ein letzter Satz, der alles umdreht.
- **Ich-Erzählung bleibt.** „Ich“ bin derjenige, der falsch lag und es am Ende versteht. So fühlt sich der Zuschauer mitschuldig, und das wirkt stärker.
- **Bild:** viele Nahaufnahmen von Gesichtern (`traurig`, `weinen`, `kneifen`, `muede`, `schwitzen`), ruhige Kamera, gedämpfte Musik (`traurig`, `stille`), zum Schluss Stille.
- **Ende:** Auch hier gibt es eine Mitmach-Frage, aber eine leise, zum Beispiel „Was soll ich ihm sagen?“ mit A/B/C.
- **Grenzen:** nie Blut, nie Gewalt. Krankheit nur andeuten (Husten, Krankenhausbett), kein Tod im Bild.

## Story-Richtung „Fesselnd“ (Jonathan 24.11.: „auch sowas in die Richtung, was fesselnd ist“)

Vorbild: `block/vergleiche/2026-11-24-ein-tag.md` (69 s, sehr dicht). Merkmale, die wir übernehmen:
- **Eine sichtbare Regel mit Zahl:** Jeder sieht etwas über dem Kopf, zum Beispiel eine Zahl oder einen Text (`Al.kopfzahl`, für die ganze Menge `B.mengeZahlen`). So versteht man die Regel in einer Sekunde.
- **Beispiel-Salve:** 4–5 Leute aus der Stadt mit Zahl und einem witzigen Halbsatz („Opa: nur noch 3 – deshalb fährt er heute zum ersten Mal Achterbahn“).
- **Die Hauptperson ist die Ausnahme:** „Und ich? Bei mir steht seit meiner Geburt …“
- **Montage:** Die Hauptperson lebt die Regel aus, mit 4–6 schnellen Bildern, jedes mit Pointe, alle 1–1,5 s ein Schnitt (Wisch-Übergang `B.wisch`).
- **Wendung in den letzten 10 s**, die alles umdreht: Über **allen** Köpfen steht plötzlich dieselbe Zahl, und Gewitterwolken ziehen auf (`U.uGewitter`). Danach sofort die Mitmach-Frage A/B/C.
- **Länge 65–75 s**, Sätze höchstens 8 Wörter.

## Story-Richtung „Paradox-Komödie“ (Jonathan 24.11.: „auch so Storys wie diese“)

Vorbild: `block/vergleiche/2026-11-24-pech.md`. Eine verdrehte Regel, bei der **das Gute schlecht ist** (oder umgekehrt), und „ich“ habe genau das Falsche:
- **Regel mit Preisliste:** 3 Beispiele mit steigenden Beträgen oder Punkten („Bus verpasst: 100 €, Regen: 500 €, Haus kaputt: 1 Million“), dabei läuft der Zähler (`Z_.zaehler`).
- **Nachbar und Reichster als Beweis**, jeder in einem Satz mit Bild-Gag (Blitz `Al.blitz`, Regenwolke `Al.regenwolke`).
- **„Und ich? Ich habe ein riesiges Problem.“** Ich bin die Ausnahme.
- **Drei Versuche, die jeweils ins Gegenteil kippen**, jeder endet mit „0 €“ als roter Zähler. Die Steigerung ist wichtig: Der dritte Versuch ist der verrückteste.
- **Offizielle Stelle bestätigt es** (Schalter, Scanner-Bildschirm mit `leinwand`: „0 %“).
- **Tiefpunkt** auf dem Bett, Abendrot (`U.uAbend`), leise Musik.
- **Paradox-Pointe als Nachricht aufs Handy** (`handySeite`), die die Regel auf sich selbst anwendet. Danach folgt bei uns die Mitmach-Frage statt des Happy Ends.

## Test ab 24.11. (Jonathan 23.11.: „als Test einfach morgen verwenden“)

Ab Folge 2 kommen die neuen Bibliotheks-Elemente zum Einsatz. Jede Folge nutzt mindestens:
- Figuren mit `struktur: true`. Die Gesichter liegen automatisch auf dem runden Kopf.
- Mindestens **3 neue Elemente**, sonst wiederholt jede Folge dieselben Bilder. Zur Auswahl:
  - Kulissen: `VORSTADT`, `einkaufsstrasse()`, `AULA`, `KLASSE`, `KUECHE`, `STUBE`
  - Erzähl-Werkzeuge: Flug ins Handy, Großbildschirm, Tafel/Schild (`leinwand`), Geld-Zähler (`Z_.zaehler`), Geldscheine
  - Figuren-Zubehör: Propellermütze, Sonnenbrille, Muster
  - Objekte: `riesenTier`, `objekte.js` (Haus, Schule, Sportwagen, Bus, Tiere …)
- Die Erzählmittel oben (Beweis-Montage, Zeitraffer, Zähler, doppelte Wendung), soweit sie zur gewählten Antwort passen.

Vor dem Schreiben `node block/katalog_bilder.cjs alle` laufen lassen und `block/katalog/uebersicht.jpg` ansehen, damit klar ist, was es gibt. In `verlauf.json` → `block-bNN.elemente` eintragen, welche neuen Elemente benutzt wurden. Das braucht die Wochenanalyse.

Fehlt für die Geschichte ein Element: es in der Bibliothek bauen (Regeln im Skill `bibliothek`, `.claude/skills/bibliothek/SKILL.md`), nie nur in der Folge.

## Ablauf

1. **Repo vorbereiten:**
   ```
   cd /home/user/animierte-serie && git fetch origin taeglich main && git checkout -B taeglich origin/taeglich
   pip install -q -r requirements.txt
   (cd block && npm ci --ignore-scripts)
   python3 -m http.server 8767 --directory block &
   ```
2. **Schon erledigt?** Steht in `posten/plan.json` auf `main` schon `taeglich-insta-bNN` mit heutigem Datum, hier aufhören.
3. **Lesen:**
   - `block/README.md` und `block/KATALOG.md`;
   - die letzte Folge (`block/folge-NN/zeilen.py`, `szene.js` bzw. `szene.html`);
   - `taeglich/verlauf.json` → Eintrag `block-bNN` mit `antworten`.
4. **Abstimmung auswerten:**
   - Workflow „Posts einplanen“ (`posten.yml`, `main`) mit `kommentare=true` starten, warten bis fertig, `git fetch origin main`, dann `python3 block/stimmen.py NN`.
   - Es gewinnt die Antwort mit den meisten Nennungen über alle Plattformen. Gültig sind A/B/C oder eindeutige Stichwörter aus den Antworten.
   - **Nie ein Ergebnis erfinden.** Ohne gültige Stimme entscheidet die spannendste Antwort, und die Folge sagt nicht „ihr habt gewählt“.
   - Das Ergebnis in `verlauf.json` → `block-bNN.ergebnis` eintragen.
5. **Geschichte der neuen Folge:**
   - Beginnt direkt mit der gewählten Handlung, zum Beispiel „Ich habe das Licht angemacht. …“.
   - Ein Spannungsbogen mit Spektakel-Höhepunkt, wie die Laternen in Folge 1.
   - Endet mit neuer Gefahr und neuer Frage.
   - 22–28 Zeilen, kurze Sätze, Ich-Erzählung.
   - Jede Zeile bekommt eine Stimmung (siehe `tonbib.py`).
   - Eigene Ideen, nie Inhalte fremder Videos übernehmen.
6. **Ordner `block/folge-NN/`:**
   - `zeilen.py` mit Zeilen und Stimmungen.
   - Stimme: kleines `stimme.py` in der Folge, das `from stimme import erzeugen, zusammen` (Ordner `..`) nutzt: `erzeugen(zeilen, '.')`, dann `zusammen('.', extra={…})` und `zusammen('.', extra={…}, yt=True, ohne=[{…}])`. Nicht mehr `folge-01/stimme4.py` kopieren.
   - `szene.js`: nur Ereignisse und Einstellungen. Alles Wiederkehrende kommt aus `../folge.js`, Kulissen, Objekte und Figuren aus der Bibliothek (`KATALOG.md`).
   - Neue Kulissen oder Objekte kommen **in die Bibliothek** (`requisiten.js` usw.), nicht in die Folge, und werden in `KATALOG.md` eingetragen.
7. **Standbilder:**
   - `FOLGE=folge-NN node block/mitten.cjs alle`, als Kontaktbogen ansehen.
   - Prüfen: keine Kamera in Objekten, nichts verdeckt Gesichter, Karten verdecken nichts Wichtiges.
   - Korrigieren, bis alles sauber ist. Danach mit `PLAN=plan_yt.json` noch einmal.
8. **Rendern:** `SKALA=2 block/alles_rendern.sh <Bilder voll> <Bilder yt>` (anpassen auf `FOLGE`). **Ab 25.11. immer `SKALA=2`** (rendert 1440×2560, Qualitätstest 24.11.: deutlich schärfer als 720p, nach TikTok fast so gut wie 1440p mit 25 Mbit/s). 60 fps, dauert etwa doppelt so lange wie 720p.
   **Wichtig (25.11.):** Die Cloud-Umgebung schläft ein, sobald keine Aufgabe mehr läuft, und beendet dabei alle Prozesse (auch `setsid nohup`). Den Render deshalb als Bash-Aufgabe mit `run_in_background` und langer Zeitgrenze starten (nicht nur im Hintergrund abkoppeln) und erst nach deren Ende weitermachen. Nach Abbrüchen mit `WEITER=1` fortsetzen und vorher kaputte Bilder suchen (PIL öffnen, Größe 1440×2560) und per `LISTE=` neu rendern. 1440p läuft mit etwa 20–25 Bildern pro Minute (3 Teile).
9. **Ton:** `tonspur.py` der Folge mit `tonbib.Ton` (Musik nach Stimmung, Geräusche, Karten-Töne) und `T.mischen()` ohne `musik_laut` (Ausgabe „Abstand Stimme–Hintergrund“ muss ≈ 12 LU sein), für YouTube mit `PLAN=plan_yt.json STIMME=stimme_yt.wav MIX=mix_yt.wav`.
10. **Kodieren und prüfen:**
    - **1080×1920, unter 100 MB** (GitHub-Grenze): `-vf scale=1080:1920:flags=lanczos -c:v libx264 -preset slow -crf 18 -maxrate <R> -bufsize <2R> -pix_fmt yuv420p`, dabei R = 8M bis 90 s, darüber R = 760 / Dauer in s (z. B. 110 s → 6.9M). Mehr Bitrate bringt nach TikTok nichts (Test 24.11.). Ton mit `block/lautheit.py` auf −14 LUFS, die Stimme bleibt unbearbeitet (Issue #41).
    - Kontaktbogen im Halbsekunden-Abstand ansehen.
    - Spracherkennung über die Mischung: Jede Zeile muss erkennbar sein. Werden Wörter verschluckt, Geräusche verschieben oder leiser machen.
11. **Veröffentlichen:**
    - Videos ablegen als `ausgabe/taeglich-block-bNN.mp4` (voll) und `ausgabe/taeglich-block-bNNk.mp4` (YouTube).
    - Einträge `block-bNN` und `block-bNNk` in `verlauf.json` anlegen: `titel`, `beschreibung` mit der Frage, 2 Hashtags, `kommentar_frage`, `antworten`.
    - Dann:
      ```
      TAEGLICH_TRAILER=<Attribution> python taeglich/veroeffentlichen.py block-bNN --max-dauer 120 --plattformen tiktok,instagram --insta-zeit <heute>T12:00 --zeit <heute>T19:00
      TAEGLICH_TRAILER=<Attribution> python taeglich/veroeffentlichen.py block-bNNk --plattformen youtube --zeit <heute>T19:00 --yt-zeit <heute>T17:30 --yt-konto storys4youytube
      ```
      **Neuer YouTube-Kanal ab 25.11. (Jonathan 24.11.):** Die neuen Folgen gehen auf den neuen Kanal. Er heißt `storys4youytube` (2. Zernio-Konto, verbunden am 24.11.). Fehlt er in `posten/konten.txt`, YouTube nicht planen, sondern Jonathan Bescheid geben.
      ```
      ```
    - Im Log von „Posts einplanen“ prüfen, dass alle Posts mit ✓ eingeplant sind.
12. **Sichern:** Alles committen und auf `taeglich` pushen, mit `[skip ci]` und den Attributionszeilen.

## Englische Blockstadt – zweiter englischer Post (Jonathan 24.11. abends)
**Gilt erst, wenn es mindestens einen zusätzlichen Gemini-Schlüssel gibt:** `env | grep -c "^GEMINI_API_KEY_6="` muss 1 ergeben.
Ohne zusätzlichen Schlüssel diesen Abschnitt überspringen (sonst reicht das Kontingent nicht, Rechnung in `quer/FORMAT-3D.md`).
Dann bekommen die englischen Konten täglich 2 Posts: das Nischen-Video (wie bisher) und die englische Blockstadt-Folge des Tages.
- **Wann:** im selben Lauf, nachdem die deutsche Folge geplant ist. Reicht die Zeit nicht, am nächsten Tag zuerst nachholen.
- **Text:** die Zeilen der deutschen Folge in natürliches amerikanisches Englisch übersetzen (gleiche Pointen, kurze Sätze),
  Ich-Erzählung, Mitmach-Frage A/B/C auf Englisch. In `zeilen_en.json` im Folgen-Ordner.
- **Text im Bild:** alle Schilder, Tafeln, Handy-Texte in der Szene mit `B.T({ de: "…", en: "…" })` schreiben (ab jetzt in jeder neuen Folge).
  Marken und Logos bleiben gleich.
- **Stimme:** `SPRACHE=en VERSUCHE=2` mit `stimme.erzeugen(zeilen_en, "en")` und `zusammen("en", …)` → Ordner `en/` (Puck, unbearbeitet, Issue #41).
- **Rendern:** `SPRACHE=en SKALA=2 PLAN=en/plan_final.json ORDNER=frames_en ./rendern.sh <folge>`, YouTube-Fassung ≤ 89 s ebenso mit `en/plan_yt.json`.
  Ton mit `tonspur.py` (PLAN/STIMME/MIX auf die englischen Dateien), kodieren wie oben, `lautheit.py`.
- **Veröffentlichen:** Eintrag `en` in `verlauf.json` (titel, beschreibung, hashtags, tags auf Englisch), dann
  `python taeglich/veroeffentlichen.py block-bNN --englisch --max-dauer 120 --plattformen tiktok,instagram --insta-zeit <heute>T19:00 --zeit <morgen>T03:30`
  und `… block-bNNk --englisch --plattformen youtube --zeit <morgen>T03:30 --yt-zeit <heute>T20:30`.
  Uhrzeiten (Berlin, ±30 min): Instagram 19:00, YouTube 20:30, TikTok 03:30 (US-Abend). So liegen sie über 2 h neben dem Nischen-Video (22:00/23:30/01:00).
