# Aktualisiert die PowerPoint „One Hour Kitchen“ auf den optimierten Grundriss (190 m²) und die neuen Quellen.
import re, sys, os, shutil, zipfile, io
from xml.sax.saxutils import escape
from lxml import etree

UN, PLAN = sys.argv[1], sys.argv[2]
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
EMU = 914400

def sub(path, mapping):
    p = os.path.join(UN, path)
    x = open(p, encoding='utf-8').read()
    for old, new in mapping.items():
        o = f'<a:t>{escape(old)}</a:t>'
        if o not in x:
            raise SystemExit(f'nicht gefunden in {path}: {old[:60]}')
        x = x.replace(o, f'<a:t>{escape(new)}</a:t>')
    open(p, 'w', encoding='utf-8').write(x)

S = lambda n: f'ppt/slides/slide{n}.xml'
N = lambda n: f'ppt/notesSlides/notesSlide{n}.xml'

# ---------- Folie 3: Kochhaus ----------
sub(S(3), {'Lebensmittelpraxis 2010; Tagesspiegel 2019': 'Lebensmittelpraxis 2010 ◐; Tagesspiegel 2019 ✓'})

# ---------- Folie 4: Rahmen ----------
sub(S(4), {
    'Alle Rahmendaten sind gekennzeichnete Fallannahmen der Gruppe. Vergleichswert Kochhaus Berlin: 150 m², 600 Artikel (Lebensmittelpraxis, 16.12.2010).':
    'Alle Rahmendaten sind gekennzeichnete Fallannahmen der Gruppe. Vergleichswert Kochhaus Berlin: 150 m², 600 Artikel (Lebensmittelpraxis, 16.12.2010 ◐).',
    'Food-Store mit Kochwelten und mietbarer Showküche (8 Plätze)': 'Food-Store mit drei Kochwelten, Rezept-Matrix und mietbarer Showküche (8 Plätze)',
    'ca. 800 Artikel: 9 Matrix-Rezepte in 3 Kochwelten, Basissortiment, Frische und Kühlung, Getränke, Desserts':
    'ca. 800 Artikel: 9 Matrix-Rezepte in 3 Kochwelten, Obst & Gemüse, Kühlung, Basissortiment, Dessert, Wein & Getränke',
    '150 m² gesamt (15 × 10 m), davon ca. 125 m² Verkaufsfläche; Showküche ca. 19 m², Lager und Spüle ca. 6 m²':
    'Verkaufsraum 15,8 × 12 m ≈ 190 m² (davon Showküche ca. 18 m²) + L-Lager ca. 49 m² + Personal/WC ca. 7 m²',
})
sub(N(4), {'Standort begründet Zielgruppe und Öffnungszeiten: Studierende und Berufstätige kommen mittags und nach Feierabend vorbei. Daraus folgen Live-Cooking in der Mittagspause und Kurse am Abend. Die Fläche von 150 m² ist so gewählt, dass Basissortiment, drei Kochwelten und eine kompakte Showküche Platz haben.':
    'Standort begründet Zielgruppe und Öffnungszeiten: Studierende und Berufstätige kommen mittags und nach Feierabend vorbei. Daraus folgen Live-Cooking in der Mittagspause und Kurse am Abend. Der Verkaufsraum hat rund 190 m²; dazu kommt ein L-förmiges Lager hinten und rechts, aus dem die Kühlung von hinten befüllt wird.'})

# ---------- Folie 5: Wirtschaftlichkeit ----------
sub(S(5), {
    'Kapazität der Showküche: ab 4 Belegungen pro Woche trägt sie sich.': 'Kapazität der Showküche: ab rund 3 Belegungen pro Woche trägt sie sich.',
    'Alle Werte sind Fallannahmen. Vergleich Kochhaus Berlin 2010: 250 Kunden/Tag, Ø-Bon 20 € (Lebensmittelpraxis, 16.12.2010) – unsere Frequenz ist bewusst vorsichtiger. Nicht enthalten: Investition Küche, Personal, Energie.':
    'Alle Werte sind Fallannahmen. Vergleich Kochhaus Berlin 2010: 250 Kunden/Tag, Ø-Bon 20 € (Lebensmittelpraxis, 16.12.2010 ◐) – unsere Frequenz ist bewusst vorsichtiger. Nicht enthalten: Investition Küche, Personal, Energie.',
    '110 Kunden/Tag × 24 € × 300 Tage = 792.000 €': '140 Kunden/Tag × 24 € × 300 Tage = 1.008.000 €',
    '792.000 € ÷ 125 m² ≈ 6.330 € je m² Verkaufsfläche': '1.008.000 € ÷ 172 m² ≈ 5.860 € je m² (190 m² ohne Showküche)',
    '19,3 m² Showküche × 6.330 € ≈ 122.000 €': '18 m² Showküche × 5.860 € ≈ 105.500 €',
    '≈ 36.700 € pro Jahr': '≈ 31.600 € pro Jahr',
    'Mindestauslastung ≈ 3,1 Belegungen': 'Mindestauslastung ≈ 2,7 Belegungen',
    '36.700 € ÷ (7 × 59 € × 60 % × 48 Wochen). Wir planen daher mit mindestens 4 Belegungen pro Woche.': '31.600 € ÷ (7 × 59 € × 60 % × 48 Wochen). Wir planen daher mit mindestens 4 Belegungen pro Woche.',
})
sub(N(5), {'Als wirtschaftliche Größe wählen wir die Kapazität der Showküche, weil sie unseren größten Zielkonflikt beantwortet: Fläche für Erlebnis statt für Ware. Wir vergleichen nicht Umsatz mit Umsatz, sondern Rohertrag der Ware mit dem Deckungsbeitrag der Kurse. Aussagegrenze: Investition und weitere Kosten sind nicht enthalten, alle Werte sind Annahmen. Frage aus der Prüfung vorwegnehmen: Warum 150 m²? Weil darunter die Showküche mehr als ein Sechstel der Fläche kosten würde.':
    'Als wirtschaftliche Größe wählen wir die Kapazität der Showküche, weil sie unseren größten Zielkonflikt beantwortet: Fläche für Erlebnis statt für Ware. Wir vergleichen nicht Umsatz mit Umsatz, sondern Rohertrag der Ware mit dem Deckungsbeitrag der Kurse. Die Showküche belegt rund 18 von 190 m², also knapp ein Zehntel. Aussagegrenze: Investition und weitere Kosten sind nicht enthalten, alle Werte sind Annahmen.'})

