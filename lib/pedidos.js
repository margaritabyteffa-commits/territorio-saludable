// Pedidos: los que crea el bot (en Redis y en Supabase 'pedidos_whatsapp') y los
// que se registran a mano en el panel (Supabase 'pedidos_panel').
import { leerAjuste, guardarAjuste, supabaseConfigurado } from './servidor';
import { guardar } from './sesiones';

export const formatCOP = (n) => '$ ' + Math.round(Number(n || 0)).toLocaleString('es-CO');

export const nombreItem = (i) => {
  const extra = [i.porcion, i.sabor ? `sabor ${i.sabor}` : null].filter(Boolean).join(', ');
  return extra ? `${i.nombre} (${extra})` : i.nombre;
};

export async function guardarPedidoBot(pedido) {
  await guardar(`wa:pedido:${pedido.codigo}`, pedido, 60 * 60 * 24 * 60);
  if (!supabaseConfigurado()) return;
  try {
    const lista = (await leerAjuste('pedidos_whatsapp')) || [];
    const sinEste = lista.filter(p => p.codigo !== pedido.codigo);
    await guardarAjuste('pedidos_whatsapp', [pedido, ...sinEste].slice(0, 2000));
  } catch (e) {
    console.error('No se pudo guardar el pedido en Supabase:', e);
  }
}

export const ETIQUETA_ESTADO = {
  ESPERA_DOMICILIO: 'Esperando valor del domicilio',
  ESPERA_PAGO: 'Esperando pago',
  POR_VERIFICAR: 'Comprobante por verificar',
  POR_CONFIRMAR: 'Contra entrega por confirmar',
  APROBADO: 'Confirmado'
};

// Texto de pago de un pedido del bot: "Pagado", "Contra entrega: cobrar $X"…
export function textoPago(p) {
  const saldo = Number(p.saldo) || 0;
  if (p.estado !== 'APROBADO') return ETIQUETA_ESTADO[p.estado] || p.estado || '';
  if (p.formaPago === 'contraentrega' && saldo > 0) return `Contra entrega: cobrar ${formatCOP(saldo)}`;
  return 'Pagado';
}
