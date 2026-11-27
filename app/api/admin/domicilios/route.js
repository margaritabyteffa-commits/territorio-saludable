// Domicilios: lista de entregas (pedidos del bot + domicilios agregados a mano),
// domiciliarios, a quién se le asignó cada entrega y si ya se le pagó.
// Los pedidos del bot se leen de 'pedidos_whatsapp' (los escribe el bot);
// lo que se edita desde el panel va aparte en 'domicilios' para no pisar al bot.
import { leerAjuste, guardarAjuste, rolDesdeRequest, noAutorizado, errorServidor } from '../../../../lib/servidor';

export const dynamic = 'force-dynamic';

const texto = (v, max = 300) => String(v ?? '').trim().slice(0, max);
const numero = (v) => Math.max(0, Math.round(Number(String(v ?? '').replace(/[^\d.-]/g, '')) || 0));
const fechaIso = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '');

function limpiarControl(c) {
  const control = c && typeof c === 'object' ? c : {};
  const repartidores = Array.isArray(control.repartidores)
    ? [...new Set(control.repartidores.map(r => texto(r, 60)).filter(Boolean))].slice(0, 50)
    : [];
  const asignaciones = {};
  if (control.asignaciones && typeof control.asignaciones === 'object') {
    for (const [codigo, a] of Object.entries(control.asignaciones).slice(0, 3000)) {
      if (!a || typeof a !== 'object') continue;
      asignaciones[texto(codigo, 30)] = {
        domiciliario: texto(a.domiciliario, 60),
        pagadoDomiciliario: !!a.pagadoDomiciliario,
        valor: a.valor === '' || a.valor == null ? null : numero(a.valor),
        pago: ['pagado', 'contraentrega'].includes(a.pago) ? a.pago : '',
        entregado: !!a.entregado,
        cancelado: !!a.cancelado,
        notas: texto(a.notas, 300)
      };
    }
  }
  const manuales = Array.isArray(control.manuales)
    ? control.manuales.slice(0, 2000).map(m => ({
        codigo: texto(m.codigo, 30) || 'M-' + Date.now(),
        recibeNombre: texto(m.recibeNombre, 80),
        recibeTelefono: texto(m.recibeTelefono, 30),
        direccion: texto(m.direccion, 200),
        fecha: fechaIso(m.fecha),
        hora: texto(m.hora, 30),
        domicilio: numero(m.domicilio),
        cobrar: numero(m.cobrar),
        pago: m.pago === 'contraentrega' ? 'contraentrega' : 'pagado'
      })).filter(m => m.fecha)
    : [];
  return { repartidores, asignaciones, manuales };
}

export async function GET(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const [pedidos, control] = await Promise.all([leerAjuste('pedidos_whatsapp'), leerAjuste('domicilios')]);
    const lista = (Array.isArray(pedidos) ? pedidos : []).map(p => ({
      codigo: p.codigo,
      estado: p.estado,
      fecha: p.fecha || '',
      hora: p.hora || '',
      cliente: p.nombre || '',
      telefono: p.telefono || '',
      recibeNombre: p.recibeNombre || p.nombre || '',
      recibeTelefono: p.recibeTelefono || p.telefono || '',
      direccion: p.direccion || '',
      sector: p.sectorNombre || '',
      domicilio: Number(p.domicilio) || 0,
      domicilioPorConfirmar: !!p.domicilioPorConfirmar,
      total: Number(p.total) || 0,
      notas: p.notas || ''
    }));
    return Response.json({ pedidos: lista, control: limpiarControl(control) });
  } catch (e) {
    return errorServidor(e);
  }
}

export async function PUT(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const { control } = await request.json();
    const limpio = limpiarControl(control);
    await guardarAjuste('domicilios', limpio);
    return Response.json({ ok: true, control: limpio });
  } catch (e) {
    return errorServidor(e);
  }
}