# ---------- Folie 6: Grundriss → Bild aus dem 3D-Modell ----------
p6 = os.path.join(UN, S(6))
t = etree.parse(p6)
tree = t.find('.//p:spTree', NS)
kids = list(tree)
for el in kids[8:82 + 1 - 1 + 7]:  # Planformen (8–81) und alte Legende (82–88)
    pass
remove = [el for i, el in enumerate(kids) if 8 <= i <= 81]
for el in remove:
    tree.remove(el)
open(p6, 'wb').write(etree.tostring(t, xml_declaration=True, encoding='UTF-8', standalone=True))
sub(S(6), {
    'Grundriss: erst entscheiden, dann einkaufen.': 'Grundriss: erst entscheiden, dann im Rundlauf einkaufen.',
    'Schematischer Grundriss, 15 × 10 m. Positionen und Maße sind Fallannahmen. Layoutlogik vgl. Ahlert, Kenning und Brock, 2020, S. 297–302.':
    'Maßstäblicher Grundriss aus dem 3D-Modell: Verkaufsraum 15,8 × 12 m ≈ 190 m² + L-Lager. Positionen und Maße sind Fallannahmen. Layoutlogik vgl. Ahlert, Kenning und Brock, 2020, S. 297–302; Laufwege vgl. Larson et al. 2005.',
    'Rezeptweg: Präsenter → Koje → Frische → Getränke → Dessert → Kasse': 'Rezeptweg: Eingang → Dashboard → Obst & Gemüse → Rundlauf links → Kühlung → Dessert & Wein → Basis → Kasse',
    'Schnellweg: Eingang → Basissortiment → Kasse (Ziel ≤ 15 Min.)': 'Schnellweg: Eingang → Basissortiment längs → Kasse (Ziel ≤ 15 Min.)',
    'Blickachse: Eingang → Schnell-Tisch → Kochinsel': 'Blickachse: Eingang → Show-Kochtresen',
    'Entscheidungen im Plan': 'Gegenüber der Skizze optimiert',
    'Matrix-Präsenter schräg am Eingang': 'Eingang links, Ausgang rechts an der Kasse',
    'Kochwelten quer als Kojen': 'Dashboard leicht links, Blickachse frei',
    'Frische an der Rückwand': 'Kojen mit 1,4–1,5 m Gängen, Rundlauf links',
    'Showküche im Blick, Schnell-Tisch flach': 'Zuschauer vorn statt im hinteren Gang',
    'Basissortiment längs': 'Basis: Wandregal + Gondel, Gang 1,75 m',
    'Dessert direkt vor der Kasse': 'L-Lager: Kühlung wird von hinten befüllt',
})
# Bild einfügen
shutil.copy(PLAN, os.path.join(UN, 'ppt/media/grundriss-3d.png')) if os.path.isdir(os.path.join(UN, 'ppt/media')) else (os.makedirs(os.path.join(UN, 'ppt/media')), shutil.copy(PLAN, os.path.join(UN, 'ppt/media/grundriss-3d.png')))
rels = os.path.join(UN, 'ppt/slides/_rels/slide6.xml.rels')
r = open(rels).read()
r = r.replace('</Relationships>', '<Relationship Id="rIdPlan" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/grundriss-3d.png"/></Relationships>')
open(rels, 'w').write(r)
ct = os.path.join(UN, '[Content_Types].xml')
c = open(ct).read()
if 'Extension="png"' not in c:
    c = c.replace('<Default Extension="xml"', '<Default Extension="png" ContentType="image/png"/><Default Extension="xml"')
    open(ct, 'w').write(c)
