# Bibliothek Blockstadt – was es schon gibt (vor jeder neuen Folge lesen)

**Vorschaubilder aller Elemente:** Server starten (`python3 -m http.server 8767 --directory block`), dann `node block/katalog_bilder.cjs alle` → `block/katalog/<name>.jpg` und `block/katalog/uebersicht.jpg`. Das Fotostudio (`katalog.html` und `katalog.js`) zeigt jedes Element im echten Serien-Look. Vorbild-Videos vergleicht der Skill `bibliothek` (`.claude/skills/bibliothek/`); die Berichte liegen in `block/vergleiche/`.

Ziel (Jonathan 23.11.): Jede Folge setzt sich aus fertigen, geprüften Teilen zusammen. Das spart Arbeit, und die Qualität bleibt mindestens gleich.

- **Neue Teile gehören in die Bibliothek**, nicht in die Folge, und kommen in diese Liste.
- **Koordinaten:** Platz-Mitte (0, 0). Die Straßen liegen bei x bzw. z = 24 + 48·k. Ein Block ist 36 m groß, eine Straße 12 m breit. Der Platz reicht über |x|, |z| < 66.

## Welt (`welt.js`)

| Name | Was | Steuerung |
|---|---|---|
| Stadt | 15×15 Blöcke, Hochhäuser mit Fenster-Shader. Fenster leuchten nachts, in der Ferne geglättet | `U.uAus` (Stromausfall-Welle vom Kraftwerk), `U.uAn` (Strom zurück), `U.uTag` (Tag 0/1), `U.uGold` (goldenes Laternenlicht) |
| `LOTS` | Liste aller Häuser {x, z, w, d, h} | hohes Haus finden: `LOTS.filter(...).sort(...)` |
| Himmel, Mond, Sterne | Nacht mit Stadtschein, Tag, Gold | über dieselben Uniforms |
| Boden | Straßen, Zebrastreifen, Gehwege, Platz-Pflaster, Lichtpfützen der Laternen | automatisch |
| Straßenlaternen | Instanzen an allen Kreuzungen | `lampenAktualisieren(t)` (folgt dem Strom) |
| Autos | 420 Instanzen, 1,7× groß, fahren | `autosSetzen(t, stopp, aus, weg)`: weg(v) blendet Autos in einem Bereich aus |
| Kraftwerk `KW` | Kühltürme, Halle, Schlot, Trafo-Hof, Flutlichter, Strommasten | `KW.fensterMat`, `KW.flut`, `KW.licht` |
| Licht | `hemi`, `mondLicht`, `key`, `rim` | `licht()` aus `folge.js` setzt Key/Rim passend zur Kamera |
| `kegel(farbe, stärke, länge, radius)` | sichtbarer Lichtkegel | `.userData.richte(von, nach)` |
| `suchkegel[0..3]` | Suchscheinwerfer in den Himmel | sichtbar setzen und richten |
| `grade` | Farbe, Vignette, Blitz | `uFlash`, `uWarm`, `uVig` |

## Figuren (`figuren.js`)

`figur({haut, hemd, hose, haare, frisur, helm, weste, muetze, abzeichen, brille, kapuze, schal, skala, schuhe})`
- Frisuren: kurz, zopf, dutt, strubbel, glatze.
- Neu (23.11.): `jacke` (offene Jacke über dem Hemd, z. B. Lehrer), `brust` (Zeichen oder Emoji auf der Brust, `brustFarbe`).
- Neu (23.11.): **Gesicht auf der runden Kopfform**: Augen, Mund, Brauen und Wangen liegen direkt auf dem gerundeten Kopf, ohne eckige Gesichtsfläche (Standard; alte Darstellung mit `flachesGesicht: true`). Prüfbilder: `gesicht-seite`, `gesicht-schraeg`.
- Neu (23.11.): **`struktur: true`** gibt Kleidung ein Strickmuster und Haaren Strähnen. Für alle neuen Folgen benutzen; ohne die Option bleibt das alte glatte Aussehen (Folge 1).

`pose(f, {lauf, renn, phase, sitz, liegen, armL, armR, armLz, armRz, kopfNeig, kopfDreh, ges, huepf, atmen, neig})`
- Gesichter: froh, lachen, reden, schreien, angst, idee, ernst, schlaf, **staunen** (O-Mund, hohe Brauen), **traurig**.
- `mund(t)` gibt abwechselnd reden und froh zurück.
- `handPos(f, rechts, y, z)` und `kopfPos(f)`.

Feste Personen aus Folge 1 (gleich lassen, Werte in `folge-01/szene.html`):

| Person | Aussehen |
|---|---|
| ich | gelb-orangener Kapuzenpulli, strubbelig, skala 0.78 |
| Papa | Warnweste, gelber Helm, skala 1.1 |
| Oma | Dutt, Brille, Schal |
| Polizist | dunkelblau, Mütze, Abzeichen |
| 3 Leute | rot (Zopf), grün, lila |

## Wesen und Effekte (`wesen.js`)

