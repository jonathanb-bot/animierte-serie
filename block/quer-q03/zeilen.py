# q03 „In meiner Stadt darf jeder nur 100 Wörter am Tag sagen“ (Querformat lang im 3D-Stil, 27.11.)
# Regel: 100 Wörter pro Tag (Zahl über dem Kopf, Schreiben zählt mit), bei null stumm bis Mitternacht; Hunde zählen nicht;
# Wörter kann man per Handschlag weitergeben. Ich verplappere mich morgens bis auf 3 Wörter. Oma verrät: Papa (Stimme der
# Stadtnachrichten, 96 Wörter) hebt jeden Tag 3 Wörter für mich auf und sagt sie um 23:59 an meinem Bett. Ich will wach bleiben
# und antworten – brauche aber 2 Wörter, um Mia vor dem Bus zu retten. Um 23:59: „Hab dich lieb.“ – mein letztes Wort: „Auch.“
Z = [
    ("In meiner Stadt darf jeder nur hundert Wörter am Tag sagen.", "staunen"),                                           # 0
    ("Über jedem Kopf schwebt eine Zahl. Und mit jedem Wort wird sie kleiner.", "geheimnis"),                             # 1
    ("Bei null bist du stumm. Bis Mitternacht. Egal, was passiert.", "spannung"),                                         # 2
    ("Und heute hatte ich schon um acht Uhr morgens nur noch drei Wörter übrig.", "spannung"),                            # 3
    ("Drei Wörter für den ganzen Tag. Und mit genau diesen drei habe ich das Wichtigste gesagt, was ich je gesagt habe.", "geheimnis"),  # 4
    ("Aber von vorn.", "froh"),                                                                                           # 5
    # == 6:00 Uhr ==
    ("Sechs Uhr. Mein Wecker klingelt, und über meinem Kopf leuchtet eine Hundert.", "froh"),                             # 6
    ("In der Küche sitzt mein Papa und sagt nur ein einziges Wort: Kaffee.", "froh"),                                     # 7
    ("Neunundneunzig. Mehr sagt mein Papa morgens nie.", "froh"),                                                         # 8
    ("Meine Mama spricht fast nur mit den Händen. Daumen hoch heißt: Guten Morgen, mein Schatz.", "froh"),                # 9
    ("Zeigefinger zum Fenster heißt: Zieh dir eine Jacke an, draußen ist es kalt.", "froh"),                              # 10
    ("Schreiben bringt übrigens nichts. Jedes geschriebene Wort zählt auch.", "geheimnis"),                               # 11
    ("Nur einer in unserer Familie redet, so viel er will. Unser Hund Bello.", "froh"),                                   # 12
    ("Hunde zählen nicht. Bello bellt den ganzen Tag, und wir sind alle ein bisschen neidisch.", "froh"),                 # 13
    ("Meine kleine Schwester Mia ist vier und hat das mit den Wörtern noch nicht verstanden.", "froh"),                   # 14
    ("Warum? Warum? Warum? Um sieben Uhr ist sie schon bei null.", "froh"),                                               # 15
    ("Dann sitzt sie da und guckt ihre Null ganz beleidigt an.", "froh"),                                                 # 16
    ("Ich habe nur Morgen, Papa gesagt. Achtundneunzig. Alles nach Plan.", "froh"),                                       # 17
    # == 7:30 Uhr ==
    ("Halb acht, Bushaltestelle. Da wartet schon mein bester Freund Ben.", "froh"),                                       # 18
    ("Ben hat eine Regel: Vor der Schule sagt er kein einziges Wort.", "froh"),                                           # 19
    ("Aber heute hat er mir einfach sein Handy vor die Nase gehalten.", "aufbau"),                                        # 20
    ("Das neue Minecraft-Update. Mit einem riesigen Drachen.", "staunen"),                                                # 21
    ("Und ich habe angefangen zu reden. Und zu reden. Und zu reden.", "action"),                                          # 22
    ("Über den Drachen, über die neuen Höhlen und über alles, was ich als Erstes bauen würde.", "action"),                # 23
    ("Ben hat immer wilder mit den Armen gewedelt. Ich dachte, er freut sich mit mir.", "froh"),                          # 24
    ("Dann hat er auf meinen Kopf gezeigt.", "spannung"),                                                                 # 25
    ("Drei. Über meinem Kopf stand eine Drei.", "spannung"),                                                              # 26
    ("Es war sieben Uhr vierzig. Und ich hatte noch drei Wörter für den ganzen Tag.", "traurig"),                         # 27
    ("Ben hat mir auf die Schulter geklopft. Das heißt bei uns: Das wird hart.", "traurig"),                              # 28
    # == 8:00 Uhr ==
    ("Acht Uhr. Erste Stunde bei Herrn Krause.", "froh"),                                                                 # 29
    ("Herr Krause ist Lehrer. Lehrer bekommen für den Unterricht zweihundert Wörter am Tag.", "staunen"),                 # 30
    ("Das hat der Bürgermeister so bestimmt, und Herr Krause ist sehr stolz darauf.", "froh"),                            # 31
    ("Heute hat er uns erzählt, woher die Regel eigentlich kommt.", "geheimnis"),                                         # 32
    ("Vor fünfzig Jahren war unsere Stadt die lauteste Stadt der Welt.", "staunen"),                                      # 33
    ("Alle haben gleichzeitig geredet, gehupt und gestritten. Keiner hat mehr zugehört.", "action"),                      # 34
    ("Da hat der Bürgermeister gesagt: Ab morgen hat jeder nur noch hundert Wörter.", "spannung"),                        # 35
    ("Seitdem ist es so ruhig, dass man die Vögel hört. Sogar mitten in der Stadt.", "staunen"),                          # 36
    ("Dann hat Herr Krause gelächelt und gesagt: Und jetzt ein mündlicher Test.", "spannung"),                            # 37
    ("Mündlich. Mit drei Wörtern.", "spannung"),                                                                          # 38
    ("Erste Frage an mich: Wie heißt der berühmte Turm in Paris?", "spannung"),                                           # 39
    ("Ich hätte Eiffelturm sagen können. Ein Wort. Dann hätte ich nur noch zwei.", "aufbau"),                             # 40
    ("Also bin ich aufgestanden und habe den Eiffelturm gemacht. Mit meinem ganzen Körper.", "froh"),                     # 41
    ("Die Arme hoch, die Beine auseinander, und ganz oben habe ich mit den Fingern geblinkt.", "froh"),                   # 42
    ("Die ganze Klasse hat gelacht. Ohne ein Wort, aber man hat es trotzdem gehört.", "froh"),                            # 43
    ("Und Herr Krause hat an die Tafel geschrieben: Eins plus.", "triumph"),                                              # 44
    ("Das hat ihn zwei Wörter gekostet. Aber die hat er gern ausgegeben.", "froh"),                                       # 45
    # == 12:00 Uhr ==
    ("Zwölf Uhr, große Pause. Auf unserem Schulhof gibt es einen Wörtermarkt.", "staunen"),                               # 46
    ("Ein Kaugummi kostet fünf Wörter. Ein Pokémon-Sticker kostet zehn.", "froh"),                                        # 47
    ("Man gibt sich die Hand, und die Wörter wandern einfach rüber.", "staunen"),                                         # 48
    ("Ben hat mir seinen ganzen Kaugummi angeboten. Aber ich habe den Kopf geschüttelt.", "traurig"),                     # 49
    ("Wörter verkauft man nicht. Das sagt meine Oma immer.", "traurig"),                                                  # 50
    ("Dann ab in die Mensa. Es gab Pizza oder Brokkoli.", "froh"),                                                        # 51
    ("Ich habe auf die Pizza gezeigt. Die Frau an der Ausgabe hat aber Brokkoli verstanden.", "froh"),                    # 52
    ("Ein riesiger Berg Brokkoli. Und ich konnte nicht mal Nein sagen.", "froh"),                                         # 53
    ("Ben hat so gelacht, dass er fast vom Stuhl gefallen ist.", "froh"),                                                 # 54
    ("Und ich habe die ganze Zeit an meine drei Wörter gedacht. Wofür hebe ich sie auf?", "geheimnis"),                   # 55
    # == 15:00 Uhr ==
    ("Drei Uhr. Nach der Schule gehe ich immer zu meiner Oma.", "froh"),                                                  # 56
    ("Oma hat eine Teekanne, einen Kuchen und das gemütlichste Sofa der Stadt.", "froh"),                                 # 57
    ("Ich habe mich hingesetzt und ihr ein Bild gemalt. Von meinem Papa.", "traurig"),                                    # 58
    ("Papa sitzt darauf vor dem Fernseher und sagt nichts. So wie jeden Abend.", "traurig"),                              # 59
    ("Oma hat lange auf das Bild geguckt. Dann hat sie ihre Wörter benutzt.", "geheimnis"),                               # 60
    ("Sie hat gesagt: Dein Papa redet abends nicht, weil er keine Wörter mehr hat.", "geheimnis"),                        # 61
    ("Er ist die Stimme der Stadtnachrichten. Jeden Abend um sechs im Fernsehen.", "staunen"),                            # 62
    ("Dafür braucht er sechsundneunzig Wörter. Jeden einzelnen Tag.", "staunen"),                                         # 63
    ("Sechsundneunzig und einmal Kaffee. Ich habe nachgerechnet. Dann bleiben ihm drei.", "geheimnis"),                   # 64
    ("Oma hat gelächelt und gesagt: Und die hebt er jeden Tag für dich auf.", "geheimnis"),                               # 65
    ("Jede Nacht um eine Minute vor zwölf geht er in dein Zimmer. Da schläfst du schon längst.", "geheimnis"),            # 66
    ("Und dann sagt er sie. Jede Nacht. Seit du auf der Welt bist.", "traurig"),                                          # 67
    ("Ich wollte fragen, welche drei Wörter. Aber ich habe es mir gerade noch verkniffen.", "froh"),                      # 68
    ("Oma hat mir zugezwinkert und gesagt: Das musst du schon selbst herausfinden.", "geheimnis"),                        # 69
    ("Ab da hatte ich einen Plan.", "aufbau"),                                                                            # 70
    ("Heute Nacht bleibe ich wach. Und wenn Papa seine drei Wörter sagt, sage ich meine drei zurück.", "triumph"),        # 71
    # == 16:30 Uhr == (Heimweg, Kiosk)
    ("Auf dem Heimweg wäre dann trotzdem fast alles schiefgegangen.", "spannung"),                                        # 72
    ("Vor dem Kiosk stand Kevin aus der sechsten Klasse. Über seinem Kopf eine Null.", "geheimnis"),                      # 73
    ("Kevin redet so viel, dass er jeden Tag schon mittags bei null ist.", "froh"),                                       # 74
    ("Er hat mir einen Zwanzig-Euro-Schein hingehalten und auf meine Drei gezeigt.", "spannung"),                         # 75
    ("Zwanzig Euro für drei Wörter. Dafür hätte ich mir zwanzig Kaugummis kaufen können.", "staunen"),                    # 76
    ("Kevin hat mir die Hand hingehalten. Ein Handschlag, und meine Wörter wären weg.", "spannung"),                      # 77
    ("Ich habe ganz lange auf seine Hand geguckt.", "spannung"),                                                          # 78
    ("Dann habe ich meine Hände in die Hosentaschen gesteckt und bin einfach weitergegangen.", "triumph"),                # 79
    ("Wörter verkauft man nicht. Und diese drei schon gar nicht.", "triumph"),                                            # 80
    # == 18:00 Uhr ==
    ("Sechs Uhr. Wir saßen alle bei Oma vor dem Fernseher. Mama, Mia, Bello und ich.", "froh"),                           # 81
    ("Und da war Papa. Im Anzug, mit Krawatte. Über seinem Kopf eine Neunundneunzig.", "staunen"),                        # 82
    ("Guten Abend, liebe Stadt, hat er gesagt. Und dann hat er die Nachrichten vorgelesen.", "froh"),                     # 83
    ("Ich habe mitgezählt. Neunzig. Siebzig. Vierzig. Zehn.", "spannung"),                                                # 84
    ("Am Ende stand über seinem Kopf eine Drei. Genau wie bei mir.", "staunen"),                                          # 85
    ("Ich war so stolz auf ihn, dass ich fast etwas gesagt hätte.", "froh"),                                              # 86
    ("Nach den Nachrichten wollte Mia unbedingt noch raus. Mit ihrem roten Ball.", "froh"),                               # 87
    ("Also sind wir alle noch zum Dorfplatz an der Hauptstraße gegangen.", "froh"),                                       # 88
    ("Mia hat den Ball geworfen. Viel zu weit.", "spannung"),                                                             # 89
    ("Er ist über den Gehweg gerollt. Direkt auf die Straße.", "spannung"),                                               # 90
    ("Und Mia ist einfach hinterhergelaufen.", "action"),                                                                 # 91
    ("Dann habe ich den Bus gesehen. Er kam um die Ecke, und Mia hat ihn nicht bemerkt.", "action"),                      # 92
    ("Mama war zu weit weg. Bello hat gebellt, aber das tut er ja immer.", "action"),                                     # 93
    ("Ich hatte drei Wörter. Und ich habe zwei davon geschrien.", "action"),                                              # 94
    ("Mia, stopp!", "action"),                                                                                            # 95
    ("Mia ist stehen geblieben. Genau an der Bordsteinkante.", "spannung"),                                               # 96
    ("Der Bus hat gebremst und ist ganz langsam an ihr vorbeigerollt. Dann war alles still.", "staunen"),                 # 97
    ("Mama hat Mia so fest gedrückt, dass ihr der Ball heruntergefallen ist.", "traurig"),                                # 98
    ("Und dann hat sie mich gedrückt. Noch fester.", "traurig"),                                                          # 99
    ("Über meinem Kopf stand jetzt eine Eins.", "traurig"),                                                               # 100
    ("Eine einzige Eins. Und Papa hatte drei Wörter für mich aufgehoben.", "traurig"),                                    # 101
    # == 21:00 Uhr ==
    ("Neun Uhr. Ich lag im Bett, und Mama hat das Licht ausgemacht.", "stille"),                                          # 102
    ("Ich durfte jetzt nicht einschlafen. Auf gar keinen Fall.", "spannung"),                                             # 103
    ("Ich habe mir meinen Wecker auf Viertel vor zwölf gestellt.", "aufbau"),                                             # 104
    ("Ich habe die Lichterkette angemacht und Schafe gezählt. Rückwärts, damit es nicht wirkt.", "froh"),                 # 105
    ("Um zehn waren meine Augen schwer wie Steine.", "stille"),                                                           # 106
    ("Um elf habe ich mich auf den kalten Boden gesetzt, damit es unbequem ist.", "froh"),                                # 107
    ("Durch das Fenster habe ich die Lichter der Stadt gesehen.", "stille"),                                              # 108
    ("Hinter jedem Fenster saß jemand, der seine Wörter für heute schon verbraucht hatte.", "geheimnis"),                 # 109
    ("Ich habe an Herrn Krause gedacht, der zwei Wörter für meine Eins plus ausgegeben hat.", "froh"),                    # 110
    ("An Oma, die mir ihr Geheimnis verraten hat.", "froh"),                                                              # 111
    ("Und an Mia, die jetzt sicher in ihrem Bett lag. Wegen zwei Wörtern.", "traurig"),                                   # 112
    ("Vielleicht ist es gar nicht schlimm, wenn man nur wenige Wörter hat.", "geheimnis"),                                # 113
    ("Schlimm ist nur, wenn man die wichtigen nie sagt.", "geheimnis"),                                                   # 114
    ("Um halb zwölf bin ich fast im Sitzen eingeschlafen.", "stille"),                                                    # 115
    ("Nur ein lautes Schnarchen neben mir hat mich wach gehalten.", "froh"),                                              # 116
    ("Bello hat sich neben mich gelegt und geschnarcht. Er hat sogar im Schlaf gebellt.", "froh"),                        # 117
    ("Und ich habe die ganze Zeit an mein eines Wort gedacht. Was sagt man mit nur einem Wort?", "geheimnis"),            # 118
    ("Dann hat der Wecker geklingelt. Viertel vor zwölf. Schnell ins Bett und Augen zu.", "spannung"),                    # 119
    # == 23:59 Uhr ==
    ("Eine Minute vor zwölf ist meine Tür aufgegangen. Ganz langsam.", "spannung"),                                       # 120
    ("Papa ist reingeschlichen. Über seinem Kopf leuchtete eine Drei.", "geheimnis"),                                     # 121
    ("Er hat sich an mein Bett gesetzt und mir über die Haare gestrichen.", "traurig"),                                   # 122
    ("Und dann hat er sie gesagt. Seine drei Wörter.", "stille"),                                                         # 123
    ("Hab dich lieb.", "stille"),                                                                                         # 124
    ("Seine Drei ist auf null gesprungen.", "traurig"),                                                                   # 125
    ("Und genau da habe ich die Augen aufgemacht.", "staunen"),                                                           # 126
    ("Papa hat mich angeguckt, als hätte er ein Gespenst gesehen.", "froh"),                                              # 127
    ("Ich hatte nur noch ein einziges Wort. Und das habe ich benutzt.", "stille"),                                        # 128
    ("Auch!", "stille"),                                                                                                  # 129
    ("Papa hat nichts gesagt. Er konnte ja nicht mehr.", "traurig"),                                                      # 130
    ("Aber seine Augen sind ganz nass geworden, und er hat mich so fest umarmt wie noch nie.", "traurig"),                # 131
    ("Dann hat die Kirchturmuhr geschlagen. Zwölf Mal.", "staunen"),                                                      # 132
    ("Und über unseren Köpfen hat es aufgeleuchtet. Hundert. Und hundert.", "triumph"),                                   # 133
    ("Papa hat gelacht und gesagt: Na, dann erzähl mal. Wie war dein Tag?", "froh"),                                      # 134
    ("Und ich habe erzählt. Vom Drachen, vom Eiffelturm, vom Brokkoli und vom Bus.", "froh"),                             # 135
    ("Wir haben geredet, bis wir beide wieder bei null waren.", "froh"),                                                  # 136
    ("Seitdem bleibe ich jede Nacht wach. Bis eine Minute vor zwölf.", "froh"),                                           # 137
    ("Und seitdem weiß ich: Man braucht gar keine hundert Wörter.", "staunen"),                                           # 138
    ("Manchmal reicht ein einziges. Wenn es das richtige ist.", "triumph"),                                               # 139
]
EXTRA = {2: 0.3, 4: 0.35, 26: 0.3, 38: 0.3, 94: 0.2, 95: 0.4, 97: 0.3, 101: 0.4, 123: 0.4, 124: 0.45, 126: 0.3, 128: 0.4, 129: 0.45, 139: 0.3, 80: 0.3}
KAPITEL = [(0, "6:00 Uhr"), (18, "7:30 Uhr"), (29, "8:00 Uhr"), (46, "12:00 Uhr"), (56, "15:00 Uhr"), (72, "16:30 Uhr"), (81, "18:00 Uhr"), (102, "21:00 Uhr"), (120, "23:59 Uhr")]
KAPITEL_EN = [(0, "6:00 AM"), (18, "7:30 AM"), (29, "8:00 AM"), (46, "12:00 PM"), (56, "3:00 PM"), (72, "4:30 PM"), (81, "6:00 PM"), (102, "9:00 PM"), (120, "11:59 PM")]
zeilen = [z for z, _ in Z]; stimmungen = [s for _, s in Z]