from PIL import Image
w, h = Image.open(PLAN).size
H = 5.25
W = H * w / h
x0, y0 = 0.6 + (7.6 - W) / 2, 1.38
pic = f'''<p:pic xmlns:p="{NS['p']}" xmlns:a="{NS['a']}" xmlns:r="{NS['r']}"><p:nvPicPr><p:cNvPr id="900" name="Grundriss 3D-Modell" descr="Draufsicht des optimierten Grundrisses mit Zonen, Rezeptweg, Schnellweg und Blickachse"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rIdPlan"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="{int(x0*EMU)}" y="{int(y0*EMU)}"/><a:ext cx="{int(W*EMU)}" cy="{int(H*EMU)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>'''
x = open(p6, encoding='utf-8').read()
x = x.replace('</p:spTree>', pic + '</p:spTree>')
open(p6, 'w', encoding='utf-8').write(x)
sub(N(6), {'Den Plan von unten nach oben lesen. Direkt links nach dem Eingang steht schräg der Matrix-Präsenter: Hier fällt die Entscheidung. Er ist gedreht, damit die Blickachse über den flachen Schnell-Tisch zur Kochinsel frei bleibt. Zwei Wege: Der Rezeptweg (rot) führt vom Präsenter in die Koje der gewählten Küche, hinten an Frische und Getränken vorbei und rechts zur Kasse. Der Schnellweg (grün) geht direkt ins Basissortiment. Notausgang hinten rechts bleibt frei, der Gang davor ist mindestens 1,4 m breit.':
    'Den Plan von unten nach oben lesen. Wir betreten den Laden links durch den Eingang; nach etwa drei Metern steht das Matrix-Dashboard, leicht links, damit die Blickachse zur Showküche frei bleibt. Der Rezeptweg (rot) führt am schrägen Obst-und-Gemüse-Stand vorbei in den Rundlauf links, entlang der Kojen zur Kühlung an der Rückwand, weiter zu Dessert und Wein, durch das Basissortiment und zur Kasse direkt vor dem Ausgang. Der Schnellweg (grün gestrichelt) geht direkt ins Basissortiment. Das L-Lager liegt hinten und rechts: Anlieferung per Rolltor, die Kühlung wird von hinten befüllt. Der Notausgang liegt links und bleibt frei von Waren.'})

# ---------- Folie 7: sechs Layoutentscheidungen ----------
sub(S(7), {
    'Matrix-Präsenter am Eingang': 'Matrix-Dashboard am Eingang',
    'Die Entscheidung fällt direkt nach dem Eintreten. Schräg gestellt, damit die Achse zur Showküche frei bleibt.': 'Ca. 3 m nach dem Eingang: erst entscheiden, dann einkaufen. Je länger Kunden im Laden sind, desto zielgerichteter werden sie.',
    'Kundenlauf, Ahlert et al. 2020, S. 297–302': 'Hui et al. 2009 ✓; Ahlert et al. 2020, S. 297–302',
    'Querstehende Gondeln unterbrechen den Weg; jede ist wie der Präsenter in schnell, besonders und günstig geteilt.': 'Drei Gondeln mit 1,5 m Gängen; in jeder Koje die Rezept-Matrix, gegenüber die Ergänzungen.',
    'Frische an der Rückwand': 'Obst & Gemüse schräg am Eingang',
    'Kühlpflichtige Zutaten stehen auf fast jeder Rezeptkarte. Sie ziehen die Kundschaft in die Tiefe des Raums.': 'Frische Zutaten (O1) stehen auf fast jeder Karte. Der schräge Stand bremst und lenkt in den Rundlauf links.',
    'Frische als Zielartikel ist Fallannahme': 'Frische-Image ist Fallannahme',
    'Showküche zentral im Blick': 'Showküche, Zuschauer vorn',
    'Kochinsel als visueller Anker; davor nur ein flacher Schnell-Tisch (85 cm), damit die Achse frei bleibt.': 'Kochtresen als visueller Anker am Ende der Blickachse. Zuschauer stehen in der Übergangszone, nicht in den Gängen.',
    'Arena-/Kojen-Layout, S. 297–302': 'Arena-Prinzip, S. 297–302; Hui et al. 2009 ✓',
    'Wer gezielt Olivenöl sucht, findet es entlang des Gangs schnell. Das stützt den Schnellweg.': 'Wandregal plus Gondel, 1,75 m Gang: Wer gezielt Olivenöl sucht, findet es im Vorbeigehen.',
    'Dessert direkt vor der Kasse': 'Dessert & Wein nach der Frische',
    'Der Schritt „Ergänzen“ der Rezeptkarte liegt auf beiden Wegen direkt vor dem Bezahlen.': 'Erst „vernünftige“ Zutaten, dann Genuss: Studien zeigen diesen Licensing-Effekt. Dazu Impulsregal an der Kasse.',
    'Zusatzkauf ist beabsichtigt, nicht belegt': 'Hui et al. 2009 ✓ (Licensing)',
})
# Kennzeichnung der letzten Karte von A auf Q umstellen (Text „A“ im Kreis vor der Quelle)
x = open(os.path.join(UN, S(7)), encoding='utf-8').read()
i = x.index('<a:t>Hui et al. 2009 ✓ (Licensing)</a:t>')
j = x.rfind('<a:t>A</a:t>', 0, i)
x = x[:j] + '<a:t>Q</a:t>' + x[j + len('<a:t>A</a:t>'):]
open(os.path.join(UN, S(7)), 'w', encoding='utf-8').write(x)

