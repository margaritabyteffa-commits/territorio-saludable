'use client';

// Pestaña "Domicilios" del panel: entregas del día (o del rango de fechas),
// solo con lo que necesita el domiciliario, y cuentas de cuánto se debe en domicilios.
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';

const cop = (n) => '$ ' + (Math.round(Number(n) || 0)).toLocaleString('es-CO');
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sumarDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fechaLarga = (f) => { const [a, m, d] = f.split('-').map(Number); const x = new Date(a, m - 1, d); return `${DIAS[x.getDay()]} ${d} de ${MESES[m - 1]}`; };
const soloNumeros = (t) => String(t || '').replace(/\D/g, '');
const enlaceWhatsApp = (t) => { const n = soloNumeros(t); return n ? 'https://wa.me/' + (n.length === 10 ? '57' + n : n) : null; };

const ESTADO_PAGO = {
  pagado: { texto: '✅ Pagado', clase: 'bg-emerald-100 text-emerald-800' },
  contraentrega: { texto: '💵 Contra entrega', clase: 'bg-amber-100 text-amber-900' },
  verificar: { texto: '🧾 Comprobante por verificar', clase: 'bg-blue-100 text-blue-800' },
  sinpagar: { texto: '⌛ Sin pagar', clase: 'bg-stone-200 text-stone-700' }
};

