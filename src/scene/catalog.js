// Sortiment im Regal: realistische Verpackungsgrößen (m), Farben und Preise (€). Alle Marken sind fiktiv.
// P(form, [Breite, Höhe, Tiefe], Grundfarbe, Akzent, Marke, Produkt, Inhalt/Zusatz, Preis, { f: Facings })
// form: packung | beutel | schale | tetra | tafel | glas | dose | becher | flasche | oel | wein
export const BRANDS = {
  'Nonna Lia': { st: 'premium', serif: true },
  'Casa Verde': { st: 'feinkost', serif: true },
  'Forno Lia': { st: 'feinkost', serif: true },
  'Pomodoro Rossa': { st: 'klassik' },
  'Basis+': { st: 'eigen' },
  Grünwerk: { st: 'bio' },
  Kochwerk: { st: 'gewuerz' },
  Kaizen: { st: 'asia' },
  'Umami Lab': { st: 'asia' },
  'La Milpa': { st: 'mex' },
  'Sol & Maíz': { st: 'mex' },
  'Hof Neckar': { st: 'regional' },
  Nordküste: { st: 'regional' },
  'Gelato Lia': { st: 'feinkost', serif: true },
  Kakaowerk: { st: 'klassik' },
  Limonata: { st: 'drink' },
  Neckarquelle: { st: 'drink' },
  Neckarbräu: { st: 'drink' },
  'Weingut Neckar': { st: 'wein' },
  'Cantina Sole': { st: 'wein' },
  'Bodega Luz': { st: 'wein' },
};

const P = (form, m, c, a, b, n, s, pr, o = {}) => ({ form, m, c, a, b, n, s, pr, ...o });

// Häufige Größen
const NUDEL_LANG = [0.075, 0.27, 0.035];
const NUDEL_KURZ = [0.12, 0.19, 0.06];
const DOSE = [0.074, 0.11, 0.074];
const DOSE_GROSS = [0.1, 0.12, 0.1];
const DOSE_KLEIN = [0.066, 0.08, 0.066];
const GLAS_SAUCE = [0.075, 0.125, 0.075];
const GLAS_KLEIN = [0.065, 0.09, 0.065];
const GEWUERZ = [0.045, 0.1, 0.045];
const DRINK = [0.065, 0.24, 0.065];
const WEIN = [0.075, 0.31, 0.075];

