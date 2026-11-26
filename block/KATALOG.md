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
| **Bilderbuch-Tag** (24.11.) | kräftig blauer Himmel mit weichen Wolken, pastellbunte Hochhäuser, hellblauer Dunst | zusätzlich zu `U.uTag.value = 1` auch `U.uWolken.value = 1` (wird pro Bild auf 0 zurückgesetzt; ohne bleibt der alte Taglook) |

## Figuren (`figuren.js`)

`figur({haut, hemd, hose, haare, frisur, helm, weste, muetze, abzeichen, brille, kapuze, schal, skala, schuhe})`
- Frisuren: kurz, zopf, dutt, strubbel, glatze.
- Neu (23.11.): `jacke` (offene Jacke über dem Hemd, z. B. Lehrer), `brust` (Zeichen oder Emoji auf der Brust, `brustFarbe`).
- Neu (23.11.): **Gesicht auf der runden Kopfform**: Augen, Mund, Brauen und Wangen liegen direkt auf dem gerundeten Kopf, ohne eckige Gesichtsfläche (Standard; alte Darstellung mit `flachesGesicht: true`). Prüfbilder: `gesicht-seite`, `gesicht-schraeg`.
- Neu (24.11.): **`baby: true`** (großer Kopf; mit `skala: 0.45`).
- Neu (24.11.): **`zylinder`** (Zylinderhut, `zylinderBand`), **`goldkette`** (für reiche Figuren).
- Neu (24.11.): **`kragen`** (breiter Halskragen mit Goldpunkten; `true` oder Farbe), **`krone`** (goldene Krone mit Steinen).
- Neu (24.11.): **`propeller`** (Propellermütze; `true` oder 4 Farben; drehen mit `f.userData.propeller.rotation.y = t * 12`), **`sonnenbrille`**, **`muster: {hemd, hose}`** mit `streifen`, `karo` oder `punkte` (z. B. Schlafanzug).
- Neu (23.11.): **`struktur: true`** gibt Kleidung ein Strickmuster und Haaren Strähnen. Für alle neuen Folgen benutzen; ohne die Option bleibt das alte glatte Aussehen (Folge 1).

`pose(f, {lauf, renn, phase, sitz, liegen, armL, armR, armLz, armRz, kopfNeig, kopfDreh, ges, huepf, atmen, neig})`
- Gesichter: froh, lachen, reden, schreien, angst, idee, ernst, schlaf, **staunen** (O-Mund, hohe Brauen), **traurig**, **weinen** (Tränen), **schwitzen** (Schweißtropfen, Zickzack-Mund), **kneifen** (>_<), **muede** (halb geschlossene Augen, Augenringe).
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
| Möbel und Kram | `tisch`, `stuhl`, `sofa`, `stehlampe`, `regal`, `geschenk`, `fernseher` (`userData.schirm`), `lichterkette({laenge, n, durchhang})` |
| Wüste und Tempel (24.11.) | `lehmhaus({farbe, band})`, `wimpelkette({laenge, durchhang})`, `fackel({hoehe})` (`userData.flamme` sanft wiegen, nie flackern), `krug`, `palme({hoehe})`, `pyramide({groesse})`, `glocke`, `thron`, `krone`, `sockel`, `steinwaechter({ohren})` |
| Riesen-Wächter (24.11.) | `riesenWaechter({stein, gold, augen, groesse})`: schlankes Steinwesen, etwa 22 m groß, mit Goldbändern, Kopfkamm, leuchtenden Augen und Stab (`userData.kopf`). Eigenes Wesen, keine Gottheit |
| Reich, arm, Himmel (24.11.) | `wolke({groesse})` (3D-Wolke aus Kugeln), `himmelshaus({hoehe})` (Glasturm mit Villa, Pool und Palmen oben, `userData.oben`), `bretterbude`, `muellberg`, `leiter` (eine Sprosse fehlt), `pool`, `glasaufzug` (`userData.kabine`), `absperrung` (rote Kordel), `goldvilla` (Diamantfenster, Kuppel), `goldschluessel`, `tellerhaus` (Turmspitze im All) |
| Schule, Sport, Krankenhaus (24.11.) | `spind({farbe, n})` (Reihe), `tribuene({breite, reihen})`, `krankenwagen`, `krankenbett`, `herzmonitor` (`userData.zeichne(t)` lässt die Herzlinie laufen), `babybett` |
| Freizeit und Feiern (24.11.) | `achterbahn({laenge, hoehe})` (Wagen fahren: `userData.setze(u)` mit u 0…1), `torte({text, stufen})` (`userData.schrift(text)`), `kinderwagen` |
| Frühstück (24.11., Folge 2) | `broetchen({teller, farbe})` (Brötchen auf Teller; `userData.broetchen` einzeln ausblenden) |
| Glück und Pech (24.11.) | `gluehbirnenladen({name, wand})` (Lotto, Kino, Spielhalle mit Glühbirnen-Rahmen), `limousine`, `liegestuhl` |
| Kleinstadt (23.11. abends) | `reihenhaus({wand, stock, breite, tiefe, laden, markise, tuer, dach: flach/giebel})` (Fassade als Textur, sehr wenige Meshes), `glasturm({breite, hoehe, farbe})` |
| Gebäude und Autos (24.11.) | `haus({wand, dach, tuer, breite, tiefe, stock, licht})` (Einfamilienhaus mit Satteldach), `schule({name, banner})` (Backstein, Säulen-Eingang, Schild), `sportwagen({farbe})`; `laterne({punktlicht: false})` ohne eigene Lichtquelle für viele Laternen |

