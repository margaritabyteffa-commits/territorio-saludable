'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Phone,
  ShieldCheck,
  X,
  Clock,
  Lock,
  KeyRound,
  ChefHat,
  LogOut,
  MapPin,
  AlertCircle,
  Info,
  CreditCard,
  Calendar,
  CalendarDays,
  ShoppingBag,
  ClipboardList,
  Eye,
  Settings,
  Instagram,
  Facebook,
  MessageCircle,
  ExternalLink,
  Check
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ==========================================
export const DEFAULT_CONFIG = {
  businessName: 'Territorio Saludable S.A.S.',
  whatsappPhone: '573158894210',
  instagramUrl: 'https://instagram.com/territoriosaludable',
  facebookUrl: 'https://facebook.com/territoriosaludable',
  hoursWeekday: '8:00 AM – 6:00 PM',
  hoursSaturday: '8:00 AM – 5:00 PM',
  hoursSunday: '9:00 AM – 2:00 PM',
  calendarEmbedUrl: 'https://calendar.google.com/calendar/embed?src=territoriosaludable%40gmail.com&ctz=America%2FBogota'
};

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
const DEFAULT_IMAGE_FALLBACK = '/torta-moka.png';

const ADMIN_PASSWORD_DEFAULT = '1234';
const PANADERO_PASSWORD_DEFAULT = '5678';

export const CATEGORIES = [
  'Tortas Saludables',
  'Catalogo Detalles',
  'Pan Saludable',
  'Postres Saludables',
  'Mercadito'
];

export const DIETARY_TAGS = ['Todas', 'Keto', 'Sin Gluten', 'Sin Azúcar', 'Sin Lácteos', 'Entrega Hoy', 'Con Anticipación'];

export const DELIVERY_ZONES = [
  { name: 'Cabecera / Sotomayor / Prado', price: 5000 },
  { name: 'Centro / San Francisco', price: 7000 },
  { name: 'Floridablanca / Cañaveral', price: 10000 },
  { name: 'Girón / Piedecuesta', price: 15000 }
];

