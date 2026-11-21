// Bot de WhatsApp de Territorio Saludable (API de WhatsApp Cloud de Meta).
//
// Flujo:
//   Menú → producto (escrito o desde el botón "Pedir" de la página) → porciones
//   → ¿agregar otro? → datos de entrega (todos en un solo mensaje)
//   → resumen → confirmar → datos de pago → comprobante → la dueña aprueba.
//
// Productos, precios, zonas de domicilio y datos de pago se leen de la base de
// datos (Supabase), así que se cambian desde el panel de administración.

import { leerProductos, leerAjuste, guardarAjuste, supabaseConfigurado } from '../../../lib/servidor';
import { leer, guardar, borrar, esMensajeNuevo } from '../../../lib/sesiones';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_PHONE || '').replace(/\D/g, '');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BASE_URL = 'https://territorio-saludable.vercel.app';
const GRAPH = 'https://graph.facebook.com/v21.0';

// ---------------------------------------------------------------------------
// Textos
// ---------------------------------------------------------------------------

const MENU_PRINCIPAL = `¡Hola! Bienvenid@ a *Territorio Saludable* 🍰🌱

Pastelería 100% sin azúcar refinada y libre de gluten en *Bucaramanga* y su Área Metropolitana.

¿Qué te gustaría ver hoy? Responde con el número:

1️⃣ Tortas Saludables
2️⃣ Catálogo Detalles
3️⃣ Pan Saludable
4️⃣ Postres Saludables
5️⃣ Mercadito
6️⃣ 📖 Ver el catálogo completo
7️⃣ 👩‍🍳 Hablar con un asesor`;

const COMO_PEDIR = `Cuando sepas cuál te gusta, *escríbeme su nombre y las porciones* por aquí, o dale al botón *Pedir* en la página. 🍰✨

_Escribe *0* para volver al menú._`;

const SECCIONES = {
  '1': { emoji: '🍰', titulo: '¡Nuestras tortas son deliciosas y sin culpa!', ancla: 'tortas', nota: '📌 En la página puedes elegir el número de porciones.' },
  '2': { emoji: '🎁', titulo: '¡Sorprende a alguien especial con nuestros detalles saludables!', ancla: 'detalles' },
  '3': { emoji: '🍞', titulo: '¡Panes artesanos sin azúcar y sin gluten!', ancla: 'pan' },
  '4': { emoji: '🍮', titulo: '¡Postres saludables para disfrutar cualquier día!', ancla: 'postres' },
  '5': { emoji: '🛒', titulo: '¡Bienvenid@ a nuestro Mercadito Saludable!', ancla: 'mercadito' }
};

const PLANTILLA_DATOS = `Nombre:
Dirección y barrio:
Quién recibe:
Celular de quien recibe:
Fecha de entrega:
Hora de entrega:
Notas (opcional):`;

const NOMBRES_CAMPOS = {
  nombre: 'Nombre',
  direccion: 'Dirección y barrio',
  recibeNombre: 'Quién recibe',
  recibeTelefono: 'Celular de quien recibe',
  fecha: 'Fecha de entrega',
  hora: 'Hora de entrega'
};

const DATOS_PAGO_POR_DEFECTO = '💳 Nequi / Daviplata: 3000559196';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const formatCOP = (n) => '$ ' + Number(n || 0).toLocaleString('es-CO');

const normalizar = (t) => String(t || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9ñ ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const PALABRAS_VACIAS = new Set(['torta', 'tortas', 'de', 'del', 'con', 'la', 'el', 'los', 'las', 'y', 'mini', 'x', 'porc', 'porciones', 'quiero', 'pedir', 'una', 'un']);

function hoyColombia(diasExtra = 0) {
  const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  ahora.setHours(0, 0, 0, 0);
  ahora.setDate(ahora.getDate() + diasExtra);
  return ahora;
}

const aISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function fechaBonita(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  return `${DIAS[f.getDay()]} ${d} de ${MESES[m - 1]}`;
}

// Entiende "hoy", "mañana", "21/11", "21-11-2026", "21 de noviembre".
function interpretarFecha(texto) {
  const t = normalizar(texto);
  if (/\bhoy\b/.test(t)) return aISO(hoyColombia(0));
  if (/pasado manana/.test(t)) return aISO(hoyColombia(2));
  if (/\bmanana\b/.test(t)) return aISO(hoyColombia(1));
  const hoy = hoyColombia(0);
  let dia, mes, anio;
  const num = texto.match(/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})(?:\s*[\/\-.]\s*(\d{2,4}))?/);
  if (num) {
    dia = Number(num[1]); mes = Number(num[2]); anio = num[3] ? Number(num[3]) : null;
  } else {
    const txt = t.match(/(\d{1,2}) de ([a-z]+)(?: de (\d{4}))?/);
    if (!txt) return null;
    const idx = MESES.findIndex(m => m.startsWith(txt[2].slice(0, 3)));
    if (idx === -1) return null;
    dia = Number(txt[1]); mes = idx + 1; anio = txt[3] ? Number(txt[3]) : null;
  }
  if (anio && anio < 100) anio += 2000;
  if (!anio) {
    anio = hoy.getFullYear();
    if (new Date(anio, mes - 1, dia) < hoy) anio += 1; // ej: en diciembre piden "5 de enero"
  }
  const f = new Date(anio, mes - 1, dia);
  if (f.getMonth() !== mes - 1) return null;
  return aISO(f);
}

// ---------------------------------------------------------------------------
// Catálogo (desde la base de datos, con caché de 1 minuto)
// ---------------------------------------------------------------------------

let cache = { hasta: 0, productos: [], zonas: [], config: {} };

