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
  'Trattoria Sole': { st: 'klassik' },
  'Il Campo': { st: 'premium' },
  Feldkorn: { st: 'klassik' },
  Konservenhaus: { st: 'klassik' },
  'Seoul Street': { st: 'asia' },
  'Masala Haus': { st: 'asia' },
  'El Sabor': { st: 'mex' },
  Mittelmeer: { st: 'feinkost' },
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

// ---------- Sortimentstiefe wie im Vollsortimenter: weitere Sorten je Marke ----------
// [Marke, Form, Maße, Grundfarbe, Akzentfarben (rotieren je Sorte), Sorten, Inhalt, Preis]
const S = (b, form, m, c, accents, names, s, pr, o = {}) =>
  names.map((n, i) => P(form, m, c, accents[i % accents.length], b, n, s, Math.round((pr + ((i * 37) % 5) * 0.1) * 100) / 100, o));
const MEHR = {
  T1: [
    S('Nonna Lia', 'packung', NL, '#1e3d6e', ['#e3d3a4'], ['Spaghettoni', 'Capellini', 'Vermicelli', 'Linguine integrali'], 'n. 7 · 500 g', 1.79),
    S('Nonna Lia', 'packung', NK, '#1e3d6e', ['#e3d3a4'], ['Penne lisce', 'Mezze penne', 'Sedanini', 'Conchiglie', 'Gnocchi sardi', 'Pipe rigate', 'Risoni', 'Stelline', 'Ditali rigati', 'Eliche'], '500 g', 1.79),
    S("Molino d'Oro", 'packung', [0.11, 0.2, 0.06], '#efe1b8', ['#1f3a6a'], ['Casarecce', 'Trofie', 'Fusilli lunghi', 'Calamarata', 'Rigatoni', 'Farfalle'], 'Bronze · 500 g', 2.29),
    S('Fratelli Verdi', 'packung', [0.13, 0.16, 0.07], '#2f4f3a', ['#e3d3a4'], ['Tagliolini', 'Cannelloni', 'Bandnudeln', 'Spätzle', 'Suppennudeln'], '250 g', 1.99),
    S('Basis+', 'beutel', [0.14, 0.21, 0.06], '#f3f0e8', ['#b9472f'], ['Spirelli', 'Makkaroni', 'Bandnudeln', 'Muschelnudeln', 'Gabelspaghetti', 'Rigatoni', 'Tortiglioni', 'Sternchen'], '500 g', 0.79),
    S('Grünwerk', 'packung', NK, '#d8c7a2', ['#3f6b3a'], ['Dinkel-Fusilli', 'Erbsen-Fusilli', 'Vollkorn-Fusilli', 'Dinkel-Penne', 'Glutenfrei Penne', 'Glutenfrei Fusilli'], 'Bio · 500 g', 2.19),
    S('Grünwerk', 'packung', NL, '#d8c7a2', ['#3f6b3a'], ['Glutenfrei Spaghetti', 'Vollkorn-Linguine'], 'Bio · 500 g', 2.29),
  ],
  T2: [
    S('Reisgarten', 'packung', [0.12, 0.18, 0.06], '#c8742e', ['#f3ead2'], ['Wildreis-Mix', 'Risotto Carnaroli', 'Sushi-Reis', 'Vollkornreis', 'Roter Reis', 'Paella-Reis', 'Langkorn & Wildreis'], '500 g', 2.49),
    S('Reisgarten', 'packung', [0.12, 0.16, 0.05], '#c8742e', ['#f3ead2'], ['Jasmin', 'Vollkorn', 'Parboiled', 'Milchreis'], 'Kochbeutel · 4 × 125 g', 1.89),
    S('Basis+', 'beutel', [0.13, 0.2, 0.06], '#f3f0e8', ['#3e6a96', '#c9a227', '#3f6b3a'], ['Milchreis', 'Polenta', 'Hartweizengrieß', 'Linsen braun', 'Linsen rot', 'Kichererbsen', 'Weiße Bohnen', 'Gelbe Erbsen', 'Perlgraupen', 'Jasmin-Reis'], '500 g', 0.99),
    S('Grünwerk', 'beutel', [0.12, 0.18, 0.04], '#d8c7a2', ['#3f6b3a'], ['Gelbe Linsen', 'Tellerlinsen', 'Buchweizen', 'Amaranth', 'Couscous Vollkorn', 'Bulgur', 'Basmati', 'Grünkern'], 'Bio · 500 g', 2.39),
    S('Kaizen', 'beutel', [0.13, 0.2, 0.06], '#f3f0e8', ['#b8322a'], ['Jasmin-Reis', 'Sushi-Reis', 'Klebreis'], '1 kg', 3.29),
  ],
  T3: [
    S('Pomodoro Rossa', 'tetra', [0.065, 0.16, 0.05], '#9c2f27', ['#f1e7d0'], ['Passata rustica', 'Polpa Basilico', 'Polpa Knoblauch', 'Passata Datterini'], '500 g', 1.29),
    S('Pomodoro Rossa', 'dose', DOSE, '#9c2f27', ['#e9d9a6'], ['Pelati Basilico', 'Datterini', 'Pomodori a pezzi', 'Polpa fine'], '400 g', 1.19),
    S('Pomodoro Rossa', 'glas', GLAS, '#9c2f27', ['#f1e7d0'], ['Sugo Basilico', 'Sugo Peperoncino', 'Sugo Olive'], '400 g', 2.19),
    S('Casa Verde', 'glas', GLAS, '#f1e7d0', ['#a8342b', '#7f2620', '#4c6b3a', '#8a5a32'], ['Sugo all’Amatriciana', 'Sugo ai Funghi Porcini', 'Sugo alla Norma', 'Sugo al Basilico', 'Sugo Olive e Capperi', 'Sugo Peperoni'], '400 g', 2.39),
    S('Casa Verde', 'glas', GLAS_K, '#f1e7d0', ['#3d5e2e', '#7f2620', '#a5823f'], ['Pesto vegan', 'Pesto Rucola', 'Pesto Pistazie', 'Pesto Walnuss', 'Pesto Tomate-Ricotta'], '190 g', 2.89),
    S('Cucina Bella', 'glas', [0.08, 0.13, 0.08], '#22324a', ['#c9a227', '#b8322a'], ['Arrabbiata', 'Basilico', 'Funghi', 'Vier Käse', 'Carbonara-Sauce', 'Spinat-Ricotta', 'Tomate-Paprika', 'Bolognese'], '400 g', 2.39),
    S('Basis+', 'glas', [0.075, 0.13, 0.075], '#f3f0e8', ['#b9472f', '#3f6b3a', '#c9a227'], ['Napoli', 'Arrabbiata', 'Bolognese', 'Gemüse', 'Pilz', 'Pesto rosso', 'Vier Käse'], '500 g', 1.09),
    S('Basis+', 'dose', DOSE, '#f3f0e8', ['#b9472f'], ['Tomaten geschält', 'Tomaten passiert', 'Tomaten mit Kräutern'], '400 g', 0.59),
    S('Grünwerk', 'glas', GLAS, '#d8c7a2', ['#3f6b3a', '#a8342b'], ['Sugo Gemüse', 'Sugo Arrabbiata', 'Linsen-Bolognese', 'Pesto Genovese', 'Tomatenmark'], 'Bio · 350 g', 2.49),
  ],
  T4: [
    S('Gartenglück', 'dose', DOSE, '#3d6b3a', ['#f3ead2'], ['Brechbohnen', 'Wachsbohnen', 'Mischgemüse', 'Erbsen fein', 'Karotten', 'Sauerkraut', 'Rotkohl', 'Spargel', 'Prinzessbohnen', 'Pfifferlinge'], '400 g', 1.29),
    S('Gartenglück', 'glas', [0.085, 0.16, 0.085], '#3d6b3a', ['#f3ead2'], ['Gewürzgurken', 'Cornichons', 'Rote Bete', 'Mixed Pickles', 'Silberzwiebeln', 'Selleriesalat'], '720 ml', 1.79),
    S('Nonna Lia', 'dose', DOSE, '#f1e7d0', ['#7c5a3a', '#3f6b3a'], ['Lenticchie', 'Fave', 'Fagioli rossi'], '400 g', 1.19),
    S('Nordküste', 'dose', [0.085, 0.045, 0.085], '#f3f0e8', ['#3e6a96', '#2f5d6b'], ['Thunfisch in Öl', 'Thunfisch naturell', 'Sardinen in Öl', 'Makrelenfilets', 'Hering in Tomate', 'Lachs naturell'], '185 g', 2.29),
    S('Basis+', 'dose', DOSE, '#f3f0e8', ['#3f6b3a', '#c9a227', '#b9472f'], ['Schwarze Bohnen', 'Linsen', 'Champignons', 'Mischgemüse', 'Brechbohnen', 'Sauerkraut', 'Rote Bohnen', 'Ravioli in Tomatensauce'], '400 g', 0.69),
    S('Grünwerk', 'glas', [0.075, 0.13, 0.075], '#d8c7a2', ['#3f6b3a'], ['Weiße Bohnen', 'Linsen', 'Rote Bete', 'Sauerkraut'], 'Bio · Glas 350 g', 1.89),
  ],
  T5: [
    S('Kaizen', 'flasche', [0.05, 0.16, 0.05], '#2a1a12', ['#f3f0e8'], ['Sojasauce süß', 'Ponzu', 'Tamari', 'Sushi-Essig'], '150 ml', 2.49, { cap: '#b8322a' }),
    S('Umami Lab', 'flasche', [0.06, 0.19, 0.06], '#1f2120', ['#c9a227', '#b8322a'], ['Fischsauce', 'Chili-Knoblauch', 'Black Bean', 'Teriyaki', 'Yakitori', 'Pad Thai'], '250 ml', 2.69),
    S('Lotus Garden', 'dose', [0.074, 0.12, 0.074], '#2f5d3a', ['#c9a227'], ['Bambussprossen', 'Wasserkastanien', 'Mungobohnensprossen', 'Jackfruit', 'Kokoscreme'], '400 g', 1.89),
    S('Lotus Garden', 'glas', GLAS_K, '#2f5d3a', ['#c9a227', '#b8322a', '#5e8f3a'], ['Massaman-Curry', 'Panang-Curry', 'Tom-Yum-Paste', 'Satay-Sauce', 'Ingwerpaste', 'Zitronengras-Paste'], '110 g', 2.59),
    S('Kaizen', 'packung', [0.11, 0.18, 0.05], '#f3f0e8', ['#b8322a', '#2a1a12'], ['Mie-Nudeln Ei', 'Udon frisch', 'Somen', 'Reisbandnudeln', 'Ramen Shoyu', 'Ramen Miso'], '250 g', 2.29),
    S('Umami Lab', 'beutel', [0.13, 0.19, 0.05], '#1f2120', ['#c9a227', '#b8322a'], ['Instant-Nudeln Huhn', 'Instant-Nudeln Curry', 'Instant-Nudeln Gemüse', 'Glasnudeln', 'Reisnudeln breit'], '5 × 60 g', 1.99),
    S('Kaizen', 'beutel', [0.1, 0.15, 0.04], '#f3f0e8', ['#b8322a', '#3f6b3a'], ['Wasabi-Pulver', 'Shiitake getrocknet', 'Wakame', 'Furikake', 'Sesam schwarz'], '50 g', 2.49),
    S('Lotus Garden', 'beutel', [0.11, 0.15, 0.04], '#2f5d3a', ['#c9a227'], ['Krabbenchips', 'Reispapier', 'Frühlingsrollen-Teig', 'Tapioka-Perlen'], '200 g', 1.99),
  ],
  T6: [
    S('La Milpa', 'beutel', [0.2, 0.22, 0.03], '#f3f0e8', ['#3f6b3a', '#a8342b'], ['Tortillas Chia', 'Tortillas Dinkel', 'Tortillas glutenfrei', 'Tortillas Spinat'], '6 Stück', 2.49),
    S('La Milpa', 'packung', [0.16, 0.12, 0.08], '#d9873a', ['#2b2c30'], ['Enchilada Kit', 'Taco Kit', 'Tostadas', 'Soft Taco Kit'], 'für 4', 4.49),
    S('La Milpa', 'glas', [0.08, 0.13, 0.08], '#f1e7d0', ['#a8342b', '#5d7f3a', '#d9873a'], ['Enchilada-Sauce', 'Taco-Sauce', 'Chipotle-Salsa', 'Mango-Salsa', 'Pico de Gallo'], '300 g', 2.59),
    S('Sol & Maíz', 'dose', DOSE, '#a5823f', ['#2b2c30', '#7f2620'], ['Pinto-Bohnen', 'Schwarze Bohnen', 'Chipotle in Adobo', 'Grüne Chilis', 'Mais-Bohnen-Mix'], '400 g', 1.89),
    S('Sol & Maíz', 'glas', [0.07, 0.12, 0.07], '#3f6b3a', ['#e7c45a', '#a8342b'], ['Jalapeños grün', 'Jalapeños rot', 'Peperoni', 'Habanero-Sauce'], '220 g', 2.09),
    S('La Milpa', 'beutel', [0.09, 0.13, 0.02], '#a8342b', ['#e7c45a'], ['Burrito-Gewürz', 'Guacamole-Gewürz', 'Enchilada-Gewürz', 'Chili-con-Carne-Gewürz'], '30 g', 0.99),
    S('Kochwerk', 'glas', GEW, '#2b2c30', ['#a8342b', '#a5823f', '#6b7a3a'], ['Chipotle gemahlen', 'Kreuzkümmel ganz', 'Oregano mexikanisch', 'Cayennepfeffer'], '40 g', 2.19),
  ],
  B1: [
    S('Casa Verde', 'oel', [0.06, 0.26, 0.06], '#2e4a22', ['#e3d3a4'], ['Olivenöl Toscana', 'Olivenöl Sicilia', 'Olivenöl Zitrone', 'Olivenöl Chili', 'Olivenöl Basilikum'], '500 ml', 7.49),
    S('Ölmühle Neckar', 'oel', [0.06, 0.26, 0.06], '#d9c26a', ['#3f6b3a'], ['Sonnenblumenöl nativ', 'Kürbiskernöl', 'Hanföl', 'Leindotteröl', 'Bratöl'], '500 ml', 4.99),
    S('Basis+', 'oel', [0.075, 0.3, 0.075], '#d9b84a', ['#3f6b3a', '#c9a227'], ['Rapsöl kaltgepresst', 'Erdnussöl', 'Distelöl', 'Maiskeimöl'], '1 l', 2.49),
    S('Grünwerk', 'oel', [0.06, 0.26, 0.06], '#3f5b2a', ['#d8c7a2'], ['Rapsöl', 'Sonnenblumenöl', 'Kokosöl', 'Sesamöl'], 'Bio · 500 ml', 4.49),
    S('Casa Verde', 'flasche', [0.06, 0.24, 0.06], '#2b1a17', ['#e3d3a4', '#c9a227'], ['Balsamico bianco', 'Balsamico Feige', 'Rotweinessig', 'Weißweinessig'], '500 ml', 3.49),
    S('Kochwerk', 'flasche', [0.06, 0.24, 0.06], '#e9e2c8', ['#3e6a96', '#3f6b3a'], ['Himbeeressig', 'Sherryessig', 'Branntweinessig', 'Essig-Essenz'], '500 ml', 1.99),
  ],
  B2: [
    S('Kochwerk', 'glas', GEW, '#2b2c30', ['#a8342b', '#a5823f', '#6b7a3a', '#e0a52a', '#5b6b4a', '#8a5a32'], ['Kardamom', 'Koriander gemahlen', 'Ingwer gemahlen', 'Nelken', 'Lorbeer', 'Majoran', 'Dill', 'Petersilie', 'Schnittlauch', 'Salbei', 'Estragon', 'Kümmel', 'Fenchel', 'Senfsaat', 'Garam Masala', 'Ras el Hanout', 'Za’atar', 'Paprika geräuchert', 'Pfeffer weiß', 'Piment', 'Vanille gemahlen', 'Sumach'], '40 g', 2.19),
    S('Würzhaus', 'packung', [0.06, 0.09, 0.03], '#7f2620', ['#e3d3a4'], ['Oregano', 'Basilikum', 'Thymian', 'Rosmarin', 'Knoblauch', 'Zwiebel granuliert', 'Chili gemahlen', 'Kurkuma', 'Zimt', 'Pizza-Gewürz', 'Grill-Gewürz', 'Hähnchen-Gewürz', 'Salatkräuter', 'Italienische Kräuter'], '30 g', 1.19),
    S('Kochwerk', 'packung', [0.1, 0.11, 0.05], '#d9a93a', ['#2b2c30'], ['Rinderbrühe', 'Gemüsebrühe Bio', 'Fischfond', 'Pilzbrühe'], '8 Würfel', 1.49),
    S('Basis+', 'packung', [0.08, 0.13, 0.05], '#f3f0e8', ['#3e6a96', '#b9472f'], ['Steinsalz', 'Kräutersalz', 'Fleur de Sel', 'Knoblauchsalz'], '250 g', 0.99),
    S('Grünwerk', 'glas', GEW, '#d8c7a2', ['#3f6b3a'], ['Kurkuma', 'Paprika edelsüß', 'Curry', 'Pfeffer schwarz', 'Zimt Ceylon'], 'Bio · 40 g', 2.49),
  ],
  B3: [
    S('Basis+', 'packung', [0.12, 0.19, 0.075], '#f3f0e8', ['#3e6a96', '#a5823f', '#b9472f'], ['Roggenmehl', 'Vollkornmehl', 'Brauner Zucker', 'Gelierzucker', 'Hagelzucker', 'Grieß'], '1 kg', 1.29),
    S('Kochwerk', 'packung', [0.1, 0.12, 0.03], '#c9a227', ['#2b2c30'], ['Natron', 'Bourbon-Vanille', 'Zitronenschale', 'Vanillinzucker', 'Puddingpulver Vanille', 'Puddingpulver Schoko', 'Tortenguss', 'Gelatine'], '3 Stück', 0.89),
    S('Kakaowerk', 'packung', [0.09, 0.14, 0.06], '#3a2216', ['#c9a227'], ['Kuvertüre Zartbitter', 'Kuvertüre Vollmilch', 'Schoko-Raspeln', 'Kakao-Nibs'], '200 g', 1.99),
    S('Forno Lia', 'packung', [0.16, 0.22, 0.06], '#f3ead2', ['#7a3b1e', '#a8342b'], ['Marmorkuchen', 'Muffins', 'Pancakes', 'Waffeln', 'Brot-Backmischung'], 'Backmischung', 2.29),
    S('Grünwerk', 'beutel', [0.12, 0.18, 0.04], '#d8c7a2', ['#3f6b3a'], ['Mandeln gemahlen', 'Haselnüsse gemahlen', 'Kokosraspeln', 'Rosinen', 'Leinsamen', 'Sonnenblumenkerne'], 'Bio · 200 g', 2.19),
  ],
  B4: [
    S('Grünwerk', 'packung', [0.16, 0.24, 0.06], '#d8c7a2', ['#7a3b1e', '#a8342b', '#c9a227', '#3f6b3a'], ['Schoko-Müsli', 'Beeren-Müsli', 'Basis-Müsli', 'Crunchy Hafer', 'Dinkel-Flakes', 'Porridge Apfel'], 'Bio · 500 g', 3.49),
    S('Basis+', 'packung', [0.17, 0.25, 0.06], '#f3f0e8', ['#c9a227', '#b9472f', '#3e6a96'], ['Schoko-Pops', 'Honey Rings', 'Multigrain', 'Knusper-Müsli', 'Früchte-Müsli'], '375 g', 1.59),
    S('Hof Neckar', 'glas', [0.07, 0.11, 0.07], '#f3f0e8', ['#7a1f3d', '#b8322a', '#d9873a', '#3f6b3a', '#5d3a1a'], ['Himbeere', 'Johannisbeere', 'Orange', 'Stachelbeere', 'Pflaume', 'Waldhonig', 'Rapshonig'], '340 g', 2.59),
    S('Kakaowerk', 'glas', [0.08, 0.11, 0.08], '#3a2216', ['#e3d3a4'], ['Nougatcreme dunkel', 'Mandelmus', 'Cashewmus', 'Schoko-Kokos-Creme'], '250 g', 3.29),
    S('Forno Lia', 'packung', [0.11, 0.24, 0.05], '#efe4c6', ['#7a3b1e'], ['Knäckebrot Dinkel', 'Knäckebrot Sesam', 'Zwieback', 'Reiswaffeln'], '200 g', 1.49),
  ],
  B5: [
    S('Rösterei Neckar', 'packung', [0.1, 0.17, 0.06], '#2b211c', ['#c9a227', '#b9472f', '#3e6a96'], ['Kaffee mild', 'Kaffee kräftig', 'Espresso Bar', 'Filterkaffee Bio', 'Kaffee Kolumbien', 'Kaffee Äthiopien'], '500 g', 7.49),
    S('Basis+', 'packung', [0.1, 0.12, 0.08], '#2b211c', ['#b9472f'], ['Kaffeepads Classic', 'Kaffeepads Crema', 'Kapseln Lungo', 'Kapseln Espresso', 'Instant-Kaffee'], '16 Stück', 2.49),
    S('Teekontor', 'packung', [0.12, 0.08, 0.07], '#2f4f3a', ['#e3d3a4'], ['Darjeeling', 'Assam', 'Chai', 'Ingwer-Zitrone', 'Fenchel-Anis', 'Hagebutte', 'Jasmintee', 'Sencha', 'Lavendel-Melisse'], '20 Beutel', 2.29, {}),
    S('Grünwerk', 'packung', [0.12, 0.08, 0.07], '#d8c7a2', ['#3f6b3a'], ['Kräutertee', 'Grüner Tee', 'Rooibos Vanille', 'Pfefferminz'], 'Bio · 20 Beutel', 2.49),
  ],
  B6: [
    S('Kakaowerk', 'tafel', TAFEL, '#3a2216', ['#c9a227', '#a8342b', '#3f6b3a', '#d9873a'], ['Nuss-Splitter', 'Rum-Trauben-Nuss', 'Joghurt', 'Marzipan', 'Erdbeer', 'Knusperflakes', 'Kokos', 'Pfefferminz', 'Zartbitter 85 %', 'Karamell-Salz'], '100 g', 1.69),
    S('Cacao Fino', 'tafel', TAFEL, '#1f2120', ['#c9a227'], ['Mandel', 'Pistazie', 'Himbeere', 'Espresso'], '80 g', 2.99),
    S('Knusperei', 'packung', [0.15, 0.06, 0.06], '#b8322a', ['#f3ead2'], ['Doppelkekse', 'Waffeln', 'Spekulatius', 'Zimtsterne', 'Kokosmakronen', 'Schoko-Cookies', 'Vollkornkekse'], '200 g', 1.69),
    S('Basis+', 'beutel', [0.14, 0.2, 0.04], '#f3f0e8', ['#a8342b', '#3f6b3a', '#c9a227', '#1f2120'], ['Saure Würmer', 'Goldbärchen', 'Weingummi', 'Schaumzucker', 'Bonbons Zitrone', 'Karamellbonbons'], '200 g', 0.99),
    S('Forno Lia', 'beutel', [0.13, 0.2, 0.05], '#e8dcbf', ['#7a3b1e', '#a8342b'], ['Biscotti Schoko', 'Ricciarelli', 'Baci di Dama', 'Panforte'], '200 g', 2.79),
  ],
  B7: [
    S('Knusperei', 'beutel', [0.17, 0.25, 0.07], '#c9a227', ['#7f2620', '#3e6a96', '#3f6b3a', '#1f2120'], ['Chips Salt & Vinegar', 'Chips Chili', 'Chips Rosmarin', 'Chips Trüffel', 'Kesselchips', 'Wellenchips'], '150 g', 1.99),
    S('Basis+', 'beutel', [0.15, 0.22, 0.06], '#f3f0e8', ['#3e6a96', '#a5823f', '#d9873a', '#a8342b'], ['Erdnussflips', 'Cracker', 'Cashews', 'Mandeln', 'Pistazien', 'Party-Mix', 'Kartoffelchips', 'Mais-Snack'], '200 g', 1.59),
    S('La Milpa', 'beutel', [0.17, 0.25, 0.07], '#e7c45a', ['#3f6b3a', '#a8342b'], ['Tortilla Chips Käse', 'Tortilla Chips Limette', 'Nachos Bio'], '200 g', 1.89),
    S('Grünwerk', 'beutel', [0.12, 0.17, 0.05], '#d8c7a2', ['#3f6b3a'], ['Linsenchips', 'Gemüsechips', 'Dinkelbrezeln', 'Nussmix'], 'Bio · 100 g', 2.29),
  ],
  K1: [
    S('Alpenhof', 'becher', [0.075, 0.08, 0.075], '#f3f0e8', ['#3f6b3a', '#a8342b', '#7a1f3d', '#d9873a', '#5d3a1a'], ['Joghurt Erdbeere', 'Joghurt Himbeere', 'Joghurt Pfirsich', 'Joghurt Stracciatella', 'Joghurt Vanille', 'Joghurt Kirsche'], '150 g', 0.59),
    S('Hof Neckar', 'tetra', [0.07, 0.2, 0.07], '#f3f0e8', ['#3e6a96', '#3f6b3a', '#c9a227'], ['Buttermilch', 'Kefir', 'Laktosefreie Milch', 'Kakao-Milch'], '1 l', 1.39),
    S('Hof Neckar', 'becher', [0.1, 0.09, 0.1], '#f3f0e8', ['#3e6a96', '#c9a227'], ['Speisequark 20 %', 'Kräuterquark', 'Skyr', 'Hüttenkäse'], '250 g', 1.19),
    S('Grünwerk', 'tetra', [0.07, 0.2, 0.07], '#d8c7a2', ['#3f6b3a', '#a5823f'], ['Mandeldrink', 'Sojadrink', 'Barista Hafer'], 'Bio · 1 l', 1.99),
    S('Basis+', 'becher', [0.075, 0.07, 0.075], '#f3f0e8', ['#b9472f', '#3e6a96'], ['Kochsahne', 'Schlagsahne', 'Schmand', 'Crème fraîche'], '200 g', 0.69),
  ],
  K2: [
    S('Alpenhof', 'schale', [0.14, 0.04, 0.1], '#e9c75a', ['#3e6a96', '#3f6b3a', '#7f2620'], ['Tilsiter', 'Butterkäse', 'Leerdamer-Art', 'Edamer', 'Maasdamer', 'Appenzeller-Art'], 'Scheiben · 150 g', 1.89),
    S('Casa Verde', 'packung', [0.11, 0.05, 0.08], '#f3f0e8', ['#3f6b3a', '#3e6a96', '#a8342b'], ['Mascarpone', 'Gorgonzola', 'Taleggio', 'Mozzarella di Bufala', 'Scamorza'], '200 g', 2.79),
    S('Hof Neckar', 'packung', [0.11, 0.05, 0.08], '#f3f0e8', ['#3e6a96', '#c9a227'], ['Frischkäse natur', 'Frischkäse Kräuter', 'Camembert', 'Brie', 'Hirtenkäse', 'Halloumi'], '200 g', 1.79),
    S('Basis+', 'beutel', [0.12, 0.17, 0.03], '#f3f0e8', ['#b9472f', '#c9a227'], ['Gouda gerieben', 'Emmentaler gerieben', 'Mozzarella gerieben'], '200 g', 1.49),
  ],
  K3: [
    S('Fratelli Verdi', 'schale', [0.18, 0.06, 0.12], '#2f4f3a', ['#e3d3a4'], ['Tortelloni Käse', 'Ravioli Spinat', 'Cappelletti', 'Pappardelle frisch', 'Lasagne frisch', 'Gnocchi Kartoffel'], '250 g', 2.79),
    S('Forno Lia', 'packung', [0.07, 0.26, 0.07], '#efe4c6', ['#b9472f', '#c9a227', '#3f6b3a'], ['Flammkuchenteig', 'Quiche-Teig', 'Croissant-Teig', 'Strudelteig'], 'gekühlt', 1.69),
    S('Basis+', 'schale', [0.18, 0.06, 0.12], '#f3f0e8', ['#b9472f'], ['Tortellini', 'Spätzle frisch', 'Schupfnudeln'], '400 g', 1.49),
  ],
  K4: [
    S('Hof Neckar', 'schale', [0.2, 0.06, 0.14], '#f3f0e8', ['#a8342b', '#7f2620'], ['Hähnchenschenkel', 'Putenbrust', 'Schweinefilet', 'Rinderhüftsteak', 'Bratwurst', 'Hähnchen-Geschnetzeltes'], '400 g', 4.79),
    S('Nordküste', 'schale', [0.2, 0.05, 0.14], '#f3f0e8', ['#3e6a96'], ['Räucherlachs', 'Kabeljau', 'Forelle geräuchert', 'Thunfischsteak'], '200 g', 4.99),
    S('Casa Verde', 'packung', [0.14, 0.04, 0.1], '#7f2620', ['#e3d3a4'], ['Salami Milano', 'Coppa', 'Bresaola', 'Mortadella'], '80 g', 2.79),
  ],
  K5: [
    S('Grünwerk', 'packung', [0.12, 0.05, 0.09], '#d8c7a2', ['#3f6b3a', '#a5823f'], ['Tofu Kräuter', 'Tofu geräuchert Mandel', 'Seitan', 'Lupinen-Filet'], 'Bio · 200 g', 2.59),
    S('Grünwerk', 'schale', [0.16, 0.06, 0.12], '#3f6b3a', ['#f3f0e8'], ['Veggie-Burger', 'Veggie-Nuggets', 'Veggie-Bratwurst', 'Hummus natur', 'Hummus Paprika', 'Gemüse-Bällchen'], '200 g', 2.79),
  ],
  K6: [
    S('Hof Neckar', 'becher', [0.1, 0.12, 0.1], '#3f6b3a', ['#f3f0e8'], ['Thymian', 'Rosmarin', 'Minze', 'Dill'], 'im Topf', 1.99),
    S('Hof Neckar', 'beutel', [0.15, 0.2, 0.06], '#f3f0e8', ['#5d7f3a'], ['Eisbergsalat geschnitten', 'Rucola-Mix', 'Asia-Salat', 'Krautsalat'], '150 g', 1.59),
  ],
  D1: [
    S('Gelato Lia', 'becher', [0.11, 0.09, 0.11], '#efe4c6', ['#5d3a1a', '#a8342b', '#c9a227', '#7a1f3d'], ['Gelato Cioccolato', 'Gelato Fragola', 'Gelato Vaniglia', 'Gelato Amarena', 'Gelato Caffè', 'Sorbetto Limone'], '500 ml', 4.49),
    S('Basis+', 'packung', [0.16, 0.08, 0.1], '#f3f0e8', ['#3e6a96', '#5d3a1a'], ['Eis am Stiel Vanille', 'Eis am Stiel Schoko', 'Eis-Sandwich'], '6 Stück', 2.99),
  ],
  D2: [
    S('Forno Lia', 'becher', [0.08, 0.07, 0.08], '#5d3a1a', ['#e3d3a4'], ['Tiramisu Pistazie', 'Cannolo-Creme', 'Zabaione'], '2 × 100 g', 2.69),
    S('Hof Neckar', 'becher', [0.08, 0.07, 0.08], '#f3f0e8', ['#a8342b', '#c9a227', '#5d3a1a', '#3f6b3a'], ['Rote Grütze', 'Vanillepudding', 'Schokopudding', 'Quarkspeise Beere', 'Crème brûlée', 'Kokos-Pudding'], '200 g', 1.29),
  ],
  D3: [
    S('Grünwerk', 'beutel', [0.18, 0.24, 0.05], '#2e4a22', ['#e7c45a', '#3f6b3a'], ['Spinat', 'Brokkoli', 'Kräuter-Mix', 'Beeren-Mix', 'Mango-Würfel'], 'TK · 450 g', 2.79),
    S('Forno Lia', 'packung', [0.26, 0.04, 0.26], '#a8342b', ['#f3f0e8'], ['Pizza Diavola', 'Pizza Verdure', 'Flammkuchen'], 'TK · 350 g', 3.49),
    S('Basis+', 'beutel', [0.18, 0.24, 0.05], '#3e6a96', ['#f3f0e8'], ['Pommes', 'Rösti', 'Gemüsepfanne', 'Kaiserschoten'], 'TK · 750 g', 1.99),
  ],
  G1: [
    S('Weingut Neckar', 'wein', WEIN, '#2b2116', ['#efe8d8', '#d8c9a8'], ['Dornfelder', 'Schwarzriesling', 'Samtrot', 'Cuvée Rot'], 'Württemberg', 7.2),
    S('Cantina Sole', 'wein', WEIN, '#1f2a1f', ['#efe8d8', '#7f2620'], ['Nero d’Avola', 'Valpolicella', 'Barbera', 'Sangiovese', 'Negroamaro'], 'Italien', 7.9),
    S('Bodega Luz', 'wein', WEIN, '#2b2116', ['#c9a227', '#efe8d8'], ['Garnacha', 'Monastrell', 'Rioja Reserva'], 'Spanien', 8.5),
    S('Domaine Clair', 'wein', WEIN, '#1f1a17', ['#efe8d8'], ['Bordeaux', 'Beaujolais', 'Cabernet Sauvignon', 'Pinot Noir'], 'Frankreich', 8.9),
  ],
  G2: [
    S('Weingut Neckar', 'wein', WEIN, '#8a9a5b', ['#efe8d8', '#3e6a96'], ['Weißburgunder', 'Kerner', 'Silvaner', 'Sekt Riesling', 'Rosé Trollinger'], 'Württemberg', 7.5),
    S('Cantina Sole', 'wein', WEIN, '#7d8a52', ['#efe8d8', '#c9a227'], ['Soave', 'Vermentino', 'Lugana', 'Frizzante'], 'Italien', 7.9),
    S('Domaine Clair', 'wein', WEIN, '#8a9a5b', ['#efe8d8'], ['Chardonnay', 'Muscadet', 'Crémant'], 'Frankreich', 9.5),
    S('Bodega Luz', 'wein', WEIN, '#7d8a52', ['#c9a227'], ['Verdejo', 'Rosado', 'Cava'], 'Spanien', 6.9),
  ],
  G3: [
    S('Limonata', 'flasche', DRINK, '#d9bf45', ['#1e3d6e'], ['Rabarbaro', 'Mandarino', 'Cedrata', 'Gassosa'], '0,5 l', 1.49),
    S('Neckarquelle', 'flasche', [0.075, 0.29, 0.075], '#5e8aa6', ['#f3f0e8'], ['Apfelschorle', 'Johannisbeerschorle', 'Rhabarberschorle', 'Ingwer-Zitrone'], '0,75 l', 1.19),
    S('Neckarbräu', 'flasche', [0.065, 0.24, 0.065], '#6b4a1e', ['#e3d3a4'], ['Pils alkoholfrei', 'Dunkel alkoholfrei', 'Malzbier'], '0,5 l', 1.09),
    S('Basis+', 'tetra', [0.08, 0.2, 0.06], '#f3f0e8', ['#d9873a', '#a8342b', '#3f6b3a'], ['Orangensaft', 'Apfelsaft', 'Multivitamin', 'Traubensaft', 'Tomatensaft'], '1 l', 1.19),
    S('Teekontor', 'flasche', DRINK, '#2f4f3a', ['#e3d3a4'], ['Eistee Pfirsich', 'Eistee Zitrone', 'Mate'], '0,5 l', 1.69),
  ],
};
for (const [k, lists] of Object.entries(MEHR)) {
  const extra = lists.flat();
  // Normalgrößen vor die Großpackungen einreihen
  const big = CATALOG[k].filter((p) => p.g);
  CATALOG[k] = [...CATALOG[k].filter((p) => !p.g), ...extra, ...big];
}