Fertige Kulissen (`alltag.js`, 24.11.):
- **`BUNTDORF`** bei (0, 0, 2800), neu 23.11. abends (Jonathan: „ein Dorf mit bunten Häusern wie in den Vorbild-Videos“): Hauptstraße entlang z mit gelber Mittellinie, beidseitig pastellbunte Reihenhäuser (`O.reihenhaus`, 2–4 Stockwerke, Läden mit Markisen, Balkone), Querstraße bei z = 0, Dorfplatz mit Brunnen, Bäumen und Bänken (`BUNTDORF.platz`, Menge dort mit `Z_.menge = {…, dx: platz.x, dz: platz.z}`), geparkte Autos, Laternen, Bushaltestelle, Skyline aus Pastell-Glastürmen (`O.glasturm`). `BUNTDORF.pos(x, y, z)`. Tag: `uTag = 1` + `uWolken = 1`, Abend zusätzlich `uAbend = 1`. Probe: `probe-dorf/szene.js`. Der Himmel folgt seit 23.11. der Kamera (`folge.js`), deshalb ist er auch in weit entfernten Kulissen nicht mehr schwarz.
- **`VORSTADT`** bei (−1400, 0, 1800): Straße mit Einfamilienhäusern, Vorgärten, Zäunen, Bäumen, Briefkästen, Laternen und Bushaltestelle. `VORSTADT.nacht(true)` macht Licht in den Fenstern; `VORSTADT.pos(x, y, z)` gibt lokale Koordinaten (Straße entlang z, Häuser bei x ±23).
- **`AULA`** bei (1400, 0, 1800): Halle mit Bühne, Pult, Banner (`schreibe(AULA.banner, [...])`), Uhr (`AULA.uhr`), 600 Sitzen und sitzenden Kindern. `AULA.kinder(anteil, huepf, t)`: 1 = voll, 0 = leer; `raumlicht(AULA, 30)`.
- **Geld:** `geldSetzen(t, an, {x, y, z, t0, kraft, n})` lässt Geldscheine hochfliegen und herabflattern. Zähler im Bild über das Gerüst: `Z_.zaehler = {wert, farbe: "gruen"|"rot"}`, `Z_.plus = {text: "+5 €", t0}`, Helfer `B.zaehlen(t, t0, t1, von, bis)` und `B.euro(n)`. Der Zähler steht oben mittig, nie oben links.
- **Kinderzimmer:** `ZIMMER.lichterkette.visible = true` (Lichterketten unter der Decke).
- **`WUESTE`** bei (−1800, 0, −1000): Gasse mit Lehmhäusern, Wimpelketten, Fackeln, Krügen, Palmen, Glockenturm (`WUESTE.glocke`) und Pyramiden. Pro Bild `WUESTE.flammen(t)`.
- **`THRONSAAL`** bei (1800, 0, −1400): Säulenhalle mit goldenem Licht (`raumlicht(THRONSAAL, 70)`), leuchtenden Wandzeichen (`wandLicht(0…1)`), Reihen knieender Steinwächter (`THRONSAAL.waechter`), Thron, Krone auf Sockel (`THRONSAAL.krone`), Banner und Fackeln (`flammen(t)`).
- **`HIMMELSSTADT`** bei (0, 0, −2000): Armenviertel am Boden (Bretterbuden, Müllberge, Leiter zum hohen Gehweg), ringsum Glastürme mit Villen bis über die Wolken, 3D-Wolkendecke (y ≈ 100–170). Am besten mit Bilderbuch-Tag (`uTag` und `uWolken`).
- **`WELTALL`** bei (2000, 0, 600): Sternenkugel, Erde unten, Mond, drei Turmspitzen mit Teller-Häusern. `WELTALL.an(true)` schaltet das Sonnenlicht dort an.
- **`SCHULFLUR`** bei (−600, 0, 1800): langer Gang mit grünen Spinden links und rechts, Tür am Ende.
- **`TURNHALLE`** bei (600, 0, −1800): Hallenboden mit Linien und Mittelkreis, Tribüne, Basketballkörbe.
- **`KRANKENHAUS`** bei (−600, 0, −1800): Zimmer mit Bett (`KRANKENHAUS.bett`), Herzmonitor (`KRANKENHAUS.monitor`), Fenster mit Vorhang, Wartestühle.
- **Zahl/Text über dem Kopf:** `kopfzahl(figurOderPosition, "12.000", {farbe, groesse})` pro Bild aufrufen. Sie schaut immer zur Kamera und wird pro Bild zurückgesetzt. Für die ganze Menge: `B.mengeZahlen((i) => "1")`.
- **Wisch-Übergang:** `Wt.grade.uniforms.uWisch.value = B.wisch(t, schnittZeit)` verwischt das Bild kurz waagerecht am Schnitt, ohne Wackeln.
- **Gewitterhimmel:** mit Bilderbuch-Tag zusätzlich `U.uGewitter.value = 0…1`. Dunkle Wolken ziehen auf, der Himmel wird grau.
- **Wetter-Effekte:** `regenwolke(t, an, {x, y, z, breite})` (eigene Regenwolke über einer Figur, mit Tropfen und Pfütze), `blitz(an, von, nach)` (Zickzack-Blitz, ohne Bildschirmblitz), `rauch(t, an, {x, y, z, t0, staerke})` (aufsteigender Rauch, z. B. aus einem Motor).
- **Abendrot:** mit Bilderbuch-Tag zusätzlich `U.uAbend.value = 1` (orange-violetter Himmel, rosa Wolken).
- `schreibe()` verkleinert lange Texte automatisch, damit sie in die Fläche passen.

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

