# Zwischenstand 2.11.2026, 20:49 (auf Jonathans Wunsch)

Quelle: Zernio (`posten/analyse.json`, 59 Posts, 0 Fehler), `analyse_auswerten.py`, `kennzahlen.py`. Kurzvideo-Staffeln laufen erst ab 5.11., hier stecken nur „24. Stock“ und „Der Alien“ drin. Alles **Tendenzen**.

## Konten (30 Tage)
| | Follower | Zahlen |
|---|---|---|
| TikTok | 61 (+10) | 1.197 Likes, 15 Videos, Median 883 Aufrufe pro Video |
| Instagram | 6 | 21.905 Aufrufe, 11.035 erreichte Konten |
| YouTube | 36 (+13) | 5.877 Aufrufe, 2.177 Minuten Wiedergabe |

## Was gut ankommt
1. **Mittelteile, die direkt in der Handlung starten**: Instagram 5- bis 8-mal so viele Aufrufe wie der Median (insta-01-3 2.337, insta-02-4 2.195), YouTube 2- bis 4-mal (yt-02-2 2.374, yt-01-2 2.292). Erste und letzte Teile floppen (0,1–0,2).
2. **„Der Alien“ hat den besten Hook auf TikTok**: 67–73 % schauen nach 3 s noch (24. Stock 47–59 %). Rätsel-Einstieg ohne Vorwissen wirkt.
3. **Uhrzeiten**: Instagram 00, 08, 12 Uhr stark (33–45 Aufrufe/h), 16 und 20 Uhr schwach (6–9). YouTube 04:30–12:30 stark (20–37/h), 16:30–00:30 fast tot (1,2–1,4/h, je 2–3 Posts). TikTok 08 Uhr vor 20 Uhr.
4. YouTube bringt die meisten neuen Abos (+13).

## Was schwach ist
1. **Lange TikTok-Teile verlieren fast alle**: Bei den 7-Minuten-Teilen von „Der Alien“ schauen nach einem Viertel nur noch 3–9 % zu, Ø 17–35 s. Die Aufrufe fallen von Teil zu Teil (883 → 821 → 752 → 549).
2. **Geschaut wird überall nur 20–30 s** (Instagram Ø 9–24 s = 19–49 % der Länge). Die ersten 20 s entscheiden.
3. **Instagram bringt keine Follower** (6 bei 21.900 Aufrufen). Die neuen Texte bitten seit s01 ums Folgen.
4. Neue Instagram-Kurzteile von „24. Stock“ ab Folge 7 sind schwächer (9–14 s, 19–27 %), aber noch jünger als 24 h.

## Folgerungen (umgesetzt in FORMAT.md → Format-Rotation, Issue #13)
- **Abwechslung bei der Länge**, auch 1–2 Minuten und höchstens 90 s: kurz 60–70 s, mittel 70–80 s, lang 80–90 s, XL 90–120 s, gemischt. Gemessen wird über `videodaten.py` und den Format-Vergleich.
- **TikTok-Test mit einzelnen Folgen** (1–2 min) statt 7-Minuten-Sammelteilen: s02, s04, s06.
- Weiter: stärkstes Bild und Rätsel in den ersten 3 s, Wendung bis Sekunde 20–30.
