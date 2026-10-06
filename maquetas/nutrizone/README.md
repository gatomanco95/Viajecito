# NutriZone · Maqueta 2.0 (Inicio + Catálogo)

Maqueta navegable para probar mejoras antes de pasarlas a la web real (nutrizone.com.ar).
Usa la misma identidad que la web actual: blanco, negro, naranja `#ff691f`, Inter, logo, video del hero y fotos del local.

**Cómo verla:** abrí `index.html` con un servidor local (por ejemplo `npx serve maquetas/nutrizone`) o con la extensión Live Server de VS Code.

## El problema que ataca

"Los clientes nuevos se pierden con los productos y no hay un orden para empezar a pedir."

## Qué cambia

### Inicio
1. **Hero con "pedido en vivo"**: una tarjeta animada muestra cómo se arma un pedido (productos que entran, la barra de envío gratis que se llena y los pasos Elegís → Pesamos → Retirás). Así se entiende en 3 segundos cómo funciona comprar a granel online.
2. **CTA principal "Empezar mi pedido"** y otro secundario, **"¿No sabés qué llevar?"**, que abre el asistente.
3. **"Tu pedido en 3 pasos"**: explica el proceso con ilustraciones animadas (una balanza que cambia de peso y un camión en marcha).
4. **Comprá por objetivo**: Desayunos, Snacks, Sin TACC, Deporte, Keto y Plant-based. Cada uno muestra una canasta sugerida que se agrega con un clic.
5. **Pasillos**: las categorías ordenadas como el recorrido del local ("Pasillo 1 de 9").
6. **Más vendidos** en un carrusel con ranking 1–10, que se puede arrastrar.
7. **Kits armados con descuento** para hacer el primer pedido en un clic.
8. Reseñas en una marquesina continua, horario del local con "Abierto ahora" en vivo y parallax en las fotos.

### Catálogo
1. **Atajos para el primer pedido**: Lo esencial para empezar, Armalo por objetivo y Kits.
2. **Vista por pasillos** con una barra sticky que marca en qué pasillo estás mientras scrolleás (scrollspy).
3. **Selector de peso en cada tarjeta** (100 g / 250 g / 500 g / 1 kg), con el precio que se actualiza al momento y el precio por kilo visible.
4. El botón "Agregar" se convierte en **contador (− 1 +)** y el producto **vuela al carrito**.
5. **Filtros** por pasillo, preferencias (Sin TACC, Vegano, Keto…), precio y stock, con chips para quitarlos. En celular se abren como una hoja desde abajo.
6. **Vista rápida** de cada producto, con "Va bien con…" para sumar productos relacionados.
7. Grilla o lista, varios órdenes, skeletons mientras carga y una pantalla vacía que sugiere alternativas.

### En toda la web
- **Buscador instantáneo** (⌘K / Ctrl+K o `/`) con resultados resaltados y navegación con el teclado.
- **Asistente "¿Qué llevo?"** en 2 preguntas (objetivo y para quién) que arma la lista con cantidades.
- **Carrito lateral** con barra de envío gratis (que muestra cuánto falta), opción de retiro o envío, sugerencias para completar el pedido y el ahorro de los kits.
- **Barra inferior tipo app en celular** (Inicio, Catálogo, Buscar, Carrito).
- Barra de progreso de scroll, header que se achica al bajar, anuncios rotativos, partículas sobre el video y botón magnético.

## Panel "🧪 Probar variantes"
Abajo a la izquierda. Permite comparar en vivo:
- Hero: con pedido animado o clásico (como el actual).
- Animaciones: completas, suaves o sin animaciones.
- Catálogo: por pasillos o en una grilla única.
- Tarjetas: bolsa kraft ilustrada o minimal.

## Notas para pasarlo a la web real
- Los productos son datos de ejemplo (`js/data.js`). En la web real salen de Supabase (`products` / `product_variants`).
- Las bolsas ilustradas son un placeholder: se reemplazan por `image_url`.
- Las animaciones usan GSAP + ScrollTrigger. La web actual ya trae una librería de motion (`vendor-motion`, seguramente Framer Motion), así que en React se pueden recrear con esa.
- Se respeta `prefers-reduced-motion`.
