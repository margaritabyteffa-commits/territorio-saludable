'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Store,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  Phone,
  ShieldCheck,
  X,
  SlidersHorizontal
} from 'lucide-react';

const WHATSAPP_PHONE_NUMBER = '573174246835';

// Imagen de respaldo web segura para eliminar el parpadeo/titileo
const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';

const CATEGORIES = ['Tortas', 'Detalles', 'Pan', 'Postres', 'Mercadito'];

const formatPrice = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
};

const buildWhatsAppUrl = (product) => {
  const message = `¡Hola Territorio Saludable! 👋🍰 Quiero pedir el siguiente producto del catálogo:

*${product.name}*
- Categoría: ${product.category}
- Precio: ${formatPrice(product.price)}

¿Me podrían confirmar disponibilidad y el proceso de entrega en Bucaramanga? ¡Muchas gracias!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
};

// ==========================================
// LISTADO CON RUTAS REALES DE TU CARPETA /public
// ==========================================
export const initialProducts = [
  {
    id: 'prod-torta-1',
    name: 'Torta Matilda',
    category: 'Tortas',
    price: 65000,
    description: 'Bizcocho húmedo de puro chocolate cacao 70% sin azúcar refinada y bajo en calorías.',
    imageUrl: '/matilda.jpeg',
    available: true,
  },
  {
    id: 'prod-torta-2',
    name: 'Luna de Almendras',
    category: 'Tortas',
    price: 46000,
    description: 'Torta suave a base de harina de almendras selectas, semillas y toque sutil de vainilla natural.',
    imageUrl: '/luna-de-almendras.png',
    available: true,
  },
  {
    id: 'prod-torta-3',
    name: 'Torta María Luisa',
    category: 'Tortas',
    price: 65000,
    description: 'Bizcocho de vainilla cubierto con arequipe cero azúcar y mermelada de frutos rojos.',
    imageUrl: '/maria-luisa.png',
    available: true,
  },
  {
    id: 'prod-torta-4',
    name: 'Torta 3 Leches Chocolate',
    category: 'Tortas',
    price: 52000,
    description: 'Esponjoso bizcocho bañado en mezcla de tres leches sin azúcar con cacao orgánico.',
    imageUrl: '/3-leches-chocolate.png',
    available: true,
  },
  {
    id: 'prod-torta-5',
    name: 'Torta Capas Red Velvet',
    category: 'Tortas',
    price: 60000,
    description: 'Clásica Red Velvet saludable con capas de crema chantilly ligera sin azúcar.',
    imageUrl: '/capas-red-velvet.png',
    available: true,
  },
  {
    id: 'prod-torta-6',
    name: 'Torta Guanábana',
    category: 'Tortas',
    price: 58000,
    description: 'Bizcocho suave de vainilla relleno con pulpa natural de guanábana artesanal.',
    imageUrl: '/guanabana.png',
    available: true,
  },
  {
    id: 'prod-postre-1',
    name: 'Marquesa de Brownie',
    category: 'Postres',
    price: 18000,
    description: 'Postre frío de brownie melcochudo keto con crema ligera de chocolate sin glucosa.',
    imageUrl: '/marquesa-de-brownie.png',
    available: true,
  },
  {
    id: 'prod-postre-2',
    name: 'Postre 3 Sabores',
    category: 'Postres',
    price: 16000,
    description: 'Combinación ligera de tres capas de crema artesanal de frutas y chocolate.',
    imageUrl: '/3-sabores.png',
    available: true,
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/admin') || hash === '#admin') return 'admin';
    }
    return 'public';
  });

  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ts_products_catalog');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => ({
              ...item,
              imageUrl: item.imageUrl || DEFAULT_IMAGE_FALLBACK,
              available: typeof item.available === 'boolean' ? item.available : true,
            }));
          }
        }
      } catch (err) {
        console.warn('Cargando catálogo por defecto:', err);
      }
    }
    return initialProducts;
  });

  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Tortas');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState('/matilda.jpeg');
  const [formAvailable, setFormAvailable] = useState(true);

  useEffect(() => {
    const handleLocationSync = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/admin') || hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('public');
      }
    };
    window.addEventListener('hashchange', handleLocationSync);
    window.addEventListener('popstate', handleLocationSync);
    return () => {
      window.removeEventListener('hashchange', handleLocationSync);
      window.removeEventListener('popstate', handleLocationSync);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ts_products_catalog', JSON.stringify(products));
    } catch (err) {
      console.warn('Error al guardar en almacenamiento local:', err);
    }
  }, [products]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', view === 'admin' ? '#admin' : '#');
    }
  };

  const handleToggleProductStatus = (productId) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const nextState = !item.available;
          showToast(
            nextState
              ? `✓ "${item.name}" marcado como DISPONIBLE`
              : `⚠️ "${item.name}" marcado como AGOTADO`
          );
          return { ...item, available: nextState };
        }
        return item;
      })
    );
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormImageUrl(product.imageUrl || DEFAULT_IMAGE_FALLBACK);
    setFormAvailable(product.available);
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Tortas');
    setFormDescription('');
    setFormPrice(35000);
    setFormImageUrl('/matilda.jpeg');
    setFormAvailable(true);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor introduce un nombre para el producto.');
      return;
    }

    let cleanImageUrl = formImageUrl.trim() || DEFAULT_IMAGE_FALLBACK;
    if (cleanImageUrl && !cleanImageUrl.startsWith('/') && !cleanImageUrl.startsWith('http')) {
      cleanImageUrl = '/' + cleanImageUrl;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: formName.trim(),
                category: formCategory,
                description: formDescription.trim(),
                price: Number(formPrice) || 0,
                imageUrl: cleanImageUrl,
                available: formAvailable,
              }
            : item
        )
      );
      showToast(`✓ Cambios guardados para "${formName.trim()}"`);
    } else {
      const newProd = {
        id: `prod-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        price: Number(formPrice) || 0,
        imageUrl: cleanImageUrl,
        available: formAvailable,
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast(`✓ Producto "${formName.trim()}" agregado al catálogo`);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId, productName) => {
    if (confirm(`¿Eliminar "${productName}" del catálogo?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`Producto "${productName}" eliminado`);
    }
  };

  const handleResetCatalog = () => {
    if (confirm('¿Restablecer el catálogo con las rutas originales de GitHub?')) {
      localStorage.removeItem('ts_products_catalog');
      setProducts(initialProducts);
      showToast('✓ Catálogo original restablecido');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== 'Todas' && p.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts = { Todas: products.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.available).length;
    return { total, available, soldOut: total - available };
  }, [products]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E19] flex flex-col font-sans selection:bg-[#2D5A27] selection:text-white">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2D5A27] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-[#428139] animate-bounce">
          <Sparkles size={16} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <button
            onClick={() => navigateTo('public')}
            className="flex items-center gap-3.5 text-left group transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#2D5A27] flex items-center justify-center text-white shadow-md shadow-[#2D5A27]/20 group-hover:scale-105 transition">
              <span className="font-serif text-2xl font-bold">TS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-extrabold text-[#241E19] tracking-tight">
                  Territorio Saludable
                </h1>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-[#EBF3EA] text-[#2D5A27] text-[10px] font-bold">
                  Bucaramanga
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                100% Sin Azúcar Refinada • Sin Gluten • Artesanal
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentView === 'public' ? (
              <button
                type="button"
                onClick={() => navigateTo('admin')}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[#D8CFC4] hover:border-[#2D5A27] text-[#241E19] hover:text-[#2D5A27] text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <SlidersHorizontal size={15} />
                <span>Panel Admin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo('public')}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Store size={15} />
                <span>Ver Catálogo Público</span>
              </button>
            )}

            <a
              href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent('¡Hola Territorio Saludable! Quisiera información de los pedidos.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs transition"
            >
              <Phone size={14} className="text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* CATÁLOGO PÚBLICO */}
      {currentView === 'public' ? (
        <div className="flex-1 flex flex-col">
          <section className="bg-gradient-to-b from-[#FAF7F2] via-[#F4EDE4] to-[#FAF7F2] border-b border-[#EAE2D8] py-8 sm:py-12 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3EA] border border-[#C5DEC3] text-[#2D5A27] text-xs font-bold">
                <ShieldCheck size={14} />
                <span>Pastelería consciente, saludable y deliciosa</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#241E19] tracking-tight leading-tight">
                Disfruta sin culpas de lo que más te gusta
              </h2>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto">
                Tortas artesanales, pan keto sin gluten, detalles para regalar y postres sin azúcar.
              </p>

              <div className="pt-2 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
                  <input
                    type="text"
                    placeholder="Buscar torta, pan, pistacho, brownie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#D8CFC4] focus:outline-none focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm shadow-xs transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="sticky top-20 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8] px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveCategory('Todas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'Todas'
                    ? 'bg-[#2D5A27] text-white shadow-sm'
                    : 'bg-white border border-[#EAE2D8] text-stone-600 hover:border-[#2D5A27] hover:text-[#2D5A27]'
                }`}
              >
                <span>Todas</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === 'Todas' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {categoryCounts['Todas'] || 0}
                </span>
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-[#2D5A27] text-white shadow-sm'
                      : 'bg-white border border-[#EAE2D8] text-stone-600 hover:border-[#2D5A27] hover:text-[#2D5A27]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-[#EAE2D8] overflow-hidden flex flex-col shadow-xs hover:shadow-xl hover:border-[#2D5A27]/40 transition-all duration-300 group"
                >
                  <div className="relative aspect-4/3 w-full bg-[#FAF0E6] overflow-hidden">
                    <img
                      src={product.imageUrl || DEFAULT_IMAGE_FALLBACK}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Evita bucle infinito devolviendo una sola imagen remota segura
                        if (e.currentTarget.src !== DEFAULT_IMAGE_FALLBACK) {
                          e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                        }
                      }}
                      loading="lazy"
                    />

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[#2D5A27] text-[11px] font-bold shadow-xs">
                      {product.category}
                    </span>

                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-xs flex items-center gap-1 ${
                        product.available
                          ? 'bg-[#EBF3EA] text-[#2D5A27] border border-[#C5DEC3]'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {product.available ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                          <span>Disponible</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span>Agotado</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-serif text-lg font-bold text-[#241E19] group-hover:text-[#2D5A27] transition">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F2ECE4] space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                          Precio
                        </span>
                        <span className="font-serif text-xl font-black text-[#2D5A27]">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      {product.available ? (
                        <a
                          href={buildWhatsAppUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 transition cursor-pointer"
                        >
                          <Phone size={16} className="fill-white" />
                          <span>Pedir por WhatsApp</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 text-stone-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-stone-200"
                        >
                          <XCircle size={15} />
                          <span>Agotado Temporariamente</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      ) : (
        /* PANEL DE ADMINISTRACIÓN */
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D8]">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('public')}
                  className="p-2 rounded-xl bg-white border border-[#D8CFC4] hover:bg-stone-50 text-stone-600 transition cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#241E19]">
                  Panel de Administración
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Administra tus productos y cambia estados sin depender de botones de subida.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-amber-600 text-stone-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Restablecer Rutas Originales</span>
              </button>

              <button
                type="button"
                onClick={handleOpenNewModal}
                className="px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus size={15} />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#F2ECE4]">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF0E6] overflow-hidden border border-[#EAE2D8] shrink-0">
                      <img
                        src={product.imageUrl || DEFAULT_IMAGE_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_IMAGE_FALLBACK) {
                            e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                          }
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif font-bold text-base text-[#241E19] truncate">
                          {product.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5 max-w-xl">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-bold text-[#2D5A27]">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-stone-400 font-mono text-[11px] bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200">
                          {product.imageUrl}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold ${product.available ? 'text-[#2D5A27]' : 'text-stone-400'}`}>
                        {product.available ? 'Disponible' : 'Agotado'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(product.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          product.available ? 'bg-[#2D5A27]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ${
                            product.available ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 rounded-xl text-stone-600 hover:text-[#2D5A27] hover:bg-[#EBF3EA] transition cursor-pointer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#241E19]">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Categoría</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Precio (COP) *</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-bold text-[#2D5A27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ruta de Imagen (de la carpeta public de GitHub)</label>
                <input
                  type="text"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Ej: /matilda.jpeg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 font-mono text-xs"
                />
                
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    { label: 'Matilda', path: '/matilda.jpeg' },
                    { label: 'Luna Almendras', path: '/luna-de-almendras.png' },
                    { label: 'María Luisa', path: '/maria-luisa.png' },
                    { label: '3 Leches', path: '/3-leches-chocolate.png' },
                    { label: 'Red Velvet', path: '/capas-red-velvet.png' },
                    { label: 'Guanábana', path: '/guanabana.png' },
                  ].map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => setFormImageUrl(item.path)}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-100 border border-stone-200 font-mono"
                    >
                      {item.path}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
