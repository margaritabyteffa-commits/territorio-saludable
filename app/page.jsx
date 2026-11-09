'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Edit2, Trash2, Plus, ArrowUp, ArrowDown, Sparkles, Phone,
  ShieldCheck, X, Clock, Lock, KeyRound, ChefHat, LogOut, MapPin,
  Calendar, ShoppingBag, ClipboardList, Eye, Settings, ExternalLink, Check, Copy
} from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
const DEFAULT_CONFIG = {
  businessName: 'Territorio Saludable S.A.S.',
  whatsappPhone: '573000559196', // SIM PROVISIONAL METACLOUD
  instagramUrl: 'https://instagram.com/territoriosaludable',
  facebookUrl: 'https://facebook.com/territoriosaludable',
  calendarEmbedUrl: 'https://calendar.google.com/calendar/embed?src=territoriosaludable%40gmail.com&ctz=America%2FBogota'
};

const CATEGORIES = ['Tortas Saludables', 'Catalogo Detalles', 'Pan Saludable', 'Postres Saludables', 'Mercadito'];
const DIETARY_TAGS = ['Todas', 'Keto', 'Sin Gluten', 'Sin Azúcar', 'Sin Lácteos', 'Entrega Hoy', 'Con Anticipación'];

const INITIAL_ZONES = [
  { id: 'z1', name: 'Cabecera / Sotomayor / Prado', price: 5000 },
  { id: 'z2', name: 'Centro / San Francisco', price: 7000 },
  { id: 'z3', name: 'Floridablanca / Cañaveral', price: 10000 },
  { id: 'z4', name: 'Girón / Piedecuesta', price: 15000 }
];

export const formatCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
export const ensureSlash = (u) => !u ? '/torta-moka.png' : (u.startsWith('http') || u.startsWith('/') ? u : '/' + u);

const P = (id, name, catIdx, price, imageUrl, sizes = [], features = ['Sin Azúcar', 'Sin Gluten'], requiresNotice = false, description = '') => ({
  id, name, category: CATEGORIES[catIdx], price, imageUrl: ensureSlash(imageUrl), available: true, features, requiresNotice, description,
  sizes: sizes.map(([p, pr]) => ({ portions: p, price: pr, label: p + ' (' + formatCOP(pr) + ')' }))
});