// ---------- zweite Ausbaustufe: weitere Marken für die Gondeln, damit jede Sorte nur 1–3 Facings braucht ----------
const MEHR2 = {
  T1: [
    S('Il Campo', 'packung', [0.12, 0.2, 0.06], '#7a2e22', ['#e3d3a4'], ['Strozzapreti', 'Cavatelli', 'Fusilloni', 'Lumache', 'Radiatori', 'Candele'], 'Trafilata · 500 g', 2.49),
    S('Il Campo', 'packung', [0.075, 0.27, 0.035], '#7a2e22', ['#e3d3a4'], ['Spaghetti alla chitarra', 'Pici', 'Ziti lunghi'], 'Trafilata · 500 g', 2.59),
    S('Feldkorn', 'packung', [0.13, 0.17, 0.06], '#e7c45a', ['#2f4f3a'], ['Eierspätzle', 'Schupfnudeln', 'Hörnle', 'Eiernudeln breit', 'Fadennudeln'], '500 g', 1.69),
  ],
  T2: [
    S('Feldkorn', 'packung', [0.12, 0.18, 0.06], '#e7c45a', ['#2f4f3a', '#a8342b'], ['Haferflocken zart', 'Dinkelgrieß', 'Hirse', 'Gerstengraupen', 'Weizen-Couscous', 'Polenta Instant', 'Buchweizengrütze', 'Quinoa weiß', 'Quinoa rot', 'Bulgur fein'], '500 g', 1.79),
    S('Mittelmeer', 'packung', [0.12, 0.18, 0.06], '#2f5d6b', ['#e3d3a4'], ['Couscous Perl', 'Freekeh', 'Belugalinsen', 'Puy-Linsen', 'Cannellini', 'Borlotti', 'Riesenbohnen', 'Kichererbsen groß'], '400 g', 2.69),
    S('Reisgarten', 'packung', [0.12, 0.18, 0.06], '#c8742e', ['#f3ead2'], ['Basmati Royal', 'Jasmin Thai', 'Arborio', 'Vialone Nano', 'Camargue-Reis', 'Schwarzer Reis', 'Langkorn', 'Spitzen-Langkorn'], '1 kg', 2.99),
    S('Masala Haus', 'beutel', [0.13, 0.2, 0.05], '#d9873a', ['#7f2620'], ['Basmati Indien', 'Mung Dal', 'Chana Dal', 'Toor Dal', 'Urid Dal'], '500 g', 2.29),
  ],
  T3: [
    S('Trattoria Sole', 'glas', GLAS, '#efe1b8', ['#a8342b', '#7f2620', '#4c6b3a', '#c9a227'], ['Sugo Napoletana', 'Sugo Puttanesca', 'Sugo Pomodorini', 'Sugo Salsiccia', 'Ragù Bolognese', 'Ragù di Cinghiale', 'Sugo Tonno', 'Sugo Melanzane', 'Sugo Zucchine', 'Sugo Ricotta'], '350 g', 2.69),
    S('Trattoria Sole', 'glas', GLAS_K, '#efe1b8', ['#3d5e2e', '#a8342b', '#7f2620'], ['Pesto Genovese', 'Pesto Rosso', 'Pesto Siciliano', 'Pesto Trapanese', 'Pesto Bärlauch', 'Pesto Calabrese'], '190 g', 2.79),
    S('Il Campo', 'glas', [0.08, 0.14, 0.08], '#7a2e22', ['#e3d3a4'], ['Passata Datterino', 'Passata Ciliegino', 'Passata gialla', 'Pomodori gialli'], '500 g', 3.29),
    S('Mittelmeer', 'glas', GLAS_K, '#2f5d6b', ['#e3d3a4', '#4c6b3a'], ['Getrocknete Tomaten', 'Tomaten-Tapenade', 'Oliven-Tapenade', 'Artischocken-Creme', 'Paprika-Creme'], '180 g', 2.99),
    S('Pomodoro Rossa', 'tetra', [0.065, 0.16, 0.05], '#9c2f27', ['#f1e7d0'], ['Tomaten stückig', 'Tomaten stückig Kräuter', 'Tomaten stückig Chili', 'Passata fein', 'Polpa Zwiebel'], '390 g', 1.19),
    S('Cucina Bella', 'glas', [0.08, 0.13, 0.08], '#22324a', ['#c9a227', '#b8322a'], ['Tomate-Burrata', 'Gorgonzola', 'Lachs-Sahne', 'Pilz-Rahm', 'Zucchini-Minze', 'Paprika-Chili'], '400 g', 2.39),
    S('Cucina Bella', 'flasche', [0.06, 0.18, 0.06], '#22324a', ['#c9a227'], ['Pizzasauce', 'Lasagnesauce weiß', 'Béchamel'], '500 ml', 1.99),
    S('Basis+', 'tetra', [0.065, 0.16, 0.05], '#f3f0e8', ['#b9472f'], ['Passierte Tomaten', 'Tomaten fein gehackt', 'Tomaten stückig'], '500 g', 0.55),
    S('Basis+', 'dose', DOSE_K, '#f3f0e8', ['#b9472f'], ['Tomatenmark', 'Tomatenmark 3-fach', 'Tomatenmark Kräuter'], '200 g', 0.69),
    S('Grünwerk', 'tetra', [0.065, 0.16, 0.05], '#d8c7a2', ['#3f6b3a', '#a8342b'], ['Passata', 'Tomaten stückig', 'Tomaten Basilikum', 'Tomaten Knoblauch'], 'Bio · 500 g', 1.49),
  ],
  T4: [
    S('Konservenhaus', 'dose', DOSE, '#e3d3a4', ['#2f4f3a', '#7f2620', '#c9a227', '#3e6a96'], ['Erbsen & Möhren', 'Junge Erbsen', 'Kidneybohnen', 'Gemüsemais', 'Weiße Riesenbohnen', 'Grüne Bohnen', 'Champignons 1. Wahl', 'Schwarzwurzeln', 'Leipziger Allerlei', 'Rosenkohl', 'Baby-Karotten', 'Linsen mit Suppengrün'], '400 g', 1.39),
    S('Konservenhaus', 'dose', DOSE_G, '#e3d3a4', ['#7f2620', '#2f4f3a', '#c9a227'], ['Linseneintopf', 'Erbseneintopf', 'Gulaschsuppe', 'Kartoffelsuppe', 'Bohneneintopf', 'Hühnersuppe', 'Gemüseeintopf', 'Chili con Carne'], '800 g', 2.49),
    S('Gartenglück', 'dose', DOSE_K, '#3d6b3a', ['#f3ead2'], ['Mais', 'Kidneybohnen', 'Kichererbsen', 'Erbsen', 'Champignons', 'Mandarinen', 'Pfirsiche', 'Ananas'], '212 ml', 0.89),
    S('Gartenglück', 'dose', DOSE, '#e7c45a', ['#3d6b3a', '#a8342b'], ['Pfirsiche halbe', 'Birnen halbe', 'Aprikosen', 'Sauerkirschen', 'Fruchtcocktail', 'Mango-Stücke', 'Ananas Scheiben', 'Mandarin-Orangen'], '425 ml', 1.69),
    S('Mittelmeer', 'glas', [0.075, 0.13, 0.075], '#2f5d6b', ['#e3d3a4', '#4c6b3a', '#7f2620'], ['Oliven grün', 'Oliven schwarz', 'Kalamata-Oliven', 'Antipasti-Mix', 'Artischockenherzen', 'Grillpaprika', 'Peperoncini', 'Kapern'], '280 g', 2.79),
    S('Nordküste', 'dose', [0.11, 0.035, 0.07], '#2f5d6b', ['#f3f0e8', '#a8342b'], ['Heringsfilets Senf', 'Heringsfilets Dill', 'Sprotten', 'Ölsardinen Zitrone', 'Makrele Pfeffer', 'Thunfisch Salat'], '200 g', 1.89),
    S('Basis+', 'glas', [0.085, 0.16, 0.085], '#f3f0e8', ['#3f6b3a', '#b9472f'], ['Gewürzgurken', 'Gurkensticks', 'Rotkohl', 'Rote Bete Scheiben', 'Paprika-Streifen', 'Sellerie', 'Apfelmus', 'Sauerkirschen'], '720 ml', 0.99),
  ],
  T5: [
    S('Seoul Street', 'flasche', [0.06, 0.18, 0.06], '#b8322a', ['#f3f0e8', '#2a1a12'], ['Gochujang-Sauce', 'Bulgogi-Marinade', 'Korean BBQ', 'Kimchi-Base', 'Sesam-Dressing', 'Yangnyeom'], '300 ml', 3.29),
    S('Seoul Street', 'glas', [0.08, 0.1, 0.08], '#b8322a', ['#f3f0e8'], ['Gochujang', 'Doenjang', 'Ssamjang', 'Kimchi'], '250 g', 3.49),
    S('Seoul Street', 'beutel', [0.13, 0.19, 0.05], '#b8322a', ['#2a1a12', '#c9a227'], ['Ramyun scharf', 'Ramyun Käse', 'Jjajang-Nudeln', 'Glasnudeln Japchae', 'Reiskuchen Tteok'], '120 g', 1.69),
    S('Masala Haus', 'glas', GLAS, '#d9873a', ['#7f2620', '#3f6b3a', '#c9a227'], ['Tikka Masala', 'Korma', 'Butter Chicken', 'Madras', 'Vindaloo', 'Jalfrezi', 'Palak', 'Dal Makhani'], '350 g', 2.79),
    S('Masala Haus', 'glas', GLAS_K, '#d9873a', ['#7f2620', '#3f6b3a'], ['Mango Chutney', 'Limetten-Pickle', 'Tamarinden-Chutney', 'Currypaste mild', 'Currypaste scharf', 'Tandoori-Paste'], '200 g', 2.49),
    S('Masala Haus', 'packung', [0.14, 0.2, 0.05], '#d9873a', ['#7f2620'], ['Naan Knoblauch', 'Naan natur', 'Papadams', 'Chapati'], '4 Stück', 2.29),
    S('Lotus Garden', 'dose', [0.074, 0.12, 0.074], '#2f5d3a', ['#c9a227', '#f3f0e8'], ['Kokosmilch light', 'Kokoswasser', 'Litschis', 'Bambussprossen Streifen'], '400 ml', 1.69),
    S('Lotus Garden', 'flasche', [0.06, 0.2, 0.06], '#2f5d3a', ['#c9a227', '#b8322a'], ['Süß-sauer-Sauce', 'Hoisin', 'Austernsauce', 'Sweet Chili', 'Sriracha', 'Pflaumensauce'], '250 ml', 2.29),
    S('Kaizen', 'flasche', [0.05, 0.16, 0.05], '#f3f0e8', ['#b8322a', '#2a1a12'], ['Mirin', 'Reisessig', 'Sesamöl geröstet', 'Yuzu-Ponzu', 'Okonomi-Sauce', 'Tonkatsu-Sauce'], '150 ml', 2.99),
  ],
  T6: [
    S('El Sabor', 'packung', [0.16, 0.13, 0.08], '#2b2c30', ['#e7c45a', '#a8342b'], ['Fajita Kit', 'Burrito Kit', 'Quesadilla Kit', 'Nacho Kit', 'Taco Shells', 'Taco Shells Blau'], 'für 4', 3.99),
    S('El Sabor', 'glas', [0.08, 0.13, 0.08], '#2b2c30', ['#a8342b', '#e7c45a', '#5d7f3a'], ['Salsa Roja', 'Salsa Verde', 'Salsa Chipotle', 'Cheese Dip', 'Bean Dip', 'Guacamole Dip', 'Salsa Habanero', 'Mole Poblano'], '300 g', 2.69),
    S('El Sabor', 'flasche', [0.05, 0.15, 0.05], '#2b2c30', ['#a8342b', '#5d7f3a', '#e7c45a'], ['Hot Sauce Roja', 'Hot Sauce Verde', 'Chipotle Sauce', 'Habanero Sauce', 'Lime Hot Sauce'], '150 ml', 2.99),
    S('Sol & Maíz', 'beutel', [0.18, 0.24, 0.07], '#e7c45a', ['#a8342b', '#3f6b3a', '#2b2c30'], ['Tortilla-Chips Salz', 'Tortilla-Chips Chili', 'Tortilla-Chips Käse', 'Tortilla-Chips Limette', 'Tortilla-Chips Blau'], '200 g', 1.79),
    S('Sol & Maíz', 'packung', [0.12, 0.18, 0.06], '#a5823f', ['#2b2c30'], ['Masa Harina', 'Maismehl gelb', 'Maisgrieß', 'Reis Mexicana'], '1 kg', 3.49),
    S('Sol & Maíz', 'dose', DOSE, '#a5823f', ['#2b2c30', '#7f2620', '#3f6b3a'], ['Refried Beans', 'Refried Beans scharf', 'Mais mit Paprika', 'Tomatillos', 'Nopales'], '400 g', 2.29),
    S('La Milpa', 'beutel', [0.2, 0.22, 0.03], '#f3f0e8', ['#e7c45a', '#a8342b'], ['Tortillas Mais', 'Tortillas Weizen groß', 'Tortillas Vollkorn', 'Tortillas Mini'], '8 Stück', 2.19),
  ],
  B1: [
    S('Mittelmeer', 'oel', [0.06, 0.26, 0.06], '#2f5d6b', ['#e3d3a4'], ['Olivenöl Kreta', 'Olivenöl Andalusien', 'Olivenöl Peloponnes', 'Olivenöl Apulien'], '500 ml', 8.49),
  ],
  D2: [
    S('Basis+', 'becher', [0.08, 0.07, 0.08], '#f3f0e8', ['#3e6a96', '#5d3a1a', '#c9a227'], ['Sahnepudding Vanille', 'Sahnepudding Schoko', 'Karamellpudding', 'Grießbrei', 'Milchreis Kirsch'], '200 g', 0.59),
    S('Gelato Lia', 'becher', [0.08, 0.07, 0.08], '#f3ead2', ['#7a1f3d', '#5d3a1a', '#3f6b3a'], ['Panna Cotta Karamell', 'Mousse Pistazie', 'Semifreddo', 'Affogato-Creme'], '2 × 90 g', 2.79),
  ],
  G1: [
    S('Cantina Sole', 'wein', WEIN, '#1f2a1f', ['#efe8d8', '#7f2620'], ['Chianti Classico', 'Aglianico', 'Dolcetto', 'Rosso di Montalcino'], 'Italien', 9.9),
    S('Bodega Luz', 'wein', WEIN, '#3a1f1a', ['#c9a227'], ['Rioja Crianza', 'Tempranillo', 'Ribera del Duero'], 'Spanien', 7.5),
    S('Domaine Clair', 'wein', WEIN, '#2b2116', ['#efe8d8'], ['Minervois', 'Corbières', 'Syrah'], 'Frankreich', 7.9),
  ],
  G2: [
    S('Weingut Neckar', 'wein', WEIN, '#8a9a5b', ['#efe8d8'], ['Riesling feinherb', 'Muskateller', 'Gewürztraminer', 'Sauvignon Blanc', 'Schillerwein'], 'Württemberg', 7.5),
    S('Cantina Sole', 'wein', WEIN, '#7d8a52', ['#efe8d8'], ['Grillo', 'Falanghina', 'Gavi', 'Bianco Frizzante'], 'Italien', 7.9),
  ],
  IMPULS: [
    S('Knusperei', 'packung', [0.04, 0.14, 0.03], '#e7c45a', ['#7a3b1e', '#a8342b'], ['Erdnussriegel', 'Karamellriegel', 'Kokosriegel'], '40 g', 0.89),
    S('Kakaowerk', 'tafel', [0.06, 0.12, 0.012], '#3a2216', ['#c9a227', '#a8342b'], ['Mini Nuss', 'Mini Vollmilch'], '40 g', 0.79),
    // Kassenzone: kleine Mitnahmeartikel in vielen Sorten
    S('Kakaowerk', 'tafel', TAFEL, '#3a2216', ['#c9a227', '#a8342b', '#3f6b3a', '#e3d3a4'], ['Vollmilch', 'Haselnuss', 'Meersalz', 'Minze', 'Weiße Schokolade', 'Mandel'], '100 g', 1.79),
    S('Cacao Fino', 'tafel', TAFEL, '#efe1b8', ['#7a3b1e', '#a8342b', '#3f6b3a'], ['Grand Cru 85 %', 'Pistazie', 'Orange'], '80 g', 2.99),
    S('Knusperei', 'packung', [0.04, 0.14, 0.03], '#e7c45a', ['#3f6b3a', '#5d3a1a', '#3e6a96'], ['Proteinriegel', 'Schokoriegel', 'Waffelriegel', 'Joghurtriegel'], '40 g', 0.99),
    S('Grünwerk', 'packung', [0.04, 0.14, 0.03], '#d8c7a2', ['#a8342b', '#3f6b3a', '#c9a227'], ['Dattelriegel', 'Fruchtriegel', 'Haferriegel'], 'Bio · 35 g', 0.99),
    S('Basis+', 'packung', [0.05, 0.09, 0.02], '#f3f0e8', ['#3f6b3a', '#a8342b', '#c9a227'], ['Kaugummi Eukalyptus', 'Kaugummi Erdbeer', 'Pfefferminz'], '10 Stück', 0.99),
    S('Würzhaus', 'packung', [0.06, 0.08, 0.02], '#7f2620', ['#e3d3a4', '#3f6b3a'], ['Ingwer-Bonbons', 'Salbei-Bonbons', 'Zitronen-Bonbons', 'Lakritz'], '75 g', 1.29),
    S('Hof Neckar', 'becher', [0.1, 0.12, 0.1], '#3f6b3a', ['#f3f0e8'], ['Petersilie', 'Schnittlauch', 'Koriander', 'Thai-Basilikum', 'Minze'], 'im Topf', 1.99),
    S('Limonata', 'flasche', [0.055, 0.18, 0.055], '#d9bf45', ['#1e3d6e', '#a8342b', '#3f6b3a'], ['Limone', 'Aranciata', 'Pompelmo', 'Chinotto'], '0,33 l', 1.29),
    S('Neckarquelle', 'flasche', [0.055, 0.18, 0.055], '#5e8aa6', ['#f3f0e8'], ['Wasser still', 'Wasser medium'], '0,5 l', 0.89),
    S('Teekontor', 'flasche', [0.055, 0.18, 0.055], '#2f4f3a', ['#e3d3a4', '#a8342b'], ['Eistee Pfirsich', 'Mate Zitrone', 'Ingwer-Shot'], '0,33 l', 1.79),
    S('Knusperei', 'beutel', [0.1, 0.14, 0.04], '#e7c45a', ['#a8342b', '#3f6b3a', '#3e6a96'], ['Chips Mini Paprika', 'Chips Mini Salz', 'Salzbrezel Mini'], '40 g', 0.79),
    S('Basis+', 'beutel', [0.09, 0.12, 0.03], '#f3f0e8', ['#a5823f', '#7a3b1e', '#c9a227'], ['Studentenfutter', 'Cashews', 'Erdnüsse geröstet', 'Fruchtgummi', 'Saure Zungen'], '100 g', 1.19),
    S('Gelato Lia', 'packung', [0.06, 0.1, 0.03], '#f3ead2', ['#7a1f3d', '#5d3a1a'], ['Cantuccini Mini', 'Amaretti'], '100 g', 1.49),
  ],
};
for (const [k, lists] of Object.entries(MEHR2)) {
  const extra = lists.flat();
  const big = CATALOG[k].filter((p) => p.g);
  CATALOG[k] = [...CATALOG[k].filter((p) => !p.g), ...extra, ...big];
}

