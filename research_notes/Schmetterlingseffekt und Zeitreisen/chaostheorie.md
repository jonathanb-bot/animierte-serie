# Schmetterlingseffekt in der Chaostheorie (Wissenschaft)

Zweck: Fakten für ein 60–90-s-Erklärvideo auf Deutsch. Wichtigste Primär- und Fachquellen:
- Motter & Campbell, „Chaos at Fifty“, Physics Today 66(5), Mai 2013, enthält Lorenz' eigenen Bericht aus „The Essence of Chaos“, S. 134 — [arXiv:1306.5777](https://arxiv.org/abs/1306.5777)
- Hilborn, „Sea gulls, butterflies, and grasshoppers: A brief history of the butterfly effect in nonlinear dynamics“, Am. J. Phys. 72(4), 425 (2004), DOI 10.1119/1.1636492 — [PDF](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Zhang et al., „What Is the Predictability Limit of Midlatitude Weather?“, J. Atmos. Sci. 76(4), 1077–1091 (2019), DOI 10.1175/JAS-D-18-0269.1 — [PDF](https://adapt.psu.edu/ZHANG/papers/Zhangetal2019JAS.pdf)

Hinweis: eaps4.mit.edu (Lorenz' Originaltext von 1972) war in dieser Sitzung nicht erreichbar (Netzwerkfreigabe fehlt). Die Zitate aus dem Vortrag stammen deshalb aus Hilborn 2004 und Sekundärquellen.

## 1. Was ist 1961 bei Edward Lorenz passiert?

### Takeaway
Im Winter 1961 startete der MIT-Meteorologe Edward Lorenz eine Wettersimulation (12 Variablen, Computer Royal McBee LGP-30) mitten im Lauf neu und tippte dafür Werte ab, die der Drucker auf 3 Nachkommastellen gerundet hatte. Nach etwa einer Stunde (Kaffeepause), also rund zwei simulierten Monaten Wetter, hatte das neue Wetter nichts mehr mit dem alten zu tun. Der Unterschied verdoppelte sich etwa alle 4 simulierten Tage.

### Cited Findings
- Lorenz hatte gerade seinen ersten Computer gekauft, eine **Royal McBee LGP-30** mit 4096 Speicherwörtern zu je 32 Bit. Er ließ darauf ein **vereinfachtes Wettermodell mit 12 Variablen** laufen. Laut den Autoren war der Rechner 1000-mal schneller als sein Tischrechner, aber eine Million Mal langsamer als ein heutiger Laptop (Stand 2013). — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Für die Wiederholung druckte er die Variablen nach jedem simulierten Tag aus und **rundete sie auf die dritte Nachkommastelle**. Gerechnet wurde intern genauer. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Lorenz' eigene Worte (aus „The Essence of Chaos“, 1993, S. 134): „I stopped the computer, typed in a line of numbers that it had printed out a while earlier, and set it running again. I went down the hall for a cup of coffee and returned after about an hour, during which time the computer had simulated about two months of weather. The numbers being printed were nothing like the old ones.“ — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Zuerst hatte er eine defekte Elektronenröhre im Verdacht. Dann sah er, dass die neuen Werte die alten zunächst wiederholten, dann in der letzten Stelle abwichen, dann in der vorletzten usw.: „**the differences more or less steadily doubled in size every four days or so, until all resemblance with the original output disappeared somewhere in the second month**.“ Die Ursache waren die gerundeten Startwerte. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Die konkrete Zahl: Er rundete **0,506127 auf 0,506** und änderte damit das Muster aus zwei Monaten simulierten Wetters drastisch. Die Kaffeepause ist ebenfalls belegt. — [MIT Technology Review, „When the Butterfly Effect Took Flight“, 22.02.2011](https://www.technologyreview.com/2011/02/22/196987/when-the-butterfly-effect-took-flight/)
- Datierung: Die MIT Technology Review spricht 2011 von „a winter day 50 years ago“, also Winter 1961. — [MIT Technology Review 2011](https://www.technologyreview.com/2011/02/22/196987/when-the-butterfly-effect-took-flight/)
- Lorenz stellte das 12-Variablen-Modell schon **1960 auf einem Symposium in Tokio** vor und erwähnte den Rundungseffekt dort nur kurz. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Lebensdaten: geboren 1917 in West Hartford (Connecticut), gestorben am **16. April 2008** mit 90 Jahren in Cambridge (Massachusetts). Er kam 1955 an die MIT-Fakultät. Lorenz folgerte, dass Wetter über **zwei bis drei Wochen** hinaus grundsätzlich unvorhersagbar sein könnte. Das Kyoto-Preis-Komitee nannte die Entdeckung des „deterministischen Chaos“ seine kühnste Leistung. — [MIT News, Nachruf 2008](https://news.mit.edu/2008/obit-lorenz-0416); [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Zum Computer: Die LGP-30 kam 1956 auf den Markt (Listenpreis 47.000 US-Dollar). Gebaut wurde sie von Librascope, vertrieben über ein Gemeinschaftsunternehmen mit der Royal-McBee-Sparte der Royal Typewriter Company. — [Wikipedia LGP-30](https://en.wikipedia.org/wiki/LGP-30)

### Inferences
- Die Rundung änderte den Startwert um 0,000127, also um etwa **0,025 %** bzw. rund 1:4000 (selbst nachgerechnet: 0,000127 / 0,506127).
- Bei einer Verdopplung alle 4 Tage wächst ein Fehler in 60 Tagen um 2^15 ≈ 33.000-fach (selbst nachgerechnet). Das passt dazu, dass ein Fehler in der 4. Nachkommastelle „irgendwann im zweiten Monat“ die ganze Größe erreicht.
- Vorschlag für das Video: „Eine Stunde Kaffee = zwei Monate Computer-Wetter“ ist ein starkes und belegtes Bild.

### Gaps / Unsicheres
- Die Zahl **0,506127 → 0,506** stammt aus James Gleicks „Chaos“ (1987) und populären Nacherzählungen wie der MIT Technology Review. In Lorenz' eigenem Bericht steht nur „rounded off to the third decimal place“. Die Zahl ist plausibel und weit verbreitet, aber nicht aus Lorenz' eigenem Text belegt. Im Video lieber „rund 0,506127 statt 0,506“ sagen oder als Beispiel kennzeichnen.
- Ein genaues Tagesdatum gibt es nicht, nur „Winter 1961“.
- Ein Blog nennt Ellen Fetter als Person, die das Programm bediente. Das ist nicht unabhängig bestätigt, deshalb nicht verwenden.
- Im Kaffee-Detail sind sich die Quellen einig (Lorenz selbst: „cup of coffee“). Es ist also keine reine Ausschmückung.

## 2. Woher kommt der Begriff? (Möwe → Schmetterling, Merilees, Lorenz-Attraktor)

### Takeaway
Zuerst sprach Lorenz von einer **Möwe** (1963). Der **Schmetterling** kam 1972 durch den Vortragstitel „Predictability: Does the Flap of a Butterfly's Wings in Brazil Set Off a Tornado in Texas?“ beim 139. AAAS-Treffen in Washington (29.12.1972). Den Titel erfand der Sitzungsleiter **Philip Merilees**, weil Lorenz keinen geliefert hatte. Dass die Lorenz-Kurve wie ein Schmetterling aussieht, hat den Namen historisch **nicht** ausgelöst.

### Cited Findings
- Möwen-Metapher, Lorenz 1963 („The predictability of hydrodynamic flow“, Trans. N.Y. Acad. Sci. 25, S. 409–432): „One meteorologist remarked that if the theory were correct, **one flap of a sea gull's wings would be enough to alter the course of the weather forever**. The controversy has not yet been settled, but the most recent evidence seems to favor the gulls.“ — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Der Schmetterling taucht erstmals im Titel des Vortrags beim **139. AAAS-Treffen im Dezember 1972** auf. — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf); Datum **29. Dezember 1972, Washington, D.C.** laut [Wikipedia „Butterfly effect“](https://en.wikipedia.org/wiki/Butterfly_effect) und [todayinsci](https://todayinsci.com/QuotationsCategories/B_Cat/ButterflyEffect-Quotations.htm)
- Merilees (damals für UCAR/GARP tätig und Organisator der AAAS-Sitzung) schrieb in einem Brief: Man habe auffällige Titel gebraucht. Er kannte die Möwe, „but I thought the butterfly might be more appealing. In addition, I tried for some alliteration; **butterfly—Brazil, tornado—Texas**. I suppose sea gull in Senegal might have worked as well.“ Lorenz war im Herbst 1972 im Ausland. — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Douglas Lilly (NCAR) meinte sich zu erinnern, dass eigentlich er den Schmetterling vorgeschlagen habe. Die genaue Urheberschaft bleibt also leicht offen. — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Ein früherer Schmetterling: Joseph Smagorinsky schrieb 1969 (Bull. Am. Meteor. Soc. 50, S. 289): „would the flutter of a butterfly's wings ultimately amplify…“ — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Noch früher, 1898, der „Heuschrecken-Effekt“: W. S. Franklin schrieb, „the flight of a grasshopper in Montana may turn a storm aside from Philadelphia to New York!“ — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Laut Hilborn hat Lorenz selbst den Ausdruck „butterfly effect“ (in seinen frühen Schriften) nie benutzt. Der Begriff erscheint bei Schuster (1984) und in Gleicks „Chaos“ (1987). — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Die schmetterlingsförmige Grafik: Im Paper von 1963 zeigte Lorenz nur Z-gegen-Y- und X-gegen-Y-Plots, die kaum wie ein Schmetterling aussehen. Der Vortrag von 1972 hatte keine Abbildungen, und Z gegen X wurde wohl erst nach Mitte der 1970er geplottet. Der Zusammenhang Attraktorform → Name ist historisch also falsch. — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Das Paper „**Deterministic Nonperiodic Flow**“ erschien im **März 1963** im Journal of the Atmospheric Sciences. Es enthält ein System aus **3 nichtlinearen Differentialgleichungen** (Lorenz-Gleichungen, ein Konvektionsmodell). Die Bahnen laufen auf einem begrenzten, fraktalen „seltsamen Attraktor“ und wiederholen sich nie. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777); [MIT Technology Review 2011](https://www.technologyreview.com/2011/02/22/196987/when-the-butterfly-effect-took-flight/)
- Das Paper blieb zunächst unbeachtet: **12 Jahre nach Erscheinen hatte es weniger als 20 Zitierungen**. Bekannt wurde es erst durch Li & Yorke, „Period three implies chaos“ (1975), die dem Feld den Namen „Chaos“ gaben. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Bradburys Kurzgeschichte „A Sound of Thunder“ (1952) handelt von einem zertretenen Schmetterling bei einer Zeitreise. Lorenz kannte sie laut eigener Aussage nicht, bevor Hilborn ihn darauf hinwies. — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf) (relevant für den Zeitreise-Teil)

### Inferences
- Für das Video: „Eigentlich müsste er ‚Möwen-Effekt‘ heißen“ ist ein belegter Überraschungsmoment. Ebenso, dass der Titel aus Not entstand: Lorenz hatte keinen geliefert.
- Die Standardparameter der Lorenz-Gleichungen (σ = 10, ρ = 28, β = 8/3) sind Lehrbuchwissen, wurden hier aber nicht eigens nachgeprüft.

### Gaps
- Lorenz' Originaltext von 1972 (eaps4.mit.edu) war nicht erreichbar, die Zitate kommen über Hilborn.
- Eine Quelle (hotnews.ro) schreibt den Titel allgemein dem AAAS-Organisator zu. Das passt zu Merilees und ist kein echter Widerspruch.

## 3. Mechanismus: sensible Abhängigkeit, exponentielles Auseinanderlaufen, Fehlerverdopplung, Grenze der Wettervorhersage

### Takeaway
In chaotischen Systemen wächst der Abstand zweier fast gleicher Startzustände **exponentiell**: Er verdoppelt sich in festen Zeitabständen. In Wettermodellen liegt die Verdopplungszeit kleiner Fehler bei etwa 1,5–2,5 Tagen (großräumig), bei kleinen Skalen wie Gewittern bei Stunden. Heute sind Wettervorhersagen etwa **10 Tage** brauchbar (vor 30 Jahren 7 Tage). Die **naturgegebene Grenze** liegt bei etwa **2 Wochen** (Zhang et al. 2019). Selbst perfekte Modelle und 10-mal genauere Messungen bringen höchstens etwa 5 Tage mehr.

### Cited Findings
- Sensible Abhängigkeit von den Anfangsbedingungen („sensitive dependence on initial conditions“, deutsch: *sensitive Abhängigkeit von den Anfangsbedingungen*) ist das Kennzeichen von Chaos: „The distance between any two nearby trajectories grows exponentially with time.“ — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Chaos ist trotzdem **deterministisch**: Anders als beim Würfeln steht im Modell jeder nächste Zustand fest. Chaotische Systeme wirken nur zufällig. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Im 12-Variablen-Modell verdoppelte sich der Fehler etwa **alle 4 Tage**. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Echte Wettermodelle: Lorenz (1982) bestimmte mit ECMWF-Vorhersagen (Winter 1980/81) eine **Verdopplungszeit kleiner Fehler von etwa 2,5 Tagen**. Frühere Schätzungen: Charney et al. 1966 etwa 5 Tage, Smagorinsky 1969 etwa 3 Tage. Dalcher & Kalnay (1987) kamen mit verfeinerter Methode auf **etwa 1,7 Tage** (Nordhalbkugel, Winter). — [ECMWF Tech. Memo 2001, „Some aspects of the improvement in skill of numerical weather prediction“](https://www.ecmwf.int/sites/default/files/elibrary/2001/12238-some-aspects-improvement-skill-numerical-weather-prediction.pdf) (über Suchauszug, nicht vollständig gelesen)
- Lorenz (1969): Bei kleineren Skalen wird die Verdopplungszeit kürzer. Fehler wandern von kleinen zu großen Skalen und setzen so eine eingebaute Vorhersagegrenze. — [Zhang et al. 2019](https://adapt.psu.edu/ZHANG/papers/Zhangetal2019JAS.pdf)
- Zhang et al. 2019 rechneten mit dem ECMWF-Modell (9 km Auflösung) und dem US-Modell NGGPS (3 km). „Currently, a skillful forecast lead time of midlatitude instantaneous weather is **around 10 days**, which serves as the practical predictability limit. Reducing the current-day initial-condition uncertainty by an order of magnitude extends the deterministic forecast lead times … **by up to 5 days**“, bei kleinräumigen Erscheinungen wie Gewittern deutlich weniger. — [Zhang et al. 2019](https://adapt.psu.edu/ZHANG/papers/Zhangetal2019JAS.pdf)
- Historischer Vergleich: Brauchbare Vorhersagen (ACC 60 %) reichten beim ECMWF bis etwa **10 Tage**, **vor 30 Jahren waren es 7 Tage**. — [Zhang et al. 2019](https://adapt.psu.edu/ZHANG/papers/Zhangetal2019JAS.pdf)
- Grenze nach Größe der Wetterstrukturen: Fehler sättigen (die intrinsische Grenze liegt) bei **unter 3 Tagen für Strukturen unter 200 km**, unter 5 Tagen für Strukturen unter 400 km und unter 10 Tagen für Strukturen unter 1000 km. — [Zhang et al. 2019](https://adapt.psu.edu/ZHANG/papers/Zhangetal2019JAS.pdf)
- Fuqing Zhang (Penn State): „We believe we have found that limit and on average, that it's **about two weeks**.“ Kerry Emanuel (MIT) nennt das „remarkably close to Lorenz's estimate“. Fünf Tage im Voraus sei Wetter heute „with high confidence“ vorhersagbar. — [ScienceDaily, 15.04.2019](https://sciencedaily.com/releases/2019/04/190415154722.htm)
- Es gab Widerspruch: Žagar & Szunyogh kommentierten das Paper, die Autoren antworteten 2020 in JAS 77(2). — [MIT DSpace](https://dspace.mit.edu/handle/1721.1/124726) (über Suchauszug)

### Inferences
- **Lyapunov-Exponent** (deutsch: *Ljapunow-Exponent*) heißt die Wachstumsrate λ dieses exponentiellen Auseinanderlaufens (Fehler ∝ e^(λt)). Die **Lyapunov-Zeit** 1/λ ist die typische Vorhersagezeit. Die Verdopplungszeit beträgt ln 2 / λ. Das ist Standarddefinition, hier aber ohne eigene Quelle.
- Faustrechnung für das Video: Eine Verdopplung alle ~2 Tage bedeutet in 2 Wochen 7 Verdopplungen, also das 128-Fache. Ein 10-mal kleinerer Messfehler bringt nur log2(10) ≈ 3,3 Verdopplungen, also rund 5–7 Tage mehr. Das passt zu „bis zu 5 Tage“ bei Zhang (selbst nachgerechnet, vereinfacht, weil Fehlerwachstum je nach Skala verschieden ist).
- Das ist der Kern: **10-mal genauer messen bringt nicht 10-mal längere Vorhersagen, sondern nur ein paar Tage.**

### Gaps
- Eine aktuelle Verdopplungszeit für heutige Modelle als einzelne Zahl fehlt. ECMWF berichtet nur, dass die Verdopplungszeiten an Tag 1–2 mit feinerer Auflösung kürzer geworden sind.
- Für den Lyapunov-Exponenten wurde keine eigene Fachquelle geholt (etwa Britannica oder Spektrum).

## 4. Deterministisch, aber unvorhersagbar: anschauliche Beispiele (Doppelpendel, Billard, Poincaré)

### Takeaway
Schon Henri Poincaré bemerkte um 1890 beim **Dreikörperproblem**, dass kleine Unterschiede am Anfang zu sehr großen am Ende führen können: „Prediction becomes impossible.“ Das bekannteste Zahlenbeispiel ist Michael Berrys Billard-Rechnung (1978): nach ~9 Stößen zählt die Schwerkraft eines Menschen neben dem Tisch, nach ~56 Stößen ein einziges Elektron am Rand des Universums. Die genauen Zahlen und ob es um Billardkugeln oder Gasmoleküle geht, sind in Sekundärquellen allerdings verwaschen.

### Cited Findings
- Poincaré (Ende der 1880er, Dreikörperproblem): „it may happen that small differences in the initial conditions produce very great ones in the final phenomena. … Prediction becomes impossible.“ (Science and Method, 1914 engl.) Er weigerte sich, die komplizierte Bahnstruktur zu zeichnen („which I do not even attempt to illustrate“). Solche frühen Funde galten lange als „Monstergalerie“. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Lorenz kannte Poincarés Arbeit wahrscheinlich nicht, als er anfing. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Berry, „Regular and Irregular Motion“ (1978), bekannt gemacht durch Taleb („Der Schwarze Schwan“): Für den **9. Stoß** muss man die Schwerkraft einer Person neben dem Tisch berücksichtigen, für den **56. Stoß** jedes Elementarteilchen im Universum, auch ein Elektron in 10 Mrd. Lichtjahren Entfernung. — [Gizmodo, „The physical limit of trick shots in billiards“](https://gizmodo.com/the-physical-limit-of-trick-shots-in-billiards-1532036405); [facts.museum](https://facts.museum/out3488) (beides Sekundärquellen über Suchauszug). Gizmodo spricht stattdessen von „60 Kollisionen mit anderen Molekülen“, andere Quellen von 6–7 Stößen für die Person.

### Inferences
- Nach meiner Erinnerung bezieht sich Berrys Elektron-Rechnung im Original auf **Gasmoleküle** (Sauerstoffmoleküle in Luft), nicht auf Billardkugeln. Erst Taleb hat beides zu „Billard“ zusammengezogen. Das ist **nicht geprüft**, deshalb im Video vorsichtig formulieren, etwa „Physiker Michael Berry hat ausgerechnet …“, und auf die Formulierung „Billardkugel nach 56 Stößen“ als exakte Tatsache verzichten oder sie mit „etwa“ abschwächen.
- Doppelpendel: Ein klassisches Beispiel für deterministisches Chaos (zwei aneinanderhängende Pendel, winzige Startunterschiede führen nach Sekunden zu völlig anderen Bahnen). Das ist Lehrbuchwissen, hier aber ohne eigene Quelle. Visuell gut für Animation geeignet.

### Gaps
- Berrys Originalarbeit von 1978 war nicht abrufbar (Server der TU Warschau nicht erreichbar), die Zahlen 9/56 sind nur sekundär belegt.
- Keine Fachquelle zum Doppelpendel abgerufen.

## 5. Grenzen und Missverständnisse

### Takeaway
Lorenz hat **nicht** behauptet, dass ein Schmetterling einen Tornado verursacht. Seine Frage war, ob die Atmosphäre gegenüber winzigen Störungen instabil ist. Er betonte: Wenn ein Flügelschlag einen Tornado auslösen kann, kann er ihn genauso gut verhindern. Energie wird dabei nicht übertragen. Die Störung verändert nur, wann und wo etwas passiert. Und nicht jedes System ist chaotisch.

### Cited Findings
- Lorenz 1972: „The question which really interests us is whether … two particular weather situations differing by as little as the immediate influence of a single butterfly will generally after sufficient time evolve into two situations differing by as much as the presence of a tornado. In more technical language, is the behavior of the atmosphere unstable with respect to perturbations of small amplitude?“ — [Hilborn 2004](https://math.vu.nl/~eliens/serious/local/complex/butterfly.pdf)
- Lorenz 1972 (wiedergegeben in „The Essence of Chaos“, Anhang 1): „If the flap of a butterfly's wings can be instrumental in generating a tornado, it can equally well be instrumental in preventing a tornado.“ — [todayinsci (Zitatsammlung)](https://todayinsci.com/QuotationsCategories/T_Cat/Tornado-Quotations.htm); [Wikipedia „Butterfly effect“](https://en.wikipedia.org/wiki/Butterfly_effect) (Wortlaut nicht am Buch geprüft)
- Numerische Rundungsfehler machen Simulationen trotzdem nicht wertlos („Shadowing“): Es gibt immer einen nahen Startwert, dessen exakte Bahn die berechnete eine Zeit lang begleitet. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Chaotische Attraktoren entstehen typischerweise, wenn ein **gedämpftes** System regelmäßig Energie nachgeliefert bekommt (wie ein Kind auf der Schaukel). Beim Lorenz-System kommt sie aus Wärme, die Dämpfung aus der Zähigkeit der Flüssigkeit. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Vor Chaos galt die Annahme, dass klassische Systeme sich auf einen festen Zustand, eine periodische Bahn oder eine quasi-periodische Bahn einpendeln. — [Motter & Campbell 2013](https://arxiv.org/abs/1306.5777)
- Für kleine Strukturen ist die Grenze viel kürzer als für große (Gewitter: weniger als 3 Tage). — [Zhang et al. 2019](https://adapt.psu.edu/ZHANG/papers/Zhangetal2019JAS.pdf)

### Inferences
- Ein gedämpftes, nicht angetriebenes System, etwa ein Pendel mit Reibung, landet unabhängig von kleinen Störungen im selben Ruhezustand und „vergisst“ sie. Der Schmetterlingseffekt braucht Nichtlinearität und Instabilität. Das ist physikalischer Standard, hier ohne eigene Quelle.
- Für das Video: Der Schmetterling ist keine Ursache im Sinne von „Kraft“, eher ein Weichensteller. Er liefert keine Energie für den Tornado, die Energie steckt schon im Wetter. Die zweite Satzhälfte ist eine Inferenz.
- Klima ist nicht dasselbe wie Wetter. Statistische Aussagen (Mittelwerte) bleiben vorhersagbar, nur der genaue Tagesablauf nicht. Plausibel, aber hier nicht eigens belegt.

### Gaps
- Keine deutschsprachige Quelle (Spektrum.de, Britannica) abgerufen. Deutsche Fachbegriffe stammen aus allgemeinem Sprachgebrauch: *Schmetterlingseffekt*, *deterministisches Chaos*, *sensitive Abhängigkeit von den Anfangsbedingungen*, *Lorenz-Attraktor*, *seltsamer Attraktor*, *Ljapunow-Exponent*, *Dreikörperproblem*, *Vorhersagbarkeitsgrenze*.