# ---------- Folie 8: Flächenbilanz ----------
sub(S(8), {
    'Stellflächen aus dem schematischen Grundriss berechnet und gerundet; Aufteilung ist Fallannahme. Flächenarten vgl. Ahlert, Kenning und Brock, 2020, S. 297–302.':
    'Stellflächen aus dem maßstäblichen Grundriss (3D-Modell) berechnet und gerundet; nicht im Diagramm: Schaufenster 1,3 m², Impulsregal 0,6 m². Aufteilung ist Fallannahme. Flächenarten vgl. Ahlert, Kenning und Brock, 2020, S. 297–302.',
    '150 m²': '190 m²',
    'Das Basissortiment sichert die Frequenz, die Kochwelten das Profil. Beide Wege brauchen gleich viel Ware. Die großzügige Kundenfläche folgt aus Zuschauerbereich, Kojen und 1,4–1,6 m breiten Gängen.':
    'Das Basissortiment sichert die Frequenz, die Kochwelten das Profil. Die große Kundenfläche (ca. 70 %) folgt aus Übergangszone mit Dashboard, Zuschauerbereich und 1,4–1,75 m breiten Gängen.',
})
sub(N(8), {'Links die Flächenbilanz nach den vier Flächenarten aus Modul 3: Warenfläche, Kundenfläche, Erlebnis- bzw. Beratungszone und sonstige Fläche. Rechts die Raumzuteilung innerhalb der Warenfläche. Die Showküche ist mit rund 19 m² bewusst kompakter als in unserem ersten Entwurf, damit die Verkaufsfläche trägt.':
    'Links die Flächenbilanz des Verkaufsraums nach den Flächenarten aus Modul 3: Kundenfläche rund 133 m², Stellfläche der Warenträger rund 32 m², Showküche rund 18 m², Kassen und Dashboard rund 7 m². Rechts die Raumzuteilung innerhalb der Warenfläche. Vorbereitete Antwort: Die Kundenfläche ist bewusst groß, weil Übergangszone, Zuschauerbereich und breite Gänge zum Konzept gehören.'})

def chart(n, cats, vals):
    p = os.path.join(UN, f'ppt/charts/chart{n}.xml')
    x = open(p, encoding='utf-8').read()
    caches = re.findall(r'<c:strCache>.*?</c:strCache>', x)
    old_cat = caches[1]
    new_cat = f'<c:strCache><c:ptCount val="{len(cats)}"/>' + ''.join(f'<c:pt idx="{i}"><c:v>{escape(c)}</c:v></c:pt>' for i, c in enumerate(cats)) + '</c:strCache>'
    x = x.replace(old_cat, new_cat, 1)
    old_num = re.search(r'<c:numCache>.*?</c:numCache>', x).group(0)
    new_num = f'<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="{len(vals)}"/>' + ''.join(f'<c:pt idx="{i}"><c:v>{v}</c:v></c:pt>' for i, v in enumerate(vals)) + '</c:numCache>'
    x = x.replace(old_num, new_num, 1)
    open(p, 'w', encoding='utf-8').write(x)
    # eingebettete Tabelle mitziehen (damit „Daten bearbeiten“ in PowerPoint stimmt)
    rel = open(os.path.join(UN, f'ppt/charts/_rels/chart{n}.xml.rels')).read()
    target = re.search(r'Target="\.\./embeddings/([^"]+)"', rel).group(1)
    import openpyxl
    fp = os.path.join(UN, 'ppt/embeddings', target)
    wb = openpyxl.load_workbook(fp)
    ws = wb.active
    for i, (c, v) in enumerate(zip(cats, vals)):
        ws.cell(row=i + 2, column=1, value=c)
        ws.cell(row=i + 2, column=2, value=v)
    wb.save(fp)

chart(1, ['Rohertrag, wenn Regalfläche', 'DB Showküche (6 Belegungen)'], [31.6, 71.4])
chart(2, ['Kundenfläche', 'Warenträger', 'Showküche', 'Dashboard', 'Kassen'], [133, 32, 18, 1, 6])
chart(3, ['Kochwelten (3 Gondeln)', 'Basissortiment', 'Kühlung Frische', 'Obst & Gemüse', 'Wein & Getränke', 'Dessert / TK'], [8.3, 7.5, 5.8, 3.1, 2.9, 2.1])