export const CATALOG = {
  // ================= Kochwelt Pasta (W1) =================
  PA_NUDELN: [
    P('packung', NUDEL_LANG, '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Spaghetti', 'n. 5 · 500 g', 1.79, { f: 4 }),
    P('packung', NUDEL_LANG, '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Linguine', '500 g', 1.79),
    P('packung', NUDEL_KURZ, '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Penne rigate', '500 g', 1.79, { f: 3 }),
    P('packung', NUDEL_KURZ, '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Fusilli', '500 g', 1.79),
    P('packung', [0.12, 0.17, 0.06], '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Ditalini', '500 g', 1.79),
    P('packung', [0.13, 0.16, 0.07], '#efe4c6', '#7b2d26', 'Forno Lia', 'Tagliatelle', 'all’uovo · 250 g', 2.49),
    P('beutel', [0.1, 0.27, 0.035], '#f3f0e8', '#b9472f', 'Basis+', 'Spaghetti', '500 g', 0.89, { f: 4 }),
    P('beutel', [0.14, 0.21, 0.06], '#f3f0e8', '#b9472f', 'Basis+', 'Penne', '500 g', 0.89),
    P('packung', NUDEL_LANG, '#d8c7a2', '#3f6b3a', 'Grünwerk', 'Vollkorn-Spaghetti', 'Bio · 500 g', 1.99),
  ],
  PA_NUDELN_B: [
    P('packung', [0.09, 0.3, 0.045], '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Spaghetti', '1 kg', 3.29),
    P('beutel', [0.16, 0.26, 0.08], '#f3f0e8', '#b9472f', 'Basis+', 'Penne', '1 kg', 1.69),
    P('packung', [0.15, 0.24, 0.07], '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Ditalini', '1 kg', 3.29),
    P('beutel', [0.11, 0.31, 0.05], '#f3f0e8', '#b9472f', 'Basis+', 'Spaghetti', '1 kg', 1.69),
  ],
  PA_SAUCE: [
    P('glas', GLAS_SAUCE, '#f1e7d0', '#a8342b', 'Casa Verde', 'Sugo al Pomodoro', '400 g', 2.29, { f: 4 }),
    P('glas', GLAS_SAUCE, '#f1e7d0', '#7f2620', 'Casa Verde', 'Arrabbiata', '400 g', 2.29),
    P('glas', GLAS_SAUCE, '#f1e7d0', '#4c6b3a', 'Casa Verde', 'Tomatensauce', 'Basilico · 400 g', 2.29, { f: 4 }),
    P('tetra', [0.065, 0.16, 0.05], '#9c2f27', '#f1e7d0', 'Pomodoro Rossa', 'Passata', '500 g', 1.19, { f: 4 }),
    P('dose', DOSE, '#9c2f27', '#e9d9a6', 'Pomodoro Rossa', 'Pomodori', 'gehackt · 400 g', 0.99),
    P('packung', [0.05, 0.16, 0.035], '#9c2f27', '#f1e7d0', 'Pomodoro Rossa', 'Tomatenmark', '200 g', 0.89),
    P('glas', GLAS_KLEIN, '#f1e7d0', '#3d5e2e', 'Casa Verde', 'Pesto Genovese', '190 g', 2.79),
    P('glas', GLAS_KLEIN, '#f1e7d0', '#8f2a22', 'Casa Verde', 'Pesto Rosso', '190 g', 2.79),
    P('glas', GLAS_SAUCE, '#f3f0e8', '#b9472f', 'Basis+', 'Tomatensauce', 'klassisch · 500 g', 0.99),
  ],
  PA_SAUCE_B: [
    P('glas', [0.08, 0.21, 0.08], '#9c2f27', '#f1e7d0', 'Pomodoro Rossa', 'Passata', 'Flasche · 700 g', 1.49),
    P('dose', DOSE_GROSS, '#f3f0e8', '#b9472f', 'Basis+', 'Pomodori', 'gehackt · 800 g', 1.29),
    P('glas', [0.09, 0.16, 0.09], '#f1e7d0', '#a8342b', 'Casa Verde', 'Sugo al Pomodoro', '680 g', 3.49),
  ],
  PA_BOHNEN: [
    P('dose', DOSE, '#f1e7d0', '#7c5a3a', 'Nonna Lia', 'Borlotti', '400 g', 1.19, { f: 4 }),
    P('dose', DOSE, '#f1e7d0', '#3f6b3a', 'Nonna Lia', 'Cannellini', '400 g', 1.19),
    P('dose', DOSE, '#f1e7d0', '#a5823f', 'Nonna Lia', 'Kichererbsen', '400 g', 1.19),
    P('packung', [0.1, 0.11, 0.05], '#d9a93a', '#2b2c30', 'Kochwerk', 'Gemüsebrühe', '8 Würfel', 1.29),
    P('glas', GEWUERZ, '#2b2c30', '#c9a227', 'Kochwerk', 'Pasta-Gewürz', '40 g', 2.49),
    P('glas', GEWUERZ, '#2b2c30', '#6b7a3a', 'Kochwerk', 'Oregano', '15 g', 1.99),
    P('glas', GEWUERZ, '#2b2c30', '#d6c04a', 'Kochwerk', 'Zitronenpfeffer', '50 g', 2.29),
  ],
  PA_BOHNEN_B: [
    P('dose', [0.1, 0.15, 0.1], '#f1e7d0', '#7c5a3a', 'Nonna Lia', 'Borlotti', '800 g', 1.99),
    P('dose', [0.1, 0.15, 0.1], '#f3f0e8', '#b9472f', 'Basis+', 'Weiße Bohnen', '800 g', 1.29),
    P('glas', [0.1, 0.14, 0.1], '#d9a93a', '#2b2c30', 'Kochwerk', 'Gemüsebrühe', 'Glas · 500 g', 4.49),
  ],
  PA_FEIN: [
    P('glas', [0.075, 0.11, 0.075], '#f1e7d0', '#4b5a2a', 'Casa Verde', 'Oliven Taggiasca', '180 g', 3.99),
    P('glas', [0.075, 0.12, 0.075], '#f1e7d0', '#7f2a20', 'Casa Verde', 'Tomaten', 'getrocknet · 280 g', 3.49),
    P('glas', [0.075, 0.12, 0.075], '#f1e7d0', '#6b7a3a', 'Casa Verde', 'Artischocken', '280 g', 3.79),
    P('oel', [0.06, 0.28, 0.06], '#2e4a22', '#e3d3a4', 'Casa Verde', 'Olivenöl', 'extra vergine · 500 ml', 7.99),
    P('flasche', [0.055, 0.24, 0.055], '#2b1a17', '#e3d3a4', 'Casa Verde', 'Aceto Balsamico', 'di Modena · 250 ml', 3.99),
    P('glas', GLAS_KLEIN, '#f1e7d0', '#55663a', 'Casa Verde', 'Kapern', '100 g', 1.99),
  ],
  PA_FEIN_B: [
    P('oel', [0.08, 0.3, 0.08], '#2e4a22', '#e3d3a4', 'Casa Verde', 'Olivenöl', 'extra vergine · 1 l', 12.99),
    P('glas', [0.09, 0.15, 0.09], '#f1e7d0', '#4b5a2a', 'Casa Verde', 'Oliven', 'grün · 500 g', 5.49),
  ],
  PA_BROT: [
    P('packung', [0.14, 0.24, 0.05], '#e8dcbf', '#7a3b1e', 'Forno Lia', 'Grissini', 'Rosmarin · 125 g', 1.99),
    P('beutel', [0.16, 0.26, 0.07], '#e8dcbf', '#a8342b', 'Forno Lia', 'Ciabatta', 'zum Aufbacken · 2 St.', 1.79),
    P('beutel', [0.13, 0.2, 0.05], '#e8dcbf', '#5d6b3a', 'Forno Lia', 'Taralli', 'Fenchel · 250 g', 2.29),
    P('beutel', [0.16, 0.24, 0.05], '#e8dcbf', '#7a3b1e', 'Forno Lia', 'Focaccia', 'Rosmarin · 300 g', 2.99),
  ],
  PA_SUESS: [
    P('beutel', [0.13, 0.2, 0.05], '#e8dcbf', '#7a3b1e', 'Forno Lia', 'Cantuccini', 'Mandel · 200 g', 2.49, { f: 4 }),
    P('beutel', [0.13, 0.2, 0.05], '#e8dcbf', '#a8342b', 'Forno Lia', 'Amaretti', '200 g', 2.49),
    P('packung', [0.2, 0.08, 0.13], '#efe4c6', '#5d3a1a', 'Forno Lia', 'Savoiardi', 'Löffelbiskuits · 200 g', 1.69),
    P('packung', [0.09, 0.15, 0.06], '#2b211c', '#c9a227', 'Nonna Lia', 'Espresso', 'gemahlen · 250 g', 4.49),
    P('dose', [0.08, 0.12, 0.08], '#5d3a1a', '#e3d3a4', 'Kakaowerk', 'Kakao', 'ungesüßt · 250 g', 2.99),
  ],
  PA_DRINK: [
    P('flasche', DRINK, '#d9bf45', '#1e3d6e', 'Limonata', 'Limone', '0,5 l', 1.29, { f: 4 }),
    P('flasche', DRINK, '#d9873a', '#1e3d6e', 'Limonata', 'Aranciata', '0,5 l', 1.29),
    P('flasche', [0.07, 0.26, 0.07], '#a8342b', '#f1e7d0', 'Casa Verde', 'Aperitivo', 'alkoholfrei · 0,7 l', 6.99),
    P('flasche', [0.075, 0.29, 0.075], '#5e8aa6', '#f3f0e8', 'Neckarquelle', 'Mineralwasser', 'still · 0,75 l', 0.69),
  ],
  // ================= Kochwelt Asian (W2) =================
  AS_NUDELN: [
    P('packung', [0.11, 0.18, 0.05], '#f3f0e8', '#b8322a', 'Kaizen', 'Udon', '3 × 200 g', 2.99, { f: 4 }),
    P('beutel', [0.13, 0.19, 0.05], '#1f2120', '#c9a227', 'Umami Lab', 'Ramen', 'Weizennudeln · 4 × 70 g', 2.49, { f: 4 }),
    P('packung', [0.11, 0.18, 0.05], '#f3f0e8', '#3f6b3a', 'Kaizen', 'Reisnudeln', '250 g', 1.99),
    P('packung', [0.09, 0.22, 0.04], '#c9b089', '#2b2c30', 'Kaizen', 'Soba', 'Buchweizen · 300 g', 2.79),
    P('packung', [0.11, 0.18, 0.05], '#1f2120', '#c9a227', 'Umami Lab', 'Mie-Nudeln', '250 g', 1.49),
  ],
  AS_NUDELN_B: [P('packung', [0.14, 0.22, 0.07], '#f3f0e8', '#b8322a', 'Kaizen', 'Udon', '6 × 200 g', 5.49), P('packung', [0.14, 0.22, 0.07], '#1f2120', '#c9a227', 'Umami Lab', 'Mie-Nudeln', '500 g', 2.69)],
  AS_REIS: [
    P('beutel', [0.13, 0.2, 0.06], '#f3f0e8', '#3f6b3a', 'Kaizen', 'Jasminreis', '1 kg', 2.99, { f: 4 }),
    P('beutel', [0.12, 0.18, 0.05], '#f3f0e8', '#b8322a', 'Kaizen', 'Sushireis', '500 g', 2.49),
    P('dose', [0.074, 0.12, 0.074], '#f3f0e8', '#3f6b3a', 'Umami Lab', 'Kokosmilch', '400 ml', 1.79, { f: 4 }),
    P('beutel', [0.13, 0.2, 0.06], '#f3f0e8', '#c9a227', 'Kaizen', 'Klebreis', '1 kg', 3.29),
  ],
  AS_REIS_B: [P('beutel', [0.22, 0.32, 0.1], '#f3f0e8', '#3f6b3a', 'Kaizen', 'Jasminreis', '5 kg', 12.99), P('tetra', [0.08, 0.2, 0.06], '#f3f0e8', '#3f6b3a', 'Umami Lab', 'Kokosmilch', '1 l', 3.99)],
  AS_SAUCE: [
    P('flasche', [0.06, 0.2, 0.06], '#2a1a12', '#b8322a', 'Kaizen', 'Shoyu', 'Sojasauce · 250 ml', 2.79, { f: 4 }),
    P('flasche', [0.05, 0.18, 0.05], '#6b4a1e', '#e3d3a4', 'Kaizen', 'Sesamöl', 'geröstet · 250 ml', 3.49),
    P('flasche', [0.06, 0.19, 0.06], '#1f2120', '#c9a227', 'Umami Lab', 'Sriracha', '200 ml', 2.99, { cap: '#3f6b3a' }),
    P('glas', GLAS_KLEIN, '#1f2120', '#c9a227', 'Umami Lab', 'Chili-Öl', 'knusprig · 200 g', 3.99),
    P('becher', [0.09, 0.07, 0.09], '#1f2120', '#c9a227', 'Umami Lab', 'Miso-Paste', 'hell · 300 g', 3.49),
    P('beutel', [0.1, 0.15, 0.04], '#2b2c30', '#c9a227', 'Kaizen', 'Sesam', 'geröstet · 100 g', 1.79),
    P('packung', [0.16, 0.2, 0.02], '#1f2a1f', '#8bab5a', 'Kaizen', 'Nori', '10 Blatt', 2.99),
    P('flasche', [0.06, 0.2, 0.06], '#3a2216', '#c9a227', 'Kaizen', 'Hoisin', '250 ml', 2.49),
  ],
  AS_SAUCE_B: [P('flasche', [0.08, 0.28, 0.08], '#2a1a12', '#b8322a', 'Kaizen', 'Shoyu', '1 l', 6.99), P('tetra', [0.07, 0.17, 0.05], '#4a3424', '#c9a227', 'Umami Lab', 'Ramen-Brühe', '500 ml', 2.49)],
  AS_SNACK: [
    P('beutel', [0.14, 0.18, 0.05], '#efe4c6', '#b8322a', 'Umami Lab', 'Reiscracker', 'Sesam · 100 g', 1.99),
    P('packung', [0.12, 0.08, 0.12], '#b8322a', '#e3d3a4', 'Kaizen', 'Glückskekse', '12 Stück', 2.29),
    P('packung', [0.12, 0.06, 0.12], '#8bab5a', '#f3f0e8', 'Kaizen', 'Matcha-Kekse', '120 g', 2.79),
    P('beutel', [0.12, 0.16, 0.04], '#1f2a1f', '#8bab5a', 'Umami Lab', 'Seetang-Snack', '10 g', 1.49),
  ],
  AS_DRINK: [
    P('dose', [0.066, 0.125, 0.066], '#5d7f5a', '#f3f0e8', 'Umami Lab', 'Eistee', 'Jasmin · 0,33 l', 1.19, { f: 4 }),
    P('tetra', [0.07, 0.2, 0.07], '#e6c3c8', '#7a1f3d', 'Kaizen', 'Lychee', 'Saft · 1 l', 2.49),
    P('packung', [0.1, 0.1, 0.06], '#3f6b3a', '#f3f0e8', 'Kaizen', 'Grüntee', '20 Beutel', 2.99),
    P('flasche', [0.07, 0.26, 0.07], '#f3f0e8', '#7a1f3d', 'Kaizen', 'Sake', 'alkoholfrei · 0,5 l', 5.99),
  ],
  // ================= Kochwelt Mexican (W3) =================
  MX_TORT: [
    P('beutel', [0.2, 0.22, 0.03], '#f3f0e8', '#3f6b3a', 'La Milpa', 'Tortillas', 'Weizen · 8 Stück', 1.99, { f: 3 }),
    P('beutel', [0.2, 0.22, 0.03], '#e7c45a', '#a8342b', 'La Milpa', 'Tortillas', 'Mais · 8 Stück', 2.29),
    P('packung', [0.16, 0.12, 0.08], '#d9873a', '#2b2c30', 'La Milpa', 'Taco Shells', '12 Stück', 2.49, { f: 3 }),
    P('beutel', [0.2, 0.22, 0.03], '#c9b089', '#3f6b3a', 'Grünwerk', 'Wraps', 'Vollkorn · 6 Stück', 2.49),
  ],
  MX_TORT_B: [P('beutel', [0.22, 0.26, 0.05], '#f3f0e8', '#3f6b3a', 'La Milpa', 'Tortillas', 'Weizen · 16 Stück', 3.49), P('packung', [0.18, 0.14, 0.1], '#d9873a', '#2b2c30', 'La Milpa', 'Taco Shells', '24 Stück', 4.29)],
  MX_DOSE: [
    P('dose', DOSE, '#7f2620', '#f1e7d0', 'Sol & Maíz', 'Kidney-Bohnen', '400 g', 0.99, { f: 4 }),
    P('dose', DOSE, '#2b2c30', '#e7c45a', 'Sol & Maíz', 'Schwarze Bohnen', '400 g', 1.29),
    P('dose', DOSE_KLEIN, '#3f6b3a', '#e7c45a', 'Sol & Maíz', 'Mais', 'süß · 285 g', 0.89, { f: 4 }),
    P('dose', DOSE, '#9c2f27', '#f1e7d0', 'Sol & Maíz', 'Tomaten', 'gehackt · 400 g', 0.99),
    P('dose', [0.074, 0.115, 0.074], '#a5823f', '#2b2c30', 'La Milpa', 'Refried Beans', '430 g', 1.99),
  ],
  MX_DOSE_B: [P('dose', [0.1, 0.15, 0.1], '#7f2620', '#f1e7d0', 'Sol & Maíz', 'Kidney-Bohnen', '800 g', 1.69), P('dose', [0.1, 0.15, 0.1], '#3f6b3a', '#e7c45a', 'Sol & Maíz', 'Mais', 'süß · 570 g', 1.49)],
  MX_SALSA: [
    P('glas', [0.08, 0.13, 0.08], '#f1e7d0', '#a8342b', 'La Milpa', 'Salsa', 'medium · 300 g', 2.49, { f: 4 }),
    P('glas', [0.08, 0.13, 0.08], '#f1e7d0', '#5d7f3a', 'La Milpa', 'Salsa Verde', 'mild · 300 g', 2.49),
    P('glas', [0.07, 0.12, 0.07], '#f1e7d0', '#3f6b3a', 'Sol & Maíz', 'Jalapeños', 'Scheiben · 220 g', 1.99),
    P('beutel', [0.09, 0.13, 0.02], '#a8342b', '#e7c45a', 'La Milpa', 'Taco-Gewürz', '30 g', 0.99),
    P('glas', GEWUERZ, '#2b2c30', '#a8342b', 'Kochwerk', 'Chili', 'gemahlen · 45 g', 1.79),
    P('glas', GEWUERZ, '#2b2c30', '#a5823f', 'Kochwerk', 'Kreuzkümmel', 'gemahlen · 40 g', 1.99),
  ],
  MX_ERG: [
    P('beutel', [0.17, 0.25, 0.07], '#e7c45a', '#3f6b3a', 'La Milpa', 'Nachos', 'gesalzen · 200 g', 1.79, { f: 3 }),
    P('glas', [0.08, 0.11, 0.08], '#f1e7d0', '#5d7f3a', 'La Milpa', 'Guacamole', 'Dip · 200 g', 2.99),
    P('glas', [0.08, 0.11, 0.08], '#f1e7d0', '#d9a93a', 'La Milpa', 'Cheese Dip', '200 g', 2.79),
    P('packung', [0.12, 0.18, 0.06], '#d9873a', '#5d3a1a', 'La Milpa', 'Churros', 'Backmischung', 2.99),
  ],
  MX_DRINK: [
    P('flasche', DRINK, '#8bab5a', '#2b2c30', 'Sol & Maíz', 'Limonada', 'Limette · 0,5 l', 1.49, { f: 4 }),
    P('flasche', [0.065, 0.24, 0.065], '#6b4a1e', '#e3d3a4', 'Neckarbräu', 'Helles', 'alkoholfrei · 0,5 l', 1.09),
    P('tetra', [0.07, 0.2, 0.07], '#efe4c6', '#a5823f', 'La Milpa', 'Horchata', 'Reisdrink · 1 l', 2.99),
  ],
  // ================= Kühlung (K1–K6) =================
  K1: [
    P('tetra', [0.07, 0.2, 0.07], '#f3f0e8', '#3e6a96', 'Hof Neckar', 'Frische Milch', '1,5 % · 1 l', 1.19, { f: 4 }),
    P('becher', [0.1, 0.1, 0.1], '#f3f0e8', '#3e6a96', 'Hof Neckar', 'Joghurt', 'natur · 500 g', 0.99),
    P('becher', [0.075, 0.07, 0.075], '#f3f0e8', '#b9472f', 'Hof Neckar', 'Schlagsahne', '200 g', 0.89, { f: 4 }),
    P('becher', [0.075, 0.07, 0.075], '#f3f0e8', '#3f6b3a', 'Hof Neckar', 'Schmand', '200 g', 0.79),
    P('becher', [0.075, 0.07, 0.075], '#f3f0e8', '#c9a227', 'Hof Neckar', 'Crème fraîche', '200 g', 1.09),
    P('packung', [0.1, 0.06, 0.06], '#e9d38a', '#3e6a96', 'Hof Neckar', 'Butter', '250 g', 2.49),
    P('schale', [0.2, 0.07, 0.11], '#c9b089', '#3f6b3a', 'Hof Neckar', 'Eier', 'Freiland · 10 Stück', 3.29),
  ],
  K2: [
    P('beutel', [0.12, 0.16, 0.03], '#efe4c6', '#1e3d6e', 'Nonna Lia', 'Parmigiano', 'gerieben · 100 g', 2.99, { f: 4 }),
    P('schale', [0.12, 0.05, 0.08], '#efe4c6', '#1e3d6e', 'Nonna Lia', 'Parmigiano', 'Stück · 200 g', 4.99),
    P('beutel', [0.12, 0.15, 0.04], '#f3f0e8', '#3f6b3a', 'Casa Verde', 'Mozzarella', '125 g', 0.99),
    P('schale', [0.14, 0.04, 0.1], '#e9c75a', '#3e6a96', 'Hof Neckar', 'Gouda', 'Scheiben · 150 g', 1.69),
    P('beutel', [0.12, 0.17, 0.03], '#d9873a', '#2b2c30', 'Hof Neckar', 'Cheddar', 'gerieben · 150 g', 1.99),
    P('packung', [0.11, 0.05, 0.08], '#f3f0e8', '#3e6a96', 'Hof Neckar', 'Feta', '200 g', 1.79),
  ],
  K3: [
    P('schale', [0.18, 0.06, 0.12], '#efe4c6', '#7b2d26', 'Forno Lia', 'Tagliatelle', 'frisch · 250 g', 2.49, { f: 3 }),
    P('schale', [0.18, 0.06, 0.12], '#efe4c6', '#1e3d6e', 'Forno Lia', 'Tortellini', 'Ricotta-Spinat · 250 g', 2.99),
    P('beutel', [0.14, 0.2, 0.04], '#f3f0e8', '#7b2d26', 'Forno Lia', 'Gnocchi', '400 g', 1.79),
    P('packung', [0.07, 0.26, 0.07], '#efe4c6', '#b9472f', 'Forno Lia', 'Pizzateig', 'gekühlt · 400 g', 1.99),
  ],
  K4: [
    P('schale', [0.2, 0.06, 0.14], '#f3f0e8', '#a8342b', 'Hof Neckar', 'Hähnchenbrust', '400 g', 4.99),
    P('schale', [0.2, 0.05, 0.14], '#f3f0e8', '#3e6a96', 'Nordküste', 'Lachsfilet', '250 g', 5.49),
    P('schale', [0.2, 0.06, 0.14], '#f3f0e8', '#7f2620', 'Hof Neckar', 'Hackfleisch', 'gemischt · 500 g', 4.49),
    P('packung', [0.14, 0.04, 0.1], '#7f2620', '#e3d3a4', 'Casa Verde', 'Pancetta', 'Würfel · 125 g', 2.29),
  ],
  K5: [
    P('packung', [0.12, 0.05, 0.09], '#f3f0e8', '#3f6b3a', 'Grünwerk', 'Tofu', 'natur · Bio · 200 g', 1.99, { f: 4 }),
    P('packung', [0.12, 0.05, 0.09], '#c9b089', '#3f6b3a', 'Grünwerk', 'Räuchertofu', 'Bio · 200 g', 2.29),
    P('schale', [0.16, 0.06, 0.12], '#3f6b3a', '#f3f0e8', 'Grünwerk', 'Veggie-Hack', '250 g', 2.99),
    P('packung', [0.12, 0.05, 0.09], '#c9b089', '#a5823f', 'Grünwerk', 'Tempeh', 'Bio · 200 g', 2.79),
  ],
  K6: [
    P('becher', [0.1, 0.12, 0.1], '#3f6b3a', '#f3f0e8', 'Hof Neckar', 'Basilikum', 'im Topf', 1.99, { f: 3 }),
    P('becher', [0.1, 0.12, 0.1], '#3f6b3a', '#f3f0e8', 'Hof Neckar', 'Koriander', 'im Topf', 1.99),
    P('beutel', [0.15, 0.2, 0.06], '#f3f0e8', '#5d7f3a', 'Hof Neckar', 'Salat-Mix', '125 g', 1.49),
    P('schale', [0.15, 0.08, 0.11], '#f3f0e8', '#5d7f3a', 'Hof Neckar', 'Rucola', '125 g', 1.29),
  ],
  // ================= Dessert & TK (D1–D3) =================
  D1: [
    P('becher', [0.11, 0.09, 0.11], '#efe4c6', '#5d7f3a', 'Gelato Lia', 'Gelato', 'Pistazie · 500 ml', 4.49),
    P('becher', [0.11, 0.09, 0.11], '#efe4c6', '#5d3a1a', 'Gelato Lia', 'Gelato', 'Stracciatella · 500 ml', 4.49),
    P('packung', [0.12, 0.08, 0.12], '#e6c3c8', '#7a1f3d', 'Kaizen', 'Mochi', 'Eis · 6 Stück', 4.99),
  ],
  D2: [
    P('becher', [0.08, 0.07, 0.08], '#5d3a1a', '#e3d3a4', 'Forno Lia', 'Tiramisu', '2 × 100 g', 2.49, { f: 4 }),
    P('becher', [0.08, 0.07, 0.08], '#f3f0e8', '#a8342b', 'Hof Neckar', 'Panna Cotta', 'Beere · 2 × 100 g', 1.99),
    P('becher', [0.08, 0.07, 0.08], '#3a2216', '#e3d3a4', 'Hof Neckar', 'Mousse au Chocolat', '2 × 90 g', 1.99),
  ],
  D3: [
    P('beutel', [0.18, 0.24, 0.05], '#2e4a22', '#e7c45a', 'Grünwerk', 'Wok-Gemüse', 'TK · 750 g', 2.99),
    P('beutel', [0.18, 0.24, 0.05], '#3f6b3a', '#f3f0e8', 'Grünwerk', 'Edamame', 'TK · 400 g', 2.79),
    P('packung', [0.26, 0.04, 0.26], '#a8342b', '#f3f0e8', 'Forno Lia', 'Pizza Margherita', 'TK · 350 g', 3.49),
    P('beutel', [0.18, 0.24, 0.05], '#3e6a96', '#f3f0e8', 'Nordküste', 'Garnelen', 'TK · 225 g', 5.99),
  ],
  // ================= Wein & Getränke (G1–G3) =================
  G1: [
    P('wein', WEIN, '#2b2116', '#efe8d8', 'Weingut Neckar', 'Lemberger', 'trocken · 2022', 7.9, { f: 4 }),
    P('wein', WEIN, '#2b2116', '#d8c9a8', 'Weingut Neckar', 'Trollinger', 'Württemberg', 6.5),
    P('wein', WEIN, '#1f2a1f', '#efe8d8', 'Cantina Sole', 'Chianti', 'DOCG · 2021', 8.9),
    P('wein', WEIN, '#1f2a1f', '#7f2620', 'Cantina Sole', 'Primitivo', 'Puglia · 2022', 7.5),
    P('wein', WEIN, '#2b2116', '#c9a227', 'Bodega Luz', 'Rioja', 'Crianza · 2020', 9.9),
  ],
  G2: [
    P('wein', WEIN, '#8a9a5b', '#efe8d8', 'Weingut Neckar', 'Riesling', 'trocken · 2023', 7.5, { f: 4 }),
    P('wein', WEIN, '#8a9a5b', '#3e6a96', 'Weingut Neckar', 'Grauburgunder', 'trocken · 2023', 8.5),
    P('wein', WEIN, '#c8a1a1', '#efe8d8', 'Cantina Sole', 'Rosato', 'fruchtig · 2023', 6.9),
    P('wein', WEIN, '#7d8a52', '#c9a227', 'Cantina Sole', 'Pinot Grigio', 'delle Venezie', 6.9),
  ],
  G3: [
    P('flasche', DRINK, '#d9bf45', '#1e3d6e', 'Limonata', 'Limone', '0,5 l', 1.29, { f: 4 }),
    P('dose', [0.066, 0.125, 0.066], '#5d7f5a', '#f3f0e8', 'Umami Lab', 'Eistee', 'Jasmin · 0,33 l', 1.19),
    P('flasche', [0.065, 0.24, 0.065], '#6b4a1e', '#e3d3a4', 'Neckarbräu', 'Helles', 'alkoholfrei · 0,5 l', 1.09, { f: 4 }),
    P('flasche', [0.07, 0.26, 0.07], '#f3f0e8', '#7a1f3d', 'Kaizen', 'Sake', 'alkoholfrei · 0,5 l', 5.99),
    P('flasche', [0.075, 0.29, 0.075], '#5e8aa6', '#f3f0e8', 'Neckarquelle', 'Mineralwasser', 'medium · 0,75 l', 0.69, { f: 4 }),
  ],
  // ================= Basissortiment (B1–B7) =================
  B1: [
    P('beutel', [0.11, 0.31, 0.05], '#f3f0e8', '#b9472f', 'Basis+', 'Spaghetti', '1 kg', 1.69, { f: 4 }),
    P('beutel', [0.14, 0.21, 0.06], '#f3f0e8', '#b9472f', 'Basis+', 'Fusilli', '500 g', 0.89),
    P('beutel', [0.13, 0.2, 0.06], '#f3f0e8', '#3e6a96', 'Basis+', 'Basmati-Reis', '1 kg', 2.49, { f: 4 }),
    P('beutel', [0.13, 0.2, 0.06], '#f3f0e8', '#c9a227', 'Basis+', 'Langkornreis', '1 kg', 1.49),
    P('packung', [0.11, 0.18, 0.05], '#f3f0e8', '#d9873a', 'Basis+', 'Couscous', '500 g', 1.29),
    P('beutel', [0.12, 0.18, 0.04], '#c9b089', '#7a3b1e', 'Grünwerk', 'Rote Linsen', 'Bio · 500 g', 2.29),
  ],
  B2: [
    P('oel', [0.065, 0.29, 0.065], '#2e4a22', '#e3d3a4', 'Casa Verde', 'Olivenöl', 'extra vergine · 750 ml', 9.99, { f: 4 }),
    P('oel', [0.075, 0.3, 0.075], '#d9b84a', '#3f6b3a', 'Basis+', 'Rapsöl', '1 l', 2.29, { f: 4 }),
    P('oel', [0.075, 0.3, 0.075], '#e2c45a', '#c9a227', 'Basis+', 'Sonnenblumenöl', '1 l', 1.99),
    P('flasche', [0.06, 0.26, 0.06], '#2b1a17', '#e3d3a4', 'Basis+', 'Balsamico', 'di Modena · 500 ml', 2.49),
    P('flasche', [0.065, 0.28, 0.065], '#e9e2c8', '#3e6a96', 'Basis+', 'Weißweinessig', '750 ml', 1.19),
  ],
  B3: [
    P('glas', GEWUERZ, '#2b2c30', '#a8342b', 'Kochwerk', 'Paprika', 'edelsüß · 50 g', 1.79, { f: 2 }),
    P('glas', GEWUERZ, '#2b2c30', '#a5823f', 'Kochwerk', 'Kreuzkümmel', '40 g', 1.99, { f: 2 }),
    P('glas', GEWUERZ, '#2b2c30', '#6b7a3a', 'Kochwerk', 'Oregano', '15 g', 1.99, { f: 2 }),
    P('glas', [0.05, 0.14, 0.05], '#2b2c30', '#e3d3a4', 'Kochwerk', 'Pfeffer', 'schwarz · Mühle', 2.99, { f: 2 }),
    P('glas', GEWUERZ, '#2b2c30', '#8f2a22', 'Kochwerk', 'Chiliflocken', '35 g', 1.79, { f: 2 }),
    P('packung', [0.08, 0.13, 0.05], '#f3f0e8', '#3e6a96', 'Basis+', 'Meersalz', '500 g', 0.59),
    P('glas', [0.08, 0.13, 0.08], '#d9a93a', '#2b2c30', 'Kochwerk', 'Gemüsebrühe', 'Glas · 250 g', 2.99),
  ],
  B4: [
    P('dose', DOSE, '#f3f0e8', '#b9472f', 'Basis+', 'Tomaten', 'gehackt · 400 g', 0.59, { f: 4 }),
    P('tetra', [0.065, 0.16, 0.05], '#f3f0e8', '#b9472f', 'Basis+', 'Passata', '500 g', 0.79),
    P('glas', GLAS_SAUCE, '#f3f0e8', '#b9472f', 'Basis+', 'Tomatensauce', 'klassisch · 500 g', 0.99),
    P('dose', DOSE_KLEIN, '#f3f0e8', '#c9a227', 'Basis+', 'Mais', '285 g', 0.69),
    P('dose', [0.085, 0.045, 0.085], '#f3f0e8', '#3e6a96', 'Nordküste', 'Thunfisch', 'in Öl · 185 g', 1.99),
    P('dose', DOSE, '#f3f0e8', '#a5823f', 'Basis+', 'Kichererbsen', '400 g', 0.79),
  ],
  B5: [
    P('packung', [0.12, 0.19, 0.075], '#f3f0e8', '#3e6a96', 'Basis+', 'Weizenmehl', 'Type 405 · 1 kg', 0.79, { f: 4 }),
    P('packung', [0.12, 0.19, 0.075], '#f3f0e8', '#b9472f', 'Basis+', 'Zucker', '1 kg', 1.09),
    P('packung', [0.09, 0.14, 0.06], '#f3f0e8', '#c9a227', 'Basis+', 'Speisestärke', '400 g', 0.99),
    P('packung', [0.1, 0.12, 0.03], '#c9a227', '#2b2c30', 'Kochwerk', 'Backpulver', '5 × 15 g', 0.79),
    P('packung', [0.09, 0.14, 0.06], '#f3f0e8', '#7a1f3d', 'Basis+', 'Puderzucker', '250 g', 0.89),
  ],
  B6: [
    P('packung', [0.16, 0.24, 0.06], '#c9b089', '#7a3b1e', 'Grünwerk', 'Nussmüsli', 'Bio · 500 g', 3.49),
    P('packung', [0.13, 0.2, 0.06], '#f3f0e8', '#3f6b3a', 'Basis+', 'Haferflocken', 'zart · 500 g', 0.89, { f: 4 }),
    P('beutel', [0.13, 0.26, 0.09], '#8a5a32', '#f3f0e8', 'Forno Lia', 'Vollkornbrot', '500 g', 1.99),
    P('glas', [0.07, 0.11, 0.07], '#f3f0e8', '#7a1f3d', 'Hof Neckar', 'Konfitüre', 'Kirsche · 340 g', 2.49),
    P('glas', [0.07, 0.11, 0.07], '#f3f0e8', '#c9a227', 'Hof Neckar', 'Blütenhonig', '500 g', 4.99),
    P('packung', [0.1, 0.17, 0.06], '#2b211c', '#c9a227', 'Basis+', 'Kaffee', 'gemahlen · 500 g', 5.49),
  ],
  B7: [
    P('beutel', [0.17, 0.25, 0.07], '#d9a93a', '#a8342b', 'Basis+', 'Chips', 'Paprika · 175 g', 1.49, { f: 3 }),
    P('tafel', [0.08, 0.16, 0.015], '#3a2216', '#c9a227', 'Kakaowerk', 'Zartbitter', '70 % · 100 g', 1.99, { f: 4 }),
    P('beutel', [0.12, 0.17, 0.05], '#d9873a', '#2b2c30', 'Basis+', 'Studentenfutter', '200 g', 1.99),
    P('beutel', [0.14, 0.2, 0.04], '#f3f0e8', '#a8342b', 'Basis+', 'Fruchtgummi', '200 g', 0.99),
    P('beutel', [0.15, 0.22, 0.06], '#3e6a96', '#f3f0e8', 'Basis+', 'Salzbrezeln', '250 g', 1.19),
  ],
  IMPULS: [
    P('tafel', [0.08, 0.16, 0.015], '#3a2216', '#c9a227', 'Kakaowerk', 'Zartbitter', '70 % · 100 g', 1.99, { f: 3 }),
    P('tafel', [0.08, 0.16, 0.015], '#7f2620', '#e3d3a4', 'Kakaowerk', 'Chili-Schoko', '100 g', 2.29),
    P('becher', [0.1, 0.12, 0.1], '#3f6b3a', '#f3f0e8', 'Hof Neckar', 'Basilikum', 'im Topf', 1.99, { f: 2 }),
    P('packung', [0.04, 0.14, 0.03], '#c9b089', '#7a3b1e', 'Grünwerk', 'Müsliriegel', 'Bio · 35 g', 0.79, { f: 3 }),
  ],
};
