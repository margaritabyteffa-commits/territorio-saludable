'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Edit2, Trash2, Plus, ArrowUp, ArrowDown, Sparkles, Phone,
  ShieldCheck, X, Clock, Lock, KeyRound, ChefHat, LogOut, MapPin,
  Calendar, ShoppingBag, ClipboardList, Eye, Settings, ExternalLink, Check
} from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
const DEFAULT_CONFIG = {
  businessName: 'Territorio Saludable S.A.S.',
  whatsappPhone: '573158894210',
  instagramUrl: 'https://instagram.com/territoriosaludable',
  facebookUrl: 'https://facebook.com/territoriosaludable',
  calendarEmbedUrl: 'https://calendar.google.com/calendar/embed?src=territoriosaludable%40gmail.com&ctz=America%2FBogota'
};

const CATEGORIES = ['Tortas Saludables', 'Catalogo Detalles', 'Pan Saludable', 'Postres Saludables', 'Mercadito'];
const DIETARY_TAGS = ['Todas', 'Keto', 'Sin Gluten', 'Sin Azúcar', 'Sin Lácteos', 'Entrega Hoy', 'Con Anticipación'];
const ZONES = [
  { name: 'Cabecera / Sotomayor / Prado', price: 5000 },
  { name: 'Centro / San Francisco', price: 7000 },
  { name: 'Floridablanca / Cañaveral', price: 10000 },
  { name: 'Girón / Piedecuesta', price: 15000 }
];

export const formatCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
export const ensureSlash = (u) => !u ? '/torta-moka.png' : (u.startsWith('http') || u.startsWith('/') ? u : '/' + u);

const P = (id, name, catIdx, price, imageUrl, sizes = [], features = ['Sin Azúcar', 'Sin Gluten'], requiresNotice = false) => ({
  id, name, category: CATEGORIES[catIdx], price, imageUrl: ensureSlash(imageUrl), available: true, features, requiresNotice,
  sizes: sizes.map(([p, pr]) => ({ portions: p, price: pr, label: p + ' (' + formatCOP(pr) + ')' }))
});