# ---------- Folie 9/10/12: Präsenter → Dashboard ----------
sub(S(12), {'Tafel 2,0 m breit, schräg links neben dem Eingang. Die Matrix liegt zwischen 90 und 180 cm; die Zeile » schnell oben in der Sichtzone. Rückseite: Kursprogramm der Showküche.':
    'Dashboard 2,4 m breit, ca. 3 m hinter dem Eingang, leicht links der Blickachse. Die Matrix liegt zwischen 100 und 210 cm, darunter 9 Kartenspender. Rückseite: Kursprogramm der Showküche.'})

# ---------- Folie 13: Rezeptkarte – neue Fachcodes ----------
x = open(os.path.join(UN, S(13)), encoding='utf-8').read()
def code_after(x, label, new):
    i = x.index(f'<a:t>{escape(label)}</a:t>')
    m = re.compile(r'<a:t>([A-Z]\d)</a:t>').search(x, i)
    return x[:m.start()] + f'<a:t>{new}</a:t>' + x[m.end():]
for label, new in [('Sahne', 'K1'), ('Parmesan', 'K2'), ('Knoblauch, Basilikum', 'O1'), ('Olivenöl, Gewürze', 'B2'), ('+ Limonade', 'G3'), ('+ Cantuccini', 'W1')]:
    x = code_after(x, label, new)
open(os.path.join(UN, S(13)), 'w', encoding='utf-8').write(x)
sub(S(13), {'Fachcodes: W = Kochwelt · K = Kühlung · B = Basis · G = Getränke · D = Dessert': 'Fachcodes: O = Obst/Gemüse · W = Kochwelt · K = Kühlung · B = Basis · D = Dessert · G = Getränke',
            'Knoblauch, Basilikum': 'Knoblauch (Basilikum K6)'})

# ---------- Folie 14: Warenpräsentation ----------
sub(S(14), {
    'Fensterarten und Präsentationsmittel: Ahlert, Kenning und Brock, 2020, S. 303–306. Funktionen sind beabsichtigt, Wirkungen nicht belegt.':
    'Fensterarten und Präsentationsmittel: Ahlert, Kenning und Brock, 2020, S. 303–306 ✓. Querplatzierung: S. 300–301, Abb. 10.3 ✓. Funktionen sind beabsichtigt, Wirkungen nicht belegt.',
    'Matrix-Präsenter': 'Matrix-Dashboard',
    'Tafel mit 9 Rezepten, Kartenspender je Feld': 'Bildschirm mit 9 Rezepten, Kartenspender je Feld',
    'Schnell-Tisch': 'Obst & Gemüse schräg',
    'flacher Tisch mit Bundles „für 2“ der Zeile »': 'Marktstand mit Kisten, Preisstecker O1',
    'Sofortgriff für Eilige direkt auf der Achse, ohne den Blick zur Küche zu verstellen.': 'Frische Zutaten sofort im Blick; die schräge Stellung bremst und lenkt in den Rundlauf.',
    'Belegt nicht, dass der Warenkorb steigt.': 'Belegt nicht, dass das Frische-Image steigt.',
})

# ---------- Folie 15: Atmosphäre ----------
sub(S(15), {
    'Atmosphärische Gestaltungsmittel: Ahlert, Kenning und Brock, 2020, S. 303–306. Technische Lösungen sind Fallannahmen.':
    'Gestaltungsmittel: Ahlert, Kenning und Brock, 2020, S. 303–306 ✓. Licht: Summers/Hebert 2001 ◐; Duft: Chebat/Michon 2003 ◐, Spence et al. 2014 ◐; Umfeld: Baker et al. 2002 ◐. Technik ist Fallannahme.',
    'Live-Cooking zu festen Zeiten, Dunstabzug über der Kochinsel': 'Live-Cooking zu festen Zeiten, Dunstabzug über dem Kochtresen',
    'leise im Verkauf, Glasschirm am Tresen': 'leise im Verkauf, Kurse vorwiegend abends',
})

# ---------- Folie 16: Zielkonflikte ----------
sub(S(16), {
    'Kompakte Kochinsel mit 19 m²; wirtschaftlich ab 4 Belegungen pro Woche.': 'Kompakte Showküche mit ca. 18 m²; wirtschaftlich ab ca. 2,7 Belegungen pro Woche, geplant ≥ 4.',
    'Rezeptweg über Präsenter und Koje, Schnellweg direkt in die Basis; die Showküche ist Zusatz, kein Pflichtweg.': 'Rezeptweg als Rundlauf über Dashboard und Kojen, Schnellweg längs durch die Basis; die Showküche ist kein Pflichtweg.',
    'Geruch und Lärm': 'Zuschauer vs. Warenfluss',
    'Dunstabzug, Kurse vorwiegend abends, Glasschirm am Zuschauertresen.': 'Zuschauer stehen vorn in der Übergangszone, nicht in den Gängen (Hui et al. 2009).',
    'Küche als eigene Zone mit Spüle und Vorrat; getrennt von der Frischware im Verkauf.': 'Küche als eigene Zone mit Spüle und Vorrat; Dunstabzug gegen Geruch, getrennt von der Frischware.',
})

