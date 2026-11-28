# Folge 05 „Akku“ (eigenständig, Issue #45): In meiner Stadt hat jeder einen Akku über dem Kopf – ist er leer, schläfst du sofort ein.
# Beweis-Montage (Lehrer, Oma, Papa), ich bin die Ausnahme (immer 100 %), Wendung „Herz“: Mama schenkt mir jede Nacht heimlich ihren Akku.
Z = [
    ("In meiner Stadt hat jeder einen Akku über dem Kopf.", "staunen"),                 # 0
    ("Ist er leer, schläfst du sofort ein. Egal wo.", "spannung"),                      # 1
    ("Mein Lehrer hatte heute nur noch zwei Prozent.", "froh"),                         # 2
    ("Mitten im Satz ist er an der Tafel eingeschlafen.", "froh"),                      # 3
    ("Oma hatte beim Mittagessen null Prozent.", "froh"),                               # 4
    ("Jetzt schnarcht sie über ihrer Suppe.", "froh"),                                  # 5
    ("Und Papa lädt sich jeden Abend auf dem Sofa auf.", "froh"),                       # 6
    ("Nur bei mir ist alles anders.", "geheimnis"),                                     # 7
    ("Mein Akku steht seit meiner Geburt auf hundert Prozent.", "geheimnis"),           # 8
    ("Ich werde nie müde. Nie.", "aufbau"),                                             # 9
    ("Die ganze Nacht Minecraft gespielt? Hundert Prozent.", "froh"),                   # 10
    ("Zehnmal um den Dorfplatz gerannt? Hundert Prozent.", "triumph"),                  # 11
    ("Aber heute Nacht habe ich mich nur schlafend gestellt.", "spannung"),             # 12
    ("Da kam Mama in mein Zimmer und setzte sich an mein Bett.", "geheimnis"),          # 13
    ("Über ihrem Kopf stand: ein Prozent.", "spannung"),                                # 14
    ("Und ein dünnes Licht lief von ihrem Akku zu meinem.", "geheimnis"),               # 15
    ("Mein Akku war nie von allein voll.", "traurig"),                                  # 16
    ("Mama hat mir jede Nacht ihren geschenkt.", "traurig"),                            # 17
    ("Dann ist sie auf null gefallen und eingeschlafen.", "traurig"),                   # 18
    ("Also habe ich ihre Hand genommen.", "traurig"),                                   # 19
    ("Neunzig. Siebzig. Fünfzig.", "geheimnis"),                                        # 20
    ("Zum ersten Mal in meinem Leben war ich müde.", "traurig"),                        # 21
    ("Und es war das schönste Gefühl der Welt.", "staunen"),                            # 22
]
zeilen = [z for z, _ in Z]; stimmungen = [s for _, s in Z]