async function catalogo() {
  if (Date.now() < cache.hasta) return cache;
  if (!supabaseConfigurado()) return cache;
  try {
    const [productos, zonas, config] = await Promise.all([leerProductos(), leerAjuste('zonas'), leerAjuste('config')]);
    cache = { hasta: Date.now() + 60_000, productos: productos || [], zonas: zonas || [], config: config || {} };
  } catch (e) {
    console.error('No se pudo leer el catálogo:', e);
  }
  return cache;
}

function palabrasClave(texto) {
  return normalizar(texto).split(' ').filter(w => w.length > 2 && !PALABRAS_VACIAS.has(w) && !/^\d+$/.test(w));
}

const coincide = (a, b) => a === b || (a.length > 3 && b.startsWith(a)) || (b.length > 3 && a.startsWith(b));

function candidatosProducto(texto, productos) {
  const t = normalizar(texto);
  const disponibles = productos.filter(p => p.available !== false);
  const exactos = disponibles
    .filter(p => normalizar(p.name) && t.includes(normalizar(p.name)))
    .sort((a, b) => normalizar(b.name).length - normalizar(a.name).length);
  if (exactos.length) return [exactos[0]];

  const buscadas = palabrasClave(texto);
  if (!buscadas.length) return [];
  // Los sabores también cuentan para buscar ("helado de mora" → Helados).
  const nombres = disponibles.map(p => [...palabrasClave(p.name), ...(p.sabores || []).flatMap(x => palabrasClave(x.nombre))]);
  // Las palabras que salen en muchos productos ("pan", "torta") pesan menos que las raras ("ajo").
  const peso = Object.fromEntries(buscadas.map(w => [w, 1 / Math.max(1, nombres.filter(n => n.some(x => coincide(w, x))).length)]));
  const puntuados = [];
  disponibles.forEach((p, i) => {
    const delNombre = nombres[i];
    if (!delNombre.length) return;
    const halladas = buscadas.filter(w => delNombre.some(n => coincide(w, n)));
    if (!halladas.length) return;
    const soloNombre = palabrasClave(p.name);
    const cubiertas = soloNombre.filter(n => buscadas.some(w => coincide(w, n))).length;
    puntuados.push({ p, puntaje: halladas.reduce((a, w) => a + peso[w], 0), fraccion: halladas.length / buscadas.length, ajuste: soloNombre.length ? cubiertas / soloNombre.length : 0 });
  });
  if (!puntuados.length) return [];
  const maximo = Math.max(...puntuados.map(x => x.puntaje));
  const mejores = puntuados
    .filter(x => x.puntaje >= maximo - 1e-9 && x.fraccion >= 0.5)
    .sort((a, b) => b.ajuste - a.ajuste);
  if (!mejores.length) return [];
  if (mejores.length > 1 && mejores[0].ajuste === 1 && mejores[1].ajuste < 1) return [mejores[0].p];
  return mejores.slice(0, 5).map(x => x.p);
}

function buscarTamano(texto, producto) {
  const tamanos = producto.sizes || [];
  const t = normalizar(texto);
  for (const s of tamanos) {
    if (normalizar(s.portions) && t.includes(normalizar(s.portions))) return s;
  }
  const numeros = t.match(/\d+/g) || [];
  for (const s of tamanos) {
    const n = (normalizar(s.portions).match(/\d+/) || [])[0];
    if (n && numeros.includes(n)) return s;
  }
  if (/personal/.test(t)) {
    const s = tamanos.find(x => /personal/i.test(x.portions));
    if (s) return s;
  }
  return null;
}

function itemDesde(producto, tamano, sabor = null) {
  return {
    id: producto.id,
    nombre: producto.name,
    porcion: tamano ? tamano.portions : null,
    sabor,
    precio: Number(tamano ? tamano.price : producto.price) || 0,
    anticipacion: Boolean(producto.requiresNotice)
  };
}

const nombreItem = (i) => {
  const extra = [i.porcion, i.sabor ? `sabor ${i.sabor}` : null].filter(Boolean).join(', ');
  return extra ? `${i.nombre} (${extra})` : i.nombre;
};

// Tamaños con el mismo precio en realidad son opciones (sabores, rellenos...)
const sonOpciones = (producto) => (producto.sizes || []).length > 1 && new Set(producto.sizes.map(x => Number(x.price))).size === 1;
const saboresDisponibles = (producto) => (producto.sabores || []).filter(x => x.disponible !== false);

function buscarSabor(texto, producto) {
  const t = normalizar(texto);
  return saboresDisponibles(producto).find(x => normalizar(x.nombre) && t.includes(normalizar(x.nombre))) || null;
}

// ---------------------------------------------------------------------------
// Envío de mensajes
// ---------------------------------------------------------------------------

