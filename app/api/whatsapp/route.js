// Bot de WhatsApp de Territorio Saludable (API de WhatsApp Cloud de Meta).
//
// Flujo:
//   Menú → producto (escrito o desde el botón "Pedir" de la página) → porciones
//   → ¿agregar otro? → datos de entrega (formulario de WhatsApp o preguntas)
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
const FLOW_ID = process.env.WHATSAPP_FLOW_ID || '';
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

const HORARIOS_ENTREGA = [
  { id: 'h1', title: '8:00 a 10:00 AM' },
  { id: 'h2', title: '10:00 AM a 12:00 M' },
  { id: 'h3', title: '12:00 M a 2:00 PM' },
  { id: 'h4', title: '2:00 a 4:00 PM' },
  { id: 'h5', title: '4:00 a 6:00 PM' }
];
const HORARIOS_DOMINGO = ['h1', 'h2', 'h3']; // domingos y festivos solo hasta las 2 PM

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

function candidatosProducto(texto, productos) {
  const t = normalizar(texto);
  const disponibles = productos.filter(p => p.available !== false);
  const exactos = disponibles
    .filter(p => normalizar(p.name) && t.includes(normalizar(p.name)))
    .sort((a, b) => normalizar(b.name).length - normalizar(a.name).length);
  if (exactos.length) return [exactos[0]];

  const puntuados = [];
  for (const p of disponibles) {
    const palabras = normalizar(p.name).split(' ').filter(w => w.length > 2 && !PALABRAS_VACIAS.has(w));
    if (!palabras.length) continue;
    const coinciden = palabras.filter(w => new RegExp(`\\b${w}`).test(t)).length;
    if (coinciden > 0) puntuados.push({ p, puntaje: coinciden / palabras.length + coinciden * 0.01 });
  }
  puntuados.sort((a, b) => b.puntaje - a.puntaje);
  if (!puntuados.length) return [];
  const mejor = puntuados[0].puntaje;
  if (mejor >= 0.99) {
    const empatados = puntuados.filter(x => x.puntaje >= mejor - 0.001);
    return empatados.slice(0, 5).map(x => x.p);
  }
  return puntuados.filter(x => x.puntaje >= 0.5).slice(0, 5).map(x => x.p);
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

function itemDesde(producto, tamano) {
  return {
    id: producto.id,
    nombre: producto.name,
    porcion: tamano ? tamano.portions : null,
    precio: Number(tamano ? tamano.price : producto.price) || 0,
    anticipacion: Boolean(producto.requiresNotice)
  };
}

const nombreItem = (i) => i.porcion ? `${i.nombre} (${i.porcion})` : i.nombre;

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
  const lista = producto.sizes.map((x, i) => `${i + 1}. ${x.portions} — ${formatCOP(x.price)}`).join('\n');
  await enviarTexto(tel, `¿De qué tamaño quieres la *${producto.name}*? Responde con el número:\n\n${lista}`);
}

async function procesarProducto(tel, s, producto, textoTamano) {
  if (!producto.sizes || producto.sizes.length === 0) return agregarAlCarrito(tel, s, itemDesde(producto, null));
  const tamano = textoTamano ? buscarTamano(textoTamano, producto) : null;
  if (tamano) return agregarAlCarrito(tel, s, itemDesde(producto, tamano));
  if (producto.sizes.length === 1) return agregarAlCarrito(tel, s, itemDesde(producto, producto.sizes[0]));
  return preguntarTamano(tel, s, producto);
}

const necesitaAnticipacion = (s) => s.carrito.some(i => i.anticipacion);

async function pedirDatosEntrega(tel, s) {
  const { zonas } = await catalogo();
  const anticipacion = necesitaAnticipacion(s);
  s.paso = 'DATOS';
  s.datos = {};

  if (FLOW_ID) {
    const sectores = (zonas.length ? zonas : [{ id: 'otro', name: 'Otro sector' }])
      .map(z => ({ id: String(z.id || z.name), title: String(z.name).slice(0, 30) }));
    sectores.push({ id: 'otro', title: 'Otro (te confirmamos)' });
    const ok = await enviar(tel, {
      type: 'interactive',
      interactive: {
        type: 'flow',
        body: { text: `¡Perfecto! 📝 Toca el botón para completar los datos de entrega.${anticipacion ? '\n\n⏰ Tu pedido se prepara con *1 día de anticipación*.' : ''}` },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: `pedido-${tel}-${Date.now()}`,
            flow_id: FLOW_ID,
            flow_cta: 'Completar datos',
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'DATOS_ENTREGA',
              data: {
                sectores,
                horas: HORARIOS_ENTREGA,
                fecha_minima: aISO(hoyColombia(anticipacion ? 1 : 0)),
                aviso_fecha: anticipacion
                  ? 'Este pedido se prepara con 1 día de anticipación.'
                  : 'Domingos y festivos entregamos hasta las 2:00 PM.'
              }
            }
          }
        }
      }
    });
    if (ok) return;
    console.error('No se pudo enviar el formulario; se usan preguntas.');
  }

  // Sin formulario: preguntas cortas
  s.paso = 'PIDE_NOMBRE';
  await enviarTexto(tel, '¡Perfecto! 📝 Vamos con los datos de entrega.\n\n1. ¿Cuál es tu *nombre completo*?');
}

