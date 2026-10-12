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
| Regalzonen (Reck/Sicht/Greif/Bück) | L3 | R | „Regal“ |
| Infokarte / Tür / Einkauf-Aktion | X | E | „Info“ oder Hinweis antippen |
| Präsentationsmodus | Options | P | „Präs.“ |
| Nächste / vorige Folie | R1 / L1 | → / ← | „Weiter“ / „Zurück“ |
| Einkaufs-Spiel | Steuerkreuz rechts | G | „Einkauf“ |
| Kundensimulation | Steuerkreuz oben | K | „Sim.“ |
| Rahmen-Overlay | Create | I | „Rahmen“ |
| Draufsicht als PNG | R3 | B | „PNG“ |

## Präsentation (20 Minuten)
23 Schritte: Titel → Kundenproblem → Wettbewerb → Rahmen → Wirtschaftlichkeit → Grundriss (Draufsicht) → 8 Optimierungen gegenüber der Skizze → Stationen 1–12 → Flächenbilanz (automatisch aus dem Grundriss berechnet) → Zielkonflikte → Fazit → Quellen. Info/X blendet die Folie aus, damit man frei auf den Laden schaut. Jede Folie schaltet die passenden Ebenen (Zonen, Wege, Regalzonen) selbst.

Kennzeichnung der Quellen: ✓ = Inhalt an Seminarskript bzw. Abstract geprüft, ◐ = Fundstelle vor der Prüfung im Volltext prüfen. „Annahme“ = gekennzeichnete Fallannahme (Schema Modul 7).

## Einkaufs-Spiel
Am Matrix-Dashboard X/E drücken (oder „Einkauf“) → Küche × Anlass wählen → leuchtende Marker zeigen die Fachcodes der Rezeptkarte (O, W, K, B, D, G) → an jedem Marker X/E → an der Kasse bezahlen → Bon mit One-Hour-Check.

## Inhalte ändern
Alles steht in `src/layout.json`: Raum, Zonen, Möbel, Wege, Rezepte, Stationen, Folien (`praesentation.folien`, Reihenfolge in `praesentation.ablauf`), Simulation. Koordinaten in Metern, Ursprung vorne links von der Straße aus, Rechtecke `[x1, x2, z1, z2]`.

## Bauen
```
bun scripts/build.mjs        # → dist/index.html (eine Datei, offline)
node scripts/shot.mjs "?pos=7.1,0.6,0" bild.png   # Screenshot-Test
```
three.js r180 liegt in `vendor/three` (MIT-Lizenz), es wird kein npm gebraucht. Jeder Push auf `main` baut und veröffentlicht über GitHub Pages (`.github/workflows/deploy.yml`).

URL-Parameter: `?pos=x,z,blickGrad`, `?fps=1`, `?licht=einfach`, `?debug`.