async function enviar(para, contenido) {
  try {
    const res = await fetch(`${GRAPH}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: para, ...contenido })
    });
    if (!res.ok) console.error('WhatsApp respondió', res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error('Error enviando WhatsApp:', e);
    return false;
  }
}

const enviarTexto = (para, texto) => enviar(para, { type: 'text', text: { body: texto, preview_url: false } });

// Botones (máximo 3, títulos de máximo 20 letras)
const enviarBotones = (para, texto, botones) => enviar(para, {
  type: 'interactive',
  interactive: {
    type: 'button',
    body: { text: texto },
    action: { buttons: botones.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title.slice(0, 20) } })) }
  }
});

async function avisarAdmin(texto) {
  if (!ADMIN_PHONE) { console.warn('Falta ADMIN_WHATSAPP_PHONE para avisos:', texto); return; }
  await enviarTexto(ADMIN_PHONE, texto);
}

// ---------------------------------------------------------------------------
// Sesión del cliente
// ---------------------------------------------------------------------------

const sesionNueva = () => ({ paso: 'MENU', carrito: [], datos: {}, candidatos: [], productoId: null });
const claveSesion = (tel) => `wa:sesion:${tel}`;

function respuestaSiNo(msg, texto) {
  const id = msg.interactive?.button_reply?.id;
  if (id === 'si' || id === 'confirmar') return 'si';
  if (id === 'no' || id === 'corregir') return 'no';
  const t = normalizar(texto);
  if (['1', 'si', 'sii', 'claro', 'dale', 'ok', 'listo', 'confirmo', 'confirmar', 'si confirmar'].includes(t) || t.startsWith('si ')) return 'si';
  if (['2', 'no', 'nop', 'no gracias', 'corregir'].includes(t) || t.startsWith('no ')) return 'no';
  return null;
}

const ES_SALUDO = /^(hola+|holi|buen[oa]s?( dias| tardes| noches)?|buenas|hey|ola|info|informacion)\b/;

// ---------------------------------------------------------------------------
// Pasos del pedido
// ---------------------------------------------------------------------------

async function agregarAlCarrito(tel, s, item) {
  s.carrito.push(item);
  s.paso = 'AGREGAR_MAS';
  s.candidatos = [];
  s.productoId = null;
  const precio = item.precio ? ` (${formatCOP(item.precio)})` : '';
  await enviarBotones(tel, `¡Excelente elección! 🍰 Agregué *${nombreItem(item)}*${precio} a tu pedido.\n\n¿Deseas agregar otro producto?`, [
    { id: 'si', title: 'Sí, agregar otro' },
    { id: 'no', title: 'No, continuar' }
  ]);
}

async function preguntarTamano(tel, s, producto) {
  s.paso = 'ELEGIR_TAMANO';
  s.productoId = producto.id;
  if (sonOpciones(producto)) {
    const lista = producto.sizes.map((x, i) => `${i + 1}. ${x.portions}`).join('\n');
    return enviarTexto(tel, `¿Cuál prefieres de *${producto.name}* (${formatCOP(producto.sizes[0].price)})? Responde con el número:\n\n${lista}`);
  }
  const lista = producto.sizes.map((x, i) => `${i + 1}. ${x.portions} — ${formatCOP(x.price)}`).join('\n');
  await enviarTexto(tel, `¿De qué tamaño quieres *${producto.name}*? Responde con el número:\n\n${lista}`);
}

async function procesarProducto(tel, s, producto, textoTamano) {
  if (!producto.sizes || producto.sizes.length === 0) return pasoSabor(tel, s, producto, null, textoTamano);
  const tamano = textoTamano ? buscarTamano(textoTamano, producto) : null;
  if (tamano) return pasoSabor(tel, s, producto, tamano, textoTamano);
  if (producto.sizes.length === 1) return pasoSabor(tel, s, producto, producto.sizes[0], textoTamano);
  return preguntarTamano(tel, s, producto);
}

// Productos con sabores del día (ej. helados): solo se ofrecen los disponibles.
async function pasoSabor(tel, s, producto, tamano, texto) {
  if (!producto.sabores || producto.sabores.length === 0) return agregarAlCarrito(tel, s, itemDesde(producto, tamano));
  const disponibles = saboresDisponibles(producto);
  if (!disponibles.length) {
    s.paso = s.carrito.length ? 'AGREGAR_MAS' : 'MENU';
    s.productoId = null;
    return enviarTexto(tel, `😔 Hoy no tenemos sabores disponibles de *${producto.name}*. Escríbeme otro producto o escribe *0* para ver el menú.`);
  }
  const sabor = texto ? buscarSabor(texto, producto) : null;
  if (sabor) return agregarAlCarrito(tel, s, itemDesde(producto, tamano, sabor.nombre));
  const t = normalizar(texto);
  const agotado = texto ? (producto.sabores || []).find(x => x.disponible === false && normalizar(x.nombre) && t.includes(normalizar(x.nombre))) : null;
  const avisoAgotado = agotado ? `😔 Hoy no tenemos *${agotado.nombre}*.\n\n` : '';
  if (disponibles.length === 1 && !agotado) return agregarAlCarrito(tel, s, itemDesde(producto, tamano, disponibles[0].nombre));
  s.paso = 'ELEGIR_SABOR';
  s.productoId = producto.id;
  s.tamanoPendiente = tamano ? tamano.portions : null;
  const lista = disponibles.map((x, i) => `${i + 1}. ${x.nombre}`).join('\n');
  return enviarTexto(tel, `${avisoAgotado}¿De qué sabor quieres *${producto.name}*? Hoy tenemos:\n\n${lista}\n\nResponde con el número.`);
}

const necesitaAnticipacion = (s) => s.carrito.some(i => i.anticipacion);

async function pedirDatosEntrega(tel, s) {
  s.paso = 'DATOS';
  s.datos = {};
  const minimo = aISO(hoyColombia(necesitaAnticipacion(s) ? 1 : 0));
  const aviso = necesitaAnticipacion(s)
    ? `\n⏰ Tu pedido se prepara con *1 día de anticipación* (entrega desde el ${fechaBonita(minimo)}).`
    : '';
  await enviarTexto(tel, `¡Perfecto! 📝 Para programar la entrega, *copia este mensaje, complétalo y envíalo* en un solo mensaje:${aviso}\n\n${PLANTILLA_DATOS}`);
}

// ---------- Lectura de los datos de entrega ----------

function campoDeEtiqueta(etiqueta) {
  const e = normalizar(etiqueta);
  if (!e) return null;
  if (/recibe/.test(e) && /(celular|telefono|cel|numero|whatsapp)/.test(e)) return 'recibeTelefono';
  if (/recibe/.test(e)) return 'recibeNombre';
  if (/(celular|telefono|whatsapp)/.test(e)) return 'recibeTelefono';
  if (/^(tu )?nombre/.test(e)) return 'nombre';
  if (/(direccion|barrio)/.test(e)) return 'direccion';
  if (/fecha|dia de entrega/.test(e)) return 'fecha';
  if (/hora/.test(e)) return 'hora';
  if (/nota/.test(e)) return 'notas';
  return null;
}

// Lee las líneas "Etiqueta: valor" de la plantilla.
function leerPlantilla(texto) {
  const datos = {};
  for (const linea of texto.split('\n')) {
    const i = linea.indexOf(':');
    if (i === -1) continue;
    const campo = campoDeEtiqueta(linea.slice(0, i).replace(/^[\s\d.)*_-]+/, ''));
    const valor = linea.slice(i + 1).replace(/[*_]/g, '').trim();
    if (!campo || !valor) continue;
    datos[campo] = campo === 'direccion' && datos.direccion ? `${datos.direccion}, ${valor}` : valor;
  }
  return datos;
}

async function preguntarGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 }
      })
    });
    const data = await res.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(texto.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.error('Gemini no respondió:', e);
    return null;
  }
}

// Si el cliente escribió todo de corrido (sin la plantilla), la IA separa los datos.
async function leerTextoLibre(texto) {
  const hoy = aISO(hoyColombia(0));
  const r = await preguntarGemini(`Hoy es ${hoy} (${fechaBonita(hoy)}), en Bucaramanga, Colombia.
Un cliente de una pastelería envió sus datos de entrega:
«${texto}»
Extrae los datos y responde SOLO este JSON (usa null si un dato no aparece; no inventes nada):
{"nombre": string|null, "direccion": string|null (incluye el barrio), "recibeNombre": string|null, "recibeTelefono": string|null, "fecha": "AAAA-MM-DD"|null, "hora": string|null (tal como la escribió), "notas": string|null}`);
  if (!r || typeof r !== 'object') return {};
  const datos = {};
  for (const k of ['nombre', 'direccion', 'recibeNombre', 'recibeTelefono', 'fecha', 'hora', 'notas']) {
    if (r[k] && String(r[k]).trim() && String(r[k]).toLowerCase() !== 'null') datos[k] = String(r[k]).trim();
  }
  return datos;
}

function limpiarCelular(texto) {
  const m = String(texto || '').match(/(\+?57[\s-]*)?(3\d{2})[\s.-]?(\d{3})[\s.-]?(\d{4})/);
  return m ? `${m[2]}${m[3]}${m[4]}` : null;
}

// Hora escrita libre ("3 pm", "a las 10", "mediodía") → hora del día 0-23, o null.
function horaDelDia(texto) {
  const t = normalizar(texto);
  if (/medio ?dia/.test(t)) return 12;
  const m = t.match(/(\d{1,2})(?:[ :.h](\d{2}))?\s*(am|a m|pm|p m|de la manana|de la tarde|de la noche|m)?\b/);
  if (!m) return null;
  let h = Number(m[1]);
  const sufijo = m[3] || '';
  if (/(pm|p m|tarde|noche)/.test(sufijo) && h < 12) h += 12;
  if (!sufijo && h >= 1 && h <= 6) h += 12; // "a las 3" = 3 de la tarde
  return h <= 23 ? h : null;
}

// Busca la zona de domicilio según el barrio escrito en la dirección.
async function zonaDesdeDireccion(direccion, zonas) {
  const t = normalizar(direccion);
  for (const z of zonas) {
    const claves = [...String(z.name || '').split('/'), ...String(z.barrios || '').split(',')]
      .map(normalizar).filter(c => c.length > 2);
    if (claves.some(c => new RegExp(`\\b${c}\\b`).test(t))) return z;
  }
  if (!zonas.length) return null;
  const lista = zonas.map((z, i) => `${i + 1}. ${z.name}${z.barrios ? ' (barrios: ' + z.barrios + ')' : ''}`).join('\n');
  const r = await preguntarGemini(`Zonas de domicilio de una pastelería en Bucaramanga, Colombia:
${lista}
Dirección del cliente: «${direccion}»
¿En qué zona queda? Responde SOLO este JSON: {"zona": numero_de_la_zona | null}. Si no estás seguro, responde null.`);
  const idx = Number(r?.zona) - 1;
  return zonas[idx] || null;
}

const PARECE_HORA = /(\d{1,2}\s*(:\s*\d{2})?\s*(am|pm|a\.?\s?m|p\.?\s?m|de la (manana|tarde|noche)|m\b|h\b))|a las \d|medio ?dia|\b\d{1,2}:\d{2}\b/;

// Reconoce un celular, una fecha o una hora escritos solos (sin "Etiqueta:").
function datosSueltos(texto, faltaban) {
  const datos = {};
  const t = normalizar(texto);
  if (faltaban.includes('recibeTelefono')) {
    const cel = limpiarCelular(texto);
    if (cel) datos.recibeTelefono = cel;
  }
  if (faltaban.includes('fecha')) {
    const f = interpretarFecha(texto.replace(/(\+?57)?\s*3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/, ''));
    if (f) datos.fecha = f;
  }
  if (faltaban.includes('hora') && (PARECE_HORA.test(t) || (faltaban.length === 1 && horaDelDia(texto) !== null))) {
    datos.hora = texto.trim();
  }
  return datos;
}

// Junta lo que el cliente ya mandó con lo nuevo y revisa qué falta.
async function procesarDatos(tel, s, texto) {
  const faltaban = Object.keys(NOMBRES_CAMPOS).filter(k => !s.datos[k]);
  let nuevos = leerPlantilla(texto);
  if (Object.keys(nuevos).length === 0) nuevos = datosSueltos(texto, faltaban);
  if (Object.keys(nuevos).length === 0 && faltaban.length === 1 && !['hora', 'fecha', 'recibeTelefono'].includes(faltaban[0])) {
    nuevos = { [faltaban[0]]: texto.trim() };
  }
  if (Object.keys(nuevos).length === 0) nuevos = await leerTextoLibre(texto);
  if (Object.keys(nuevos).length === 0) {
    if (faltaban.length < Object.keys(NOMBRES_CAMPOS).length) {
      const lista = faltaban.map(k => `${NOMBRES_CAMPOS[k]}:`).join('\n');
      const ejemplo = faltaban.includes('hora') ? '\n\n_Ejemplo de hora: 3 pm o 10:30 am_' : '';
      return enviarTexto(tel, `No logré entenderlo. 🙈 Me falta${faltaban.length > 1 ? 'n estos datos' : ' este dato'}:\n\n${lista}${ejemplo}`);
    }
    return enviarTexto(tel, `No logré leer los datos. 🙈 Copia este mensaje, complétalo y envíalo:\n\n${PLANTILLA_DATOS}`);
  }

  for (const [k, v] of Object.entries(nuevos)) s.datos[k] = v;

  const avisos = [];
  if (s.datos.recibeTelefono) {
    const cel = limpiarCelular(s.datos.recibeTelefono);
    if (cel) s.datos.recibeTelefono = cel;
    else { avisos.push('📱 El celular debe tener 10 dígitos (ej: 3001234567).'); delete s.datos.recibeTelefono; }
  }
  if (s.datos.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(s.datos.fecha)) {
    const iso = interpretarFecha(s.datos.fecha) || (await leerTextoLibre(`Fecha de entrega: ${s.datos.fecha}`)).fecha;
    if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) s.datos.fecha = iso;
    else { avisos.push('📅 No entendí la fecha. Escríbela así: *28/11* o *28 de noviembre*.'); delete s.datos.fecha; }
  }
  if (s.datos.fecha) {
    const error = validarFecha(s, s.datos.fecha);
    if (error) { avisos.push(error); delete s.datos.fecha; }
  }
  if (s.datos.hora && horaDelDia(s.datos.hora) === null && !/(manana|tarde|noche|medio ?dia|temprano)/.test(normalizar(s.datos.hora))) {
    avisos.push('⏰ No entendí la hora. Escríbela así: *3 pm* o *10:30 am*.');
    delete s.datos.hora;
  }
  if (s.datos.fecha && s.datos.hora && esDomingo(s.datos.fecha)) {
    const h = horaDelDia(s.datos.hora);
    if (h !== null && h >= 14) { avisos.push('⏰ Los domingos entregamos solo hasta las *2:00 PM*. Escribe otra hora.'); delete s.datos.hora; }
  }

  const faltan = Object.keys(NOMBRES_CAMPOS).filter(k => !s.datos[k]);
  if (faltan.length) {
    const varios = faltan.length > 1;
    const lista = faltan.map(k => `${NOMBRES_CAMPOS[k]}:`).join('\n');
    const encabezado = avisos.length ? avisos.join('\n') + '\n\n' : 'Gracias 🙌 ';
    return enviarTexto(tel, `${encabezado}Solo me falta${varios ? 'n estos datos' : ' este dato'}. Complétalo${varios ? 's' : ''} y envíalo${varios ? 's' : ''}:\n\n${lista}`);
  }

  const { zonas } = await catalogo();
  const zona = await zonaDesdeDireccion(s.datos.direccion, zonas);
  s.datos.sectorId = zona ? String(zona.id || zona.name) : 'otro';
  return mostrarResumen(tel, s);
}

function validarFecha(s, iso) {
  const minimo = aISO(hoyColombia(necesitaAnticipacion(s) ? 1 : 0));
  if (iso < minimo) {
    return necesitaAnticipacion(s)
      ? `⏰ Este pedido se prepara con *1 día de anticipación*. La fecha más cercana es el *${fechaBonita(minimo)}*.`
      : '📅 Esa fecha ya pasó. Escribe una fecha de hoy en adelante.';
  }
  return null;
}

const esDomingo = (iso) => { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d).getDay() === 0; };

async function mostrarResumen(tel, s) {
  const { zonas } = await catalogo();
  const zona = zonas.find(z => String(z.id || z.name) === s.datos.sectorId);
  const domicilio = zona ? Number(zona.price) || 0 : 0;
  const domicilioPorConfirmar = !zona || !domicilio;
  const subtotal = s.carrito.reduce((a, i) => a + i.precio, 0);
  const precioPendiente = s.carrito.some(i => !i.precio);
  s.datos.sectorNombre = zona ? zona.name : null;
  s.datos.domicilio = domicilio;
  s.datos.domicilioPorConfirmar = domicilioPorConfirmar;
  s.datos.subtotal = subtotal;
  s.datos.total = subtotal + domicilio;
  s.paso = 'CONFIRMAR';

  const productos = s.carrito.map(i => `• ${nombreItem(i)} — ${i.precio ? formatCOP(i.precio) : 'precio por confirmar'}`).join('\n');
  const notas = s.datos.notas ? `\n📝 *Notas:* ${s.datos.notas}` : '';
  const lineaDomicilio = domicilioPorConfirmar ? 'por confirmar' : formatCOP(domicilio);
  const total = (domicilioPorConfirmar || precioPendiente)
    ? `${formatCOP(s.datos.total)} + valores por confirmar`
    : formatCOP(s.datos.total);

  await enviarBotones(tel, `📋 *RESUMEN DE TU PEDIDO*

🛒 *Productos:*
${productos}

👤 *Pide:* ${s.datos.nombre}
📍 *Dirección:* ${s.datos.direccion}${s.datos.sectorNombre ? ` _(zona ${s.datos.sectorNombre})_` : ''}
📦 *Recibe:* ${s.datos.recibeNombre} — ${s.datos.recibeTelefono}
📅 *Entrega:* ${fechaBonita(s.datos.fecha)}, ${s.datos.hora}${notas}

💰 *Subtotal:* ${formatCOP(subtotal)}
🛵 *Domicilio:* ${lineaDomicilio}
💳 *TOTAL:* ${total}${domicilioPorConfirmar ? '\n\n_El valor del domicilio te lo confirmamos en breve._' : ''}

¿Todo está correcto?`, [
    { id: 'confirmar', title: 'Sí, confirmar' },
    { id: 'corregir', title: 'Corregir datos' }
  ]);
}

function codigoPedido() {
  return 'TS-' + Math.floor(1000 + Math.random() * 9000);
}

async function guardarPedido(pedido) {
  await guardar(`wa:pedido:${pedido.codigo}`, pedido, 60 * 60 * 24 * 30);
  if (!supabaseConfigurado()) return;
  try {
    const lista = (await leerAjuste('pedidos_whatsapp')) || [];
    const sinEste = lista.filter(p => p.codigo !== pedido.codigo);
    await guardarAjuste('pedidos_whatsapp', [pedido, ...sinEste].slice(0, 300));
  } catch (e) {
    console.error('No se pudo guardar el pedido en Supabase:', e);
  }
}

// ---------------------------------------------------------------------------
// Comprobante de pago (lectura con IA, opcional)
// ---------------------------------------------------------------------------

async function leerComprobante(mediaId) {
  if (!GEMINI_API_KEY || !mediaId) return null;
  try {
    const meta = await (await fetch(`${GRAPH}/${mediaId}`, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } })).json();
    if (!meta.url) return null;
    const img = await fetch(meta.url, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
    const base64 = Buffer.from(await img.arrayBuffer()).toString('base64');
    const mime = img.headers.get('content-type') || 'image/jpeg';
    const prompt = 'Mira esta imagen. ¿Es un comprobante de pago o transferencia (Nequi, Daviplata, Bancolombia, PSE, etc.)? Responde SOLO un JSON sin markdown: {"esComprobante": true/false, "monto": numero_sin_puntos_o_null, "detalle": "texto corto"}';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: base64 } }] }] })
    });
    const data = await res.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(texto.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.error('No se pudo leer el comprobante:', e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mensajes de la dueña (aprobar pedidos)
// ---------------------------------------------------------------------------

async function manejarAdmin(texto) {
  const t = normalizar(texto);
  const m = t.match(/^(aprobar|aprobado|aprobada)\s*(ts\s*\d{4})?/);
  if (!m) return false;
  let codigo = m[2] ? m[2].replace(/\s/g, '').toUpperCase().replace('TS', 'TS-') : null;
  if (!codigo) codigo = await leer('wa:ultimo_por_verificar');
  const pedido = codigo ? await leer(`wa:pedido:${codigo}`) : null;
  if (!pedido) {
    await avisarAdmin('⚠️ No encontré ese pedido. Escribe por ejemplo: *Aprobar TS-1234*');
    return true;
  }
  if (pedido.estado === 'APROBADO') {
    await avisarAdmin(`El pedido ${pedido.codigo} ya estaba aprobado ✅`);
    return true;
  }
  pedido.estado = 'APROBADO';
  await guardarPedido(pedido);
  await enviarTexto(pedido.telefono, `🎉 ¡Pago verificado!\n\nTu pedido *${pedido.codigo}* quedó *agendado* para el *${fechaBonita(pedido.fecha)}*, ${pedido.hora}.\n\n¡Gracias por elegir Territorio Saludable! 🌱✨`);
  await avisarAdmin(`✅ Pedido ${pedido.codigo} aprobado y notificado al cliente.`);
  const s = await leer(claveSesion(pedido.telefono));
  if (s && s.codigo === pedido.codigo) await borrar(claveSesion(pedido.telefono));
  return true;
}

// ---------------------------------------------------------------------------
// Conversación
// ---------------------------------------------------------------------------

async function manejarMensaje(msg) {
  const tel = msg.from;
  const tipo = msg.type;
  const texto = (msg.text?.body || msg.interactive?.button_reply?.title || '').trim();
  const t = normalizar(texto);

  if (ADMIN_PHONE && tel === ADMIN_PHONE && tipo === 'text' && await manejarAdmin(texto)) return;

  const s = (await leer(claveSesion(tel))) || sesionNueva();
  const guardarSesion = () => guardar(claveSesion(tel), s);
  const { productos, zonas, config } = await catalogo();

  // --- Comandos que funcionan en cualquier momento ---
  if (['0', 'menu', 'inicio', 'cancelar'].includes(t)) {
    if (t === 'cancelar' && s.carrito.length) await enviarTexto(tel, 'Pedido cancelado. 🗑️');
    Object.assign(s, sesionNueva());
    await guardarSesion();
    return enviarTexto(tel, MENU_PRINCIPAL);
  }
  if (t === 'asesor' || (t === '7' && s.paso === 'MENU')) {
    await enviarTexto(tel, '👩‍🍳 ¡Listo! Una persona de nuestro equipo te responderá en breve por aquí.');
    await avisarAdmin(`🚨 *Solicitud de asesor*\nCliente: +${tel}\nAbre WhatsApp y escríbele a ese número.`);
    return;
  }

  // --- Pedido desde el botón "Pedir" de la página ---
  const web = texto.match(/quiero pedir:\s*(.+?)(?:\s*\(([^)]*)\))?\s*(?:-\s*\$.*)?$/i);
  if (web && !['ESPERA_PAGO', 'ESPERA_VERIFICACION'].includes(s.paso)) {
    const nombreWeb = normalizar(web[1]);
    const producto = productos.find(p => normalizar(p.name) === nombreWeb) || candidatosProducto(web[1], productos)[0];
    if (producto) {
      const detalle = web[2] || '';
      await procesarProducto(tel, s, producto, detalle);
    } else {
      await enviarTexto(tel, `No encontré *${web[1]}* en el catálogo actual. 🤔 Una persona del equipo te ayudará.`);
      await avisarAdmin(`⚠️ Cliente +${tel} quiso pedir "${web[1]}" pero no está en el catálogo.`);
    }
    return guardarSesion();
  }

  // --- Comprobante de pago ---
  if (tipo === 'image' || tipo === 'document') {
    if (s.paso === 'ESPERA_PAGO' || s.paso === 'ESPERA_VERIFICACION') {
      const lectura = await leerComprobante(msg.image?.id || msg.document?.id);
      if (lectura && lectura.esComprobante === false) {
        return enviarTexto(tel, `Mmm, esa imagen no parece un comprobante de pago. 🧾 Envíanos la captura de la transferencia por *${formatCOP(s.datos.total)}*, por favor.`);
      }
      s.paso = 'ESPERA_VERIFICACION';
      await guardarSesion();
      const pedido = await leer(`wa:pedido:${s.codigo}`);
      if (pedido) { pedido.estado = 'POR_VERIFICAR'; await guardarPedido(pedido); }
      await guardar('wa:ultimo_por_verificar', s.codigo);
      await enviarTexto(tel, '¡Gracias! 🧾 Recibimos tu comprobante. Vamos a verificar el pago y en breve te confirmamos tu pedido.');
      const monto = lectura?.monto ? `\n🔍 Monto leído: ${formatCOP(lectura.monto)}` : '';
      await avisarAdmin(`🧾 *Comprobante recibido — ${s.codigo}*\n👤 ${s.datos.nombre} (+${tel})\n💰 Total: ${formatCOP(s.datos.total)}${s.datos.domicilioPorConfirmar ? ' + domicilio por confirmar' : ''}${monto}\n📅 ${fechaBonita(s.datos.fecha)}, ${s.datos.hora}\n\nCuando veas el dinero en la cuenta, responde:\n*Aprobar ${s.codigo}*`);
      return;
    }
    return enviarTexto(tel, 'Recibí tu imagen 📷. Si quieres hacer un pedido, escribe *0* para ver el menú.');
  }

  // --- Paso a paso ---
  switch (s.paso) {
    case 'MENU': {
      const seccion = SECCIONES[t];
      if (seccion) {
        const nota = seccion.nota ? `\n\n${seccion.nota}` : '';
        return enviarTexto(tel, `${seccion.titulo} ${seccion.emoji}\n\nMíralos aquí:\n${BASE_URL}/#${seccion.ancla}${nota}\n\n${COMO_PEDIR}`);
      }
      if (t === '6') return enviarTexto(tel, `📖 *Catálogo completo de Territorio Saludable*\n\n${BASE_URL}\n\n${COMO_PEDIR}`);
      if (!t) return enviarTexto(tel, MENU_PRINCIPAL);

      const candidatos = candidatosProducto(texto, productos);
      if (!candidatos.length && ES_SALUDO.test(t)) return enviarTexto(tel, MENU_PRINCIPAL);
      if (candidatos.length === 1) {
        await procesarProducto(tel, s, candidatos[0], texto);
        return guardarSesion();
      }
      if (candidatos.length > 1) {
        s.paso = 'ELEGIR_PRODUCTO';
        s.candidatos = candidatos.map(p => p.id);
        s.textoOriginal = texto;
        await guardarSesion();
        const lista = candidatos.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
        return enviarTexto(tel, `¿Cuál de estos quieres? Responde con el número:\n\n${lista}`);
      }
      return enviarTexto(tel, `No encontré ese producto. 🤔 Escríbelo como aparece en el catálogo, o elige una opción del menú.\n\n${MENU_PRINCIPAL}`);
    }

    case 'ELEGIR_PRODUCTO': {
      const idx = parseInt(t, 10) - 1;
      const producto = productos.find(p => p.id === s.candidatos[idx]);
      if (!producto) return enviarTexto(tel, 'Responde con el número de la lista, o escribe *0* para volver al menú.');
      await procesarProducto(tel, s, producto, s.textoOriginal || '');
      return guardarSesion();
    }

    case 'ELEGIR_TAMANO': {
      const producto = productos.find(p => p.id === s.productoId);
      if (!producto) { Object.assign(s, sesionNueva()); await guardarSesion(); return enviarTexto(tel, MENU_PRINCIPAL); }
      const idx = parseInt(t, 10) - 1;
      const tamano = (/^\d+$/.test(t) && producto.sizes[idx]) || buscarTamano(texto, producto);
      if (!tamano) return preguntarTamano(tel, s, producto);
      await pasoSabor(tel, s, producto, tamano, texto);
      return guardarSesion();
    }

    case 'ELEGIR_SABOR': {
      const producto = productos.find(p => p.id === s.productoId);
      if (!producto) { Object.assign(s, sesionNueva()); await guardarSesion(); return enviarTexto(tel, MENU_PRINCIPAL); }
      const disponibles = saboresDisponibles(producto);
      const idx = parseInt(t, 10) - 1;
      const sabor = (/^\d+$/.test(t) && disponibles[idx]) || buscarSabor(texto, producto);
      if (!sabor) {
        const lista = disponibles.map((x, i) => `${i + 1}. ${x.nombre}`).join('\n');
        return enviarTexto(tel, `Elige uno de los sabores disponibles hoy:\n\n${lista}`);
      }
      const tamano = (producto.sizes || []).find(x => x.portions === s.tamanoPendiente) || null;
      s.tamanoPendiente = null;
      await agregarAlCarrito(tel, s, itemDesde(producto, tamano, sabor.nombre));
      return guardarSesion();
    }

    case 'AGREGAR_MAS': {
      const r = respuestaSiNo(msg, texto);
      if (r === 'si') {
        s.paso = 'MENU';
        await guardarSesion();
        return enviarTexto(tel, `¡Súper! 🙌 Escríbeme el otro producto con sus porciones, o elígelo en la página:\n${BASE_URL}`);
      }
      if (r === 'no') {
        await pedirDatosEntrega(tel, s);
        return guardarSesion();
      }
      // Escribió otro producto directamente
      const candidatos = candidatosProducto(texto, productos);
      if (candidatos.length === 1) {
        await procesarProducto(tel, s, candidatos[0], texto);
        return guardarSesion();
      }
      return enviarBotones(tel, '¿Deseas agregar otro producto?', [{ id: 'si', title: 'Sí, agregar otro' }, { id: 'no', title: 'No, continuar' }]);
    }

    case 'DATOS':
      if (!t || /^(hola+|holi|buen[oa]s?( dias| tardes| noches)?|buenas|hey|ola)$/.test(t)) {
        return enviarTexto(tel, `¡Hola! 👋 Sigamos con tu pedido. Copia este mensaje, complétalo y envíalo:\n\n${PLANTILLA_DATOS}\n\n_Escribe *cancelar* si quieres empezar de nuevo._`);
      }
      await procesarDatos(tel, s, texto);
      return guardarSesion();

    case 'CONFIRMAR': {
      const r = respuestaSiNo(msg, texto);
      if (r === 'si') {
        s.codigo = codigoPedido();
        s.paso = 'ESPERA_PAGO';
        await guardarPedido({
          codigo: s.codigo, telefono: tel, estado: 'ESPERA_PAGO', creado: new Date().toISOString(),
          carrito: s.carrito, ...s.datos
        });
        await guardarSesion();
        const datosPago = config.datosPago || DATOS_PAGO_POR_DEFECTO;
        const domicilio = s.datos.domicilioPorConfirmar ? '\n_(El valor del domicilio te lo confirmamos antes de pagar.)_' : '';
        await enviarTexto(tel, `🎉 *¡Pedido ${s.codigo} confirmado!*\n\nPara programarlo en cocina, realiza el pago de *${formatCOP(s.datos.total)}* a:\n\n${datosPago}${domicilio}\n\n📌 *Último paso:* envíanos por aquí la *foto o captura del comprobante*. 🧾`);
        await avisarAdmin(`🆕 *Nuevo pedido ${s.codigo}* (esperando pago)\n👤 ${s.datos.nombre} (+${tel})\n🛒 ${s.carrito.map(nombreItem).join(', ')}\n📍 ${s.datos.direccion}${s.datos.sectorNombre ? ' (' + s.datos.sectorNombre + ')' : ''}\n📅 ${fechaBonita(s.datos.fecha)}, ${s.datos.hora}\n💰 ${formatCOP(s.datos.total)}${s.datos.domicilioPorConfirmar ? ' + domicilio por confirmar' : ''}`);
        return;
      }
      if (r === 'no') {
        await enviarTexto(tel, 'Sin problema, volvamos a llenar los datos de entrega. ✍️\n_(Si quieres cambiar los productos, escribe *cancelar* y empezamos de nuevo.)_');
        await pedirDatosEntrega(tel, s);
        return guardarSesion();
      }
      return enviarBotones(tel, '¿Confirmas tu pedido?', [{ id: 'confirmar', title: 'Sí, confirmar' }, { id: 'corregir', title: 'Corregir datos' }]);
    }

    case 'ESPERA_PAGO':
      return enviarTexto(tel, `Estamos esperando la *foto del comprobante* de tu pedido ${s.codigo} por ${formatCOP(s.datos.total)}. 🧾\n\nSi tienes una duda, escribe *asesor*.`);

    case 'ESPERA_VERIFICACION':
      return enviarTexto(tel, `Ya recibimos tu comprobante del pedido ${s.codigo}. ✅ Estamos verificando el pago y te confirmamos muy pronto.`);

    default:
      Object.assign(s, sesionNueva());
      await guardarSesion();
      return enviarTexto(tel, MENU_PRINCIPAL);
  }
}

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const MY_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'territorio_token_secret';
  if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) return new Response(challenge, { status: 200 });
  return new Response('Verification failed', { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const mensajes = body.entry?.[0]?.changes?.[0]?.value?.messages || [];
    for (const msg of mensajes) {
      if (!(await esMensajeNuevo(msg.id))) continue;
      try {
        await manejarMensaje(msg);
      } catch (e) {
        console.error('Error manejando mensaje:', e);
        await enviarTexto(msg.from, 'Uy, tuvimos un problema técnico. 🙏 Escribe *asesor* y una persona te ayuda.');
      }
    }
  } catch (e) {
    console.error('Error en webhook:', e);
  }
  // Siempre 200 para que Meta no reintente.
  return Response.json({ status: 'ok' });
}
