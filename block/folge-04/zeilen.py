# Folge 4 „Leuchten“ – setzt die Abstimmung zu Folge 3 um (A: alle reinlassen, 26.11.: A 4 · B 0 · C 0)
Z = [
    ("Ihr habt gesagt: alle reinlassen. Also habe ich das Fenster aufgemacht.", "spannung"),   # 0
    ("Und dann kamen sie rein. Einer nach dem anderen.", "staunen"),                           # 1
    ("Vierundvierzig kleine Schatten. In meinem Zimmer!", "staunen"),                          # 2
    ("Sie waren eiskalt und haben gezittert.", "traurig"),                                     # 3
    ("Aber kleine Schatten haben riesigen Hunger.", "spannung"),                               # 4
    ("Um sechs Uhr haben sie meinen Wecker aufgegessen.", "froh"),                             # 5
    ("Um sieben hat Papa den Kühlschrank aufgemacht. Leer.", "froh"),                          # 6
    ("Nur ein Schatten saß noch drin und hat gerülpst.", "froh"),                              # 7
    ("Um acht wollte Papa seinen Helm aufsetzen. Da saßen drei drin.", "froh"),                # 8
    ("Und bei Oma haben sie den ganzen Kuchen gegessen. Mit Teller.", "froh"),                 # 9
    ("Oma hat nur gelacht: Endlich mal Besuch, der meinen Kuchen mag.", "froh"),               # 10
    ("Doch dann hat Oma ganz ernst geguckt.", "geheimnis"),                                    # 11
    ("Schatten werden riesig, wenn sie traurig sind, hat sie gesagt.", "geheimnis"),           # 12
    ("Aber wenn sie glücklich sind, fangen sie an zu leuchten.", "staunen"),                   # 13
    ("Also haben wir am Abend die größte Party gemacht.", "aufbau"),                           # 14
    ("Papa hat Musik angemacht, und Oma hat getanzt.", "froh"),                                # 15
    ("Die Schatten sind gehüpft, bis sie gekichert haben.", "froh"),                           # 16
    ("Und auf einmal hat der erste golden geleuchtet.", "staunen"),                            # 17
    ("Dann der zweite. Dann alle vierundvierzig!", "triumph"),                                 # 18
    ("Unser ganzes Haus hat gestrahlt wie eine riesige Laterne.", "triumph"),                  # 19
    ("Aber dann hielt unten ein schwarzer Lastwagen.", "spannung"),                            # 20
    ("Darauf stand: Schattenfänger.", "spannung"),                                             # 21
    ("Und jemand hat an unserer Tür geklingelt.", "spannung"),                                 # 22
    ("Was soll ich jetzt tun?", "stille"),                                                     # 23
    ("Die Tür zuhalten, mit allen übers Dach fliehen oder aufmachen?", "stille"),              # 24
    ("Schreibt es in die Kommentare. Was die meisten sagen, mache ich.", "stille"),            # 25
]
zeilen = [z for z, _ in Z]; stimmungen = [s for _, s in Z]