async function preguntarSector(tel, zonas) {
  const lista = zonas.map((z, i) => `${i + 1}. ${z.name}`).join('\n');
  await enviarTexto(tel, `3. ¿En qué *sector* queda? Responde con el número:\n\n${lista}\n${zonas.length + 1}. Otro (te confirmamos el valor)`);
}

function horariosTexto() {
  return HORARIOS_ENTREGA.map((h, i) => `${i + 1}. ${h.title}`).join('\n');
}

function validarFecha(s, iso) {
  const minimo = aISO(hoyColombia(necesitaAnticipacion(s) ? 1 : 0));
  if (iso < minimo) {
    return necesitaAnticipacion(s)
      ? `⏰ Este pedido se prepara con *1 día de anticipación*. La fecha más cercana es el *${fechaBonita(minimo)}*.`
      : 'Esa fecha ya pasó. 🙈 Escribe una fecha de hoy en adelante.';
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
  s.datos.sectorNombre = zona ? zona.name : (s.datos.sectorNombre || 'Otro sector');
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
📍 *Dirección:* ${s.datos.direccion} (${s.datos.sectorNombre})
📦 *Recibe:* ${s.datos.recibeNombre} — ${s.datos.recibeTelefono}
📅 *Entrega:* ${fechaBonita(s.datos.fecha)}, ${s.datos.hora}${notas}

💰 *Subtotal:* ${formatCOP(subtotal)}
🛵 *Domicilio:* ${lineaDomicilio}
💳 *TOTAL:* ${total}

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
      await procesarProducto(tel, s, producto, web[2] || '');
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

  // --- Respuesta del formulario de WhatsApp ---
  if (tipo === 'interactive' && msg.interactive?.type === 'nfm_reply') {
    if (s.paso !== 'DATOS') return;
    let r = {};
    try { r = JSON.parse(msg.interactive.nfm_reply.response_json || '{}'); } catch (e) { /* vacío */ }
    let fecha = String(r.fecha || '');
    if (/^\d{10,}$/.test(fecha)) fecha = aISO(new Date(new Date(Number(fecha)).toLocaleString('en-US', { timeZone: 'America/Bogota' })));
    const horario = HORARIOS_ENTREGA.find(h => h.id === r.hora);
    const zona = zonas.find(z => String(z.id || z.name) === r.sector);
    s.datos = {
      nombre: r.nombre, direccion: r.direccion,
      sectorId: r.sector, sectorNombre: zona ? zona.name : 'Otro sector',
      recibeNombre: r.recibe_nombre, recibeTelefono: r.recibe_telefono,
      fecha, hora: horario ? horario.title : (r.hora || ''), notas: r.notas || ''
    };
    const error = fecha ? validarFecha(s, fecha) : 'No recibí la fecha.';
    if (error) {
      await enviarTexto(tel, error + '\n\nTe envío de nuevo el formulario. 👇');
      await pedirDatosEntrega(tel, s);
      return guardarSesion();
    }
    if (esDomingo(fecha) && !HORARIOS_DOMINGO.includes(r.hora)) {
      await enviarTexto(tel, 'Los domingos entregamos solo hasta las *2:00 PM*. 🙏 Te envío de nuevo el formulario para elegir otro horario.');
      await pedirDatosEntrega(tel, s);
      return guardarSesion();
    }
    await mostrarResumen(tel, s);
    return guardarSesion();
  }

  // --- Si saluda a mitad de los datos, repetimos la pregunta en vez de tomar "hola" como respuesta ---
  const PREGUNTAS = {
    PIDE_NOMBRE: '1. ¿Cuál es tu *nombre completo*?',
    PIDE_DIRECCION: '2. ¿Cuál es la *dirección de entrega*? (calle/carrera, número, apto o casa)',
    PIDE_RECIBE: '4. ¿*Quién recibe* el pedido? Escribe su *nombre y celular*.',
    PIDE_FECHA: '5. ¿Para qué *fecha* lo quieres? _Ejemplo: mañana, 28/11 o 28 de noviembre_',
    PIDE_HORA: `6. ¿En qué *horario*? Responde con el número:\n\n${horariosTexto()}`
  };
  if (PREGUNTAS[s.paso] && /^(hola+|holi|buen[oa]s?( dias| tardes| noches)?|buenas|hey|ola)$/.test(t)) {
    return enviarTexto(tel, `¡Hola! 👋 Sigamos con tu pedido:\n\n${PREGUNTAS[s.paso]}\n\n_Escribe *cancelar* si quieres empezar de nuevo._`);
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
      await agregarAlCarrito(tel, s, itemDesde(producto, tamano));
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
      // Esperando el formulario. Si escribe en vez de llenarlo, se lo reenviamos.
      if (t === 'datos') { await pedirDatosEntrega(tel, s); return guardarSesion(); }
      return enviarTexto(tel, 'Para continuar toca el botón *Completar datos* del mensaje anterior. 👆\n\n_Si no lo ves, escribe *datos* y te lo envío de nuevo._');

    case 'PIDE_NOMBRE':
      s.datos.nombre = texto;
      s.paso = 'PIDE_DIRECCION';
      await guardarSesion();
      return enviarTexto(tel, '2. ¿Cuál es la *dirección de entrega*? (calle/carrera, número, apto o casa)');

    case 'PIDE_DIRECCION':
      s.datos.direccion = texto;
      s.paso = 'PIDE_SECTOR';
      await guardarSesion();
      return preguntarSector(tel, zonas);

    case 'PIDE_SECTOR': {
      const idx = parseInt(t, 10) - 1;
      if (!(idx >= 0 && idx <= zonas.length)) return preguntarSector(tel, zonas);
      const zona = zonas[idx];
      s.datos.sectorId = zona ? String(zona.id || zona.name) : 'otro';
      s.datos.sectorNombre = zona ? zona.name : 'Otro sector';
      s.paso = 'PIDE_RECIBE';
      await guardarSesion();
      return enviarTexto(tel, '4. ¿*Quién recibe* el pedido? Escribe su *nombre y celular*.\n_Ejemplo: Ana Gómez 3001234567_');
    }

    case 'PIDE_RECIBE': {
      const celular = (texto.match(/(\+?57\s*)?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/) || [])[0];
      if (!celular) return enviarTexto(tel, 'Me falta el *celular* de quien recibe. 📱 Escribe nombre y celular, por ejemplo: _Ana Gómez 3001234567_');
      s.datos.recibeTelefono = celular.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
      s.datos.recibeNombre = texto.replace(celular, '').replace(/[,;:-]+/g, ' ').trim() || s.datos.nombre;
      s.paso = 'PIDE_FECHA';
      await guardarSesion();
      const minimo = aISO(hoyColombia(necesitaAnticipacion(s) ? 1 : 0));
      const aviso = necesitaAnticipacion(s) ? `\n⏰ Este pedido se prepara con *1 día de anticipación* (desde el ${fechaBonita(minimo)}).` : '';
      return enviarTexto(tel, `5. ¿Para qué *fecha* lo quieres?${aviso}\n_Ejemplo: mañana, 28/11 o 28 de noviembre_`);
    }

    case 'PIDE_FECHA': {
      const fecha = interpretarFecha(texto);
      if (!fecha) return enviarTexto(tel, 'No entendí la fecha. 🙈 Escríbela así: *28/11* o *28 de noviembre*.');
      const error = validarFecha(s, fecha);
      if (error) return enviarTexto(tel, error);
      s.datos.fecha = fecha;
      s.paso = 'PIDE_HORA';
      await guardarSesion();
      const nota = esDomingo(fecha) ? '\n_Domingos y festivos: solo hasta las 2:00 PM._' : '';
      return enviarTexto(tel, `6. ¿En qué *horario*? Responde con el número:${nota}\n\n${horariosTexto()}`);
    }

    case 'PIDE_HORA': {
      const horario = HORARIOS_ENTREGA[parseInt(t, 10) - 1];
      if (!horario) return enviarTexto(tel, `Responde con el número del horario:\n\n${horariosTexto()}`);
      if (esDomingo(s.datos.fecha) && !HORARIOS_DOMINGO.includes(horario.id)) {
        return enviarTexto(tel, 'Los domingos entregamos solo hasta las *2:00 PM*. Elige 1, 2 o 3.');
      }
      s.datos.hora = horario.title;
      await mostrarResumen(tel, s);
      return guardarSesion();
    }

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
        await avisarAdmin(`🆕 *Nuevo pedido ${s.codigo}* (esperando pago)\n👤 ${s.datos.nombre} (+${tel})\n🛒 ${s.carrito.map(nombreItem).join(', ')}\n📍 ${s.datos.direccion} (${s.datos.sectorNombre})\n📅 ${fechaBonita(s.datos.fecha)}, ${s.datos.hora}\n💰 ${formatCOP(s.datos.total)}${s.datos.domicilioPorConfirmar ? ' + domicilio por confirmar' : ''}`);
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
