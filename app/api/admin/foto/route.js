import { subirFoto, rolDesdeRequest, noAutorizado, errorServidor } from '../../../../lib/servidor';

export const dynamic = 'force-dynamic';

const TIPOS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAXIMO_BYTES = 4 * 1024 * 1024; // 4 MB (la foto ya llega comprimida desde el navegador)

export async function POST(request) {
  if (rolDesdeRequest(request) !== 'admin') return noAutorizado();
  try {
    const tipo = (request.headers.get('content-type') || '').split(';')[0].trim();
    const extension = TIPOS[tipo];
    if (!extension) {
      return Response.json({ error: 'Formato no permitido. Usa una foto JPG, PNG o WEBP.' }, { status: 400 });
    }
    const bytes = Buffer.from(await request.arrayBuffer());
    if (bytes.length === 0) return Response.json({ error: 'La foto llegó vacía.' }, { status: 400 });
    if (bytes.length > MAXIMO_BYTES) {
      return Response.json({ error: 'La foto es demasiado pesada.' }, { status: 400 });
    }
    const nombre = `producto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extension}`;
    const url = await subirFoto(nombre, bytes, tipo);
    return Response.json({ url });
  } catch (e) {
    return errorServidor(e);
  }
}
