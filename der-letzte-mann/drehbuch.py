#!/usr/bin/env python3
"""Erzeugt die Drehbücher von „Der letzte Mann“ (episoden/folge-XX.txt) aus den Storylines (storylines/folge-XX.md).

    python3 der-letzte-mann/drehbuch.py            # alle Folgen
    python3 der-letzte-mann/drehbuch.py 03 04      # nur diese

Der Sprechtext wird 1:1 übernommen (wichtig für die Stimme), über jeder Zeile steht die Bildbeschreibung als Kommentar.
Aus der Bildbeschreibung wird die Kulisse mit Angaben gewählt (Regeln unten). Kopfzeilen @musik/@whoosh bleiben erhalten.
"""
import re
import sys
from pathlib import Path

SERIE = Path(__file__).resolve().parent
ZEIT = {"morgen": "morgen", "tag": "tag", "abend": "abend", "nacht": "nacht"}
TITELFARBE = 'farbe=#14213d akzent=#e2b443'

# Zustand der Konsole je Folge und Kapitel: Licht im Raum, Display, Lämpchen, Schalter
KONSOLE = {
    (6, 1): dict(licht="taschenlampe", display="ANSAGE: THOMAS B.|31 ANRUFE"),
    (6, 2): dict(licht="taschenlampe", display="ANSAGE: THOMAS B.|31 ANRUFE"),
    (6, 3): dict(licht="taschenlampe", display="NOTBETRIEB"),
    (6, 4): dict(licht="konsole", display="AKKU 38 %|NÄCHSTES FENSTER|13:13:00", l1="an"),
    (7, 1): dict(licht="konsole", display="FENSTER 13:13:00|VERBINDUNG", l1="an"),
    (7, 2): dict(licht="konsole", display="AKKU 33 %|NÄCHSTES FENSTER|14:13:00", l1="an"),
    (7, 3): dict(licht="konsole", display="AKKU 33 %|NÄCHSTES FENSTER|14:13:00", l1="an"),
    (7, 4): dict(licht="konsole", display="FENSTER 14:13:00|VERBINDUNG", l1="an"),
    (8, 1): dict(licht="konsole", display="NEUES MUSTER|GESPEICHERT: T", l1="an"),
    (8, 2): dict(licht="konsole", display="AKKU 28 %", l1="an"),
    (8, 3): dict(licht="konsole", display="MUSTER: A · B · T", l1="an"),
    (8, 4): dict(licht="konsole", display="GESPERRT", schalter="sperre", schluessel=True),
    (9, 1): dict(licht="taschenlampe", display="GESPERRT", schalter="sperre"),
    (9, 2): dict(licht="an", display="NETZ · LÄDT|AKKU 22 %", l1="an"),
    (9, 3): dict(licht="an", display="NETZ · LÄDT|AKKU 46 %", l1="an"),
    (9, 4): dict(licht="an", display="NETZ · LÄDT|NÄCHSTES FENSTER|23:13:00", l1="an"),
    (10, 1): dict(licht="an", display="NETZ|FENSTER 23:13:00", l1="an"),
    (10, 2): dict(licht="an", display="VERBINDUNG|GEGENSTELLE S7 (B)", l1="an", l2="an", l3="an"),
    (10, 3): dict(licht="an", display="VERBINDUNG|GEGENSTELLE S7 (B)", l1="an", l2="an", l3="an"),
    (10, 4): dict(licht="an", display="NETZ · AKKU 100 %|FENSTER 01:13:00", l1="an", l2="an", l3="an"),
}
NAH = {  # Kamera-Ausschnitte im Kellerraum
    "display": "fokus=330,885 zoom=2.3", "lampen": "fokus=330,1035 zoom=2.4", "telefon": "fokus=450,700 zoom=2.5",
    "taste": "fokus=340,1190 zoom=2.4", "messkammer": "fokus=860,1090 zoom=1.35", "funkwecker": "fokus=215,700 zoom=2.6",
    "verteiler": "fokus=225,840 zoom=1.9", "stahltuer": "fokus=740,1000 zoom=1.3",
}
ICONS = [  # Infokarten: Stichwort in der Bildbeschreibung -> Icon und Beschriftung
    ("Funkmast", "funkmast:Cell Broadcast"), ("Glasscheibe", "glasscheibe:ca. 4 % pro Fläche"), ("links Tag", "tag_nacht"),
    ("Häkchen", "gesicht_bekannt:Bekannt"), ("Fragezeichen", "gesicht_fremd:Fremd"), ("Formular", "formular:Messbetrieb Keller"),
    ("Datei mit", "datei_info:Metadaten"), ("Suchdienst", "suchdienst:Suchdienst"), ("altes Telefon", "telefon_alt:Strom über die Leitung"),
    ("Weltuhr", "weltuhr"), ("Satellit", "satellit:+38 µs pro Tag"), ("verrutscht", "gps_fehler:ohne Korrektur"),
    ("Funkturm", "funkuhr:ca. 2000 km"), ("Frequenzband", "frequenz:Telefonband"),
]
AUSDRUCK = [("Schreck", "schreck"), ("Angst", "angst"), ("besorgt", "besorgt"), ("misstrauisch", "misstrauisch"), ("entschlossen", "entschlossen"),
            ("froh", "froh"), ("Grinsen", "froh"), ("geschmeichelt", "froh"), ("charmant", "froh"), ("selbstzufrieden", "froh"), ("zufrieden", "froh"),
            ("lächelt", "froh"), ("wütend", "wuetend"), ("müde", "muede"), ("verlegen", "muede"), ("trocken", "neutral"), ("ernst", "besorgt"),
            ("lauscht", "misstrauisch"), ("gekränkt", "traurig"), ("starr", "schreck"), ("nervös", "besorgt"), ("leise", "besorgt"), ("freundlich", "froh"), ("sachlich", "neutral")]