| Name | Was | Steuerung |
|---|---|---|
| Schatten (60 Stück) | schwarze Würfel-Wolke, Ranken, weiße Augen, lila Rand | `schatten(i, x, z, ry, {g, kriech, aufl, augen, y})` und `ring(n, r0, r1, t, {...})` aus `folge.js`. `aufl` 0…1 heißt: zerfällt golden |
| Himmelslaternen (4200) | leuchtende Papierlaternen | `laternenAnlegen([...{x, y, z, t0, v, wx, wz, ph, s, sichtbarAb, hand}])` |
| Funken | Explosion oder Trafo | `funkenAnlegen(ursprung, t0, n, kraft)` |
| Goldstaub | beim Zerfallen | `staubAnlegen(x, y, z, t0, n, r)` |

## Requisiten und Kulissen (`requisiten.js`)

| Name | Was / Ort | Steuerung |
|---|---|---|
| Polizei | 10 Autos mit Blaulicht und Scheinwerferkegeln | `polizeiSetzen(t, an, sichtbar, radius, kameraPos)`. Kreis um den Platz, Blaulicht-Punktlicht am nächsten Auto |
| Notlampen | 8 Stative mit Akku-Anzeige | `notlampenSetzen(stärke \| (i) => 0/1, sichtbar, radius)`, `akkuZeichnen("9:58", anteil)` |
| Platz | Obelisk-Denkmal mit Sockel (Papa kann oben stehen: y 2.8), 16 Bäume im Ring r = 52 | – |
| Gasse | Ziegelwände, Feuertreppen, Container, Müllsäcke, Türlampe; Eingang an der Straße x = −72, z ≈ 96 | `GASSE.lampe`/`lampeAn`/`lampeAus`, `GASSE.licht` |
| `muell` | Mülleimer, kann verschwinden | – |
| Laden „LATERNEN“ | Omas Laden; Front bei x ≈ 79, z ≈ −30, schaut zum Platz | `LADEN.schild` |
| Lager (Innenraum) | Regale, Kartons, hängende Laternen; liegt bei (1400, 0, −600) | – |
| Schlafzimmer | liegt bei (700, 24, 700), gedreht π/4. Bett, Nachttisch, Lampe, Wecker, Fenster zur Stadt, Poster, Regal | `ZIMMER.schirm`/`schirmAn`/`schirmAus`, `ZIMMER.licht`, `weckerZeichnen("02:00", an)`. Lokale Koordinaten mit `V(...).applyMatrix4(zimmer.matrixWorld)` umrechnen |
| Menge (150 Personen) | billige Instanzen auf dem Platz, Arme oben/unten | `Z_.menge = {armeHoch, huepf, licht, dz}` in `folge.js`. Wer im Weg steht, bleibt automatisch die ganze Einstellung weg. Hand: `mengeHand(p, hoch)` |
| Konfetti | – | `konfettiSetzen(t, an)` |
| Taschenlampe + Kegel, Megafon, Kisten | Handrequisiten | an `handPos` setzen |
| `freiraeumen(x0, x1, z0, z1)` | Häuser entfernen (Platz für eigene Kulissen) | – |

## Objekte (`objekte.js`, neu 23.11.)

Jede Funktion baut ein Objekt (`THREE.Group`, noch nicht in der Szene): `const b = O.baum({art: "rund"}); b.position.set(x, 0, z); scene.add(b);`. Alles mit festem Zufall, also flackerfrei. Neue Objekte in `ALLE` eintragen, dann erscheinen sie automatisch im Fotostudio.

| Gruppe | Objekte (wichtigste Optionen) |
|---|---|
| Natur | `baum({art: rund/nadel/kegel/busch, groesse, krone, saat})`, `blumenkuebel`, `hecke({laenge})` |
| Straße | `bank`, `laterne({hoehe, an})`, `ampel({phase: rot/gelb/gruen})`, `hydrant`, `muelltonne`, `briefkasten`, `schild({text, farbe, form})`, `zaun({laenge})`, `brunnen` (`userData.strahl`), `laden({name, wand, markise, breite})`, `haltestelle` |
| Fahrzeuge | `fahrrad`, `bus({farbe, text})` |
| Tiere | `hund`, `katze`, `vogel` (`userData.schwanz` bzw. `fluegelL/R` zum Bewegen) |
| Riesen-Wesen | `riesenTier({fell, bauch, groesse, dichte})`: flauschiger Riese mit hängendem Fell, etwa 18 m hoch; `userData.augen` zum Blinzeln. Eigenes Wesen, kein Mammut |
| Möbel und Kram | `tisch`, `stuhl`, `sofa`, `stehlampe`, `regal`, `geschenk`, `fernseher` (`userData.schirm`) |

Fertige Straßenzüge (`alltag.js`): **`einkaufsstrasse({x: 24, z0: 70, z1: 330})`** setzt an alle Häuser einer Nord-Süd-Straße Ladenfronten mit Markisen (Bäckerei, Eis, Blumen …) und Gehweg-Deko (Bäume, Bänke, Hydranten, Briefkästen). Die Straße ist zuerst unsichtbar, `.visible = true` pro Einstellung setzen.

