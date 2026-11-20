import { cambiarClave, rolDesdeRequest, noAutorizado, errorServidor } from '../../../../lib/servidor';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const { rol, nueva } = await request.json();
    if (!['admin', 'panadero'].includes(rol)) {
      return Response.json({ error: 'Rol inválido' }, { status: 400 });
    }
    const clave = String(nueva || '').trim();
    if (clave.length < 6) {
      return Response.json({ error: 'La clave debe tener al menos 6 caracteres.' }, { status: 400 });
    }
    await cambiarClave(rol, clave);
    return Response.json({ ok: true });
  } catch (e) {
    return errorServidor(e);
  }
}
