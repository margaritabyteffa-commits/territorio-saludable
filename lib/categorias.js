// Categorías del catálogo. Las 5 de siempre vienen fijas; desde el panel se
// pueden agregar categorías de temporada (Amor y Amistad, Halloween, Navidad…),
// ordenarlas, ocultarlas y escribir su descripción. Se guardan en config.categorias.

export const CATEGORIAS_BASE = [
  {
    nombre: 'Tortas Saludables', id: 'tortas', emoji: '🍰', fija: true, visible: true,
    descripcion: '🎂 Tortas Saludables: Todas nuestras tortas son hechas a base de harina de almendras, arroz y almidón de yuca, endulzadas 100% Libres de azúcar y Sin gluten. Pedidos con un día de anticipación.',
    tituloBot: '¡Nuestras tortas son deliciosas y sin culpa!', notaBot: '📌 En la página puedes elegir el número de porciones.'
  },
  {
    nombre: 'Catalogo Detalles', id: 'detalles', emoji: '🎁', fija: true, visible: true,
    descripcion: '🎁 Detalles con amor: Sorprende a tu persona favorita con una experiencia deliciosa y libre de culpas.',
    tituloBot: '¡Sorprende a alguien especial con nuestros detalles saludables!'
  },
  {
    nombre: 'Pan Saludable', id: 'pan', emoji: '🍞', fija: true, visible: true,
    descripcion: '🍞 Pan Digestivo (Sin azúcar y Sin gluten): Disfruta de un pan saludable, delicioso con un sabor auténtico y una textura única. Está hecho con harina de arroz, fécula de maíz y harina de almendras. Contiene psyllium, una fuente natural de fibra que favorece la digestión y brinda saciedad. Es 100% libre de gluten y no contiene azúcar refinada.',
    tituloBot: '¡Panes artesanos sin azúcar y sin gluten!'
  },
  {
    nombre: 'Postres Saludables', id: 'postres', emoji: '🍮', fija: true, visible: true,
    descripcion: '✨ Selecciona el producto que prefieras y presiona el botón Pedir para coordinar la entrega directamente a través de nuestro WhatsApp oficial.',
    tituloBot: '¡Postres saludables para disfrutar cualquier día!'
  },
  {
    nombre: 'Mercadito', id: 'mercadito', emoji: '🛒', fija: true, visible: true,
    descripcion: '✨ Selecciona el producto que prefieras y presiona el botón Pedir para coordinar la entrega directamente a través de nuestro WhatsApp oficial.',
    tituloBot: '¡Bienvenid@ a nuestro Mercadito Saludable!'
  }
];

export function slugCategoria(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'categoria';
}

// Lista completa (incluye las ocultas), siempre con las 5 fijas presentes.
export function categoriasDe(config) {
  const guardadas = Array.isArray(config?.categorias) ? config.categorias.filter(c => c && c.nombre) : [];
  if (!guardadas.length) return CATEGORIAS_BASE.map(c => ({ ...c }));
  const lista = guardadas.map(c => {
    const base = CATEGORIAS_BASE.find(b => b.nombre === c.nombre);
    return { ...(base || {}), ...c, id: base ? base.id : (c.id || slugCategoria(c.nombre)), fija: !!base, visible: c.visible !== false };
  });
  CATEGORIAS_BASE.forEach(b => { if (!lista.some(c => c.nombre === b.nombre)) lista.push({ ...b }); });
  return lista;
}

export const categoriasVisibles = (config) => categoriasDe(config).filter(c => c.visible !== false);

// Un producto aparece en su categoría principal y en las adicionales que se le marquen.
export function estaEnCategoria(producto, nombre) {
  if (!producto) return false;
  return producto.category === nombre || (Array.isArray(producto.extraCategorias) && producto.extraCategorias.includes(nombre));
}
