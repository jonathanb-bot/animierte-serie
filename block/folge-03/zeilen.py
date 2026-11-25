# Folge 3 „Mama“ – setzt die Abstimmung zu Folge 2 um (A: Krümel zu seiner Mama lassen, 25.11.: A 2 · B 0 · C 0)
Z = [
    ("Ihr habt gesagt, Krümel soll zu seiner Mama. Also bin ich losgerannt.", "action"),       # 0
    ("Krümel saß in meiner Kapuze und hat ganz leise gepiepst.", "spannung"),                  # 1
    ("Aber unten auf der Straße waren überall Polizeiautos.", "spannung"),                     # 2
    ("Und auf dem großen Bildschirm am Platz war mein Gesicht.", "spannung"),                  # 3
    ("Darunter stand: Gesucht. Zehntausend Euro.", "spannung"),                                # 4
    ("Dann hat mein Handy geklingelt. Papa.", "geheimnis"),                                    # 5
    ("Ich dachte: Jetzt gibt es richtig Ärger.", "traurig"),                                   # 6
    ("Aber Papa hat nur gesagt: Steig ein, ich fahre.", "froh"),                               # 7
    ("Papa arbeitet nämlich im Kraftwerk. Er kennt jeden Weg.", "aufbau"),                     # 8
    ("Mit seinem Arbeitsauto sind wir direkt durchs große Tor.", "action"),                    # 9
    ("Ganz oben auf dem Kühlturm war es eiskalt.", "geheimnis"),                               # 10
    ("Und direkt vor uns war nur noch ein riesiges Auge.", "grusel"),                          # 11
    ("Krümel ist aus meiner Kapuze geklettert.", "traurig"),                                   # 12
    ("Er hat mich noch einmal ganz lange angeschaut.", "traurig"),                             # 13
    ("Dann ist er zu seiner Mama hinübergeschwebt.", "staunen"),                               # 14
    ("Und die Mama hat die Augen zugemacht. Ganz sanft.", "staunen"),                          # 15
    ("Auf einmal ging in der ganzen Stadt das Licht wieder an.", "triumph"),                   # 16
    ("Viertel für Viertel, bis runter zum Platz.", "triumph"),                                 # 17
    ("Unten haben alle gejubelt. Sogar die Polizisten.", "triumph"),                           # 18
    ("Und Papa hat gesagt: Das war das Mutigste, was ich je gesehen habe.", "froh"),           # 19
    ("Aber zu Hause war mein Bett plötzlich so leer.", "traurig"),                             # 20
    ("Doch dann hat es an meinem Fenster geklopft.", "spannung"),                              # 21
    ("Draußen saßen ganz viele kleine Schatten.", "grusel"),                                   # 22
    ("Und einer hielt einen Zettel hoch: Hilf uns!", "spannung"),                              # 23
    ("Was soll ich jetzt tun?", "stille"),                                                     # 24
    ("Alle reinlassen, Oma um Hilfe fragen oder das Fenster zumachen?", "stille"),             # 25
    ("Schreibt es in die Kommentare. Was die meisten sagen, mache ich.", "stille"),            # 26
]
zeilen = [z for z, _ in Z]; stimmungen = [s for _, s in Z]
