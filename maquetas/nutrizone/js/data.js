/* NutriZone — datos de ejemplo para la maqueta.
   En la web real esto sale de Supabase (products / product_variants).
   Precios de referencia en ARS. `per` = precio por 100 g (granel) o por unidad. */

window.NZ_DATA = (function () {
  // Pasillos: el orden ES el recorrido sugerido para un cliente nuevo
  const aisles = [
    { id: 'frutos-secos', name: 'Frutos secos', icon: '🥜', hue: 28, blurb: 'Almendras, nueces, castañas y mixes. Lo más pedido.' },
    { id: 'cereales', name: 'Cereales y granolas', icon: '🥣', hue: 40, blurb: 'Avena, granolas y copos para el desayuno.' },
    { id: 'semillas', name: 'Semillas', icon: '🌻', hue: 52, blurb: 'Chía, lino, girasol y zapallo.' },
    { id: 'harinas', name: 'Harinas y premezclas', icon: '🌾', hue: 36, blurb: 'Integrales, de almendra y sin TACC.' },
    { id: 'legumbres', name: 'Legumbres', icon: '🫘', hue: 14, blurb: 'Lentejas, garbanzos y porotos a granel.' },
    { id: 'desecadas', name: 'Frutas desecadas', icon: '🍑', hue: 340, blurb: 'Pasas, dátiles, arándanos y orejones.' },
    { id: 'endulzantes', name: 'Endulzantes y untables', icon: '🍯', hue: 44, blurb: 'Miel, mantequillas y azúcar mascabo.' },
    { id: 'suplementos', name: 'Suplementos', icon: '💪', hue: 210, blurb: 'Proteínas, creatina y vitaminas.' },
    { id: 'hierbas', name: 'Hierbas e infusiones', icon: '🌿', hue: 130, blurb: 'Yerbas, tés y hierbas medicinales.' },
  ];

  const tagsInfo = {
    'sin-tacc': { label: 'Sin TACC', icon: '🌾' },
    vegano: { label: 'Vegano', icon: '🌱' },
    organico: { label: 'Orgánico', icon: '🍃' },
    keto: { label: 'Keto', icon: '🔥' },
    'sin-azucar': { label: 'Sin azúcar', icon: '🍬' },
    integral: { label: 'Integral', icon: '🌾' },
    'sin-lactosa': { label: 'Sin lactosa', icon: '🥛' },
  };

  // [id, aisle, nombre, emoji, per100g|unit, tipo('g'|'u'), tags, ventas, stock, extra]
  const raw = [
    ['almendras', 'frutos-secos', 'Almendras peladas', '🌰', 2450, 'g', ['sin-tacc', 'vegano', 'keto'], 980, 40, { desc: 'Almendra non pareil, crocante y dulce. Ideal para snack o leche vegetal.' }],
    ['nuez', 'frutos-secos', 'Nuez mariposa extra light', '🧠', 2290, 'g', ['sin-tacc', 'vegano', 'keto'], 870, 32, { desc: 'Mariposa clara de Catamarca, cosecha 2026.' }],
    ['caju', 'frutos-secos', 'Castañas de cajú W1', '🥜', 2690, 'g', ['sin-tacc', 'vegano'], 760, 18, { desc: 'Calibre W1 enteras. Tostalas 5 min y quedan increíbles.' }],
    ['mix-premium', 'frutos-secos', 'Mix frutos secos premium', '🥜', 2150, 'g', ['sin-tacc', 'vegano'], 1120, 50, { desc: 'Almendras, nueces, cajú, pasas rubias y arándanos.', badge: 'Más vendido' }],
    ['mani', 'frutos-secos', 'Maní tostado sin sal', '🥜', 620, 'g', ['sin-tacc', 'vegano'], 640, 80, { desc: 'Tostado en el día, sin sal agregada.' }],
    ['pistacho', 'frutos-secos', 'Pistachos tostados', '🟢', 3990, 'g', ['sin-tacc', 'vegano', 'keto'], 310, 6, { desc: 'Con cáscara, tostados y salados.' }],
    ['avellanas', 'frutos-secos', 'Avellanas peladas', '🌰', 3150, 'g', ['sin-tacc', 'vegano', 'keto'], 220, 14, {}],

    ['avena', 'cereales', 'Avena arrollada tradicional', '🥣', 390, 'g', ['vegano', 'integral'], 910, 120, { desc: 'Copos gruesos, ideal para overnight oats.' }],
    ['granola', 'cereales', 'Granola NutriZone casera', '🥣', 1090, 'g', ['vegano'], 1040, 45, { desc: 'Avena, miel, almendras y coco. Receta de la casa.', badge: 'Receta propia' }],
    ['granola-keto', 'cereales', 'Granola keto sin azúcar', '🥣', 2390, 'g', ['sin-tacc', 'keto', 'sin-azucar'], 380, 20, {}],
    ['copos-maiz', 'cereales', 'Copos de maíz sin azúcar', '🌽', 720, 'g', ['sin-tacc', 'vegano', 'sin-azucar'], 300, 60, {}],
    ['quinoa-pop', 'cereales', 'Quinoa pop', '🍚', 1450, 'g', ['sin-tacc', 'vegano'], 190, 25, {}],

    ['chia', 'semillas', 'Semillas de chía', '⚫', 820, 'g', ['sin-tacc', 'vegano', 'keto'], 830, 90, { desc: 'Rica en omega 3. Hidratala 10 min antes de usar.' }],
    ['lino', 'semillas', 'Semillas de lino dorado', '🟤', 540, 'g', ['sin-tacc', 'vegano', 'keto'], 410, 70, {}],
    ['girasol', 'semillas', 'Girasol pelado', '🌻', 690, 'g', ['sin-tacc', 'vegano'], 350, 55, {}],
    ['zapallo', 'semillas', 'Semillas de zapallo', '🎃', 1690, 'g', ['sin-tacc', 'vegano', 'keto'], 270, 30, {}],
    ['mix-semillas', 'semillas', 'Mix de semillas tostadas', '🌻', 990, 'g', ['sin-tacc', 'vegano'], 460, 40, {}],

    ['harina-almendra', 'harinas', 'Harina de almendras', '🌰', 2890, 'g', ['sin-tacc', 'keto', 'vegano'], 520, 22, { desc: 'Molienda fina, perfecta para repostería keto.' }],
    ['harina-integral', 'harinas', 'Harina integral fina', '🌾', 260, 'g', ['vegano', 'integral'], 480, 150, {}],
    ['premezcla', 'harinas', 'Premezcla universal sin TACC', '🌾', 690, 'g', ['sin-tacc', 'vegano'], 430, 35, { badge: 'Sin TACC' }],
    ['harina-coco', 'harinas', 'Harina de coco', '🥥', 1590, 'g', ['sin-tacc', 'keto', 'vegano'], 240, 18, {}],
    ['harina-garbanzo', 'harinas', 'Harina de garbanzos', '🫘', 590, 'g', ['sin-tacc', 'vegano'], 260, 40, {}],

    ['lentejas', 'legumbres', 'Lentejas', '🫘', 420, 'g', ['sin-tacc', 'vegano'], 390, 100, {}],
    ['garbanzos', 'legumbres', 'Garbanzos', '🫘', 480, 'g', ['sin-tacc', 'vegano'], 350, 90, {}],
    ['porotos-negros', 'legumbres', 'Porotos negros', '⚫', 520, 'g', ['sin-tacc', 'vegano'], 200, 70, {}],
    ['arvejas', 'legumbres', 'Arvejas partidas', '🟢', 360, 'g', ['sin-tacc', 'vegano'], 120, 60, {}],

    ['datiles', 'desecadas', 'Dátiles Medjool', '🟤', 2190, 'g', ['sin-tacc', 'vegano'], 450, 16, { desc: 'Grandes y jugosos. El endulzante natural más rico.' }],
    ['pasas', 'desecadas', 'Pasas de uva rubias', '🍇', 890, 'g', ['sin-tacc', 'vegano'], 380, 60, {}],
    ['arandanos', 'desecadas', 'Arándanos deshidratados', '🫐', 1890, 'g', ['sin-tacc', 'vegano'], 360, 28, {}],
    ['orejones', 'desecadas', 'Orejones de durazno', '🍑', 1490, 'g', ['sin-tacc', 'vegano'], 170, 20, {}],
    ['banana-chips', 'desecadas', 'Banana chips', '🍌', 1090, 'g', ['sin-tacc', 'vegano'], 210, 35, {}],

    ['miel', 'endulzantes', 'Miel pura de abejas 500 g', '🍯', 6900, 'u', ['sin-tacc'], 330, 24, { desc: 'Miel cremosa de la Pampa, frasco de vidrio.' }],
    ['pasta-mani', 'endulzantes', 'Pasta de maní natural 380 g', '🥜', 4950, 'u', ['sin-tacc', 'vegano', 'sin-azucar'], 690, 30, { desc: '100% maní, sin aceite agregado.', badge: 'Favorito' }],
    ['mascabo', 'endulzantes', 'Azúcar mascabo', '🟫', 390, 'g', ['sin-tacc', 'vegano'], 260, 80, {}],
    ['stevia', 'endulzantes', 'Stevia líquida 200 ml', '💧', 3490, 'u', ['sin-tacc', 'keto', 'sin-azucar'], 180, 25, {}],
    ['aceite-coco', 'endulzantes', 'Aceite de coco neutro 360 ml', '🥥', 7900, 'u', ['sin-tacc', 'vegano', 'keto'], 240, 12, {}],

    ['whey', 'suplementos', 'Proteína whey 1 kg · vainilla', '💪', 38900, 'u', ['sin-tacc'], 610, 10, { desc: '24 g de proteína por scoop. Sabor vainilla.', badge: 'Más vendido' }],
    ['creatina', 'suplementos', 'Creatina monohidrato 300 g', '⚡', 24900, 'u', ['sin-tacc', 'vegano'], 720, 14, { desc: 'Creapure®. 5 g por día.' }],
    ['proteina-vegana', 'suplementos', 'Proteína vegana 1 kg', '🌱', 34500, 'u', ['sin-tacc', 'vegano'], 180, 6, {}],
    ['colageno', 'suplementos', 'Colágeno hidrolizado 300 g', '✨', 19900, 'u', ['sin-tacc'], 260, 9, {}],
    ['magnesio', 'suplementos', 'Citrato de magnesio 60 caps', '💊', 12900, 'u', ['sin-tacc', 'vegano'], 210, 18, {}],
    ['barras', 'suplementos', 'Barra proteica x12', '🍫', 21900, 'u', [], 300, 15, {}],

    ['yerba-organica', 'hierbas', 'Yerba mate orgánica 500 g', '🧉', 5900, 'u', ['sin-tacc', 'vegano', 'organico'], 370, 40, {}],
    ['te-verde', 'hierbas', 'Té verde en hebras', '🍵', 1490, 'g', ['sin-tacc', 'vegano', 'organico'], 150, 30, {}],
    ['manzanilla', 'hierbas', 'Manzanilla', '🌼', 990, 'g', ['sin-tacc', 'vegano', 'organico'], 120, 25, {}],
    ['curcuma', 'hierbas', 'Cúrcuma en polvo', '🟡', 1290, 'g', ['sin-tacc', 'vegano'], 280, 40, {}],
    ['jengibre', 'hierbas', 'Jengibre en polvo', '🫚', 1390, 'g', ['sin-tacc', 'vegano'], 160, 30, {}],
  ];

  const products = raw.map(([id, aisle, name, emoji, price, unit, tags, sales, stock, extra]) => ({
    id, aisle, name, emoji, price, unit, tags, sales, stock,
    desc: extra.desc || 'Producto seleccionado y fraccionado en nuestro local de Gerli.',
    badge: extra.badge || null,
    starter: false,
  }));

  // Objetivos: el atajo para el cliente que no sabe por dónde empezar
  const goals = [
    { id: 'desayuno', name: 'Desayunos y meriendas', icon: '🥣', color: '#ff691f', pitch: 'Bowls, overnight oats y tostadas que rinden toda la semana.', items: [['granola', 500], ['avena', 1000], ['chia', 250], ['pasta-mani', 1]] },
    { id: 'snack', name: 'Snacks para el día', icon: '🥜', color: '#c2400b', pitch: 'Para la oficina, el auto o la mochila del cole.', items: [['mix-premium', 500], ['almendras', 250], ['datiles', 250], ['banana-chips', 250]] },
    { id: 'sintacc', name: 'Cocina sin TACC', icon: '🌾', color: '#4e7e91', pitch: 'Todo lo que necesitás para cocinar celíaco sin riesgos.', items: [['premezcla', 1000], ['harina-almendra', 250], ['copos-maiz', 500], ['quinoa-pop', 250]] },
    { id: 'deporte', name: 'Rendimiento deportivo', icon: '💪', color: '#1f6f8b', pitch: 'Proteína, creatina y energía limpia para entrenar.', items: [['whey', 1], ['creatina', 1], ['avena', 1000], ['mani', 500]] },
    { id: 'keto', name: 'Keto y bajo en azúcar', icon: '🔥', color: '#9c3311', pitch: 'Grasas buenas y cero azúcar agregada.', items: [['granola-keto', 500], ['harina-almendra', 500], ['nuez', 250], ['stevia', 1]] },
    { id: 'vegano', name: 'Plant-based', icon: '🌱', color: '#3d7a3a', pitch: 'Proteína vegetal, legumbres y semillas para tu semana.', items: [['proteina-vegana', 1], ['lentejas', 1000], ['garbanzos', 1000], ['mix-semillas', 250]] },
  ];

  // Kits armados: el primer pedido en un clic
  const kits = [
    { id: 'kit-inicio', name: 'Kit Primera Compra', note: 'Lo que más piden los clientes nuevos', items: [['mix-premium', 250], ['granola', 500], ['chia', 250], ['almendras', 250]], off: 10 },
    { id: 'kit-desayuno', name: 'Kit Desayuno Semanal', note: 'Para 7 desayunos completos', items: [['avena', 1000], ['granola', 500], ['pasta-mani', 1], ['arandanos', 100]], off: 8 },
    { id: 'kit-gym', name: 'Kit Gym Esencial', note: 'Proteína + creatina + snack', items: [['whey', 1], ['creatina', 1], ['mix-premium', 250]], off: 7 },
  ];

  ['mix-premium', 'granola', 'almendras', 'chia', 'avena', 'pasta-mani', 'nuez', 'datiles'].forEach((id) => {
    const p = products.find((x) => x.id === id);
    if (p) p.starter = true;
  });

  const reviews = [
    ['Valentina Giménez', 'hace 3 días', 'Excelente atención en el local de Gerli! Los frutos secos son fresquísimos y las harinas sin TACC de primera calidad.'],
    ['Marcos Santoro', 'hace 1 semana', 'La mejor dietética de la zona sur. Compro siempre las legumbres y el aceite de coco. Aceptan efectivo con descuento.'],
    ['Camila Rodríguez', 'hace 2 semanas', 'Hice el pedido por la web con envío gratis a Gerli y llegó todo impecable. Súper recomendado el mix premium!'],
    ['Lucía Morales', 'hace 3 semanas', 'Me encanta que fraccionen los gramos exactos que uno necesita. Los productos siempre impecables.'],
    ['Julián Pereyra', 'hace 1 mes', 'La granola casera es adictiva. Ya es mi tercer pedido y siempre llega rapidísimo.'],
    ['Sofía Benítez', 'hace 1 mes', 'Soy celíaca y acá encuentro todo separado y bien rotulado. Gracias por la paciencia!'],
  ];

  return { aisles, tagsInfo, products, goals, kits, reviews, freeShipping: 15000 };
})();
