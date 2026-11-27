// Envío de mensajes por la API de WhatsApp Cloud (Meta).
import { leer, guardar } from './sesiones';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const GRAPH = 'https://graph.facebook.com/v21.0';
export const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP_PHONE || '').replace(/\D/g, '');

export async function enviar(para, contenido) {
  try {
    const res = await fetch(`${GRAPH}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: para, ...contenido })
    });
    if (!res.ok) {
      const detalle = await res.text();
      console.error('WhatsApp respondió', res.status, detalle);
      // Se guardan los últimos errores para verlos en el panel
      try {
        const lista = (await leer('wa:errores_envio')) || [];
        lista.unshift({ para, estado: res.status, detalle: detalle.slice(0, 300), cuando: new Date().toISOString() });
        await guardar('wa:errores_envio', lista.slice(0, 10), 60 * 60 * 24 * 7);
      } catch (e) { /* sin memoria */ }
    }
    return res.ok;
  } catch (e) {
    console.error('Error enviando WhatsApp:', e);
    return false;
  }
}

// WhatsApp corta los mensajes de más de 4096 letras: se envían en partes
export async function enviarTexto(para, texto) {
  const partes = [];
  let resto = String(texto || '');
  while (resto.length > 3800) {
    let corte = resto.lastIndexOf('\n', 3800);
    if (corte < 1000) corte = 3800;
    partes.push(resto.slice(0, corte));
    resto = resto.slice(corte).replace(/^\n+/, '');
  }
  partes.push(resto);
  let ok = true;
  for (const p of partes) ok = (await enviar(para, { type: 'text', text: { body: p, preview_url: false } })) && ok;
  return ok;
}

// Botones (máximo 3, títulos de máximo 20 letras)
export const enviarBotones = (para, texto, botones) => enviar(para, {
  type: 'interactive',
  interactive: {
    type: 'button',
    body: { text: texto },
    action: { buttons: botones.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title.slice(0, 20) } })) }
  }
});

export async function descargarMedia(mediaId) {
  const meta = await (await fetch(`${GRAPH}/${mediaId}`, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } })).json();
  if (!meta.url) return null;
  const img = await fetch(meta.url, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
  return { base64: Buffer.from(await img.arrayBuffer()).toString('base64'), mime: img.headers.get('content-type') || 'image/jpeg' };
}

// Números en formato WhatsApp (57 + celular)
export function listaNumeros(texto) {
  return String(texto || '').split(/[,;\n]/)
    .map(x => x.replace(/\D/g, ''))
    .map(d => (d.length === 10 && d.startsWith('3') ? '57' + d : d))
    .filter(d => d.length >= 11);
}

export function numerosAprobadores(privado) {
  const lista = listaNumeros(privado && privado.aprobadores);
  if (ADMIN_PHONE && !lista.includes(ADMIN_PHONE)) lista.push(ADMIN_PHONE);
  return lista;
}

// Últimos números que le escribieron al bot (para comprobar el número exacto de Camila)
export async function registrarRemitente(numero) {
  try {
    const lista = ((await leer('wa:remitentes')) || []).filter(x => x.numero !== numero);
    lista.unshift({ numero, cuando: new Date().toISOString() });
    await guardar('wa:remitentes', lista.slice(0, 15), 60 * 60 * 24 * 7);
  } catch (e) { /* sin memoria */ }
}