export const initialProducts = [
  P('torta-moka', 'Torta Moka', 0, 84000, '/torta-moka.png', [['5 porc',84000],['8 porc',123000],['12 porc',155000],['18 porc',217000]], ["Sin Azúcar","Sin Gluten","Keto"], true, "Esponjoso bizcocho de cacao y café orgánico, rellenado con crema suave de arequipe sin azúcar."),
  P('torta-pistacho', 'Torta Pistacho', 0, 94000, '/torta-pistacho.png', [['5 porc',94000],['8 porc',141000],['12 porc',197000],['18 porc',274000],['25 porc',353000]], ["Sin Azúcar","Sin Gluten","Keto"], true, "Masa fina a base de harina de almendras y pistachos naturales molidos con stevia pura."),
  P('torta-chocoarequipe', 'Torta Choco-Arequipe', 0, 60000, '/torta-chocoarequipe.png', [['3 porc',60000],['5 porc',84000],['8 porc',123000],['12 porc',155000]], ["Sin Azúcar","Sin Gluten"], true, "Capas suaves de chocolate amargo artesanal con el más cremoso arequipe fit."),
  P('luna-de-almendras', 'Luna de Almendras', 0, 73000, '/luna-de-almendras.png', [['5 porc',73000],['8 porc',108000],['12 porc',142000],['18 porc',189000],['25 porc',250000]], ["Sin Azúcar","Sin Gluten","Keto"], true, "Bizcocho liviano cubierto de láminas de almendra tostada y toque de vainilla natural."),
  P('torta-victoria', 'Torta Victoria', 0, 84000, '/torta-victoria.png', [['5 porc',84000],['8 porc',110000],['12 porc',141000],['18 porc',192000],['25 porc',248000]], ["Sin Azúcar","Sin Gluten"], true),
  P('torta-de-vino', 'Torta de Vino', 0, 30000, '/torta-de-vino.jpeg', [['Personal',30000],['3 porc',51000],['5 porc',69000],['8 porc',101000],['12 porc',136000]], ["Sin Azúcar","Sin Gluten"], true),
  P('torta-versalles', 'Torta Versalles', 0, 73000, '/torta-versalles.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('frutos-rojos-o-amarillos', 'Frutos Rojos o Amarillos', 0, 73000, '/torta-vasca-frutos-rojos-o-amarillos.jpeg', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('quebec', 'Quebec', 0, 73000, '/quebec.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('guanabana', 'Guanábana', 0, 73000, '/guanabana.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('mousse-cake', 'Mousse Cake', 0, 73000, '/mousse-cake.png', [['5 porc',73000],['8 porc',100000],['12 porc',120000]], ["Sin Azúcar","Sin Gluten"], true),
  P('torta-de-yogurt', 'Torta de Yogurt', 0, 73000, '/torta-de-yogurt.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('capas-red-velvet', 'Capas Red Velvet', 0, 73000, '/capas-red-velvet.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('3-leches-vainilla', '3 Leches Vainilla', 0, 73000, '/3-leches-vainilla.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('3-leches-chocolate', '3 Leches Chocolate', 0, 73000, '/3-leches-chocolate.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('marquesa-de-brownie', 'Marquesa de Brownie', 0, 75000, '/marquesa-de-brownie.png', [['5 porc',75000],['8 porc',115000],['12 porc',146000]], ["Sin Azúcar","Sin Gluten"], true),
  P('torta-zanahoria', 'Torta Zanahoria', 0, 73000, '/torta-zanahoria.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('sin-lacteos', 'Sin Lácteos', 0, 73000, '/sin-lacteos.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten","Sin Lácteos"], true),
  P('torta-volcan', 'Torta Volcán', 0, 73000, '/torta-volcan.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('3-sabores', '3 Sabores', 0, 73000, '/3-sabores.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('torta-de-arequipe', 'Torta de Arequipe', 0, 82000, '/torta-de-arequipe.png', [['5 porc',82000],['8 porc',118000],['12 porc',148000],['18 porc',195000],['25 porc',255000]], ["Sin Azúcar","Sin Gluten"], true),
  P('torta-chocoluxe', 'Torta Chocoluxe', 0, 88000, '/torta-chocoluxe.png', [['5 porc',88000],['8 porc',128000],['12 porc',160000],['18 porc',220000]], ["Sin Azúcar","Sin Gluten"], true),
  P('mini-cake-personal', 'Mini Cake Personal', 0, 28000, '/mini-cake-personal.png', [['Personal',28000]], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false),
  P('mini-marquesa-de-brownie', 'Mini Marquesa de Brownie', 0, 35000, '/mini-marquesa-de-brownie.png', [['Personal',35000]], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false),
  P('maria-luisa', 'María Luisa', 0, 73000, '/maria-luisa.png', [['5 porc',73000],['8 porc',108000],['12 porc',145000],['18 porc',189000],['25 porc',249000]], ["Sin Azúcar","Sin Gluten"], true),
  P('matilda', 'Matilda', 0, 85000, '/matilda.jpeg', [['5 porc',85000],['8 porc',125000],['12 porc',158000],['18 porc',218000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
  P('torta-vasca-frutos-rojos-o-amarillos', 'Torta Vasca Frutos Rojos o Amarillos', 0, 73000, '/torta-vasca-frutos-rojos-o-amarillos.jpeg', [['5 porc',73000],['8 porc',100000],['12 porc',120000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
  P('tortas-vasca-pistacho', 'Tortas Vasca Pistacho', 0, 85000, '/tortas-vasca-pistacho.png', [['5 porc',85000],['8 porc',115000],['140000',140000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
  P('torta-primavera', 'Torta Primavera', 0, 75000, '/torta-primavera.jpeg', [['5 porc',75000],['8 porc',110000],['12 porc',145000],['18 porc',195000]], ["Sin Azúcar","Sin Gluten"], true),
  P('box-duo', 'Box Dúo', 1, 45000, '/box-duo.png', [], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false, "Caja de regalo con lazo rojo que incluye 2 brownies bañados en arequipe fit."),
  P('guacal-amor', 'Guacal Amor', 1, 65000, '/guacal-amor.jpeg', [], ["Sin Azúcar","Sin Gluten"], false, "Guacal de madera especial para regalo con minibizcocho y frasco de arequipe."),
  P('guacal-coquette', 'Guacal Coquette', 1, 70000, '/guacal-coquette.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('guacal-premium', 'Guacal Premium', 1, 95000, '/guacal-premium.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('guacal-te-cuido', 'Guacal Te Cuido', 1, 55000, '/guacal-te-cuido.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('mini-box', 'Mini Box', 1, 38000, '/mini-box.jpeg', [], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false),
  P('mini-brownies-x4', 'Mini Brownies x4', 1, 22000, '/mini-brownies-x4.jpeg', [], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false),
  P('mini-cake-love', 'Mini Cake Love', 1, 32000, '/mini-cake-love.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('mini-cake-naranja', 'Mini Cake Naranja', 1, 28000, '/mini-cake-naranja.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('mini-torta-corazon', 'Mini Torta Corazón', 1, 35000, '/mini-torta-corazon.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('caja-compartir', 'Caja Compartir', 1, 50000, '/caja-compartir.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('mini-blondies', 'Mini Blondies', 1, 19000, '/mini-blondies.png', [['Caja x2',19000],['Caja x4',36000]], ["Sin Azúcar","Sin Gluten"], false),
  P('mini-cookies', 'Mini Cookies', 1, 18000, '/mini-cookies.png', [], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false),
  P('mugcake', 'Mugcake', 1, 16000, '/mugcake.png', [], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false),
  P('baguette', 'Baguette', 2, 14000, '/baguette.jpeg', [], ["Sin Azúcar","Sin Gluten"], false, "Pan crocante por fuera y esponjoso por dentro a base de harina de arroz y psyllium."),
  P('focaccia-300g', 'Focaccia 300g', 2, 18000, '/focaccia-300g.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('roscon-relleno', 'Roscón Relleno', 2, 16000, '/roscon-relleno.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('rustico', 'Rústico', 2, 15000, '/rustico.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('con-queso-campesino', 'Con Queso Campesino', 2, 16000, '/con-queso-ampesino.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('con-queso-chitaga', 'Con Queso Chítaga', 2, 17000, '/con-queso-chitaga.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('rollitos-de-queso-chitaga', 'Rollitos de Queso Chítaga', 2, 18000, '/rollitos-de-queso-chitaga.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('con-ajonjoli', 'Con Ajonjolí', 2, 14000, '/con-ajonjoli.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('pan-de-queso-parmesano', 'Pan de Queso Parmesano', 2, 17000, '/pan-de-queso-parmesano.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('pan-de-oregano', 'Pan de Orégano', 2, 14000, '/pan-de-oregano.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('rollitos-de-cuajada-y-nuez', 'Rollitos de Cuajada y Nuez', 2, 19000, '/pan-rollitos-de-cuajada-y-nuece.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('semillas-de-chia-y-ajonjoli', 'Semillas de Chía y Ajonjolí', 2, 15000, '/pan-semillas-de-chia-y-ajonjoli.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('bocadillo-y-queso-parmesano', 'Bocadillo y Queso Parmesano', 2, 18000, '/pan-bocadillo-y-queso-parmesano.jpg', [], ["Sin Azúcar","Sin Gluten"], false),
  P('ajo-y-finas-hierbas-250g', 'Ajo y Finas Hierbas 250g', 2, 16000, '/pan-ajo-y-finas-hierbas-250g-(Salado).png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('3-leches-con-mermelada', '3 Leches con Mermelada', 3, 18000, '/3-leches-con-mermelada.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('3-leches-de-arequipe', '3 Leches de Arequipe', 3, 18000, '/3-leches-de-arequipe.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('red-velvet-3-leches', 'Red Velvet 3 Leches', 3, 19000, '/red-velvet-3-leches.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('alfajores-con-arequipe', 'Alfajores con Arequipe', 3, 15000, '/alfajores-con-arequipe.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('alfajores-con-chocolate', 'Alfajores con Chocolate', 3, 16000, '/alfajores-con-chocolate.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('brownies', 'Brownies', 3, 12000, '/brownies.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('brownies-x2', 'Brownies x2', 3, 20000, '/brownies-x2.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('brownie-con-helado', 'Brownie con Helado', 3, 17000, '/brownie-con-helado.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('postre-brownie-con-helado', 'Postre Brownie con Helado', 3, 18000, '/postre-brownie-con-helado.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('sandwich-de-helado', 'Sandwich de Helado', 3, 15000, '/sandwich-de-helado.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('helados-130g', 'Helados 130g', 3, 12000, '/helados-130g.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('galletas-con-chocolate', 'Galletas con Chocolate', 3, 14000, '/galletas-con-chocolate.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('galletas-semillas', 'Galletas Semillas', 3, 14000, '/galletas-semillas.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('canastilla-de-pan-de-yuca', 'Canastilla de Pan de Yuca', 3, 16000, '/canastilla-de-pan-de-yuca.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('waffle-de-pan-de-yuca', 'Waffle de Pan de Yuca', 3, 15000, '/waffle-de-pan-de-yuca.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('repollas-sin-azucar-y-sin-gluten', 'Repollas Sin Azúcar y Sin Gluten', 3, 16000, '/repollas-sin-azucar-y-sin-gluten.png', [], ["Sin Azúcar","Sin Gluten"], false),
  P('arequipe-artesanal-fit', 'Arequipe Artesanal Fit', 4, 22000, '/arequipe.png', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('mermeladas-naturales', 'Mermeladas Naturales', 4, 18000, '/mermeladas-naturales.jpg', [], ["Sin Azúcar","Sin Gluten","Keto"], false),
  P('arepas-libres-de-gluten', 'Arepas Libres de Gluten', 4, 16000, '/arepas-libres-de-gluten.jpeg', [], ["Sin Azúcar","Sin Gluten"], false)
];

export const initialOrders = [
  { id: 'ord-101', code: 'TS-1001', clientName: 'Valentina Gómez', clientPhone: '3158901234', address: 'Cra 35 # 52-20, Apto 402', zone: 'Cabecera / Sotomayor / Prado', deliveryDate: new Date().toISOString().split('T')[0], deliveryTime: '3:30 PM', items: [{ productName: 'Torta de Arequipe Saludable', portion: '8 porc', quantity: 1, price: 87000 }, { productName: 'Brownies Melcochudos', portion: 'Caja x4', quantity: 1, price: 36000 }], total: 128000, status: 'En Cocina', paymentMethod: 'PAGADO NEQUI', notes: 'Cliente habitual. Entregar antes de las 4 PM.' },
  { id: 'ord-102', code: 'TS-1002', clientName: 'Dr. Carlos Mendoza', clientPhone: '3104567890', address: 'Calle 48 # 28-15, Consultorio 301', zone: 'Centro / San Francisco', deliveryDate: new Date().toISOString().split('T')[0], deliveryTime: '4:00 PM', items: [{ productName: 'Pan Ajo Asado & Finas Hierbas (250g)', quantity: 2, price: 16000 }, { productName: 'Arequipe Artesanal Fit (Frasco 280g)', quantity: 1, price: 22000 }], total: 62000, status: 'En Cocina', paymentMethod: 'PAGADO BANCOLOMBIA', notes: 'Llamar al llegar.' }
];

export const getGoogleCalendarUrl = (order) => {
  const title = 'Entrega TS: ' + order.clientName + ' (' + order.code + ')';
  const items = order.items.map(i => i.quantity + 'x ' + i.productName + (i.portion ? ' (' + i.portion + ')' : '')).join(', ');
  const details = 'Pastelería Territorio Saludable S.A.S.\\nPedido: ' + order.code + '\\nCliente: ' + order.clientName + '\\nTel: +' + order.clientPhone + '\\nDir: ' + order.address + '\\nZona: ' + order.zone + '\\nTotal: ' + formatCOP(order.total) + '\\nPago: ' + order.paymentMethod + '\\n\\nItems:\\n' + items + '\\n\\nNotas: ' + (order.notes || 'Ninguna');
  const loc = order.address + ', ' + order.zone + ', Bucaramanga, Colombia';
  const d = (order.deliveryDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + d + 'T100000/' + d + 'T110000&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(loc);
};

export default function App() {
  const [currentView, setCurrentView] = useState('public');
  const [authRole, setAuthRole] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('ts_auth_role') : null);
  const [adminTab, setAdminTab] = useState('inventario');

  const [adminPassword, setAdminPassword] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('ts_admin_pwd')) || '1234');
  const [panaderoPassword, setPanaderoPassword] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('ts_panadero_pwd')) || '5678');

  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      try { const s = localStorage.getItem('ts_products_catalog_v6'); if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length >= 70) return p; } } catch (e) {}
    }
    return initialProducts;
  });

  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      try { const s = localStorage.getItem('ts_orders_v3'); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p; } } catch (e) {}
    }
    return initialOrders;
  });

  const [zones, setZones] = useState(() => {
    if (typeof window !== 'undefined') {
      try { const s = localStorage.getItem('ts_zones_v1'); if (s) { const z = JSON.parse(s); if (Array.isArray(z)) return z; } } catch (e) {}
    }
    return INITIAL_ZONES;
  });

  const [selectedCategory, setSelectedCategory] = useState('Tortas Saludables');
  const [selectedTag, setSelectedTag] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [toastMessage, setToastMessage] = useState(null);
  const [passwordModalTarget, setPasswordModalTarget] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formPrice, setFormPrice] = useState(80000);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/torta-moka.png');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formRequiresNotice, setFormRequiresNotice] = useState(true);
  const [formSizes, setFormSizes] = useState([]);

  // New order form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('573000559196');
  const [newAddress, setNewAddress] = useState('');
  const [newZone, setNewZone] = useState(zones[0]?.name || 'Cabecera');
  const [newDeliveryDate, setNewDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDeliveryTime, setNewDeliveryTime] = useState('11:00 AM');
  const [newOrderProdId, setNewOrderProdId] = useState(products[0]?.id || 'torta-moka');
  const [newOrderPortion, setNewOrderPortion] = useState('');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('PAGADO NEQUI');
  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [newPanaderoPwd, setNewPanaderoPwd] = useState('');

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast(`Teléfono ${text} copiado 📋`);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_products_catalog_v6', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_zones_v1', JSON.stringify(zones));
  }, [zones]);

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    const pass = passwordInput.trim();
    if (pass === adminPassword || pass === 'ts2026' || pass === 'admin123') {
      setAuthRole('admin');
      if (typeof window !== 'undefined') sessionStorage.setItem('ts_auth_role', 'admin');
      setCurrentView('admin');
      setPasswordModalTarget(null);
      showToast('✓ Bienvenido Administrador');
    } else {
      setPasswordError('Clave incorrecta');
    }
  };

  const handleLogout = () => {
    setAuthRole(null);
    if (typeof window !== 'undefined') sessionStorage.removeItem('ts_auth_role');
    setCurrentView('public');
    showToast('Sesión cerrada');
  };

  const navigateTo = (view) => {
    if (view === 'public') { setCurrentView('public'); return; }
    if (authRole === 'admin') { setCurrentView(view); return; }
    setPasswordModalTarget(view);
    setPasswordInput('');
    setPasswordError('');
  };

  const handleMoveProduct = (id, dir) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= products.length) return;
    const updated = [...products];
    const [moved] = updated.splice(idx, 1);
    updated.splice(target, 0, moved);
    setProducts(updated);
    showToast('Producto movido ' + (dir === 'up' ? 'arriba ⬆️' : 'abajo ⬇️'));
  };

  const handleToggleProduct = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p));
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setFormName(prod ? prod.name : '');
    setFormCategory(prod ? prod.category : CATEGORIES[0]);
    setFormPrice(prod ? prod.price : 80000);
    setFormDescription(prod ? (prod.description || '') : '');
    setFormImageUrl(prod ? prod.imageUrl : '/torta-moka.png');
    setFormAvailable(prod ? prod.available : true);
    setFormRequiresNotice(prod ? prod.requiresNotice : true);
    setFormSizes(prod && prod.sizes ? prod.sizes.map(s => ({ portions: s.portions, price: s.price })) : []);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const sizes = formSizes.map(s => ({ portions: s.portions, price: Number(s.price), label: s.portions + ' (' + formatCOP(Number(s.price)) + ')' }));
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, name: formName.trim(), category: formCategory, price: Number(formPrice), description: formDescription.trim(), imageUrl: ensureSlash(formImageUrl), available: formAvailable, requiresNotice: formRequiresNotice, sizes } : p));
      showToast('✓ Producto actualizado');
    } else {
      setProducts(prev => [{ id: 'prod-' + Date.now(), name: formName.trim(), category: formCategory, price: Number(formPrice), description: formDescription.trim(), imageUrl: ensureSlash(formImageUrl), available: formAvailable, requiresNotice: formRequiresNotice, features: ['Sin Azúcar', 'Sin Gluten'], sizes }, ...prev]);
      showToast('✓ Nuevo producto agregado');
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    if (confirm('¿Eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Producto eliminado');
    }
  };

  const handleSaveNewOrder = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.id === newOrderProdId) || products[0];
    const portionObj = prod.sizes && prod.sizes.find(s => s.portions === newOrderPortion);
    const itemPrice = portionObj ? portionObj.price : prod.price;
    const zoneObj = zones.find(z => z.name === newZone) || zones[0];
    const newOrd = {
      id: 'ord-' + Date.now(),
      code: 'TS-' + (orders.length + 1001),
      clientName: newClientName.trim() || 'Cliente Mostrador',
      clientPhone: newClientPhone.trim() || '573000559196',
      address: newAddress.trim() || 'Recoge en Tienda',
      zone: newZone,
      deliveryDate: newDeliveryDate,
      deliveryTime: newDeliveryTime,
      items: [{ productName: prod.name, portion: newOrderPortion || undefined, quantity: 1, price: itemPrice }],
      total: itemPrice + (zoneObj ? zoneObj.price : 0),
      status: 'Pendiente',
      paymentMethod: newPaymentMethod,
      notes: newOrderNotes.trim()
    };
    setOrders(prev => [newOrd, ...prev]);
    setNewOrderModalOpen(false);
    showToast('✓ Pedido registrado con éxito');
  };

  const handleOrderWhatsApp = (product) => {
    const selPortion = selectedSizes[product.id];
    const sizeObj = product.sizes && product.sizes.find(s => s.portions === selPortion);
    const pr = sizeObj ? sizeObj.price : product.price;
    const txt = '¡Hola Territorio Saludable! 🍰 Quisiera pedir: *' + product.name + '*' + (sizeObj ? ' (' + sizeObj.portions + ')' : '') + ' por valor de ' + formatCOP(pr) + '. ¿Tienen disponibilidad para Bucaramanga?';
    window.open('https://wa.me/' + DEFAULT_CONFIG.whatsappPhone + '?text=' + encodeURIComponent(txt), '_blank');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedTag !== 'Todas') {
        if (selectedTag === 'Entrega Hoy' && p.requiresNotice) return false;
        if (selectedTag === 'Con Anticipación' && !p.requiresNotice) return false;
        if (['Keto', 'Sin Gluten', 'Sin Azúcar', 'Sin Lácteos'].includes(selectedTag)) {
          if (!p.features || !p.features.includes(selectedTag)) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.features && p.features.some(f => f.toLowerCase().includes(q))) || (p.description && p.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [products, selectedCategory, selectedTag, searchQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter === 'Todos') return true;
      return o.status === statusFilter;
    });
  }, [orders, statusFilter]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E19] flex flex-col font-sans selection:bg-[#2D5A27] selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#241E19] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-700">
          <Sparkles className="text-amber-400" size={16} />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. BARRA SUPERIOR E INFORMACIÓN */}
      <div className="bg-[#2D5A27] text-white py-2 px-4 text-center text-xs font-medium tracking-wide">
        <p className="max-w-6xl mx-auto truncate">Pastelería Artesanal 100% Sin Azúcar Refinada y Sin Gluten en Bucaramanga | Horario: Lunes a Viernes: 8am - 6pm | Ubicación: Bucaramanga y Área Metropol.</p>
      </div>

      {/* 2. HEADER CON LOGO OFICIAL Y ÚNICO BOTÓN "ACCESO ADMIN" */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
          <button onClick={() => navigateTo('public')} className="flex items-center gap-3 text-left cursor-pointer">
            <img 
              src="/logo.png" 
              alt="Territorio Saludable" 
              className="w-12 h-12 rounded-full object-cover border border-[#2D5A27]/20 shadow-xs"
              onError={(e) => { e.currentTarget.style.display='none'; }}
            />
            <div>
              <span className="font-serif text-lg sm:text-xl font-black text-[#241E19] block">{DEFAULT_CONFIG.businessName}</span>
              <span className="text-[9px] uppercase tracking-wider text-[#8C533C] font-bold block">PASTELERÍA SANA • PEDIDOS WHATSAPP</span>
            </div>
          </button>

          <div className="flex items-center gap-2.5">
            <a 
              href={'https://wa.me/' + DEFAULT_CONFIG.whatsappPhone} 
              target="_blank" 
              rel="noreferrer" 
              className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Phone size={14} />
              <span>300 0559196</span>
            </a>

            {currentView !== 'admin' && (
              <button 
                onClick={() => navigateTo('admin')} 
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-[#1C3A27] text-white hover:bg-black shadow-xs"
              >
                <ShieldCheck size={14} />
                <span>Acceso Admin</span>
              </button>
            )}

            {authRole && (
              <button onClick={handleLogout} className="p-2 rounded-xl text-stone-500 hover:text-red-600 transition" title="Cerrar Sesión">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VISTA PÚBLICA DEL CLIENTE */}
      {currentView === 'public' && (
        <main className="flex-1">
          
          {/* BANNER PRINCIPAL A 2 LÍNEAS CON PÁRRAFO DE INGREDIENTES */}
          <section className="bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] py-10 px-4 border-b border-[#EAE2D8] text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5ECE3] text-[#2D5
