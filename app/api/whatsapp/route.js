// Bot de WhatsApp de Territorio Saludable (API de WhatsApp Cloud de Meta).
//
// Flujo:
//   Menú → producto (escrito o desde el botón "Pedir" de la página) → tamaño/sabor
//   → ¿agregar otro? → datos (un solo mensaje: entrega o recogida, nombre, dirección,
//   celular, fecha, hora, forma de pago) → resumen → confirmar
//   → pago (total, anticipo del 50% o contra entrega) → comprobante → Camila aprueba
//   → aviso a producción + evento en el calendario.
//
// Después de un pedido (o de pedir asesor) el bot "duerme" 24 horas con ese cliente:
// no le repite el menú y le reenvía sus mensajes a Camila para que responda una persona.
//
// Productos, precios, zonas, categorías y datos de pago se leen de la base de datos
// (Supabase), así que se cambian desde el panel de administración.

import { categoriasVisibles } from '../../../lib/categorias';
import { leerProductos, leerAjuste, supabaseConfigurado } from '../../../lib/servidor';
import { leer, guardar, borrar, esMensajeNuevo } from '../../../lib/sesiones';
import {
  normalizar, ahoraColombia, hoyColombia, aISO, fechaBonita, nombreDia, MESES,
  esDiaSinEntregas, despuesDeDescanso, HORA_INICIO_TRAS_DESCANSO,
  horaDelDia, horaYMinutos, HORA_INMEDIATA, esInmediato
} from '../../../lib/fechas';
import { enviarTexto, enviarBotones, descargarMedia, listaNumeros, numerosAprobadores } from '../../../lib/whatsapp';
import { crearEventoCalendario } from '../../../lib/calendario';
import { guardarPedidoBot, formatCOP, nombreItem } from '../../../lib/pedidos';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BASE_URL = 'https://territorio-saludable.vercel.app';
const HORAS_DORMIDO = 24;

// ---------------------------------------------------------------------------
// Textos (de "tú": el cliente lo prefiere más cercano)
// ---------------------------------------------------------------------------

const NUMEROS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const numeroEmoji = (n) => NUMEROS[n] || `*${n}.*`;

// El menú sale de las categorías visibles del panel (incluye las de temporada).
// Siempre terminan: catálogo completo, asesor y entrega inmediata.
function opcionesMenu(config) {
  const cats = categoriasVisibles(config);
  return { cats, catalogo: String(cats.length + 1), asesor: String(cats.length + 2), inmediata: String(cats.length + 3) };
}

function menuPrincipal(config) {
  const { cats, catalogo, asesor, inmediata } = opcionesMenu(config);
  const lineas = cats.map((c, i) => `${numeroEmoji(i + 1)} ${c.fija ? '' : (c.emoji ? c.emoji + ' ' : '')}${c.nombre}`);
  return `¡Hola! Bienvenid@ a *Territorio Saludable* 🌱

Pastelería 100% sin azúcar refinada y libre de gluten en *Bucaramanga* y su Área Metropolitana.

¿Qué te gustaría ver hoy? Responde con el número:

${lineas.join('\n')}
${numeroEmoji(Number(catalogo))} Ver el catálogo completo
${numeroEmoji(Number(asesor))} Hablar con un asesor
${numeroEmoji(Number(inmediata))} ⚡ ¿Qué hay para ya?`;
}

const COMO_PEDIR = `Cuando sepas cuál te gusta, *escríbenos el nombre del producto y el tamaño* por aquí, o presiona el botón *Pedir* en la página.

_Escribe *0* para volver al menú._`;

function seccionPorNumero(config, t) {
  const { cats } = opcionesMenu(config);
  const n = Number(t);
  if (!/^\d+$/.test(t) || n < 1 || n > cats.length) return null;
  const c = cats[n - 1];
  return { titulo: `*${c.nombre}*`, ancla: c.id, nota: c.id === 'tortas' ? 'En la página puedes elegir el número de porciones.' : '' };
}

const PIDE_INMEDIATA = /(que hay para ya|para hoy|para ya|entrega inmediata|inmediat|que (tienen|tiene|hay) (hoy|ya|disponible)|disponible(s)? (hoy|ya)|lo de hoy)/;

const DATOS_PAGO_POR_DEFECTO = 'Nequi / Daviplata: 3000559196';
const DIRECCION_TIENDA = 'Calle 59 # 30-91, barrio Conucos, Bucaramanga';
const direccionTienda = (config) => (config && config.direccionTienda) || DIRECCION_TIENDA;
const PAGO_AL_RECIBIR = 'en efectivo o por transferencia';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const PALABRAS_VACIAS = new Set(['torta', 'tortas', 'de', 'del', 'con', 'la', 'el', 'los', 'las', 'y', 'mini', 'x', 'porc', 'porciones', 'quiero', 'pedir', 'una', 'un']);

// Entiende "hoy", "mañana", "21/11", "21-11-2026", "21 de noviembre".
function interpretarFecha(texto) {
  const t = normalizar(texto);
  if (/\bhoy\b/.test(t)) return aISO(hoyColombia(0));
  if (/pasado manana/.test(t)) return aISO(hoyColombia(2));
  if (/^(para )?manana\b/.test(t) || /\bmanana$/.test(t)) return aISO(hoyColombia(1));
  const hoy = hoyColombia(0);
  let dia, mes, anio;
  const num = String(texto).match(/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})(?:\s*[\/\-.]\s*(\d{2,4}))?/);
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

const horaBonita = (h) => (h === 12 ? '12:00 m.' : h > 12 ? `${h - 12}:00 p. m.` : `${h}:00 a. m.`);

// ---------------------------------------------------------------------------
// Catálogo (desde la base de datos, con caché de 1 minuto)
// ---------------------------------------------------------------------------

let cache = { hasta: 0, productos: [], zonas: [], config: {}, privado: {} };

