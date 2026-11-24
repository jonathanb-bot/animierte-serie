# Vorrat 03 „Das leere Glas“ (eigenständig, Story-Richtung „Herz“, Jonathan 24.11.; weiter vorproduzieren)
# Eigene Geschichte: Sterne für gute Taten, der Hausmeister mit dem leeren Glas verschenkt heimlich alle seine Sterne.
Z = [
    ("In meiner Stadt bekommst du für jede gute Tat einen Stern.", "staunen"),                  # 0
    ("Er fliegt direkt in dein Glas am Fenster.", "froh"),                                      # 1
    ("Oma hat schon zweihundert. Sie strickt Mützen für die ganze Straße.", "froh"),            # 2
    ("Papa hat fünfzig. Er trägt jedem die Einkäufe.", "froh"),                                 # 3
    ("Und ich habe zwölf. Darauf bin ich echt stolz.", "froh"),                                 # 4
    ("Nur einer hat gar keinen. Der Hausmeister unserer Schule.", "geheimnis"),                 # 5
    ("Sein Glas ist leer. Schon seit Jahren.", "geheimnis"),                                    # 6
    ("Alle sagen, er ist geizig und hilft nie jemandem.", "geheimnis"),                         # 7
    ("Und ich? Ich habe mitgelacht.", "traurig"),                                               # 8
    ("Aber irgendwas war komisch.", "geheimnis"),                                               # 9
    ("Er war jeden Morgen todmüde.", "traurig"),                                                # 10
    ("Seine Schuhe hatten Löcher. Und er hat ständig gehustet.", "traurig"),                    # 11
    ("Dann war plötzlich das Sternenglas unserer Klasse weg.", "spannung"),                     # 12
    ("Alle haben sofort auf ihn gezeigt. Ich auch.", "spannung"),                               # 13
    ("Er hat nichts gesagt. Er ist einfach gegangen.", "traurig"),                              # 14
    ("Am nächsten Morgen lag er auf dem Schulhof.", "spannung"),                                # 15
    ("Keiner ist hingegangen. Nur ich.", "traurig"),                                            # 16
    ("Im Krankenhaus saß Oma an seinem Bett. Sie kennt ihn von früher.", "traurig"),            # 17
    ("Das Klassenglas hatte einen Sprung. Er hat es nur repariert.", "geheimnis"),              # 18
    ("Und sein Glas ist leer, weil er jede Nacht heimlich seine Sterne verschenkt.", "staunen"),  # 19
    ("An alle, die gerade traurig sind.", "traurig"),                                           # 20
    ("Mein allererster Stern war von ihm.", "traurig"),                                         # 21
    ("Was soll ich ihm jetzt sagen?", "stille"),                                                # 22
    ("Entschuldigung, danke, oder schenke ich ihm meine zwölf Sterne?", "stille"),              # 23
    ("Schreibt es in die Kommentare. Was die meisten sagen, mache ich.", "stille"),             # 24
]
zeilen = [z for z, _ in Z]; stimmungen = [s for _, s in Z]
