import { guardarProductos, rolDesdeRequest, noAutorizado, errorServidor } from '../../../../lib/servidor';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const { productos } = await request.json();
    if (!Array.isArray(productos)) {
      return Response.json({ error: 'Lista de productos inválida' }, { status: 400 });
    }
    await guardarProductos(productos);
    return Response.json({ ok: true });
  } catch (e) {
    return errorServidor(e);
  }
}
