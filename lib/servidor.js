// Funciones del servidor para hablar con Supabase (base de datos + fotos)
// y para manejar las claves del panel de administración.
// Este archivo SOLO se usa en el servidor: las claves nunca llegan al navegador.

import crypto from 'crypto';

const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const BUCKET_FOTOS = 'productos';

export function supabaseConfigurado() {
  return Boolean(SB_URL && SB_KEY);
}

function cabeceras(extra = {}) {
  const h = { apikey: SB_KEY, ...extra };
  // Las llaves antiguas (JWT, empiezan por "eyJ") también van en Authorization.
  if (SB_KEY.startsWith('eyJ')) h.Authorization = `Bearer ${SB_KEY}`;
  return h;
}

async function sb(ruta, opciones = {}) {
  const res = await fetch(`${SB_URL}${ruta}`, {
    ...opciones,
    headers: cabeceras(opciones.headers),
    cache: 'no-store'
  });
  const texto = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${texto.slice(0, 300)}`);
  }
  return texto ? JSON.parse(texto) : null;
}

// ---------- Productos ----------

export async function leerProductos() {
  const filas = await sb('/rest/v1/productos?select=id,datos,orden&order=orden.asc');
  return (filas || []).map(f => ({ ...f.datos, id: f.id }));
}

export async function guardarProductos(lista) {
  const filas = lista.map((p, i) => ({ id: String(p.id), datos: p, orden: i }));
  if (filas.length > 0) {
    await sb('/rest/v1/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(filas)
    });
    const ids = filas.map(f => `"${f.id.replace(/"/g, '')}"`).join(',');
    await sb(`/rest/v1/productos?id=not.in.(${encodeURIComponent(ids)})`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' }
    });
  } else {
    await sb('/rest/v1/productos?id=not.is.null', { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  }
}

// ---------- Ajustes (configuración, zonas, claves) ----------

export async function leerAjuste(clave) {
  const filas = await sb(`/rest/v1/ajustes?select=valor&clave=eq.${encodeURIComponent(clave)}`);
  return filas && filas[0] ? filas[0].valor : null;
}

export async function guardarAjuste(clave, valor) {
  await sb('/rest/v1/ajustes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify([{ clave, valor }])
  });
}

// ---------- Fotos ----------

export async function subirFoto(nombreArchivo, bytes, tipo) {
  await sb(`/storage/v1/object/${BUCKET_FOTOS}/${nombreArchivo}`, {
    method: 'POST',
    headers: { 'Content-Type': tipo, 'x-upsert': 'true', 'cache-control': '31536000' },
    body: bytes
  });
  return `${SB_URL}/storage/v1/object/public/${BUCKET_FOTOS}/${nombreArchivo}`;
}

// ---------- Claves y sesiones del panel ----------

function hashClave(clave, sal = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(clave, sal, 32).toString('hex');
  return `${sal}:${hash}`;
}

function claveCoincide(clave, guardada) {
  if (!guardada || !guardada.includes(':')) return false;
  const [sal, hash] = guardada.split(':');
  const intento = crypto.scryptSync(clave, sal, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(intento, 'hex'), Buffer.from(hash, 'hex'));
}

// Devuelve el rol ('admin' o 'panadero') si la clave es correcta, o null.
export async function verificarClave(clave) {
  const guardadas = (await leerAjuste('claves')) || {};
  const inicialAdmin = process.env.ADMIN_CLAVE_INICIAL;
  const inicialPanadero = process.env.PANADERO_CLAVE_INICIAL;

  if (guardadas.admin ? claveCoincide(clave, guardadas.admin) : (inicialAdmin && clave === inicialAdmin)) return 'admin';
  if (guardadas.panadero ? claveCoincide(clave, guardadas.panadero) : (inicialPanadero && clave === inicialPanadero)) return 'panadero';
  return null;
}

export async function cambiarClave(rol, nueva) {
  const guardadas = (await leerAjuste('claves')) || {};
  guardadas[rol] = hashClave(nueva);
  await guardarAjuste('claves', guardadas);
}

const DURACION_SESION_MS = 12 * 60 * 60 * 1000; // 12 horas

function firmar(texto) {
  return crypto.createHmac('sha256', SB_KEY || 'sin-llave').update(texto).digest('hex');
}

export function crearToken(rol) {
  const base = `${rol}.${Date.now() + DURACION_SESION_MS}`;
  return `${base}.${firmar(base)}`;
}

// Lee el token que manda el navegador y devuelve el rol, o null si no es válido.
export function rolDesdeRequest(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  const [rol, vence, firma] = partes;
  const esperado = firmar(`${rol}.${vence}`);
  if (firma.length !== esperado.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperado))) return null;
  if (Date.now() > Number(vence)) return null;
  return rol;
}

export function noAutorizado() {
  return Response.json({ error: 'Tu sesión venció. Vuelve a ingresar la clave.' }, { status: 401 });
}

export function errorServidor(e) {
  console.error(e);
  const msg = supabaseConfigurado()
    ? 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.'
    : 'Falta conectar la base de datos (Supabase) en Vercel.';
  return Response.json({ error: msg }, { status: 500 });
}
