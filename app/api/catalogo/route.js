// Catálogo público: productos, configuración y zonas que ve cualquier visitante.
import { leerProductos, leerAjuste, supabaseConfigurado } from '../../../lib/servidor';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabaseConfigurado()) {
    return Response.json({ productos: null, config: null, zonas: null });
  }
  try {
    const [productos, config, zonas] = await Promise.all([
      leerProductos(),
      leerAjuste('config'),
      leerAjuste('zonas')
    ]);
    return Response.json(
      { productos: productos.length ? productos : null, config, zonas },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error(e);
    return Response.json({ productos: null, config: null, zonas: null });
  }
}
