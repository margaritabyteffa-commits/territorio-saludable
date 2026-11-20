import { verificarClave, crearToken, supabaseConfigurado } from '../../../../lib/servidor';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!supabaseConfigurado()) {
    return Response.json({ error: 'Falta conectar la base de datos (Supabase) en Vercel.' }, { status: 500 });
  }
  try {
    const { clave } = await request.json();
    const rol = clave ? await verificarClave(String(clave).trim()) : null;
    if (!rol) return Response.json({ error: 'Clave incorrecta' }, { status: 401 });
    return Response.json({ rol, token: crearToken(rol) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'No se pudo verificar la clave.' }, { status: 500 });
  }
}
