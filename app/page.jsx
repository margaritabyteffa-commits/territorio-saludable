'use client';

import React, { useState } from 'react';

// BASE DE DATOS INICIAL DE PRODUCTOS
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Torta Moka",
    category: "Tortas Saludables",
    price: 84000,
    description: "Esponjoso bizcocho de cacao y café orgánico, rellenado con crema suave de arequipe sin azúcar y cobertura de ganache artesanal.",
    image: "/torta-moka.png",
    isAvailable: true,
    requiresAdvance: true,
    sizes: [
      { id: 's1', portions: '5 porc', price: 84000 },
      { id: 's2', portions: '8 porc', price: 123000 },
      { id: 's3', portions: '12 porc', price: 155000 },
      { id: 's4', portions: '18 porc', price: 217000 }
    ]
  },
  {
    id: 2,
    name: "Torta Pistacho",
    category: "Tortas Saludables",
    price: 94000,
    description: "Masa fina a base de harina de almendras y pistachos naturales molidos, endulzada con stevia pura y crema pastelera fit.",
    image: "/torta-pistacho.png",
    isAvailable: true,
    requiresAdvance: true,
    sizes: [
      { id: 's5', portions: '5 porc', price: 94000 },
      { id: 's6', portions: '8 porc', price: 135000 },
      { id: 's7', portions: '12 porc', price: 175000 }
    ]
  },
  {
    id: 3,
    name: "Box Dúo",
    category: "Catálogo Detalles",
    price: 45000,
    description: "Caja de regalo decorada con lazo rojo que incluye 2 brownies melcochudos bañados en arequipe fit artesanal.",
    image: "/box-duo.jpg",
    isAvailable: true,
    requiresAdvance: false,
    sizes: []
  },
  {
    id: 4,
    name: "Baguette Rústico",
    category: "Pan Saludable",
    price: 14000,
    description: "Pan de fermentación limpia a base de harina de arroz, almidón de yuca y psyllium. Crocante por fuera y suave por dentro.",
    image: "/baguette.jpg",
    isAvailable: true,
    requiresAdvance: true,
    sizes: []
  }
];

// ZONAS DE DOMICILIO INICIALES
const INITIAL_ZONES = [
  { id: 1, name: 'Cabecera / Sotomayor', price: 5000 },
  { id: 2, name: 'Centro / San Francisco', price: 7000 },
  { id: 3, name: 'Floridablanca', price: 10000 },
  { id: 4, name: 'Girón / Piedecuesta', price: 15000 }
];