// Catálogo oficial inicial con imágenes limpias en /public
export const initialProducts = [
  // 1. TORTAS SALUDABLES
  {
    id: 'prod-torta-moka',
    name: 'Torta Moka',
    category: 'Tortas Saludables',
    description: 'Bizcocho esponjoso con infusión de café espresso colombiano, cacao puro y crema moka sedosa sin azúcar.',
    price: 84000,
    imageUrl: '/torta-moka.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 73000, label: '5 porc ($73.000)' },
      { portions: '8 porc', price: 95000, label: '8 porc ($95.000)' },
      { portions: '12 porc', price: 120000, label: '12 porc ($120.000)' }
    ]
  },
  {
    id: 'prod-torta-arequipe',
    name: 'Torta de Arequipe',
    category: 'Tortas Saludables',
    description: 'Capas doradas rellenas de dulce de leche artesanal sin azúcar añadida y sin lactosa. Textura suave y tradicional.',
    price: 82000,
    imageUrl: '/torta-de-arequipe.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 73000, label: '5 porc ($73.000)' },
      { portions: '8 porc', price: 92000, label: '8 porc ($92.000)' },
      { portions: '12 porc', price: 118000, label: '12 porc ($118.000)' }
    ]
  },
  {
    id: 'prod-torta-chocoarequipe',
    name: 'Torta Choco-Arequipe',
    category: 'Tortas Saludables',
    description: 'La combinación perfecta de chocolate amargo 70% y arequipe artesanal saludable en capas jugosas.',
    price: 86000,
    imageUrl: '/torta-chocoarequipe.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 75000, label: '5 porc ($75.000)' },
      { portions: '8 porc', price: 98000, label: '8 porc ($98.000)' },
      { portions: '12 porc', price: 125000, label: '12 porc ($125.000)' }
    ]
  },
  {
    id: 'prod-torta-pistacho',
    name: 'Torta Pistacho',
    category: 'Tortas Saludables',
    description: 'Bizcocho fino de harina de almendras y pistachos tostados premium con suave cobertura cremosa.',
    price: 95000,
    imageUrl: '/torta-pistacho.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 82000, label: '5 porc ($82.000)' },
      { portions: '8 porc', price: 110000, label: '8 porc ($110.000)' },
      { portions: '12 porc', price: 138000, label: '12 porc ($138.000)' }
    ]
  },
  {
    id: 'prod-torta-vasca-pistacho',
    name: 'Torta Vasca Pistacho',
    category: 'Tortas Saludables',
    description: 'Cheesecake vasco tostado en superficie y centro ultra cremoso con pasta pura de pistachos naturales.',
    price: 92000,
    imageUrl: '/tortas-vasca-pistacho.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 78000, label: '5 porc ($78.000)' },
      { portions: '8 porc', price: 105000, label: '8 porc ($105.000)' },
      { portions: '12 porc', price: 130000, label: '12 porc ($130.000)' }
    ]
  },
  {
    id: 'prod-torta-primavera',
    name: 'Torta Primavera',
    category: 'Tortas Saludables',
    description: 'Frescura total con flores comestibles y reducción de frutos cítricos sobre bizcocho liviano de almendras.',
    price: 88000,
    imageUrl: '/torta-primavera.jpeg',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 73000, label: '5 porc ($73.000)' },
      { portions: '8 porc', price: 96000, label: '8 porc ($96.000)' },
      { portions: '12 porc', price: 122000, label: '12 porc ($122.000)' }
    ]
  },
  {
    id: 'prod-torta-vasca-frutos',
    name: 'Torta Vasca Frutos Rojos o Amarillos',
    category: 'Tortas Saludables',
    description: 'Tarta de queso caramelizada al estilo vasco, horneada a alta temperatura con centro fundente y coulis artesanal de frutos frescos.',
    price: 73000,
    imageUrl: '/torta-vasca-frutos-rojos-o-amarillos.jpeg',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 73000, label: '5 porc ($73.000)' },
      { portions: '8 porc', price: 100000, label: '8 porc ($100.000)' },
      { portions: '12 porc', price: 120000, label: '12 porc ($120.000)' }
    ]
  },
  {
    id: 'prod-mousse-cake',
    name: 'Mousse Cake',
    category: 'Tortas Saludables',
    description: 'Delicada torta mousse aireada de chocolate belga sin azúcar y frutos del bosque con base crocante de nueces.',
    price: 73000,
    imageUrl: '/mousse-cake.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 73000, label: '5 porc ($73.000)' },
      { portions: '8 porc', price: 100000, label: '8 porc ($100.000)' },
      { portions: '12 porc', price: 120000, label: '12 porc ($120.000)' }
    ]
  },
  {
    id: 'prod-marquesa-brownie',
    name: 'Marquesa de Brownie',
    category: 'Tortas Saludables',
    description: 'Capas intercaladas de brownie melcochudo de cacao fino y crema sedosa de chocolate con arequipe fit.',
    price: 75000,
    imageUrl: '/marquesa-de-brownie.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 75000, label: '5 porc ($75.000)' },
      { portions: '8 porc', price: 115000, label: '8 porc ($115.000)' },
      { portions: '12 porc', price: 146000, label: '12 porc ($146.000)' }
    ]
  },
  {
    id: 'prod-torta-vino',
    name: 'Torta de Vino',
    category: 'Tortas Saludables',
    description: 'Tradición macerada en especias naturales, nueces y frutos secos selectos, endulzada de forma 100% natural.',
    price: 89000,
    imageUrl: '/torta-de-vino.jpeg',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 75000, label: '5 porc ($75.000)' },
      { portions: '8 porc', price: 98000, label: '8 porc ($98.000)' },
      { portions: '12 porc', price: 124000, label: '12 porc ($124.000)' }
    ]
  },
  {
    id: 'prod-torta-yogurt',
    name: 'Torta de Yogurt',
    category: 'Tortas Saludables',
    description: 'Bizcocho aireado a base de yogurt griego deslactosado y ralladura de limón persa. Muy liviana.',
    price: 78000,
    imageUrl: '/torta-de-yogurt.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 70000, label: '5 porc ($70.000)' },
      { portions: '8 porc', price: 88000, label: '8 porc ($88.000)' },
      { portions: '12 porc', price: 112000, label: '12 porc ($112.000)' }
    ]
  },
  {
    id: 'prod-torta-versalles',
    name: 'Torta Versalles',
    category: 'Tortas Saludables',
    description: 'Elegancia clásica en capas finas de almendra, ganache de chocolate blanco sin azúcar y fresas frescas.',
    price: 90000,
    imageUrl: '/torta-versalles.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 78000, label: '5 porc ($78.000)' },
      { portions: '8 porc', price: 99000, label: '8 porc ($99.000)' },
      { portions: '12 porc', price: 126000, label: '12 porc ($126.000)' }
    ]
  },
  {
    id: 'prod-torta-victoria',
    name: 'Torta Victoria',
    category: 'Tortas Saludables',
    description: 'Inspiración británica con mermelada casera de frambuesas sin azúcar y chantilly ligera.',
    price: 88000,
    imageUrl: '/torta-victoria.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 75000, label: '5 porc ($75.000)' },
      { portions: '8 porc', price: 96000, label: '8 porc ($96.000)' },
      { portions: '12 porc', price: 122000, label: '12 porc ($122.000)' }
    ]
  },
  {
    id: 'prod-torta-volcan',
    name: 'Torta Volcán',
    category: 'Tortas Saludables',
    description: 'Corazón fluido de chocolate tibio al corte con bizcocho suave de cacao al 85%.',
    price: 85000,
    imageUrl: '/torta-volcan.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 75000, label: '5 porc ($75.000)' },
      { portions: '8 porc', price: 95000, label: '8 porc ($95.000)' },
      { portions: '12 porc', price: 120000, label: '12 porc ($120.000)' }
    ]
  },
  {
    id: 'prod-torta-zanahoria',
    name: 'Torta Zanahoria',
    category: 'Tortas Saludables',
    description: 'Bizcocho húmedo con zanahorias orgánicas ralladas, canela de Ceilán, nueces del nogal y frosting de queso crema.',
    price: 82000,
    imageUrl: '/torta-zanahoria.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 72000, label: '5 porc ($72.000)' },
      { portions: '8 porc', price: 92000, label: '8 porc ($92.000)' },
      { portions: '12 porc', price: 116000, label: '12 porc ($116.000)' }
    ]
  },
  {
    id: 'prod-torta-chocoluxe',
    name: 'Torta Chocoluxe',
    category: 'Tortas Saludables',
    description: 'Máxima indulgencia chocolatosa sin remordimientos: triple chocolate oscuro, textura densa y fudge saludable.',
    price: 94000,
    imageUrl: '/torta-chocoluxe.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 78000, label: '5 porc ($78.000)' },
      { portions: '8 porc', price: 102000, label: '8 porc ($102.000)' },
      { portions: '12 porc', price: 128000, label: '12 porc ($128.000)' }
    ]
  },
  {
    id: 'prod-torta-matilda',
    name: 'Torta Matilda',
    category: 'Tortas Saludables',
    description: 'Inspirada en el clásico pastel fudge húmedo y chocolatoso de película, adaptado 100% keto y sin azúcar.',
    price: 96000,
    imageUrl: '/matilda.jpeg',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 80000, label: '5 porc ($80.000)' },
      { portions: '8 porc', price: 104000, label: '8 porc ($104.000)' },
      { portions: '12 porc', price: 130000, label: '12 porc ($130.000)' }
    ]
  },
  {
    id: 'prod-luna-almendras',
    name: 'Luna de Almendras',
    category: 'Tortas Saludables',
    description: 'Fina masa quebrada a base de almendras tostadas con relleno cremoso y láminas doradas.',
    price: 84000,
    imageUrl: '/luna-de-almendras.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 73000, label: '5 porc ($73.000)' },
      { portions: '8 porc', price: 94000, label: '8 porc ($94.000)' },
      { portions: '12 porc', price: 118000, label: '12 porc ($118.000)' }
    ]
  },
  {
    id: 'prod-maria-luisa',
    name: 'María Luisa',
    category: 'Tortas Saludables',
    description: 'Bizcochuelo tradicional colombiano esponjoso relleno de arequipe sin azúcar y mermelada de mora silvestre.',
    price: 79000,
    imageUrl: '/maria-luisa.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 70000, label: '5 porc ($70.000)' },
      { portions: '8 porc', price: 89000, label: '8 porc ($89.000)' },
      { portions: '12 porc', price: 112000, label: '12 porc ($112.000)' }
    ]
  },
  {
    id: 'prod-guanabana',
    name: 'Guanábana',
    category: 'Tortas Saludables',
    description: 'Pulpa 100% natural de guanábana fresca entre capas de bizcocho suave sin gluten y crema suave.',
    price: 86000,
    imageUrl: '/guanabana.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 74000, label: '5 porc ($74.000)' },
      { portions: '8 porc', price: 95000, label: '8 porc ($95.000)' },
      { portions: '12 porc', price: 120000, label: '12 porc ($120.000)' }
    ]
  },
  {
    id: 'prod-quebec',
    name: 'Quebec',
    category: 'Tortas Saludables',
    description: 'Notas de nuez pecana tostada, canela y toque sutil de caramelo sin azúcar sobre base de almendras.',
    price: 89000,
    imageUrl: '/quebec.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 75000, label: '5 porc ($75.000)' },
      { portions: '8 porc', price: 98000, label: '8 porc ($98.000)' },
      { portions: '12 porc', price: 124000, label: '12 porc ($124.000)' }
    ]
  },
  {
    id: 'prod-sin-lacteos',
    name: 'Sin Lácteos Especial',
    category: 'Tortas Saludables',
    description: 'Diseñada para estómagos sensibles: cero trazas lácteas con crema de coco orgánica batida y cacao fino.',
    price: 88000,
    imageUrl: '/sin-lacteos.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Sin Lácteos'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 74000, label: '5 porc ($74.000)' },
      { portions: '8 porc', price: 96000, label: '8 porc ($96.000)' },
      { portions: '12 porc', price: 120000, label: '12 porc ($120.000)' }
    ]
  },
  {
    id: 'prod-capas-red-velvet',
    name: 'Capas Red Velvet',
    category: 'Tortas Saludables',
    description: 'Intenso color rubí natural extraído de remolacha y cacao, combinado con capas de betún sedoso de vainilla.',
    price: 90000,
    imageUrl: '/capas-red-velvet.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 76000, label: '5 porc ($76.000)' },
      { portions: '8 porc', price: 99000, label: '8 porc ($99.000)' },
      { portions: '12 porc', price: 125000, label: '12 porc ($125.000)' }
    ]
  },
  {
    id: 'prod-capas-vainilla-chocolate',
    name: 'Capas Vainilla y Chocolate',
    category: 'Tortas Saludables',
    description: 'El dúo favorito de la casa: pisos alternados de vainilla de Madagascar y chocolate intenso 70%.',
    price: 85000,
    imageUrl: '/capas-vainilla-y-chocolate.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 73000, label: '5 porc ($73.000)' },
      { portions: '8 porc', price: 95000, label: '8 porc ($95.000)' },
      { portions: '12 porc', price: 118000, label: '12 porc ($118.000)' }
    ]
  },
  {
    id: 'prod-torta-naranja-amapola',
    name: 'Torta de Naranja y Semillas de Amapola',
    category: 'Tortas Saludables',
    description: 'Bizcocho aromático con zumo de naranjas valencianas recién exprimidas y crujientes semillas de amapola.',
    price: 80000,
    imageUrl: '/torta-naranja-amapola.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: '5 porc', price: 70000, label: '5 porc ($70.000)' },
      { portions: '8 porc', price: 90000, label: '8 porc ($90.000)' },
      { portions: '12 porc', price: 115000, label: '12 porc ($115.000)' }
    ]
  },

  // 2. CATALOGO DETALLES
  {
    id: 'prod-mini-cake-personal',
    name: 'Mini Cake Personal',
    category: 'Catalogo Detalles',
    description: 'Pastelito individual para consentirte o celebrar un cumpleaños especial con mensaje y decoración delicada.',
    price: 28000,
    imageUrl: '/mini-cake-personal.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: false,
    sizes: [
      { portions: 'Tamaño personal', price: 28000, label: 'Tamaño personal ($28.000)' }
    ]
  },
  {
    id: 'prod-brownies-x2',
    name: 'Brownies x2',
    category: 'Catalogo Detalles',
    description: 'Caja para regalo con 2 brownies melcochudos de chocolate puro, nueces picadas y sin azúcar añadida.',
    price: 26000,
    imageUrl: '/brownies-x2.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Caja x2 Unidades', price: 26000, label: 'Caja x2 Unidades ($26.000)' }
    ]
  },
  {
    id: 'prod-galletas-x2',
    name: 'Galletas x2',
    category: 'Catalogo Detalles',
    description: 'Dúo de galletas suaves artesanales con chips de chocolate 70% y harina de almendras tostadas.',
    price: 20000,
    imageUrl: '/galletas-x2.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Caja x2 Unidades', price: 20000, label: 'Caja x2 Unidades ($20.000)' }
    ]
  },
  {
    id: 'prod-caja-postres-surtidos',
    name: 'Caja de Postres Surtidos',
    category: 'Catalogo Detalles',
    description: 'La opción predilecta para obsequios: incluye mini brownie, alfajor keto, galleta artesanal y trufa fina.',
    price: 48000,
    imageUrl: '/caja-postres-surtidos.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: 'Caja Surtida 4 Unidades', price: 48000, label: 'Caja Surtida 4 Unidades ($48.000)' }
    ]
  },

  // 3. PAN SALUDABLE
  {
    id: 'prod-pan-artesanal',
    name: 'Pan Artesanal Saludable',
    category: 'Pan Saludable',
    description: 'Hogaza de fermentación lenta, miga tierna y corteza dorada. Elaborado con harinas de semillas y masa madre fit.',
    price: 18000,
    imageUrl: '/pan-artesanal.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: true,
    sizes: [
      { portions: 'Unidad grande 450g', price: 18000, label: 'Unidad grande 450g ($18.000)' }
    ]
  },
  {
    id: 'prod-pan-masa-madre',
    name: 'Pan de Masa Madre Fit',
    category: 'Pan Saludable',
    description: 'Fermentado pacientemente durante 24 horas para una digestión ligera. Cero harinas refinadas.',
    price: 20000,
    imageUrl: '/pan-artesanal.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: true,
    sizes: [
      { portions: 'Hogaza 500g', price: 20000, label: 'Hogaza 500g ($20.000)' }
    ]
  },
  {
    id: 'prod-pan-hamburguesa',
    name: 'Panes de Hamburguesa x4',
    category: 'Pan Saludable',
    description: 'Pack de 4 panes suaves con semillas de sésamo blanco y dorado. Resistentes y esponjosos.',
    price: 24000,
    imageUrl: '/pan-artesanal.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Pack x4 unidades', price: 24000, label: 'Pack x4 unidades ($24.000)' }
    ]
  },
  {
    id: 'prod-baguette',
    name: 'Baguette Tradicional Fit',
    category: 'Pan Saludable',
    description: 'Clásica barra francesa con corteza crocante y alvéolos suaves, 100% apta para celíacos.',
    price: 14000,
    imageUrl: '/baguette.jpeg',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: false,
    sizes: [
      { portions: 'Baguette 300g', price: 14000, label: 'Baguette 300g ($14.000)' }
    ]
  },

  // 4. POSTRES SALUDABLES
  {
    id: 'prod-mini-marquesa-brownie',
    name: 'Mini Marquesa de Brownie',
    category: 'Postres Saludables',
    description: 'Porción individual del clásico postre maridado de brownie melcochudo y arequipe saludable para calmar antojos.',
    price: 35000,
    imageUrl: '/mini-marquesa-de-brownie.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: false,
    sizes: [
      { portions: 'Tamaño personal', price: 35000, label: 'Tamaño personal ($35.000)' }
    ]
  },
  {
    id: 'prod-postre-helado',
    name: 'Postre con Helado',
    category: 'Postres Saludables',
    description: 'Brownie tibio recién horneado acompañado de bola generosa de helado artesanal de vainilla sin azúcar.',
    price: 32000,
    imageUrl: '/postre-con-helado.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Porción individual con helado', price: 32000, label: 'Porción individual ($32.000)' }
    ]
  },
  {
    id: 'prod-blondie',
    name: 'Blondie con Chocolate Blanco',
    category: 'Postres Saludables',
    description: 'Cuadrado denso de vainilla caramelizada y trozos fundentes de chocolate blanco sin azúcar y nueces.',
    price: 18000,
    imageUrl: '/blondie.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: false,
    sizes: [
      { portions: 'Unidad individual 120g', price: 18000, label: 'Unidad individual ($18.000)' }
    ]
  },
  {
    id: 'prod-3leches-mermelada',
    name: 'Tres Leches con Mermelada',
    category: 'Postres Saludables',
    description: 'Bizcocho humedecido en leche de almendras, coco y crema deslactosada, coronado con mermelada de frutos rojos.',
    price: 24000,
    imageUrl: '/3-leches-con-mermelada.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten'],
    requiresNotice: false,
    sizes: [
      { portions: 'Copa individual 250ml', price: 24000, label: 'Copa individual ($24.000)' }
    ]
  },
  {
    id: 'prod-alfajores-x4',
    name: 'Alfajores Keto x4',
    category: 'Postres Saludables',
    description: 'Tapas suaves de maicena y almendras rellenas de arequipe keto y rodadas por coco rallado fino.',
    price: 28000,
    imageUrl: '/caja-postres-surtidos.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Caja x4 unidades', price: 28000, label: 'Caja x4 unidades ($28.000)' }
    ]
  },

  // 5. MERCADITO
  {
    id: 'prod-arequipe-pote',
    name: 'Arequipe Artesanal Saludable (Frasco)',
    category: 'Mercadito',
    description: 'Nuestro famoso dulce de leche sin azúcar añadida en frasco de vidrio de 250g. Ideal para untar en frutas o panes.',
    price: 22000,
    imageUrl: '/arequipe.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Frasco 250g', price: 22000, label: 'Frasco 250g ($22.000)' }
    ]
  },
  {
    id: 'prod-crema-mani',
    name: 'Mantequilla de Maní Natural 300g',
    category: 'Mercadito',
    description: '100% maní tostado molido a la piedra, sin aceites vegetales añadidos, sin sal ni azúcar.',
    price: 19000,
    imageUrl: '/arequipe.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Frasco 300g', price: 19000, label: 'Frasco 300g ($19.000)' }
    ]
  },
  {
    id: 'prod-granola-keto',
    name: 'Granola Keto Crunch 280g',
    category: 'Mercadito',
    description: 'Mix crujiente de nueces, almendras, semillas de calabaza, chía y coco tostado con canela y monk fruit.',
    price: 25000,
    imageUrl: '/caja-postres-surtidos.png',
    available: true,
    features: ['Sin Azúcar', 'Sin Gluten', 'Keto'],
    requiresNotice: false,
    sizes: [
      { portions: 'Bolsa hermética 280g', price: 25000, label: 'Bolsa 280g ($25.000)' }
    ]
  }
];

