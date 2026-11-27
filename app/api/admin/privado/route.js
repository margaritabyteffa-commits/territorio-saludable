// Ajustes privados (no se muestran en la página pública):
// quién aprueba pagos, quién recibe los avisos de producción y el enlace del calendario.
import { leerAjuste, guardarAjuste, rolDesdeRequest, noAutorizado, errorServidor } from '../../../../lib/servidor';
import { leer } from '../../../../lib/sesiones';

export const dynamic = 'force-dynamic';

const CAMPOS = ['aprobadores', 'produccion', 'calendarioUrl', 'calendarioCorreos', 'recordatorios', 'correosResumen'];

export async function GET(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const [privado, errores, remitentes] = await Promise.all([leerAjuste('privado'), leer('wa:errores_envio'), leer('wa:remitentes')]);
    return Response.json({ privado: privado || {}, errores: errores || [], remitentes: remitentes || [] });
  } catch (e) {
    return errorServidor(e);
  }
}

export async function PUT(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const { privado } = await request.json();
    const limpio = {};
    for (const c of CAMPOS) limpio[c] = String((privado && privado[c]) || '').trim();
    if (limpio.calendarioUrl && !/^https:\/\/script\.google(usercontent)?\.com\//.test(limpio.calendarioUrl)) {
      return Response.json({ error: 'El enlace del calendario debe empezar por https://script.google.com/' }, { status: 400 });
    }
    await guardarAjuste('privado', limpio);
    return Response.json({ ok: true });
  } catch (e) {
    return errorServidor(e);
  }
}