// PEDIDOS DE PRUEBA INICIALES
const INITIAL_ORDERS = [
  {
    id: 'TS-1001',
    clientName: 'Valentina Gómez',
    phone: '3158901234',
    items: [
      { name: 'Torta Moka (8 porc)', qty: 1, price: 123000 },
      { name: 'Brownies Melcochudos (Caja x4)', qty: 1, price: 36000 }
    ],
    notes: 'Cliente habitual. Entregar antes de las 4 PM.',
    deliveryDate: '2026-11-10',
    deliveryTime: '3:30 PM',
    address: 'Cra 35 # 52-20, Apto 402',
    zone: 'Cabecera, Bucaramanga',
    total: 159000,
    paymentStatus: 'PAGADO NEQUI',
    status: 'En Cocina'
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminSection, setAdminSection] = useState('pedidos'); // 'pedidos' | 'inventario' | 'config'
  const [adminAuthModal, setAdminAuthModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  
  // ESTADOS DEL SISTEMA
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  // MANEJO DE PEDIDO VÍA WHATSAPP (SIM PROVISIONAL)
  const handleOrderWhatsApp = (product) => {
    const selPortion = selectedSizes[product.id];
    const sizeObj = product.sizes && product.sizes.find(s => s.portions === selPortion);
    const priceText = sizeObj ? ` ($${sizeObj.price.toLocaleString()})` : ` ($${product.price.toLocaleString()})`;
    const portionText = sizeObj ? ` (${sizeObj.portions})` : '';

    const text = `¡Hola Territorio Saludable! 🍰 Quisiera pedir: *${product.name}*${portionText}${priceText}.\n\nPor favor indíquenme los datos para realizar la transferencia por Nequi / Bancolombia.`;

    const whatsappPhone = '573000559196'; // SIM PROVISIONAL
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Teléfono ${text} copiado al portapapeles`);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123' || adminPasswordInput === 'ts2026') {
      setIsAdminView(true);
      setAdminAuthModal(false);
      setAdminPasswordInput('');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeTab === 'Todas' || p.category === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'Todos') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-gray-800 font-sans">
      
      {/* 1. ENCABEZADO SUPERIOR Y NAV */}
      <header className="bg-[#1C3A27] text-white py-2 px-4 text-center text-xs font-medium">
        Pastelería Artesanal 100% Sin Azúcar Refinada y Sin Gluten en Bucaramanga | Horario: Lunes a Viernes: 8am - 6pm
      </header>

      <nav className="bg-[#FBF8F3] border-b border-amber-950/10 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Territorio Saludable" 
              className="w-12 h-12 object-contain rounded-full border border-emerald-800/20"
              onError={(e) => { e.target.style.display='none'; }}
            />
            <div>
              <h1 className="font-serif font-bold text-lg text-[#1C3A27] leading-tight">Territorio Saludable S.A.S.</h1>
              <p className="text-[11px] text-emerald-800 font-medium">PASTELERÍA SANA • PEDIDOS WHATSAPP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/573000559196" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-full flex items-center gap-2 transition"
            >
              📞 300 0559196
            </a>

            {!isAdminView ? (
              <button 
                onClick={() => setAdminAuthModal(true)}
                className="bg-[#1C3A27] hover:bg-black text-white text-xs font-semibold py-2 px-4 rounded-full border border-emerald-900 transition flex items-center gap-1"
              >
                🛡️ Acceso Admin
              </button>
            ) : (
              <button 
                onClick={() => setIsAdminView(false)}
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold py-2 px-4 rounded-full transition"
              >
                🚪 Ver Vista Pública
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* VISTA PÚBLICA DEL CLIENTE */}
      {!isAdminView ? (
        <main className="max-w-6xl mx-auto px-4 py-8">
          
          {/* BANNER PRINCIPAL */}
          <section className="text-center max-w-4xl mx-auto mb-10">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
              🌿 Pastelería Saludable en Bucaramanga & Área Metropolitana
            </span>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C3A27] mt-4 mb-3 leading-tight">
              El placer de lo dulce, <br className="hidden md:inline" />
              <span className="italic font-normal">100% sin azúcar y libre de gluten.</span>
            </h2>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 max-w-3xl mx-auto">
              Nuestra meta es crear recetas deliciosas con ingredientes que sean útiles para nuestro cuerpo. Eliminamos el azúcar refinado, eliminamos el gluten (a muchos les cae mal), e incluimos ingredientes maravillosos como el chocolate amargo, la fibra prebiótica, el colágeno hidrolizado, harinas integrales, muchas frutas y lo mejor, es que todo lo endulzamos con STEVIA.
            </p>

            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium text-emerald-900">
              <span className="bg-white border border-emerald-200 px-3 py-1 rounded-full">✓ 0% Azúcar refinada</span>
              <span className="bg-white border border-emerald-200 px-3 py-1 rounded-full">✓ 100% Libres de gluten</span>
              <span className="bg-white border border-emerald-200 px-3 py-1 rounded-full">♡ Aptas para diabéticos</span>
              <span className="bg-white border border-emerald-200 px-3 py-1 rounded-full">🕒 Tortas con 1 día de anticipación</span>
            </div>

            {/* BUSCADOR */}
            <div className="mt-6 max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="🔍 Buscar por nombre, sabor o ingrediente..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-full py-2.5 px-5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </section>

          {/* FILTROS DE CATEGORÍA */}
          <div className="flex flex-wrap gap-2 justify-center border-b border-amber-950/10 pb-4 mb-8">
            {['Todas', 'Tortas Saludables', 'Catálogo Detalles', 'Pan Saludable', 'Postres Saludables', 'Mercadito'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition ${
                  activeTab === cat 
                    ? 'bg-[#1C3A27] text-white shadow' 
                    : 'bg-white text-gray-700 border border-amber-200 hover:bg-amber-100/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* TEXTO DESCRIPTIVO POR CATEGORÍA SELECCIONADA */}
          <div className="mb-6 bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 text-xs text-gray-700">
            {activeTab === 'Tortas Saludables' && (
              <p>🎂 <strong>Tortas Saludables:</strong> Todas nuestras tortas son hechas a base de harina de almendras, arroz y almidón de yuca, endulzadas 100% Libres de azúcar y Sin gluten. Pedidos con un día de anticipación.</p>
            )}
            {activeTab === 'Catálogo Detalles' && (
              <p>🎁 <strong>Catálogo Detalles:</strong> Detalles con amor. Sorprende a tu persona favorita con una experiencia deliciosa y libre de culpas.</p>
            )}
            {activeTab === 'Pan Saludable' && (
              <p>🍞 <strong>Pan Digestivo (Sin azúcar y Sin gluten):</strong> Disfruta de un pan saludable, delicioso con un sabor auténtico y una textura única. Está hecho con harina de arroz, fécula de maíz y harina de almendras. Contiene psyllium, una fuente natural de fibra que favorece la digestión y brinda saciedad. Es 100% libre de gluten y no contiene azúcar refinada, convirtiéndose en una opción perfecta para quienes buscan cuidar su alimentación sin renunciar al placer de disfrutar un pan verdaderamente delicioso.</p>
            )}
            {(activeTab === 'Todas' || activeTab === 'Postres Saludables' || activeTab === 'Mercadito') && (
              <p>✨ Selecciona el producto que prefieras y presiona el botón <strong>Pedir</strong> para coordinar la entrega directamente a través de nuestro WhatsApp oficial.</p>
            )}
          </div>

          {/* GRILLA DE PRODUCTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const currentPortion = selectedSizes[product.id] || (product.sizes?.[0]?.portions);
              const currentSizeObj = product.sizes?.find(s => s.portions === currentPortion);
              const displayPrice = currentSizeObj ? currentSizeObj.price : product.price;

              return (
                <div key={product.id} className="bg-white rounded-2xl border border-amber-200/70 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    {/* IMAGEN Y BADGES */}
                    <div className="relative h-48 bg-amber-100/40">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60'; }}
                      />
                      {product.requiresAdvance && (
                        <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                          1 Día Anticipación
                        </span>
                      )}
                    </div>

                    {/* CONTENIDO DE LA TARJETA */}
                    <div className="p-4">
                      <h3 className="font-serif font-bold text-gray-900 text-base mb-1">{product.name}</h3>
                      
                      {/* DESCRIPCIÓN DEL PRODUCTO */}
                      <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-3">
                        {product.description}
                      </p>

                      {/* SELECTOR DE PORCIONES (SI APLICA) */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-3">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            PORCIÓN / TAMAÑO:
                          </label>
                          <select 
                            value={currentPortion}
                            onChange={(e) => setSelectedSizes({...selectedSizes, [product.id]: e.target.value})}
                            className="w-full border border-gray-200 rounded-lg p-1.5 text-xs bg-gray-50 font-medium"
                          >
                            {product.sizes.map(s => (
                              <option key={s.id} value={s.portions}>
                                {s.portions} - ${s.price.toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PRECIO Y BOTÓN PEDIR */}
                  <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">PRECIO</span>
                      <span className="text-base font-bold text-[#1C3A27]">${displayPrice.toLocaleString()}</span>
                    </div>

                    <button 
                      onClick={() => handleOrderWhatsApp(product)}
                      className="bg-[#1C3A27] hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                    >
                      📞 Pedir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      ) : (
        /* VISTA ADMINISTRATIVA */
        <main className="max-w-6xl mx-auto px-4 py-8">
          
          {/* BARRA SUPERIOR ADMIN */}
          <div className="bg-[#1C3A27] text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-6 shadow-md">
            <div>
              <h2 className="font-serif text-lg font-bold">Panel de Administración • Territorio Saludable</h2>
              <p className="text-xs text-emerald-200">Gestión de Pedidos, Productos y Tarifas de Domicilio</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setAdminSection('pedidos')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${adminSection === 'pedidos' ? 'bg-white text-[#1C3A27]' : 'bg-emerald-900 text-emerald-100'}`}
              >
                📋 Pedidos ({orders.length})
              </button>
              <button 
                onClick={() => setAdminSection('inventario')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${adminSection === 'inventario' ? 'bg-white text-[#1C3A27]' : 'bg-emerald-900 text-emerald-100'}`}
              >
                📦 Productos ({products.length})
              </button>
              <button 
                onClick={() => setAdminSection('config')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${adminSection === 'config' ? 'bg-white text-[#1C3A27]' : 'bg-emerald-900 text-emerald-100'}`}
              >
                ⚙️ Configuración
              </button>
            </div>
          </div>

          {/* SECCIÓN 1: PEDIDOS */}
          {adminSection === 'pedidos' && (
            <div className="space-y-4">
              
              {/* FILTROS POR ESTADO */}
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-1.5">
                  {['Todos', 'Pendiente', 'En Cocina', 'Listo Despacho', 'Entregado'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                        statusFilter === st 
                          ? 'bg-[#1C3A27] text-white border-[#1C3A27]' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => alert('Función para agregar orden manual lista para registrar datos.')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  + Nueva Orden Manual
                </button>
              </div>

              {/* TABLA DE PEDIDOS */}
              <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-50/80 text-gray-700 font-bold border-b border-amber-200/60">
                      <tr>
                        <th className="p-3">CÓDIGO / CLIENTE</th>
                        <th className="p-3">PRODUCTOS AGENDADOS</th>
                        <th className="p-3">FECHA & HORA</th>
                        <th className="p-3">DIRECCIÓN & ZONA</th>
                        <th className="p-3">TOTAL</th>
                        <th className="p-3">ESTADO DEL PEDIDO</th>
                        <th className="p-3 text-center">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {filteredOrders.map(ord => (
                        <tr key={ord.id} className="hover:bg-amber-50/30">
                          <td className="p-3">
                            <div className="font-bold text-gray-900">{ord.clientName}</div>
                            <div className="text-gray-500 font-mono text-[11px]">
                              {ord.id} • 
                              <button 
                                onClick={() => copyToClipboard(ord.phone)}
                                className="ml-1 text-emerald-700 hover:underline font-bold"
                                title="Copiar Teléfono"
                              >
                                {ord.phone} 📋
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="font-medium text-gray-800">
                                x{it.qty} {it.name}
                              </div>
                            ))}
                            {ord.notes && (
                              <div className="text-[10px] text-amber-800 italic mt-0.5">
                                Nota: {ord.notes}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div>📅 {ord.deliveryDate}</div>
                            <div className="text-gray-500">🕒 {ord.deliveryTime}</div>
                          </td>
                          <td className="p-3">
                            <div>📍 {ord.address}</div>
                            <div className="text-gray-500">{ord.zone}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-emerald-900">${ord.total.toLocaleString()}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">{ord.paymentStatus}</div>
                          </td>
                          <td className="p-3">
                            <select 
                              value={ord.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setOrders(orders.map(o => o.id === ord.id ? {...o, status: newStatus} : o));
                              }}
                              className="border border-gray-200 rounded-lg p-1 text-xs font-semibold bg-white"
                            >
                              <option value="Pendiente">⌛ Pendiente</option>
                              <option value="En Cocina">👨‍🍳 En Cocina</option>
                              <option value="Listo Despacho">📦 Listo Despacho</option>
                              <option value="Entregado">✅ Entregado</option>
                              <option value="Cancelado">❌ Cancelado</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1">
                              <a 
                                href={`https://wa.me/57${ord.phone}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"
                                title="Abrir Chat"
                              >
                                💬
                              </a>
                              <button 
                                onClick={() => alert('Sincronizando evento con Google Calendar...')}
                                className="p-1.5 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                                title="Google Calendar"
                              >
                                📅
                              </button>
                              <button 
                                onClick={() => setSelectedOrderDetail(ord)}
                                className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                title="Ver Detalle Completo"
                              >
                                👁️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: CONFIGURACIÓN Y DOMICILIOS */}
          {adminSection === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CAMBIO DE CONTRASEÑA */}
              <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm">
                <h3 className="font-serif font-bold text-gray-900 text-sm mb-4">🔐 Seguridad y Clave Administrativa</h3>
                <form onSubmit={(e) => { e.preventDefault(); alert('Contraseña actualizada con éxito'); }}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nueva Contraseña:</label>
                  <input 
                    type="password" 
                    placeholder="Escribe la nueva clave..." 
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs mb-3"
                  />
                  <button type="submit" className="bg-[#1C3A27] text-white text-xs font-semibold py-2 px-4 rounded-lg">
                    Guardar Nueva Clave
                  </button>
                </form>
              </div>

              {/* TAFIRAS DE DOMICILIO DINÁMICAS */}
              <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm">
                <h3 className="font-serif font-bold text-gray-900 text-sm mb-4">🛵 Gestión de Tarifas por Zona</h3>
                <div className="space-y-2 mb-4">
                  {zones.map(z => (
                    <div key={z.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                      <span>{z.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800">${z.price.toLocaleString()} COP</span>
                        <button 
                          onClick={() => setZones(zones.filter(item => item.id !== z.id))}
                          className="text-red-500 font-bold px-1 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const name = prompt('Nombre de la nueva zona:');
                    const price = prompt('Precio de envío (COP):');
                    if (name && price) {
                      setZones([...zones, { id: Date.now(), name, price: Number(price) }]);
                    }
                  }}
                  className="w-full border border-dashed border-emerald-800 text-emerald-900 text-xs font-semibold py-2 rounded-lg hover:bg-emerald-50"
                >
                  + Agregar Nueva Zona
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* FOOTER GENERAL */}
      <footer className="bg-[#122519] text-amber-100/80 py-10 px-4 mt-16 border-t border-emerald-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-2">Territorio Saludable</h4>
            <p className="text-gray-400 leading-relaxed">
              Elaboramos tortas artesanalmente, panes de masa madre fit y postres libres de culpa: 100% sin azúcar refinada, sin gluten y aptos para celíacos o diabéticos en Bucaramanga.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-2">🕒 Horarios de Atención</h4>
            <p className="text-gray-400">Lunes a Viernes: 8:00 AM – 6:00 PM</p>
            <p className="text-gray-400">Sábados: 8:00 AM – 5:00 PM</p>
            <p className="text-gray-400">Domingos y Festivos: 9:00 AM – 2:00 PM</p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-2">🛵 Zonas de Entrega</h4>
            {zones.map(z => (
              <p key={z.id} className="text-gray-400">{z.name}: <strong>${z.price.toLocaleString()} COP</strong></p>
            ))}
          </div>

          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-2">💳 Medios de Pago</h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="bg-purple-900 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">NEQUI</span>
              <span className="bg-yellow-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">BANCOLOMBIA</span>
              <span className="bg-red-800 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">DAVIPLATA</span>
              <span className="bg-emerald-900 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">EFECTIVO</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-emerald-900/60 mt-8 pt-4 text-center text-[11px] text-gray-500">
          © 2026 Territorio Saludable S.A.S. • Bucaramanga, Colombia. Todos los derechos reservados.
        </div>
      </footer>

      {/* MODAL DE AUTENTICACIÓN ADMIN */}
      {adminAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-2xl">
            <h3 className="font-serif font-bold text-[#1C3A27] text-base mb-2">Acceso Administrativo</h3>
            <p className="text-xs text-gray-500 mb-4">Ingresa la clave de acceso para ver la gestión de pedidos e inventario.</p>
            
            <form onSubmit={handleAdminLogin}>
              <input 
                type="password" 
                placeholder="Contraseña..." 
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs mb-4 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setAdminAuthModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 border rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#1C3A27] text-white rounded-lg font-semibold"
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE COMPLETO DE ORDEN (OJITO 👁️) */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-serif font-bold text-gray-900 text-base">
                📄 Detalle del Pedido #{selectedOrderDetail.id}
              </h3>
              <button 
                onClick={() => setSelectedOrderDetail(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p><strong>Cliente:</strong> {selectedOrderDetail.clientName}</p>
                <p><strong>Teléfono:</strong> {selectedOrderDetail.phone}</p>
                <p><strong>Entrega:</strong> {selectedOrderDetail.deliveryDate} ({selectedOrderDetail.deliveryTime})</p>
                <p><strong>Dirección:</strong> {selectedOrderDetail.address} - {selectedOrderDetail.zone}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Ítems Desglosados:</h4>
                <div className="space-y-2">
                  {selectedOrderDetail.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      <span>{it.name} (x{it.qty})</span>
                      <span className="font-bold">${it.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-sm font-bold text-[#1C3A27]">
                <span>Total a Pagar:</span>
                <span>${selectedOrderDetail.total.toLocaleString()} COP</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrderDetail(null)}
              className="w-full mt-6 bg-[#1C3A27] text-white text-xs font-semibold py-2.5 rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
