// "Memoria" del bot de WhatsApp: guarda en qué paso va cada conversación.
// Usa la base Redis (Upstash) que ya está conectada al proyecto en Vercel
// (variables KV_REST_API_URL y KV_REST_API_TOKEN).
// Si no estuviera configurada, usa una memoria temporal (solo sirve para pruebas).

const KV_URL = (process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';
const memoriaLocal = new Map();

const DOS_DIAS = 60 * 60 * 24 * 2;

async function redis(comando) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comando),
    cache: 'no-store'
  });
  const data = await res.json();
  if (data.error) throw new Error('Redis: ' + data.error);
  return data.result;
}

export function memoriaPersistente() {
  return Boolean(KV_URL && KV_TOKEN);
}

export async function leer(clave) {
  if (!memoriaPersistente()) return memoriaLocal.get(clave) ?? null;
  const valor = await redis(['GET', clave]);
  return valor ? JSON.parse(valor) : null;
}

export async function guardar(clave, valor, segundos = DOS_DIAS) {
  if (!memoriaPersistente()) { memoriaLocal.set(clave, valor); return; }
  await redis(['SET', clave, JSON.stringify(valor), 'EX', String(segundos)]);
}

export async function borrar(clave) {
  if (!memoriaPersistente()) { memoriaLocal.delete(clave); return; }
  await redis(['DEL', clave]);
}

// Meta a veces envía el mismo mensaje dos veces. Esto evita responder doble.
// Devuelve true si el mensaje es nuevo.
export async function esMensajeNuevo(idMensaje) {
  if (!idMensaje) return true;
  const clave = `wa:visto:${idMensaje}`;
  if (!memoriaPersistente()) {
    if (memoriaLocal.has(clave)) return false;
    memoriaLocal.set(clave, true);
    return true;
  }
  const r = await redis(['SET', clave, '1', 'NX', 'EX', '86400']);
  return r === 'OK';
}
