import { guardarAjuste, rolDesdeRequest, noAutorizado, errorServidor } from '../../../../lib/servidor';

export const dynamic = 'force-dynamic';

// Guarda la configuración general y/o las zonas de cobertura.
export async function PUT(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const { config, zonas } = await request.json();
    if (config && typeof config === 'object') await guardarAjuste('config', config);
    if (Array.isArray(zonas)) await guardarAjuste('zonas', zonas);
    return Response.json({ ok: true });
  } catch (e) {
    return errorServidor(e);
  }
}