# ---------- Folie 17: Begründungskette ----------
sub(S(17), {
    'Q: Ahlert, Kenning und Brock, 2020, Kap. 10. A: Fallannahmen der Gruppe.': 'Q: Ahlert, Kenning und Brock, 2020, Kap. 10, ergänzt um Hui et al. 2009, Larson et al. 2005, Chandon et al. 2009, Summers/Hebert 2001. A: Fallannahmen der Gruppe.',
    'Präsenter': 'Dashboard',
    'vgl. Kreuzblock, S. 303': 'S. 303; Hui 2009',
    'S. 297–302': 'S. 297–302; Larson 2005',
    'S. 300–303': 'S. 300–303; Chandon 2009',
    'Karte, Schnell-Tisch, Fenster': 'Karte, Obst-Stand, Fenster',
})
x = open(os.path.join(UN, S(17)), encoding='utf-8').read()
i = x.index('<a:t>Licht, Geruch, Material</a:t>')
j = x.index('<a:t>S. 303–306</a:t>', i)
x = x[:j] + '<a:t>S. 303–306; Summers 2001</a:t>' + x[j + len('<a:t>S. 303–306</a:t>'):]
open(os.path.join(UN, S(17)), 'w', encoding='utf-8').write(x)

# ---------- Folie 18: Quellen ----------
sub(S(18), {
    'Larson, J. S.; Bradlow, E. T.; Fader, P. S. (2005)': 'Kundenlauf: Larson et al. (2005) ✓; Hui et al. (2009) ✓',
    'An exploratory look at supermarket shopping paths. International Journal of Research in Marketing, 22(4), 395–414.':
    'Larson/Bradlow/Fader: An exploratory look at supermarket shopping paths. IJRM 22(4), 395–414 · Hui/Bradlow/Fader: Testing Behavioral Hypotheses … Grocery Store Shopping Path. J. of Consumer Research 36(3), 478–493.',
    'Luhmann, N. (1984)': 'Regal & Atmosphäre: Chandon et al. (2009) ✓; Summers/Hebert (2001), Chebat/Michon (2003), Spence et al. (2014), Baker et al. (2002) ◐',
    'Soziale Systeme. Grundriß einer allgemeinen Theorie. Frankfurt am Main: Suhrkamp, S. 63 (über das Seminarskript HD25A23).':
    'J. of Marketing 73(6), 1–17 · JBR 54(2), 145–150 · JBR 56(7), 529–539 · Psychology & Marketing 31(7), 472–488 · J. of Marketing 66(2), 120–141. Außerdem Scheuch (2001), der markt 40(2–3) ◐; Inman/Nikolova (2017), J. of Retailing 93(1) ◐.',
    'Schulz, S. (2010); Meyer, L. (2019)': 'Luhmann (1984) ✓; Schulz (2010) ◐; Meyer (2019) ✓',
    'Das begehbare Rezeptbuch. Lebensmittelpraxis, 16.12.2010 · Kochhaus meldet Insolvenz an. Tagesspiegel, 28.03.2019.':
    'Soziale Systeme, Suhrkamp, S. 63 (über das Seminarskript) · Das begehbare Rezeptbuch, Lebensmittelpraxis, 16.12.2010 · Kochhaus meldet Insolvenz an, Tagesspiegel, 28.03.2019.',
    'Die Einteilung folgt dem Schema aus Modul 7: Quellenwissen · gekennzeichnete Fallannahme · eigene Entscheidung · Aussagegrenze.':
    'Schema aus Modul 7: Quellenwissen · Fallannahme · Entscheidung · Aussagegrenze. ✓ = an Skript/Abstract geprüft, ◐ = Fundstelle im Volltext prüfen.',
})

# ---------- Folie 19: Fazit ----------
sub(S(19), {'Matrix-Präsenter, Basissortiment längs, Schnellweg': 'Matrix-Dashboard, Basissortiment längs, Schnellweg'})
print('fertig')