def ausdruck(b):
    for w, a in AUSDRUCK:
        if w.lower() in b.lower():
            return a
    return "neutral"


def hud(anz):
    a = {}
    m = re.search(r"Tag (\d+), (\d\d:\d\d)", anz); a["tag"], a["zeit"] = m.groups()
    h = re.search(r"HANDY (\d+) %( \+)?", anz); a["handy"] = f"{h.group(1)}/100%" + ("+" if h.group(2) else "")
    a["netz"] = re.search(r"NETZ ([\d/]+)", anz).group(1)
    k = re.search(r"KONSOLE (.*)$", anz).group(1).split("→")[-1].strip()
    if "nicht verbunden" in k: a["konsole"] = "nicht_verbunden"
    else:
        km = re.match(r"(\d+) %( \+)?", k); a["konsole"] = f"{km.group(1)}/100%" + ("+" if km.group(2) else "")
    return a


def szene(ep, kap, b, text, kz, h):
    """b = Bildbeschreibung, kz = Kapitelzustand, h = Anzeige (für Handy)"""
    bl = b.lower()
    ort_keller = "keller" in kz["orte"]
    raum = ort_keller and not ("flur" in kz["orte"] and ep == 5)
    k = KONSOLE.get((ep, kap), dict(licht="konsole"))
    raumtag = lambda extra="": " ".join(x for x in ["keller ansicht=raum", f'licht={k["licht"]}', f'display="{k["display"]}"' if k.get("display") else "",
                                                     *(f"{x}={k[x]}" for x in ("l1", "l2", "l3", "schalter") if k.get(x)), "schluessel" if k.get("schluessel") else "", extra] if x)
    gesicht_ort = "ort=keller ansicht=raum licht=konsole" if raum else "ort=keller" if ort_keller else "ort=strasse" if "strasse" in kz["orte"] and ep == 5 else "ort=wohnung"
    if b.startswith("Titelkarte"):
        return None
    # Nahaufnahmen
    if b.startswith("Nahaufnahme: Nachrichtensprecherin"):
        return 'gesicht sprecherin ort=studio bauchbinde="Eilmeldung" sagt=sprecherin'
    for wer, name in (("Lea", "lea"), ("Winter", "winter")):
        if b.startswith(f"Nahaufnahme: {wer}"):
            return f"gesicht {name} {gesicht_ort} {ausdruck(b)}"
    if b.startswith("Nahaufnahme"):
        extra = " licht=taschenlampe" if ep == 6 and kap <= 3 else ""
        return f"gesicht du {gesicht_ort} {ausdruck(b)}{extra}"
    # Handy und Tablet
    if b.startswith("Tablet"):
        z = "Anker B · Seite B|Wählversuche: 31|stündlich seit Tag 1, 10:13|Gegenstelle: S7 (B)" if "nah" in bl or ep == 8 else ""
        return f'handy bildschirm=protokoll wer=winter ort=keller ansicht=raum licht=konsole' + (f' zeilen="{z}"' if z else "")
    if b.startswith("Handy") or b.startswith("Foto"):
        basis = f'uhrzeit={h["zeit"]} akku={h["handy"].split("/")[0]} netz={h["netz"].split("/")[0]} ort={"keller" if ort_keller else "wohnung"}'
        if "Eilmeldung" in b: return f"handy bildschirm=meldungen {basis}"
        if "Anrufliste" in b: return f"handy bildschirm=anrufliste {basis}"
        if "Warnmeldung" in b: return f"handy bildschirm=warnung {basis}"
        if "Post" in b or "Kommentare" in b or "vergrößert" in b or "Webcam" in b:
            return f"handy bildschirm=post {basis}" + (' kommentare="Fake?|Wo ist das?|Wer ist er?"' if "Kommentare" in b else "")
        if "Dateieigenschaften" in b: return f"handy bildschirm=pdf eigenschaften {basis}"
        if "PDF" in b or "Messplan" in b: return f"handy bildschirm=pdf {basis}"
        if "Tabelle" in b or "Brandt" in b: return f"handy bildschirm=tabelle {basis}" + (" markiere=false" if "Überschrift" in b else "")
        if "Nika" in b or "Vermissten" in b: return f"handy bildschirm=foto {basis}"
        if "Winter" in b: return f'handy bildschirm=anruf name="Dr. E. Winter" status=verbunden {basis}'
        if "Unbekannt" in b: return f'handy bildschirm=anruf name=Unbekannt status="eingehend" {basis}'
        if "einen Balken" in b: return f"handy {basis} netz=1"
        if "Ben" in b or "Mailbox" in b or "Papa" in b or "Tonwelle" in b:
            return f'handy bildschirm=anruf name=Papa status=Mailbox {basis}' + (" welle" if "Tonwelle" in b else "")
        return f"handy bildschirm=meldungen {basis}"
    # Infokarten
    if b.startswith("Infokarte"):
        for wort, icon in ICONS:
            if wort in b:
                return f'objekt objekte="{icon}" farbe=#1e2f45'  # nie „Echter Fakt“ (Jonathans Vorgabe)
        return 'objekt objekte="formular" farbe=#1e2f45'
    if b.startswith("Karteikarte"):
        return 'objekt objekte="uhrzeiten" farbe=#1e2f45' if "9:13" in b else 'objekt objekte="karteikarte" farbe=#1e2f45'
    if b.startswith("Schlüsselbund"):
        return 'objekt objekte="schluesselbund:S7 · S7-S" farbe=#2a2f3a'
    # Außenaufnahmen
    if b.startswith("Skyline"):
        return "skyline rauch=false" + (" heli" if "Hubschrauber" in b else "") + (" fahrt" if "fährt" in b else "")
    if b.startswith("Bahnhof"):
        if "Feldbetten" in b: return 'bahnhof hilfspunkt k1 zug="ERSATZVERKEHR" anzeige="Fahrerinnen gesucht" anzeige_gross=48 uhr=11:00'
        if "Nacht" in b or "nacht" in b: return 'bahnhof zeit=nacht flackern zug="22:13   Kein Zugverkehr" anzeige="Bitte warten" uhr=22:13'
        return "bahnhof k1 k1:traegt haelt=k1:zwei_becher uhr=08:41"
    if b.startswith("Supermarkt"):
        if "Kassiererin" in b: return 'supermarkt k2 kasse wagen=false schild="Wasser: 2 pro Person"'
        return "supermarkt k2 klingelt k2:misstrauisch"
    if b.startswith("Tokio"):
        if "Nacht" in b: return "tokio zeit=nacht uhr=21:13 flackern k4"
        if "Morgen" in b: return "tokio zeit=morgen fotos schirm=fotos menge=12"
        if "16:13" in b: return "tokio zeit=tag uhr=16:13"
        return "tokio zeit=tag"
    if b.startswith("New-York"):
        if "Webcam" in b or "THE LAST MAN" in b or "deinem Bild" in b: return 'newyork zeit=morgen bild=webcam schirm="THE LAST MAN?"'
        if "flackern" in b: return 'newyork zeit=morgen flackern bild=webcam schirm="THE LAST MAN?"'
        return "newyork zeit=nacht"
    if b.startswith("Dach gegenüber"):
        return "dach webcam tonnen=false rauch=false"
    if b.startswith("Straße vor dem Haus"):
        return "strasse horde=0 kaputt=false rauch=false k1 k3 k1:traegt k3:traegt figur_x=380 laeden=baeckerei,supermarkt,apotheke"
    if b.startswith("Straße"):
        return "strasse horde=0 kaputt=false rauch=false lea lea:geht figur_x=520 laeden=baeckerei,supermarkt,apotheke"
    if b.startswith("Suchstelle") or b.startswith("Fotowand"):
        nacht = " zeit=nacht" if "Nacht" in b else ""
        if "nah" in bl: return f"suchstelle markiere fokus=458,930 zoom=1.9{nacht}"
        return f"suchstelle k3 markiere{nacht}" if "Nika" in b else f"suchstelle k3{nacht}"
    if b.startswith("Karte"):
        return "stadtplan"
    # Wohnung
    if b.startswith("Bad"):
        return "bad du du:denkt" + (" froh" if "zufrieden" in b or "Haare" in b else "")
    if b.startswith("Wohnungstür offen"):
        return "tuer du lea du:froh lea:misstrauisch"
    if b.startswith("Wohnungstür"):
        if "Lea" in b: return "tuer lea lea:traegt haelt=lea:formular lea:muede"
        return "tuer" + (" klingel" if "Klingel" in b else "") + (" du du:froh" if "Alex" in b else "")
    if b.startswith("Türspion"):
        return "spion lea etage=3 flurlicht=an misstrauisch" + (" nah" if "nah" in bl else "")
    if b.startswith("Küche"):
        z = re.search(r"(\d\d:\d\d)", b)
        return "kueche" + (" lea lea:denkt" if "Lea" in b else "") + (" du" if "Alex" in b else "") + f" uhr={z.group(1) if z else h['zeit']}" + (" ton=funk_rauschen" if "rauscht" in b or "Radio" in b else "")
    if b.startswith("Wohnung"):
        t = "wohnung du"
        if "Lea" in b: t += " lea"
        if "zieht den Vorhang" in b: t += " vorhang=schliesst lea:zeigt"
        elif ep >= 2 and not ("Fenster" in b and ep <= 2) and ep <= 4: t += " vorhang=zu licht=an"
        if "sitzt" in b: t += " du:sitzt pos=120"
        if "Fenster" in b and ("offen" in b or "an der Scheibe" in b or "am Fenster" in b): t += " du:denkt froh"
        return t
    if b.startswith("Treppe"):
        return "treppe keller" + (" lea" if "Lea" in b else "") + (" du" if ep == 5 and "Lea" in b else "")
    # Keller
    if b.startswith("Kellerflur") or b.startswith("Stahltür") or b.startswith("Tür offen"):
        t = "keller ansicht=flur"
        if "Plombe" in b or "Hausverteiler" in b or "Sicherung" in b:
            return t + " " + NAH["verteiler"] + (" sicherung=an" if "hoch" in b else "")
        if "Tür offen" in b: return t + " tuer=offen licht=taschenlampe du du:taschenlampe"
        if "dumpfe Stimme" in b: return t + " stimme " + NAH["stahltuer"]
        if "Schlüssel" in b: return t + " du du:zeigt " + NAH["stahltuer"]
        if "Stahltür" in b: return t + " du lea" + (" " + NAH["stahltuer"] if "nah" in bl else "")
        return t + " du lea"
    if b.startswith("Lea klappt"):
        return "keller ansicht=flur sicherung=an ton=strom_an " + NAH["verteiler"]
    # Kellerraum S7
    extra = []
    if "Display nah" in b or b.startswith("Display"): extra.append(NAH["display"])
    elif "Lämpchen" in b or "Leuchte" in b: extra.append(NAH["lampen"])
    elif "Projekttelefon" in b and "Alex" not in b: extra.append(NAH["telefon"])
    elif "Hörer nah" in b: extra.append(NAH["telefon"] + " ton=funk_rauschen")
    elif "Schlüsselschalter" in b or "Taste" in b or "kleinen Schlüssel" in b: extra.append(NAH["taste"])
    elif "Funkwecker" in b and "Lea" not in b: extra.append(NAH["funkwecker"])
    elif b.startswith("Messkammertür"): extra.append(NAH["messkammer"])
    klinke = "Hand auf der Klinke" in b or "Hand legt sich auf die Klinke" in b
    if klinke: extra.append("klinke " + NAH["messkammer"])
    if "dritte Lämpchen flackert" in b: extra.append("l3=flackert")
    elif "dritte Lämpchen blinkt" in b: extra.append("l3=blinkt3")
    elif "dritte Lämpchen leuchtet" in b: extra.append("l3=an")
    if "blaue Lämpchen" in b and ("geht an" in b or "an," in b or "blaues Lämpchen an" in b): extra.append("l2=an")
    if "erlischt" in b: extra.append("l2=aus")
    if "erwacht" in b: extra.append("l1=an ton=strom_an")
    if "Finger" in b: extra.append("druecken")
    if "BETRIEB" in b and "dreht" in b: extra.append("schalter=betrieb schluessel")
    if "kleinen Schlüssel" in b: extra.append("schluessel")
    if "SPERRE" in b: extra.append("schalter=sperre schluessel")
    if "klingelt" in b: extra.append("klingelt")
    if "vibriert" in b or "Schlägen" in b: extra.append("klopfen")
    if "Deckenlicht" in b: extra.append("licht=an ton=strom_an")
    wf = re.search(r"Funkwecker (?:springt auf |)(\d\d:\d\d:\d\d)", b)
    if "Funkwecker" in b: extra.append(f"funkwecker={wf.group(1) if wf else ('22:58:41' if ep == 9 else '23:12:59')}")
    figs = []
    if ("Alex" in b or "Hörer" in b and "nah" not in bl) and not klinke: figs.append("du")
    if "Lea" in b: figs.append("lea")
    if "Winter" in b or "Frau mit Mantel" in b: figs.append("winter")
    if "Hörer" in b and "nah" not in bl or "Hörer am Ohr" in b or "dreht die Wählscheibe" in b: extra.append("hoerer_ab du:lauscht")
    if "an der Tür" in b and "du" in figs: extra.append("pos=860" if len(figs) == 1 else "pos=880,300")
    if "Gegenlicht" in b: extra.append("winter:verschraenkt")
    t = raumtag(" ".join(figs + extra))
    # nach dem Drücken der Taste ist die Konsole an
    return re.sub(r"\bl1=(\w+)(.*)\bl1=an", r"l1=an\2", t)