## Horrorfiguren (`horror.js`, 24.11., Issue #43)

52 fertige Skins bekannter Horrorfiguren (The Nun, Siren Head, Slender Man, Michael Myers, Pennywise, Huggy Wuggy, FNAF …): `horror("id")`. Liste mit ids und Merkmalen: `vorlagen/horrorfiguren.md`. Menschliche Figuren sind Fg-Figuren (Fg.pose wirkt), dazu `userData.waffe`, Slender Man `userData.tentakel`, Siren Head `userData.sirenen`.

## Horror-Kulissen (`horrorwelt.js`, 24.11., Issue #43)

- **`SCHATTENTAL`** bei (−2400, 0, −2400): Dorfstraße bei Nacht mit dunklen Häusern (`haeuser`), Laternen (`laternen`), Kapelle mit zugemauertem Glockenturm (`kapelle`, `glocke` schwingen über `.rotation.z`), Friedhof, toter Wald, roter Mond, Nebel, viel stilisiertes Blut (Lachen, Spuren, Handabdrücke, „HILFE“, „13“). `SCHATTENTAL.pos(x, y, z)`, `SCHATTENTAL.licht` (rötliches Punktlicht).
- **`KAPELLE`** bei (−2400, 0, −3000): Innenraum mit Bänken, Altar, Kerzen, Kreuz mit Blutspritzer, Glockenseil (`seil`), „LÄUTE“ in Blut. `KAPELLE.licht`.
- **`WALDWEG`** bei (−2900, 0, −2400): Pfad durch toten Wald mit Blutspur, roter Mond, Nebel.
- **`blut(art, groesse, saat)`**: Decal `spritzer`, `lache`, `hand`, `tropfen`, `spur`, `schrift:TEXT` (Wand: XY-Ebene, Boden: `rotation.x = −π/2`). **`nacht()`**: Horror-Licht pro Bild.
- Vorschau: `node katalog_bilder.cjs kulisse-schattental-strasse,kulisse-schattental-kapelle,kulisse-schattental-friedhof,kulisse-kapelle-innen,kulisse-waldweg`.