export const initialProducts = [
  P('torta-moka', 'Torta Moka', 0, 84000, '/torta-moka.png', [['5 porc',84000],['8 porc',123000],['12 porc',155000],['18 porc',217000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
  P('torta-pistacho', 'Torta Pistacho', 0, 94000, '/torta-pistacho.png', [['5 porc',94000],['8 porc',141000],['12 porc',197000],['18 porc',274000],['25 porc',353000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
  P('torta-chocoarequipe', 'Torta Choco-Arequipe', 0, 60000, '/torta-chocoarequipe.png', [['3 porc',60000],['5 porc',84000],['8 porc',123000],['12 porc',155000]], ["Sin Azúcar","Sin Gluten"], true),
  P('luna-de-almendras', 'Luna de Almendras', 0, 73000, '/luna-de-almendras.png', [['5 porc',73000],['8 porc',108000],['12 porc',142000],['18 porc',189000],['25 porc',250000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
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
  P('tortas-vasca-pistacho', 'Tortas Vasca Pistacho', 0, 85000, '/tortas-vasca-pistacho.png', [['5 porc',85000],['8 porc',115000],['12 porc',140000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
  P('torta-primavera', 'Torta Primavera', 0, 75000, '/torta-primavera.jpeg', [['5 porc',75000],['8 porc',110000],['12 porc',145000],['18 porc',195000]], ["Sin Azúcar","Sin Gluten"], true),
  P('box-duo', 'Box Dúo', 1, 45000, '/box-duo.png', [], ["Sin Azúcar","Sin Gluten","Entrega Hoy"], false),
  P('guacal-amor', 'Guacal Amor', 1, 65000, '/guacal-amor.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
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
  P('baguette', 'Baguette', 2, 14000, '/baguette.jpeg', [], ["Sin Azúcar","Sin Gluten"], false),
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
  { id: 'ord-101', code: 'TS-2026-101', clientName: 'Camila Rodriguez', clientPhone: '573158901234', address: 'Cra 35 # 48-12, Cabecera', zone: 'Cabecera / Sotomayor / Prado', deliveryDate: new Date().toISOString().split('T')[0], deliveryTime: '10:30 AM', items: [{ productName: 'Torta Moka', portion: '8 porc', quantity: 1, price: 123000 }], total: 128000, status: 'En Cocina', paymentMethod: 'Nequi', notes: 'Vela dorada de regalo.' },
  { id: 'ord-102', code: 'TS-2026-102', clientName: 'Santiago Morales', clientPhone: '573007654321', address: 'Calle 158 # 22-45, Cañaveral', zone: 'Floridablanca / Cañaveral', deliveryDate: new Date().toISOString().split('T')[0], deliveryTime: '2:30 PM', items: [{ productName: 'Tortas Vasca Pistacho', portion: '5 porc', quantity: 1, price: 85000 }, { productName: 'Baguette', quantity: 2, price: 14000 }], total: 123000, status: 'Pendiente', paymentMethod: 'Bancolombia', notes: 'Llamar a portería.' }
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
  const [panaderoTab, setPanaderoTab] = useState('pedidos');

  const [adminPassword, setAdminPassword] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('ts_admin_pwd')) || '1234');
  const [panaderoPassword, setPanaderoPassword] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('ts_panadero_pwd')) || '5678');

  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      try { const s = localStorage.getItem('ts_products_catalog_v5'); if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length >= 70) return p; } } catch (e) {}
    }
    return initialProducts;
  });

  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      try { const s = localStorage.getItem('ts_orders_v2'); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p; } } catch (e) {}
    }
    return initialOrders;
  });

  const [selectedCategory, setSelectedCategory] = useState('Tortas Saludables');
  const [selectedTag, setSelectedTag] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [passwordModalTarget, setPasswordModalTarget] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formPrice, setFormPrice] = useState(80000);
  const [formImageUrl, setFormImageUrl] = useState('/torta-moka.png');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formRequiresNotice, setFormRequiresNotice] = useState(true);
  const [formSizes, setFormSizes] = useState([]);

  // New order form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('573158894210');
  const [newAddress, setNewAddress] = useState('');
  const [newZone, setNewZone] = useState(ZONES[0].name);
  const [newDeliveryDate, setNewDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDeliveryTime, setNewDeliveryTime] = useState('11:00 AM');
  const [newOrderProdId, setNewOrderProdId] = useState(products[0]?.id || 'torta-moka');
  const [newOrderPortion, setNewOrderPortion] = useState('');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Nequi');
  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [newPanaderoPwd, setNewPanaderoPwd] = useState('');

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_products_catalog_v5', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_orders_v2', JSON.stringify(orders));
  }, [orders]);

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    const pass = passwordInput.trim();
    if (passwordModalTarget === 'admin') {
      if (pass === adminPassword) {
        setAuthRole('admin');
        if (typeof window !== 'undefined') sessionStorage.setItem('ts_auth_role', 'admin');
        setCurrentView('admin');
        setPasswordModalTarget(null);
        showToast('✓ Bienvenido Administrador');
      } else { setPasswordError('Clave incorrecta (defecto: 1234)'); }
    } else if (passwordModalTarget === 'panadero') {
      if (pass === panaderoPassword || pass === adminPassword) {
        setAuthRole('panadero');
        if (typeof window !== 'undefined') sessionStorage.setItem('ts_auth_role', 'panadero');
        setCurrentView('panadero');
        setPasswordModalTarget(null);
        showToast('✓ Bienvenido a Cocina');
      } else { setPasswordError('Clave incorrecta (defecto: 5678)'); }
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
    if (authRole === 'admin' || (authRole === 'panadero' && view === 'panadero')) {
      setCurrentView(view);
      return;
    }
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
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, name: formName.trim(), category: formCategory, price: Number(formPrice), imageUrl: ensureSlash(formImageUrl), available: formAvailable, requiresNotice: formRequiresNotice, sizes } : p));
      showToast('✓ Producto actualizado');
    } else {
      setProducts(prev => [{ id: 'prod-' + Date.now(), name: formName.trim(), category: formCategory, price: Number(formPrice), imageUrl: ensureSlash(formImageUrl), available: formAvailable, requiresNotice: formRequiresNotice, features: ['Sin Azúcar', 'Sin Gluten'], sizes }, ...prev]);
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
    const zoneObj = ZONES.find(z => z.name === newZone) || ZONES[0];
    const newOrd = {
      id: 'ord-' + Date.now(),
      code: 'TS-2026-' + (orders.length + 101),
      clientName: newClientName.trim() || 'Cliente Mostrador',
      clientPhone: newClientPhone.trim() || '573158894210',
      address: newAddress.trim() || 'Recoge en Tienda',
      zone: newZone,
      deliveryDate: newDeliveryDate,
      deliveryTime: newDeliveryTime,
      items: [{ productName: prod.name, portion: newOrderPortion || undefined, quantity: 1, price: itemPrice }],
      total: itemPrice + zoneObj.price,
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
        return p.name.toLowerCase().includes(q) || (p.features && p.features.some(f => f.toLowerCase().includes(q)));
      }
      return true;
    });
  }, [products, selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E19] flex flex-col font-sans selection:bg-[#2D5A27] selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#241E19] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-700">
          <Sparkles className="text-amber-400" size={16} />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Barra Verde */}
      <div className="bg-[#2D5A27] text-white py-2 px-4 text-center text-xs font-medium tracking-wide">
        <p className="max-w-6xl mx-auto truncate">Pastelería Artesanal 100% Sin Azúcar Refinada y Sin Gluten en Bucaramanga | Horario: Lunes a Viernes: 8am - 6pm | Ubicación: Bucaramanga y Área Metropol.</p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <button onClick={() => navigateTo('public')} className="flex items-center gap-2.5 text-left cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-serif text-lg font-black shadow-xs">TS</div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-black text-[#241E19] block">{DEFAULT_CONFIG.businessName}</span>
              <span className="text-[9px] uppercase tracking-wider text-[#8C533C] font-bold block">PASTELERÍA SANA • PEDIDOS WHATSAPP</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <a href={'https://wa.me/' + DEFAULT_CONFIG.whatsappPhone} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Phone size={14} /><span className="hidden sm:inline">315 889 4210</span>
            </a>
            <button onClick={() => navigateTo('panadero')} className={'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ' + (currentView === 'panadero' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200')}>
              <ChefHat size={14} /><span className="hidden sm:inline">Panel Panadero</span><span className="sm:hidden">Cocina</span>
            </button>
            <button onClick={() => navigateTo('admin')} className={'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ' + (currentView === 'admin' ? 'bg-stone-900 text-white' : 'bg-white border border-[#D8CFC4] text-stone-700')}>
              <ShieldCheck size={14} /><span className="hidden sm:inline">Acceso Admin</span><span className="sm:hidden">Admin</span>
            </button>
            {authRole && (
              <button onClick={handleLogout} className="p-1.5 rounded-xl text-stone-500 hover:text-red-600"><LogOut size={16} /></button>
            )}
          </div>
        </div>
      </header>

      {/* Vista Pública */}
      {currentView === 'public' && (
        <main className="flex-1">
          <section className="bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] py-10 px-4 border-b border-[#EAE2D8] text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5ECE3] text-[#2D5A27] text-xs font-bold">
              <Sparkles size={13} /><span>Pastelería Saludable en Bucaramanga & Área Metropolitana</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#241E19]">El placer de lo dulce, 100% sin azúcar y libre de gluten</h1>
            <p className="text-sm text-stone-600 max-w-2xl mx-auto">Tortas artesanales en capas, panes de masa madre fit, postres individuales y detalles únicos. Endulzados con fruto del monje y stevia pura. Pedidos fáciles y directos a nuestro WhatsApp.</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold">✓ 0% Azúcar refinada</span>
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold">✓ 100% Libres de gluten</span>
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold">♡ Aptas para diabéticos</span>
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold">🕒 Tortas con 1 día de anticipación</span>
            </div>
            <div className="pt-4 max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Buscar por nombre, sabor o ingrediente..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#D8CFC4] text-sm focus:outline-none focus:border-[#2D5A27] shadow-xs" />
            </div>
          </section>

          <div className="sticky top-18 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8] py-3 px-4">
            <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={'px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ' + (selectedCategory === cat ? 'bg-[#2D5A27] text-white shadow-xs' : 'bg-white border border-[#D8CFC4] text-stone-700')}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
              {DIETARY_TAGS.map(tag => (
                <button key={tag} onClick={() => setSelectedTag(tag)} className={'px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer ' + (selectedTag === tag ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600')}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241E19]">{selectedCategory}</h2>
              <span className="text-xs text-stone-500 font-semibold">{filteredProducts.length} productos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(prod => {
                const selSize = selectedSizes[prod.id] || (prod.sizes && prod.sizes[0] && prod.sizes[0].portions);
                const sizeObj = prod.sizes && prod.sizes.find(s => s.portions === selSize);
                const curPrice = sizeObj ? sizeObj.price : prod.price;

                return (
                  <div key={prod.id} className="bg-white rounded-3xl border border-[#EAE2D8] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group">
                    <div className="relative aspect-square bg-stone-100 overflow-hidden">
                      <img src={prod.imageUrl} alt={prod.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {!prod.available && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase">Agotado</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        <span className={'px-2 py-0.5 rounded-full text-white text-[10px] font-bold ' + (prod.requiresNotice ? 'bg-amber-500/90' : 'bg-emerald-600/90')}>
                          {prod.requiresNotice ? '1 Día Anticipación' : 'Entrega Hoy'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#241E19] group-hover:text-[#2D5A27] transition">{prod.name}</h3>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {prod.features && prod.features.map(f => (
                            <span key={f} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-medium">{f}</span>
                          ))}
                        </div>
                      </div>

                      {prod.sizes && prod.sizes.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-stone-400">Porción / Tamaño:</label>
                          <select value={selSize} onChange={(e) => setSelectedSizes({ ...selectedSizes, [prod.id]: e.target.value })} className="w-full py-1.5 px-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#2D5A27]">
                            {prod.sizes.map(s => <option key={s.portions} value={s.portions}>{s.portions} - {formatCOP(s.price)}</option>)}
                          </select>
                        </div>
                      )}

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-bold">Precio</span>
                          <span className="text-base font-black text-[#2D5A27]">{formatCOP(curPrice)}</span>
                        </div>
                        <button onClick={() => handleOrderWhatsApp(prod)} disabled={!prod.available} className="px-3.5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] disabled:bg-stone-300 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                          <Phone size={13} /><span>Pedir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {/* Vista Panadero */}
      {currentView === 'panadero' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
          <div className="bg-amber-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-800 text-amber-200 text-xs font-bold"><ChefHat size={14} /><span>Producción & Cocina</span></div>
              <h2 className="text-2xl font-black font-serif mt-1">Control de Horneado</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPanaderoTab('pedidos')} className={'px-4 py-2 rounded-xl text-xs font-bold ' + (panaderoTab === 'pedidos' ? 'bg-white text-amber-950' : 'bg-amber-800 text-white')}>Pedidos ({orders.length})</button>
              <button onClick={() => setPanaderoTab('produccion')} className={'px-4 py-2 rounded-xl text-xs font-bold ' + (panaderoTab === 'produccion' ? 'bg-white text-amber-950' : 'bg-amber-800 text-white')}>Disponibilidad Vitrina</button>
            </div>
          </div>

          {panaderoTab === 'pedidos' ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <h3 className="font-bold text-lg text-stone-900">Órdenes Activas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase">
                    <tr><th className="p-3">Código/Cliente</th><th className="p-3">Productos</th><th className="p-3">Hora</th><th className="p-3">Estado</th><th className="p-3">Acciones</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-stone-50/50">
                        <td className="p-3"><span className="font-bold block text-stone-900">{ord.code}</span><span className="text-stone-500">{ord.clientName}</span></td>
                        <td className="p-3">{ord.items.map((it, i) => <span key={i} className="block font-medium">{it.quantity}x {it.productName} {it.portion ? '(' + it.portion + ')' : ''}</span>)}</td>
                        <td className="p-3 font-semibold">{ord.deliveryTime}</td>
                        <td className="p-3">
                          <select value={ord.status} onChange={(e) => setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: e.target.value } : o))} className="px-2 py-1 rounded-lg text-xs font-bold border border-stone-300 bg-white">
                            <option value="Pendiente">Pendiente</option><option value="En Cocina">En Cocina</option><option value="Listo">Listo</option><option value="Entregado">Entregado</option>
                          </select>
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <a href={getGoogleCalendarUrl(ord)} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-blue-50 text-blue-700"><Calendar size={14} /></a>
                          <a href={'https://wa.me/' + ord.clientPhone} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"><Phone size={14} /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <h3 className="font-bold text-lg text-stone-900">Disponibilidad en Vitrina</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="p-3 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 bg-stone-50">
                    <img src={prod.imageUrl} alt={prod.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs truncate block text-stone-900">{prod.name}</span>
                      <span className={'text-[10px] font-bold ' + (prod.available ? 'text-emerald-700' : 'text-red-600')}>{prod.available ? 'Disponible' : 'Agotado'}</span>
                    </div>
                    <button onClick={() => handleToggleProduct(prod.id)} className={'px-2.5 py-1 rounded-xl text-xs font-bold text-white cursor-pointer ' + (prod.available ? 'bg-emerald-600' : 'bg-red-600')}>
                      {prod.available ? 'Sí' : 'No'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* Vista Administrador */}
      {currentView === 'admin' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
          <div className="bg-stone-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-xs font-bold"><ShieldCheck size={14} /><span>Administración</span></div>
              <h2 className="text-2xl font-black font-serif mt-1">Panel Central de Pastelería</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setAdminTab('inventario')} className={'px-3.5 py-2 rounded-xl text-xs font-bold ' + (adminTab === 'inventario' ? 'bg-[#2D5A27] text-white' : 'bg-stone-800 text-stone-300')}>Inventario (CRUD)</button>
              <button onClick={() => setAdminTab('pedidos')} className={'px-3.5 py-2 rounded-xl text-xs font-bold ' + (adminTab === 'pedidos' ? 'bg-[#2D5A27] text-white' : 'bg-stone-800 text-stone-300')}>Pedidos ({orders.length})</button>
              <button onClick={() => setAdminTab('calendario')} className={'px-3.5 py-2 rounded-xl text-xs font-bold ' + (adminTab === 'calendario' ? 'bg-[#2D5A27] text-white' : 'bg-stone-800 text-stone-300')}>Google Calendar</button>
              <button onClick={() => setAdminTab('configuracion')} className={'px-3.5 py-2 rounded-xl text-xs font-bold ' + (adminTab === 'configuracion' ? 'bg-[#2D5A27] text-white' : 'bg-stone-800 text-stone-300')}>Seguridad</button>
            </div>
          </div>

          {adminTab === 'inventario' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-stone-900">Catálogo de Productos ({products.length})</h3>
                <button onClick={() => handleOpenEditProduct(null)} className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#23481E]"><Plus size={15} /><span>Nuevo Producto</span></button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase">
                    <tr><th className="p-3">Orden</th><th className="p-3">Imagen</th><th className="p-3">Nombre</th><th className="p-3">Precio Base</th><th className="p-3">Porciones</th><th className="p-3">Estado</th><th className="p-3">Acciones</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((prod, idx) => (
                      <tr key={prod.id} className="hover:bg-stone-50/50">
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleMoveProduct(prod.id, 'up')} disabled={idx === 0} className="p-1 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30"><ArrowUp size={12} /></button>
                            <button onClick={() => handleMoveProduct(prod.id, 'down')} disabled={idx === products.length - 1} className="p-1 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30"><ArrowDown size={12} /></button>
                          </div>
                        </td>
                        <td className="p-3"><img src={prod.imageUrl} alt={prod.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} className="w-10 h-10 rounded-lg object-cover" /></td>
                        <td className="p-3"><span className="font-bold text-stone-900 block">{prod.name}</span><span className="text-[10px] text-stone-500">{prod.category}</span></td>
                        <td className="p-3 font-semibold text-[#2D5A27]">{formatCOP(prod.price)}</td>
                        <td className="p-3 text-[11px] text-stone-600">{prod.sizes && prod.sizes.length > 0 ? prod.sizes.map(s => s.portions).join(', ') : 'Precio único'}</td>
                        <td className="p-3">
                          <button onClick={() => handleToggleProduct(prod.id)} className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (prod.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800')}>
                            {prod.available ? 'Disponible' : 'Agotado'}
                          </button>
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <button onClick={() => handleOpenEditProduct(prod)} className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200"><Edit2 size={13} /></button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'pedidos' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-stone-900">Gestión de Pedidos ({orders.length})</h3>
                <button onClick={() => setNewOrderModalOpen(true)} className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#23481E]"><Plus size={15} /><span>+ Nuevo Pedido Manual</span></button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase">
                    <tr><th className="p-3">Código/Cliente</th><th className="p-3">Teléfono</th><th className="p-3">Zona/Dir</th><th className="p-3">Total</th><th className="p-3">Estado</th><th className="p-3">Calendario</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-stone-50/50">
                        <td className="p-3"><span className="font-bold block text-stone-900">{ord.code}</span><span className="text-stone-600">{ord.clientName}</span></td>
                        <td className="p-3">{ord.clientPhone}</td>
                        <td className="p-3"><span className="font-medium block">{ord.zone}</span><span className="text-[10px] text-stone-500">{ord.address}</span></td>
                        <td className="p-3 font-bold text-[#2D5A27]">{formatCOP(ord.total)}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">{ord.status}</span></td>
                        <td className="p-3"><a href={getGoogleCalendarUrl(ord)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]"><Calendar size={13} /><span>Agendar</span></a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'calendario' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <h3 className="font-bold text-lg text-stone-900">Google Calendar de Entregas</h3>
              <div className="w-full h-120 rounded-2xl overflow-hidden border border-stone-200">
                <iframe src={DEFAULT_CONFIG.calendarEmbedUrl} className="w-full h-full border-0" title="Google Calendar" />
              </div>
            </div>
          )}

          {adminTab === 'configuracion' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 max-w-xl space-y-6">
              <h3 className="font-bold text-lg text-stone-900">Seguridad & Claves</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nueva Clave Administrador:</label>
                  <input type="password" value={newAdminPwd} onChange={(e) => setNewAdminPwd(e.target.value)} placeholder="Nueva clave admin..." className="w-full px-4 py-2.5 rounded-xl border border-stone-300" />
                  <button onClick={() => { if (!newAdminPwd.trim()) return; setAdminPassword(newAdminPwd.trim()); if (typeof window !== 'undefined') localStorage.setItem('ts_admin_pwd', newAdminPwd.trim()); setNewAdminPwd(''); showToast('✓ Clave Admin guardada'); }} className="mt-2 px-4 py-2 rounded-xl bg-[#2D5A27] text-white font-bold hover:bg-[#23481E]">Guardar Clave Admin</button>
                </div>
                <div className="pt-4 border-t border-stone-100">
                  <label className="font-bold text-stone-700 block mb-1">Nueva Clave Panadero (Cocina):</label>
                  <input type="password" value={newPanaderoPwd} onChange={(e) => setNewPanaderoPwd(e.target.value)} placeholder="Nueva clave cocina..." className="w-full px-4 py-2.5 rounded-xl border border-stone-300" />
                  <button onClick={() => { if (!newPanaderoPwd.trim()) return; setPanaderoPassword(newPanaderoPwd.trim()); if (typeof window !== 'undefined') localStorage.setItem('ts_panadero_pwd', newPanaderoPwd.trim()); setNewPanaderoPwd(''); showToast('✓ Clave Panadero guardada'); }} className="mt-2 px-4 py-2 rounded-xl bg-amber-700 text-white font-bold hover:bg-amber-800">Guardar Clave Panadero</button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer Oscuro */}
      <footer className="bg-[#1C1815] text-[#D8D0C5] border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <span className="font-serif text-lg font-black text-white block">Territorio Saludable S.A.S.</span>
            <p className="text-stone-400 leading-relaxed">Pastelería 100% libre de gluten y azúcar refinada en Bucaramanga. Postres, panes y tortas hechos con amor e ingredientes naturales.</p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">Horario de Atención</span>
            <p className="text-stone-400">Lunes a Viernes: 8:00 AM – 6:00 PM</p>
            <p className="text-stone-400">Sábados: 8:00 AM – 5:00 PM</p>
            <p className="text-stone-400">Domingos: 9:00 AM – 2:00 PM</p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">Tarifas Domicilio</span>
            {ZONES.map(z => <p key={z.name} className="flex justify-between text-stone-400"><span>{z.name}</span><span className="font-bold text-amber-400">{formatCOP(z.price)}</span></p>)}
          </div>
          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">Métodos de Pago</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 font-bold text-[10px]">Nequi</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 font-bold text-[10px]">Daviplata</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 font-bold text-[10px]">Bancolombia</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 font-bold text-[10px]">Efectivo</span>
            </div>
            <div className="pt-2">
              <button onClick={() => navigateTo('admin')} className="text-stone-500 hover:text-white underline text-[11px] cursor-pointer">Acceso Administrativo</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Login */}
      {passwordModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-800">
                {passwordModalTarget === 'admin' ? <ShieldCheck size={24} /> : <ChefHat size={24} />}
              </div>
              <h3 className="font-bold text-base text-stone-900">{passwordModalTarget === 'admin' ? 'Acceso Administradora' : 'Acceso Panadería & Cocina'}</h3>
              <p className="text-xs text-stone-500">Ingresa la clave de seguridad para continuar.</p>
            </div>
            <form onSubmit={handleVerifyPassword} className="space-y-3">
              <input type="password" value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }} placeholder="Ingresa contraseña..." autoFocus className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-center tracking-widest text-sm focus:outline-none focus:border-[#2D5A27]" />
              {passwordError && <p className="text-xs text-red-600 font-semibold text-center">{passwordError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setPasswordModalTarget(null)} className="flex-1 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23481E]">Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar / Agregar Producto */}
      {editingProduct !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div><label className="font-bold block mb-1">Nombre:</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Categoría:</label><select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="font-bold block mb-1">Precio Base:</label><input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              </div>
              <div><label className="font-bold block mb-1">Ruta Imagen (/public):</label><input type="text" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-800">Porciones / Tamaños:</span>
                  <button type="button" onClick={() => setFormSizes([...formSizes, { portions: '', price: formPrice }])} className="px-2 py-1 rounded bg-[#E5ECE3] text-[#2D5A27] font-bold text-[10px] flex items-center gap-1"><Plus size={12} /><span>Agregar Tamaño</span></button>
                </div>
                {formSizes.length === 0 ? <p className="text-[11px] text-stone-400 italic">Sin tamaños adicionales.</p> : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formSizes.map((sz, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" value={sz.portions} onChange={(e) => { const u = [...formSizes]; u[i].portions = e.target.value; setFormSizes(u); }} placeholder="Ej: 5 porc" className="flex-1 p-2 rounded-xl border border-stone-300" />
                        <input type="number" value={sz.price} onChange={(e) => { const u = [...formSizes]; u[i].price = e.target.value; setFormSizes(u); }} placeholder="Precio" className="w-24 p-2 rounded-xl border border-stone-300" />
                        <button type="button" onClick={() => setFormSizes(formSizes.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={formAvailable} onChange={(e) => setFormAvailable(e.target.checked)} /><span>Disponible</span></label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={formRequiresNotice} onChange={(e) => setFormRequiresNotice(e.target.checked)} /><span>1 Día Anticipación</span></label>
              </div>
              <div className="pt-3 flex gap-2">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] text-white font-bold hover:bg-[#23481E]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Pedido Manual */}
      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">+ Nuevo Pedido Manual</h3>
              <button onClick={() => setNewOrderModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveNewOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Nombre Cliente:</label><input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
                <div><label className="font-bold block mb-1">Teléfono:</label><input type="text" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              </div>
              <div><label className="font-bold block mb-1">Dirección Entrega:</label><input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Zona:</label><select value={newZone} onChange={(e) => setNewZone(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300">{ZONES.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}</select></div>
                <div><label className="font-bold block mb-1">Método Pago:</label><select value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300"><option value="Nequi">Nequi</option><option value="Daviplata">Daviplata</option><option value="Bancolombia">Bancolombia</option><option value="Efectivo">Efectivo</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Fecha:</label><input type="date" value={newDeliveryDate} onChange={(e) => setNewDeliveryDate(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
                <div><label className="font-bold block mb-1">Hora:</label><input type="text" value={newDeliveryTime} onChange={(e) => setNewDeliveryTime(e.target.value)} placeholder="11:00 AM" required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              </div>
              <div><label className="font-bold block mb-1">Producto:</label><select value={newOrderProdId} onChange={(e) => setNewOrderProdId(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300">{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}</select></div>
              <div><label className="font-bold block mb-1">Notas:</label><input type="text" value={newOrderNotes} onChange={(e) => setNewOrderNotes(e.target.value)} placeholder="Ej: Vela dorada" className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              <div className="pt-3 flex gap-2">
                <button type="button" onClick={() => setNewOrderModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] text-white font-bold hover:bg-[#23481E]">Registrar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
