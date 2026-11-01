---
name: serien-analytics
description: TikTok-, Instagram- und YouTube-Zahlen der Serien auswerten (Hook, Zuschauerbindung, Ausreißer, Serien-Durchhalten, Postingzeiten) und daraus Vorgaben für die nächsten Folgen ableiten. Nutzen bei Fragen wie „was lief gut?“, „warum so wenig Views?“ und in der Aufgabe „Analyse vor der Staffel“.
---

# Serien-Analytics

Der verbindliche Ablauf steht in `taeglich/ANALYSE.md` (Branch `taeglich`). Dieser Skill ergänzt ihn um die Kennzahlen, die dort fehlen, und gibt eine kurze Reihenfolge vor. Feste Regeln (Issues `dringlich`, `FORMAT.md`) gehen vor: Eine Analyse führt nie zu Videos unter 1 Minute, Fragen ans Publikum oder „Fortsetzung folgt“.

## Daten holen (in dieser Reihenfolge, sparsam)

1. **Zernio (kostenlos, eigene Zahlen):** Workflow „Posts einplanen“ mit `analyse=true` starten → `posten/analyse.json` auf `main` (Ablauf in ANALYSE.md). TikTok liefert dort schon **Retention-Kurve, Abschlussrate, Ø Wiedergabezeit, Quellen („Für dich“, Profil, Suche) und neue vs. wiederkehrende Zuschauer**. Instagram: Ø Wiedergabezeit, Skip-Rate. YouTube: nur Grundzahlen.
2. **vidIQ (Credits knapp, 150/Monat):** nur für YouTube-Bindung und Ausreißer der Nische; immer erst `vidiq_balance`, 10 Credits Reserve. `vidiq_watch_shortform_content` (10 Credits) höchstens für 1 fremdes Top-Video pro Lauf, um dessen Hook zu verstehen.
3. **Apify TikTok-Scraper (nur bei Bedarf, Gratis-Guthaben 5 $/Monat):** fremde Konten der Nische, nur Zahlen pro Video speichern, keine Kommentare oder Nutzerdaten.

## Auswerten

```
python taeglich/analyse_auswerten.py                         # Grundtabellen: Aufrufe/h, Gruppen, Top/Flop
python3 .claude/skills/serien-analytics/kennzahlen.py        # Hook, Bindung, Faktor, Serien-Durchhalten
```

`kennzahlen.py` rechnet:
- **Hook 3 s:** Anteil, der nach 3 Sekunden noch zuschaut (TikTok-Retention-Kurve). Wichtigste Stellschraube – hier geht bei uns der größte Teil verloren.
- **Bindung bei 25/50/75 %** der Länge und **Ø Wiedergabe** in s und % → zeigt, ob die Mitte durchhängt.
- **Faktor** = Aufrufe / Median derselben Plattform: ≥ 2 Ausreißer, < 0,5 Flop (nur ähnlich alte Posts vergleichen).
- **Für dich-Anteil, neue Zuschauer, Follows und Shares pro 1.000 Aufrufe.**
- **Serien-Durchhalten:** Aufrufe Teil n+1 / Teil n – fällt es stark ab, trägt die Geschichte nicht über die Folgen.

Für jeden Ausreißer und Flop: das Drehbuch öffnen und den **ersten Satz (Hook)**, Thema, Stimmung, Kulissen, Länge und Uhrzeit vergleichen. Erst ab ca. 10 Posts pro Gruppe von einer Regel sprechen, vorher „Tendenz“.

## Ergebnis

Wie in ANALYSE.md: Bericht `taeglich/analyse/JJJJ-MM-TT.md`, Vorgaben `taeglich/analyse/aktuell.md` (Mehr davon / Weniger davon / genau 1 Experiment / Themenvorschläge), Verlauf `taeglich/kennzahlen.json`. Zusätzlich in den Bericht:
- Median-Hook je Plattform und Entwicklung zum letzten Bericht,
- die 3 Stellen, an denen die Retention-Kurve am stärksten fällt (Sekunde + was dort im Video passiert),
- Serien-Durchhalten der aktuellen Serie.

Keine fremden Benchmark-Zahlen ohne Quelle nennen – Maßstab ist der eigene Median. Auf Deutsch, kurz, mit konkreten Vorschlägen für die nächsten Drehbücher.
