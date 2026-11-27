// Resumen diario (2 pm): todo lo que hay para el siguiente día hábil.
import { leerAjuste } from './servidor';
import { fechaBonita, siguienteDiaHabil, aISO, hoyColombia, horaYMinutos, esInmediato } from './fechas';
import { formatCOP, nombreItem, textoPago, ETIQUETA_ESTADO } from './pedidos';

const ordenHora = (h) => { const hm = horaYMinutos(h || ''); return hm ? hm.h * 60 + hm.m : (esInmediato(h || '') ? 0 : 9999); };

export async function armarResumen(fecha = siguienteDiaHabil(aISO(hoyColombia(0)))) {
  const [bot, panel, domicilios, config] = await Promise.all([
    leerAjuste('pedidos_whatsapp'), leerAjuste('pedidos_panel'), leerAjuste('domicilios'), leerAjuste('config')
  ]);
  const delDia = (Array.isArray(bot) ? bot : []).filter(p => p.fecha === fecha);
  const asignaciones = (domicilios && domicilios.asignaciones) || {};
  const cancelado = (codigo) => asignaciones[codigo] && asignaciones[codigo].cancelado;
  const confirmados = delDia.filter(p => p.estado === 'APROBADO' && !cancelado(p.codigo) && !(panel?.estados?.[p.codigo]?.status === 'Cancelado'));
  const pendientes = delDia.filter(p => p.estado !== 'APROBADO' && !cancelado(p.codigo));
  const manuales = (panel && Array.isArray(panel.manuales) ? panel.manuales : []).filter(o => o.deliveryDate === fecha && o.status !== 'Cancelado');
  const domManuales = (domicilios && Array.isArray(domicilios.manuales) ? domicilios.manuales : []).filter(m => m.fecha === fecha && !cancelado(m.codigo));

  // Totales de productos a preparar
  const conteo = new Map();
  const sumar = (nombre, cantidad) => conteo.set(nombre, (conteo.get(nombre) || 0) + (Number(cantidad) || 1));
  confirmados.forEach(p => (p.carrito || []).forEach(i => sumar(nombreItem(i), 1)));
  manuales.forEach(o => (o.items || []).forEach(i => sumar(i.portion ? `${i.productName} (${i.portion})` : i.productName, i.quantity)));
  const productos = [...conteo.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));

  const L = [];
  L.push(`*Recordatorio pedidos — ${fechaBonita(fecha)}*`);
  L.push('');
  if (!confirmados.length && !manuales.length && !domManuales.length && !pendientes.length) {
    L.push('No hay pedidos registrados para ese día.');
    return { fecha, texto: L.join('\n'), cantidad: 0 };
  }
  L.push(`*PRODUCTOS A PREPARAR* (${confirmados.length + manuales.length} pedido${confirmados.length + manuales.length === 1 ? '' : 's'})`);
  if (productos.length) productos.forEach(([n, c]) => L.push(`• ${c} × ${n}`));
  else L.push('• (sin productos confirmados)');

  const lista = [
    ...confirmados.map(p => ({ hora: p.hora, bloque: [
      `*${p.codigo}* · ${p.hora} · ${p.entrega === 'tienda' ? 'Recoge en tienda' : 'Domicilio'}`,
      ...(p.carrito || []).map(i => `  – ${nombreItem(i)}`),
      p.mensajeTarjeta ? `  Tarjeta: ${p.mensajeTarjeta}` : null,
      (panel?.estados?.[p.codigo]?.notes || p.notas) ? `  Notas: ${panel?.estados?.[p.codigo]?.notes || p.notas}` : null,
      `  ${p.recibeNombre && p.recibeNombre !== p.nombre ? `Recibe: ${p.recibeNombre} (pide ${p.nombre})` : `Nombre: ${p.nombre}`} · ${p.recibeTelefono || ''}`,
      p.entrega === 'tienda' ? null : `  Dirección: ${p.direccion}${p.sectorNombre ? ` (${p.sectorNombre})` : ''}`,
      `  Pago: ${textoPago(p)}`
    ] })),
    ...manuales.map(o => ({ hora: o.deliveryTime, bloque: [
      `*${o.code}* · ${o.deliveryTime || ''} · registrado en el panel`,
      ...(o.items || []).map(i => `  – ${i.quantity > 1 ? i.quantity + ' × ' : ''}${i.productName}${i.portion ? ` (${i.portion})` : ''}`),
      o.notes ? `  Notas: ${o.notes}` : null,
      `  Cliente: ${o.clientName || ''} · ${o.clientPhone || ''}`,
      o.address ? `  Dirección: ${o.address}${o.zone ? ` (${o.zone})` : ''}` : null,
      `  Pago: ${o.paymentMethod || ''} · Total ${formatCOP(o.total)}`
    ] }))
  ].sort((a, b) => ordenHora(a.hora) - ordenHora(b.hora));
  L.push('');
  L.push('*PEDIDOS*');
  lista.forEach(x => { L.push(''); x.bloque.filter(Boolean).forEach(l => L.push(l)); });

  if (domManuales.length) {
    L.push('');
    L.push('*OTROS DOMICILIOS* (agregados en el panel)');
    domManuales.sort((a, b) => ordenHora(a.hora) - ordenHora(b.hora)).forEach(m => {
      L.push(`• ${m.hora || ''} · ${m.recibeNombre} · ${m.recibeTelefono || ''} · ${m.direccion} · ${m.pago === 'contraentrega' ? `Contra entrega: cobrar ${formatCOP(m.cobrar)}` : 'Pagado'}`);
    });
  }
  if (pendientes.length) {
    L.push('');
    L.push('*PENDIENTES* (todavía no confirmados)');
    pendientes.forEach(p => L.push(`• ${p.codigo} · ${p.hora} · ${p.nombre} · ${(p.carrito || []).map(nombreItem).join(', ')} · ${ETIQUETA_ESTADO[p.estado] || p.estado}`));
  }

  return { fecha, texto: L.join('\n'), cantidad: confirmados.length + manuales.length };
}