# ---------- Feinschliff nach der Sichtprüfung ----------
sub(S(5), {'Kapazität der Showküche: ab rund 3 Belegungen pro Woche trägt sie sich.': 'Showküche: ab rund 3 Belegungen pro Woche trägt sie sich.'})
c1 = os.path.join(UN, 'ppt/charts/chart1.xml')
x = open(c1, encoding='utf-8').read().replace('19,3 m²', '18 m²')
open(c1, 'w', encoding='utf-8').write(x)
sub(S(18), {
    'Larson/Bradlow/Fader: An exploratory look at supermarket shopping paths. IJRM 22(4), 395–414 · Hui/Bradlow/Fader: Testing Behavioral Hypotheses … Grocery Store Shopping Path. J. of Consumer Research 36(3), 478–493.':
    'Int. Journal of Research in Marketing 22(4), 395–414 · Journal of Consumer Research 36(3), 478–493.',
    'Regal & Atmosphäre: Chandon et al. (2009) ✓; Summers/Hebert (2001), Chebat/Michon (2003), Spence et al. (2014), Baker et al. (2002) ◐':
    'Regal & Atmosphäre: Chandon et al. (2009) ✓ und weitere ◐',
    'J. of Marketing 73(6), 1–17 · JBR 54(2), 145–150 · JBR 56(7), 529–539 · Psychology & Marketing 31(7), 472–488 · J. of Marketing 66(2), 120–141. Außerdem Scheuch (2001), der markt 40(2–3) ◐; Inman/Nikolova (2017), J. of Retailing 93(1) ◐.':
    'J. of Marketing 73(6), 1–17 · Summers/Hebert 2001, Chebat/Michon 2003, Spence et al. 2014, Baker et al. 2002, Scheuch 2001, Inman/Nikolova 2017.',
    'Soziale Systeme, Suhrkamp, S. 63 (über das Seminarskript) · Das begehbare Rezeptbuch, Lebensmittelpraxis, 16.12.2010 · Kochhaus meldet Insolvenz an, Tagesspiegel, 28.03.2019.':
    'Soziale Systeme, S. 63 (über das Skript) · Lebensmittelpraxis 16.12.2010 · Tagesspiegel 28.03.2019.',
})
sub(S(2), {'Matrix-Präsenter am Eingang': 'Matrix-Dashboard am Eingang'})
sub(S(9), {'Drei querstehende Gondeln bilden Kojen; jede ist eine Spalte des Präsenters.': 'Drei querstehende Gondeln bilden Kojen; jede ist eine Spalte des Dashboards.'})
sub(S(10), {'Regalbild Pasta Night: der Präsenter, im Regal gespiegelt.': 'Regalbild Pasta Night: das Dashboard, im Regal gespiegelt.',
            'Jede Koje ist eine Spalte des Präsenters: dieselben drei Anlässe, Symbole und Rezeptnummern. Wer am Eingang gewählt hat, findet sein Feld sofort wieder.':
            'Jede Koje ist eine Spalte des Dashboards: dieselben drei Anlässe, Symbole und Rezeptnummern. Wer am Eingang gewählt hat, findet sein Feld sofort wieder.'})
sub(S(12), {'Der Matrix-Präsenter: Küche × Anlass = ein Rezept.': 'Das Matrix-Dashboard: Küche × Anlass = ein Rezept.',
            'Die Kundin hat schon eine Kaufabsicht. Der Präsenter bedient diese bestehende Kaufrelevanz und macht aus neun Rezepten zwei einfache Fragen.':
            'Die Kundin hat schon eine Kaufabsicht. Das Dashboard bedient diese bestehende Kaufrelevanz und macht aus neun Rezepten zwei einfache Fragen.'})
x = open(os.path.join(UN, S(19)), encoding='utf-8').read()
x = re.sub(r'<a:t>([^<]*)Dessert vor der Kasse([^<]*)</a:t>', lambda m: f'<a:t>{m.group(1)}Dessert & Wein nach der Frische{m.group(2)}</a:t>'.replace('&', '&amp;').replace('&amp;amp;', '&amp;'), x)
open(os.path.join(UN, S(19)), 'w', encoding='utf-8').write(x)
print('Feinschliff fertig')

# ---------- Keine fertigen Pakete: Zutaten werden nach Rezeptkarte gesammelt ----------
sub(S(10), {
    'Karte #01 Creamy Tomato Pasta + Bundle für 2': 'Karte #01 Creamy Tomato Pasta',
    'Rezeptkarten und Bundles stehen dort, wo Ware am leichtesten gesehen wird; schwere Gebinde in der Bückzone.': 'Rezeptkarten und ein Bild des Gerichts stehen dort, wo am leichtesten gesehen wird; schwere Gebinde in der Bückzone.',
})
sub(N(10), {'Das Regal der Pasta Night zeigt, wie der Präsenter im Laden weiterlebt. Jede Koje ist eine Spalte der Matrix, geteilt in günstig, besonders und schnell. Der Abschnitt schnell liegt am Regalkopf direkt am Hauptgang. Waagerecht bleiben die Regalzonen: oben die Anlass-Schilder, in der Sichtzone Rezeptkarten und Bundles, darunter die Zutaten. Kühlpflichtige Zutaten stehen nicht hier, dazu die nächste Folie.':
    'Das Regal der Pasta Night zeigt, wie das Dashboard im Laden weiterlebt. Jede Koje ist eine Spalte der Matrix, geteilt in günstig, besonders und schnell. Der Abschnitt schnell liegt am Regalkopf direkt am Gang. Waagerecht bleiben die Regalzonen: oben die Anlass-Schilder, in der Sichtzone Rezeptkarten und ein Bild des Gerichts, darunter die Zutaten. Es gibt keine fertigen Pakete: Die Kundin sammelt die Zutaten selbst anhand ihrer Karte. Kühlpflichtige Zutaten stehen nicht hier, dazu die nächste Folie.'})
print('ohne Bundles fertig')

