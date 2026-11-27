// Conexión con el script de Google del correo de la pastelería:
// crea eventos en Google Calendar y envía correos (resumen diario).
import { horaYMinutos, esInmediato, ahoraColombia } from './fechas';

const dos = (n) => String(n).padStart(2, '0');

async function llamarScript(url, datos) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
    redirect: 'follow'
  });
  const txt = await res.text();
  if (!res.ok || !/"ok"\s*:\s*true/.test(txt)) throw new Error(`El script respondió ${res.status}: ${txt.slice(0, 200)}`);
  return txt;
}

// evento: { titulo, descripcion, fecha: 'AAAA-MM-DD', hora: texto libre, ubicacion }
export async function crearEventoCalendario(evento, privado) {
  if (!privado || !privado.calendarioUrl) return 'calendario sin configurar';
  let hm = horaYMinutos(evento.hora || '');
  if (!hm && esInmediato(evento.hora || '')) {
    // Entrega inmediata: se agenda 30 minutos después
    const t = ahoraColombia();
    t.setMinutes(t.getMinutes() + 30);
    hm = { h: t.getHours(), m: t.getMinutes() };
  }
  const inicio = hm ? `${evento.fecha}T${dos(hm.h)}:${dos(hm.m)}:00-05:00` : `${evento.fecha}T00:00:00-05:00`;
  const fin = hm ? `${evento.fecha}T${dos(Math.min(23, hm.h + 1))}:${dos(hm.m)}:00-05:00` : inicio;
  const recordatorios = String(privado.recordatorios || '1440,120').split(',').map(x => Number(x.trim())).filter(x => x > 0 && x <= 40320).slice(0, 5);
  try {
    await llamarScript(privado.calendarioUrl, {
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      inicio, fin, todoElDia: !hm,
      ubicacion: evento.ubicacion || '',
      invitados: String(privado.calendarioCorreos || '').split(/[,;\s]+/).filter(x => x.includes('@')).join(','),
      recordatoriosMinutos: recordatorios.length ? recordatorios : [1440, 120]
    });
    return 'evento creado';
  } catch (e) {
    console.error('Error con el calendario:', e);
    return 'error al crear el evento';
  }
}

// Envía un correo usando el mismo script (necesita la versión del script que tiene la acción "correo")
export async function enviarCorreo(privado, para, asunto, cuerpo) {
  if (!privado || !privado.calendarioUrl) return 'sin script de Google configurado';
  const correos = String(para || '').split(/[,;\s]+/).filter(x => x.includes('@'));
  if (!correos.length) return 'sin correos configurados';
  try {
    await llamarScript(privado.calendarioUrl, { accion: 'correo', para: correos.join(','), asunto, cuerpo });
    return 'correo enviado';
  } catch (e) {
    console.error('Error enviando correo:', e);
    return 'no se pudo enviar el correo (falta actualizar el script de Google)';
  }
}
