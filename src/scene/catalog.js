// Sortiment wie im klassischen Supermarkt: Warengruppen (T = Trockensortiment in den Quer-Gondeln, B = Basis, K = Kühlung,
// D = Dessert & TK, G = Getränke), je Warengruppe mehrere Marken mit vielen Sorten. Alle Marken sind fiktiv.
// P(form, [Breite, Höhe, Tiefe] in m, Grundfarbe, Akzent, Marke, Produkt, Inhalt, Preis €, { g: Großpackung (Bückzone), cap })
// form: packung | beutel | schale | tetra | tafel | glas | dose | becher | flasche | oel | wein
export const BRANDS = {
  'Nonna Lia': { st: 'premium' },
  "Molino d'Oro": { st: 'molino' },
  'Fratelli Verdi': { st: 'klassik' },
  'Casa Verde': { st: 'feinkost' },
  'Forno Lia': { st: 'feinkost' },
  'Cucina Bella': { st: 'klassik' },
  'Pomodoro Rossa': { st: 'klassik' },
  'Basis+': { st: 'eigen' },
  Grünwerk: { st: 'bio' },
  Reisgarten: { st: 'klassik' },
  Gartenglück: { st: 'klassik' },
  Kochwerk: { st: 'gewuerz' },
  Würzhaus: { st: 'gewuerz' },
  Kaizen: { st: 'asia' },
  'Umami Lab': { st: 'asia' },
  'Lotus Garden': { st: 'asia' },
  'La Milpa': { st: 'mex' },
  'Sol & Maíz': { st: 'mex' },
  'Hof Neckar': { st: 'regional' },
  Alpenhof: { st: 'regional' },
  'Ölmühle Neckar': { st: 'regional' },
  Nordküste: { st: 'regional' },
  'Gelato Lia': { st: 'feinkost' },
  Kakaowerk: { st: 'klassik' },
  'Cacao Fino': { st: 'feinkost' },
  Knusperei: { st: 'klassik' },
  'Rösterei Neckar': { st: 'regional' },
  Teekontor: { st: 'klassik' },
  Limonata: { st: 'drink' },
  Neckarquelle: { st: 'drink' },
  Neckarbräu: { st: 'drink' },
  'Weingut Neckar': { st: 'wein' },
  'Cantina Sole': { st: 'wein' },
  'Bodega Luz': { st: 'wein' },
  'Domaine Clair': { st: 'wein' },
};

const P = (form, m, c, a, b, n, s, pr, o = {}) => ({ form, m, c, a, b, n, s, pr, ...o });
// Sortenreihe einer Marke: gleiche Packung, verschiedene Sorten
const reihe = (form, m, c, a, b, items, o = {}) => items.map(([n, s, pr, x = {}]) => P(form, x.m || m, x.c || c, x.a || a, b, n, s, pr, { ...o, ...x }));

const NL = [0.075, 0.27, 0.035]; // lange Pasta
const NK = [0.12, 0.19, 0.06]; // kurze Pasta
const DOSE = [0.074, 0.11, 0.074];
const DOSE_K = [0.066, 0.08, 0.066];
const DOSE_G = [0.1, 0.15, 0.1];
const GLAS = [0.075, 0.125, 0.075];
const GLAS_K = [0.065, 0.09, 0.065];
const GEW = [0.045, 0.1, 0.045];
const DRINK = [0.065, 0.24, 0.065];
const WEIN = [0.075, 0.31, 0.075];
const TAFEL = [0.08, 0.16, 0.015];