# ---------- Regale klassisch nach Warengruppen (Produktblöcke) ----------
sub(S(10), {
    'Regalbild Pasta Night: das Dashboard, im Regal gespiegelt.': 'Regalbild Pasta Night: klassisch nach Warengruppen.',
    '€  Für den kleinen Geldbeutel': 'W1 · Nudeln',
    '★  Für besondere Abende': 'W1 · Tomaten & Saucen',
    '»  Wenn’s schnell gehen muss': 'W1 · Bohnen, Brühe & Gewürze',
    'Karte #03 Pasta e Fagioli, 3,20 € je Portion': 'Spaghetti, Penne, Ditalini 500 g',
    'Karte #02 Tagliatelle al Limone': 'Sugo, Tomatensauce, Passata',
    'Karte #01 Creamy Tomato Pasta': 'Borlotti, Cannellini, Brühe',
    'Pasta, Bohnen, Passata': 'Tagliatelle, Fusilli',
    'Tagliatelle, Zitronen, Tiramisu-Set': 'Pomodori gehackt, Pesto',
    'Pasta, Tomatensauce, Gewürze': 'Pasta-Gewürz, Zitronenpfeffer',
    'Großpackungen Pasta und Bohnen': 'Spaghetti 1 kg, Ditalini 1 kg',
    'Aperitivo alkoholfrei, Limonade': 'Sugo 680 g, Passata 1 kg',
    'Wasser, Getränke im 6er-Pack': 'Borlotti 800 g',
    '€ günstig': 'Nudeln',
    '★ besonders': 'Saucen',
    '» schnell': 'Bohnen & Brühe',
    'Hauptgang →': '← Karten am Regalkopf',
    'vertikal: Anlass · horizontal: Funktion der Zone': 'vertikal: Warengruppe (Produktblock) · horizontal: Regalzone',
    'Gespiegelte Matrix': 'Klassische Ordnung',
    'Jede Koje ist eine Spalte des Dashboards: dieselben drei Anlässe, Symbole und Rezeptnummern. Wer am Eingang gewählt hat, findet sein Feld sofort wieder.':
    'Pasta bei Pasta, Sauce bei Sauce: Die Kundin findet die Zutaten ihrer Rezeptkarte wie in jedem Supermarkt. Das Blockschild nennt, für welche Rezepte der Block gebraucht wird.',
    'Kreuzblock-Prinzip, S. 303': 'Produktblock, S. 303',
    '» schnell am Regalkopf': 'Rezeptkarten am Regalkopf',
    'Der Abschnitt für Eilige liegt direkt am Hauptgang. Wer schnell einkauft, muss nicht in die Koje hinein.': 'Am Gang stecken die Karten aller drei Rezepte der Kochwelt; der Fachcode W1 führt in diese Koje.',
    'Sichtzone für die Karte': 'Zonen nach Gewicht',
    'Rezeptkarten und ein Bild des Gerichts stehen dort, wo am leichtesten gesehen wird; schwere Gebinde in der Bückzone.': 'Standardgrößen in Sicht- und Greifzone, Großpackungen in der Bückzone.',
})
x = open(os.path.join(UN, S(10)), encoding='utf-8').read()
open(os.path.join(UN, S(10)), 'w', encoding='utf-8').write(x)
sub(N(10), {'Das Regal der Pasta Night zeigt, wie das Dashboard im Laden weiterlebt. Jede Koje ist eine Spalte der Matrix, geteilt in günstig, besonders und schnell. Der Abschnitt schnell liegt am Regalkopf direkt am Gang. Waagerecht bleiben die Regalzonen: oben die Anlass-Schilder, in der Sichtzone Rezeptkarten und ein Bild des Gerichts, darunter die Zutaten. Es gibt keine fertigen Pakete: Die Kundin sammelt die Zutaten selbst anhand ihrer Karte. Kühlpflichtige Zutaten stehen nicht hier, dazu die nächste Folie.':
    'Das Regal der Pasta Night ist aufgebaut wie im klassischen Supermarkt: Nudeln bei Nudeln, Saucen bei Saucen, Bohnen und Brühe daneben, jeweils als senkrechter Produktblock. Die Kundin sammelt die Zutaten selbst anhand ihrer Rezeptkarte: Fachcode W1 führt in die Koje, das Blockschild zeigt, für welche Rezepte der Block gebraucht wird. Standardgrößen in Sicht- und Greifzone, Großpackungen unten. Kühlpflichtige Zutaten stehen nicht hier, dazu die nächste Folie.'})
sub(S(9), {'Drei querstehende Gondeln bilden Kojen; jede ist eine Spalte des Dashboards.': 'Drei querstehende Gondeln bilden Kojen, je eine Kochwelt; innen nach Warengruppen sortiert.'})
x = open(os.path.join(UN, S(13)), encoding='utf-8').read()
x = x.replace('<a:t>Koje, Spalte »</a:t>', '<a:t>Koje per Fachcode</a:t>')
open(os.path.join(UN, S(13)), 'w', encoding='utf-8').write(x)
print('Produktblöcke fertig')