## Marken-Logos (`logos.js`, 24.11., Issue #42)

`LOGO.nasa(x, w, h)`, `LOGO.lieferando(x, w, h, {hintergrund, schrift})` zeichnen das Logo in einen Canvas (z. B. `leinwand.userData.zeichne`, `handySeite`). `logoTextur(name)` und `logoAufkleber(name, breite, hoehe)` für Raketen, Boxen, Schilder. Neue Marken hier ergänzen, möglichst detailgetreu.

Neue Objekte (25.11., Folge 3): `werkstattwagen({farbe, text, groesse})` (Papas oranger Kraftwerks-Wagen mit Rundumleuchte `userData.leuchte` und Schriftzug an den Seiten), `schranke({laenge, text})` (Schranke mit Pförtnerhäuschen; öffnen über `userData.arm.rotation.z` 0 … 1.4, Lampe `userData.lampe`).

Neue Objekte (24.11. abends): `rakete({hoehe, farbe, akzent})` (`userData.flamme`), `startrampe`, `grill` (`userData.feuer`, `deckel`), `trampolin` (`userData.matte`), `roller({farbe, box})`, `flugzeug`, `koffer`, `sternglas({n, brett, etikett, sprung})` (`userData.setze(n)`, `oben()`), `stern`, `besen`; Figuren-Option `schuhLoch`.

## Gerüst (`folge.js`) – nie neu schreiben

| Name | Was |
|---|---|
| `laden()` | Zeitplan `F.Z`, `F.E`, `F.wz(wort, zeile)`, `F.leer(i)`, `F.DAUER` |
| `sh(bis, (t, q) => {...})` | Einstellung bis Zeit `bis`; q läuft von 0 bis 1 |
| `blick(pos, ziel)` | Kamera ohne Wackeln |
| `licht(stärke, farbe, rimStärke, rimFarbe)` | Licht passend zur Kamera |
| Kamerafahrten | `kamera.luft(...)`, `kamera.fahrt(...)`, `kamera.vorFigur(q, f, ...)`, `kamera.bodennah(...)`, `kamera.insHandy(q, von)`, `kamera.imHandy()` |
| `Z_.mengeZahl = {text: (i) => "3", farbe}` | Zahl über jedem sichtbaren Kopf der Menge (ausgeblendete Leute ohne Zahl) |
| `start({grund, frage: {zeile, text, karten: [[B, Emoji, Text, Stichwort]]}, haltePos, nach})` | Grundzustand, Untertitel, Mitmach-Karten, Nahebene gegen Flackern, Menge ohne Aufploppen |

