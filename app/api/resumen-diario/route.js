// Resumen diario de las 2 pm con lo del siguiente día hábil.
// Lo dispara el programador de Vercel (vercel.json) y/o el script de Google (más puntual).
// Se envía una sola vez al día: WhatsApp a quien aprueba pagos y correo a los correos configurados.
import { leerAjuste, rolDesdeRequest, firmaInterna, noAutorizado, errorServidor } from '../../../lib/servidor';
import { esMensajeNuevo } from '../../../lib/sesiones';
import { armarResumen } from '../../../lib/resumen';
import { enviarTexto, numerosAprobadores } from '../../../lib/whatsapp';
import { enviarCorreo } from '../../../lib/calendario';
import { aISO, hoyColombia, ahoraColombia, fechaBonita } from '../../../lib/fechas';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function enviarResumen() {
  const privado = (await leerAjuste('privado')) || {};
  const r = await armarResumen();
  const numeros = numerosAprobadores(privado);
  let whatsapp = 'sin número';
  if (numeros.length) {
    let ok = true;
    for (const n of numeros) ok = (await enviarTexto(n, r.texto)) && ok;
    whatsapp = ok ? 'enviado' : 'no se pudo (debe haber escrito al bot en las últimas 24 h)';
  }
  const correo = await enviarCorreo(privado, privado.correosResumen, `Recordatorio pedidos — ${fechaBonita(r.fecha)}`, r.texto.replace(/\*/g, ''));
  return { ok: true, fecha: r.fecha, pedidos: r.cantidad, whatsapp, correo };
}

export async function GET(request) {
  const url = new URL(request.url);
  const esAdmin = rolDesdeRequest(request) === 'admin';
  try {
    if (esAdmin && url.searchParams.get('ver')) return Response.json(await armarResumen());
    if (esAdmin && url.searchParams.get('enlace')) {
      return Response.json({ enlace: `${url.origin}/api/resumen-diario?firma=${firmaInterna('resumen-diario')}` });
    }
    if (esAdmin && url.searchParams.get('enviar')) return Response.json(await enviarResumen());

    const firmaOk = url.searchParams.get('firma') === firmaInterna('resumen-diario');
    const esCron = /vercel-cron/i.test(request.headers.get('user-agent') || '');
    if (!firmaOk && !esCron) return noAutorizado();
    if (ahoraColombia().getHours() < 13) return Response.json({ ok: false, motivo: 'todavía no son las 2 pm' });
    if (!(await esMensajeNuevo(`resumen-${aISO(hoyColombia(0))}`))) return Response.json({ ok: true, motivo: 'ya se envió hoy' });
    return Response.json(await enviarResumen());
  } catch (e) {
    return errorServidor(e);
  }
}
