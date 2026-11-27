// Pestaña "Pedidos" del panel: pedidos del bot + órdenes registradas a mano, guardados en la base de datos.
// Lo que se cambia desde el panel (estado de cocina, notas) va en 'pedidos_panel' para no pisar al bot.
import { leerAjuste, guardarAjuste, rolDesdeRequest, noAutorizado, errorServidor } from '../../../../lib/servidor';
import { crearEventoCalendario } from '../../../../lib/calendario';
import { formatCOP } from '../../../../lib/pedidos';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ESTADOS = ['Pendiente', 'En Cocina', 'Listo Despacho', 'Entregado', 'Cancelado'];
const texto = (v, max = 300) => String(v ?? '').trim().slice(0, max);
const numero = (v) => Math.max(0, Math.round(Number(v) || 0));

function limpiarOrden(o) {
  return {
    id: texto(o.id, 40) || 'ord-' + Date.now(),
    code: texto(o.code, 20),
    clientName: texto(o.clientName, 80),
    clientPhone: texto(o.clientPhone, 30),
    address: texto(o.address, 200),
    zone: texto(o.zone, 80),
    deliveryDate: /^\d{4}-\d{2}-\d{2}$/.test(o.deliveryDate || '') ? o.deliveryDate : '',
    deliveryTime: texto(o.deliveryTime, 40),
    items: (Array.isArray(o.items) ? o.items : []).slice(0, 30).map(i => ({ productName: texto(i.productName, 120), portion: texto(i.portion, 60) || undefined, quantity: numero(i.quantity) || 1, price: numero(i.price) })),
    total: numero(o.total),
    status: ESTADOS.includes(o.status) ? o.status : 'Pendiente',
    paymentMethod: texto(o.paymentMethod, 60),
    notes: texto(o.notes, 500),
    creado: texto(o.creado, 40) || new Date().toISOString()
  };
}

function limpiarPanel(p) {
  const panel = p && typeof p === 'object' ? p : {};
  const estados = {};
  for (const [codigo, e] of Object.entries(panel.estados || {}).slice(0, 3000)) {
    if (!e || typeof e !== 'object') continue;
    estados[texto(codigo, 20)] = { status: ESTADOS.includes(e.status) ? e.status : undefined, notes: e.notes === undefined ? undefined : texto(e.notes, 500) };
  }
  return { manuales: (Array.isArray(panel.manuales) ? panel.manuales : []).slice(0, 3000).map(limpiarOrden), estados };
}

export async function GET(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const [bot, panel] = await Promise.all([leerAjuste('pedidos_whatsapp'), leerAjuste('pedidos_panel')]);
    return Response.json({ bot: Array.isArray(bot) ? bot : [], panel: limpiarPanel(panel) });
  } catch (e) {
    return errorServidor(e);
  }
}

export async function PUT(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const { panel } = await request.json();
    const limpio = limpiarPanel(panel);
    await guardarAjuste('pedidos_panel', limpio);
    return Response.json({ ok: true });
  } catch (e) {
    return errorServidor(e);
  }
}

// Crea en Google Calendar el evento de una orden registrada a mano
export async function POST(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const { orden } = await request.json();
    const o = limpiarOrden(orden || {});
    if (!o.deliveryDate) return Response.json({ error: 'La orden no tiene fecha' }, { status: 400 });
    const privado = (await leerAjuste('privado')) || {};
    const resultado = await crearEventoCalendario({
      titulo: `🍰 ${o.code} · ${o.items[0] ? o.items[0].productName : 'Pedido'}${o.items.length > 1 ? ` + ${o.items.length - 1} más` : ''}`,
      descripcion: [
        `Pedido ${o.code} (registrado en el panel)`, '',
        'Productos:', ...o.items.map(i => `• ${i.quantity > 1 ? i.quantity + ' × ' : ''}${i.productName}${i.portion ? ` (${i.portion})` : ''}`),
        o.notes ? `\nNotas: ${o.notes}` : '', '',
        `Hora acordada: ${o.deliveryTime}`,
        `Cliente: ${o.clientName} · ${o.clientPhone}`,
        `Dirección: ${o.address}${o.zone ? ` (${o.zone})` : ''}`,
        `Total: ${formatCOP(o.total)} · Pago: ${o.paymentMethod}`
      ].filter(x => x !== '').join('\n'),
      fecha: o.deliveryDate, hora: o.deliveryTime, ubicacion: o.address
    }, privado);
    return Response.json({ ok: resultado === 'evento creado', resultado });
  } catch (e) {
    return errorServidor(e);
  }
}