export const CATALOG = {
  // ================= T1 Nudeln =================
  T1: [
    ...reihe('packung', NL, '#1e3d6e', '#e3d3a4', 'Nonna Lia', [['Spaghetti', 'n. 5 · 500 g', 1.79], ['Spaghettini', 'n. 3 · 500 g', 1.79], ['Linguine', 'n. 13 · 500 g', 1.79], ['Bavette', 'n. 13 · 500 g', 1.79]]),
    ...reihe('packung', NK, '#1e3d6e', '#e3d3a4', 'Nonna Lia', [['Penne rigate', 'n. 73 · 500 g', 1.79], ['Rigatoni', 'n. 89 · 500 g', 1.79], ['Fusilli', 'n. 98 · 500 g', 1.79], ['Farfalle', 'n. 65 · 500 g', 1.79], ['Tortiglioni', 'n. 83 · 500 g', 1.79]]),
    ...reihe('packung', [0.07, 0.26, 0.04], '#efe1b8', '#1f3a6a', "Molino d'Oro", [['Spaghetti', 'Bronze · 500 g', 2.29], ['Linguine', 'Bronze · 500 g', 2.29], ['Bucatini', 'Bronze · 500 g', 2.29]]),
    ...reihe('packung', [0.11, 0.2, 0.06], '#efe1b8', '#1f3a6a', "Molino d'Oro", [['Penne', 'Bronze · 500 g', 2.29], ['Orecchiette', 'Bronze · 500 g', 2.49], ['Paccheri', 'Bronze · 500 g', 2.49], ['Mezze maniche', 'Bronze · 500 g', 2.29]]),
    ...reihe('packung', [0.13, 0.16, 0.07], '#2f4f3a', '#e3d3a4', 'Fratelli Verdi', [['Tagliatelle', 'all’uovo · 250 g', 2.19], ['Pappardelle', 'all’uovo · 250 g', 2.19], ['Fettuccine', 'all’uovo · 250 g', 2.19]]),
    P('packung', [0.2, 0.05, 0.12], '#2f4f3a', '#e3d3a4', 'Fratelli Verdi', 'Lasagne', 'Platten · 500 g', 1.99),
    ...reihe('beutel', [0.1, 0.27, 0.035], '#f3f0e8', '#b9472f', 'Basis+', [['Spaghetti', '500 g', 0.89], ['Spaghettini', '500 g', 0.89]]),
    ...reihe('beutel', [0.14, 0.21, 0.06], '#f3f0e8', '#b9472f', 'Basis+', [['Penne', '500 g', 0.89], ['Fusilli', '500 g', 0.89], ['Farfalle', '500 g', 0.89], ['Hörnchen', '500 g', 0.79], ['Ditalini', '500 g', 0.89]]),
    ...reihe('packung', NL, '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Vollkorn-Spaghetti', 'Bio · 500 g', 1.99], ['Dinkel-Spaghetti', 'Bio · 500 g', 2.29]]),
    ...reihe('packung', NK, '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Vollkorn-Penne', 'Bio · 500 g', 1.99], ['Linsen-Fusilli', 'Bio · 250 g', 2.79], ['Kichererbsen-Penne', 'Bio · 250 g', 2.79]]),
    // Großpackungen (Bückzone)
    P('packung', [0.09, 0.3, 0.05], '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Spaghetti', 'n. 5 · 1 kg', 3.29, { g: 1 }),
    P('packung', [0.15, 0.24, 0.07], '#1e3d6e', '#e3d3a4', 'Nonna Lia', 'Penne rigate', '1 kg', 3.29, { g: 1 }),
    P('beutel', [0.11, 0.31, 0.05], '#f3f0e8', '#b9472f', 'Basis+', 'Spaghetti', '1 kg', 1.69, { g: 1 }),
    P('beutel', [0.16, 0.26, 0.08], '#f3f0e8', '#b9472f', 'Basis+', 'Fusilli', '1 kg', 1.69, { g: 1 }),
    P('beutel', [0.16, 0.26, 0.08], '#f3f0e8', '#b9472f', 'Basis+', 'Penne', '1 kg', 1.69, { g: 1 }),
  ],
  // ================= T2 Reis, Getreide & Hülsenfrüchte =================
  T2: [
    ...reihe('packung', [0.12, 0.18, 0.06], '#c8742e', '#f3ead2', 'Reisgarten', [['Langkornreis', '1 kg', 1.99], ['Basmati-Reis', '1 kg', 2.79], ['Jasmin-Reis', '1 kg', 2.79], ['Parboiled-Reis', '1 kg', 1.99], ['Risotto-Reis', 'Arborio · 500 g', 2.49], ['Milchreis', '500 g', 1.29]]),
    ...reihe('packung', [0.12, 0.16, 0.05], '#c8742e', '#f3ead2', 'Reisgarten', [['Basmati', 'Kochbeutel · 4 × 125 g', 1.99], ['Langkorn', 'Kochbeutel · 4 × 125 g', 1.69]]),
    ...reihe('beutel', [0.13, 0.2, 0.06], '#f3f0e8', '#3e6a96', 'Basis+', [['Langkornreis', '1 kg', 1.29], ['Basmati-Reis', '1 kg', 1.99], ['Couscous', '500 g', 1.09], ['Bulgur', '500 g', 1.19]]),
    ...reihe('beutel', [0.12, 0.18, 0.04], '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Rote Linsen', 'Bio · 500 g', 2.29], ['Belugalinsen', 'Bio · 500 g', 2.79], ['Kichererbsen', 'Bio · 500 g', 2.29], ['Quinoa', 'Bio · 400 g', 3.49], ['Vollkornreis', 'Bio · 500 g', 2.49], ['Hirse', 'Bio · 500 g', 2.19]]),
    P('beutel', [0.2, 0.3, 0.09], '#c8742e', '#f3ead2', 'Reisgarten', 'Basmati-Reis', '2,5 kg', 7.99, { g: 1 }),
    P('beutel', [0.2, 0.3, 0.09], '#f3f0e8', '#3e6a96', 'Basis+', 'Langkornreis', '2 kg', 2.49, { g: 1 }),
  ],
  // ================= T3 Tomaten & Pastasaucen =================
  T3: [
    ...reihe('tetra', [0.065, 0.16, 0.05], '#9c2f27', '#f1e7d0', 'Pomodoro Rossa', [['Passata', '500 g', 1.19], ['Polpa', 'fein gehackt · 400 g', 1.19], ['Passata Basilico', '500 g', 1.29]]),
    ...reihe('dose', DOSE, '#9c2f27', '#e9d9a6', 'Pomodoro Rossa', [['Pomodori pelati', 'geschält · 400 g', 1.09], ['Pomodorini', 'Kirschtomaten · 400 g', 1.49]]),
    P('packung', [0.05, 0.16, 0.035], '#9c2f27', '#f1e7d0', 'Pomodoro Rossa', 'Tomatenmark', 'doppelt · 200 g', 0.89),
    ...reihe('glas', GLAS, '#f1e7d0', '#a8342b', 'Casa Verde', [['Sugo al Pomodoro', '400 g', 2.29], ['Arrabbiata', '400 g', 2.29], ['Napoletana', '400 g', 2.29], ['Ricotta e Spinaci', '400 g', 2.49], ['Funghi', '400 g', 2.49]]),
    ...reihe('glas', GLAS_K, '#f1e7d0', '#3d5e2e', 'Casa Verde', [['Pesto Genovese', '190 g', 2.79], ['Pesto Rosso', '190 g', 2.79, { a: '#8f2a22' }], ['Pesto Calabrese', '190 g', 2.79, { a: '#a8342b' }]]),
    ...reihe('glas', [0.08, 0.13, 0.08], '#22324a', '#c9a227', 'Cucina Bella', [['Bolognese', 'vegetarisch · 400 g', 2.49], ['Tomate-Mozzarella', '400 g', 2.49], ['Puttanesca', '400 g', 2.49], ['Gemüse-Sauce', '400 g', 2.29]]),
    ...reihe('glas', [0.075, 0.13, 0.075], '#f3f0e8', '#b9472f', 'Basis+', [['Tomatensauce', 'klassisch · 500 g', 0.99], ['Tomatensauce', 'Kräuter · 500 g', 0.99], ['Pesto grün', '190 g', 1.49, { a: '#3f6b3a' }]]),
    ...reihe('tetra', [0.065, 0.16, 0.05], '#f3f0e8', '#b9472f', 'Basis+', [['Passata', '500 g', 0.59], ['Tomaten', 'gehackt · 500 g', 0.59]]),
    ...reihe('glas', GLAS, '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Sugo Basilikum', 'Bio · 350 g', 2.49], ['Passata', 'Bio · 680 g', 1.79]]),
    P('glas', [0.08, 0.21, 0.08], '#9c2f27', '#f1e7d0', 'Pomodoro Rossa', 'Passata', 'Flasche · 700 g', 1.49, { g: 1 }),
    P('dose', DOSE_G, '#f3f0e8', '#b9472f', 'Basis+', 'Tomaten', 'gehackt · 800 g', 0.99, { g: 1 }),
    P('glas', [0.09, 0.16, 0.09], '#f1e7d0', '#a8342b', 'Casa Verde', 'Sugo al Pomodoro', '680 g', 3.49, { g: 1 }),
  ],
  // ================= T4 Konserven: Bohnen, Mais, Gemüse =================
  T4: [
    ...reihe('dose', DOSE, '#3d6b3a', '#f3ead2', 'Gartenglück', [['Kidney-Bohnen', '400 g', 0.99], ['Weiße Bohnen', '400 g', 0.99], ['Schwarze Bohnen', '400 g', 1.19], ['Kichererbsen', '400 g', 0.99], ['Linsen', 'gegart · 400 g', 1.19], ['Erbsen & Möhren', '400 g', 1.09], ['Champignons', 'geschnitten · 314 ml', 1.29]]),
    ...reihe('dose', DOSE_K, '#3d6b3a', '#f3ead2', 'Gartenglück', [['Mais', 'süß · 285 g', 1.09], ['Mais', 'ohne Zucker · 285 g', 1.09]]),
    ...reihe('dose', DOSE, '#f1e7d0', '#7c5a3a', 'Nonna Lia', [['Borlotti', '400 g', 1.19], ['Cannellini', '400 g', 1.19, { a: '#3f6b3a' }], ['Ceci', 'Kichererbsen · 400 g', 1.19, { a: '#a5823f' }]]),
    ...reihe('dose', DOSE, '#f3f0e8', '#3f6b3a', 'Basis+', [['Kidney-Bohnen', '400 g', 0.59], ['Weiße Bohnen', '400 g', 0.59], ['Kichererbsen', '400 g', 0.59], ['Erbsen', 'fein · 400 g', 0.69]]),
    P('dose', DOSE_K, '#f3f0e8', '#c9a227', 'Basis+', 'Mais', '285 g', 0.69),
    ...reihe('glas', [0.075, 0.13, 0.075], '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Kichererbsen', 'Bio · Glas 350 g', 1.79], ['Kidney-Bohnen', 'Bio · Glas 350 g', 1.79], ['Gemüsemais', 'Bio · Glas 340 g', 1.99]]),
    P('dose', DOSE_G, '#3d6b3a', '#f3ead2', 'Gartenglück', 'Kidney-Bohnen', '800 g', 1.69, { g: 1 }),
    P('dose', DOSE_G, '#f3f0e8', '#3f6b3a', 'Basis+', 'Weiße Bohnen', '800 g', 1.09, { g: 1 }),
    P('dose', [0.1, 0.12, 0.1], '#3d6b3a', '#f3ead2', 'Gartenglück', 'Mais', 'süß · 3 × 285 g', 2.99, { g: 1 }),
  ],
  // ================= T5 Internationale Küche: Asien =================
  T5: [
    ...reihe('flasche', [0.06, 0.2, 0.06], '#2a1a12', '#f3f0e8', 'Kaizen', [['Sojasauce', 'natürlich gebraut · 250 ml', 2.79], ['Sojasauce', 'salzreduziert · 250 ml', 2.99], ['Teriyaki', '250 ml', 3.29]], { cap: '#b8322a' }),
    ...reihe('flasche', [0.06, 0.19, 0.06], '#1f2120', '#c9a227', 'Umami Lab', [['Sriracha', '200 ml', 2.99], ['Hoisin', '250 ml', 2.49], ['Austernsauce', '250 ml', 2.79], ['Sweet Chili', '300 ml', 2.29]]),
    ...reihe('dose', [0.074, 0.12, 0.074], '#2f5d3a', '#c9a227', 'Lotus Garden', [['Kokosmilch', '400 ml', 1.79], ['Kokosmilch', 'light · 400 ml', 1.79]]),
    ...reihe('glas', GLAS_K, '#2f5d3a', '#c9a227', 'Lotus Garden', [['Currypaste rot', '110 g', 2.49, { a: '#b8322a' }], ['Currypaste grün', '110 g', 2.49, { a: '#5e8f3a' }], ['Currypaste gelb', '110 g', 2.49]]),
    ...reihe('packung', [0.11, 0.18, 0.05], '#f3f0e8', '#b8322a', 'Kaizen', [['Udon', '3 × 200 g', 2.99], ['Reisnudeln', '250 g', 1.99], ['Glasnudeln', '200 g', 1.99], ['Soba', 'Buchweizen · 300 g', 2.79]]),
    ...reihe('beutel', [0.13, 0.19, 0.05], '#1f2120', '#c9a227', 'Umami Lab', [['Ramen', '4 × 70 g', 2.49], ['Mie-Nudeln', '250 g', 1.49]]),
    ...reihe('becher', [0.09, 0.07, 0.09], '#1f2120', '#c9a227', 'Umami Lab', [['Miso-Paste', 'hell · 300 g', 3.49], ['Gochujang', '250 g', 3.99, { a: '#b8322a' }]]),
    ...reihe('flasche', [0.05, 0.18, 0.05], '#6b4a1e', '#e3d3a4', 'Kaizen', [['Sesamöl', 'geröstet · 250 ml', 3.49], ['Reisessig', '250 ml', 2.29, { c: '#e9e2c8' }]]),
    ...reihe('beutel', [0.1, 0.15, 0.04], '#f3f0e8', '#b8322a', 'Kaizen', [['Sesam', 'geröstet · 100 g', 1.79], ['Panko', 'Paniermehl · 150 g', 2.29]]),
    P('packung', [0.16, 0.2, 0.02], '#1f2a1f', '#8bab5a', 'Kaizen', 'Nori', '10 Blatt', 2.99),
    P('flasche', [0.08, 0.28, 0.08], '#2a1a12', '#f3f0e8', 'Kaizen', 'Sojasauce', '1 l', 6.99, { g: 1, cap: '#b8322a' }),
    P('tetra', [0.08, 0.2, 0.06], '#2f5d3a', '#c9a227', 'Lotus Garden', 'Kokosmilch', '1 l', 3.99, { g: 1 }),
    P('packung', [0.14, 0.22, 0.07], '#f3f0e8', '#b8322a', 'Kaizen', 'Udon', '6 × 200 g', 5.49, { g: 1 }),
  ],
  // ================= T6 Internationale Küche: Mexiko =================
  T6: [
    ...reihe('beutel', [0.2, 0.22, 0.03], '#f3f0e8', '#3f6b3a', 'La Milpa', [['Weizen-Tortillas', '8 Stück', 1.99], ['Mais-Tortillas', '8 Stück', 2.29, { c: '#e7c45a', a: '#a8342b' }], ['Vollkorn-Wraps', '6 Stück', 2.29, { c: '#d8c7a2' }], ['Mini-Tortillas', '12 Stück', 2.29]]),
    ...reihe('packung', [0.16, 0.12, 0.08], '#d9873a', '#2b2c30', 'La Milpa', [['Taco Shells', '12 Stück', 2.49], ['Burrito Kit', 'für 4', 4.99], ['Fajita Kit', 'für 4', 4.99]]),
    ...reihe('glas', [0.08, 0.13, 0.08], '#f1e7d0', '#a8342b', 'La Milpa', [['Salsa', 'mild · 300 g', 2.49], ['Salsa', 'medium · 300 g', 2.49], ['Salsa', 'hot · 300 g', 2.49, { a: '#7f2620' }], ['Salsa Verde', '300 g', 2.49, { a: '#5d7f3a' }]]),
    ...reihe('glas', [0.07, 0.12, 0.07], '#a8342b', '#e7c45a', 'Sol & Maíz', [['Jalapeños', 'Scheiben · 220 g', 1.99, { c: '#3f6b3a' }], ['Guacamole Dip', '200 g', 2.99, { c: '#5d7f3a' }], ['Cheese Dip', '200 g', 2.79, { c: '#d9a93a' }]]),
    ...reihe('dose', DOSE, '#a5823f', '#2b2c30', 'Sol & Maíz', [['Refried Beans', '430 g', 1.99], ['Chili-Bohnen', 'in Sauce · 400 g', 1.79, { c: '#7f2620' }]]),
    ...reihe('beutel', [0.09, 0.13, 0.02], '#a8342b', '#e7c45a', 'La Milpa', [['Taco-Gewürz', '30 g', 0.99], ['Fajita-Gewürz', '30 g', 0.99, { c: '#d9873a' }], ['Chili-Gewürz', '30 g', 0.99, { c: '#7f2620' }]]),
    P('beutel', [0.22, 0.26, 0.05], '#f3f0e8', '#3f6b3a', 'La Milpa', 'Weizen-Tortillas', '16 Stück', 3.49, { g: 1 }),
    P('packung', [0.18, 0.14, 0.1], '#d9873a', '#2b2c30', 'La Milpa', 'Taco Shells', '24 Stück', 4.29, { g: 1 }),
  ],
  // ================= B1 Öl & Essig =================
  B1: [
    ...reihe('oel', [0.065, 0.29, 0.065], '#2e4a22', '#e3d3a4', 'Casa Verde', [['Olivenöl', 'extra vergine · 750 ml', 9.99], ['Olivenöl', 'mild · 750 ml', 8.49, { c: '#5b6b2a' }]]),
    ...reihe('oel', [0.06, 0.26, 0.06], '#d9c26a', '#3f6b3a', 'Ölmühle Neckar', [['Rapsöl', 'kaltgepresst · 500 ml', 4.49], ['Leinöl', 'kaltgepresst · 250 ml', 3.99, { c: '#c9a24a' }], ['Walnussöl', '250 ml', 5.99, { c: '#8a6a3a' }]]),
    ...reihe('oel', [0.075, 0.3, 0.075], '#d9b84a', '#3f6b3a', 'Basis+', [['Rapsöl', '1 l', 2.29], ['Sonnenblumenöl', '1 l', 1.99, { c: '#e2c45a' }], ['Olivenöl', '1 l', 6.99, { c: '#5b6b2a' }]]),
    P('oel', [0.065, 0.29, 0.065], '#3f5b2a', '#d8c7a2', 'Grünwerk', 'Olivenöl', 'Bio · 750 ml', 10.99),
    ...reihe('flasche', [0.06, 0.26, 0.06], '#2b1a17', '#e3d3a4', 'Casa Verde', [['Aceto Balsamico', 'di Modena · 500 ml', 3.99], ['Crema di Balsamico', '250 ml', 3.49]]),
    ...reihe('flasche', [0.065, 0.28, 0.065], '#e9e2c8', '#3e6a96', 'Basis+', [['Weißweinessig', '750 ml', 1.19], ['Apfelessig', '750 ml', 1.29, { c: '#d9b86a' }], ['Kräuteressig', '750 ml', 1.19, { c: '#c9d0a0' }]]),
    P('oel', [0.11, 0.3, 0.11], '#d9b84a', '#3f6b3a', 'Basis+', 'Sonnenblumenöl', '3 l', 5.49, { g: 1 }),
  ],
  // ================= B2 Gewürze & Brühe =================
  B2: [
    ...reihe('glas', GEW, '#2b2c30', '#a8342b', 'Kochwerk', [['Paprika', 'edelsüß · 50 g', 1.79], ['Paprika', 'rosenscharf · 50 g', 1.79], ['Kreuzkümmel', 'gemahlen · 40 g', 1.99, { a: '#a5823f' }], ['Curry', 'mild · 40 g', 1.99, { a: '#d9a93a' }], ['Kurkuma', '45 g', 1.99, { a: '#e0a52a' }], ['Oregano', '15 g', 1.99, { a: '#6b7a3a' }], ['Basilikum', '15 g', 1.99, { a: '#4f7f3a' }], ['Thymian', '18 g', 1.99, { a: '#6b7a3a' }], ['Rosmarin', '20 g', 1.99, { a: '#5b6b4a' }], ['Zimt', 'gemahlen · 45 g', 1.99, { a: '#8a5a32' }], ['Chiliflocken', '35 g', 1.79, { a: '#8f2a22' }], ['Knoblauch', 'granuliert · 55 g', 1.99, { a: '#e3d3a4' }]]),
    ...reihe('glas', [0.05, 0.14, 0.05], '#2b2c30', '#e3d3a4', 'Kochwerk', [['Pfeffer schwarz', 'Mühle · 50 g', 2.99], ['Pfeffer bunt', 'Mühle · 45 g', 3.29], ['Meersalz', 'Mühle · 100 g', 2.49, { a: '#f3f0e8' }]]),
    ...reihe('packung', [0.06, 0.09, 0.03], '#7f2620', '#e3d3a4', 'Würzhaus', [['Paprika', 'edelsüß · 50 g', 0.99], ['Pfeffer', 'gemahlen · 50 g', 1.19], ['Curry', '50 g', 0.99], ['Kräuter der Provence', '20 g', 1.29], ['Muskatnuss', 'gemahlen · 25 g', 1.49]]),
    ...reihe('packung', [0.1, 0.11, 0.05], '#d9a93a', '#2b2c30', 'Kochwerk', [['Gemüsebrühe', '8 Würfel', 1.29], ['Hühnerbrühe', '8 Würfel', 1.29, { c: '#c9b27a' }]]),
    ...reihe('glas', [0.08, 0.13, 0.08], '#f3f0e8', '#c9a227', 'Basis+', [['Gemüsebrühe', 'Glas · 250 g', 1.49], ['Rinderbrühe', 'Glas · 250 g', 1.49, { a: '#7f2620' }]]),
    P('glas', [0.08, 0.13, 0.08], '#d8c7a2', '#3f6b3a', 'Grünwerk', 'Gemüsebrühe', 'Bio · 250 g', 2.99),
    ...reihe('packung', [0.08, 0.13, 0.05], '#f3f0e8', '#3e6a96', 'Basis+', [['Speisesalz', 'jodiert · 500 g', 0.39], ['Meersalz', 'grob · 500 g', 0.79]]),
  ],
  // ================= B3 Backen =================
  B3: [
    ...reihe('packung', [0.12, 0.19, 0.075], '#f3f0e8', '#3e6a96', 'Basis+', [['Weizenmehl', 'Type 405 · 1 kg', 0.79], ['Weizenmehl', 'Type 550 · 1 kg', 0.89], ['Dinkelmehl', 'Type 630 · 1 kg', 1.49, { a: '#a5823f' }], ['Zucker', 'fein · 1 kg', 1.09, { a: '#b9472f' }], ['Puderzucker', '250 g', 0.89, { a: '#7a1f3d', m: [0.09, 0.14, 0.06] }]]),
    ...reihe('packung', [0.1, 0.12, 0.03], '#c9a227', '#2b2c30', 'Kochwerk', [['Backpulver', '5 × 15 g', 0.79], ['Vanillezucker', '5 × 8 g', 0.79, { c: '#e9d9a6' }], ['Trockenhefe', '3 × 7 g', 0.69, { c: '#d9873a' }]]),
    ...reihe('packung', [0.09, 0.14, 0.06], '#3a2216', '#c9a227', 'Kakaowerk', [['Backkakao', '250 g', 2.49], ['Schoko-Drops', 'zartbitter · 100 g', 1.49]]),
    ...reihe('packung', [0.16, 0.22, 0.06], '#f3ead2', '#7a3b1e', 'Forno Lia', [['Pizzateig', 'Backmischung', 1.99], ['Brownies', 'Backmischung', 2.49], ['Focaccia', 'Backmischung', 1.99]]),
    ...reihe('packung', [0.12, 0.19, 0.075], '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Dinkelmehl', 'Bio · 1 kg', 2.29], ['Rohrohrzucker', 'Bio · 500 g', 1.99]]),
  ],
  // ================= B4 Frühstück & Aufstrich =================
  B4: [
    ...reihe('packung', [0.16, 0.24, 0.06], '#d8c7a2', '#7a3b1e', 'Grünwerk', [['Nussmüsli', 'Bio · 500 g', 3.49], ['Früchtemüsli', 'Bio · 500 g', 3.49, { a: '#a8342b' }], ['Granola', 'Bio · 375 g', 3.99, { a: '#c9a227' }]]),
    ...reihe('packung', [0.13, 0.2, 0.06], '#f3f0e8', '#3f6b3a', 'Basis+', [['Haferflocken', 'zart · 500 g', 0.89], ['Haferflocken', 'kernig · 500 g', 0.89], ['Cornflakes', '375 g', 1.49, { a: '#c9a227', m: [0.17, 0.25, 0.06] }]]),
    ...reihe('glas', [0.07, 0.11, 0.07], '#f3f0e8', '#7a1f3d', 'Hof Neckar', [['Konfitüre', 'Kirsche · 340 g', 2.49], ['Konfitüre', 'Erdbeere · 340 g', 2.49, { a: '#b8322a' }], ['Konfitüre', 'Aprikose · 340 g', 2.49, { a: '#d9873a' }], ['Blütenhonig', '500 g', 4.99, { a: '#c9a227' }]]),
    ...reihe('glas', [0.08, 0.11, 0.08], '#3a2216', '#e3d3a4', 'Kakaowerk', [['Nuss-Nougat-Creme', '400 g', 2.99], ['Erdnussbutter', 'crunchy · 340 g', 2.79, { c: '#a5823f' }]]),
    ...reihe('packung', [0.11, 0.24, 0.05], '#efe4c6', '#7a3b1e', 'Forno Lia', [['Knäckebrot', 'Roggen · 250 g', 1.29], ['Toastbrot', 'Weizen · 500 g', 1.29, { m: [0.12, 0.13, 0.26] }]]),
  ],
  // ================= B5 Kaffee & Tee =================
  B5: [
    ...reihe('packung', [0.1, 0.17, 0.06], '#2b211c', '#c9a227', 'Rösterei Neckar', [['Kaffee', 'gemahlen · 500 g', 6.99], ['Espresso', 'Bohnen · 500 g', 8.99, { c: '#1f1a17' }], ['Café Crème', 'Bohnen · 1 kg', 13.99, { m: [0.12, 0.25, 0.08] }]]),
    ...reihe('packung', [0.1, 0.17, 0.06], '#2b211c', '#b9472f', 'Basis+', [['Kaffee', 'gemahlen · 500 g', 4.49], ['Kaffee', 'entkoffeiniert · 500 g', 4.99]]),
    ...reihe('packung', [0.09, 0.15, 0.06], '#2b211c', '#c9a227', 'Nonna Lia', [['Espresso', 'gemahlen · 250 g', 4.49]]),
    ...reihe('packung', [0.12, 0.08, 0.07], '#2f4f3a', '#e3d3a4', 'Teekontor', [['Earl Grey', '20 Beutel', 2.49, { c: '#22324a' }], ['Grüner Tee', '20 Beutel', 2.49], ['Pfefferminze', '20 Beutel', 1.99, { c: '#3f6b3a' }], ['Kamille', '20 Beutel', 1.99, { c: '#c9a227' }], ['Früchtetee', '20 Beutel', 1.99, { c: '#7a1f3d' }], ['Rooibos', '20 Beutel', 2.29, { c: '#a8342b' }]]),
  ],
  // ================= B6 Süßwaren & Gebäck =================
  B6: [
    ...reihe('tafel', TAFEL, '#3a2216', '#c9a227', 'Kakaowerk', [['Zartbitter', '70 % · 100 g', 1.99], ['Vollmilch', '100 g', 1.49, { c: '#5d3a1a' }], ['Haselnuss', '100 g', 1.69, { c: '#7a4b1a' }], ['Weiße Schokolade', '100 g', 1.49, { c: '#efe4c6', a: '#7a4b1a' }]]),
    ...reihe('tafel', TAFEL, '#1f2120', '#c9a227', 'Cacao Fino', [['Fleur de Sel', '85 % · 80 g', 2.99], ['Orange', '70 % · 80 g', 2.99], ['Chili', '70 % · 80 g', 2.99]]),
    ...reihe('beutel', [0.13, 0.2, 0.05], '#e8dcbf', '#7a3b1e', 'Forno Lia', [['Cantuccini', 'Mandel · 200 g', 2.49], ['Amaretti', '200 g', 2.49, { a: '#a8342b' }]]),
    P('packung', [0.2, 0.08, 0.13], '#efe4c6', '#5d3a1a', 'Forno Lia', 'Savoiardi', 'Löffelbiskuits · 200 g', 1.69),
    ...reihe('packung', [0.15, 0.06, 0.06], '#b8322a', '#f3ead2', 'Knusperei', [['Butterkekse', '200 g', 1.29, { c: '#c9a227' }], ['Schokokekse', '200 g', 1.79, { c: '#5d3a1a' }], ['Haferkekse', '250 g', 1.79]]),
    ...reihe('beutel', [0.14, 0.2, 0.04], '#f3f0e8', '#a8342b', 'Basis+', [['Fruchtgummi', '200 g', 0.99], ['Lakritz', '200 g', 0.99, { a: '#1f2120' }]]),
  ],
  // ================= B7 Knabberartikel =================
  B7: [
    ...reihe('beutel', [0.17, 0.25, 0.07], '#c9a227', '#7f2620', 'Knusperei', [['Chips', 'Paprika · 175 g', 1.79], ['Chips', 'gesalzen · 175 g', 1.79, { c: '#3e6a96' }], ['Chips', 'Sour Cream · 175 g', 1.79, { c: '#3f6b3a' }], ['Kartoffelsticks', '125 g', 1.29, { c: '#d9873a' }]]),
    ...reihe('beutel', [0.17, 0.25, 0.07], '#e7c45a', '#3f6b3a', 'La Milpa', [['Tortilla Chips', 'gesalzen · 200 g', 1.79], ['Tortilla Chips', 'Chili · 200 g', 1.79, { c: '#a8342b' }]]),
    ...reihe('beutel', [0.15, 0.22, 0.06], '#f3f0e8', '#3e6a96', 'Basis+', [['Salzbrezeln', '250 g', 1.19], ['Salzstangen', '250 g', 0.89], ['Erdnüsse', 'geröstet · 200 g', 1.49, { a: '#a5823f' }], ['Popcorn', 'süß · 100 g', 1.29, { a: '#d9873a' }]]),
    ...reihe('beutel', [0.12, 0.17, 0.05], '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Studentenfutter', 'Bio · 200 g', 2.49], ['Reiscracker', 'Bio · 100 g', 1.99]]),
  ],
  // ================= K1–K6 Kühlung =================
  K1: [
    ...reihe('tetra', [0.07, 0.2, 0.07], '#f3f0e8', '#3e6a96', 'Hof Neckar', [['Frische Milch', '3,8 % · 1 l', 1.29], ['Frische Milch', '1,5 % · 1 l', 1.19]]),
    ...reihe('becher', [0.075, 0.07, 0.075], '#f3f0e8', '#3e6a96', 'Hof Neckar', [['Schlagsahne', '200 g', 0.89, { a: '#b9472f' }], ['Schmand', '200 g', 0.79, { a: '#3f6b3a' }], ['Crème fraîche', '200 g', 1.09, { a: '#c9a227' }], ['Saure Sahne', '200 g', 0.79]]),
    ...reihe('becher', [0.1, 0.1, 0.1], '#f3f0e8', '#3f6b3a', 'Alpenhof', [['Naturjoghurt', '3,5 % · 500 g', 0.99], ['Griechischer Joghurt', '10 % · 500 g', 2.29, { a: '#3e6a96' }], ['Magerquark', '500 g', 1.19]]),
    ...reihe('packung', [0.1, 0.06, 0.06], '#e9d38a', '#3e6a96', 'Hof Neckar', [['Butter', 'Süßrahm · 250 g', 2.49], ['Butter', 'gesalzen · 250 g', 2.69, { a: '#b9472f' }]]),
    ...reihe('schale', [0.2, 0.07, 0.11], '#c9b089', '#3f6b3a', 'Hof Neckar', [['Eier', 'Freiland · 10 Stück', 3.29], ['Eier', 'Bio · 6 Stück', 2.79]]),
    ...reihe('tetra', [0.07, 0.2, 0.07], '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Haferdrink', 'Bio · 1 l', 1.79]]),
  ],
  K2: [
    ...reihe('beutel', [0.12, 0.16, 0.03], '#efe4c6', '#1e3d6e', 'Nonna Lia', [['Parmigiano', 'gerieben · 100 g', 2.99], ['Grana Padano', 'gerieben · 100 g', 2.49, { a: '#3f6b3a' }], ['Pecorino', 'gerieben · 100 g', 3.29, { a: '#7f2620' }]]),
    ...reihe('schale', [0.12, 0.05, 0.08], '#efe4c6', '#1e3d6e', 'Nonna Lia', [['Parmigiano', 'Stück · 200 g', 4.99]]),
    ...reihe('beutel', [0.12, 0.15, 0.04], '#f3f0e8', '#3f6b3a', 'Casa Verde', [['Mozzarella', '125 g', 0.99], ['Burrata', '125 g', 2.49, { a: '#3e6a96' }]]),
    ...reihe('schale', [0.14, 0.04, 0.1], '#e9c75a', '#3e6a96', 'Alpenhof', [['Gouda', 'Scheiben · 150 g', 1.69], ['Emmentaler', 'Scheiben · 150 g', 1.89, { c: '#f0dc8a' }], ['Bergkäse', 'Scheiben · 150 g', 2.49, { c: '#d9b25a' }]]),
    ...reihe('beutel', [0.12, 0.17, 0.03], '#d9873a', '#2b2c30', 'Alpenhof', [['Cheddar', 'gerieben · 150 g', 1.99], ['Pizzakäse', 'gerieben · 200 g', 1.79, { c: '#e9c75a' }]]),
    ...reihe('packung', [0.11, 0.05, 0.08], '#f3f0e8', '#3e6a96', 'Hof Neckar', [['Feta', '200 g', 1.79], ['Ricotta', '250 g', 1.69, { m: [0.1, 0.06, 0.1] }]]),
  ],
  K3: [
    ...reihe('schale', [0.18, 0.06, 0.12], '#2f4f3a', '#e3d3a4', 'Fratelli Verdi', [['Tagliatelle', 'frisch · 250 g', 2.49], ['Tortellini', 'Ricotta-Spinat · 250 g', 2.99], ['Ravioli', 'Steinpilz · 250 g', 3.29], ['Gnocchi', 'frisch · 400 g', 1.99]]),
    ...reihe('packung', [0.07, 0.26, 0.07], '#efe4c6', '#b9472f', 'Forno Lia', [['Pizzateig', 'gekühlt · 400 g', 1.99], ['Blätterteig', 'gekühlt · 275 g', 1.49, { a: '#c9a227' }]]),
    ...reihe('packung', [0.07, 0.26, 0.07], '#f3f0e8', '#b9472f', 'Basis+', [['Pizzateig', '400 g', 1.29]]),
  ],
  K4: [
    ...reihe('schale', [0.2, 0.06, 0.14], '#f3f0e8', '#a8342b', 'Hof Neckar', [['Hähnchenbrust', '400 g', 4.99], ['Hackfleisch', 'gemischt · 500 g', 4.49, { a: '#7f2620' }], ['Rinderhack', '400 g', 5.49, { a: '#7f2620' }]]),
    ...reihe('schale', [0.2, 0.05, 0.14], '#f3f0e8', '#3e6a96', 'Nordküste', [['Lachsfilet', '250 g', 5.49], ['Garnelen', 'gekocht · 150 g', 4.49]]),
    ...reihe('packung', [0.14, 0.04, 0.1], '#7f2620', '#e3d3a4', 'Casa Verde', [['Pancetta', 'Würfel · 125 g', 2.29], ['Prosciutto', 'Scheiben · 80 g', 2.99]]),
  ],
  K5: [
    ...reihe('packung', [0.12, 0.05, 0.09], '#d8c7a2', '#3f6b3a', 'Grünwerk', [['Tofu natur', 'Bio · 200 g', 1.99], ['Räuchertofu', 'Bio · 200 g', 2.29], ['Tempeh', 'Bio · 200 g', 2.79], ['Seidentofu', 'Bio · 400 g', 2.49]]),
    ...reihe('schale', [0.16, 0.06, 0.12], '#3f6b3a', '#f3f0e8', 'Grünwerk', [['Veggie-Hack', '250 g', 2.99], ['Falafel', '220 g', 2.49, { c: '#a5823f' }]]),
  ],
  K6: [
    ...reihe('becher', [0.1, 0.12, 0.1], '#3f6b3a', '#f3f0e8', 'Hof Neckar', [['Basilikum', 'im Topf', 1.99], ['Koriander', 'im Topf', 1.99], ['Petersilie', 'im Topf', 1.79], ['Schnittlauch', 'im Topf', 1.79]]),
    ...reihe('beutel', [0.15, 0.2, 0.06], '#f3f0e8', '#5d7f3a', 'Hof Neckar', [['Salat-Mix', '125 g', 1.49], ['Babyspinat', '125 g', 1.69]]),
    ...reihe('schale', [0.15, 0.08, 0.11], '#f3f0e8', '#5d7f3a', 'Hof Neckar', [['Rucola', '125 g', 1.29], ['Feldsalat', '100 g', 1.99]]),
  ],
  // ================= D1–D3 Dessert & TK =================
  D1: [
    ...reihe('becher', [0.11, 0.09, 0.11], '#efe4c6', '#5d7f3a', 'Gelato Lia', [['Gelato', 'Pistazie · 500 ml', 4.49], ['Gelato', 'Stracciatella · 500 ml', 4.49, { a: '#5d3a1a' }], ['Gelato', 'Zitrone · 500 ml', 4.49, { a: '#d9bf45' }], ['Sorbetto', 'Mango · 500 ml', 4.49, { a: '#d9873a' }]]),
    ...reihe('packung', [0.12, 0.08, 0.12], '#e6c3c8', '#7a1f3d', 'Kaizen', [['Mochi', 'Eis · 6 Stück', 4.99], ['Mochi', 'Matcha · 6 Stück', 4.99, { c: '#a8c47a' }]]),
  ],
  D2: [
    ...reihe('becher', [0.08, 0.07, 0.08], '#5d3a1a', '#e3d3a4', 'Forno Lia', [['Tiramisu', '2 × 100 g', 2.49], ['Panna Cotta', 'Beere · 2 × 100 g', 1.99, { c: '#f3f0e8', a: '#a8342b' }]]),
    ...reihe('becher', [0.08, 0.07, 0.08], '#3a2216', '#e3d3a4', 'Hof Neckar', [['Mousse au Chocolat', '2 × 90 g', 1.99], ['Milchreis', 'Zimt · 200 g', 0.99, { c: '#f3f0e8', a: '#8a5a32' }], ['Grießpudding', '200 g', 0.99, { c: '#f3f0e8', a: '#c9a227' }]]),
  ],
  D3: [
    ...reihe('beutel', [0.18, 0.24, 0.05], '#2e4a22', '#e7c45a', 'Grünwerk', [['Wok-Gemüse', 'TK · 750 g', 2.99], ['Edamame', 'TK · 400 g', 2.79, { c: '#3f6b3a' }], ['Erbsen', 'TK · 750 g', 1.99, { c: '#4f7f3a' }]]),
    ...reihe('packung', [0.26, 0.04, 0.26], '#a8342b', '#f3f0e8', 'Forno Lia', [['Pizza Margherita', 'TK · 350 g', 3.49], ['Pizza Funghi', 'TK · 360 g', 3.49, { c: '#5d3a1a' }]]),
    ...reihe('beutel', [0.18, 0.24, 0.05], '#3e6a96', '#f3f0e8', 'Nordküste', [['Garnelen', 'TK · 225 g', 5.99], ['Lachs', 'TK · 2 Filets', 4.99]]),
  ],
  // ================= G1–G3 Wein & Getränke =================
  G1: [
    ...reihe('wein', WEIN, '#2b2116', '#efe8d8', 'Weingut Neckar', [['Lemberger', 'trocken · 2022', 7.9], ['Trollinger', 'Württemberg', 6.5, { a: '#d8c9a8' }], ['Spätburgunder', 'trocken · 2021', 9.5]]),
    ...reihe('wein', WEIN, '#1f2a1f', '#efe8d8', 'Cantina Sole', [['Chianti', 'DOCG · 2021', 8.9], ['Primitivo', 'Puglia · 2022', 7.5, { a: '#7f2620' }], ['Montepulciano', "d'Abruzzo · 2022", 6.9]]),
    ...reihe('wein', WEIN, '#2b2116', '#c9a227', 'Bodega Luz', [['Rioja', 'Crianza · 2020', 9.9], ['Tempranillo', 'La Mancha · 2022', 5.9, { a: '#efe8d8' }]]),
    ...reihe('wein', WEIN, '#1f1a17', '#efe8d8', 'Domaine Clair', [['Côtes du Rhône', '2022', 8.5], ['Merlot', "Pays d'Oc · 2022", 6.5]]),
  ],
  G2: [
    ...reihe('wein', WEIN, '#8a9a5b', '#efe8d8', 'Weingut Neckar', [['Riesling', 'trocken · 2023', 7.5], ['Grauburgunder', 'trocken · 2023', 8.5, { a: '#3e6a96' }], ['Müller-Thurgau', 'feinherb · 2023', 5.9]]),
    ...reihe('wein', WEIN, '#7d8a52', '#efe8d8', 'Cantina Sole', [['Pinot Grigio', 'delle Venezie', 6.9], ['Rosato', 'fruchtig · 2023', 6.9, { c: '#c8a1a1' }], ['Prosecco', 'DOC · extra dry', 7.9, { c: '#4f5f2a', a: '#c9a227' }]]),
    ...reihe('wein', WEIN, '#c8a1a1', '#efe8d8', 'Domaine Clair', [['Rosé', 'Provence · 2023', 9.9], ['Sauvignon Blanc', 'Loire · 2023', 8.9, { c: '#8a9a5b' }]]),
  ],
  G3: [
    ...reihe('flasche', DRINK, '#d9bf45', '#1e3d6e', 'Limonata', [['Limone', '0,5 l', 1.29], ['Aranciata', '0,5 l', 1.29, { c: '#d9873a' }], ['Chinotto', '0,5 l', 1.49, { c: '#3a2216' }], ['Pompelmo', '0,5 l', 1.49, { c: '#e6a4a0' }]]),
    ...reihe('flasche', [0.065, 0.24, 0.065], '#6b4a1e', '#e3d3a4', 'Neckarbräu', [['Helles', 'alkoholfrei · 0,5 l', 1.09], ['Radler', 'alkoholfrei · 0,5 l', 1.09, { c: '#8a7a2a' }], ['Weizen', 'alkoholfrei · 0,5 l', 1.19, { c: '#a8742a' }]]),
    ...reihe('flasche', [0.075, 0.29, 0.075], '#5e8aa6', '#f3f0e8', 'Neckarquelle', [['Mineralwasser', 'medium · 0,75 l', 0.69], ['Mineralwasser', 'still · 0,75 l', 0.69, { c: '#7aa6b8' }], ['Mineralwasser', 'classic · 0,75 l', 0.69, { c: '#3e6a96' }]]),
    ...reihe('dose', [0.066, 0.125, 0.066], '#5d7f5a', '#f3f0e8', 'Umami Lab', [['Eistee', 'Jasmin · 0,33 l', 1.19], ['Eistee', 'Pfirsich · 0,33 l', 1.19, { c: '#d9873a' }]]),
    P('flasche', [0.07, 0.26, 0.07], '#f3f0e8', '#7a1f3d', 'Kaizen', 'Sake', 'alkoholfrei · 0,5 l', 5.99),
    P('flasche', [0.07, 0.26, 0.07], '#a8342b', '#f1e7d0', 'Casa Verde', 'Aperitivo', 'alkoholfrei · 0,7 l', 6.99),
  ],
  // ================= Kasse & Regalköpfe =================
  IMPULS: [
    ...reihe('tafel', TAFEL, '#3a2216', '#c9a227', 'Kakaowerk', [['Zartbitter', '70 % · 100 g', 1.99], ['Chili-Schoko', '100 g', 2.29, { c: '#7f2620' }]]),
    P('becher', [0.1, 0.12, 0.1], '#3f6b3a', '#f3f0e8', 'Hof Neckar', 'Basilikum', 'im Topf', 1.99),
    ...reihe('packung', [0.04, 0.14, 0.03], '#d8c7a2', '#7a3b1e', 'Grünwerk', [['Müsliriegel', 'Bio · 35 g', 0.79], ['Nussriegel', 'Bio · 35 g', 0.99, { a: '#a5823f' }]]),
    P('packung', [0.05, 0.09, 0.02], '#f3f0e8', '#3e6a96', 'Basis+', 'Kaugummi', 'Minze', 0.99),
  ],
};

