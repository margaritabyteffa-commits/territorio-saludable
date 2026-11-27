// Resúmenes diarios de pedidos:
//   7:00 a. m. → pedidos de hoy        (?momento=manana)
//   5:00 p. m. → pedidos del siguiente día hábil (?momento=tarde)
// Los dispara el programador de Vercel (vercel.json) y/o el script de Google (más puntual).
// Cada uno se envía una sola vez al día: WhatsApp a quien aprueba pagos y correo a los correos configurados.
import { leerAjuste, rolDesdeRequest, firmaInterna, noAutorizado, errorServidor } from '../../../lib/servidor';
import { esMensajeNuevo } from '../../../lib/sesiones';
import { armarResumen, fechaDelResumen } from '../../../lib/resumen';
import { enviarTexto, numerosAprobadores } from '../../../lib/whatsapp';
import { enviarCorreo } from '../../../lib/calendario';
import { aISO, hoyColombia, ahoraColombia, fechaBonita, esDiaSinEntregas } from '../../../lib/fechas';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Si no dicen cuál, se deduce por la hora (antes del mediodía = el de la mañana)
const momentoDe = (url) => {
  const m = url.searchParams.get('momento');
  if (m === 'manana' || m === 'tarde') return m;
  return ahoraColombia().getHours() < 12 ? 'manana' : 'tarde';
};

async function enviarResumen(momento) {
  const privado = (await leerAjuste('privado')) || {};
  const fecha = fechaDelResumen(momento);
  const r = await armarResumen(fecha, momento);
  const numeros = numerosAprobadores(privado);
  let whatsapp = 'sin número';
  if (numeros.length) {
    let ok = true;
    for (const n of numeros) ok = (await enviarTexto(n, r.texto)) && ok;
    whatsapp = ok ? 'enviado' : 'no se pudo (debe haber escrito al bot en las últimas 24 h)';
  }
  const asunto = `${momento === 'manana' ? 'Pedidos de hoy' : 'Recordatorio pedidos'} — ${fechaBonita(r.fecha)}`;
  const correo = await enviarCorreo(privado, privado.correosResumen, asunto, r.texto.replace(/\*/g, ''));
  return { ok: true, momento, fecha: r.fecha, pedidos: r.cantidad, whatsapp, correo };
}

export async function GET(request) {
  const url = new URL(request.url);
  const esAdmin = rolDesdeRequest(request) === 'admin';
  const momento = momentoDe(url);
  try {
    if (esAdmin && url.searchParams.get('ver')) return Response.json(await armarResumen(fechaDelResumen(momento), momento));
    if (esAdmin && url.searchParams.get('enlace')) {
      return Response.json({ enlace: `${url.origin}/api/resumen-diario?firma=${firmaInterna('resumen-diario')}` });
    }
    if (esAdmin && url.searchParams.get('enviar')) return Response.json(await enviarResumen(momento));

    const firmaOk = url.searchParams.get('firma') === firmaInterna('resumen-diario');
    const esCron = /vercel-cron/i.test(request.headers.get('user-agent') || '');
    if (!firmaOk && !esCron) return noAutorizado();
    const hora = ahoraColombia().getHours();
    if (momento === 'manana' && (hora < 6 || hora >= 11)) return Response.json({ ok: false, motivo: 'fuera de la hora del resumen de la mañana' });
    if (momento === 'tarde' && hora < 16) return Response.json({ ok: false, motivo: 'todavía no son las 5 pm' });
    const hoy = aISO(hoyColombia(0));
    // Domingos y festivos no se manda el de la mañana (no hay entregas)
    if (momento === 'manana' && esDiaSinEntregas(hoy)) return Response.json({ ok: true, motivo: 'hoy no hay entregas' });
    if (!(await esMensajeNuevo(`resumen-${momento}-${hoy}`))) return Response.json({ ok: true, motivo: 'ya se envió' });
    return Response.json(await enviarResumen(momento));
  } catch (e) {
    return errorServidor(e);
  }
}
