# Der Alien

Zweite, eigenständige Serie im Projekt. Gleiches Format und gleicher Stil wie „24. Stock“ (siehe README im Hauptordner), aber eine eigene Welt mit eigenen Figuren.

- `serienbibel.md`: Weltregeln, Kontinuität, Anzeige, Figurenblätter, Staffelplan, Faktenquellen, NEU ZU BAUEN. Sie ist verbindlich.
- `storylines/folge-XX.md`: ausführliche Storylines (Kapitel, Einstellungen, Check, Fakten-Check, Dauer)
- `episoden/folge-XX.txt`: die Drehbücher → `node render.mjs der-alien/episoden/folge-01.txt` (Ausgabe `ausgabe/der-alien-folge-01.mp4`)
- `figuren.json`: die Figuren dieser Serie (du, du_shirt, mara, falschemara, elias, mantel, nox, sammler)
- `audio/folge-XX/NNN.mp3`: Stimme pro Einstellung (wie bei „24. Stock“)
- `dauer.mjs`: schätzt die Dauer einer Storyline und teilt sie in Teile von höchstens 1 Minute

Die Grafik steckt in `engine/alien.js`. „24. Stock“ bleibt davon unverändert.

## Kopf eines Drehbuchs

```
# Folge 1: Im Badezimmer
@serie Der Alien
@mund zitate                       ← Mund bewegt sich nur bei Wörtern in „…“
@zeit nacht
@hud tag=1 zeit=23:17 handy=34/100% netz=4/4 funk=nicht_verbunden
```

Anzeige: `netz=0/4` zeigt „KEIN NETZ“, `funk=nicht_verbunden` zeigt Text statt Balken, `handy=36/100%+` zeigt das Ladesymbol.

## Neue Kulissen

| Typ | Zeigt | Angaben |
|---|---|---|
| `badezimmer` | Bad mit offenem Fenster, Plastikpflanze, Waschbecken, Wäschekorb, Wanne | `nox=korb/wanne/waschbecken/fliesen/fenster`, `zahnbuerste=station/boden/weg`, `zahnpasta=nox`, `fenster=zu`, `handtuch=false`, `licht=an`, `tuerlicht`, `regen`, `nox_s` |
| `tuer` | Wohnungstür von innen, Türspion, Kette, Garderobe, Klingel | `klingel`, `kette`, `spalt`, `draussen=mantel`, `ausdruck_draussen`, `taschenlampe`, `augenleuchten`, `flurlicht=aus`, `licht=an` |
| `spion` | Blick durch den Türspion (Fischauge) | erste Figur steht draußen, `nah`, `flurlicht=an`, `augenleuchten` |
| `flur` | Treppenhausflur 17. Stock, deine Tür links, Maras rechts | `links=zu/spalt/offen`, `rechts=zu/offen`, `augen_spalt`, `klopfen=links/rechts`, `licht=an` |
| `treppe` | Treppe hinauf zum Absatz | `etage=22`, `erdgeschoss`, `keller`, `oben=mantel`, `ausdruck_oben`, `pose_oben`, `licht=an` |
| `kreuzung` | Straße bei Nacht, Zebrastreifen, Ampel, Laternen | `ampel=rot/gruen`, `gegenueber=mantel`, `gx=230`, `zebra=mantel`, `eingang` (Ahornstraße 12), `garage`, `auto`, `alarm`, `taschenlampe`, `fenster_an`, `ausdruck_fern` |
| `fassade` | Außenwand am Badfenster | `regen`, `rutscht`, `hand`, `nox=false`, `nox_x`, `nox_y`, `nox_s` |
| `tiefblick` | aus dem Badfenster 17 Stockwerke nach unten | `leer`, `schaut_hoch`, `flimmern`, `regen` |
| `kueche` | Küche, Herd mit Uhr, Fenster zum Hof, Tisch | `uhr=04:10`, `dampf`, `tisch=false`, `tassen=2`, `kaffeedose`, `licht=an` |
| `lichtbild` | Hologramm über der Kapsel | `inhalt=gesichter/liste/gesicht/orte/eingang/countdown/tonwelle/silhouette`, `zeige=nox@2,elias@9,du@27`, `markiere=elias`, `neu=du`, `scroll`, `countdown=10`, `gesicht=elias`, `label=Elias`, `unscharf`, `mit=elias`, `ueberlagern`, `kapsel=aus`, `ort` |
| `handy` | Hand mit Handy | `ort`, `netz=4 netz_bis=0`, `akku`, `uhrzeit`, `nachricht="…"`, `von=Elias`, `wer=du` |

Erweitert:
- `dach`: `dachtuer` / `dachtuer=offen`, `beete`, `schiff=sammler/rettung/beide/kommt`, `schiff_x/_y/_s`, `rettung_x/_y/_s`, `suchkegel` (oder x), `blaukegel` (oder x), `silhouetten`, `hinter_tank=du,nox`, `tank_pos=330:480`, `deckung=false`, `notruf`, `impuls`, `strahl`, `countdown=40`, `wind`
- `skyline`: `schiff=sammler/tuer/rettung/beide`; Erinnerungen mit `tint=#2a4a8a tint_staerke=0.35`
- `hochhaus`: `treppe=mantel@16,nox@24`, `pose_treppe`
- `wohnung`: `hof` (Fenster zum Innenhof), `kraeuter`, `sofa=#farbe`, `wand=#farbe`
- `gesicht nox …`: eigene Nahaufnahme von Nox

## Für alle Szenen

- `leuchten` / `leuchten=0.6`: Nox' Angstleuchten
- `augenleuchten` / `augenleuchten=blitz`: grünes Augenleuchten der Tarnung (dauerhaft oder kurz nach ca. 1 s)
- `stoerung=0.3…1`: Tarnung flackert, ab 0.5 mit wahrer Gestalt
- `haelt=nox:kapsel,mara:sporttasche`, `pos=300,700`, `skala_figur=1.2`, `spiegeln=nox`
- Nox-Posen: `steht sitzt duckt klettert rutscht haelt haelt_hoch fuchtelt verschraenkt umarmt springt zeigt_haende winkt zeigt zeigt_hoch haende_hoch angst psst denkt geht rennt`
- Nox-Ausdrücke: `neutral neugierig froh traurig angst schreck stur muede entschlossen besorgt misstrauisch wuetend angewidert`
- Menschen neu: Pose `sitzt`, Mantel und Schal (`mantel`), Augenleuchten (`falschemara`, `mantel`)
- Neue Icons: `zahnbuerste zahnbuerste_station zahnpasta waeschekorb walkie walkie_blau handy handy_netz0 handy_licht handy_karte kapsel kapsel_aus kette plastikpflanze kraeuter tasse kaffeedose deckenlager kiste foehn sporttasche sporttasche_leuchtet gecko gecko_nass schallwand lautsprecher mikrofon kopfschall gesichtraster kamera hund ohrkurve katzenauge menschenauge lichtweg gehirn herzpuls erstarrt satellit hausblock tuerversuch einsvonzwei linse pfeil zettel`