def baue(n):
    md = (SERIE / "storylines" / f"folge-{n:02d}.md").read_text(encoding="utf-8").splitlines()
    titel = {int(p.stem[-2:]): re.search(r"^FOLGE \d+: (.*)$", p.read_text(encoding="utf-8"), re.M).group(1) for p in (SERIE / "storylines").glob("folge-*.md")}
    alt = SERIE / "episoden" / f"folge-{n:02d}.txt"
    kopf_alt = [z for z in alt.read_text(encoding="utf-8").splitlines() if re.match(r"^@(musik|musik_lautstaerke|whoosh)\b", z)] if alt.exists() else []
    out = [f"# Folge {n}: {titel[n]}", *kopf_alt, "@serie Der letzte Mann", "@mund zitate", "@look 0"]
    modus, kz, h, kap = None, {"orte": ""}, None, 0
    for z in md:
        k = re.match(r"^KAPITEL (\d+): ([^|]+)\|([^|]*)\|([^|]*)\|([^|]*)\| Anzeige: (.*)$", z)
        if k:
            nr, name, orte, fig, zeit, anz = [x.strip() for x in k.groups()]
            kap, kz, h = int(nr), {"orte": orte}, hud(anz)
            out += ["", f"== Kapitel {nr}: {name} ==", f"@zeit {ZEIT.get(zeit.split()[0].lower(), 'tag')}", "@hud " + " ".join(f"{a}={v}" for a, v in h.items())]
            modus = "k"; continue
        if z.startswith("TITELKARTE"):
            out.append(f'[titel oben="Folge {n}" gross="DER LETZTE MANN" unten="{titel[n]}" {TITELFARBE} groesse=120 dauer=1 hud=false]'); modus = None; continue
        if z.startswith("WAS BISHER GESCHAH:"):
            out += ["", "== Was bisher geschah =="]; modus = "r"; continue
        if z.startswith("FORTSETZUNG FOLGT"):
            oben = f"Folge {n + 1}: {titel[n + 1]}" if n < 10 else "Staffel 2"
            out.append(f'[titel oben="{oben}" gross="Fortsetzung folgt" {TITELFARBE} groesse=110 dauer=1 hud=false]'); modus = None; continue
        c = re.match(r"^CHECK: Frage: (.*?) / Antwort: (.*)$", z)
        if c:
            out += ["", "== Check ==", "@hud aus",
                    f'[objekt objekte="ohr" gross="Frage" farbe=#1e2f45] Frage: {c.group(1)}',
                    f'[objekt objekte="gluehbirne" gross="Antwort" farbe=#1e3a2a] Antwort: {c.group(2)}',
                    f'[titel gross="Was hättest du|gemacht?" groesse=120 unten="Schreib es in die Kommentare" {TITELFARBE}] Was hättest du gemacht? Schreib es in die Kommentare.']
            modus = None; continue
        if z.startswith("SCHNITT"):
            out.append("// SCHNITT: Ende Teil 1"); continue
        if re.match(r"^(CLIFFHANGER|FAKTEN|NEU ZU|DAUER|Laufzeit)", z):
            modus = None; continue
        e = re.match(r"^\* (.*) – (.*)$", z)
        if e and modus:
            bild, text = e.groups()
            tag = szene(n, kap if modus == "k" else 0, bild, text, kz if modus == "k" else {"orte": ""}, h or {"zeit": "09:00", "handy": "60/100%", "netz": "4/4"})
            if tag is None: continue
            if modus == "r": tag += " hud=false"
            out += [f"// {bild}", f"[{tag}] {text}"]
    alt.write_text("\n".join(out) + "\n", encoding="utf-8")


if __name__ == "__main__":
    for n in [int(a) for a in sys.argv[1:]] or range(1, 11):
        baue(n)
    print("ok")