## Alltag, Bildschirme, Text in der Welt (`alltag.js`, neu 23.11.)

Aus dem Vorbild-Video übernommen (nur die Mittel, nie Inhalte). Beispiel für alles: `probe-alltag/szene.js`.

| Name | Was | Steuerung |
|---|---|---|
| `handy` + `HANDY` | Handy mit **echtem Bildschirm**. Er zeigt eine zweite Kamera (`HANDY.cam`) irgendwo in der Welt, im selben Look wie das Hauptbild | `handyHalten(f, Fg.handPos, Fg.kopfPos, {rechts, zu})`, `handyBlick(pos, ziel, fov)` |
| Seite statt Welt | Shop, Nachricht, Fehlermeldung, Preis … auf dem Handy | `handySeite((x, w, h) => {…}, "schlüssel")`, zurück: `handyWelt()` |
| **Flug ins Handy** | Kamera fliegt in den Bildschirm. Danach `kamera.imHandy()`, damit der Schnitt unsichtbar ist. Hand, Arm und Kopf davor verschwinden von selbst | `kamera.insHandy(q, startPos, fov)`; Handy dafür **zur Kamera drehen** (`zu: startPos`) |
| `videowand` | Großbildschirm 9×16 m (Platz, Hauswand), zeigt dasselbe wie das Handy | `.visible`, `.position`, `.rotation.y`, `.scale` |
| Fernseher | in Omas Stube, zeigt das Handy-Bild | `fernseherAn()` / `fernseherAus()` |
| `leinwand(w, h, {leuchtet})` | Text oder Zeichnung in der Welt (Schild, Plakat, Zettel, Bildschirm) | `schreibe(m, ["ZEILE"], {bg, fg, font, anteil, kreide})`: mit `anteil` 0…1 wird der Text Buchstabe für Buchstabe geschrieben |
| `KLASSE` | Klassenzimmer bei (−1400, 0, 600): Tafel (`KLASSE.tafel`), Lehrerpult mit Apfel, 3×3 Tische (`KLASSE.plaetze`), Uhr, Fenster | Kamera innen, Rückwand bei lokal z = −7 |
| `KUECHE` | Küche bei (−1400, 0, −600): Tisch mit Müslischale (`KUECHE.schale`), Saft, Stühle, Kühlschrank, Theke | Tisch bei lokal (0, 0, 0.5) |
| `STUBE` | Omas Wohnzimmer bei (1400, 0, 600): Sofa (Oma sitzt: `sitz: 1`, y −0.05), Sessel, Couchtisch mit Tee und Kuchen, Stehlampe, Bücherregal, Bilder, Fernseher | – |
| `raumlicht(R)` | ein Licht für den Raum, in dem gerade gefilmt wird | pro Einstellung aufrufen, Lichtstärke dazu `licht(0.6, …)` |
| `regenbogen`, `ballonsSetzen(t, an, {x, z, t0})` | Feier-Effekte | – |

## Gerüst (`folge.js`) – nie neu schreiben

| Name | Was |
|---|---|
| `laden()` | Zeitplan `F.Z`, `F.E`, `F.wz(wort, zeile)`, `F.leer(i)`, `F.DAUER` |
| `sh(bis, (t, q) => {...})` | Einstellung bis Zeit `bis`; q läuft von 0 bis 1 |
| `blick(pos, ziel)` | Kamera ohne Wackeln |
| `licht(stärke, farbe, rimStärke, rimFarbe)` | Licht passend zur Kamera |
| Kamerafahrten | `kamera.luft(...)`, `kamera.fahrt(...)`, `kamera.vorFigur(q, f, ...)`, `kamera.bodennah(...)`, `kamera.insHandy(q, von)`, `kamera.imHandy()` |
| `start({grund, frage: {zeile, text, karten: [[B, Emoji, Text, Stichwort]]}, haltePos, nach})` | Grundzustand, Untertitel, Mitmach-Karten, Nahebene gegen Flackern, Menge ohne Aufploppen |

## Ton (`tonbib.py`)

`Ton(plan).musik([Stimmung je Zeile])`
- Stimmungen: staunen, geheimnis, spannung, grusel, action, aufbau, triumph, froh, traurig, stille.

Geräusche:
- `boom`, `zisch`, `klick`, `piep`, `sirene`, `knurren`, `brumm`, `sweep`, `rausch`;
- `glitzer(t0, d)`, `jubel(t0, d)`, `voegel(t0, d)`, `schritte(t0, d)`, `uhr(t0, d)`;
- `kartenToene(zeile_frage, stichwörter)`.

Danach `mischen(stimme, ziel)`: Musik wird unter der Stimme leiser.

## Stimme

`folge-01/stimme4.py` als Vorlage: Gemini „Puck“, Abschnitte zu 3 Zeilen, bis zu 3 Versuche, Auswahl nach Tonhöhe (200 Hz) und Melodie, ohne Radio-Kette, wärmer abgemischt. Das Kontingent liegt bei etwa 10 Anfragen pro Schlüssel und Tag; es gibt 5 Schlüssel.