// ================= Themenwelten =================
// Die drei Gondeln folgen den Kochwelten der Anzeigetafel (Gondel 1 = Pasta Night, 2 = Asian Night, 3 = Mexican Night).
// Jede Gondelseite ist ein Kreuzblock: Warengruppen senkrecht (wg), Marken waagerecht nach Preislage.
// Das allgemeine Trockensortiment ohne Bezug zu den Rezepten (Eintöpfe, Obstkonserven, Getreide) führt der Laden nicht.
{
  const OLD = { ...CATALOG };
  const take = (code, pred) => {
    const hit = OLD[code].filter(pred);
    OLD[code] = OLD[code].filter((p) => !pred(p));
    return hit;
  };
  const tag = (wg, list) => list.map((p) => ({ ...p, wg }));
  const is = (re) => (p) => re.test(p.n);
  const of = (b, form) => (p) => p.b === b && (!form || p.form === form);
  const and = (...f) => (p) => f.every((g) => g(p));
  const or = (...f) => (p) => f.some((g) => g(p));
  const not = (f) => (p) => !f(p);

  // ---------- Vorspeisen (Wandregal links vom Eingang): erst aus dem Bestand ziehen ----------
  const v1alt = [...take('T4', of('Mittelmeer')), ...take('T3', of('Mittelmeer'))];
  const v2alt = [...take('T5', and(of('Lotus Garden', 'beutel'), is(/Krabbenchips/))), ...take('T5', and(of('Seoul Street', 'glas'), is(/^Kimchi$/)))];
  const v3alt = take('T6', and(or(of('El Sabor', 'glas'), of('Sol & Maíz', 'glas')), is(/Dip/)));

  // ---------- Pasta Night ----------
  const risotto = take('T2', is(/Risotto|Arborio|Carnaroli|Vialone|Polenta/));
  const t1 = OLD.T1;
  const T1 = [
    ...tag('Lange Pasta', t1.filter((p) => !p.g && p.m[1] >= 0.25)),
    ...tag('Kurze Pasta', t1.filter((p) => !p.g && p.m[1] < 0.25 && !['Fratelli Verdi', 'Feldkorn'].includes(p.b))),
    ...tag('Eiernudeln & Lasagne', t1.filter((p) => !p.g && ['Fratelli Verdi', 'Feldkorn'].includes(p.b))),
    ...tag('Risotto & Polenta', risotto.filter((p) => !p.g)),
    ...tag('Großpackungen', [...t1, ...risotto].filter((p) => p.g)),
  ];
  const t3 = OLD.T3;
  const pesto = is(/Pesto/);
  const sugo = (p) => !pesto(p) && /Sugo|Ragù|Sauce|Béchamel|Napoli|Arrabbiata|Bolognese|Basilico|Funghi|Käse|Carbonara|Spinat|Paprika|Gemüse|Pilz|Burrata|Gorgonzola|Lachs|Zucchini/.test(p.n) && !/Passata|Polpa|Pelati/.test(p.n);
  const italBohnen = [...take('T4', of('Nonna Lia')), ...take('T2', and(of('Mittelmeer'), is(/Cannellini|Borlotti|Riesenbohnen/))), ...take('T4', and(of('Nordküste'), is(/Thunfisch|Sardinen/)))];
  const T2 = [
    ...tag('Tomaten & Passata', t3.filter((p) => !p.g && !pesto(p) && !sugo(p))),
    ...tag('Sugo & Pastasaucen', t3.filter((p) => !p.g && sugo(p))),
    ...tag('Pesto', t3.filter((p) => !p.g && pesto(p))),
    ...tag('Bohnen & Thunfisch', italBohnen.filter((p) => !p.g)),
    ...tag('Großpackungen', [...t3, ...italBohnen].filter((p) => p.g)),
  ];

  // ---------- Asian Night ----------
  const t5 = OLD.T5;
  const asiaNudeln = t5.filter(or(and(of('Kaizen', 'packung'), not(is(/Nori/))), of('Umami Lab', 'beutel'), of('Seoul Street', 'beutel')));
  const reis = take('T2', or(of('Reisgarten'), of('Kaizen'), of('Masala Haus'), and(or(of('Basis+'), of('Grünwerk')), is(/Jasmin|Basmati|Langkorn|Vollkornreis/))));
  const reisOk = reis.filter((p) => !/Milchreis|Paella/.test(p.n));
  const beilagen = t5.filter(or(of('Masala Haus', 'packung'), of('Lotus Garden', 'beutel'), and(of('Kaizen', 'packung'), is(/Nori/))));
  const T3 = [
    ...tag('Asia-Nudeln', asiaNudeln.filter((p) => !p.g)),
    ...tag('Reis', reisOk.filter((p) => !p.g && !/Dal/.test(p.n))),
    ...tag('Dal, Naan & Teigblätter', [...reisOk.filter((p) => !p.g && /Dal/.test(p.n)), ...beilagen.filter((p) => !p.g)]),
    ...tag('Großpackungen', [...asiaNudeln, ...reisOk].filter((p) => p.g)),
  ];
  const rest5 = t5.filter((p) => !asiaNudeln.includes(p) && !beilagen.includes(p));
  const T4 = [
    ...tag('Soja & Saucen', [...rest5.filter((p) => !p.g && p.form === 'flasche'), ...S('Umami Lab', 'flasche', [0.06, 0.19, 0.06], '#1f2120', ['#c9a227', '#b8322a', '#3f6b3a'], ['Kung-Pao-Sauce', 'General-Tso-Sauce', 'Szechuan-Sauce', 'Mapo-Tofu-Sauce', 'Chili-Öl knusprig', 'Schwarzer Essig', 'Shaoxing-Kochwein', 'XO-Sauce'], '250 ml', 2.79)]),
    ...tag('Currys & Pasten', rest5.filter((p) => !p.g && (p.form === 'glas' || p.form === 'becher'))),
    ...tag('Kokosmilch & Gemüse', rest5.filter((p) => !p.g && (p.form === 'dose' || p.form === 'tetra'))),
    ...tag('Würzen & Toppings', [...rest5.filter((p) => !p.g && p.form === 'beutel'), ...S('Kaizen', 'beutel', [0.1, 0.15, 0.04], '#f3f0e8', ['#b8322a', '#3f6b3a', '#2a1a12'], ['Dashi-Pulver', 'Bonito-Flocken', 'Shichimi Togarashi', 'Matcha zum Kochen', 'Panko Vollkorn'], '50 g', 2.79)]),
    ...tag('Großpackungen', rest5.filter((p) => p.g)),
  ];

  // ---------- Mexican Night ----------
  const t6 = OLD.T6;
  const tortillas = t6.filter(and(of('La Milpa', 'beutel'), is(/Tortilla|Wraps/)));
  const kits = t6.filter((p) => p.form === 'packung' && p.b !== 'Sol & Maíz');
  const chips = [...t6.filter(of('Sol & Maíz', 'beutel')), ...take('B7', of('La Milpa'))];
  const masa = t6.filter(of('Sol & Maíz', 'packung'));
  const T5 = [
    ...tag('Tortillas & Wraps', tortillas.filter((p) => !p.g)),
    ...tag('Taco-Shells & Kits', kits.filter((p) => !p.g)),
    ...tag('Tortilla-Chips', chips.filter((p) => !p.g)),
    ...tag('Masa & Mais', masa.filter((p) => !p.g)),
    ...tag('Großpackungen', [...tortillas, ...kits, ...chips].filter((p) => p.g)),
  ];
  const rest6 = t6.filter((p) => ![...tortillas, ...kits, ...masa].includes(p) && !chips.includes(p));
  const bohnen = [...rest6.filter((p) => p.form === 'dose'), ...take('T4', is(/Kidney|Schwarze Bohnen|Rote Bohnen|^Mais$|Gemüsemais/))];
  const T6 = [
    ...tag('Bohnen & Mais', [...bohnen.filter((p) => !p.g), ...S('Sol & Maíz', 'dose', DOSE, '#a5823f', ['#2b2c30', '#7f2620'], ['Kidneybohnen in Chili-Sauce', 'Schwarze Bohnen gewürzt', 'Pinto-Bohnen gewürzt', 'Mais-Kölbchen'], '400 g', 1.79)]),
    ...tag('Salsa & Saucen', [...rest6.filter((p) => !p.g && p.form === 'glas' && p.b !== 'Kochwerk'), ...S('El Sabor', 'glas', [0.08, 0.13, 0.08], '#2b2c30', ['#7f2620', '#a8342b', '#5d7f3a'], ['Enchilada-Sauce rot', 'Enchilada-Sauce grün', 'Taco-Sauce mild', 'Fajita-Marinade', 'Burrito-Sauce', 'Adobo-Sauce'], '300 g', 2.49)]),
    ...tag('Hot Sauces', [...rest6.filter((p) => !p.g && p.form === 'flasche'), ...S('La Milpa', 'flasche', [0.05, 0.15, 0.05], '#f3f0e8', ['#a8342b', '#3f6b3a'], ['Chili-Limette-Sauce', 'Salsa Picante', 'Chipotle-Mayo'], '150 ml', 2.29)]),
    ...tag('Gewürze', [...rest6.filter((p) => !p.g && (p.form === 'beutel' || p.b === 'Kochwerk')), ...S('El Sabor', 'beutel', [0.09, 0.13, 0.02], '#2b2c30', ['#a8342b', '#e7c45a'], ['Taco-Gewürz scharf', 'Fajita-Gewürz rauchig', 'Adobo-Gewürz', 'Al-Pastor-Gewürz', 'Chili-Limetten-Salz'], '30 g', 1.19)]),
    ...tag('Großpackungen', bohnen.filter((p) => p.g)),
  ];

  // ---------- Vorspeisen: je Kochwelt ein Fach ----------
  const V1 = [
    ...tag('Antipasti', v1alt.filter((p) => p.form === 'glas' && p.m[1] > 0.1)),
    ...tag('Cremes & Tapenaden', v1alt.filter((p) => !(p.form === 'glas' && p.m[1] > 0.1))),
    ...tag('Antipasti', S('Casa Verde', 'glas', GLAS_K, '#f1e7d0', ['#a8342b', '#4c6b3a', '#8a5a32'], ['Bruschetta Tomate', 'Bruschetta Oliven', 'Carciofi grigliati', 'Funghi trifolati', 'Peperoni ripieni', 'Pomodori secchi', 'Melanzane grigliate', 'Cipolline borettane'], '190 g', 3.49)),
    ...tag('Oliven', S('Il Campo', 'glas', [0.07, 0.14, 0.07], '#7a2e22', ['#e3d3a4', '#4c6b3a'], ['Olive Taggiasche', 'Olive Nocellara', 'Bella di Cerignola', 'Lampascioni'], '180 g', 4.29)),
    ...tag('Oliven', S('Basis+', 'glas', [0.075, 0.13, 0.075], '#f3f0e8', ['#3f6b3a', '#2b2c30', '#b9472f'], ['Oliven grün entsteint', 'Oliven schwarz entsteint', 'Peperoni mild', 'Champignons mariniert', 'Artischocken geviertelt'], '330 g', 1.29)),
    ...tag('Grissini & Gebäck', S('Forno Lia', 'packung', [0.065, 0.3, 0.045], '#f3ead2', ['#7a3b1e', '#3f6b3a', '#a8342b'], ['Grissini Torinesi', 'Grissini Rosmarin', 'Grissini Sesam', 'Grissini Vollkorn'], '125 g', 1.99)),
    ...tag('Grissini & Gebäck', S('Forno Lia', 'beutel', [0.14, 0.2, 0.05], '#f3ead2', ['#a5823f', '#3f6b3a', '#a8342b'], ['Taralli classici', 'Taralli Fenchel', 'Taralli Chili', 'Crostini', 'Friselle', 'Bruschetta-Brot'], '200 g', 2.29)),
  ];
  const V2 = [
    ...tag('Cracker & Snacks', [...v2alt.filter((p) => p.form === 'beutel'), ...S('Kaizen', 'beutel', [0.11, 0.16, 0.04], '#f3f0e8', ['#3f6b3a', '#b8322a', '#2a1a12'], ['Edamame geröstet', 'Wasabi-Erbsen', 'Seetang-Snack', 'Reiscracker', 'Senbei-Mix', 'Sesam-Cracker'], '80 g', 2.29), ...S('Lotus Garden', 'beutel', [0.13, 0.18, 0.04], '#2f5d3a', ['#c9a227', '#b8322a'], ['Krupuk Gemüse', 'Cassava-Chips', 'Linsen-Cracker'], '100 g', 1.79), ...S('Masala Haus', 'beutel', [0.13, 0.18, 0.04], '#d9873a', ['#7f2620', '#3f6b3a'], ['Papadam Pfeffer', 'Bombay Mix', 'Samosa-Teig', 'Pakora-Mix'], '150 g', 1.99)]),
    ...tag('Eingelegtes & Kimchi', [...v2alt.filter((p) => p.form !== 'beutel'), ...S('Seoul Street', 'glas', GLAS_K, '#b8322a', ['#f3f0e8'], ['Kimchi mild', 'Gurken-Kimchi', 'Rettich-Kimchi'], '200 g', 3.29), ...S('Kaizen', 'glas', GLAS_K, '#f3f0e8', ['#c9787a', '#3f6b3a'], ['Sushi-Ingwer', 'Eingelegter Rettich', 'Algensalat'], '150 g', 2.49)]),
    ...tag('Dips & Suppen', [...S('Lotus Garden', 'flasche', [0.05, 0.15, 0.05], '#2f5d3a', ['#c9a227', '#b8322a'], ['Frühlingsrollen-Dip', 'Gyoza-Dip', 'Erdnuss-Dip', 'Nuoc Cham'], '150 ml', 2.29), ...S('Umami Lab', 'packung', [0.12, 0.12, 0.05], '#1f2120', ['#c9a227', '#b8322a', '#3f6b3a'], ['Miso-Suppe', 'Miso-Suppe Tofu', 'Wan-Tan-Suppe', 'Tom-Kha-Suppe', 'Hot & Sour Suppe'], '3 × 10 g', 2.49)]),
  ];
  const V3 = [
    ...tag('Nachos & Chips', [...S('El Sabor', 'beutel', [0.18, 0.24, 0.07], '#2b2c30', ['#e7c45a', '#a8342b', '#5d7f3a'], ['Nachos Original', 'Nachos Chili Cheese', 'Nachos Jalapeño', 'Nachos Sour Cream', 'Nachos Lime'], '200 g', 1.99), ...S('La Milpa', 'beutel', [0.16, 0.22, 0.06], '#f3f0e8', ['#a8342b', '#3f6b3a'], ['Totopos', 'Plantain-Chips', 'Mais-Chips Bio', 'Bohnen-Chips'], '150 g', 2.49), ...S('Basis+', 'beutel', [0.18, 0.24, 0.07], '#f3f0e8', ['#e7c45a', '#a8342b'], ['Tortilla-Chips Natur', 'Tortilla-Chips Paprika', 'Tortilla-Chips Chili', 'Tortilla-Chips Käse'], '200 g', 0.99)]),
    ...tag('Dips', [...v3alt, ...S('El Sabor', 'glas', [0.08, 0.11, 0.08], '#2b2c30', ['#5d7f3a', '#a8342b', '#e7c45a'], ['Jalapeño-Dip', 'Queso Blanco', 'Salsa con Queso', 'Chunky Salsa', 'Black Bean Dip', 'Mango-Habanero-Dip'], '250 g', 2.79), ...S('Basis+', 'glas', [0.08, 0.11, 0.08], '#f3f0e8', ['#a8342b', '#e7c45a', '#3f6b3a'], ['Salsa Dip mild', 'Salsa Dip scharf', 'Käse-Dip', 'Guacamole'], '200 g', 1.29)]),
    ...tag('Eingelegtes', S('Sol & Maíz', 'glas', [0.07, 0.12, 0.07], '#3f6b3a', ['#e7c45a', '#a8342b'], ['Jalapeño-Scheiben', 'Chipotle-Zwiebeln', 'Pickled Onions', 'Cebollitas'], '220 g', 2.19)),
  ];
  Object.assign(CATALOG, { T1, T2, T3, T4, T5, T6, V1, V2, V3, B7: OLD.B7 });
}