// Regalköpfe (Zweitplatzierung „Angebot der Woche“): je Gondel ausgewählte Artikel aus den Warengruppen
export const AKTION = {
  M4: ['T1', 'Nonna Lia'],
  M5: ['T3', 'Casa Verde'],
  M6: ['T5', 'Lotus Garden'],
};

// ---------- Planogramm einer Regalfront: Herstellerblöcke senkrecht, Großpackungen unten ----------
// Wird für den 3D-Aufbau UND für das Regalbild in der Infokarte verwendet (gleiches Ergebnis).
// levels = Anzahl normaler Böden (ohne Bückzone ganz unten). Ergebnis: { blocks: [{ brand, w, levels: [[sku…] je Boden von oben]}], bulk: [sku…] }
export function planFace(code, levels = 3) {
  const list = CATALOG[code] || [];
  const normal = list.filter((p) => !p.g);
  const bulk = list.filter((p) => p.g);
  const brands = [];
  for (const p of normal) if (!brands.includes(p.b)) brands.push(p.b);
  const blocks = brands.map((brand) => {
    const items = normal.filter((p) => p.b === brand);
    const cols = Math.max(1, Math.ceil(items.length / levels));
    const lv = Array.from({ length: levels }, () => []);
    // spaltenweise füllen: Sorten derselben Marke stehen untereinander
    items.forEach((p, i) => lv[i % levels].push(p));
    return { brand, cols, levels: lv };
  });
  const total = blocks.reduce((s, b) => s + b.cols, 0) || 1;
  for (const b of blocks) b.w = b.cols / total;
  return { blocks, bulk };
}
