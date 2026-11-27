// Fechas y horas en Colombia: festivos, días sin entregas y lectura de horas escritas por el cliente.

export const normalizar = (t) => String(t || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ñ ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export function ahoraColombia() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
}

export function hoyColombia(diasExtra = 0) {
  const d = ahoraColombia();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diasExtra);
  return d;
}

export const aISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const desdeISO = (iso) => { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); };
export const sumarDiasISO = (iso, n) => { const d = desdeISO(iso); d.setDate(d.getDate() + n); return aISO(d); };

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function fechaBonita(iso) {
  const f = desdeISO(iso);
  return `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`;
}
export const nombreDia = (iso) => DIAS[desdeISO(iso).getDay()];

// ---------- Festivos de Colombia (Ley Emiliani) ----------
function pascua(anio) {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}
const cacheFestivos = {};
export function festivosColombia(anio) {
  if (cacheFestivos[anio]) return cacheFestivos[anio];
  const f = new Set();
  const fijo = (m, d) => f.add(aISO(new Date(anio, m - 1, d)));
  const aLunes = (fecha) => { const x = new Date(fecha); x.setDate(x.getDate() + ((8 - x.getDay()) % 7)); f.add(aISO(x)); };
  [[1, 1], [5, 1], [7, 20], [8, 7], [12, 8], [12, 25]].forEach(([m, d]) => fijo(m, d));
  [[1, 6], [3, 19], [6, 29], [8, 15], [10, 12], [11, 1], [11, 11]].forEach(([m, d]) => aLunes(new Date(anio, m - 1, d)));
  const p = pascua(anio);
  const desde = (n) => { const x = new Date(p); x.setDate(x.getDate() + n); return x; };
  f.add(aISO(desde(-3))); // Jueves Santo
  f.add(aISO(desde(-2))); // Viernes Santo
  aLunes(desde(39)); // Ascensión
  aLunes(desde(60)); // Corpus Christi
  aLunes(desde(68)); // Sagrado Corazón
  cacheFestivos[anio] = f;
  return f;
}

// Domingos y festivos no hay entregas
export function esDiaSinEntregas(iso) {
  const d = desdeISO(iso);
  return d.getDay() === 0 || festivosColombia(d.getFullYear()).has(iso);
}

// El día siguiente a un domingo o festivo solo se entrega desde las 2 pm
// (el día anterior no se trabajó, así que la mañana es para preparar).
export const HORA_INICIO_TRAS_DESCANSO = 14;
export const despuesDeDescanso = (iso) => !esDiaSinEntregas(iso) && esDiaSinEntregas(sumarDiasISO(iso, -1));

// Siguiente día con entregas después de hoy (para el resumen de las 2 pm)
export function siguienteDiaHabil(desde = aISO(hoyColombia(0))) {
  let iso = sumarDiasISO(desde, 1);
  while (esDiaSinEntregas(iso)) iso = sumarDiasISO(iso, 1);
  return iso;
}

// ---------- Horas escritas libremente ----------
// "3 pm", "a las 10", "mediodía", "10:30 am" → hora del día 0-23, o null.
export function horaDelDia(texto) {
  const t = normalizar(texto);
  if (/medio ?dia/.test(t)) return 12;
  const m = t.match(/(\d{1,2})(?:[ :.h](\d{2}))?\s*(am|a m|pm|p m|de la manana|de la tarde|de la noche|m)?\b/);
  if (!m) return null;
  let h = Number(m[1]);
  const sufijo = m[3] || '';
  if (/(pm|p m|tarde|noche)/.test(sufijo) && h < 12) h += 12;
  if (!sufijo && h >= 1 && h <= 6) h += 12; // "a las 3" = 3 de la tarde
  return h <= 23 ? h : null;
}

export function horaYMinutos(texto) {
  const h = horaDelDia(texto);
  if (h === null) return null;
  const m = normalizar(texto).match(/\d{1,2}[ :.h](\d{2})/);
  return { h, m: m ? Math.min(59, Number(m[1])) : 0 };
}

// "Ya", "inmediato", "lo antes posible"… → entrega inmediata (unos 30 minutos)
export const HORA_INMEDIATA = 'Lo antes posible (aprox. 30 min)';
const PIDE_INMEDIATO = /\b(ya|ya mismo|inmediat[oa]?|inmediatamente|lo antes posible|lo mas pronto( posible)?|cuanto antes|apenas (puedan|se pueda)|ahora( mismo)?|de una|urgente|asap)\b/;
export const esInmediato = (texto) => /lo antes posible \(aprox/i.test(texto || '') || /≈ 30 min/.test(texto || '') || PIDE_INMEDIATO.test(normalizar(texto));
