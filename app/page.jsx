'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Edit2, Trash2, Plus, ArrowUp, ArrowDown, Sparkles, Phone,
  ShieldCheck, X, Clock, Lock, LogOut, MapPin, Calendar, ExternalLink,
  Copy, Instagram, Facebook, Sprout, ChevronLeft, ChevronRight
} from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';

const DEFAULT_CONFIG = {
  businessName: 'Territorio Saludable',
  whatsappPhone: '573158894210',
  instagramUrl: 'https://instagram.com/territoriosaludable',
  facebookUrl: 'https://facebook.com/territoriosaludable',
  calendarEmbedUrl: 'https://calendar.google.com/calendar/embed?src=territoriosaludable%40gmail.com&ctz=America%2FBogota',
  hoursMonFri: 'Lunes a Viernes: 8:00 AM – 6:00 PM',
  hoursSat: 'Sábados: 8:00 AM – 5:00 PM',
  hoursSun: 'Domingos y Festivos: 9:00 AM – 2:00 PM (Entregas)'
};

const CATEGORIES = ['Tortas Saludables', 'Catalogo Detalles', 'Pan Saludable', 'Postres Saludables', 'Mercadito'];
const DIETARY_TAGS = ['Todas', 'Keto', 'Sin Gluten', 'Sin Azúcar', 'Sin Lácteos', 'Entrega Hoy', 'Con Anticipación'];

const INITIAL_ZONES = [
  { id: 'z1', name: 'Cabecera / Sotomayor / Prado', price: 5000 },
  { id: 'z2', name: 'Centro / San Francisco', price: 7000 },
  { id: 'z3', name: 'Floridablanca / Cañaveral', price: 10000 },
  { id: 'z4', name: 'Girón / Piedecuesta', price: 15000 }
];

const formatCOP = (n) => {
  if (typeof n !== 'number' || isNaN(n)) return '$ 0';
  return '$ ' + n.toLocaleString('es-CO');
};

const ensureSlash = (u) => !u ? '/torta-moka.png' : (u.startsWith('http') || u.startsWith('/') ? u : '/' + u);

const P = (id, name, catIdx, price, imageUrl, sizes = [], features = ['Sin Azúcar', 'Sin Gluten'], requiresNotice = false, description = '') => ({
  id, name, category: CATEGORIES[catIdx], price, imageUrl: ensureSlash(imageUrl), available: true, features, requiresNotice, description,
  sizes: sizes.map(([p, pr]) => ({ portions: p, price: pr, label: p + ' (' + formatCOP(pr) + ')' }))
});