// Titel der Gondelseiten und Vorspeisen-Fächer (für Schilder, Planogramm und Rezeptkarten)
export const WELTEN = {
  T1: { welt: 'Pasta Night', titel: 'Pasta & Risotto' },
  T2: { welt: 'Pasta Night', titel: 'Sugo, Pesto & Tomaten' },
  T3: { welt: 'Asian Night', titel: 'Nudeln, Reis & Naan' },
  T4: { welt: 'Asian Night', titel: 'Saucen, Currys & Würzen' },
  T5: { welt: 'Mexican Night', titel: 'Tortillas, Kits & Chips' },
  T6: { welt: 'Mexican Night', titel: 'Bohnen, Salsa & Gewürze' },
  V1: { welt: 'Pasta Night', titel: 'Antipasti' },
  V2: { welt: 'Asian Night', titel: 'Asia-Vorspeisen' },
  V3: { welt: 'Mexican Night', titel: 'Nachos & Dips' },
};

// ---------- Planogramm einer Regalfront als Kreuzblock ----------
// Senkrecht: Warengruppen-Blöcke (wg, z. B. „Lange Pasta“ | „Kurze Pasta“ | „Risotto & Polenta“) – der Kunde sucht mit der Rezeptkarte nach dem Produkt.
// Waagerecht: Marken nach Preislage – Premium oben in der Sichtzone, klassische Marken und Bio in der Greifzone, Eigenmarke unten.
// So läuft jede Marke als durchgehendes Band über alle Warengruppen (Kreuzblock nach Ahlert/Kenning/Brock).
// Wird für den 3D-Aufbau UND für das Regalbild in der Infokarte verwendet (gleiches Ergebnis).
// levels = Anzahl normaler Böden (ohne Bückzone ganz unten). Ergebnis: { blocks: [{ wg, brand, w, levels: [[sku…] je Boden von oben]}], bulk: [sku…] }
const TIER = { premium: 0, molino: 0, feinkost: 0, wein: 0, klassik: 1, asia: 1, mex: 1, gewuerz: 1, regional: 1, drink: 1, bio: 2, eigen: 3 };
export function planFace(code, levels = 3) {
  const list = CATALOG[code] || [];
  const normal = list.filter((p) => !p.g);
  const bulk = list.filter((p) => p.g);
  const groups = [];
  for (const p of normal) {
    const wg = p.wg || '';
    let g = groups.find((x) => x.wg === wg);
    if (!g) groups.push((g = { wg, items: [] }));
    g.items.push(p);
  }
  const tier = (p) => TIER[BRANDS[p.b]?.st] ?? 1;
  const blocks = groups.map(({ wg, items }) => {
    // stabil nach Preislage sortieren, Sorten einer Marke bleiben zusammen
    const brandOrder = [];
    for (const p of items) if (!brandOrder.includes(p.b)) brandOrder.push(p.b);
    const sorted = items.slice().sort((a, b) => tier(a) - tier(b) || brandOrder.indexOf(a.b) - brandOrder.indexOf(b.b));
    const total = sorted.reduce((s, p) => s + p.m[0], 0);
    const target = total / levels;
    const lv = Array.from({ length: levels }, () => []);
    const sum = new Array(levels).fill(0);
    let acc = 0;
    for (const p of sorted) {
      const i = Math.min(levels - 1, Math.floor((acc + p.m[0] / 2) / target));
      lv[i].push(p);
      sum[i] += p.m[0];
      acc += p.m[0];
    }
    const brands = [...new Set(sorted.map((p) => p.b))];
    return { wg, brand: wg || brands.join(' · '), brands, need: Math.max(...sum), levels: lv };
  });
  const total = blocks.reduce((s, b) => s + b.need, 0) || 1;
  for (const b of blocks) b.w = b.need / total;
  return { blocks, bulk, need: total };
}
