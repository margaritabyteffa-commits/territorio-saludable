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
  SlidersHorizontal,
  Instagram,
  Facebook,
  Clock,
  MapPin,
  Info
} from 'lucide-react';

const WHATSAPP_PHONE_NUMBER = '573158894210';
const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';

const CATEGORIES = [
  { id: 'Todas', name: 'Todo el Menú', icon: '✨' },
  { id: 'Tortas', name: 'Tortas Saludables', icon: '🍰' },
  { id: 'Detalles', name: 'Catálogo de Detalles', icon: '🎁' },
  { id: 'Pan', name: 'Pan Saludable', icon: '🍞' },
  { id: 'Postres', name: 'Postres Saludables', icon: '🧁' },
  { id: 'Mercadito', name: 'Mercadito', icon: '🛒' },
];

const TAG_FILTERS = [
  'Todos los productos',
  '100% Sin Azúcar',
  'Sin Gluten',
  'Keto Friendly',
  'Entrega Hoy (Sin espera)',
  'Tortas con Anticipación'
];

const formatPrice = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const initialProducts = [
  {
    id: 'prod-1',
    name: 'Torta Matilda',
    category: 'Tortas',
    price: 65000,
    portion: '5 porc',
    anticipation: 'Anticipación: 1 día',
    tags: ['100% Sin Azúcar', 'Sin Gluten', 'Apto Diabéticos'],
    description: 'Bizcochuelo libre de gluten con dos capas de arequipe cero azúcar y cobertura de cacao.',
    imageUrl: '/matilda.jpeg',
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Luna de Almendras',
    category: 'Tortas',
    price: 46000,
    portion: '5 porc',
    anticipation: 'Anticipación: 1 día',
    tags: ['100% Sin Azúcar', 'Sin Gluten', 'Keto Friendly'],
    description: 'Torta suave a base de harina de almendras selectas, semillas y toque sutil de vainilla.',
    imageUrl: '/luna-de-almendras.png',
    available: true,
  },
  {
    id: 'prod-3',
    name: 'Torta María Luisa',
    category: 'Tortas',
    price: 65000,
    portion: '5 porc',
    anticipation: 'Anticipación: 1 día',
    tags: ['100% Sin Azúcar', 'Sin Gluten'],
    description: 'Bizcocho de vainilla cubierto con arequipe cero azúcar y mermelada de frutos rojos.',
    imageUrl: '/maria-luisa.png',
    available: true,
  },
  {
    id: 'prod-4',
    name: 'Torta 3 Leches Chocolate',
    category: 'Tortas',
    price: 52000,
    portion: '5 porc',
    anticipation: 'Entrega Hoy (Sin espera)',
    tags: ['100% Sin Azúcar', 'Sin Gluten'],
    description: 'Esponjoso bizcocho bañado en mezcla de tres leches sin azúcar con cacao orgánico.',
    imageUrl: '/3-leches-chocolate.png',
    available: true,
  },
  {
    id: 'prod-5',
    name: 'Torta Capas Red Velvet',
    category: 'Tortas',
    price: 60000,
    portion: '5 porc',
    anticipation: 'Anticipación: 1 día',
    tags: ['100% Sin Azúcar', 'Sin Gluten'],
    description: 'Clásica Red Velvet saludable con capas de crema chantilly ligera sin azúcar.',
    imageUrl: '/capas-red-velvet.png',
    available: true,
  },
  {
    id: 'prod-6',
    name: 'Torta Guanábana',
    category: 'Tortas',
    price: 58000,
    portion: '5 porc',
    anticipation: 'Anticipación: 1 día',
    tags: ['100% Sin Azúcar', 'Sin Gluten'],
    description: 'Bizcocho suave de vainilla relleno con pulpa natural de guanábana artesanal.',
    imageUrl: '/guanabana.png',
    available: true,
  },
  {
    id: 'prod-7',
    name: 'Marquesa de Brownie',
    category: 'Postres',
    price: 18000,
    portion: 'Individual',
    anticipation: 'Entrega Hoy (Sin espera)',
    tags: ['100% Sin Azúcar', 'Keto Friendly'],
    description: 'Postre frío de brownie melcochudo keto con crema ligera de chocolate.',
    imageUrl: '/marquesa-de-brownie.png',
    available: true,
  },
  {
    id: 'prod-8',
    name: 'Postre 3 Sabores',
    category: 'Postres',
    price: 16000,
    portion: 'Individual',
    anticipation: 'Entrega Hoy (Sin espera)',
    tags: ['100% Sin Azúcar', 'Sin Gluten'],
    description: 'Combinación ligera de tres capas de crema artesanal de frutas y chocolate.',
    imageUrl: '/3-sabores.png',
    available: true,
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState('public');
  const [products, setProducts] = useState(initialProducts);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [activeTag, setActiveTag] = useState('Todos los productos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortions, setSelectedPortions] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ts_products_catalog_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        }
      } catch (e) {
        console.warn('Cargando catálogo por defecto');
      }
    }
  }, []);

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ts_products_catalog');
      localStorage.removeItem('ts_products_catalog_v2');
    }
    setProducts(initialProducts);
    alert('Catálogo actualizado con las imágenes de GitHub.');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== 'Todas' && p.category !== activeCategory) return false;
      if (activeTag !== 'Todos los productos') {
        if (activeTag === 'Entrega Hoy (Sin espera)' && !p.anticipation?.includes('Entrega Hoy')) return false;
        if (activeTag === 'Tortas con Anticipación' && !p.anticipation?.includes('Anticipación')) return false;
        if (!p.tags?.includes(activeTag) && !p.anticipation?.includes(activeTag)) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      }
      return true;
    });
  }, [products, activeCategory, activeTag, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] font-sans">
      {/* BARRA SUPERIOR VERDE */}
      <div className="bg-[#1E3A1E] text-white text-[11px] font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Pastelería Artesanal 100% Sin Azúcar Refinada y Sin Gluten en Bucaramanga</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100">
            <span className="flex items-center gap-1"><Clock size={12} /> Lunes a Viernes: 8am - 6pm</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> Bucaramanga y Área Metropol.</span>
          </div>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
      <header className="bg-[#FDFBF7] border-b border-[#EFE8DC] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2D5A27] flex items-center justify-center text-white text-xl font-serif font-bold shadow-md">
              🌱
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#1E3A1E] tracking-tight">
                Territorio Saludable
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-[#8C6B58] uppercase">
                Pastelería Sana • Pedidos WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"><Instagram size={16} /></a>
            <a href="https://facebook.com" target="_blank" className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"><Facebook size={16} /></a>
            <a href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`} target="_blank" className="px-3.5 py-1.5 rounded-full bg-[#EBF5EA] text-[#2D5A27] font-bold text-xs flex items-center gap-1.5 border border-[#C2E0C0]">
              <Phone size={14} className="text-[#25D366]" />
              <span>315 889 4210</span>
            </a>
            <button onClick={handleReset} className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold flex items-center gap-1 hover:bg-stone-800">
              <RefreshCw size={12} />
              <span>Restablecer Vercel</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION AI STUDIO */}
      <section className="py-10 px-4 text-center bg-gradient-to-b from-[#FDFBF7] via-[#F8F3EA] to-[#FDFBF7] border-b border-[#EFE8DC]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5EA] text-[#2D5A27] text-xs font-bold border border-[#C2E0C0]">
            <span>✨ Pastelería Saludable en Bucaramanga & Área Metropolitana</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#1E3A1E] leading-tight">
            El placer de lo dulce, <span className="italic font-normal text-[#2D5A27]">100% sin azúcar</span> y libre de gluten.
          </h2>

          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            Tortas artesanales en capas, panes de masa madre fit, postres individuales y detalles únicos. Endulzados con fruto del monje y stevia pura.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-stone-600">
            <span className="px-3 py-1 bg-white rounded-full border border-stone-200 shadow-2xs">✓ 0% Azúcar refinada</span>
            <span className="px-3 py-1 bg-white rounded-full border border-stone-200 shadow-2xs">✓ 100% Libres de gluten</span>
            <span className="px-3 py-1 bg-white rounded-full border border-stone-200 shadow-2xs">♡ Aptas para diabéticos</span>
            <span className="px-3 py-1 bg-white rounded-full border border-stone-200 shadow-2xs">🕒 Tortas con 1 día de anticipación</span>
          </div>

          {/* BUSCADOR */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, sabor o ingrediente (ej. Arequipe, Pistacho, Pan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E0D6C8] focus:outline-none focus:border-[#2D5A27] text-sm shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS TABS */}
      <section className="bg-[#FDFBF7] border-b border-[#EFE8DC] sticky top-[73px] z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-[#2D5A27] text-white shadow-sm'
                  : 'bg-white border border-[#EFE8DC] text-stone-700 hover:border-[#2D5A27]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FILTROS SECUNDARIOS (ETIQUETAS) */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTag === tag
                  ? 'bg-[#8C4A32] text-white'
                  : 'bg-[#F2ECE1] text-[#6E5A4F] hover:bg-[#E8DFC2]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* TARJETAS DE PRODUCTOS AI STUDIO */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-[#EFE8DC] overflow-hidden flex flex-col shadow-xs hover:shadow-md transition group"
            >
              {/* Imagen con Badges de AI Studio */}
              <div className="relative aspect-4/3 w-full bg-[#FAF5ED] overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                  }}
                />

                {/* Badge Superior Izquierda: Anticipación */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                  <Clock size={11} className="text-amber-300" />
                  <span>{product.anticipation || 'Entrega Hoy'}</span>
                </span>

                {/* Badge Superior Derecha: Info */}
                <span className="absolute top-3 right-3 p-1 rounded-full bg-white/80 text-stone-700 shadow-xs">
                  <Info size={14} />
                </span>

                {/* Overlay Inferior: Categoría y Precio */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white font-extrabold text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-black/40 backdrop-blur-xs uppercase tracking-wider text-[10px]">
                    {product.category}
                  </span>
                  <span className="font-serif text-lg font-black drop-shadow-md">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-[#1E3A1E]">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>

                  {/* Badges de etiquetas (Keto, Sin Azúcar, etc.) */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {product.tags?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-[#F5F0E6] text-[#6E5A4F] text-[10px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selección de Tamaño / Porciones */}
                <div className="pt-2 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                    <span>Elegir Tamaño / Porciones:</span>
                    <span className="text-[#2D5A27]">{product.portion}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {['5 porc', '8 porc', '12 porc'].map((porc) => (
                      <button
                        key={porc}
                        onClick={() => setSelectedPortions({ ...selectedPortions, [product.id]: porc })}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition border ${
                          (selectedPortions[product.id] || product.portion) === porc
                            ? 'bg-[#1E3A1E] text-white border-[#1E3A1E]'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        {porc}
                      </button>
                    ))}
                  </div>

                  {/* Botón Verde Pedir por WhatsApp */}
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(`¡Hola Territorio Saludable! 👋🍰 Quiero pedir: ${product.name} (${selectedPortions[product.id] || product.portion})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Phone size={15} className="fill-white" />
                    <span>Pedir por WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