// Pedidos iniciales
export const initialOrders = [
  {
    id: 'ord-101',
    code: 'TS-2026-101',
    clientName: 'Camila Rodriguez',
    clientPhone: '573158901234',
    address: 'Cra 35 # 48-12 Apto 502, Cabecera',
    zone: 'Cabecera / Sotomayor / Prado',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: '10:30 AM',
    items: [
      { productName: 'Torta Moka', portion: '8 porc', quantity: 1, price: 95000 },
      { productName: 'Mini Marquesa de Brownie', portion: 'Tamaño personal', quantity: 2, price: 35000 }
    ],
    total: 170000,
    status: 'En Cocina',
    paymentMethod: 'Nequi',
    notes: 'Poner vela dorada de cumpleaños y lazo de regalo.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ord-102',
    code: 'TS-2026-102',
    clientName: 'Santiago Morales',
    clientPhone: '573007654321',
    address: 'Calle 158 # 22-45, Cañaveral',
    zone: 'Floridablanca / Cañaveral',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: '2:30 PM',
    items: [
      { productName: 'Torta Vasca Pistacho', portion: '5 porc', quantity: 1, price: 78000 },
      { productName: 'Pan Artesanal Saludable', portion: 'Unidad grande 450g', quantity: 2, price: 18000 }
    ],
    total: 124000,
    status: 'Pendiente',
    paymentMethod: 'Bancolombia',
    notes: 'Llamar antes de ingresar a la portería.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ord-103',
    code: 'TS-2026-103',
    clientName: 'Valentina Gómez',
    clientPhone: '573183321144',
    address: 'Calle 36 # 19-20, Centro',
    zone: 'Centro / San Francisco',
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryTime: '11:00 AM',
    items: [
      { productName: 'Torta Chocoluxe', portion: '12 porc', quantity: 1, price: 128000 },
      { productName: 'Brownies x2', portion: 'Caja x2 Unidades', quantity: 1, price: 26000 }
    ],
    total: 161000,
    status: 'Pendiente',
    paymentMethod: 'Daviplata',
    notes: 'Para celebrar aniversario familiar.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ord-104',
    code: 'TS-2026-104',
    clientName: 'Carlos Andrés Peña',
    clientPhone: '573124567890',
    address: 'Cra 28 # 52-10, Sotomayor',
    zone: 'Cabecera / Sotomayor / Prado',
    deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    deliveryTime: '4:00 PM',
    items: [
      { productName: 'Torta Zanahoria', portion: '8 porc', quantity: 1, price: 92000 }
    ],
    total: 97000,
    status: 'Entregado',
    paymentMethod: 'Efectivo',
    notes: 'Entregado a entera satisfacción.',
    createdAt: new Date().toISOString()
  }
];

// Helper para formato de moneda
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price);
};

// Generador de enlace a Google Calendar
export const getGoogleCalendarUrl = (order) => {
  const title = `Entrega TS: ${order.clientName} (${order.code})`;
  const itemsList = order.items.map((i) => `${i.quantity}x ${i.productName}${i.portion ? ' (' + i.portion + ')' : ''}`).join(', ');
  const details = `Pastelería Territorio Saludable S.A.S.\nPedido: ${order.code}\nCliente: ${order.clientName}\nTeléfono: +${order.clientPhone}\nDirección: ${order.address}\nZona: ${order.zone}\nTotal: $${Number(order.total).toLocaleString('es-CO')}\nMétodo de pago: ${order.paymentMethod}\n\nProductos agendados:\n${itemsList}\n\nNotas: ${order.notes || 'Sin notas adicionales'}`;
  const location = `${order.address}, ${order.zone}, Bucaramanga, Santander, Colombia`;

  const dateRaw = order.deliveryDate ? order.deliveryDate.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const start = `${dateRaw}T100000`;
  const end = `${dateRaw}T110000`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
};

