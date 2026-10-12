# One Hour Kitchen – begehbarer 3D-Store

Prüfungsprojekt Store Layout (Kurs HD25A23, DHBW Heilbronn, Prüfung 19.10.2026). Begehbarer 3D-Prototyp des Food-Stores „One Hour Kitchen“: Verkaufsraum 15,8 × 12 m ≈ 190 m² plus L-Lager. Die Präsentation steckt im Modell selbst: Folien, 12 Stationen mit Infokarten (Entscheidung · Begründung · Quelle · Annahme · Änderung ggü. Skizze), Kundensimulation und ein Einkaufs-Spiel.

Technik-Basis: die Engine aus „Rille 33“ (Three.js), angepasst. Eine einzige HTML-Datei, läuft offline per Doppelklick.

## Steuerung

| Aktion | PS5-Controller | Tastatur/Maus | Touch (iPad) |
|---|---|---|---|
| Laufen / Umsehen | linker / rechter Stick | WASD / Maus | Joystick / Wischen |
| Schneller gehen | R2 | Shift | „Schnell“ |
| Ego ↔ Draufsicht | Dreieck | T | „Ansicht“ |
| Wege (Rezeptweg, Schnellweg, Blickachse) | Kreis | H | „Weg“ |
| Zonen & Beschriftungen | Quadrat | Z | „Zonen“ |
| Regalzonen (Reck/Sicht/Greif/Bück) an allen Regalen | L3 | R | „Regal“ |
| Infokarte / Tür / Einkauf-Aktion | X | E | „Info“ oder Hinweis antippen |
| Präsentationsmodus | Options | P | „Präs.“ |
| Nächste / vorige Folie | R1 / L1 | → / ←, Leertaste, Bild ↓ / ↑ (Presenter), Klick ins Bild | „Weiter“ / „Zurück“, Leiste unten |
| Sprechernotizen · Folienübersicht | – | N · O | Leiste unten |
| Referentenansicht (2. Fenster) · Vollbild | – | V · F | Leiste unten |
| Erste / letzte Folie · beenden | – | Pos1 / Ende · Esc | ✕ in der Leiste |
| Einkaufs-Spiel | Steuerkreuz rechts | G | „Einkauf“ |
| Kundensimulation | Steuerkreuz oben | K | „Sim.“ |
| Rahmen-Overlay | Create | I | „Rahmen“ |
| Draufsicht als PNG | R3 | B | „PNG“ |

## Präsentation (20 Minuten) – ersetzt die PowerPoint
Alle 19 Folien der PowerPoint stecken als Folien im Modell (Tabellen, Diagramm, Matrix, Rezeptkarte, Parmesan-Regel, Begründungskette …), dazwischen die 12 Stationen des Rundgangs – 32 Schritte plus eine Backup-Folie für die Fragerunde. Jede Folie fliegt zum passenden Ort im Laden und schaltet die Ebenen (Zonen, Wege, Regalzonen) selbst.

- **Leiste unten:** Kapitel mit Fortschritt (Punkte anklickbar), Folienzähler, Timer mit Ziel 20:00 (wird 2 Min. vorher orange, danach rot; Klick setzt zurück).
- **Notizen (N):** Sprechernotizen aus der PowerPoint, für Stationen eigene Notizen.
- **Übersicht (O):** alle Folien nach Kapiteln, Klick springt hin – praktisch in der Fragerunde.
- **Referentenansicht (V):** öffnet ein zweites Fenster mit aktueller Folie, Notizen, nächster Folie und Timer. Dieses Fenster auf den Laptop, das Hauptfenster (F = Vollbild) auf den Beamer; Weiter/Zurück im Referentenfenster steuert den Beamer. Wird das Fenster blockiert, erscheinen die Notizen im Hauptfenster.
- **Clicker:** Presenter mit Bild ↑/↓ funktionieren direkt.
- Info/X blendet die Folie aus, damit man frei auf den Laden schaut. Folien passen sich der Bildschirmgröße an (Beamer 1080p wie Laptop).

Kennzeichnung der Quellen: ✓ = Inhalt an Seminarskript bzw. Abstract geprüft, ◐ = Fundstelle vor der Prüfung im Volltext prüfen. „Annahme“ = gekennzeichnete Fallannahme (Schema Modul 7).

## Einkaufs-Spiel
Am Matrix-Dashboard X/E drücken (oder „Einkauf“) → Küche × Anlass wählen → leuchtende Marker zeigen die Fachcodes der Rezeptkarte (O, W, K, B, D, G) → an jedem Marker X/E → an der Kasse bezahlen → Bon mit One-Hour-Check.

## Inhalte ändern
Alles steht in `src/layout.json`: Raum, Zonen, Möbel, Wege, Rezepte, Stationen, Folien (`praesentation.folien`, Reihenfolge und Kapitel in `praesentation.ablauf`, Sprechernotizen in `notizen`), Regalzonen (`regalzonen.belegung` = Inhalt je Zone und Regalfront), Simulation. Koordinaten in Metern, Ursprung vorne links von der Straße aus, Rechtecke `[x1, x2, z1, z2]`.

## Bauen
```
bun scripts/build.mjs        # → dist/index.html (eine Datei, offline)
node scripts/shot.mjs "?pos=7.1,0.6,0" bild.png   # Screenshot-Test
```
three.js r180 liegt in `vendor/three` (MIT-Lizenz), es wird kein npm gebraucht. Jeder Push auf `main` baut und veröffentlicht über GitHub Pages (`.github/workflows/deploy.yml`).

URL-Parameter: `?pos=x,z,blickGrad`, `?fps=1`, `?licht=einfach`, `?debug`.