export default function PanelDomicilios({ apiAdmin, showToast }) {
  const hoy = iso(new Date());
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [filtroRepartidor, setFiltroRepartidor] = useState('Todos');
  const [incluirSinPagar, setIncluirSinPagar] = useState(false);
  const [verCancelados, setVerCancelados] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [control, setControl] = useState({ repartidores: [], asignaciones: {}, manuales: [] });
  const [cargando, setCargando] = useState(true);
  const [nuevoRepartidor, setNuevoRepartidor] = useState('');
  const [formManual, setFormManual] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const d = await apiAdmin('/api/admin/domicilios');
      setPedidos(d.pedidos || []);
      setControl(d.control || { repartidores: [], asignaciones: {}, manuales: [] });
    } catch (e) { showToast('⚠️ ' + e.message); }
    setCargando(false);
  };
  useEffect(() => { cargar(); }, []);

  const guardar = async (nuevo, aviso) => {
    setControl(nuevo);
    try {
      await apiAdmin('/api/admin/domicilios', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ control: nuevo }) });
      if (aviso) showToast(aviso);
    } catch (e) { showToast('⚠️ ' + e.message); }
  };

  const asignar = (codigo, cambios) => {
    const actual = control.asignaciones[codigo] || {};
    guardar({ ...control, asignaciones: { ...control.asignaciones, [codigo]: { ...actual, ...cambios } } });
  };

  // Todas las entregas (bot + manuales) con sus datos ya combinados
  const entregas = useMemo(() => {
    const delBot = pedidos.map(p => {
      const a = control.asignaciones[p.codigo] || {};
      const contraEntrega = p.formaPago === 'contraentrega' && p.saldo > 0;
      const pagoBot = p.estado === 'APROBADO' ? (contraEntrega ? 'contraentrega' : 'pagado') : p.estado === 'POR_VERIFICAR' ? 'verificar' : 'sinpagar';
      const pago = a.pago || pagoBot;
      return {
        ...p, origen: 'bot', pago, pagoBot,
        valor: a.valor ?? p.domicilio, cobrar: pago === 'contraentrega' ? (contraEntrega ? p.saldo : p.total) : 0,
        domiciliario: a.domiciliario || '', pagadoDomiciliario: !!a.pagadoDomiciliario,
        entregado: !!a.entregado, cancelado: !!a.cancelado
      };
    });
    const manuales = control.manuales.map(m => {
      const a = control.asignaciones[m.codigo] || {};
      return {
        ...m, origen: 'manual', sector: '', pago: m.pago,
        valor: a.valor ?? m.domicilio, domiciliario: a.domiciliario || '', pagadoDomiciliario: !!a.pagadoDomiciliario,
        entregado: !!a.entregado, cancelado: !!a.cancelado
      };
    });
    return [...delBot, ...manuales].sort((x, y) => (x.fecha + x.hora).localeCompare(y.fecha + y.hora));
  }, [pedidos, control]);

  const enRango = useMemo(() => entregas.filter(e => {
    if (!e.fecha || e.fecha < desde || e.fecha > hasta) return false;
    if (e.origen === 'bot' && !incluirSinPagar && e.pagoBot === 'sinpagar' && e.pago !== 'contraentrega') return false;
    if (filtroRepartidor === 'Sin asignar' && e.domiciliario) return false;
    if (!['Todos', 'Sin asignar'].includes(filtroRepartidor) && e.domiciliario !== filtroRepartidor) return false;
    return true;
  }), [entregas, desde, hasta, incluirSinPagar, filtroRepartidor]);

  const visibles = enRango.filter(e => verCancelados || !e.cancelado);
  const cuentan = enRango.filter(e => !e.cancelado);
  const totalDomicilios = cuentan.reduce((s, e) => s + (Number(e.valor) || 0), 0);
  const pagado = cuentan.filter(e => e.pagadoDomiciliario).reduce((s, e) => s + (Number(e.valor) || 0), 0);
  const porCobrar = cuentan.filter(e => e.pago === 'contraentrega').reduce((s, e) => s + (Number(e.cobrar) || 0), 0);

  const porRepartidor = useMemo(() => {
    const m = {};
    cuentan.forEach(e => {
      const k = e.domiciliario || 'Sin asignar';
      m[k] = m[k] || { entregas: 0, total: 0, pagado: 0 };
      m[k].entregas += 1;
      m[k].total += Number(e.valor) || 0;
      if (e.pagadoDomiciliario) m[k].pagado += Number(e.valor) || 0;
    });
    return Object.entries(m);
  }, [cuentan]);

  const liquidar = (nombre) => {
    const asignaciones = { ...control.asignaciones };
    cuentan.filter(e => (e.domiciliario || 'Sin asignar') === nombre).forEach(e => {
      asignaciones[e.codigo] = { ...(asignaciones[e.codigo] || {}), pagadoDomiciliario: true };
    });
    guardar({ ...control, asignaciones }, `✓ Domicilios de ${nombre} marcados como pagados`);
  };

  const rapido = (tipo) => {
    const d = new Date();
    if (tipo === 'hoy') { setDesde(iso(d)); setHasta(iso(d)); }
    if (tipo === 'manana') { const m = iso(sumarDias(d, 1)); setDesde(m); setHasta(m); }
    if (tipo === 'semana') { const lunes = sumarDias(d, -((d.getDay() + 6) % 7)); setDesde(iso(lunes)); setHasta(iso(sumarDias(lunes, 6))); }
    if (tipo === 'mes') { setDesde(iso(new Date(d.getFullYear(), d.getMonth(), 1))); setHasta(iso(new Date(d.getFullYear(), d.getMonth() + 1, 0))); }
  };

  const agregarRepartidor = () => {
    const n = nuevoRepartidor.trim();
    if (!n || control.repartidores.includes(n)) return;
    guardar({ ...control, repartidores: [...control.repartidores, n] }, '✓ Domiciliario agregado');
    setNuevoRepartidor('');
  };

  const guardarManual = (e) => {
    e.preventDefault();
    const f = formManual;
    if (!f.recibeNombre.trim() || !f.direccion.trim() || !f.fecha) { showToast('⚠️ Falta quién recibe, la dirección o la fecha'); return; }
    const manual = { ...f, codigo: 'M-' + Date.now().toString().slice(-6), domicilio: soloNumeros(f.domicilio), cobrar: soloNumeros(f.cobrar) };
    guardar({ ...control, manuales: [manual, ...control.manuales] }, '✓ Domicilio agregado');
    setFormManual(null);
  };

  const borrarManual = (codigo) => {
    const asignaciones = { ...control.asignaciones };
    delete asignaciones[codigo];
    guardar({ ...control, manuales: control.manuales.filter(m => m.codigo !== codigo), asignaciones }, 'Domicilio eliminado');
  };

  const fechas = [...new Set(visibles.map(e => e.fecha))];
  const titulo = desde === hasta ? fechaLarga(desde) : `del ${fechaLarga(desde)} al ${fechaLarga(hasta)}`;

  return (
    <div className="space-y-4 text-xs">
      {/* Filtros */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif font-bold text-lg text-stone-900">🛵 Domicilios <span className="text-sm font-normal text-stone-500">· {titulo}</span></h3>
          <button onClick={() => setFormManual({ recibeNombre: '', recibeTelefono: '', direccion: '', fecha: desde, hora: '', domicilio: '', cobrar: '', pago: 'pagado' })} className="px-3 py-2 rounded-xl bg-[#2D5A27] text-white font-bold flex items-center gap-1"><Plus size={14} /> Agregar domicilio</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[['hoy', 'Hoy'], ['manana', 'Mañana'], ['semana', 'Esta semana'], ['mes', 'Este mes']].map(([k, t]) => (
            <button key={k} onClick={() => rapido(k)} className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 font-bold text-stone-700">{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label className="space-y-1"><span className="font-bold block">Desde</span><input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); if (e.target.value > hasta) setHasta(e.target.value); }} className="w-full p-2 rounded-xl border border-stone-300" /></label>
          <label className="space-y-1"><span className="font-bold block">Hasta</span><input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full p-2 rounded-xl border border-stone-300" /></label>
          <label className="space-y-1 col-span-2"><span className="font-bold block">Domiciliario</span>
            <select value={filtroRepartidor} onChange={(e) => setFiltroRepartidor(e.target.value)} className="w-full p-2 rounded-xl border border-stone-300">
              {['Todos', 'Sin asignar', ...control.repartidores].map(r => <option key={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-4 text-stone-600">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={incluirSinPagar} onChange={(e) => setIncluirSinPagar(e.target.checked)} /> Mostrar pedidos del bot que aún no han pagado</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={verCancelados} onChange={(e) => setVerCancelados(e.target.checked)} /> Mostrar cancelados</label>
        </div>
      </div>

      {/* Cuentas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[['Entregas', cuentan.length, ''], ['Total en domicilios', cop(totalDomicilios), ''], ['Ya pagado a domiciliarios', cop(pagado), 'text-emerald-700'], ['Debo en domicilios', cop(totalDomicilios - pagado), 'text-red-700']].map(([t, v, c]) => (
          <div key={t} className="bg-white rounded-2xl border border-stone-200 p-3">
            <p className="text-stone-500">{t}</p>
            <p className={'text-lg font-black ' + c}>{v}</p>
          </div>
        ))}
      </div>
      {porCobrar > 0 && <p className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900">💵 Por cobrar contra entrega en este rango: <strong>{cop(porCobrar)}</strong></p>}

      {porRepartidor.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-4 space-y-2">
          <p className="font-bold text-stone-800">Por domiciliario</p>
          {porRepartidor.map(([nombre, r]) => (
            <div key={nombre} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-50">
              <span className="font-bold">{nombre}</span>
              <span className="text-stone-600">{r.entregas} entrega(s) · total {cop(r.total)} · pagado {cop(r.pagado)} · <strong className={r.total - r.pagado ? 'text-red-700' : 'text-emerald-700'}>debo {cop(r.total - r.pagado)}</strong></span>
              {nombre !== 'Sin asignar' && r.total - r.pagado > 0 && <button onClick={() => liquidar(nombre)} className="px-2.5 py-1 rounded-lg bg-[#2D5A27] text-white font-bold">Marcar todo pagado</button>}
            </div>
          ))}
        </div>
      )}

      {/* Lista de entregas */}
      {cargando && <p className="text-stone-500">Cargando domicilios…</p>}
      {!cargando && !visibles.length && <p className="bg-white rounded-2xl border border-stone-200 p-4 text-stone-500">No hay domicilios en estas fechas.</p>}
      {fechas.map(f => (
        <div key={f} className="space-y-2">
          <p className="font-bold text-stone-700 capitalize pt-1">📅 {fechaLarga(f)}</p>
          {visibles.filter(e => e.fecha === f).map(e => {
            const wa = enlaceWhatsApp(e.recibeTelefono);
            const estado = ESTADO_PAGO[e.pago] || ESTADO_PAGO.sinpagar;
            return (
              <div key={e.codigo} className={'bg-white rounded-2xl border p-4 space-y-2 ' + (e.cancelado ? 'opacity-50 border-stone-200' : e.entregado ? 'border-emerald-300' : 'border-stone-200')}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-stone-900">{e.recibeNombre || 'Sin nombre'} {e.hora && <span className="font-normal text-stone-500">· 🕒 {e.hora}</span>}</p>
                    {wa ? <a href={wa} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold">📱 {e.recibeTelefono}</a> : <span className="text-stone-400">Sin celular</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className={'px-2 py-0.5 rounded-full font-bold ' + estado.clase}>{estado.texto}{e.pago === 'contraentrega' && e.cobrar ? ': cobrar ' + cop(e.cobrar) : ''}</span>
                    <span className="text-[10px] text-stone-400">{e.codigo}{e.origen === 'manual' ? ' · manual' : ''}</span>
                  </div>
                </div>
                <p className="flex items-start gap-1 text-stone-800"><MapPin size={13} className="mt-0.5 shrink-0 text-[#2D5A27]" /> <span>{e.direccion}{e.sector ? ` (${e.sector})` : ''}</span></p>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
                  <label className="flex items-center gap-1">Domicilio $
                    <input defaultValue={e.valor || ''} key={e.codigo + '-' + e.valor} onBlur={(ev) => { const v = soloNumeros(ev.target.value); if (Number(v) !== Number(e.valor)) asignar(e.codigo, { valor: v === '' ? null : Number(v) }); }} inputMode="numeric" className="w-20 p-1.5 rounded-lg border border-stone-300" />
                  </label>
                  <select value={e.domiciliario} onChange={(ev) => asignar(e.codigo, { domiciliario: ev.target.value })} className="p-1.5 rounded-lg border border-stone-300">
                    <option value="">— Domiciliario —</option>
                    {control.repartidores.map(r => <option key={r}>{r}</option>)}
                  </select>
                  {e.origen === 'bot' && (
                    <select value={e.pago === e.pagoBot ? '' : e.pago} onChange={(ev) => asignar(e.codigo, { pago: ev.target.value })} className="p-1.5 rounded-lg border border-stone-300">
                      <option value="">Pago según el bot</option>
                      <option value="pagado">Pagado</option>
                      <option value="contraentrega">Contra entrega</option>
                    </select>
                  )}
                  <label className="flex items-center gap-1"><input type="checkbox" checked={e.entregado} onChange={(ev) => asignar(e.codigo, { entregado: ev.target.checked })} /> Entregado</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={e.pagadoDomiciliario} onChange={(ev) => asignar(e.codigo, { pagadoDomiciliario: ev.target.checked })} /> Ya le pagué</label>
                  <label className="flex items-center gap-1 text-stone-500"><input type="checkbox" checked={e.cancelado} onChange={(ev) => asignar(e.codigo, { cancelado: ev.target.checked })} /> Cancelado</label>
                  {e.origen === 'manual' && <button onClick={() => borrarManual(e.codigo)} className="p-1.5 rounded-lg bg-red-50 text-red-600" title="Eliminar"><Trash2 size={13} /></button>}
                </div>
                {e.domicilioPorConfirmar && !control.asignaciones[e.codigo]?.valor && <p className="text-amber-700">⚠️ Domicilio por confirmar: escribe aquí el valor cuando lo sepas.</p>}
              </div>
            );
          })}
        </div>
      ))}

      {/* Domiciliarios */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 space-y-2">
        <p className="font-bold text-stone-800">👤 Domiciliarios</p>
        <div className="flex flex-wrap gap-1.5">
          {control.repartidores.map(r => (
            <span key={r} className="px-2.5 py-1 rounded-full bg-stone-100 font-bold flex items-center gap-1">{r}
              <button onClick={() => guardar({ ...control, repartidores: control.repartidores.filter(x => x !== r) }, 'Domiciliario quitado')} className="text-stone-400 hover:text-red-600">✕</button>
            </span>
          ))}
          {!control.repartidores.length && <span className="text-stone-500">Aún no hay domiciliarios.</span>}
        </div>
        <div className="flex gap-2">
          <input value={nuevoRepartidor} onChange={(e) => setNuevoRepartidor(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') agregarRepartidor(); }} placeholder="Nombre del domiciliario" className="flex-1 p-2 rounded-xl border border-stone-300" />
          <button onClick={agregarRepartidor} className="px-3 py-2 rounded-xl bg-[#2D5A27] text-white font-bold">Agregar</button>
        </div>
      </div>

      {/* Agregar domicilio a mano (pedidos por llamada, en persona, etc.) */}
      {formManual && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto">
          <form onSubmit={guardarManual} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-3 my-8">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-base">🛵 Agregar domicilio</h3>
              <button type="button" onClick={() => setFormManual(null)} className="text-stone-400 font-bold">✕</button>
            </div>
            {[['recibeNombre', 'Quién recibe'], ['recibeTelefono', 'WhatsApp de quien recibe'], ['direccion', 'Dirección completa y barrio']].map(([k, t]) => (
              <label key={k} className="block space-y-1"><span className="font-bold">{t}</span><input value={formManual[k]} onChange={(e) => setFormManual({ ...formManual, [k]: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" /></label>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1"><span className="font-bold block">Fecha</span><input type="date" value={formManual.fecha} onChange={(e) => setFormManual({ ...formManual, fecha: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" /></label>
              <label className="space-y-1"><span className="font-bold block">Hora</span><input value={formManual.hora} onChange={(e) => setFormManual({ ...formManual, hora: e.target.value })} placeholder="10:00 am" className="w-full p-2.5 rounded-xl border border-stone-300" /></label>
              <label className="space-y-1"><span className="font-bold block">Valor domicilio</span><input value={formManual.domicilio} onChange={(e) => setFormManual({ ...formManual, domicilio: e.target.value })} inputMode="numeric" placeholder="8000" className="w-full p-2.5 rounded-xl border border-stone-300" /></label>
              <label className="space-y-1"><span className="font-bold block">Pago</span>
                <select value={formManual.pago} onChange={(e) => setFormManual({ ...formManual, pago: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300">
                  <option value="pagado">Ya está pago</option>
                  <option value="contraentrega">Contra entrega</option>
                </select>
              </label>
            </div>
            {formManual.pago === 'contraentrega' && (
              <label className="block space-y-1"><span className="font-bold">Valor a cobrar al entregar</span><input value={formManual.cobrar} onChange={(e) => setFormManual({ ...formManual, cobrar: e.target.value })} inputMode="numeric" className="w-full p-2.5 rounded-xl border border-stone-300" /></label>
            )}
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#2D5A27] text-white font-bold">Guardar domicilio</button>
          </form>
        </div>
      )}
    </div>
  );
}