async function catalogo() {
  if (Date.now() < cache.hasta) return cache;
  if (!supabaseConfigurado()) return cache;
  try {
    const [productos, zonas, config, privado] = await Promise.all([leerProductos(), leerAjuste('zonas'), leerAjuste('config'), leerAjuste('privado')]);
    cache = { hasta: Date.now() + 60_000, productos: productos || [], zonas: zonas || [], config: config || {}, privado: privado || {} };
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

// Productos que llevan tarjeta con mensaje (marcados en el panel, o que lo dicen en la descripción)
const llevaTarjeta = (p) => (typeof p.tarjeta === 'boolean' ? p.tarjeta : /tarjeta/i.test(p.description || ''));
const pedidoConTarjeta = (s) => s.carrito.some(i => i.tarjeta);

// Días de anticipación del producto (0 = entrega el mismo día)
function diasAnticipacion(p) {
  const d = Number(p.diasAnticipacion);
  if (d > 0) return d;
  return p.requiresNotice ? 1 : 0;
}
function esTortaProducto(p) {
  return p.category === 'Tortas Saludables' || /\btortas?\b/i.test(p.name || '');
}
// Toda torta suma el recargo al domicilio (se puede activar en otros productos desde el panel)
const sumaRecargo = (p) => (typeof p.recargoDomicilio === 'boolean' ? p.recargoDomicilio : (p.enCarro === true || esTortaProducto(p)));
// Tortas y guacales exigen 50% de anticipo para contra entrega (editable por producto en el panel)
const exigeAnticipo = (p) => (typeof p.anticipo === 'boolean' ? p.anticipo : (esTortaProducto(p) || /guacal/i.test(p.name || '')));

function itemDesde(producto, tamano, sabor = null) {
  return {
    id: producto.id,
    nombre: producto.name,
    porcion: tamano ? tamano.portions : null,
    sabor,
    tarjeta: llevaTarjeta(producto),
    precio: Number(tamano ? tamano.price : producto.price) || 0,
    anticipacion: diasAnticipacion(producto),
    recargo: sumaRecargo(producto),
    anticipo: exigeAnticipo(producto)
  };
}
const itemConRecargo = (i) => i.recargo ?? i.enCarro ?? i.esTorta ?? false;

// Tamaños con el mismo precio en realidad son opciones (sabores, rellenos...)
const sonOpciones = (producto) => (producto.sizes || []).length > 1 && new Set(producto.sizes.map(x => Number(x.price))).size === 1;
const saboresDisponibles = (producto) => (producto.sabores || []).filter(x => x.disponible !== false);

function buscarSabor(texto, producto) {
  const t = normalizar(texto);
  return saboresDisponibles(producto).find(x => normalizar(x.nombre) && t.includes(normalizar(x.nombre))) || null;
}

const diasNecesarios = (s) => Math.max(0, ...s.carrito.map(i => Number(i.anticipacion) || 0));

function fechaMinima(s) {
  const d = hoyColombia(diasNecesarios(s));
  while (esDiaSinEntregas(aISO(d))) d.setDate(d.getDate() + 1);
  return aISO(d);
}

// ---------------------------------------------------------------------------
// Avisos al equipo
// ---------------------------------------------------------------------------

async function aprobadores() {
  const { privado } = await catalogo();
  return numerosAprobadores(privado);
}

async function avisarAdmin(texto) {
  const lista = await aprobadores();
  if (!lista.length) { console.warn('No hay números para avisos de pago:', texto); return; }
  for (const n of lista) await enviarTexto(n, texto);
}

const etiquetaEntrega = (d) => (d.entrega === 'tienda' ? '🏪 Recoge en tienda' : '🛵 Domicilio');

function lineaPagoEquipo(d) {
  if (d.formaPago === 'contraentrega') {
    return d.anticipo
      ? `Anticipo: ${formatCOP(d.anticipo)} · Saldo contra entrega: ${formatCOP(d.saldo)}`
      : `Contra entrega: cobrar ${formatCOP(d.saldo)}`;
  }
  return `Transferencia: ${formatCOP(d.total)}`;
}

function resumenEquipo(tel, d, carrito) {
  const lugar = d.entrega === 'tienda' ? '' : `\n📍 ${d.direccion}${d.sectorNombre ? ' (' + d.sectorNombre + ')' : ''}`;
  const recibe = d.recibeNombre && d.recibeNombre !== d.nombre ? `\n📦 Recibe: ${d.recibeNombre}` : '';
  return `👤 ${d.nombre} (+${tel}) · 📱 ${d.recibeTelefono}\n🛒 ${carrito.map(nombreItem).join(', ')}\n${etiquetaEntrega(d)}${lugar}${recibe}\n📅 ${fechaBonita(d.fecha)}, ${d.hora}` +
    (d.mensajeTarjeta ? `\n💌 Tarjeta: ${d.mensajeTarjeta}` : '') + (d.notas ? `\n📝 ${d.notas}` : '');
}

// ---------- Aviso a producción (Marta) ----------
async function avisarProduccion(pedido) {
  const { privado } = await catalogo();
  const lista = listaNumeros(privado.produccion);
  if (!lista.length) return 'sin número de producción';
  const productos = (pedido.carrito || []).map(i => `• ${nombreItem(i)}`).join('\n');
  const texto = `🧁 *Nuevo pedido para preparar — ${pedido.codigo}*\n\n📅 *Entrega:* ${fechaBonita(pedido.fecha)}, ${pedido.hora}\n${etiquetaEntrega(pedido)}\n\n*Productos:*\n${productos}` +
    (pedido.mensajeTarjeta ? `\n\n💌 *Tarjeta:* ${pedido.mensajeTarjeta}` : '') +
    (pedido.notas ? `\n📝 *Notas:* ${pedido.notas}` : '') +
    (pedido.entrega === 'tienda' ? '' : `\n\n📍 ${pedido.sectorNombre || pedido.direccion}`);
  let ok = true;
  for (const n of lista) ok = (await enviarTexto(n, texto)) && ok;
  return ok ? 'avisado' : 'no se pudo avisar (revisa que haya escrito al bot en las últimas 24 h)';
}

async function agendarEnCalendario(pedido) {
  const { privado, config } = await catalogo();
  const items = pedido.carrito || [];
  const titulo = `${pedido.entrega === 'tienda' ? '🏪' : '🍰'} ${pedido.codigo} · ${items.length ? nombreItem(items[0]) : 'Pedido'}${items.length > 1 ? ` + ${items.length - 1} más` : ''}`;
  const descripcion = [
    `Pedido ${pedido.codigo}`,
    '',
    'Productos:',
    ...items.map(i => `• ${nombreItem(i)}`),
    pedido.mensajeTarjeta ? `\nTarjeta: ${pedido.mensajeTarjeta}` : '',
    pedido.notas ? `Notas: ${pedido.notas}` : '',
    '',
    `Hora acordada: ${pedido.hora}`,
    pedido.entrega === 'tienda' ? 'Recoge en tienda' : `Dirección: ${pedido.direccion}${pedido.sectorNombre ? ' (' + pedido.sectorNombre + ')' : ''}`,
    `Nombre: ${pedido.nombre} · Celular: ${pedido.recibeTelefono}`,
    pedido.recibeNombre && pedido.recibeNombre !== pedido.nombre ? `Recibe: ${pedido.recibeNombre}` : '',
    `Total: ${formatCOP(pedido.total)}${pedido.domicilioPorConfirmar ? ' + domicilio por confirmar' : ''}`,
    `Pago: ${lineaPagoEquipo(pedido)}`
  ].filter(x => x !== '').join('\n');
  return crearEventoCalendario({
    titulo, descripcion, fecha: pedido.fecha, hora: pedido.hora,
    ubicacion: pedido.entrega === 'tienda' ? direccionTienda(config) : `${pedido.direccion}, Bucaramanga`
  }, privado);
}

// ---------------------------------------------------------------------------
// Sesión del cliente y modo "dormido"
// ---------------------------------------------------------------------------

const sesionNueva = () => ({ paso: 'MENU', carrito: [], datos: {}, candidatos: [], productoId: null });
const claveSesion = (tel) => `wa:sesion:${tel}`;
const claveDormido = (tel) => `wa:dormido:${tel}`;

const dormir = (tel, codigo, motivo) => guardar(claveDormido(tel), { codigo: codigo || null, motivo, avisado: false }, HORAS_DORMIDO * 3600);

function respuestaSiNo(msg, texto) {
  const id = msg.interactive?.button_reply?.id;
  if (id === 'si' || id === 'confirmar') return 'si';
  if (id === 'no' || id === 'corregir') return 'no';
  const t = normalizar(texto);
  if (['1', 'si', 'sii', 'claro', 'dale', 'ok', 'listo', 'confirmo', 'confirmar', 'si confirmar', 'correcto', 'esta bien'].includes(t) || t.startsWith('si ')) return 'si';
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
  await enviarBotones(tel, `¡Excelente elección! Agregamos *${nombreItem(item)}*${precio} a tu pedido.\n\n¿Deseas agregar otro producto?`, [
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
    return enviarTexto(tel, `Lo sentimos, hoy no tenemos sabores disponibles de *${producto.name}*. Escríbenos otro producto o escribe *0* para ver el menú.`);
  }
  const sabor = texto ? buscarSabor(texto, producto) : null;
  if (sabor) return agregarAlCarrito(tel, s, itemDesde(producto, tamano, sabor.nombre));
  const t = normalizar(texto);
  const agotado = texto ? (producto.sabores || []).find(x => x.disponible === false && normalizar(x.nombre) && t.includes(normalizar(x.nombre))) : null;
  const avisoAgotado = agotado ? `Lo sentimos, hoy no tenemos *${agotado.nombre}*.\n\n` : '';
  if (disponibles.length === 1 && !agotado) return agregarAlCarrito(tel, s, itemDesde(producto, tamano, disponibles[0].nombre));
  s.paso = 'ELEGIR_SABOR';
  s.productoId = producto.id;
  s.tamanoPendiente = tamano ? tamano.portions : null;
  const lista = disponibles.map((x, i) => `${i + 1}. ${x.nombre}`).join('\n');
  return enviarTexto(tel, `${avisoAgotado}¿De qué sabor quieres *${producto.name}*? Hoy tenemos:\n\n${lista}\n\nResponde con el número.`);
}

// ---------- Plantilla de datos ----------

function plantillaDatos(s) {
  return [
    'Entrega (domicilio o recoger en tienda):',
    'Nombre:',
    'Dirección y barrio:',
    'Celular de contacto:',
    'Quién recibe (opcional):',
    'Fecha:',
    'Hora:',
    'Forma de pago (transferencia o contra entrega):',
    pedidoConTarjeta(s) ? 'Mensaje para la tarjeta (opcional):' : null,
    'Notas (opcional):'
  ].filter(Boolean).join('\n');
}

const PREGUNTAS = {
  entrega: '¿Quieres *domicilio* o *recoger en tienda*?',
  nombre: '¿A nombre de quién queda el pedido?',
  direccion: '¿Cuál es la *dirección completa y el barrio* de entrega?',
  fecha: '¿Para qué *fecha* quieres tu pedido?',
  hora: '¿A qué *hora* quieres tu pedido?',
  formaPago: '¿Cómo quieres pagar: *transferencia* o *contra entrega*?'
};

async function pedirDatosEntrega(tel, s) {
  s.paso = 'DATOS';
  s.datos = {};
  const dias = diasNecesarios(s);
  const minimo = fechaMinima(s);
  const avisos = [];
  if (dias) avisos.push(`⏰ Tu pedido se prepara con *${dias} día${dias > 1 ? 's' : ''} de anticipación* (entrega desde el ${fechaBonita(minimo)}).`);
  else avisos.push('⚡ Si lo quieres para ya, en la hora escribe *lo antes posible* (aproximadamente 30 minutos).');
  avisos.push('No hacemos entregas los domingos ni festivos. Los lunes (o el día después de un festivo) entregamos desde las 2:00 p. m.');
  if (s.carrito.some(i => i.anticipo)) avisos.push('Para pago contra entrega, las tortas y guacales requieren un *anticipo del 50%*.');
  await enviarTexto(tel, `¡Perfecto! Para programar tu pedido, *copia este mensaje, complétalo y envíalo* en un solo mensaje:\n\n${plantillaDatos(s)}\n\n${avisos.join('\n')}`);
}

// ---------- Lectura de los datos ----------

function campoDeEtiqueta(etiqueta) {
  const e = normalizar(etiqueta);
  if (!e) return null;
  if (/fecha|dia de entrega/.test(e)) return 'fecha';
  if (/^hora/.test(e) || /\bhora\b/.test(e)) return 'hora';
  if (/(forma de pago|pago|como paga)/.test(e)) return 'formaPago';
  if (/recibe/.test(e) && /(celular|telefono|cel|numero|whatsapp)/.test(e)) return 'recibeTelefono';
  if (/recibe/.test(e)) return 'recibeNombre';
  if (/(celular|telefono|whatsapp|contacto)/.test(e)) return 'recibeTelefono';
  if (/^(tu |su )?nombre/.test(e)) return 'nombre';
  if (/(direccion|barrio)/.test(e)) return 'direccion';
  if (/(tarjeta|dedicatoria|mensaje)/.test(e)) return 'mensajeTarjeta';
  if (/nota/.test(e)) return 'notas';
  if (/(entrega|domicilio|recoger|recoge|tienda)/.test(e)) return 'entrega';
  return null;
}

// Lee las líneas "Etiqueta: valor" de la plantilla.
function leerPlantilla(texto) {
  const datos = {};
  for (const linea of texto.split('\n')) {
    const i = linea.indexOf(':');
    if (i === -1) continue;
    const campo = campoDeEtiqueta(linea.slice(0, i).replace(/^[\s\d.)*_-]+/, '').replace(/\(.*?\)/g, ''));
    const valor = linea.slice(i + 1).replace(/[*_]/g, '').trim();
    if (!campo || !valor) continue;
    datos[campo] = campo === 'direccion' && datos.direccion ? `${datos.direccion}, ${valor}` : valor;
  }
  return datos;
}

function interpretarEntrega(texto) {
  const t = normalizar(texto).replace(/contra ?entrega/g, ' ');
  if (/(recog|recoj|tienda|local|paso por|pasar por|paso a|retir|yo voy|voy por|en persona)/.test(t)) return 'tienda';
  if (/(domicilio|enviar|envio|envien|llev|a la casa|a domicilio|entrega)/.test(t)) return 'domicilio';
  return null;
}

function interpretarPago(texto) {
  const t = normalizar(texto);
  if (/(contra ?entrega|al recibir|al recoger|cuando (llegue|reciba|recoja)|efectivo|en la entrega|contraentrega)/.test(t)) return 'contraentrega';
  if (/(transfer|nequi|daviplata|bancolombia|consign|pse|anticipad|ya pag|pago ya|tarjeta de credito|bre ?b)/.test(t)) return 'transferencia';
  return null;
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
Un cliente de una pastelería envió los datos de su pedido:
«${texto}»
Extrae los datos y responde SOLO este JSON (usa null si un dato no aparece; no inventes nada):
{"entrega": "domicilio"|"tienda"|null, "nombre": string|null, "direccion": string|null (incluye el barrio), "recibeNombre": string|null, "recibeTelefono": string|null, "fecha": "AAAA-MM-DD"|null, "hora": string|null (tal como la escribió), "formaPago": "transferencia"|"contraentrega"|null, "notas": string|null, "mensajeTarjeta": string|null (mensaje o dedicatoria para la tarjeta, tal como lo escribió)}`);
  if (!r || typeof r !== 'object') return {};
  const datos = {};
  for (const k of ['entrega', 'nombre', 'direccion', 'recibeNombre', 'recibeTelefono', 'fecha', 'hora', 'formaPago', 'notas', 'mensajeTarjeta']) {
    if (r[k] && String(r[k]).trim() && String(r[k]).toLowerCase() !== 'null') datos[k] = String(r[k]).trim();
  }
  return datos;
}

function limpiarCelular(texto) {
  const m = String(texto || '').match(/(\+?57[\s-]*)?(3\d{2})[\s.-]?(\d{3})[\s.-]?(\d{4})/);
  return m ? `${m[2]}${m[3]}${m[4]}` : null;
}

// Nombres de ciudad: casi toda dirección los trae, así que no sirven para saber el barrio
const CIUDADES = new Set(['bucaramanga', 'floridablanca', 'giron', 'piedecuesta', 'lebrija', 'santander', 'colombia']);

// Busca la zona de domicilio según el barrio escrito en la dirección.
async function zonaDesdeDireccion(direccion, zonas) {
  const t = normalizar(direccion);
  // Gana el nombre de barrio más largo que aparezca ("lagos del cacique" antes que "lagos")
  let mejor = null, largo = 0;
  for (const z of zonas) {
    const claves = [...String(z.name || '').split('/'), ...String(z.barrios || '').split(',')]
      .map(normalizar).filter(c => c.length > 2 && !CIUDADES.has(c));
    for (const c of claves) {
      if (c.length > largo && new RegExp(`\\b${c}\\b`).test(t)) { mejor = z; largo = c.length; }
    }
  }
  if (mejor) return mejor;
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

const PARECE_DIRECCION = /\b(calle|cll|cl|carrera|cra|kra|kr|cr|avenida|av|diagonal|dg|transversal|tv|circular|barrio|apto|apartamento|casa|torre|conjunto|edificio|manzana|mz|lote|piso|urbanizaci[oó]n|vereda|km)\b|#|\bn[°º]/i;

// Reconoce los datos escritos sin "Etiqueta:", uno por línea (o separados por comas).
function datosSueltos(texto, faltaban) {
  const datos = {};
  // Cada línea, y dentro de ella lo separado por comas (menos en direcciones)
  const lineas = texto.split('\n').map(x => x.trim()).filter(Boolean)
    .flatMap(l => (PARECE_DIRECCION.test(l) ? [l] : l.split(/[,;]/).map(x => x.trim()).filter(Boolean)));
  const nombres = [];
  const quienRecibe = [];
  const falta = (k) => faltaban.includes(k) && !datos[k];
  let anteriorFueDireccion = false;
  for (const lineaOriginal of lineas) {
    let linea = lineaOriginal;
    // La línea que sigue a la dirección y es solo texto suele ser el barrio ("Real de minas")
    if (anteriorFueDireccion && /^[a-záéíóúñü0-9 .'-]{3,60}$/i.test(linea) && !interpretarFecha(linea) && !PARECE_HORA.test(normalizar(linea)) && !interpretarPago(linea) && !limpiarCelular(linea)) {
      datos.direccion = `${datos.direccion}, ${linea}`;
      anteriorFueDireccion = false;
      continue;
    }
    anteriorFueDireccion = false;
    const t0 = normalizar(linea);
    // Domicilio / tienda y forma de pago (frases cortas)
    if (t0.split(' ').length <= 6) {
      let usadaCorta = false;
      if (falta('formaPago') && interpretarPago(linea)) { datos.formaPago = linea; usadaCorta = true; }
      if (falta('entrega') && !PARECE_DIRECCION.test(linea) && interpretarEntrega(linea)) { datos.entrega = linea; usadaCorta = true; }
      if (usadaCorta) continue;
    }
    // Dirección (se revisa primero para no confundir "#20-11" con una fecha)
    if (falta('direccion') || (datos.direccion && PARECE_DIRECCION.test(linea))) {
      if (PARECE_DIRECCION.test(linea) && !limpiarCelular(linea)) {
        datos.direccion = datos.direccion ? `${datos.direccion}, ${linea}` : linea;
        anteriorFueDireccion = true;
        continue;
      }
    }
    let usada = false;
    const cel = limpiarCelular(linea);
    if (cel && (falta('recibeTelefono') || !datos.recibeTelefono)) {
      datos.recibeTelefono = cel;
      linea = linea.replace(/(\+?57[\s-]*)?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/, '').replace(/[,;:-]+/g, ' ').trim();
      usada = true;
    }
    const t = normalizar(linea);
    if (linea && falta('fecha')) {
      const f = interpretarFecha(linea);
      if (f) { datos.fecha = f; usada = true; }
    }
    if (linea && falta('hora') && (PARECE_HORA.test(t) || esInmediato(linea) || (faltaban.length === 1 && horaDelDia(linea) !== null))) {
      const m = linea.match(/(a las\s*)?\d{1,2}([:.]\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?|de la (mañana|manana|tarde|noche)|m\b|h\b)?|medio ?d[ií]a/i);
      datos.hora = esInmediato(linea) && !PARECE_HORA.test(t) ? linea : (m ? m[0].trim() : linea);
      usada = true;
    }
    if (usada) {
      // Lo que sobra de una línea con celular suele ser el nombre ("Ana 3001234567")
      if (cel && linea && /^[a-záéíóúñü .]+$/i.test(linea)) nombres.push(linea.replace(/^(recibe|para|quien recibe)\s*/i, '').trim());
      continue;
    }
    if (/^[a-záéíóúñü .'-]{2,60}$/i.test(linea) && !ES_SALUDO.test(t) && !/^(corregir|cancelar|si|no|ok|listo|gracias)$/.test(t)) {
      if (/^(recibe|quien recibe|lo recibe|para)\b/i.test(linea)) quienRecibe.push(linea.replace(/^(quien recibe|lo recibe|recibe|para)\s*:?\s*/i, '').trim());
      else nombres.push(linea.replace(/^(pide|soy|me llamo|mi nombre es)\s*/i, '').trim());
    }
  }
  // El primer nombre es quien pide; un segundo nombre es quien recibe
  for (const n of nombres) {
    if (falta('nombre')) datos.nombre = n;
    else if (!datos.recibeNombre) datos.recibeNombre = n;
  }
  if (quienRecibe.length) datos.recibeNombre = quienRecibe[0];
  return datos;
}

// Datos obligatorios que todavía faltan (en orden)
function datosFaltantes(s) {
  const d = s.datos;
  const faltan = [];
  if (!d.entrega) faltan.push('entrega');
  if (!d.nombre) faltan.push('nombre');
  if (d.entrega !== 'tienda' && !d.direccion) faltan.push('direccion');
  if (!d.fecha) faltan.push('fecha');
  if (!d.hora) faltan.push('hora');
  if (!d.formaPago) faltan.push('formaPago');
  return faltan;
}

function mensajeDiaTrasDescanso(iso) {
  return `Discúlpanos, los ${nombreDia(iso)} entregamos a partir de las *2:00 p. m.*, porque el día anterior no trabajamos. ¿A qué hora desde las 2:00 p. m. te queda bien?`;
}

// Revisa la hora (y la fecha cuando es "lo antes posible"). Devuelve un aviso o null.
function validarHora(s) {
  const d = s.datos;
  if (!d.hora) return null;
  const hoyIso = aISO(hoyColombia(0));
  const ahora = ahoraColombia();
  const hm = horaYMinutos(d.hora);

  if (!hm && esInmediato(d.hora)) {
    if (diasNecesarios(s) > 0) {
      delete d.hora;
      return `Este pedido se prepara con anticipación, por eso no puede ser inmediato. Escribe la hora que prefieras para el *${fechaBonita(fechaMinima(s))}* o después.`;
    }
    if (esDiaSinEntregas(hoyIso)) {
      delete d.hora;
      return `Hoy no hacemos entregas (domingo o festivo). Escribe fecha y hora a partir del *${fechaBonita(fechaMinima(s))}*.`;
    }
    if (despuesDeDescanso(hoyIso) && ahora.getHours() < HORA_INICIO_TRAS_DESCANSO) {
      delete d.hora;
      d.fecha = hoyIso;
      return mensajeDiaTrasDescanso(hoyIso);
    }
    d.hora = HORA_INMEDIATA;
    d.fecha = hoyIso;
    return null;
  }
  if (!hm && !/(manana|tarde|noche|medio ?dia|temprano)/.test(normalizar(d.hora))) {
    delete d.hora;
    return 'No entendimos la hora. Escríbela así: *3 pm* o *10:30 am*, o escribe *lo antes posible*.';
  }
  if (!d.fecha) return null;
  if (despuesDeDescanso(d.fecha)) {
    const enLaManana = hm ? hm.h < HORA_INICIO_TRAS_DESCANSO : /(manana|temprano)/.test(normalizar(d.hora));
    if (enLaManana) { delete d.hora; return mensajeDiaTrasDescanso(d.fecha); }
  }
  if (d.fecha === hoyIso && hm && hm.h * 60 + hm.m < ahora.getHours() * 60 + ahora.getMinutes() - 5) {
    delete d.hora;
    return 'Esa hora ya pasó. Escribe una hora de aquí en adelante, o *lo antes posible*.';
  }
  return null;
}

function validarFecha(s, iso) {
  const minimo = fechaMinima(s);
  if (esDiaSinEntregas(iso)) {
    return `Los domingos y festivos no hacemos entregas. La fecha más cercana disponible es el *${fechaBonita(minimo)}*.`;
  }
  if (iso < minimo) {
    const dias = diasNecesarios(s);
    return dias
      ? `Este pedido se prepara con *${dias} día${dias > 1 ? 's' : ''} de anticipación*. La fecha más cercana es el *${fechaBonita(minimo)}*.`
      : 'Esa fecha ya pasó. Escribe una fecha de hoy en adelante.';
  }
  return null;
}

// Junta lo que el cliente ya mandó con lo nuevo y revisa qué falta.
async function procesarDatos(tel, s, texto) {
  const faltaban = datosFaltantes(s);
  let nuevos = leerPlantilla(texto);
  let usoIA = false;
  // Un mensaje largo sin etiquetas: primero la IA (si está), luego las reglas propias
  if (Object.keys(nuevos).length === 0 && faltaban.length > 2 && GEMINI_API_KEY) { nuevos = await leerTextoLibre(texto); usoIA = true; }
  if (Object.keys(nuevos).length === 0) nuevos = datosSueltos(texto, faltaban);
  if (Object.keys(nuevos).length === 0 && faltaban.length === 1 && ['nombre', 'direccion', 'entrega', 'formaPago'].includes(faltaban[0])) {
    nuevos = { [faltaban[0]]: texto.trim() };
  }
  if (Object.keys(nuevos).length === 0 && !usoIA) nuevos = await leerTextoLibre(texto);
  if (Object.keys(nuevos).length === 0) {
    if (faltaban.length < 6) {
      return enviarTexto(tel, `No logramos entenderlo 🙈 Por favor cuéntanos:\n\n${faltaban.map(k => '• ' + PREGUNTAS[k]).join('\n')}`);
    }
    return enviarTexto(tel, `No logramos leer los datos 🙈 Copia este mensaje, complétalo y envíalo:\n\n${plantillaDatos(s)}`);
  }

  // Si la IA recortó la hora ("3" en vez de "3:00 pm"), se toma tal como la escribió el cliente
  if (usoIA && nuevos.hora && !/(am|pm|a\.\s?m|p\.\s?m|manana|tarde|noche|medio)/i.test(normalizar(nuevos.hora))) {
    const m = texto.match(/\d{1,2}([:.]\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?|de la (mañana|manana|tarde|noche))/i);
    if (m) nuevos.hora = m[0].trim();
  }
  for (const [k, v] of Object.entries(nuevos)) if (v) s.datos[k] = v;
  const d = s.datos;
  const avisos = [];

  // Entrega: domicilio o tienda (si escribió dirección y no dijo nada, es domicilio)
  if (d.entrega && d.entrega !== 'domicilio' && d.entrega !== 'tienda') {
    const e = interpretarEntrega(d.entrega);
    if (e) d.entrega = e;
    else { delete d.entrega; }
  }
  if (!d.entrega && d.direccion) d.entrega = 'domicilio';
  if (d.entrega === 'tienda') { delete d.direccion; delete d.sectorId; }

  // Forma de pago
  if (d.formaPago && d.formaPago !== 'transferencia' && d.formaPago !== 'contraentrega') {
    const p = interpretarPago(d.formaPago);
    if (p) d.formaPago = p;
    else { delete d.formaPago; avisos.push('No entendimos la forma de pago. Escribe *transferencia* o *contra entrega*.'); }
  }

  // Nombre: sirve el de quien pide o el de quien recibe
  if (!d.nombre && d.recibeNombre) d.nombre = d.recibeNombre;

  // Celular: si no lo escribe, se usa el número desde el que escribe
  if (d.recibeTelefono) {
    const cel = limpiarCelular(d.recibeTelefono);
    if (cel) d.recibeTelefono = cel;
    else { avisos.push('El celular debe tener 10 dígitos (ej: 3001234567).'); delete d.recibeTelefono; }
  }

  // Tarjeta: opcional ("sin mensaje" = sin mensaje)
  if (d.mensajeTarjeta && /^(sin mensaje|ninguno|no|n a|na|-+)$/.test(normalizar(d.mensajeTarjeta))) delete d.mensajeTarjeta;
  if (d.notas && /^(ninguna|no|n a|na|-+)$/.test(normalizar(d.notas))) delete d.notas;

  // Fecha
  if (d.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) {
    const iso = interpretarFecha(d.fecha) || (await leerTextoLibre(`Fecha de entrega: ${d.fecha}`)).fecha;
    if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) d.fecha = iso;
    else { avisos.push('No entendimos la fecha. Escríbela así: *28/11* o *28 de noviembre*.'); delete d.fecha; }
  }
  if (d.fecha && !esInmediato(d.hora || '')) {
    const error = validarFecha(s, d.fecha);
    if (error) { avisos.push(error); delete d.fecha; }
  }
  const avisoHora = validarHora(s);
  if (avisoHora) avisos.push(avisoHora);

  const faltan = datosFaltantes(s);
  if (faltan.length) {
    const preguntas = faltan.filter(k => !(k === 'hora' && avisoHora)).map(k => '• ' + PREGUNTAS[k]);
    const encabezado = avisos.length ? avisos.join('\n\n') : (faltan.length === 1 ? '¡Gracias! Solo nos falta un dato:' : '¡Gracias! Solo nos faltan estos datos:');
    return enviarTexto(tel, `${encabezado}${preguntas.length ? '\n\n' + preguntas.join('\n') : ''}`);
  }

  if (!d.recibeTelefono) d.recibeTelefono = tel.startsWith('57') && tel.length === 12 ? tel.slice(2) : tel;

  if (d.entrega === 'domicilio') {
    const { zonas } = await catalogo();
    const zona = await zonaDesdeDireccion(d.direccion, zonas);
    d.sectorId = zona ? String(zona.id || zona.name) : 'otro';
  }
  if (avisos.length) await enviarTexto(tel, avisos.join('\n\n'));
  return mostrarResumen(tel, s);
}

// ---------- Cuentas del pedido ----------

const redondear100 = (n) => Math.ceil(n / 100) * 100;

function calcularPago(d, carrito) {
  const requiereAnticipo = carrito.some(i => i.anticipo);
  if (d.formaPago === 'transferencia') {
    d.anticipo = 0; d.saldo = 0; d.aPagar = d.total;
  } else if (requiereAnticipo) {
    d.anticipo = redondear100(d.total * 0.5);
    d.saldo = Math.max(0, d.total - d.anticipo);
    d.aPagar = d.anticipo;
  } else {
    d.anticipo = 0; d.saldo = d.total; d.aPagar = 0;
  }
}

async function mostrarResumen(tel, s) {
  const { zonas, config } = await catalogo();
  const d = s.datos;
  const subtotal = s.carrito.reduce((a, i) => a + i.precio, 0);
  const precioPendiente = s.carrito.some(i => !i.precio);
  let domicilio = 0, recargo = 0, domicilioPorConfirmar = false;
  if (d.entrega === 'domicilio') {
    const zona = zonas.find(z => String(z.id || z.name) === d.sectorId);
    const base = zona ? Number(zona.price) || 0 : 0;
    const conRecargo = s.carrito.some(itemConRecargo);
    recargo = conRecargo ? (config.recargoTortas === undefined || config.recargoTortas === '' ? 3000 : Number(config.recargoTortas) || 0) : 0;
    domicilioPorConfirmar = !zona || !base;
    domicilio = domicilioPorConfirmar ? 0 : base + recargo;
    d.sectorNombre = zona ? zona.name : null;
  } else {
    d.sectorNombre = null;
  }
  d.recargoTortas = recargo;
  d.domicilio = domicilio;
  d.domicilioPorConfirmar = domicilioPorConfirmar;
  d.subtotal = subtotal;
  d.total = subtotal + domicilio;
  calcularPago(d, s.carrito);
  s.paso = 'CONFIRMAR';

  const productos = s.carrito.map(i => `• ${nombreItem(i)} — ${i.precio ? formatCOP(i.precio) : 'precio por confirmar'}`).join('\n');
  const extras = (d.mensajeTarjeta ? `\n*Tarjeta:* ${d.mensajeTarjeta}` : '') + (d.notas ? `\n*Notas:* ${d.notas}` : '');
  const lugar = d.entrega === 'tienda'
    ? `*Entrega:* Recoge en tienda (${direccionTienda(config)})`
    : `*Entrega:* Domicilio\n*Dirección:* ${d.direccion}${d.sectorNombre ? ` _(zona ${d.sectorNombre})_` : ''}`;
  const recibe = d.recibeNombre && d.recibeNombre !== d.nombre ? `\n*Recibe:* ${d.recibeNombre}` : '';
  const lineaDomicilio = d.entrega === 'tienda' ? '' : `\n*Domicilio:* ${domicilioPorConfirmar ? 'por confirmar' : formatCOP(domicilio)}`;
  const pendiente = domicilioPorConfirmar || precioPendiente;
  const total = pendiente ? `${formatCOP(d.total)} + valores por confirmar` : formatCOP(d.total);
  let pago;
  if (d.formaPago === 'transferencia') pago = '*Forma de pago:* Transferencia (pago completo antes de la entrega)';
  else if (d.anticipo) pago = pendiente
    ? '*Forma de pago:* Contra entrega con anticipo del 50% (el valor te lo confirmamos junto con el domicilio)'
    : `*Forma de pago:* Contra entrega con anticipo\n*Anticipo (50%):* ${formatCOP(d.anticipo)}\n*Saldo al ${d.entrega === 'tienda' ? 'recoger' : 'recibir'}:* ${formatCOP(d.saldo)} (${PAGO_AL_RECIBIR})`;
  else pago = `*Forma de pago:* Contra entrega (paga al ${d.entrega === 'tienda' ? 'recoger' : 'recibir'}, ${PAGO_AL_RECIBIR})`;

  await enviarBotones(tel, `*RESUMEN DE TU PEDIDO*

*Productos:*
${productos}

${lugar}
*Nombre:* ${d.nombre}${recibe}
*Celular:* ${d.recibeTelefono}
*Fecha:* ${fechaBonita(d.fecha)}, ${d.hora}${extras}

*Subtotal:* ${formatCOP(subtotal)}${lineaDomicilio}
*TOTAL:* ${total}
${pago}${domicilioPorConfirmar ? '\n\n_El valor del domicilio a tu sector te lo enviamos apenas confirmes._' : ''}

¿Todo está correcto?`, [
    { id: 'confirmar', title: 'Sí, confirmar' },
    { id: 'corregir', title: 'Corregir datos' }
  ]);
}

function codigoPedido() {
  return 'TS-' + Math.floor(1000 + Math.random() * 9000);
}

// Después de confirmar (o de fijar el domicilio): pedir el pago o dejarlo para que Camila confirme
async function siguientePasoPago(tel, pedido, s, resumenAdmin) {
  const { config } = await catalogo();
  const datosPago = config.datosPago || DATOS_PAGO_POR_DEFECTO;
  if (pedido.aPagar > 0) {
    pedido.estado = 'ESPERA_PAGO';
    await guardarPedidoBot(pedido);
    if (s) {
      s.paso = 'ESPERA_PAGO';
      s.codigo = pedido.codigo;
      for (const k of ['domicilio', 'domicilioPorConfirmar', 'total', 'anticipo', 'saldo', 'aPagar']) s.datos[k] = pedido[k];
    }
    const detalle = pedido.anticipo
      ? ` (anticipo del 50%; el saldo de ${formatCOP(pedido.saldo)} lo pagas al ${pedido.entrega === 'tienda' ? 'recoger' : 'recibir'}, ${PAGO_AL_RECIBIR})`
      : '';
    await enviarTexto(tel, `*¡Pedido ${pedido.codigo} registrado!* 🎉\n\nPara programarlo, por favor realiza el pago de *${formatCOP(pedido.aPagar)}*${detalle} a:\n\n${datosPago}\n\nLuego envíanos por aquí la *foto o captura del comprobante*. 🧾`);
    if (resumenAdmin) await avisarAdmin(`🆕 *Nuevo pedido ${pedido.codigo}* (esperando pago)\n${resumenAdmin}\n💰 Total ${formatCOP(pedido.total)} · ${lineaPagoEquipo(pedido)}`);
    return;
  }
  // Contra entrega sin anticipo: Camila lo confirma
  pedido.estado = 'POR_CONFIRMAR';
  await guardarPedidoBot(pedido);
  await guardar('wa:ultimo_por_verificar', pedido.codigo);
  if (s) { s.paso = 'MENU'; s.carrito = []; s.datos = {}; s.codigo = null; }
  await enviarTexto(tel, `*¡Pedido ${pedido.codigo} recibido!* 🎉\n\nEn breve te confirmamos tu pedido. El pago de *${formatCOP(pedido.total)}* lo realizas al ${pedido.entrega === 'tienda' ? 'recoger' : 'recibir'}, ${PAGO_AL_RECIBIR}.${pedido.entrega === 'tienda' ? `\n\nDirección de la tienda: ${direccionTienda(config)}` : ''}\n\n¡Gracias por elegir Territorio Saludable! 🌱`);
  await avisarAdmin(`🆕 *Pedido contra entrega ${pedido.codigo}*\n${resumenAdmin || ''}\n💰 Cobrar al entregar: ${formatCOP(pedido.total)}\n\nPara confirmarlo y pasarlo a producción, responde:\n*Aprobar ${pedido.codigo}*`);
  await dormir(tel, pedido.codigo, 'pedido');
}

// ---------------------------------------------------------------------------
// Comprobante de pago (lectura con IA, opcional)
// ---------------------------------------------------------------------------

async function leerComprobante(mediaId) {
  if (!GEMINI_API_KEY || !mediaId) return null;
  try {
    const media = await descargarMedia(mediaId);
    if (!media) return null;
    const prompt = 'Mira esta imagen. ¿Es un comprobante de pago o transferencia (Nequi, Davivienda, Bancolombia, PSE, etc.)? Responde SOLO un JSON sin markdown: {"esComprobante": true/false, "monto": numero_sin_puntos_o_null, "detalle": "texto corto"}';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: media.mime, data: media.base64 } }] }] })
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
// Mensajes de Camila (aprobar pedidos, fijar domicilio)
// ---------------------------------------------------------------------------

async function manejarAdmin(texto, desde) {
  const responder = (msg) => enviarTexto(desde, msg);
  const t = normalizar(texto);
  const dom = t.match(/^domicilio\s*(ts\s*\d{4})\s*\$?\s*([\d ]+)/);
  if (dom) return fijarDomicilio(dom[1].replace(/\s/g, '').toUpperCase().replace('TS', 'TS-'), Number(dom[2].replace(/\D/g, '')), responder);
  const m = t.match(/^(aprobar|aprobado|aprobada)\s*(ts\s*\d{4})?/);
  if (!m) return false;
  let codigo = m[2] ? m[2].replace(/\s/g, '').toUpperCase().replace('TS', 'TS-') : null;
  if (!codigo) codigo = await leer('wa:ultimo_por_verificar');
  const pedido = codigo ? await leer(`wa:pedido:${codigo}`) : null;
  if (!pedido) {
    await responder('⚠️ No encontré ese pedido. Escribe por ejemplo: *Aprobar TS-1234*');
    return true;
  }
  if (pedido.estado === 'APROBADO') {
    await responder(`El pedido ${pedido.codigo} ya estaba aprobado ✅`);
    return true;
  }
  if (pedido.estado === 'ESPERA_DOMICILIO') {
    await responder(`Primero indica el valor del domicilio de ${pedido.codigo}, por ejemplo:\n*Domicilio ${pedido.codigo} 12000*`);
    return true;
  }
  const sinPago = pedido.estado === 'POR_CONFIRMAR';
  pedido.estado = 'APROBADO';
  await guardarPedidoBot(pedido);
  const saldo = pedido.formaPago === 'contraentrega' && pedido.saldo > 0
    ? `\nRecuerda que el saldo de *${formatCOP(pedido.saldo)}* se paga al ${pedido.entrega === 'tienda' ? 'recoger' : 'recibir'}.`
    : '';
  const cuando = `${fechaBonita(pedido.fecha)}, ${pedido.hora}`;
  const { config } = await catalogo();
  const lugar = pedido.entrega === 'tienda' ? ` para recoger en nuestra tienda (${direccionTienda(config)})` : '';
  await enviarTexto(pedido.telefono, `${sinPago ? '*¡Tu pedido fue confirmado!* 🎉' : '*¡Pago verificado!* 🎉'}\n\nTu pedido *${pedido.codigo}* quedó agendado${lugar} para el *${cuando}*.${saldo}\n\n¡Gracias por elegir Territorio Saludable! 🌱`);
  const produccion = await avisarProduccion(pedido);
  const calendario = await agendarEnCalendario(pedido);
  const detalle = `\n\n📅 ${fechaBonita(pedido.fecha)}, ${pedido.hora} · ${etiquetaEntrega(pedido)}\n*Productos:*\n${(pedido.carrito || []).map(i => `• ${nombreItem(i)}`).join('\n')}` +
    (pedido.mensajeTarjeta ? `\n💌 Tarjeta: ${pedido.mensajeTarjeta}` : '') + (pedido.notas ? `\n📝 Notas: ${pedido.notas}` : '');
  await responder(`✅ Pedido ${pedido.codigo} aprobado.${detalle}\n\nCliente: notificado${produccion === 'sin número de producción' ? '' : `\nProducción: ${produccion}`}\nCalendario: ${calendario}`);
  const s = await leer(claveSesion(pedido.telefono));
  if (s && s.codigo === pedido.codigo) await borrar(claveSesion(pedido.telefono));
  return true;
}

async function fijarDomicilio(codigo, valor, responder) {
  const pedido = await leer(`wa:pedido:${codigo}`);
  if (!pedido) { await responder('⚠️ No encontré ese pedido. Escribe por ejemplo: *Domicilio TS-1234 12000*'); return true; }
  if (!valor) { await responder('⚠️ Escribe el valor en números, por ejemplo: *Domicilio ' + codigo + ' 12000*'); return true; }
  pedido.domicilio = valor;
  pedido.domicilioPorConfirmar = false;
  pedido.total = (Number(pedido.subtotal) || 0) + valor;
  calcularPago(pedido, pedido.carrito || []);
  const s = await leer(claveSesion(pedido.telefono));
  const sesion = s && s.codigo === codigo ? s : null;
  await enviarTexto(pedido.telefono, `El domicilio de tu pedido *${codigo}* tiene un valor de *${formatCOP(valor)}*. Total del pedido: *${formatCOP(pedido.total)}*.`);
  await siguientePasoPago(pedido.telefono, pedido, sesion, null);
  if (sesion) await guardar(claveSesion(pedido.telefono), sesion);
  await responder(`✅ Domicilio de ${codigo}: ${formatCOP(valor)}. Total ${formatCOP(pedido.total)} enviado al cliente.${pedido.estado === 'POR_CONFIRMAR' ? `\n\nEs contra entrega: para confirmarlo responde *Aprobar ${codigo}*` : ''}`);
  return true;
}

// ---------------------------------------------------------------------------
// Conversación
// ---------------------------------------------------------------------------

async function responderInmediata(tel, productos) {
  const hoyIso = aISO(hoyColombia(0));
  const lista = productos.filter(p => p.available !== false && diasAnticipacion(p) === 0).map(p => `• ${p.name}`);
  let aviso = '';
  if (esDiaSinEntregas(hoyIso)) aviso = '\n\n_Hoy no hacemos entregas (domingo o festivo). Puedes programar tu pedido para el siguiente día hábil._';
  else if (despuesDeDescanso(hoyIso) && ahoraColombia().getHours() < HORA_INICIO_TRAS_DESCANSO) aviso = `\n\n_Hoy ${nombreDia(hoyIso)} entregamos a partir de las 2:00 p. m._`;
  const listado = lista.length && lista.length <= 25 ? `\n\n${lista.join('\n')}` : '';
  return enviarTexto(tel, `⚡ *¿Qué hay para ya?*\n\nEstos productos te los podemos entregar hoy mismo, en aproximadamente 30 minutos:${listado}\n\nMira las fotos y precios aquí:\n${BASE_URL}/#inmediata${aviso}\n\n${COMO_PEDIR}`);
}

async function manejarMensaje(msg) {
  const tel = msg.from;
  const tipo = msg.type;
  const texto = (msg.text?.body || msg.interactive?.button_reply?.title || '').trim();
  const t = normalizar(texto);

  // Comandos de Camila: "Aprobar TS-1234" o "Domicilio TS-1234 12000".
  // (Un cliente que escribe "Domicilio" en sus datos no es un comando, aunque sea un número del equipo.)
  if (tipo === 'text' && /^\s*(aprob[a-z]*\b|domicilio\s*ts\s*-?\s*\d)/i.test(texto) && (await aprobadores()).includes(tel) && await manejarAdmin(texto, tel)) return;

  const s = (await leer(claveSesion(tel))) || sesionNueva();
  const guardarSesion = () => guardar(claveSesion(tel), s);
  const { productos, config } = await catalogo();
  const esImagen = tipo === 'image' || tipo === 'document';

  // --- Bot dormido: después de un pedido o de pedir asesor, atiende una persona ---
  let dormido = await leer(claveDormido(tel));
  // Pedir desde la página despierta al bot (es un pedido nuevo)
  if (dormido && /quiero pedir:/i.test(texto)) { await borrar(claveDormido(tel)); dormido = null; if (['ESPERA_VERIFICACION'].includes(s.paso)) Object.assign(s, sesionNueva()); }
  if (dormido) {
    if (['nuevo pedido', 'menu', 'inicio', '0', 'otro pedido', 'hacer otro pedido'].includes(t)) {
      await borrar(claveDormido(tel));
      Object.assign(s, sesionNueva());
      await guardarSesion();
      return enviarTexto(tel, menuPrincipal(config));
    }
    const comprobantePendiente = esImagen && ['ESPERA_PAGO', 'ESPERA_VERIFICACION'].includes(s.paso);
    if (!comprobantePendiente) {
      const contenido = texto || (esImagen ? '[envió una imagen o archivo]' : tipo === 'audio' ? '[envió un audio]' : `[${tipo}]`);
      await avisarAdmin(`💬 *Mensaje de cliente* +${tel}${dormido.codigo ? ` (pedido ${dormido.codigo})` : ''}:\n\n${contenido}\n\n_Escríbele a ese número para responderle._`);
      if (!dormido.avisado) {
        dormido.avisado = true;
        await guardar(claveDormido(tel), dormido, HORAS_DORMIDO * 3600);
        await enviarTexto(tel, 'Recibimos tu mensaje 🙌 En breve una persona de nuestro equipo te responde por aquí.\n\n_Si quieres hacer un nuevo pedido, escribe *nuevo pedido*._');
      }
      return;
    }
  }

  // --- Comandos que funcionan en cualquier momento ---
  if (['0', 'menu', 'inicio', 'cancelar', 'nuevo pedido'].includes(t)) {
    if (t === 'cancelar' && s.carrito.length) await enviarTexto(tel, 'Pedido cancelado.');
    Object.assign(s, sesionNueva());
    await guardarSesion();
    return enviarTexto(tel, menuPrincipal(config));
  }
  if (t === 'asesor' || (t === opcionesMenu(config).asesor && s.paso === 'MENU')) {
    await enviarTexto(tel, '¡Listo! Una persona de nuestro equipo te responderá en breve por aquí. 👩‍🍳');
    await avisarAdmin(`🚨 *Solicitud de asesor*\nCliente: +${tel}\nEscríbele a ese número para atenderlo.`);
    await dormir(tel, s.codigo, 'asesor');
    return;
  }

  // --- Pedido desde el botón "Pedir" de la página ---
  const web = texto.match(/quiero pedir:\s*(.+?)(?:\s*\(([^)]*)\))?\s*(?:-\s*\$.*)?$/i);
  if (web && !['ESPERA_PAGO', 'ESPERA_VERIFICACION', 'ESPERA_DOMICILIO'].includes(s.paso)) {
    if (['DATOS', 'CONFIRMAR'].includes(s.paso)) s.paso = 'AGREGAR_MAS';
    const nombreWeb = normalizar(web[1]);
    const producto = productos.find(p => normalizar(p.name) === nombreWeb) || candidatosProducto(web[1], productos)[0];
    if (producto) {
      await procesarProducto(tel, s, producto, web[2] || '');
    } else {
      await enviarTexto(tel, `No encontramos *${web[1]}* en el catálogo actual. Una persona del equipo te ayudará.`);
      await avisarAdmin(`⚠️ Cliente +${tel} quiso pedir "${web[1]}" pero no está en el catálogo.`);
    }
    return guardarSesion();
  }

  // --- Comprobante de pago ---
  if (esImagen && s.paso === 'ESPERA_DOMICILIO') {
    return enviarTexto(tel, `Aún no te hemos enviado el valor del domicilio de tu pedido ${s.codigo}. Espera el total antes de pagar; en unos minutos te lo enviamos. 🙏`);
  }
  if (esImagen) {
    if (s.paso === 'ESPERA_PAGO' || s.paso === 'ESPERA_VERIFICACION') {
      const lectura = await leerComprobante(msg.image?.id || msg.document?.id);
      const aPagar = Number(s.datos.aPagar) || Number(s.datos.total) || 0;
      if (lectura && lectura.esComprobante === false) {
        return enviarTexto(tel, `Esa imagen no parece un comprobante de pago 🧾 Envíanos la captura de la transferencia por *${formatCOP(aPagar)}*.`);
      }
      s.paso = 'ESPERA_VERIFICACION';
      await guardarSesion();
      const pedido = await leer(`wa:pedido:${s.codigo}`);
      const monto = Number(lectura?.monto) || 0;
      if (pedido) {
        pedido.estado = 'POR_VERIFICAR';
        if (monto) pedido.montoLeido = monto;
        // Pagó todo aunque eligió contra entrega con anticipo
        if (pedido.formaPago === 'contraentrega' && pedido.anticipo && monto >= pedido.total - 100) pedido.saldo = 0;
        await guardarPedidoBot(pedido);
      }
      await guardar('wa:ultimo_por_verificar', s.codigo);
      await enviarTexto(tel, '¡Gracias! 🧾 Recibimos tu comprobante. Vamos a verificar el pago y en breve te confirmamos tu pedido.');
      const lineaMonto = monto ? `\n🔍 Monto leído: ${formatCOP(monto)}${monto < aPagar - 100 ? ' ⚠️ *menor al esperado*' : ''}` : '';
      const d = pedido || s.datos;
      await avisarAdmin(`🧾 *Comprobante recibido — ${s.codigo}*\n👤 ${s.datos.nombre} (+${tel})\n💰 Debe pagar ahora: ${formatCOP(aPagar)} · ${lineaPagoEquipo(d)}${lineaMonto}\n📅 ${fechaBonita(s.datos.fecha)}, ${s.datos.hora} · ${etiquetaEntrega(s.datos)}\n\nCuando veas el dinero en la cuenta, responde:\n*Aprobar ${s.codigo}*`);
      await dormir(tel, s.codigo, 'pedido');
      return;
    }
    return enviarTexto(tel, 'Recibimos tu imagen 📷 Si quieres hacer un pedido, escribe *0* para ver el menú.');
  }

  // --- Paso a paso ---
  switch (s.paso) {
    case 'MENU': {
      const op = opcionesMenu(config);
      const seccion = seccionPorNumero(config, t);
      if (seccion) {
        const nota = seccion.nota ? `\n\n${seccion.nota}` : '';
        return enviarTexto(tel, `${seccion.titulo}\n\nMíralos aquí:\n${BASE_URL}/#${seccion.ancla}${nota}\n\n${COMO_PEDIR}`);
      }
      if (t === op.catalogo) return enviarTexto(tel, `*Catálogo completo de Territorio Saludable*\n\n${BASE_URL}\n\n${COMO_PEDIR}`);
      if (t === op.inmediata || PIDE_INMEDIATA.test(t)) return responderInmediata(tel, productos);
      if (!t) return enviarTexto(tel, menuPrincipal(config));

      const candidatos = candidatosProducto(texto, productos);
      if (!candidatos.length && ES_SALUDO.test(t)) return enviarTexto(tel, menuPrincipal(config));
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
      return enviarTexto(tel, `No encontramos ese producto 🤔 Escríbelo como aparece en el catálogo, o elige una opción del menú.\n\n${menuPrincipal(config)}`);
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
      if (!producto) { Object.assign(s, sesionNueva()); await guardarSesion(); return enviarTexto(tel, menuPrincipal(config)); }
      const idx = parseInt(t, 10) - 1;
      const tamano = (/^\d+$/.test(t) && producto.sizes[idx]) || buscarTamano(texto, producto);
      if (!tamano) return preguntarTamano(tel, s, producto);
      await pasoSabor(tel, s, producto, tamano, texto);
      return guardarSesion();
    }

    case 'ELEGIR_SABOR': {
      const producto = productos.find(p => p.id === s.productoId);
      if (!producto) { Object.assign(s, sesionNueva()); await guardarSesion(); return enviarTexto(tel, menuPrincipal(config)); }
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
        return enviarTexto(tel, `¡Súper! 🙌 Escríbenos el otro producto con su tamaño, o elígelo en la página:\n${BASE_URL}`);
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
        return enviarTexto(tel, `¡Hola! 👋 Sigamos con tu pedido. Copia este mensaje, complétalo y envíalo:\n\n${plantillaDatos(s)}\n\n_Escribe *cancelar* si quieres empezar de nuevo._`);
      }
      await procesarDatos(tel, s, texto);
      return guardarSesion();

    case 'CONFIRMAR': {
      const r = respuestaSiNo(msg, texto);
      if (r === 'si') {
        s.codigo = codigoPedido();
        const resumenAdmin = resumenEquipo(tel, s.datos, s.carrito);
        const pedido = { codigo: s.codigo, telefono: tel, creado: new Date().toISOString(), carrito: s.carrito, ...s.datos };
        if (s.datos.domicilioPorConfirmar) {
          s.paso = 'ESPERA_DOMICILIO';
          pedido.estado = 'ESPERA_DOMICILIO';
          await guardarPedidoBot(pedido);
          await guardarSesion();
          await enviarTexto(tel, `*¡Pedido ${s.codigo} recibido!* 🎉\n\nEn unos minutos te enviamos el *valor del domicilio* a tu sector${s.datos.aPagar || s.datos.formaPago === 'transferencia' ? ' y los datos de pago' : ''}.`);
          await avisarAdmin(`🛵 *Pedido ${s.codigo}: falta el valor del domicilio*\n${resumenAdmin}\n💰 Productos: ${formatCOP(s.datos.subtotal)} · Pago: ${s.datos.formaPago === 'transferencia' ? 'transferencia' : 'contra entrega'}\n\nResponde con el valor total del domicilio${s.datos.recargoTortas ? ` (sume ${formatCOP(s.datos.recargoTortas)} de recargo por torta)` : ''}, así:\n*Domicilio ${s.codigo} 12000*`);
          return;
        }
        await siguientePasoPago(tel, pedido, s, resumenAdmin);
        return guardarSesion();
      }
      if (r === 'no') {
        await enviarTexto(tel, 'Sin problema, volvamos a llenar los datos ✍️\n_(Si quieres cambiar los productos, escribe *cancelar* y empezamos de nuevo.)_');
        await pedirDatosEntrega(tel, s);
        return guardarSesion();
      }
      return enviarBotones(tel, '¿Confirmas tu pedido?', [{ id: 'confirmar', title: 'Sí, confirmar' }, { id: 'corregir', title: 'Corregir datos' }]);
    }

    case 'ESPERA_DOMICILIO':
      return enviarTexto(tel, `Estamos calculando el *valor del domicilio* de tu pedido ${s.codigo} 🛵 En unos minutos te lo enviamos.\n\n_Escribe *cancelar* si quieres empezar otro pedido._`);

    case 'ESPERA_PAGO':
      return enviarTexto(tel, `Estamos esperando la *foto del comprobante* de tu pedido ${s.codigo} por ${formatCOP(s.datos.aPagar || s.datos.total)}.\n\n• Si tienes una duda, escribe *asesor*.\n• Para cancelarlo y empezar otro pedido, escribe *cancelar*.`);

    case 'ESPERA_VERIFICACION':
      return enviarTexto(tel, `Ya recibimos tu comprobante del pedido ${s.codigo} ✅ Estamos verificando el pago y te confirmamos muy pronto.`);

    default:
      Object.assign(s, sesionNueva());
      await guardarSesion();
      return enviarTexto(tel, menuPrincipal(config));
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
        await enviarTexto(msg.from, 'Uy, tuvimos un problema técnico 🙏 Escribe *asesor* y una persona te ayuda.');
      }
    }
  } catch (e) {
    console.error('Error en webhook:', e);
  }
  // Siempre 200 para que Meta no reintente.
  return Response.json({ status: 'ok' });
}