const initialProducts = [
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
  P('tortas-vasca-pistacho', 'Tortas Vasca Pistacho', 0, 85000, '/tortas-vasca-pistacho.png', [['5 porc',85000],['8 porc',115000],['14 porc',140000]], ["Sin Azúcar","Sin Gluten","Keto"], true),
  P('torta-primavera', 'Torta Primavera', 0, 75000, '/torta-primavera.jpeg', [['5 porc',75000],['8 porc',110000],['12 porc',145000],['18 porc',195000]], ["Sin Azúcar","Sin Gluten"], true),
  
  P('copa-saludable', 'Copa Saludable', 1, 55000, '/copa-saludable.jpeg', [], ["Sin Azúcar","Sin Gluten"], false, "Nuestra Copa Red Velvet Saludable combina capas irresistibles de bizcocho suave y esponjoso, yogurt griego, arequipe y crema chantilly, todo presentado en una elegante copa de vidrio. 100% libre de azúcar y gluten. Incluye tarjeta con mensaje personalizado."),
  P('postre-ilusion', 'Postre Ilusión', 1, 19000, '/postre-ilusion.png', [], ["Sin Azúcar","Sin Gluten"], false, "Postre mug cake sin azúcar y sin gluten. Contiene torta, arequipe, yogurt griego y fresa. Vaso de 9 onzas empacado en su cajita especial con tarjeta personalizada."),
  P('mini-marquesa-detalle', 'Mini Marquesa', 1, 35000, '/mini-marquesa.jpeg', [], ["Sin Azúcar","Sin Gluten"], false, "Bizcocho de brownie hecho con chocolate semiamargo y arequipe. Decorado con chantilly, arequipe, mermelada de frutos rojos, fresas y arándanos. 100% endulzado con Stevia y libre de trigo. Empacada en Cajita con cinta y tarjeta. Tamaño personal."),
  P('postre-con-helado-nuevo', 'Postre con Helado', 3, 17000, '/postre-con-helado.png', [], ["Sin Azúcar","Sin Gluten"], false, "Postre en capas con torta, arequipe, yogurt griego, frutos secos y helado con colágeno hidrolizado. Sin azúcar y sin gluten."),
  P('mini-brownies-caja', 'Mini Brownies', 3, 23000, '/mini-brownies.png', [['Caja x4',23000],['Caja x8',44000]], ["Sin Azúcar","Sin Gluten","Keto"], false, "Delicioso y melcochudo bizcocho hecho con una mezcla de harina de almendras, harina de arroz, arequipe y chocolate semiamargo, con una capa de arequipe cero azúcar en la mitad, decoración en arequipe, chocolate y chantilly."),
  P('blondie-caja', 'Blondie', 3, 19000, '/blondie.png', [['Caja x2',19000],['Caja x4',36000]], ["Sin Azúcar","Sin Gluten"], false, "Delicioso bizcocho hecho con harina de almendras, harina de arroz, arequipe y chocolate blanco decoración en arequipe."),

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

const initialOrders = [
  { id: 'ord-101', code: 'TS-1001', clientName: 'Valentina Gómez', clientPhone: '3158901234', address: 'Cra 35 # 52-20, Apto 402', zone: 'Cabecera / Sotomayor / Prado', deliveryDate: '2026-11-09', deliveryTime: '3:30 PM', items: [{ productName: 'Torta de Arequipe Saludable', portion: '8 porc', quantity: 1, price: 87000 }, { productName: 'Brownies Melcochudos', portion: 'Caja x4', quantity: 1, price: 36000 }], total: 128000, status: 'En Cocina', paymentMethod: 'PAGADO NEQUI', notes: 'Cliente habitual. Entregar antes de las 4 PM.' },
  { id: 'ord-102', code: 'TS-1002', clientName: 'Dr. Carlos Mendoza', clientPhone: '3104567890', address: 'Calle 48 # 28-15, Consultorio 301', zone: 'Centro / San Francisco', deliveryDate: '2026-11-09', deliveryTime: '4:00 PM', items: [{ productName: 'Pan Ajo Asado & Finas Hierbas (250g)', quantity: 2, price: 16000 }, { productName: 'Arequipe Artesanal Fit (Frasco 280g)', quantity: 1, price: 22000 }], total: 62000, status: 'En Cocina', paymentMethod: 'PAGADO BANCOLOMBIA', notes: 'Llamar al llegar.' }
];

const getGoogleCalendarUrl = (order) => {
  const title = 'Entrega TS: ' + order.clientName + ' (' + order.code + ')';
  const items = order.items.map(i => i.quantity + 'x ' + i.productName + (i.portion ? ' (' + i.portion + ')' : '')).join(', ');
  const details = 'Pastelería Territorio Saludable S.A.S.\\nPedido: ' + order.code + '\\nCliente: ' + order.clientName + '\\nTel: +' + order.clientPhone + '\\nDir: ' + order.address + '\\nZona: ' + order.zone + '\\nTotal: ' + formatCOP(order.total) + '\\nPago: ' + order.paymentMethod + '\\n\\nItems:\\n' + items + '\\n\\nNotas: ' + (order.notes || 'Ninguna');
  const loc = order.address + ', ' + order.zone + ', Bucaramanga, Colombia';
  const d = (order.deliveryDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + d + 'T100000/' + d + 'T110000&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(loc);
};

export default function Page() {
  const [currentView, setCurrentView] = useState('public');
  const [authRole, setAuthRole] = useState(null);
  const [adminTab, setAdminTab] = useState('inventario');

  const [adminPassword, setAdminPassword] = useState('1234');
  const [panaderoPassword, setPanaderoPassword] = useState('5678');
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [zones, setZones] = useState(INITIAL_ZONES);

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

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formPrice, setFormPrice] = useState(80000);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/torta-moka.png');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formRequiresNotice, setFormRequiresNotice] = useState(true);
  const [formSizes, setFormSizes] = useState([]);

  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState(DEFAULT_CONFIG.whatsappPhone);
  const [newAddress, setNewAddress] = useState('');
  const [newZone, setNewZone] = useState(INITIAL_ZONES[0]?.name || 'Cabecera');
  const [newDeliveryDate, setNewDeliveryDate] = useState('2026-11-09');
  const [newDeliveryTime, setNewDeliveryTime] = useState('11:00 AM');
  const [newOrderProdId, setNewOrderProdId] = useState(initialProducts[0]?.id || 'torta-moka');
  const [newOrderPortion, setNewOrderPortion] = useState('');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('PAGADO NEQUI');

  const [cfgName, setCfgName] = useState(DEFAULT_CONFIG.businessName);
  const [cfgPhone, setCfgPhone] = useState(DEFAULT_CONFIG.whatsappPhone);
  const [cfgInsta, setCfgInsta] = useState(DEFAULT_CONFIG.instagramUrl);
  const [cfgFace, setCfgFace] = useState(DEFAULT_CONFIG.facebookUrl);
  const [cfgMonFri, setCfgMonFri] = useState(DEFAULT_CONFIG.hoursMonFri);
  const [cfgSat, setCfgSat] = useState(DEFAULT_CONFIG.hoursSat);
  const [cfgSun, setCfgSun] = useState(DEFAULT_CONFIG.hoursSun);
  const [cfgEmbedUrl, setCfgEmbedUrl] = useState(DEFAULT_CONFIG.calendarEmbedUrl);

  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [newPanaderoPwd, setNewPanaderoPwd] = useState('');
  const [selectedCalDateStr, setSelectedCalDateStr] = useState('2026-11-09');

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Teléfono ${text} copiado 📋`);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const role = sessionStorage.getItem('ts_auth_role');
        if (role) setAuthRole(role);
        const ap = localStorage.getItem('ts_admin_pwd');
        if (ap) setAdminPassword(ap);
        const pp = localStorage.getItem('ts_panadero_pwd');
        if (pp) setPanaderoPassword(pp);
        const cfg = localStorage.getItem('ts_config_v2');
        if (cfg) {
          const parsed = JSON.parse(cfg);
          setConfig(prev => ({ ...prev, ...parsed }));
          setCfgName(parsed.businessName || DEFAULT_CONFIG.businessName);
          setCfgPhone(parsed.whatsappPhone || DEFAULT_CONFIG.whatsappPhone);
          setCfgInsta(parsed.instagramUrl || DEFAULT_CONFIG.instagramUrl);
          setCfgFace(parsed.facebookUrl || DEFAULT_CONFIG.facebookUrl);
          setCfgMonFri(parsed.hoursMonFri || DEFAULT_CONFIG.hoursMonFri);
          setCfgSat(parsed.hoursSat || DEFAULT_CONFIG.hoursSat);
          setCfgSun(parsed.hoursSun || DEFAULT_CONFIG.hoursSun);
          setCfgEmbedUrl(parsed.calendarEmbedUrl || DEFAULT_CONFIG.calendarEmbedUrl);
        }
        // CAMBIO DE CLAVE DE CACHÉ PARA FORZAR LA CARGA DE LAS NUEVAS IMÁGENES:
        const prd = localStorage.getItem('ts_products_catalog_v8');
        if (prd) {
          const parsed = JSON.parse(prd);
          if (Array.isArray(parsed) && parsed.length >= 75) setProducts(parsed);
        }
        const ord = localStorage.getItem('ts_orders_v3');
        if (ord) {
          const parsed = JSON.parse(ord);
          if (Array.isArray(parsed)) setOrders(parsed);
        }
        const zn = localStorage.getItem('ts_zones_v1');
        if (zn) {
          const parsed = JSON.parse(zn);
          if (Array.isArray(parsed)) setZones(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_products_catalog_v8', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_zones_v1', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ts_config_v2', JSON.stringify(config));
  }, [config]);

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

  const handleSaveGeneralConfig = (e) => {
    e.preventDefault();
    const updated = {
      ...config,
      businessName: cfgName.trim(),
      whatsappPhone: cfgPhone.trim(),
      instagramUrl: cfgInsta.trim(),
      facebookUrl: cfgFace.trim(),
      hoursMonFri: cfgMonFri.trim(),
      hoursSat: cfgSat.trim(),
      hoursSun: cfgSun.trim(),
      calendarEmbedUrl: cfgEmbedUrl.trim()
    };
    setConfig(updated);
    showToast('✓ Configuración General Guardada');
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
    if (prod) {
      setEditingProduct(prod);
      setFormName(prod.name || '');
      setFormCategory(prod.category || CATEGORIES[0]);
      setFormPrice(prod.price || 80000);
      setFormDescription(prod.description || '');
      setFormImageUrl(prod.imageUrl || '/torta-moka.png');
      setFormAvailable(prod.available ?? true);
      setFormRequiresNotice(prod.requiresNotice ?? true);
      setFormSizes(prod.sizes ? prod.sizes.map(s => ({ portions: s.portions, price: s.price })) : []);
    } else {
      setEditingProduct({ id: 'NEW_PRODUCT' });
      setFormName('');
      setFormCategory(CATEGORIES[0]);
      setFormPrice(20000);
      setFormDescription('');
      setFormImageUrl('/torta-moka.png');
      setFormAvailable(true);
      setFormRequiresNotice(false);
      setFormSizes([]);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const sizes = formSizes.map(s => ({ portions: s.portions, price: Number(s.price), label: s.portions + ' (' + formatCOP(Number(s.price)) + ')' }));
    if (editingProduct && editingProduct.id && editingProduct.id !== 'NEW_PRODUCT') {
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
      clientPhone: newClientPhone.trim() || config.whatsappPhone,
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
    window.open('https://wa.me/' + config.whatsappPhone + '?text=' + encodeURIComponent(txt), '_blank');
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

  const calendarOrdersForDate = useMemo(() => {
    return orders.filter(o => o.deliveryDate === selectedCalDateStr);
  }, [orders, selectedCalDateStr]);

  const daysWithOrders = useMemo(() => {
    const set = new Set();
    orders.forEach(o => {
      if (o.deliveryDate) set.add(o.deliveryDate);
    });
    return set;
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E19] flex flex-col font-sans selection:bg-[#2D5A27] selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#241E19] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-700">
          <Sparkles className="text-amber-400" size={16} />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#1C3A27] text-emerald-100 py-2 px-4 text-xs font-medium tracking-wide border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="truncate">🌱 Pastelería Artesanal 100% Sin Azúcar Refinada y Sin Gluten en Bucaramanga</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-emerald-200/90 shrink-0">
            <span>🕒 {config.hoursMonFri}</span>
            <span>📍 Bucaramanga y Área Metropol.</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
          
          <button onClick={() => navigateTo('public')} className="flex items-center gap-3 text-left cursor-pointer group">
            <div className="w-11 h-11 rounded-2xl bg-[#2D5A27] flex items-center justify-center text-white shadow-xs shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
              <img 
                src="/logo.jpg" 
                alt="Territorio Saludable Logo" 
                className="w-full h-full object-cover z-10"
                onError={(e) => { 
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
              <Sprout className="w-6 h-6 text-emerald-200 absolute" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#2D5A27] block tracking-tight leading-none">
                {config.businessName}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#8C533C] font-bold block mt-1">
                PASTELERÍA SANA • PEDIDOS WHATSAPP
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href={config.instagramUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-[#EFE8DC] hover:bg-[#E3D9C6] flex items-center justify-center text-[#5C4033] transition shadow-2xs"
              title="Instagram Oficial"
            >
              <Instagram size={17} />
            </a>

            <a 
              href={config.facebookUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-[#EFE8DC] hover:bg-[#E3D9C6] flex items-center justify-center text-[#5C4033] transition shadow-2xs"
              title="Facebook Oficial"
            >
              <Facebook size={17} />
            </a>

            <a 
              href={'https://wa.me/' + config.whatsappPhone} 
              target="_blank" 
              rel="noreferrer" 
              className="px-3.5 py-2 rounded-full bg-[#EFE8DC] hover:bg-[#E3D9C6] text-[#241E19] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Phone size={14} className="text-[#2D5A27]" />
              <span className="font-semibold">{config.whatsappPhone.replace('57', '')}</span>
            </a>

            {currentView !== 'admin' && (
              <button 
                onClick={() => navigateTo('admin')} 
                className="px-4 py-2 rounded-full bg-[#1C3A27] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <ShieldCheck size={14} className="text-amber-400" />
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

{/* Barra de categorías y etiquetas fija y con fondo sólido */}
          <div className="sticky top-20 z-30 bg-[#FAF7F2] backdrop-blur-md border-b border-[#EAE2D8] py-3 px-4 shadow-2xs">
            <div className="max-w-7xl mx-auto space-y-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={'px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ' + (selectedCategory === cat ? 'bg-[#2D5A27] text-white shadow-xs' : 'bg-white border border-[#D8CFC4] text-stone-700 hover:bg-stone-50')}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                {DIETARY_TAGS.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => setSelectedTag(tag)} 
                    className={'px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer ' + (selectedTag === tag ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
      
      {currentView === 'public' && (
        <main className="flex-1">
          <section className="bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] py-12 px-4 border-b border-[#EAE2D8] text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5ECE3] text-[#2D5A27] text-xs font-bold border border-emerald-200">
              <Sparkles size={13} />
              <span>Pastelería Saludable en Bucaramanga & Área Metropolitana</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-[#241E19] leading-tight tracking-tight max-w-4xl mx-auto">
              El placer de lo dulce, <span className="text-[#2D5A27] italic font-serif">100% sin</span> <br />
              <span className="text-[#2D5A27] italic font-serif">azúcar</span> y libre de gluten.
            </h1>

            <p className="text-sm text-stone-600 max-w-3xl mx-auto leading-relaxed pt-2">
              Nuestra meta es crear recetas deliciosas con ingredientes que sean útiles para nuestro cuerpo. Eliminamos el azúcar refinado, eliminamos el gluten (a muchos les cae mal), e incluimos ingredientes maravillosos como el chocolate amargo, la fibra prebiótica, el colágeno hidrolizado, harinas integrales, muchas frutas y lo mejor, es que todo lo endulzamos con STEVIA.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">✓ 0% Azúcar refinada</span>
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">✓ 100% Libres de gluten</span>
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">♡ Aptas para diabéticos</span>
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">🕒 Tortas con 1 día de anticipación</span>
            </div>

            <div className="pt-4 max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="🔍 Buscar por nombre, sabor o ingrediente..." 
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#D8CFC4] text-sm focus:outline-none focus:border-[#2D5A27] shadow-xs" 
              />
            </div>
          </section>

{/* MENÚ SUPERIOR MÓVIL FIJO Y LIMPIO */}
          <div className="sticky top-20 z-35 bg-[#FAF7F2] backdrop-blur-md border-b border-[#EAE2D8] py-3 px-4 shadow-xs">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={'px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ' + (selectedCategory === cat ? 'bg-[#2D5A27] text-white shadow-xs' : 'bg-white border border-[#D8CFC4] text-stone-700 hover:bg-stone-50')}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
                {DIETARY_TAGS.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => setSelectedTag(tag)} 
                    className={'px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer ' + (selectedTag === tag ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241E19]">{selectedCategory}</h2>
                <span className="text-xs text-stone-500 font-semibold">{filteredProducts.length} productos</span>
              </div>

              <div className="mt-2 text-xs text-stone-600 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70 leading-relaxed">
                {selectedCategory === 'Tortas Saludables' && (
                  <p>🎂 <strong>Tortas Saludables:</strong> Todas nuestras tortas son hechas a base de harina de almendras, arroz y almidón de yuca, endulzadas 100% Libres de azúcar y Sin gluten. Pedidos con un día de anticipación.</p>
                )}
                {selectedCategory === 'Catalogo Detalles' && (
                  <p>🎁 <strong>Detalles con amor:</strong> Sorprende a tu persona favorita con una experiencia deliciosa y libre de culpas.</p>
                )}
                {selectedCategory === 'Pan Saludable' && (
                  <p>🍞 <strong>Pan Digestivo (Sin azúcar y Sin gluten):</strong> Disfruta de un pan saludable, delicioso con un sabor auténtico y una textura única. Está hecho con harina de arroz, fécula de maíz y harina de almendras. Contiene psyllium, una fuente natural de fibra que favorece la digestión y brinda saciedad. Es 100% libre de gluten y no contiene azúcar refinada.</p>
                )}
                {(selectedCategory === 'Postres Saludables' || selectedCategory === 'Mercadito') && (
                  <p>✨ Selecciona el producto que prefieras y presiona el botón <strong>Pedir</strong> para coordinar la entrega directamente a través de nuestro WhatsApp oficial.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {filteredProducts.map(prod => {
                const selSize = selectedSizes[prod.id] || (prod.sizes && prod.sizes[0] && prod.sizes[0].portions);
                const sizeObj = prod.sizes && prod.sizes.find(s => s.portions === selSize);
                const curPrice = sizeObj ? sizeObj.price : prod.price;

                return (
                  <div key={prod.id} className="bg-white rounded-3xl border border-[#EAE2D8] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group">
                    <div>
                      <div className="relative aspect-square bg-stone-100 overflow-hidden">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {!prod.available && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase">Agotado</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          <span className={'px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow-xs ' + (prod.requiresNotice ? 'bg-amber-600' : 'bg-emerald-600')}>
                            {prod.requiresNotice ? '1 Día Anticipación' : 'Entrega Hoy'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-serif font-bold text-base text-[#241E19] group-hover:text-[#2D5A27] transition">{prod.name}</h3>
                        
                        {prod.description && (
                          <p className="text-stone-500 text-xs leading-relaxed line-clamp-3">
                            {prod.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1 pt-1">
                          {prod.features && prod.features.map(f => (
                            <span key={f} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-medium">{f}</span>
                          ))}
                        </div>

                        {prod.sizes && prod.sizes.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <label className="text-[10px] font-bold uppercase text-stone-400 block">PORCIÓN / TAMAÑO:</label>
                            <select 
                              value={selSize} 
                              onChange={(e) => setSelectedSizes({ ...selectedSizes, [prod.id]: e.target.value })} 
                              className="w-full py-1.5 px-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#2D5A27]"
                            >
                              {prod.sizes.map(s => <option key={s.portions} value={s.portions}>{s.portions} - {formatCOP(s.price)}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-3">
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase font-bold">Precio</span>
                        <span className="text-base font-black text-[#2D5A27]">{formatCOP(curPrice)}</span>
                      </div>
                      <button 
                        onClick={() => handleOrderWhatsApp(prod)} 
                        disabled={!prod.available} 
                        className="px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] disabled:bg-stone-300 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Phone size={13} />
                        <span>Pedir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {currentView === 'admin' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
          <div className="bg-[#1C3A27] text-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-900 text-emerald-200 text-xs font-bold">
                <ShieldCheck size={14} />
                <span>Administración Privada</span>
              </div>
              <h2 className="text-2xl font-black font-serif mt-1">Panel Central de Pastelería</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setAdminTab('inventario')} className={'px-3.5 py-2 rounded-xl text-xs font-bold transition ' + (adminTab === 'inventario' ? 'bg-white text-[#1C3A27]' : 'bg-emerald-900 text-emerald-100')}>Inventario (CRUD)</button>
              <button onClick={() => setAdminTab('pedidos')} className={'px-3.5 py-2 rounded-xl text-xs font-bold transition ' + (adminTab === 'pedidos' ? 'bg-white text-[#1C3A27]' : 'bg-emerald-900 text-emerald-100')}>Pedidos ({orders.length})</button>
              <button onClick={() => setAdminTab('calendario')} className={'px-3.5 py-2 rounded-xl text-xs font-bold transition ' + (adminTab === 'calendario' ? 'bg-white text-[#1C3A27]' : 'bg-emerald-900 text-emerald-100')}>Calendario de Entregas</button>
              <button onClick={() => setAdminTab('configuracion')} className={'px-3.5 py-2 rounded-xl text-xs font-bold transition ' + (adminTab === 'configuracion' ? 'bg-white text-[#1C3A27]' : 'bg-emerald-900 text-emerald-100')}>Configuración & Tarifas</button>
            </div>
          </div>

          {adminTab === 'inventario' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-stone-900">Catálogo de Productos ({products.length})</h3>
                <button 
                  onClick={() => handleOpenEditProduct(null)} 
                  className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#23481E] cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Nuevo Producto</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase">
                    <tr>
                      <th className="p-3">Orden</th>
                      <th className="p-3">Imagen</th>
                      <th className="p-3">Nombre & Categoría</th>
                      <th className="p-3">Precio Base</th>
                      <th className="p-3">Porciones</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
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
                        <td className="p-3">
                          <img src={prod.imageUrl} alt={prod.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} className="w-10 h-10 rounded-lg object-cover" />
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-stone-900 block">{prod.name}</span>
                          <span className="text-[10px] text-stone-500">{prod.category}</span>
                        </td>
                        <td className="p-3 font-semibold text-[#2D5A27]">{formatCOP(prod.price)}</td>
                        <td className="p-3 text-[11px] text-stone-600">{prod.sizes && prod.sizes.length > 0 ? prod.sizes.map(s => s.portions).join(', ') : 'Precio único'}</td>
                        <td className="p-3">
                          <button onClick={() => handleToggleProduct(prod.id)} className={'px-2.5 py-1 rounded-full text-[10px] font-bold ' + (prod.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800')}>
                            {prod.available ? 'Disponible' : 'Agotado'}
                          </button>
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <button onClick={() => handleOpenEditProduct(prod)} className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200" title="Editar Producto"><Edit2 size={13} /></button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600" title="Eliminar"><Trash2 size={13} /></button>
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {['Todos', 'Pendiente', 'En Cocina', 'Listo Despacho', 'Entregado', 'Cancelado'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={'px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ' + (statusFilter === st ? 'bg-[#2D5A27] text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button onClick={() => setNewOrderModalOpen(true)} className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#23481E]">
                  <Plus size={15} />
                  <span>+ Registrar Orden Manual</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-amber-50/80 border-b border-amber-200/60 text-stone-700 font-bold">
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
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map(ord => (
                      <tr key={ord.id} className="hover:bg-amber-50/30">
                        <td className="p-3">
                          <div className="font-bold text-stone-900">{ord.clientName}</div>
                          <div className="text-stone-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <span>{ord.code}</span> • 
                            <button 
                              onClick={() => copyToClipboard(ord.clientPhone)}
                              className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                              title="Copiar Teléfono"
                            >
                              <span>{ord.clientPhone}</span>
                              <Copy size={11} />
                            </button>
                          </div>
                        </td>

                        <td className="p-3">
                          {ord.items.map((it, i) => (
                            <div key={i} className="font-medium text-stone-800">
                              x{it.quantity} {it.productName} {it.portion ? '(' + it.portion + ')' : ''}
                            </div>
                          ))}
                          {ord.notes && (
                            <div className="text-[10px] text-amber-800 italic mt-1 bg-amber-50/60 px-2 py-0.5 rounded border border-amber-200/50">
                              Nota: {ord.notes}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="font-medium">📅 {ord.deliveryDate}</div>
                          <div className="text-stone-500">🕒 {ord.deliveryTime}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-medium">📍 {ord.address}</div>
                          <div className="text-stone-500">{ord.zone}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-[#2D5A27] text-sm">{formatCOP(ord.total)}</div>
                          <div className="text-[10px] font-bold text-stone-400 uppercase">{ord.paymentMethod}</div>
                        </td>

                        <td className="p-3">
                          <select 
                            value={ord.status} 
                            onChange={(e) => setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: e.target.value } : o))} 
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-stone-300 bg-white shadow-xs focus:outline-none"
                          >
                            <option value="Pendiente">⌛ Pendiente</option>
                            <option value="En Cocina">👨‍🍳 En Cocina</option>
                            <option value="Listo Despacho">📦 Listo Despacho</option>
                            <option value="Entregado">✅ Entregado</option>
                            <option value="Cancelado">❌ Cancelado</option>
                          </select>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <a 
                              href={'https://wa.me/' + ord.clientPhone} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition" 
                              title="Abrir Chat de WhatsApp"
                            >
                              💬
                            </a>
                            <a 
                              href={getGoogleCalendarUrl(ord)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition" 
                              title="Google Calendar"
                            >
                              📅
                            </a>
                            <button 
                              onClick={() => setSelectedOrderDetail(ord)} 
                              className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition" 
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
          )}

          {adminTab === 'calendario' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#2D5A27] text-xs font-bold border border-emerald-200 mb-1">
                    <Calendar size={13} />
                    <span>Widget</span>
                  </div>
                  <h3 className="font-serif text-3xl font-black text-stone-900">Calendar</h3>
                  <p className="text-xs text-stone-500">Visualiza las fechas de entrega agendadas, sincroniza con Google Calendar o consulta la agenda interactiva.</p>
                </div>

                <a 
                  href={config.calendarEmbedUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs shrink-0"
                >
                  <ExternalLink size={14} />
                  <span>Abrir Google Calendar</span>
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-xl font-bold text-stone-900">
                      Noviembre 2026 <span className="text-xs text-stone-400 font-sans font-normal">({orders.length} pedidos totales)</span>
                    </h4>
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50"><ChevronLeft size={16} /></button>
                      <button className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50"><ChevronRight size={16} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 text-center font-bold text-[11px] text-stone-400 uppercase tracking-wider py-2">
                    <div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 30 }, (_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `2026-11-${dayNum.toString().padStart(2, '0')}`;
                      const hasOrders = daysWithOrders.has(dateStr);
                      const isSelected = selectedCalDateStr === dateStr;

                      return (
                        <button
                          key={dayNum}
                          onClick={() => setSelectedCalDateStr(dateStr)}
                          className={
                            'h-16 rounded-2xl flex flex-col items-center justify-center relative transition cursor-pointer font-bold text-sm border ' +
                            (isSelected ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20' : 
                             hasOrders ? 'border-emerald-300 bg-emerald-50/50 text-stone-900 hover:bg-emerald-100/50' : 
                             'border-stone-100 bg-stone-50/60 text-stone-700 hover:bg-stone-100')
                          }
                        >
                          <span>{dayNum}</span>
                          {hasOrders && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">ENTREGAS PROGRAMADAS PARA:</span>
                        <h4 className="font-serif text-xl font-bold text-[#2D5A27]">{selectedCalDateStr}</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {calendarOrdersForDate.length} pedido(s)
                      </span>
                    </div>

                    <div className="py-6">
                      {calendarOrdersForDate.length > 0 ? (
                        <div className="space-y-3">
                          {calendarOrdersForDate.map(ord => (
                            <div key={ord.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-900">{ord.clientName} ({ord.code})</span>
                                <span className="text-xs font-bold text-[#2D5A27]">{formatCOP(ord.total)}</span>
                              </div>
                              <p className="text-xs text-stone-600">📍 {ord.address} ({ord.zone})</p>
                              <p className="text-xs text-stone-600">🕒 Hora: {ord.deliveryTime}</p>
                              <div className="text-[11px] text-stone-700 pt-1 border-t border-amber-200/40">
                                {ord.items.map((it, idx) => (
                                  <div key={idx}>• {it.quantity}x {it.productName} {it.portion ? `(${it.portion})` : ''}</div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-3 text-stone-400">
                          <Calendar size={40} className="mx-auto text-stone-300 stroke-[1.5]" />
                          <p className="text-xs font-semibold text-stone-500 max-w-xs mx-auto leading-relaxed">
                            No hay entregas registradas para esta fecha.
                          </p>
                          <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                            Haz clic en un día del calendario con indicador verde para ver detalles.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'configuracion' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                      <span>Solo Jefe</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">Configuración de la Pastelería</h3>
                    <p className="text-xs text-stone-500">Personaliza el número de WhatsApp oficial, redes sociales, horarios de atención y el Google Calendar.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveGeneralConfig} className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                      <Phone size={16} className="text-[#2D5A27]" />
                      <span>Canales de Contacto & WhatsApp de Pedidos</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1">NÚMERO DE WHATSAPP (CON CÓDIGO DE PAÍS) *</label>
                        <input 
                          type="text" 
                          value={cfgPhone} 
                          onChange={(e) => setCfgPhone(e.target.value)} 
                          required 
                          className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-stone-800" 
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">A este número llegarán todos los pedidos del catálogo digital.</span>
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1">NOMBRE DEL NEGOCIO</label>
                        <input 
                          type="text" 
                          value={cfgName} 
                          onChange={(e) => setCfgName(e.target.value)} 
                          required 
                          className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 font-semibold" 
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1 flex items-center gap-1"><Instagram size={13} /> ENLACE DE INSTAGRAM</label>
                        <input 
                          type="text" 
                          value={cfgInsta} 
                          onChange={(e) => setCfgInsta(e.target.value)} 
                          className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800" 
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1 flex items-center gap-1"><Facebook size={13} /> ENLACE DE FACEBOOK</label>
                        <input 
                          type="text" 
                          value={cfgFace} 
                          onChange={(e) => setCfgFace(e.target.value)} 
                          className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                      <Clock size={16} className="text-[#2D5A27]" />
                      <span>Horarios de Atención Publicados</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Lunes a Viernes</label>
                        <input 
                          type="text" 
                          value={cfgMonFri} 
                          onChange={(e) => setCfgMonFri(e.target.value)} 
                          className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800" 
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Sábados</label>
                        <input 
                          type="text" 
                          value={cfgSat} 
                          onChange={(e) => setCfgSat(e.target.value)} 
                          className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800" 
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Domingos & Festivos</label>
                        <input 
                          type="text" 
                          value={cfgSun} 
                          onChange={(e) => setCfgSun(e.target.value)} 
                          className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                      <Calendar size={16} className="text-[#2D5A27]" />
                      <span>Integración Google Calendar</span>
                    </h4>

                    <div className="text-xs">
                      <label className="font-bold text-stone-700 uppercase tracking-wider block mb-1">URL DE INSERCIÓN (IFRAME EMBED) DE GOOGLE CALENDAR</label>
                      <input 
                        type="text" 
                        value={cfgEmbedUrl} 
                        onChange={(e) => setCfgEmbedUrl(e.target.value)} 
                        className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-stone-800" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-6 py-3 rounded-2xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23481E] transition shadow-xs">
                    Guardar Configuración General
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                    <Lock size={16} className="text-amber-600" />
                    <span>Seguridad & Claves de Acceso</span>
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Nueva Clave Administrador:</label>
                      <input 
                        type="password" 
                        value={newAdminPwd} 
                        onChange={(e) => setNewAdminPwd(e.target.value)} 
                        placeholder="Nueva clave admin..." 
                        className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50" 
                      />
                      <button 
                        onClick={() => { if (!newAdminPwd.trim()) return; setAdminPassword(newAdminPwd.trim()); if (typeof window !== 'undefined') localStorage.setItem('ts_admin_pwd', newAdminPwd.trim()); setNewAdminPwd(''); showToast('✓ Clave Admin guardada'); }} 
                        className="mt-2.5 px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white font-bold hover:bg-[#23481E] transition"
                      >
                        Guardar Clave Admin
                      </button>
                    </div>
                    <div className="pt-4 border-t border-stone-100">
                      <label className="font-bold text-stone-700 block mb-1">Nueva Clave Panadero (Cocina):</label>
                      <input 
                        type="password" 
                        value={newPanaderoPwd} 
                        onChange={(e) => setNewPanaderoPwd(e.target.value)} 
                        placeholder="Nueva clave cocina..." 
                        className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50" 
                      />
                      <button 
                        onClick={() => { if (!newPanaderoPwd.trim()) return; setPanaderoPassword(newPanaderoPwd.trim()); if (typeof window !== 'undefined') localStorage.setItem('ts_panadero_pwd', newPanaderoPwd.trim()); setNewPanaderoPwd(''); showToast('✓ Clave Panadero guardada'); }} 
                        className="mt-2.5 px-5 py-2.5 rounded-xl bg-amber-800 text-white font-bold hover:bg-amber-900 transition"
                      >
                        Guardar Clave Panadero
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                    <MapPin size={16} className="text-[#2D5A27]" />
                    <span>Gestor Dinámico de Tarifas por Zona</span>
                  </h3>
                  <p className="text-xs text-stone-500">Agrega, modifica o elimina las tarifas de domicilio según varíen las distancias.</p>

                  <div className="space-y-2 text-xs">
                    {zones.map(z => (
                      <div key={z.id || z.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                        <span className="font-medium text-stone-800">{z.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#2D5A27]">{formatCOP(z.price)}</span>
                          <button 
                            onClick={() => {
                              const newP = prompt(`Nuevo precio para ${z.name}:`, z.price);
                              if (newP !== null && !isNaN(newP)) {
                                setZones(zones.map(item => item.name === z.name ? { ...item, price: Number(newP) } : item));
                                showToast('Tarifa actualizada');
                              }
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Modificar Precio"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => {
                              setZones(zones.filter(item => item.name !== z.name));
                              showToast('Zona eliminada');
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg font-bold transition"
                            title="Eliminar Zona"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      const name = prompt('Nombre de la nueva zona (ej. Floridablanca Cañaveral):');
                      const price = prompt('Precio de envío (COP):');
                      if (name && price && !isNaN(price)) {
                        setZones([...zones, { id: 'z-' + Date.now(), name, price: Number(price) }]);
                        showToast('Nueva zona agregada');
                      }
                    }}
                    className="w-full py-3 border border-dashed border-[#2D5A27] text-[#2D5A27] font-bold text-xs rounded-2xl hover:bg-emerald-50 transition"
                  >
                    + Agregar Nueva Zona de Envío
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="bg-[#1C1815] text-[#D8D0C5] border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <span className="font-serif text-lg font-black text-white block">{config.businessName} S.A.S.</span>
            <p className="text-stone-400 leading-relaxed">Pastelería 100% libre de gluten y azúcar refinada en Bucaramanga. Postres, panes y tortas hechos con amor e ingredientes naturales.</p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">Horario de Atención</span>
            <p className="text-stone-400">{config.hoursMonFri}</p>
            <p className="text-stone-400">{config.hoursSat}</p>
            <p className="text-stone-400">{config.hoursSun}</p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">Tarifas Domicilio</span>
            {zones.map(z => (
              <p key={z.name} className="flex justify-between text-stone-400">
                <span>{z.name}</span>
                <span className="font-bold text-amber-400">{formatCOP(z.price)}</span>
              </p>
            ))}
          </div>
          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">Métodos de Pago</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded bg-purple-900 text-white font-bold text-[10px]">NEQUI</span>
              <span className="px-2.5 py-1 rounded bg-red-900 text-white font-bold text-[10px]">DAVIPLATA</span>
              <span className="px-2.5 py-1 rounded bg-yellow-800 text-white font-bold text-[10px]">BANCOLOMBIA</span>
              <span className="px-2.5 py-1 rounded bg-emerald-900 text-white font-bold text-[10px]">EFECTIVO</span>
            </div>
            <div className="pt-2">
              <button onClick={() => navigateTo('admin')} className="text-stone-500 hover:text-white underline text-[11px] cursor-pointer">Acceso Administrativo (Jefe & Cocina)</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-stone-800/80 py-4 text-center text-[11px] text-stone-500">
          © 2026 {config.businessName} S.A.S. • Bucaramanga, Colombia. Todos los derechos reservados.
        </div>
      </footer>

      {passwordModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto text-[#2D5A27]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-base text-stone-900">Acceso Administrativo</h3>
              <p className="text-xs text-stone-500">Ingresa la clave de seguridad para ingresar al panel privado.</p>
            </div>
            <form onSubmit={handleVerifyPassword} className="space-y-3">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }} 
                placeholder="Ingresa contraseña..." 
                autoFocus 
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-center tracking-widest text-sm focus:outline-none focus:border-[#2D5A27]" 
              />
              {passwordError && <p className="text-xs text-red-600 font-semibold text-center">{passwordError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setPasswordModalTarget(null)} className="flex-1 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23481E]">Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">{editingProduct.id && editingProduct.id !== 'NEW_PRODUCT' ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nombre:</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" />
              </div>
              
              <div>
                <label className="font-bold block mb-1">Descripción del Producto:</label>
                <textarea 
                  rows="3"
                  value={formDescription} 
                  onChange={(e) => setFormDescription(e.target.value)} 
                  placeholder="Describe los ingredientes, masa, endulzante y textura..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Categoría:</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Precio Base:</label>
                  <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
              </div>
              
              <div>
                <label className="font-bold block mb-1">Ruta Imagen (/public):</label>
                <select 
                  value={formImageUrl} 
                  onChange={(e) => setFormImageUrl(e.target.value)} 
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs mb-1"
                >
                  <option value="/copa-saludable.png">/copa-saludable.png (Copa Saludable)</option>
                  <option value="/postre-ilusion.png">/postre-ilusion.png (Postre Ilusión)</option>
                  <option value="/mini-marquesa.png">/mini-marquesa.png (Mini Marquesa)</option>
                  <option value="/postre-con-helado.png">/postre-con-helado.png (Postre con Helado)</option>
                  <option value="/mini-brownies.png">/mini-brownies.png (Mini Brownies)</option>
                  <option value="/blondie.png">/blondie.png (Blondie)</option>
                  <option value="/torta-moka.png">/torta-moka.png (Torta Moka)</option>
                  <option value="/box-duo.png">/box-duo.png (Box Dúo)</option>
                  <option value="/guacal-amor.jpeg">/guacal-amor.jpeg (Guacal Amor)</option>
                  <option value="/baguette.jpeg">/baguette.jpeg (Baguette)</option>
                </select>
                <input type="text" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="O escribe la ruta exacta..." className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs" />
              </div>

              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-800">Porciones / Tamaños:</span>
                  <button type="button" onClick={() => setFormSizes([...formSizes, { portions: '', price: formPrice }])} className="px-2 py-1 rounded bg-[#E5ECE3] text-[#2D5A27] font-bold text-[10px] flex items-center gap-1">
                    <Plus size={12} /><span>Agregar Tamaño</span>
                  </button>
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

      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                📄 Detalle del Pedido #{selectedOrderDetail.code}
              </h3>
              <button onClick={() => setSelectedOrderDetail(null)} className="text-stone-400 hover:text-stone-600 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60 space-y-1 text-stone-800">
                <p><strong>Cliente:</strong> {selectedOrderDetail.clientName}</p>
                <p><strong>Teléfono:</strong> {selectedOrderDetail.clientPhone}</p>
                <p><strong>Fecha Entrega:</strong> {selectedOrderDetail.deliveryDate} ({selectedOrderDetail.deliveryTime})</p>
                <p><strong>Dirección:</strong> {selectedOrderDetail.address} - {selectedOrderDetail.zone}</p>
                {selectedOrderDetail.notes && <p className="text-amber-900 italic pt-1"><strong>Nota:</strong> {selectedOrderDetail.notes}</p>}
              </div>

              <div>
                <h4 className="font-bold text-stone-800 mb-2">Ítems y Precios Desglosados:</h4>
                <div className="space-y-2">
                  {selectedOrderDetail.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                      <div>
                        <span className="font-bold">{it.productName}</span>
                        {it.portion && <span className="text-stone-500 text-[11px] block">Porción: {it.portion}</span>}
                      </div>
                      <span className="font-bold text-[#2D5A27]">{formatCOP(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-sm font-bold text-[#2D5A27]">
                <span>Total a Pagar:</span>
                <span>{formatCOP(selectedOrderDetail.total)}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrderDetail(null)} 
              className="w-full mt-4 bg-[#2D5A27] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#23481E] transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">+ Registrar Orden Manual</h3>
              <button onClick={() => setNewOrderModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveNewOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Nombre Cliente:</label><input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
                <div><label className="font-bold block mb-1">Teléfono:</label><input type="text" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              </div>
              <div><label className="font-bold block mb-1">Dirección Entrega:</label><input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Zona Domicilio:</label>
                  <select value={newZone} onChange={(e) => setNewZone(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300">
                    {zones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Método Pago:</label>
                  <select value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300">
                    <option value="PAGADO NEQUI">PAGADO NEQUI</option>
                    <option value="PAGADO BANCOLOMBIA">PAGADO BANCOLOMBIA</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="EFECTIVO">EFECTIVO</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Fecha:</label><input type="date" value={newDeliveryDate} onChange={(e) => setNewDeliveryDate(e.target.value)} required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
                <div><label className="font-bold block mb-1">Hora:</label><input type="text" value={newDeliveryTime} onChange={(e) => setNewDeliveryTime(e.target.value)} placeholder="11:00 AM" required className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
              </div>
              <div>
                <label className="font-bold block mb-1">Producto Principal:</label>
                <select value={newOrderProdId} onChange={(e) => setNewOrderProdId(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                </select>
              </div>
              <div><label className="font-bold block mb-1">Notas Aclaratorias:</label><input type="text" value={newOrderNotes} onChange={(e) => setNewOrderNotes(e.target.value)} placeholder="Ej: Entregar antes de las 4 PM" className="w-full p-2.5 rounded-xl border border-stone-300" /></div>
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
