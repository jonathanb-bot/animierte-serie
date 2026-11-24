# Vorrat 04 „Lügen-Geld“ (eigenständig; Storyline von Jonathan 24.11.: „In my town, you get paid every time someone lies to you.“
# +100 Dollar, wenn dich jemand anlügt, −500 Dollar, wenn du selbst lügst; die meisten verdienen nur ein paar Hundert am Tag)
# Eigene Handlung: Ich werde mit Fang-Fragen reich – nur mein bester Freund lügt nie. Bis er mit Koffer vor der Tür steht.
Z = [
    ("In meiner Stadt bekommst du hundert Dollar, wenn dich jemand anlügt.", "staunen"),         # 0
    ("Aber wenn du selbst lügst, verlierst du fünfhundert.", "spannung"),                         # 1
    ("Darum verdienen die meisten nur ein paar Hundert Dollar am Tag.", "froh"),                  # 2
    ("Papa sagt: Dein Bild ist wunderschön. Plus hundert für mich.", "froh"),                    # 3
    ("Oma sagt: Ich bin überhaupt nicht müde. Plus hundert.", "froh"),                            # 4
    ("Der Lehrer sagt: Der Test wird ganz leicht. Plus hundert für die ganze Klasse.", "froh"),   # 5
    ("Also hatte ich einen Plan.", "aufbau"),                                                     # 6
    ("Ich stelle allen Fragen, bei denen sie lügen müssen.", "aufbau"),                           # 7
    ("Gefällt dir meine neue Frisur? Plus hundert.", "froh"),                                     # 8
    ("Schmeckt dir mein Kuchen? Plus hundert.", "froh"),                                          # 9
    ("Einmal habe ich zu Mama gesagt: Ich habe Zähne geputzt. Minus fünfhundert.", "froh"),       # 10
    ("Trotzdem hatte ich nach einer Woche zehntausend Dollar.", "triumph"),                       # 11
    ("Nur bei einem klappt es nie. Bei meinem besten Freund.", "geheimnis"),                      # 12
    ("Er sagt immer die Wahrheit. Bei ihm bekomme ich keinen Cent.", "geheimnis"),                # 13
    ("Bis heute Abend.", "spannung"),                                                             # 14
    ("Er stand mit einem Koffer vor meiner Tür.", "spannung"),                                    # 15
    ("Ich habe gefragt: Ist alles okay?", "spannung"),                                            # 16
    ("Er hat gelächelt und gesagt: Alles ist gut. Ich gehe nirgendwo hin.", "geheimnis"),          # 17
    ("Und mein Konto sprang auf plus hundert.", "grusel"),                                        # 18
    ("Und gleich noch mal. Plus hundert.", "grusel"),                                             # 19
    ("Mein bester Freund hat mich gerade zweimal angelogen.", "traurig"),                         # 20
    ("Was soll ich jetzt tun?", "stille"),                                                        # 21
    ("Ihn festhalten, ihm heimlich folgen oder seine Mama anrufen?", "stille"),                   # 22
    ("Schreibt es in die Kommentare. Was die meisten sagen, mache ich.", "stille"),               # 23
]
zeilen = [z for z, _ in Z]; stimmungen = [s for _, s in Z]