**Rendern:** `./rendern.sh <ordner> [plan] [frames]` (3 Teile parallel), `WEITER=1` setzt nach Abbruch fort.

**Liegen:** `pose(f, {liegen: 1})` legt die Figur von den Füßen aus nach hinten (lokal −z), Gesicht nach oben. Die Position sind also die Füße. Beispiele: Sofa und Liegestuhl in `vorrat-02/szene.js`.

## Ton (`tonbib.py`)

`Ton(plan).musik([Stimmung je Zeile])`
- Stimmungen: staunen, geheimnis, spannung, grusel, action, aufbau, triumph, froh, traurig, stille.

Geräusche:
- `boom`, `zisch`, `klick`, `piep`, `sirene`, `knurren`, `brumm`, `sweep`, `rausch`;
- `glitzer(t0, d)`, `jubel(t0, d)`, `voegel(t0, d)`, `schritte(t0, d)`, `uhr(t0, d)`;
- `kartenToene(zeile_frage, stichwörter)`.

Danach `mischen()`: Der Hintergrund (Musik + Geräusche) wird automatisch so gepegelt, dass die Stimme **12 LU lauter** ist (wie im Vorbild, Jonathan 23.11.). In Sprechpausen kommt die Musik bis zu 6 dB hoch, Geräusch-Spitzen bleiben unter der Stimme. Die Ausgabe nennt den Abstand. `musik_laut=` nur noch für Folge 1.

## Stimme

`stimme.py` (seit 23.11. abends, für alle neuen Folgen): `erzeugen(zeilen, ordner, gruppe=4)` mit Gemini „Puck“ und fröhlicher Storytime-Anweisung, bis zu 3 Versuche je Abschnitt, Auswahl nach Tonhöhe (200 Hz) und Sprachmelodie (Ziel > 17 Halbtöne, Vorbild ~20), kurze Pausen. Dann `zusammen(ordner, extra)` und `zusammen(ordner, extra, yt=True, ohne=[…])`. Liegt die volle Fassung unter 89 s, reicht sie auch für YouTube. Kommt ein Abschnitt zu tief, wird er **nicht** angehoben (Issue #41: Stimme nie bearbeiten), sondern höchstens neu angefragt. Das Kontingent liegt bei etwa 10 Anfragen pro Schlüssel und Tag; es gibt 5 Schlüssel.

Neu (26.11., Folge 4):
- **Schatten leuchten golden:** `schatten(i, x, z, ry, {…, gold: 0…1})` – glückliche Schatten glühen gold (Farbe > 1 → Leuchten im Shader), dazu am besten ein goldenes Punktlicht.
- **`O.kuehlschrank({farbe, voll})`**: Kühlschrank mit Tür, `userData.setze(0 zu … 1 offen)`, Innenlicht, Fächer (`userData.faecher`). In der `KUECHE` vorher `KUECHE.kuehl.forEach(m => m.visible = false)` und an lokal (4.6, 0, −4.3) stellen.
- **`O.helm({farbe})`**: Bauhelm zum In-der-Hand-Halten (umgedreht: `rotation.x = Math.PI`).
- **`werkstattwagen({kasten, schrift})`**: Kasten- und Schriftfarbe, z. B. schwarzer „SCHATTENFÄNGER“ mit neongrüner Schrift.
- **`Al.leuchtfassade(lot, {farbe, ab})`**: goldene Fenster auf allen Seiten eines Hauses aus `LOTS`, `userData.setze(0…1)` lässt sie nacheinander aufleuchten (ganzes Haus „wie eine Laterne“).
- Einzeln ausblendbar: `STUBE.kuchen`, `STUBE.teller`, `ZIMMER.weckerG` + `ZIMMER.anzeige`.
- Konfetti im Innenraum: `Rq.konfettiW.position.copy(Raum-Mitte); Rq.konfettiW.scale.set(0.42, 0.3, 0.42)` (im `grund` zurücksetzen).