const ensureSlash = (url) => {
  if (!url) return DEFAULT_IMAGE_FALLBACK;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

// ==========================================
// COMPONENTE PRINCIPAL NEXT.JS PAGE
// ==========================================
export default function Page() {
  // Roles de vista
  const [currentView, setCurrentView] = useState('public');
  const [authRole, setAuthRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ts_auth_role');
      if (stored === 'admin' || stored === 'panadero') return stored;
    }
    return null;
  });

  // Sub-pestañas
  const [adminTab, setAdminTab] = useState('inventario');
  const [panaderoTab, setPanaderoTab] = useState('pedidos');

  // Configuración general de tienda
  const [storeConfig, setStoreConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ts_store_config_v2');
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Error cargando config:', err);
      }
    }
    return DEFAULT_CONFIG;
  });

  // Contraseñas
  const [adminPassword, setAdminPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ts_admin_pwd') || ADMIN_PASSWORD_DEFAULT;
    }
    return ADMIN_PASSWORD_DEFAULT;
  });

  const [panaderoPassword, setPanaderoPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ts_panadero_pwd') || PANADERO_PASSWORD_DEFAULT;
    }
    return PANADERO_PASSWORD_DEFAULT;
  });

  // Modal de Login
  const [passwordModalTarget, setPasswordModalTarget] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Formulario de seguridad dentro de Configuración
  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [newPanaderoPwd, setNewPanaderoPwd] = useState('');

  // Config temporal form
  const [cfgBusinessName, setCfgBusinessName] = useState(storeConfig.businessName);
  const [cfgWhatsappPhone, setCfgWhatsappPhone] = useState(storeConfig.whatsappPhone);
  const [cfgInstagramUrl, setCfgInstagramUrl] = useState(storeConfig.instagramUrl);
  const [cfgFacebookUrl, setCfgFacebookUrl] = useState(storeConfig.facebookUrl);
  const [cfgHoursWeekday, setCfgHoursWeekday] = useState(storeConfig.hoursWeekday);
  const [cfgHoursSaturday, setCfgHoursSaturday] = useState(storeConfig.hoursSaturday);
  const [cfgHoursSunday, setCfgHoursSunday] = useState(storeConfig.hoursSunday);
  const [cfgCalendarEmbedUrl, setCfgCalendarEmbedUrl] = useState(storeConfig.calendarEmbedUrl);

  // Catálogo de Productos
  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ts_products_catalog_v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => ({
              ...item,
              imageUrl: ensureSlash(item.imageUrl),
              available: typeof item.available === 'boolean' ? item.available : true,
              features: Array.isArray(item.features) ? item.features : ['Sin Azúcar', 'Sin Gluten']
            }));
          }
        }
      } catch (err) {
        console.warn('Error leyendo catálogo:', err);
      }
    }
    return initialProducts;
  });

  // Lista de Pedidos
  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ts_orders_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.warn('Error leyendo órdenes:', err);
      }
    }
    return initialOrders;
  });

  // Filtros público
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [activeDietaryTag, setActiveDietaryTag] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortions, setSelectedPortions] = useState({});
  const [infoModalProduct, setInfoModalProduct] = useState(null);

  // Filtros Pedidos
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Todos');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Modal Nuevo Pedido Manual
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [moClientName, setMoClientName] = useState('');
  const [moClientPhone, setMoClientPhone] = useState('');
  const [moAddress, setMoAddress] = useState('');
  const [moZone, setMoZone] = useState('Cabecera / Sotomayor / Prado');
  const [moDeliveryDate, setMoDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [moDeliveryTime, setMoDeliveryTime] = useState('11:00 AM');
  const [moSelectedProductId, setMoSelectedProductId] = useState(products[0]?.id || '');
  const [moSelectedPortion, setMoSelectedPortion] = useState('');
  const [moQuantity, setMoQuantity] = useState(1);
  const [moPaymentMethod, setMoPaymentMethod] = useState('Nequi');
  const [moNotes, setMoNotes] = useState('');

  // Filtros Cocina / Panadero
  const [panaderoCategoryFilter, setPanaderoCategoryFilter] = useState('Todas');
  const [panaderoStatusFilter, setPanaderoStatusFilter] = useState('all');
  const [panaderoSearch, setPanaderoSearch] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Formulario Producto Admin
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Tortas Saludables');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState('/torta-moka.png');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatures, setFormFeatures] = useState(['Sin Azúcar', 'Sin Gluten']);
  const [formRequiresNotice, setFormRequiresNotice] = useState(true);
  const [formSizes, setFormSizes] = useState([]);

  // Sincronizaciones con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ts_products_catalog_v4', JSON.stringify(products));
    } catch (err) {
      console.warn('Error guardando catálogo:', err);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('ts_orders_v2', JSON.stringify(orders));
    } catch (err) {
      console.warn('Error guardando órdenes:', err);
    }
  }, [orders]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleRequestProtectedAccess = (targetRole) => {
    if (authRole === 'admin') {
      setCurrentView(targetRole);
      return;
    }
    if (authRole === 'panadero' && targetRole === 'panadero') {
      setCurrentView('panadero');
      return;
    }
    setPasswordModalTarget(targetRole);
    setPasswordInput('');
    setPasswordError('');
  };

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();

    if (passwordModalTarget === 'admin') {
      if (cleanPass === adminPassword) {
        setAuthRole('admin');
        if (typeof window !== 'undefined') sessionStorage.setItem('ts_auth_role', 'admin');
        setCurrentView('admin');
        setPasswordModalTarget(null);
        showToast('✓ Acceso concedido: Administradora (Jefe)');
      } else {
        setPasswordError('Contraseña incorrecta. Inténtalo de nuevo.');
      }
    } else if (passwordModalTarget === 'panadero') {
      if (cleanPass === panaderoPassword || cleanPass === adminPassword) {
        const roleGranted = cleanPass === adminPassword ? 'admin' : 'panadero';
        setAuthRole(roleGranted);
        if (typeof window !== 'undefined') sessionStorage.setItem('ts_auth_role', roleGranted);
        setCurrentView('panadero');
        setPasswordModalTarget(null);
        showToast('✓ Acceso concedido: Producción de Cocina (Empleado)');
      } else {
        setPasswordError('Contraseña incorrecta. Inténtalo de nuevo.');
      }
    }
  };

  const handleLogout = () => {
    setAuthRole(null);
    if (typeof window !== 'undefined') sessionStorage.removeItem('ts_auth_role');
    setCurrentView('public');
    showToast('Sesión finalizada con éxito');
  };

  const navigateTo = (view) => {
    if (view === 'public') {
      setCurrentView('public');
    } else {
      handleRequestProtectedAccess(view);
    }
  };

  // Reordenar producto
  const handleMoveProduct = (productId, direction) => {
    const currentIndex = products.findIndex((p2) => p2.id === productId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newOrder = [...products];
    const [movedItem] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    setProducts(newOrder);
    showToast(`"${movedItem.name}" movido hacia ${direction === 'up' ? 'arriba ⬆️' : 'abajo ⬇️'}`);
  };

  // Toggle disponibilidad
  const handleToggleProductStatus = (productId) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const nextState = !item.available;
          showToast(
            nextState
              ? `✓ "${item.name}" marcado como DISPONIBLE`
              : `✕ "${item.name}" marcado como AGOTADO`
          );
          return { ...item, available: nextState };
        }
        return item;
      })
    );
  };

  // CRUD Producto
  const handleAddSizeRow = () => {
    setFormSizes((prev) => [...prev, { portions: '', price: formPrice || 50000 }]);
  };

  const handleUpdateSizeRow = (index, field, value) => {
    setFormSizes((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveSizeRow = (index) => {
    setFormSizes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormImageUrl(product.imageUrl || DEFAULT_IMAGE_FALLBACK);
    setFormAvailable(product.available);
    setFormFeatures(product.features || ['Sin Azúcar', 'Sin Gluten']);
    setFormRequiresNotice(product.requiresNotice ?? (product.category === 'Tortas Saludables' || product.category === 'Pan Saludable'));
    if (product.sizes && product.sizes.length > 0) {
      setFormSizes(product.sizes.map((s) => ({ portions: s.portions, price: s.price })));
    } else {
      setFormSizes([]);
    }
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Tortas Saludables');
    setFormDescription('');
    setFormPrice(45000);
    setFormImageUrl('/torta-moka.png');
    setFormAvailable(true);
    setFormFeatures(['Sin Azúcar', 'Sin Gluten']);
    setFormRequiresNotice(true);
    setFormSizes([]);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Escribe un nombre para el producto');
      return;
    }

    const cleanImageUrl = ensureSlash(formImageUrl);

    const cleanedSizes = formSizes
      .filter((s) => s.portions.trim().length > 0 && Number(s.price) > 0)
      .map((s) => ({
        portions: s.portions.trim(),
        price: Number(s.price),
        label: `${s.portions.trim()} (${formatPrice(Number(s.price))})`
      }));

    const finalBasePrice =
      cleanedSizes.length > 0
        ? Number(formPrice) || cleanedSizes[0].price
        : Number(formPrice) || 0;

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: formName.trim(),
                category: formCategory,
                description: formDescription.trim(),
                price: finalBasePrice,
                imageUrl: cleanImageUrl,
                available: formAvailable,
                features: formFeatures,
                requiresNotice: formRequiresNotice,
                sizes: cleanedSizes.length > 0 ? cleanedSizes : undefined
              }
            : item
        )
      );
      showToast(`✓ Producto "${formName.trim()}" actualizado`);
    } else {
      const newProd = {
        id: `prod-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        price: finalBasePrice,
        imageUrl: cleanImageUrl,
        available: formAvailable,
        features: formFeatures,
        requiresNotice: formRequiresNotice,
        sizes: cleanedSizes.length > 0 ? cleanedSizes : undefined
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast(`✓ Nuevo producto "${formName.trim()}" agregado`);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId, productName) => {
    if (confirm(`¿Eliminar definitivamente "${productName}" del catálogo?`)) {
      setProducts((prev) => prev.filter((p2) => p2.id !== productId));
      showToast(`Producto "${productName}" eliminado`);
    }
  };

  const handleResetCatalog = () => {
    if (confirm('¿Restablecer el catálogo oficial con todas las fotos limpias de /public?')) {
      setProducts(initialProducts);
      showToast('✓ Catálogo oficial restablecido');
    }
  };

  const toggleFormFeature = (feature) => {
    if (formFeatures.includes(feature)) {
      setFormFeatures(formFeatures.filter((f) => f !== feature));
    } else {
      setFormFeatures([...formFeatures, feature]);
    }
  };

  // Guardar Configuración General & Seguridad (Solo Jefe)
  const handleSaveStoreConfig = (e) => {
    e.preventDefault();
    const updatedCfg = {
      businessName: cfgBusinessName.trim() || DEFAULT_CONFIG.businessName,
      whatsappPhone: cfgWhatsappPhone.trim().replace(/[^0-9]/g, '') || DEFAULT_CONFIG.whatsappPhone,
      instagramUrl: cfgInstagramUrl.trim() || DEFAULT_CONFIG.instagramUrl,
      facebookUrl: cfgFacebookUrl.trim() || DEFAULT_CONFIG.facebookUrl,
      hoursWeekday: cfgHoursWeekday.trim() || DEFAULT_CONFIG.hoursWeekday,
      hoursSaturday: cfgHoursSaturday.trim() || DEFAULT_CONFIG.hoursSaturday,
      hoursSunday: cfgHoursSunday.trim() || DEFAULT_CONFIG.hoursSunday,
      calendarEmbedUrl: cfgCalendarEmbedUrl.trim() || DEFAULT_CONFIG.calendarEmbedUrl
    };

    setStoreConfig(updatedCfg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ts_store_config_v2', JSON.stringify(updatedCfg));
    }

    // Guardar contraseñas si se especificaron
    let pwdChanged = false;
    if (newAdminPwd.trim()) {
      setAdminPassword(newAdminPwd.trim());
      if (typeof window !== 'undefined') localStorage.setItem('ts_admin_pwd', newAdminPwd.trim());
      pwdChanged = true;
    }
    if (newPanaderoPwd.trim()) {
      setPanaderoPassword(newPanaderoPwd.trim());
      if (typeof window !== 'undefined') localStorage.setItem('ts_panadero_pwd', newPanaderoPwd.trim());
      pwdChanged = true;
    }

    if (pwdChanged) {
      setNewAdminPwd('');
      setNewPanaderoPwd('');
    }

    showToast('✓ Configuración y contraseñas guardadas con éxito');
  };

  // Actualizar estado de orden
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Pedido actualizado a: ${newStatus}`);
  };

  // Eliminar orden
  const handleDeleteOrder = (orderId, orderCode) => {
    if (confirm(`¿Eliminar el pedido ${orderCode}?`)) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(`Pedido ${orderCode} eliminado`);
      if (selectedOrderDetails?.id === orderId) setSelectedOrderDetails(null);
    }
  };

  // Enviar mensaje de WhatsApp al cliente
  const handleSendClientWhatsApp = (order) => {
    const text = `¡Hola *${order.clientName}*! Te saludamos de *${storeConfig.businessName}* en Bucaramanga. 🌿🎂\n\nTe escribimos sobre tu pedido *${order.code}*:\n` +
      `• *Estado:* ${order.status.toUpperCase()}\n` +
      `• *Fecha de entrega:* ${order.deliveryDate} (${order.deliveryTime})\n` +
      `• *Dirección:* ${order.address} (${order.zone})\n` +
      `• *Total:* $${Number(order.total).toLocaleString('es-CO')} (${order.paymentMethod})\n\n` +
      `*Productos agendados:*\n` +
      order.items.map((i) => `  - ${i.quantity}x ${i.productName} ${i.portion ? '[' + i.portion + ']' : ''}`).join('\n') +
      (order.notes ? `\n*Notas:* ${order.notes}` : '') +
      `\n\n¡Cualquier inquietud con tu entrega estamos atentos por esta línea!`;

    window.open(`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Crear nuevo pedido manual
  const handleCreateManualOrder = (e) => {
    e.preventDefault();
    if (!moClientName.trim() || !moAddress.trim()) {
      alert('Por favor completa el nombre del cliente y la dirección.');
      return;
    }

    const prod = products.find((p) => p.id === moSelectedProductId) || products[0];
    const unitPrice = moSelectedPortion && prod.sizes
      ? prod.sizes.find((s) => s.portions === moSelectedPortion)?.price || prod.price
      : prod.price;

    const deliveryCost = DELIVERY_ZONES.find((z) => z.name === moZone)?.price || 5000;
    const itemsTotal = unitPrice * moQuantity;
    const grandTotal = itemsTotal + deliveryCost;

    const newOrder = {
      id: `ord-${Date.now()}`,
      code: `TS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientName: moClientName.trim(),
      clientPhone: moClientPhone.trim().replace(/[^0-9]/g, '') || storeConfig.whatsappPhone,
      address: moAddress.trim(),
      zone: moZone,
      deliveryDate: moDeliveryDate,
      deliveryTime: moDeliveryTime,
      items: [
        {
          productName: prod.name,
          portion: moSelectedPortion || (prod.sizes && prod.sizes[0] ? prod.sizes[0].portions : undefined),
          quantity: moQuantity,
          price: unitPrice
        }
      ],
      total: grandTotal,
      status: 'Pendiente',
      paymentMethod: moPaymentMethod,
      notes: moNotes.trim(),
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsManualOrderModalOpen(false);
    showToast(`✓ Pedido ${newOrder.code} registrado exitosamente`);

    // Reset form
    setMoClientName('');
    setMoClientPhone('');
    setMoAddress('');
    setMoNotes('');
    setMoQuantity(1);
  };

  // WhatsApp Checkout desde catálogo público
  const handleOrderWhatsApp = (product, chosenPortion) => {
    let finalPrice = product.price;
    let portionLabel = '';

    if (product.sizes && product.sizes.length > 0) {
      const selected = chosenPortion || selectedPortions[product.id] || product.sizes[0].portions;
      const sizeObj = product.sizes.find((s) => s.portions === selected);
      if (sizeObj) {
        finalPrice = sizeObj.price;
        portionLabel = ` (${sizeObj.portions} - ${formatPrice(sizeObj.price)})`;
      }
    }

    const text =
      `¡Hola *${storeConfig.businessName}*! 👋 Quisiera encargar:\n\n` +
      `🎂 *Producto:* ${product.name}${portionLabel}\n` +
      `💵 *Precio:* ${formatPrice(finalPrice)}\n` +
      `📂 *Categoría:* ${product.category}\n\n` +
      `Por favor indíquenme disponibilidad para agendar mi entrega en Bucaramanga / Área Metropolitana. ¡Muchas gracias!`;

    window.open(`https://wa.me/${storeConfig.whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Compartir reporte a cocina
  const shareKitchenReportToWhatsApp = () => {
    const activeOrders = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En Cocina');
    let text = `👩‍🍳 *REPORTE DE HORNEADO & COCINA*\n*${storeConfig.businessName}*\nFecha: ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
    text += `📋 *TOTAL PEDIDOS ACTIVOS:* ${activeOrders.length}\n\n`;
    text += `*PRODUCTOS A ELABORAR:*\n`;

    const consolidated = {};
    activeOrders.forEach((o) => {
      o.items.forEach((i) => {
        const key = `${i.productName} ${i.portion ? '(' + i.portion + ')' : ''}`.trim();
        consolidated[key] = (consolidated[key] || 0) + i.quantity;
      });
    });

    Object.entries(consolidated).forEach(([item, qty]) => {
      text += `▪️ [ ] ${qty}x ${item}\n`;
    });

    text += `\n*AGENDA DE ENTREGAS:*\n`;
    activeOrders.forEach((o) => {
      text += `• ${o.deliveryTime} | ${o.clientName} (${o.zone}) - ${o.code}\n`;
    });

    text += `\n¡Buen turno de horneado! ✨🥐`;
    window.open(`https://wa.me/${storeConfig.whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtrado público
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (activeCategory !== 'Todas' && item.category !== activeCategory) return false;

      if (activeDietaryTag === 'Keto') {
        if (!item.features?.some((f) => /keto/i.test(f))) return false;
      } else if (activeDietaryTag === 'Sin Gluten') {
        if (!item.features?.some((f) => /sin gluten/i.test(f))) return false;
      } else if (activeDietaryTag === 'Sin Azúcar') {
        if (!item.features?.some((f) => /sin az[uú]car/i.test(f))) return false;
      } else if (activeDietaryTag === 'Sin Lácteos') {
        if (!item.features?.some((f) => /sin l[aá]cteos/i.test(f))) return false;
      } else if (activeDietaryTag === 'Entrega Hoy') {
        if (item.requiresNotice) return false;
      } else if (activeDietaryTag === 'Con Anticipación') {
        if (!item.requiresNotice) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesFeat = item.features?.some((f) => f.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesFeat) return false;
      }

      return true;
    });
  }, [products, activeCategory, activeDietaryTag, searchQuery]);

  // Filtrado órdenes
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'Todos' && o.status !== orderStatusFilter) return false;

      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchesClient = o.clientName.toLowerCase().includes(q);
        const matchesCode = o.code.toLowerCase().includes(q);
        const matchesPhone = o.clientPhone.toLowerCase().includes(q);
        const matchesAddress = o.address.toLowerCase().includes(q);
        if (!matchesClient && !matchesCode && !matchesPhone && !matchesAddress) return false;
      }

      return true;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Filtrado panel cocina productos
  const panaderoFilteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (panaderoCategoryFilter !== 'Todas' && item.category !== panaderoCategoryFilter) return false;
      if (panaderoStatusFilter === 'available' && !item.available) return false;
      if (panaderoStatusFilter === 'soldout' && item.available) return false;

      if (panaderoSearch.trim()) {
        const q = panaderoSearch.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, panaderoCategoryFilter, panaderoStatusFilter, panaderoSearch]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      available: products.filter((p) => p.available).length,
      soldOut: products.filter((p) => !p.available).length,
      ordersTotal: orders.length,
      ordersPending: orders.filter((o) => o.status === 'Pendiente').length,
      ordersInKitchen: orders.filter((o) => o.status === 'En Cocina').length,
      ordersReady: orders.filter((o) => o.status === 'Listo').length,
      ordersDelivered: orders.filter((o) => o.status === 'Entregado').length
    };
  }, [products, orders]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E19] flex flex-col font-sans selection:bg-[#2D5A27] selection:text-white">
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#241E19] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="text-amber-400 shrink-0" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* BARRA SUPERIOR VERDE OFICIAL                                   */}
      {/* ============================================================== */}
      <div className="bg-[#2D5A27] text-white py-2 px-4 text-center text-xs font-medium tracking-wide border-b border-[#23481E] shadow-xs">
        <p className="max-w-6xl mx-auto truncate">
          Pastelería Artesanal 100% Sin Azúcar Refinada y Sin Gluten en Bucaramanga | Horario: Lunes a Viernes: 8am - 6pm | Ubicación: Bucaramanga y Área Metropol.
        </p>
      </div>

      {/* ============================================================== */}
      {/* HEADER PRINCIPAL                                               */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo y Eslogan */}
          <button
            onClick={() => navigateTo('public')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#2D5A27] text-white flex items-center justify-center font-serif text-xl font-black shadow-md group-hover:scale-105 transition-transform">
              TS
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-[#241E19] block group-hover:text-[#2D5A27] transition">
                {storeConfig.businessName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C533C] font-bold block">
                PASTELERÍA SANA • PEDIDOS WHATSAPP
              </span>
            </div>
          </button>

          {/* Enlaces de Redes, WhatsApp y Accesos Protegidos */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Redes */}
            <div className="hidden md:flex items-center gap-1.5 border-r border-[#EAE2D8] pr-3 mr-1">
              <a
                href={storeConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-stone-600 hover:text-pink-600 hover:bg-pink-50 transition"
                title="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href={storeConfig.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-stone-600 hover:text-blue-600 hover:bg-blue-50 transition"
                title="Facebook"
              >
                <Facebook size={17} />
              </a>
            </div>

            {/* Botón WhatsApp 315 889 4210 */}
            <a
              href={`https://wa.me/${storeConfig.whatsappPhone}?text=${encodeURIComponent('¡Hola Territorio Saludable! Quisiera solicitar información sobre sus productos saludables.')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#2D5A27] border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition shadow-2xs"
            >
              <MessageCircle size={15} />
              <span>315 889 4210</span>
            </a>

            {/* Accesos de Navegación y Roles */}
            <button
              onClick={() => navigateTo('public')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentView === 'public'
                  ? 'bg-[#2D5A27] text-white shadow-xs'
                  : 'bg-white border border-[#D8CFC4] text-stone-700 hover:bg-stone-50'
              }`}
            >
              Catálogo
            </button>

            <button
              onClick={() => navigateTo('panadero')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'panadero'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
              title="Panel simplificado para panaderos y cocina"
            >
              <ChefHat size={14} />
              <span className="hidden sm:inline">Panel Panadero</span>
              <span className="sm:hidden">Cocina</span>
            </button>

            <button
              onClick={() => navigateTo('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-[#D8CFC4] text-stone-700 hover:bg-stone-50'
              }`}
              title="Panel administrativo completo (Jefe)"
            >
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Acceso Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>

            {authRole && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title="Cerrar sesión protegida"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* VISTA 1: CATÁLOGO PÚBLICO & HERO BANNER                        */}
      {/* ============================================================== */}
      {currentView === 'public' && (
        <main className="flex-1">
          {/* HERO BANNER VISUAL */}
          <div className="relative overflow-hidden bg-linear-to-b from-[#F3ECE2] via-[#FAF7F2] to-[#FAF7F2] border-b border-[#EAE2D8] py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
              {/* Badge flotante */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#2D5A27] text-xs font-bold border border-[#E0D7CB] shadow-xs">
                <span>✨ Pastelería Saludable en Bucaramanga & Área Metropolitana</span>
              </div>

              {/* Título Principal */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#241E19] tracking-tight max-w-4xl mx-auto leading-[1.15]">
                El placer de lo dulce, <span className="text-[#2D5A27] italic">100% sin azúcar</span> y libre de gluten.
              </h1>

              {/* Subtítulo */}
              <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Tortas artesanales en capas, panes de masa madre fit, postres individuales y detalles únicos. Endulzados con fruto del monje y stevia pura. Pedidos fáciles y directos a nuestro WhatsApp.
              </p>

              {/* Badges de Garantía */}
              <div className="pt-2 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs font-bold text-stone-700">
                <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE2D8] shadow-2xs">
                  ✓ 0% Azúcar refinada
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE2D8] shadow-2xs">
                  ✓ 100% Libres de gluten
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE2D8] shadow-2xs">
                  ♡ Aptas para diabéticos
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                  🕒 Tortas con 1 día de anticipación
                </span>
              </div>

              {/* BUSCADOR INTERACTIVO */}
              <div className="pt-4 max-w-xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Buscar por nombre, sabor o ingrediente (ej. Arequipe, Pistacho, Pan)..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[#D8CFC4] text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PESTAÑAS DE CATEGORÍAS OFICIALES Y FILTROS */}
          <div className="sticky top-20 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE2D8] py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
              {/* Pestañas de Categoría */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory('Todas')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeCategory === 'Todas'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-[#D8CFC4] hover:bg-stone-50'
                  }`}
                >
                  Todas ({products.length})
                </button>
                {CATEGORIES.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'bg-white text-stone-700 border border-[#D8CFC4] hover:bg-stone-50'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Filtros Dietarios Secundarios */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                <span className="text-stone-400 font-bold shrink-0 text-[11px] mr-1">Filtro rápido:</span>
                {DIETARY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveDietaryTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer shrink-0 ${
                      activeDietaryTag === tag
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GRILLA DE PRODUCTOS CON DISEÑO AI STUDIO */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE2D8] p-8 max-w-lg mx-auto">
                <AlertCircle className="mx-auto text-amber-500 mb-3" size={36} />
                <h3 className="font-serif text-xl font-bold text-stone-800">No encontramos coincidencias</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Intenta cambiar el término de búsqueda o selecciona otra categoría.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('Todas');
                    setActiveDietaryTag('Todas');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23481E] transition cursor-pointer"
                >
                  Ver Todo el Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map((product) => {
                  const hasSizes = product.sizes && product.sizes.length > 0;
                  const currentPortion = selectedPortions[product.id] || (hasSizes ? product.sizes[0].portions : '');
                  const currentSizeObj = hasSizes
                    ? product.sizes.find((s) => s.portions === currentPortion) || product.sizes[0]
                    : null;
                  const displayPrice = currentSizeObj ? currentSizeObj.price : product.price;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-3xl border border-[#EAE2D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Imagen con degradado inferior y precio destacado */}
                      <div className="relative aspect-4/3 w-full bg-[#FAF0E6] overflow-hidden">
                        <img
                          src={product.imageUrl || FALLBACK_IMAGE_URL}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE_URL;
                          }}
                        />

                        {/* Degradado oscuro inferior */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4" />

                        {/* Badges superiores */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#2D5A27] text-[11px] font-extrabold shadow-xs">
                            {product.category}
                          </span>

                          <button
                            type="button"
                            onClick={() => setInfoModalProduct(product)}
                            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white flex items-center justify-center transition cursor-pointer"
                            title="Ver detalles completos del producto"
                          >
                            <Info size={15} />
                          </button>
                        </div>

                        {/* Texto sobre degradado: Nombre y Precio grande */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10 text-white">
                          <div className="min-w-0 pr-2">
                            <h3 className="font-serif text-lg sm:text-xl font-bold truncate leading-tight drop-shadow-xs">
                              {product.name}
                            </h3>
                            <span className="text-[11px] text-stone-200 font-medium">
                              {product.requiresNotice ? '🕒 Encargo 24h' : '✓ Entrega Hoy'}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs text-stone-300 block font-sans text-[10px]">Precio</span>
                            <span className="font-serif text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
                              {formatPrice(displayPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Overlay si está agotado */}
                        {!product.available && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-2xs flex items-center justify-center z-20">
                            <span className="px-4 py-2 rounded-2xl bg-red-600 text-white font-black text-xs tracking-wider uppercase shadow-lg">
                              Agotado Temporalmente
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cuerpo de la tarjeta */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Etiquetas dietarias */}
                          {product.features && product.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {product.features.map((feat) => (
                                <span
                                  key={feat}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold"
                                >
                                  {feat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selector de Porciones si existen */}
                        {hasSizes && (
                          <div className="pt-2 border-t border-stone-100">
                            <label className="block text-[11px] font-bold text-stone-500 mb-1">
                              Selecciona Porción / Tamaño:
                            </label>
                            <select
                              value={currentPortion}
                              onChange={(e) =>
                                setSelectedPortions((prev) => ({
                                  ...prev,
                                  [product.id]: e.target.value
                                }))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 focus:bg-white focus:outline-none focus:border-[#2D5A27] cursor-pointer"
                            >
                              {product.sizes.map((s) => (
                                <option key={s.portions} value={s.portions}>
                                  {s.label || `${s.portions} - ${formatPrice(s.price)}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Botón de Pedir por WhatsApp */}
                        <div className="pt-2">
                          <button
                            type="button"
                            disabled={!product.available}
                            onClick={() => handleOrderWhatsApp(product, currentPortion)}
                            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                              product.available
                                ? 'bg-[#2D5A27] hover:bg-[#23481E] text-white active:scale-98'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            <Phone size={15} />
                            <span>
                              {product.available
                                ? `Pedir por WhatsApp • ${formatPrice(displayPrice)}`
                                : 'Agotado'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: PANEL PANADERO Y COCINA (ROL: EMPLEADO COCINA)         */}
      {/* ============================================================== */}
      {currentView === 'panadero' && (
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header con distintivo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('public')}
                className="p-2 rounded-xl bg-white border border-[#D8CFC4] hover:bg-stone-50 text-stone-600 transition cursor-pointer"
                title="Volver al catálogo público"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                    Producción de Cocina (Empleado)
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    Rol: Empleado (Cocina)
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#241E19] mt-0.5">
                  Control de Horneado & Despacho
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={shareKitchenReportToWhatsApp}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                title="Compartir reporte a WhatsApp"
              >
                <MessageCircle size={15} />
                <span>Enviar Reporte a WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Sub-pestañas integradas para Panadero */}
          <div className="flex items-center gap-2 border-b border-[#EAE2D8] pb-3">
            <button
              type="button"
              onClick={() => setPanaderoTab('pedidos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                panaderoTab === 'pedidos'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white border border-[#EAE2D8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              <ClipboardList size={15} />
              <span>Pedidos Agendados</span>
              <span className="px-2 py-0.2 bg-black/20 rounded-full text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPanaderoTab('produccion')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                panaderoTab === 'produccion'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white border border-[#EAE2D8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              <ChefHat size={15} />
              <span>Producción del Día (Cocina)</span>
              <span className="px-2 py-0.2 bg-black/20 rounded-full text-[10px]">
                {stats.available}/{stats.total} Disp.
              </span>
            </button>
          </div>

          {/* SUB-PESTAÑA 1: PEDIDOS AGENDADOS */}
          {panaderoTab === 'pedidos' && (
            <div className="space-y-4">
              {/* Buscador y Filtros */}
              <div className="bg-white p-4 rounded-3xl border border-[#EAE2D8] flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Buscar por cliente, código o teléfono..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-amber-700 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                  {['Todos', 'Pendiente', 'En Cocina', 'Listo', 'Entregado'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabla de Pedidos */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] border-b border-[#EAE2D8] text-stone-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Código / Cliente</th>
                        <th className="py-3 px-4">Productos Agendados</th>
                        <th className="py-3 px-4">Entrega</th>
                        <th className="py-3 px-4">Zona / Dirección</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE4]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-stone-400">
                            No hay pedidos en este estado.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-amber-50/20 transition">
                            <td className="py-3 px-4 font-medium">
                              <span className="font-mono font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded text-[11px] block w-fit mb-1">
                                {ord.code}
                              </span>
                              <span className="font-bold text-stone-900 block">{ord.clientName}</span>
                              <span className="text-stone-400 font-mono text-[11px]">{ord.clientPhone}</span>
                            </td>
                            <td className="py-3 px-4">
                              <ul className="space-y-1">
                                {ord.items.map((i, idx) => (
                                  <li key={idx} className="font-medium text-stone-800">
                                    <span className="font-bold text-amber-800">{i.quantity}x</span> {i.productName}
                                    {i.portion && <span className="text-stone-500 text-[10px] ml-1">({i.portion})</span>}
                                  </li>
                                ))}
                              </ul>
                              {ord.notes && (
                                <p className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 mt-1.5 italic">
                                  Nota: {ord.notes}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              <span className="font-bold text-stone-800 block">{ord.deliveryDate}</span>
                              <span className="text-stone-500 font-semibold flex items-center gap-1 mt-0.5">
                                <Clock size={11} /> {ord.deliveryTime}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold block w-fit mb-0.5">
                                {ord.zone}
                              </span>
                              <span className="text-stone-600 block text-[11px] truncate max-w-[180px]">
                                {ord.address}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-xl font-bold text-xs border focus:outline-none cursor-pointer ${
                                  ord.status === 'Pendiente'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : ord.status === 'En Cocina'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : ord.status === 'Listo'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-stone-100 text-stone-600 border-stone-200'
                                }`}
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Cocina">En Cocina</option>
                                <option value="Listo">Listo</option>
                                <option value="Entregado">Entregado</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSendClientWhatsApp(ord)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                  title="Enviar actualización por WhatsApp"
                                >
                                  <MessageCircle size={15} />
                                </button>
                                <a
                                  href={getGoogleCalendarUrl(ord)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                  title="📅 Agendar en Google Calendar"
                                >
                                  <Calendar size={15} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                                  title="Ver detalle"
                                >
                                  <Eye size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-PESTAÑA 2: PRODUCCIÓN DEL DÍA (COCINA) */}
          {panaderoTab === 'produccion' && (
            <div className="space-y-6">
              {/* Contadores Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#EAE2D8] shadow-xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Productos</span>
                  <p className="font-serif text-3xl font-black text-[#241E19]">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Disponibles</span>
                  <p className="font-serif text-3xl font-black text-emerald-700">{stats.available}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs">
                  <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Agotados</span>
                  <p className="font-serif text-3xl font-black text-red-600">{stats.soldOut}</p>
                </div>
              </div>

              {/* Filtros de Categoría */}
              <div className="bg-white p-4 rounded-3xl border border-[#EAE2D8] flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    value={panaderoSearch}
                    onChange={(e) => setPanaderoSearch(e.target.value)}
                    placeholder="Filtrar producto en cocina..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-amber-700 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                  {['Todas', ...CATEGORIES].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPanaderoCategoryFilter(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        panaderoCategoryFilter === c
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Productos para Alternar Disponibilidad */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs divide-y divide-[#F2ECE4]">
                {panaderoFilteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/15 transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Foto redonda */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100 border-2 border-stone-200 shrink-0 relative">
                        <img
                          src={prod.imageUrl || FALLBACK_IMAGE_URL}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE_URL;
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-stone-900">{prod.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{formatPrice(prod.price)}</p>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              prod.available
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {prod.available ? '✔ DISPONIBLE EN TIENDA' : '✕ AGOTADO'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón destacado */}
                    <div className="shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(prod.id)}
                        className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm ${
                          prod.available
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}
                      >
                        {prod.available ? (
                          <>
                            <XCircle size={15} />
                            <span>✕ Marcar Agotado</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} />
                            <span>✔ Marcar Disponible</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: PANEL ADMINISTRATIVO MULTI-MÓDULO (ROL: JEFE)          */}
      {/* ============================================================== */}
      {currentView === 'admin' && (
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header con distintivo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('public')}
                className="p-2 rounded-xl bg-white border border-[#D8CFC4] hover:bg-stone-50 text-stone-600 transition cursor-pointer"
                title="Volver al catálogo"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-xs font-black uppercase tracking-wider">
                    Administradora (Jefe)
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    Rol: Jefe (Admin Total)
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#241E19] mt-0.5">
                  Panel de Administración Multi-Módulo
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-amber-600 text-stone-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Restablecer catálogo"
              >
                <RefreshCw size={13} />
                <span>Restablecer</span>
              </button>
              <button
                type="button"
                onClick={handleOpenNewModal}
                className="px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus size={15} />
                <span>Nuevo Producto</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* PESTAÑAS DE NAVEGACIÓN MULTI-MÓDULO (5 PESTAÑAS) */}
          <div className="flex items-center gap-2 border-b border-[#EAE2D8] pb-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setAdminTab('inventario')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'inventario'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-[#EAE2D8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              <ShoppingBag size={15} />
              <span>Gestión de Inventario (CRUD)</span>
              <span className="px-2 py-0.2 bg-black/20 rounded-full text-[10px]">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('pedidos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'pedidos'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-[#EAE2D8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              <ClipboardList size={15} />
              <span>Pedidos / Clientes</span>
              <span className="px-2 py-0.2 bg-amber-500 text-stone-950 font-black rounded-full text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('calendario')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'calendario'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-[#EAE2D8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              <CalendarDays size={15} />
              <span>Calendario de Entregas (Google)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('produccion')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'produccion'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-[#EAE2D8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              <ChefHat size={15} />
              <span>Producción del Día (Cocina)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('configuracion')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'configuracion'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-[#EAE2D8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Settings size={15} />
              <span>Configuración de la Pastelería</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* MÓDULO 1: GESTIÓN DE INVENTARIO (CRUD)                         */}
          {/* ============================================================== */}
          {adminTab === 'inventario' && (
            <div className="space-y-6">
              {/* Tarjetas Resumen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#EAE2D8] shadow-xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Productos</span>
                  <p className="font-serif text-2xl font-black text-[#241E19]">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Disponibles</span>
                  <p className="font-serif text-2xl font-black text-[#2D5A27]">{stats.available}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs">
                  <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Agotados</span>
                  <p className="font-serif text-2xl font-black text-red-600">{stats.soldOut}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Tortas Saludables</span>
                  <p className="font-serif text-2xl font-black text-amber-800">
                    {products.filter((p) => p.category === 'Tortas Saludables').length} variedades
                  </p>
                </div>
              </div>

              {/* Tabla de Productos con Controles de Reordenamiento y Toggle */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#EAE2D8] bg-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#241E19]">
                      Control de Orden y Edición del Catálogo
                    </h3>
                    <p className="text-xs text-stone-500">
                      Usa las flechas <b>Subir ⬆️</b> o <b>Bajar ⬇️</b> para cambiar la posición de los productos en la tienda.
                    </p>
                  </div>
                  <span className="text-xs bg-[#EAE2D8] px-3 py-1 rounded-full text-stone-700 font-semibold self-start sm:self-auto">
                    {products.length} productos organizados
                  </span>
                </div>

                <div className="divide-y divide-[#F2ECE4]">
                  {products.map((product, index) => {
                    const isFirst = index === 0;
                    const isLast = index === products.length - 1;

                    return (
                      <div
                        key={product.id}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition"
                      >
                        {/* Botones de Reordenar */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveProduct(product.id, 'up')}
                              className={`p-1.5 rounded-lg border transition ${
                                isFirst
                                  ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                                  : 'bg-white text-stone-700 border-stone-300 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] cursor-pointer'
                              }`}
                              title="Subir posición ⬆️"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <span className="text-[11px] font-mono font-bold text-stone-500">
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveProduct(product.id, 'down')}
                              className={`p-1.5 rounded-lg border transition ${
                                isLast
                                  ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                                  : 'bg-white text-stone-700 border-stone-300 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] cursor-pointer'
                              }`}
                              title="Bajar posición ⬇️"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>

                          {/* Miniatura */}
                          <div className="w-16 h-16 rounded-2xl bg-[#FAF0E6] overflow-hidden border border-[#EAE2D8] shrink-0 relative">
                            <img
                              src={product.imageUrl || FALLBACK_IMAGE_URL}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMAGE_URL;
                              }}
                            />
                          </div>

                          {/* Información */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-serif font-bold text-base text-[#241E19] truncate">
                                {product.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold">
                                {product.category}
                              </span>
                              {product.sizes && product.sizes.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#2D5A27] text-[10px] font-semibold border border-emerald-200">
                                  {product.sizes.length} porciones
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 truncate mt-0.5 max-w-xl">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                              <span className="font-bold text-[#2D5A27]">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-stone-400 font-mono text-[11px] bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200 truncate max-w-[200px]">
                                {product.imageUrl}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Toggle switch y acciones */}
                        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${product.available ? 'text-[#2D5A27]' : 'text-stone-400'}`}>
                              {product.available ? 'Disponible' : 'Agotado'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleProductStatus(product.id)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                product.available ? 'bg-[#2D5A27]' : 'bg-stone-300'
                              }`}
                              role="switch"
                              aria-checked={product.available}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  product.available ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(product)}
                              className="p-2 rounded-xl text-stone-600 hover:text-[#2D5A27] hover:bg-[#EBF3EA] transition cursor-pointer"
                              title="Editar Producto y Porciones"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Eliminar Producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MÓDULO 2: PEDIDOS / CLIENTES                                   */}
          {/* ============================================================== */}
          {adminTab === 'pedidos' && (
            <div className="space-y-6">
              {/* Encabezado del Módulo */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE2D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241E19]">
                    Módulo de Pedidos & Clientes
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Control centralizado de entregas agendadas en Bucaramanga, Floridablanca, Girón y Piedecuesta.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Pedidos</span>
                    <span className="font-serif text-2xl font-black text-[#2D5A27]">{orders.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManualOrderModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>+ Nuevo Pedido Manual</span>
                  </button>
                </div>
              </div>

              {/* Buscador y Filtros de Estado */}
              <div className="bg-white p-4 rounded-3xl border border-[#EAE2D8] flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Buscar por cliente, código, teléfono o dirección..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-[#2D5A27] font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                  {['Todos', 'Pendiente', 'En Cocina', 'Listo', 'Entregado'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-[#2D5A27] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabla Detallada de Pedidos */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] border-b border-[#EAE2D8] text-stone-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Código / Cliente</th>
                        <th className="py-3.5 px-4">Productos Agendados & Notas</th>
                        <th className="py-3.5 px-4">Fecha & Hora</th>
                        <th className="py-3.5 px-4">Dirección & Zona</th>
                        <th className="py-3.5 px-4">Total & Pago</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE4]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-stone-400">
                            No se encontraron pedidos con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#FAF7F2]/50 transition">
                            <td className="py-3.5 px-4 font-medium">
                              <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[11px] block w-fit mb-1">
                                {ord.code}
                              </span>
                              <span className="font-bold text-stone-900 block">{ord.clientName}</span>
                              <a
                                href={`https://wa.me/${ord.clientPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#2D5A27] hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                              >
                                <Phone size={10} /> +{ord.clientPhone}
                              </a>
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              <ul className="space-y-1">
                                {ord.items.map((i, idx) => (
                                  <li key={idx} className="font-medium text-stone-800">
                                    <span className="font-bold text-[#2D5A27]">{i.quantity}x</span> {i.productName}
                                    {i.portion && <span className="text-stone-500 text-[10px] ml-1">({i.portion})</span>}
                                  </li>
                                ))}
                              </ul>
                              {ord.notes && (
                                <p className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 mt-1.5 italic">
                                  Nota: {ord.notes}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-medium">
                              <span className="font-bold text-stone-800 block">{ord.deliveryDate}</span>
                              <span className="text-stone-500 font-semibold flex items-center gap-1 mt-0.5">
                                <Clock size={11} /> {ord.deliveryTime}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold block w-fit mb-0.5">
                                {ord.zone}
                              </span>
                              <span className="text-stone-600 block text-[11px] truncate max-w-[200px]" title={ord.address}>
                                {ord.address}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-medium">
                              <span className="font-bold text-[#2D5A27] text-sm block">
                                {formatPrice(ord.total)}
                              </span>
                              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded block w-fit mt-0.5">
                                {ord.paymentMethod}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-xl font-bold text-xs border focus:outline-none cursor-pointer ${
                                  ord.status === 'Pendiente'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : ord.status === 'En Cocina'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : ord.status === 'Listo'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-stone-100 text-stone-600 border-stone-200'
                                }`}
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Cocina">En Cocina</option>
                                <option value="Listo">Listo</option>
                                <option value="Entregado">Entregado</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSendClientWhatsApp(ord)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                  title="Enviar confirmación por WhatsApp"
                                >
                                  <MessageCircle size={15} />
                                </button>
                                <a
                                  href={getGoogleCalendarUrl(ord)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                  title="📅 Agendar en Google Calendar"
                                >
                                  <Calendar size={15} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                                  title="Ver detalles"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(ord.id, ord.code)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title="Eliminar pedido"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MÓDULO 3: CALENDARIO DE ENTREGAS (GOOGLE)                      */}
          {/* ============================================================== */}
          {adminTab === 'calendario' && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE2D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241E19]">
                    Calendario Oficial de Entregas & Despachos
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Vista interactiva conectada con Google Calendar para programar los despachos en Bucaramanga y el área metropolitana.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ExternalLink size={14} />
                    <span>Abrir Google Calendar Web</span>
                  </a>
                </div>
              </div>

              {/* RENDERIZADO DEL IFRAME DE GOOGLE CALENDAR */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
                <div className="p-4 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-2">
                    <CalendarDays size={16} className="text-[#2D5A27]" />
                    <span>Sincronización en Vivo: Bucaramanga (GMT-5)</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {storeConfig.calendarEmbedUrl.slice(0, 45)}...
                  </span>
                </div>
                <div className="w-full h-[550px] sm:h-[650px] bg-stone-100 relative">
                  <iframe
                    src={storeConfig.calendarEmbedUrl}
                    style={{ border: 0 }}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    title="Calendario de Entregas Territorio Saludable"
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Accesos Rápidos de Órdenes a Google Calendar */}
              <div className="bg-white p-5 rounded-3xl border border-[#EAE2D8] shadow-xs space-y-4">
                <h4 className="font-serif font-bold text-base text-stone-900">
                  Agendar Próximas Entregas a Google Calendar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {orders
                    .filter((o) => o.status !== 'Entregado')
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D8] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-stone-900 block truncate">
                            {ord.clientName}
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            📅 {ord.deliveryDate} • {ord.deliveryTime}
                          </span>
                          <span className="text-[10px] text-[#2D5A27] font-semibold block truncate">
                            {ord.zone}
                          </span>
                        </div>
                        <a
                          href={getGoogleCalendarUrl(ord)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-xs font-bold transition flex items-center gap-1 shrink-0"
                        >
                          <Calendar size={13} />
                          <span>Agendar</span>
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MÓDULO 4: PRODUCCIÓN DEL DÍA (COCINA)                          */}
          {/* ============================================================== */}
          {adminTab === 'produccion' && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE2D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241E19]">
                    Producción del Día & Disponibilidad
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Control directo de la cocina para alternar disponibilidad en tiempo real y coordinar horneados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={shareKitchenReportToWhatsApp}
                  className="px-4 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>Reporte Consolidado a Cocina</span>
                </button>
              </div>

              {/* Lista para alternar disponibilidad */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs divide-y divide-[#F2ECE4]">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/15 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-stone-100 border-2 border-stone-200 shrink-0">
                        <img
                          src={prod.imageUrl || FALLBACK_IMAGE_URL}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE_URL;
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-stone-900">{prod.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">{formatPrice(prod.price)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold ${
                          prod.available ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {prod.available ? '✔ Disponible' : '✕ Agotado'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(prod.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          prod.available
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}
                      >
                        {prod.available ? 'Marcar Agotado' : 'Marcar Disponible'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MÓDULO 5: CONFIGURACIÓN DE LA PASTELERÍA (SOLO JEFE)           */}
          {/* ============================================================== */}
          {adminTab === 'configuracion' && (
            <form onSubmit={handleSaveStoreConfig} className="space-y-6">
              {/* Canales de Contacto & WhatsApp */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAE2D8]">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#2D5A27] flex items-center justify-center font-bold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#241E19]">
                      Canales de Contacto & WhatsApp
                    </h3>
                    <p className="text-xs text-stone-500">
                      Configura el número al que ingresan los pedidos y los enlaces de redes sociales.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nombre del Negocio
                    </label>
                    <input
                      type="text"
                      value={cfgBusinessName}
                      onChange={(e) => setCfgBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Número de WhatsApp (con código de país) *
                    </label>
                    <input
                      type="text"
                      value={cfgWhatsappPhone}
                      onChange={(e) => setCfgWhatsappPhone(e.target.value)}
                      placeholder="573158894210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-mono font-bold text-[#2D5A27] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Enlace de Instagram
                    </label>
                    <input
                      type="text"
                      value={cfgInstagramUrl}
                      onChange={(e) => setCfgInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/territoriosaludable"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Enlace de Facebook
                    </label>
                    <input
                      type="text"
                      value={cfgFacebookUrl}
                      onChange={(e) => setCfgFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/territoriosaludable"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                </div>
              </div>

              {/* Horarios de Atención Publicados */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAE2D8]">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#241E19]">
                      Horarios de Atención Publicados
                    </h3>
                    <p className="text-xs text-stone-500">
                      Estos horarios se muestran en la barra superior y en el pie de página.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Lunes a Viernes
                    </label>
                    <input
                      type="text"
                      value={cfgHoursWeekday}
                      onChange={(e) => setCfgHoursWeekday(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Sábados
                    </label>
                    <input
                      type="text"
                      value={cfgHoursSaturday}
                      onChange={(e) => setCfgHoursSaturday(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Domingos & Festivos
                    </label>
                    <input
                      type="text"
                      value={cfgHoursSunday}
                      onChange={(e) => setCfgHoursSunday(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                </div>
              </div>

              {/* Integración Google Calendar */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAE2D8]">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#241E19]">
                      Integración Google Calendar
                    </h3>
                    <p className="text-xs text-stone-500">
                      Pega aquí la URL de inserción (embed iframe) de Google Calendar de la pastelería.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    URL DE INSERCIÓN (IFRAME EMBED DE GOOGLE CALENDAR)
                  </label>
                  <input
                    type="text"
                    value={cfgCalendarEmbedUrl}
                    onChange={(e) => setCfgCalendarEmbedUrl(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/embed?src=..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Por defecto: https://calendar.google.com/calendar/embed?src=territoriosaludable%40gmail.com&ctz=America%2FBogota
                  </p>
                </div>
              </div>

              {/* Seguridad & Modificación de Contraseñas (Inputs type="password") */}
              <div className="bg-white rounded-3xl border border-[#EAE2D8] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAE2D8]">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-900 flex items-center justify-center font-bold">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#241E19]">
                      Seguridad & Modificación de Contraseñas
                    </h3>
                    <p className="text-xs text-stone-500">
                      Campos de tipo contraseña (ocultan los caracteres). Se guardan de forma local en tu navegador.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nueva Contraseña de Administrador (Jefe)
                    </label>
                    <input
                      type="password"
                      value={newAdminPwd}
                      onChange={(e) => setNewAdminPwd(e.target.value)}
                      placeholder="Dejar en blanco para mantener la actual..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nueva Contraseña Panel Panadero (Cocina)
                    </label>
                    <input
                      type="password"
                      value={newPanaderoPwd}
                      onChange={(e) => setNewPanaderoPwd(e.target.value)}
                      placeholder="Dejar en blanco para mantener la actual..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Guardar Cambios */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check size={16} />
                  <span>Guardar Cambios de Configuración</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* PIE DE PÁGINA (FOOTER OSCURO)                                  */}
      {/* ============================================================== */}
      <footer className="bg-[#1C1713] text-stone-300 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Columna 1: Marca & Horarios */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2D5A27] text-white flex items-center justify-center font-serif text-xl font-black">
                  TS
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white tracking-tight">
                    {storeConfig.businessName}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Bucaramanga, Santander
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                Pastelería saludable y artesanal con ingredientes 100% reales, sin azúcar refinada y libres de gluten. Endulzamos tu vida con salud.
              </p>

              <div className="pt-1 space-y-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Horarios de Atención:
                </span>
                <ul className="text-xs text-stone-300 space-y-0.5">
                  <li>• Lunes a Viernes: <b>{storeConfig.hoursWeekday}</b></li>
                  <li>• Sábados: <b>{storeConfig.hoursSaturday}</b></li>
                  <li>• Domingos y Festivos: <b>{storeConfig.hoursSunday}</b></li>
                </ul>
              </div>
            </div>

            {/* Columna 2: Zonas de Entrega */}
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                <MapPin size={16} className="text-emerald-400" />
                <span>Zonas de Entrega</span>
              </h4>
              <p className="text-xs text-stone-400">
                Despachos en toda el área metropolitana de Bucaramanga:
              </p>
              <ul className="text-xs text-stone-300 space-y-1.5 divide-y divide-stone-800/60">
                {DELIVERY_ZONES.map((zone) => (
                  <li key={zone.name} className="pt-1.5 flex items-center justify-between">
                    <span>{zone.name}</span>
                    <span className="font-bold text-emerald-400">{formatPrice(zone.price)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: Medios de Pago */}
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                <CreditCard size={16} className="text-emerald-400" />
                <span>Medios de Pago</span>
              </h4>
              <p className="text-xs text-stone-400">
                Transferencias inmediatas y pagos en efectivo:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-xl bg-[#360036] text-purple-200 border border-purple-500/30 text-xs font-bold">
                  Nequi
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#B81414] text-red-100 border border-red-500/30 text-xs font-bold">
                  Daviplata
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#FDDA24] text-stone-900 font-extrabold text-xs">
                  Bancolombia
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#2D5A27] text-white text-xs font-bold">
                  Efectivo
                </span>
              </div>
              <p className="text-[11px] text-stone-400 pt-1">
                Verificamos tu comprobante directamente en WhatsApp para agendar tu pedido.
              </p>
            </div>

            {/* Columna 4: Canales & Acceso */}
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                <Phone size={16} className="text-emerald-400" />
                <span>Contacto Directo</span>
              </h4>
              <p className="text-xs text-stone-400">
                Línea oficial de pedidos y personalizaciones:
              </p>
              <a
                href={`https://wa.me/${storeConfig.whatsappPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23481E] transition"
              >
                <MessageCircle size={15} />
                <span>WhatsApp: {storeConfig.whatsappPhone}</span>
              </a>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('admin')}
                  className="text-xs text-stone-400 hover:text-white underline decoration-stone-600 transition flex items-center gap-1"
                >
                  <KeyRound size={13} />
                  <span>Acceso Administrativo</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© 2026 {storeConfig.businessName} • Bucaramanga, Colombia.</p>
            <p className="text-center sm:text-right">
              Hecho con amor y salud para toda la familia • 100% Sin Azúcar & Sin Gluten
            </p>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MODAL DE LOGIN PROTEGIDO                                       */}
      {/* ============================================================== */}
      {passwordModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                  passwordModalTarget === 'admin'
                    ? 'bg-stone-900 text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {passwordModalTarget === 'admin' ? <ShieldCheck size={24} /> : <ChefHat size={24} />}
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {passwordModalTarget === 'admin' ? 'Acceso Administradora' : 'Acceso Producción Cocina'}
              </h3>
              <p className="text-xs text-stone-500">
                Ingresa tu contraseña de seguridad para continuar:
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Contraseña..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-center font-mono text-sm tracking-widest focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />
                {passwordError && (
                  <p className="text-xs text-red-600 font-medium text-center mt-1.5">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL VER DETALLE DE PEDIDO                                    */}
      {/* ============================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {selectedOrderDetails.code}
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">
                  Detalles del Pedido
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400 block font-semibold">Cliente:</span>
                  <span className="font-bold text-stone-900 text-sm">{selectedOrderDetails.clientName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold">Teléfono WhatsApp:</span>
                  <span className="font-mono font-bold text-[#2D5A27]">+{selectedOrderDetails.clientPhone}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold">Fecha de Entrega:</span>
                  <span className="font-bold text-stone-900">{selectedOrderDetails.deliveryDate}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold">Hora Programada:</span>
                  <span className="font-bold text-stone-900">{selectedOrderDetails.deliveryTime}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block font-semibold">Dirección & Zona:</span>
                  <span className="font-bold text-stone-900">{selectedOrderDetails.address} ({selectedOrderDetails.zone})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="font-bold text-stone-700 block mb-2">Productos Agendados:</span>
                <ul className="space-y-2">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <div>
                        <span className="font-bold text-stone-900">{it.quantity}x {it.productName}</span>
                        {it.portion && <span className="text-stone-500 block text-[11px]">{it.portion}</span>}
                      </div>
                      <span className="font-bold text-[#2D5A27]">{formatPrice(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedOrderDetails.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">Notas especiales:</span>
                  <p>{selectedOrderDetails.notes}</p>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-sm">
                <span className="font-bold text-stone-700">Total a Pagar ({selectedOrderDetails.paymentMethod}):</span>
                <span className="font-serif text-xl font-black text-[#2D5A27]">
                  {formatPrice(selectedOrderDetails.total)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
              <a
                href={getGoogleCalendarUrl(selectedOrderDetails)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
              >
                <Calendar size={14} />
                <span>Google Calendar</span>
              </a>
              <button
                type="button"
                onClick={() => handleSendClientWhatsApp(selectedOrderDetails)}
                className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Cliente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL NUEVO PEDIDO MANUAL                                      */}
      {/* ============================================================== */}
      {isManualOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#241E19]">
                  Registrar Nuevo Pedido Manual
                </h3>
                <p className="text-xs text-stone-500">
                  Agrega órdenes tomadas por teléfono o en el punto de venta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsManualOrderModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={moClientName}
                    onChange={(e) => setMoClientName(e.target.value)}
                    placeholder="Ej: Laura Martínez"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Teléfono WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={moClientPhone}
                    onChange={(e) => setMoClientPhone(e.target.value)}
                    placeholder="573151234567"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dirección de Entrega *
                  </label>
                  <input
                    type="text"
                    required
                    value={moAddress}
                    onChange={(e) => setMoAddress(e.target.value)}
                    placeholder="Ej: Cra 33 # 45-12 Edificio Terrazas Apto 301"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Zona de Entrega
                  </label>
                  <select
                    value={moZone}
                    onChange={(e) => setMoZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  >
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.name} value={z.name}>
                        {z.name} (+{formatPrice(z.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={moPaymentMethod}
                    onChange={(e) => setMoPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  >
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={moDeliveryDate}
                    onChange={(e) => setMoDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Hora Estimada
                  </label>
                  <input
                    type="text"
                    required
                    value={moDeliveryTime}
                    onChange={(e) => setMoDeliveryTime(e.target.value)}
                    placeholder="Ej: 10:30 AM o 2:00 PM - 4:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Seleccionar Producto
                  </label>
                  <select
                    value={moSelectedProductId}
                    onChange={(e) => {
                      setMoSelectedProductId(e.target.value);
                      const pr = products.find((p) => p.id === e.target.value);
                      if (pr && pr.sizes && pr.sizes.length > 0) {
                        setMoSelectedPortion(pr.sizes[0].portions);
                      } else {
                        setMoSelectedPortion('');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatPrice(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const currProd = products.find((p) => p.id === moSelectedProductId);
                  if (currProd && currProd.sizes && currProd.sizes.length > 0) {
                    return (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Porción / Variante
                        </label>
                        <select
                          value={moSelectedPortion}
                          onChange={(e) => setMoSelectedPortion(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                        >
                          {currProd.sizes.map((sz) => (
                            <option key={sz.portions} value={sz.portions}>
                              {sz.portions} ({formatPrice(sz.price)})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={moQuantity}
                    onChange={(e) => setMoQuantity(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Notas especiales para cocina / entrega
                  </label>
                  <textarea
                    rows={2}
                    value={moNotes}
                    onChange={(e) => setMoNotes(e.target.value)}
                    placeholder="Ej: Empaque de cumpleaños, vela dorada, llamar al llegar..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualOrderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white font-bold transition cursor-pointer shadow-sm"
                >
                  Registrar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL EDITAR / AGREGAR PRODUCTO (CON GESTOR DE PORCIONES)      */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#241E19]">
                  {editingProduct ? 'Editar Producto del Catálogo' : 'Nuevo Producto Saludable'}
                </h3>
                <p className="text-xs text-stone-500">
                  Ajusta precios, fotos limpias de /public y porciones dinámicas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Torta Moka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Categoría Oficial *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] font-semibold text-stone-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ingredientes reales, texturas, sin azúcar..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Precio Base (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 font-mono font-bold text-[#2D5A27] focus:bg-white focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>

              {/* GESTOR DE PORCIONES */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-800 block text-xs">
                      Gestor de Porciones & Tamaños
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Define tamaños y precios específicos (ej: 5 porc, 8 porc).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSizeRow}
                    className="px-3 py-1 rounded-xl bg-[#2D5A27] text-white text-[11px] font-bold hover:bg-[#23481E] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Añadir</span>
                  </button>
                </div>

                {formSizes.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {formSizes.map((sz, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Ej: 5 porc, Tamaño personal..."
                            value={sz.portions}
                            onChange={(e) => handleUpdateSizeRow(idx, 'portions', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-semibold"
                          />
                        </div>
                        <div className="w-28 sm:w-32">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={sz.price}
                              onChange={(e) => handleUpdateSizeRow(idx, 'price', Number(e.target.value))}
                              className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-[#2D5A27]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeRow(idx)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RUTA DE LA IMAGEN EN /PUBLIC */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Ruta de la Imagen (/nombre-foto.png) *
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    required
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Ej: /torta-moka.png"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 font-mono text-xs text-stone-800"
                  />
                </div>
              </div>

              {/* Etiquetas Dietarias */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Etiquetas Dietarias
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Sin Azúcar', 'Sin Gluten', 'Keto', 'Sin Lácteos'].map((feat) => {
                    const isSelected = formFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFormFeature(feat)}
                        className={`text-xs px-3 py-1 rounded-xl font-semibold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-[#2D5A27]'
                        }`}
                      >
                        {isSelected ? `✓ ${feat}` : `+ ${feat}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Requiere 24h */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Requiere 24h de Anticipación
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {formRequiresNotice ? 'Se hornea por encargo (1 día)' : 'Disponible para entrega hoy'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormRequiresNotice(!formRequiresNotice)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    formRequiresNotice ? 'bg-[#2D5A27]' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={formRequiresNotice}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formRequiresNotice ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Disponibilidad */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Estado de Disponibilidad
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {formAvailable ? 'Visible y disponible para venta' : 'Marcado como agotado temporalmente'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAvailable(!formAvailable)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    formAvailable ? 'bg-[#2D5A27]' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={formAvailable}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 flex items-center gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DETALLES DEL PRODUCTO (CATÁLOGO PÚBLICO)                 */}
      {/* ============================================================== */}
      {infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative aspect-video w-full bg-[#FAF0E6]">
              <img
                src={infoModalProduct.imageUrl || FALLBACK_IMAGE_URL}
                alt={infoModalProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE_URL;
                }}
              />
              <button
                type="button"
                onClick={() => setInfoModalProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-white/95 text-[#2D5A27] text-xs font-bold shadow-xs">
                {infoModalProduct.category}
              </span>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#241E19]">
                  {infoModalProduct.name}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  {infoModalProduct.description}
                </p>
              </div>

              {infoModalProduct.features && infoModalProduct.features.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Beneficios & Etiquetas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {infoModalProduct.features.map((feat) => (
                      <span
                        key={feat}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#2D5A27] border border-emerald-200/60 text-xs font-semibold"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {infoModalProduct.sizes && infoModalProduct.sizes.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Porciones Disponibles:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {infoModalProduct.sizes.map((s) => (
                      <div
                        key={s.portions}
                        className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium"
                      >
                        <span className="font-bold text-stone-800 block">{s.portions}</span>
                        <span className="font-bold text-[#2D5A27] block mt-0.5">
                          {formatPrice(s.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <span className="text-xs text-stone-500 font-semibold">
                  {infoModalProduct.requiresNotice
                    ? '🕒 Requiere 24 horas de anticipación'
                    : '✓ Disponible para entrega hoy'}
                </span>
                <span className="font-serif text-xl font-black text-[#2D5A27]">
                  {formatPrice(infoModalProduct.price)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInfoModalProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-white text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleOrderWhatsApp(infoModalProduct);
                  setInfoModalProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Phone size={14} />
                <span>Pedir por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
