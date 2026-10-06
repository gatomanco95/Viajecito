# NutriZone · Maqueta 2.1 (Inicio + Productos)

Maqueta navegable para probar mejoras antes de pasarlas a la web real (nutrizone.com.ar).
Usa la misma identidad que la web actual: blanco, negro, naranja `#ff691f`, Inter, logo, video del hero y fotos del local.

**Cómo verla:** abrí `index.html` con un servidor local (por ejemplo `npx serve maquetas/nutrizone`) o con la extensión Live Server de VS Code.

## El problema que ataca

"Los clientes nuevos se pierden con los productos y no hay un orden para empezar a pedir."

## Versión 2.1: más simple

Pensada para un público de 25 a 60 años: menos información, letra más grande y botones más cómodos.

### Inicio (7 bloques, antes eran 11)
1. **Hero** con un solo mensaje y dos botones: "Ver productos" y "Ayudame a elegir". En compu se ve una tarjeta con un pedido de ejemplo armándose; en celular se oculta.
2. **Beneficios en una línea**: envío gratis, retiro sin costo, 10% OFF en efectivo y productos frescos.
3. **¿Qué estás buscando?**: las 9 categorías.
4. **Los más vendidos**: un carrusel con flechas.
5. **Comprar es así de simple**: 3 pasos, más los botones de ayuda y WhatsApp.
6. **Reseñas** de Google.
7. **El local**: dirección, "Abierto ahora / Cerrado" en vivo, horario y botón "Cómo llegar".

Se sacaron los kits, la sección de objetivos (quedó solo dentro del asistente), la marquesina de categorías, el bloque oscuro de estadísticas, las partículas y el texto animado del buscador.

### Productos (ex Catálogo)
- Dos atajos: "¿Primera vez? Empezá por lo esencial" y "Ayudame a elegir".
- Productos agrupados por categoría, con una barra fija que marca dónde estás.
- Selector de peso con precio al instante, botón "Agregar" grande que pasa a − 1 +.
- Filtros por categoría, preferencias, precio y stock (en celular se abren desde abajo).

### Accesibilidad y lectura
- Texto base de 17 px (antes 16), nombres de producto de 17 px y precios de 22 px.
- Botones de 48–58 px de alto y selector de peso de 36 px.
- Grises más oscuros para que se lea mejor.
- El panel de variantes suma la opción **Tamaño de letra: Grande**.

## Versión 2.2: pensada primero para el celular

El 95% del público entra desde el teléfono, así que el celular manda:
- **Barra inferior fija** con Inicio, Productos, Buscar, WhatsApp y Carrito. El carrito muestra el total en vivo y la cantidad de productos.
- **Header simple**: logo y buscador grande.
- **Inicio corto**: botones a todo el ancho, beneficios en 2×2, categorías en mosaicos de 3×3, "más vendidos" para deslizar con el dedo, pasos en lista compacta y una sola foto del local.
- **Productos**: tarjetas en 2 columnas con los pesos en 2×2 (más fáciles de tocar), botón "Agregar" de 46 px y un contador que muestra cantidad y peso.
- **Filtros, detalle del producto y asistente** abren como hojas desde abajo (como en las apps). El buscador ocupa la pantalla completa y el carrito también.
- Todos los botones miden 38–58 px de alto. Los buscadores usan letra de 16 px o más para que el iPhone no haga zoom solo.
- Sin efectos "hover" en pantallas táctiles (las tarjetas no quedan levantadas al tocarlas) y sin la demora de doble toque.
- Probado sin scroll lateral en 320, 360, 390 y 414 px de ancho.

## Panel "🧪 Probar variantes"
Abajo a la izquierda. Permite comparar en vivo:
- Hero: con pedido de ejemplo o solo texto.
- Animaciones: completas, suaves o ninguna.
- Tamaño de letra: normal o grande.
- Productos: por categoría o todos juntos.
- Tarjetas: bolsa ilustrada o minimal.

## Notas para pasarlo a la web real
- Los productos son datos de ejemplo (`js/data.js`). En la web real salen de Supabase (`products` / `product_variants`).
- Las bolsas ilustradas son un placeholder: se reemplazan por `image_url`.
- Las animaciones usan GSAP + ScrollTrigger. La web actual ya trae una librería de motion (`vendor-motion`, seguramente Framer Motion), así que en React se pueden recrear con esa.
- Se respeta `prefers-reduced-motion`.
