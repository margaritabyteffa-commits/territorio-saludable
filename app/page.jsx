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
  CreditCard
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ==========================================
const WHATSAPP_PHONE_NUMBER = '573174246835';
const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
const DEFAULT_IMAGE_FALLBACK = '/torta-moka.jpg';

const ADMIN_PASSWORD_DEFAULT = '1234';
const PANADERO_PASSWORD_DEFAULT = '5678';

export const CATEGORIES = ['Tortas', 'Detalles', 'Pan', 'Postres', 'Mercadito'];
export const DIETARY_TAGS = ['Todas', 'Keto', 'Sin Gluten', 'Sin Azúcar', 'Sin Lácteos', 'Entrega Hoy', 'Con Anticipación'];

export const ensureSlash = (url) => {
  if (!url) return '/torta-moka.jpg';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Helper constructor compacto de productos
const p = (id, name, category, price, description, imageUrl, features, requiresNotice, sizes) => ({
  id,
  name,
  category,
  price,
  description,
  imageUrl: ensureSlash(imageUrl),
  available: true,
  features,
  requiresNotice: requiresNotice === 1,
  ...(Array.isArray(sizes) && sizes.length > 0
    ? {
        sizes: sizes.map(([portions, pPrice]) => ({
          portions,
          price: pPrice,
          label: `${portions} (${formatPrice(pPrice)})`,
        })),
      }
    : {}),
});

// ==========================================
// 2. CATÁLOGO COMPLETO INICIAL (initialProducts)
// ==========================================
export const initialProducts = [
  // --- LAS 29 TORTAS SALUDABLES ---
  p('torta-1-arequipe', 'Torta de Arequipe', 'Tortas', 63000, 'Bizcocho ultra suave sin azúcar refinada cubierto con arequipe artesanal saludable y toques de frutos secos tostados.', '/torta-arequipe.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 63000], ['8 porc', 87000], ['12 porc', 111000], ['18 porc', 156000], ['25 porc', 197000]]),
  p('torta-2-moka', 'Torta Moka', 'Tortas', 84000, 'Esponjoso bizcocho con café orgánico santandereano, cacao puro al 70% y suave crema chantilly sin azúcar.', '/torta-moka.jpg', ['Sin Azúcar', 'Sin Gluten', 'Keto', 'Con Anticipación'], 1, [['5 porc', 84000], ['8 porc', 123000], ['12 porc', 155000], ['18 porc', 217000]]),
  p('torta-3-pistacho', 'Torta Pistacho', 'Tortas', 94000, 'Bizcocho húmedo de harina de almendras y pasta 100% pura de pistachos tostados con frosting fit de queso ligero.', '/torta-pistacho.jpg', ['Keto', 'Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, [['5 porc', 94000], ['8 porc', 141000], ['12 porc', 197000], ['18 porc', 274000], ['25 porc', 353000]]),
  p('torta-4-choco-arequipe', 'Torta Choco-arequipe', 'Tortas', 60000, 'Combinación perfecta de bizcocho húmedo de chocolate oscuro y relleno abundante de arequipe artesanal sin azúcar.', '/choco-arequipe.jpg', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['3 porc', 60000], ['5 porc', 84000], ['8 porc', 123000], ['12 porc', 155000]]),
  p('torta-5-luna-almendras', 'Luna de Almendras', 'Tortas', 73000, 'Torta suave a base de harina de almendras seleccionadas, aromatizada con vainilla natural y almendras laminadas crujientes.', '/luna-almendras.jpg', ['Keto', 'Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, [['5 porc', 73000], ['8 porc', 108000], ['12 porc', 142000], ['18 porc', 189000], ['25 porc', 250000]]),
  p('torta-6-victoria', 'Torta Victoria', 'Tortas', 84000, 'Clásica torta estilo británico esponjosa con mermelada casera de fresas frescas sin azúcar y crema chantilly fit.', '/torta-victoria.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 84000], ['8 porc', 110000], ['12 porc', 141000], ['18 porc', 192000], ['25 porc', 248000]]),
  p('torta-7-mousse-cake', 'Mousse Cake', 'Tortas', 73000, 'Capas sedosas de mousse de chocolate amargo al 70% sobre una base crocante de frutos secos y cacao puro.', '/mousse-cake.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 73000], ['8 porc', 100000], ['12 porc', 120000]]),
  p('torta-8-yogurt', 'Torta de Yogurt', 'Tortas', 84000, 'Textura esponjosa enriquecida con yogurt griego artesanal probiótico y un sutil toque cítrico natural.', '/torta-yogurt.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 84000], ['8 porc', 123000], ['12 porc', 155000], ['18 porc', 217000], ['25 porc', 270000]]),
  p('torta-9-red-velvet', 'Capas Red Velvet', 'Tortas', 85000, 'Inconfundible bizcocho aterciopelado color carmesí con cacao y capas de frosting suave de queso crema sin azúcar.', '/capas-red-velvet.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 85000], ['8 porc', 124000], ['12 porc', 156000], ['18 porc', 218000]]),
  p('torta-10-tres-leches-vainilla', '3 Leches Vainilla', 'Tortas', 84000, 'Bizcocho súper húmedo bañado en nuestra exclusiva infusión de tres leches deslactosadas sin azúcar con merengue dorado.', '/tres-leches-vainilla.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 84000], ['8 porc', 123000], ['12 porc', 155000], ['18 porc', 217000]]),
  p('torta-11-tres-leches-chocolate', '3 Leches Chocolate', 'Tortas', 84000, 'Versión chocolatosa de tres leches saludables con cacao puro, ultra húmeda, decorada con virutas de chocolate oscuro.', '/tres-leches-chocolate.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 84000], ['8 porc', 123000], ['12 porc', 155000], ['18 porc', 217000]]),
  p('torta-12-marquesa-brownie', 'Marquesa de Brownie', 'Tortas', 75000, 'Postre frío por capas alternadas de brownie melcochudo de chocolate y crema chantilly ligera sin azúcar refinada.', '/marquesa-brownie.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 75000], ['8 porc', 115000], ['12 porc', 146000], ['18 porc', 205000], ['24 porc', 270000]]),
  p('torta-13-zanahoria', 'Torta Zanahoria', 'Tortas', 75000, 'Deliciosa torta húmeda con zanahoria fresca rallada, nueces de nogal crocantes, canela aromática y frosting de queso suave.', '/torta-zanahoria.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 75000], ['8 porc', 108000], ['12 porc', 141000], ['18 porc', 188000], ['25 porc', 249000]]),
  p('torta-14-sin-lacteos', 'Sin Lácteos', 'Tortas', 86000, 'Formulación 100% libre de caseína y lactosa, elaborada con leche de coco y almendras, suave y esponjosa.', '/torta-sin-lacteos.png', ['Sin Lácteos', 'Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, [['5 porc', 86000], ['8 porc', 119000], ['12 porc', 135000], ['18 porc', 193000]]),
  p('torta-15-volcan', 'Torta Volcán', 'Tortas', 56000, 'Espectacular centro fluido de chocolate tibio que fluye al cortar. Perfecta para amantes del chocolate intenso.', '/torta-volcan.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['2-3 porc', 56000], ['5 porc', 74000], ['8 porc', 110000], ['12 porc', 130000], ['18 porc', 189000]]),
  p('torta-16-tres-sabores', '3 Sabores', 'Tortas', 134000, 'Trilogía especial que combina bizcocho de chocolate, vainilla y frutos rojos en una sola presentación gourmet.', '/torta-tres-sabores.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['8 porc', 134000], ['12 porc', 169000], ['18 porc', 223000], ['25 porc', 283000]]),
  p('torta-17-chocoluxe', 'Torta Chocoluxe', 'Tortas', 94000, 'Nuestra creación más indulgente con tres texturas de chocolate belga sin azúcar, trufas fit y ganache brillante.', '/torta-chocoluxe.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 94000], ['8 porc', 141000], ['12 porc', 197000], ['18 porc', 274000], ['25 porc', 353000]]),
  p('torta-18-maria-luisa', 'María Luisa', 'Tortas', 84000, 'Tradicional torta rellena de abundante arequipe artesanal y dulce de mora casero sin azúcar refinada.', '/torta-maria-luisa.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 84000], ['8 porc', 123000], ['12 porc', 155000], ['18 porc', 217000], ['25 porc', 270000]]),
  p('torta-19-matilda', 'Matilda', 'Tortas', 134000, 'Inspirada en el clásico cinéfilo: capas densas y ultra húmedas de puro fudge de chocolate oscuro sin remordimientos.', '/torta-matilda.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['8 porc', 134000], ['12 porc', 169000], ['18 porc', 223000], ['25 porc', 283000]]),
  p('torta-20-vasca-frutos-rojos', 'Torta Vasca Frutos Rojos', 'Tortas', 58000, 'Cheesecake estilo vasco horneado a alta temperatura, interior cremoso y compota de frutos rojos de la casa.', '/torta-vasca-frutos-rojos.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['3 porc', 58000], ['6 porc', 101000], ['8 porc', 133000]]),
  p('torta-21-vasca-frutos-amarillos', 'Torta Vasca Frutos Amarillos', 'Tortas', 58000, 'Cremosa tarta vasca de queso con coulis tropical de maracuyá, mango y uchuvas 100% natural sin azúcar.', '/torta-vasca-frutos-amarillos.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['3 porc', 58000], ['6 porc', 101000], ['8 porc', 133000]]),
  p('torta-22-vasca-pistacho', 'Tortas Vasca Pistacho', 'Tortas', 62000, 'Cheesecake quemado vasco con pasta pura de pistachos tostados importados y textura aterciopelada inolvidable.', '/torta-vasca-pistacho.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['3 porc', 62000], ['6 porc', 104000], ['8 porc', 139000]]),
  p('torta-23-primavera', 'Torta Primavera', 'Tortas', 85000, 'Fresca y ligera, elaborada con compota de fresas y arándanos frescos, crema ligera de limón y flores comestibles.', '/torta-primavera.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 85000], ['8 porc', 124000], ['12 porc', 156000], ['18 porc', 218000], ['25 porc', 271000]]),
  p('torta-24-guanabana-yogurt', 'Torta de Guanábana y Yogurt Griego', 'Tortas', 55000, 'Pulpa natural de guanábana seleccionada combinada con la suavidad del yogurt griego deslactosado y bizcocho ligero.', '/torta-guanabana-yogurt.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['8 porc', 55000]]),
  p('torta-25-chocolate-amargo', 'Torta de Chocolate Amargo 70%', 'Tortas', 52000, 'Bizcocho intenso para paladares refinados, elaborado con cacao puro al 70%, sin azúcar ni harinas refinadas.', '/torta-chocolate-amargo.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['8 porc', 52000]]),
  p('torta-26-selva-negra', 'Torta Selva Negra Fit', 'Tortas', 84000, 'Capas de bizcocho esponjoso de cacao, cerezas maceradas sin azúcar y suave crema chantilly de almendras.', '/torta-selva-negra.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 84000], ['8 porc', 123000], ['12 porc', 155000], ['18 porc', 217000]]),
  p('torta-27-limon-almendras', 'Torta Keto de Limón & Almendras', 'Tortas', 78000, 'Sabor cítrico vibrante de limones naturales con base de almendras y cobertura de glaseado keto sin calorías.', '/torta-limon-almendras.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 78000], ['8 porc', 112000], ['12 porc', 145000]]),
  p('torta-28-naranja-amapola', 'Torta Naranja & Semillas de Amapola', 'Tortas', 72000, 'Aroma cítrico de naranjas valencianas recién exprimidas con textura crujiente de semillas de amapola seleccionadas.', '/torta-naranja-amapola.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 72000], ['8 porc', 105000], ['12 porc', 138000]]),
  p('torta-29-tres-leches-arequipe', 'Torta Tres Leches Arequipe', 'Tortas', 86000, 'La combinación soñada: tres leches ultra jugosa empapada con arequipe artesanal saludable y canela.', '/torta-tres-leches-arequipe.png', ['Sin Azúcar', 'Sin Gluten', 'Con Anticipación'], 1, [['5 porc', 86000], ['8 porc', 126000], ['12 porc', 158000], ['18 porc', 220000]]),

  // --- CATÁLOGO DE DETALLES ---
  p('det-1-mini-torta-corazon', 'Mini Torta Corazón', 'Detalles', 39000, 'Hermosa mini torta personal con mensaje personalizado en forma de corazón y flores naturales.', '/mini-torta-corazon.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-2-mini-box', 'Mini Box', 'Detalles', 30000, 'Caja de regalo sorpresa con delicias individuales saludables de nuestra pastelería.', '/mini-box.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-3-guacal-premium', 'Guacal Premium', 'Detalles', 98000, 'Guacal de madera artesanal con surtido completo de postres fit, mini torta y bouquet floral.', '/guacal-premium.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-4-guacal-amor', 'Guacal Amor', 'Detalles', 88000, 'Arreglo especial en madera rústica con postres saludables, brownie melcochudo y alfajor.', '/guacal-amor.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-5-brownies-x2', 'Brownies x2', 'Detalles', 20000, 'Dúo de brownies saludables con nueces crocantes y chocolate al 70%, empacados para regalo.', '/brownies-x2.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-6-copa-saludable', 'Copa Saludable', 'Detalles', 55000, 'Copa de vidrio con capas de torta, chantilly sin azúcar, fresas frescas y lazo decorativo.', '/copa-saludable.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-7-guacal-te-cuido', 'Guacal te cuido', 'Detalles', 52000, 'Regalo especial pensado en el bienestar con mugcake esponjoso, mermelada y galletas.', '/guacal-te-cuido.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-8-guacal-coquette', 'Guacal Coquette', 'Detalles', 65000, 'Presentación con detalles en cinta pastel, mini cake decorado y alfajores fit.', '/guacal-coquette.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-9-box-duo', 'Box Duo', 'Detalles', 20000, 'Cajita de regalo con 2 postres individuales a elección para sorprender en cualquier momento.', '/box-duo.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-10-mini-brownies-x4', 'Mini brownies x4', 'Detalles', 24000, 'Cuatro bocaditos densos de chocolate con nueces tostadas en caja de presentación especial.', '/mini-brownies-x4.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-11-postre-ilusion', 'Postre Ilusión', 'Detalles', 19000, 'Vaso postre individual con capas de galleta, crema chantilly fit y compota de frutos rojos.', '/postre-ilusion.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-12-mini-cake-naranja', 'Mini cake Naranja', 'Detalles', 28000, 'Mini torta personal de naranja natural empacada para regalo con tarjeta y lazo.', '/mini-cake-naranja.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-13-mini-cake-love', 'Mini cake Love', 'Detalles', 28000, 'Torta individual de chocolate con cubierta de arequipe saludable y diseño festivo.', '/mini-cake-love.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('det-14-mini-marquesa-brownie', 'Mini Marquesa de Brownie', 'Detalles', 35000, 'Delicioso postre frío en caja de acetato con capas cremosas y virutas de chocolate.', '/mini-marquesa-brownie.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),

  // --- PAN SALUDABLE (100% LIBRE DE GLUTEN) ---
  p('pan-1-ajo-hierbas', 'Pan Ajo y finas hierbas (Salado, 250g)', 'Pan', 16000, 'Pan artesanal horneado con ajo rostizado, orégano y romero. Masa libre de gluten suave y aromática.', '/pan-ajo-hierbas.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-2-bocadillo-parmesano', 'Pan Bocadillo y Queso Parmesano (Dulce, 4 und)', 'Pan', 13000, 'Cuatro pancitos con relleno de bocadillo sin azúcar añadida y toque saladito de parmesano madurado.', '/pan-bocadillo-parmesano.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-3-semillas-chia', 'Pan Semillas de chía y ajonjolí (Dulce, 4 und)', 'Pan', 11000, 'Pancitos suaves ricos en fibra natural y omega-3 vegetal, endulzados naturalmente.', '/pan-semillas-chia.png', ['Sin Gluten', 'Sin Azúcar', 'Keto', 'Con Anticipación'], 1, 0),
  p('pan-4-rollitos-cuajada', 'Pan Rollitos de Cuajada y Nuez (Dulce, 4 und)', 'Pan', 14000, 'Rollitos tiernos con cuajada fresca campesina de la región y nueces picadas crujientes.', '/pan-rollitos-cuajada.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-5-oregano', 'Pan de Orégano (Salado, 4 und)', 'Pan', 11000, 'Panecillos salados ideales para acompañar comidas, tostadas o sándwiches ligeros.', '/pan-oregano.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-6-queso-parmesano', 'Pan de Queso Parmesano (Salado, 4 und)', 'Pan', 14000, 'Corteza dorada con queso parmesano gratinado e interior esponjoso libre de harinas refinadas.', '/pan-queso-parmesano.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-7-ajonjoli', 'Pan con Ajonjolí (Dulce, 4 und)', 'Pan', 15000, 'Miga suave con semillas de ajonjolí tostadas que aportan un sabor a nuez característico.', '/pan-ajonjoli.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-8-rollitos-chitaga', 'Pan Rollitos de Queso Chitagá (Dulce, 4 und)', 'Pan', 14000, 'Receta tradicional santandereana adaptada 100% saludable con queso típico de Chitagá.', '/pan-rollitos-chitaga.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-9-queso-chitaga-300g', 'Pan con Queso Chitagá (Dulce, 300g)', 'Pan', 18000, 'Hogaza familiar rellena con generosas capas de queso Chitagá suave y dulcecito.', '/pan-queso-chitaga.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-10-baguette', 'Pan Baguette (Salado, 250g)', 'Pan', 15000, 'Baguette artesanal con costra crocante y miga aireada sin trigo ni gluten, perfecta para bruschettas.', '/pan-baguette.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-11-queso-campesino', 'Pan con Queso Campesino (Dulce, 350g)', 'Pan', 19000, 'Pan grande para compartir en familia con queso campesino fresco bajo en grasa.', '/pan-queso-campesino.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-12-rustico', 'Pan Rústico (Salado, 300g)', 'Pan', 17000, 'Hogaza campestre horneada a la piedra con harinas integrales de semillas y quinoa.', '/pan-rustico.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-13-roscon-relleno', 'Roscón Relleno (Dulce, arequipe, rinde 4 porc)', 'Pan', 30000, 'Roscón tradicional relleno de abundante arequipe sin azúcar y azúcar glass fit por encima.', '/roscon-relleno.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),
  p('pan-14-focaccia', 'Focaccia (Salado, 300g, rinde 5-6 porc)', 'Pan', 36000, 'Focaccia italiana con aceite de oliva virgen extra, tomates cherry confitados y romero fresco.', '/focaccia.png', ['Sin Gluten', 'Sin Azúcar', 'Con Anticipación'], 1, 0),

  // --- POSTRES SALUDABLES ---
  p('pos-1-tres-leches-arequipe-vaso', '3 Leches de Arequipe (9 oz)', 'Postres', 17000, 'Vaso individual de bizcocho esponjoso bañado en tres leches deslactosadas y arequipe fit.', '/tres-leches-arequipe-vaso.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('pos-2-tres-leches-mermelada', '3 Leches con Mermelada Frutos Rojos / Amarillos', 'Postres', 17000, 'Tres leches refrescante coronado con mermelada artesanal de frutos del bosque sin azúcar.', '/tres-leches-mermelada.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Frutos Rojos', 17000], ['Frutos Amarillos', 17000]]),
  p('pos-3-mugcake-surtido', 'Mugcake Esponjoso (Varios Sabores)', 'Postres', 15000, 'Bizcochito fit individual en taza listo para disfrutar. Delicioso, ligero y sin remordimientos.', '/mugcake-surtido.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Naranja & Amapola', 15000], ['Red Velvet', 15000], ['Yogurt Griego', 15000], ['Chocolate 70%', 15000]]),
  p('pos-4-red-velvet-3-leches', 'Red Velvet 3 Leches', 'Postres', 18000, 'La combinación perfecta entre la humedad de las tres leches y el sabor aterciopelado del red velvet.', '/red-velvet-tres-leches.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('pos-5-brownies-caja', 'Caja de Brownies Melcochudos', 'Postres', 19000, 'Brownies densos y húmedos con nueces de nogal y chocolate oscuro al 70%.', '/caja-brownies.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Caja x2', 19000], ['Caja x4', 36000]]),
  p('pos-6-mini-brownies-caja', 'Mini Brownies Bocaditos', 'Postres', 23000, 'Caja de mini brownies individuales ideales para snacks de la tarde o compartir.', '/mini-brownies-caja.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Caja x4', 23000], ['Caja x8', 44000]]),
  p('pos-7-mini-blondies-caja', 'Mini Blondies de Chocolate Blanco', 'Postres', 23000, 'Suaves cuadritos de vainilla natural con chispas de chocolate blanco sin azúcar.', '/mini-blondies-caja.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Caja x4', 23000], ['Caja x8', 44000]]),
  p('pos-8-blondie-caja', 'Blondie Tradicional', 'Postres', 19000, 'Versión rubia del brownie elaborada con harina de almendras y toque acaramelado natural.', '/blondie-caja.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Caja x2', 19000], ['Caja x4', 36000]]),
  p('pos-9-galletas-semillas', 'Galletas Crocantes de Semillas', 'Postres', 12300, 'Paquete de galletas artesanales con chía, girasol, ajonjolí y linaza dorada.', '/galletas-semillas.png', ['Keto', 'Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Paquete x10', 12300], ['Paquete x15', 18200]]),
  p('pos-10-galletas-chocolate', 'Galletas con Chips de Chocolate', 'Postres', 7500, 'Galletas clásicas con trozos crujientes de chocolate amargo puro.', '/galletas-chocolate.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Paquete x3', 7500], ['Paquete x10', 19000]]),
  p('pos-11-alfajores-chocolate', 'Alfajores Bañados en Chocolate', 'Postres', 23000, 'Masa quebradiza de maicena rellena con arequipe saludable y cobertura de cacao.', '/alfajores-chocolate.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Caja x3', 23000], ['Caja x6', 41000]]),
  p('pos-12-alfajores-arequipe', 'Alfajores Tradicionales con Arequipe', 'Postres', 21000, 'Clásicos alfajores argentinos fit con abundante arequipe artesanal y coco rallado.', '/alfajores-arequipe.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Caja x3', 21000], ['Caja x6', 39000]]),
  p('pos-13-mini-cookies', 'Mini Cookies (Empaque x12)', 'Postres', 7000, 'Deliciosas y diminutas galletitas de vainilla ideales para café o lonchera.', '/mini-cookies.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, 0),
  p('pos-14-canastilla-yuca', 'Canastilla de Pan de Yuca', 'Postres', 24000, 'Crocantes canastillas de almidón agrio de yuca y queso cuajada fresca.', '/canastilla-yuca.png', ['Sin Gluten', 'Sin Azúcar', 'Entrega Hoy'], 0, [['Empaque x2', 24000], ['Empaque x4', 41000]]),
  p('pos-15-repollas-fit', 'Repollas Sin Azúcar y Sin Gluten', 'Postres', 17000, 'Masa choux ligera rellena de arequipe artesanal y espolvoreadas con endulzante natural.', '/repollas-fit.png', ['Sin Gluten', 'Sin Azúcar', 'Entrega Hoy'], 0, [['Caja x2', 17000], ['Caja x4', 32000]]),
  p('pos-16-caja-compartir', 'Caja Compartir Especial', 'Postres', 50000, 'Super caja de degustación con canastillas de yuca, mini blondies, fresas y repollas rellenas.', '/caja-compartir.png', ['Sin Gluten', 'Sin Azúcar', 'Entrega Hoy'], 0, 0),

  // --- MERCADITO (EXACTAMENTE 3 PRODUCTOS REQUERIDOS) ---
  p('merc-1-arequipe', 'Arequipe Artesanal', 'Mercadito', 16000, 'Arequipe 100% sin azúcar cocinado lentamente con leche deslactosada y fruto del monje.', '/arequipe-artesanal.png', ['Sin Azúcar', 'Sin Gluten', 'Entrega Hoy'], 0, [['Frasco 150g', 16000], ['Frasco 280g', 25000], ['Frasco 500g', 38000]]),
  p('merc-2-mermeladas', 'Mermeladas Naturales', 'Mercadito', 16000, 'Pura fruta seleccionada sin azúcar refinada ni conservantes (Frutos Rojos / Frutos Amarillos).', '/mermeladas-naturales.png', ['Sin Azúcar', 'Sin Gluten', 'Sin Lácteos', 'Entrega Hoy'], 0, [['Frutos Rojos', 16000], ['Frutos Amarillos', 16000]]),
  p('merc-3-arepas', 'Arepas Libres de Gluten (Paquete x5)', 'Mercadito', 14000, 'Arepas artesanales de maíz peto no transgénico en paquete de 5 unidades.', '/arepas-libres-gluten.png', ['Sin Gluten', 'Sin Lácteos', 'Entrega Hoy'], 0, [['Semillas de chía y ajonjolí', 14000], ['Plátano maduro', 14000]]),
];

const buildWhatsAppUrl = (product, selectedPortion, currentPrice) => {
  const portionText = selectedPortion ? `• Tamaño / Porción: ${selectedPortion}\n` : '';
  const finalPrice = currentPrice || product.price;

  const message = `¡Hola Territorio Saludable! 👋🍰 Quiero pedir el siguiente producto del catálogo:

*${product.name}*
• Categoría: ${product.category}
${portionText}• Precio: ${formatPrice(finalPrice)}
• Estado: ${product.available ? 'Disponible' : 'Consultar disponibilidad'}

¿Me podrían confirmar disponibilidad y el proceso de entrega para Bucaramanga? ¡Muchas gracias!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (App / page.jsx)
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#admin') return 'admin';
      if (hash === '#panadero') return 'panadero';
    }
    return 'public';
  });

  const [authRole, setAuthRole] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ts_auth_role') || null;
    }
    return null;
  });

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

  const [passwordModalTarget, setPasswordModalTarget] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [newPanaderoPwd, setNewPanaderoPwd] = useState('');

  const [infoModalProduct, setInfoModalProduct] = useState(null);

  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ts_products_catalog');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => ({
              ...item,
              imageUrl: ensureSlash(item.imageUrl),
              available: typeof item.available === 'boolean' ? item.available : true,
              features: Array.isArray(item.features) ? item.features : ['Sin Azúcar', 'Sin Gluten'],
            }));
          }
        }
      } catch (err) {
        console.warn('Error leyendo catálogo guardado:', err);
      }
    }
    return initialProducts;
  });

  const [activeCategory, setActiveCategory] = useState('Todas');
  const [activeDietaryTag, setActiveDietaryTag] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortions, setSelectedPortions] = useState({});

  const [panaderoCategoryFilter, setPanaderoCategoryFilter] = useState('Todas');
  const [panaderoStatusFilter, setPanaderoStatusFilter] = useState('all');
  const [panaderoSearch, setPanaderoSearch] = useState('');

  const [toastMessage, setToastMessage] = useState(null);

  // Formulario Admin
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Tortas');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState('/torta-moka.jpg');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatures, setFormFeatures] = useState(['Sin Azúcar', 'Sin Gluten']);
  const [formRequiresNotice, setFormRequiresNotice] = useState(true);

  useEffect(() => {
    const handleLocationSync = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        if (authRole === 'admin') setCurrentView('admin');
        else handleRequestProtectedAccess('admin');
      } else if (hash === '#panadero') {
        if (authRole === 'panadero' || authRole === 'admin') setCurrentView('panadero');
        else handleRequestProtectedAccess('panadero');
      } else {
        setCurrentView('public');
      }
    };
    window.addEventListener('hashchange', handleLocationSync);
    return () => window.removeEventListener('hashchange', handleLocationSync);
  }, [authRole]);

  useEffect(() => {
    try {
      localStorage.setItem('ts_products_catalog', JSON.stringify(products));
    } catch (err) {
      console.warn('Error guardando en localStorage:', err);
    }
  }, [products]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRequestProtectedAccess = (targetRole) => {
    if (authRole === 'admin') {
      setCurrentView(targetRole);
      window.history.pushState(null, '', `#${targetRole}`);
      return;
    }
    if (authRole === 'panadero' && targetRole === 'panadero') {
      setCurrentView('panadero');
      window.history.pushState(null, '', '#panadero');
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
        window.history.pushState(null, '', '#admin');
        setPasswordModalTarget(null);
        showToast('✓ Acceso concedido al Panel de Administración');
      } else {
        setPasswordError('Contraseña incorrecta. Inténtalo de nuevo.');
      }
    } else if (passwordModalTarget === 'panadero') {
      if (cleanPass === panaderoPassword || cleanPass === adminPassword) {
        const roleGranted = cleanPass === adminPassword ? 'admin' : 'panadero';
        setAuthRole(roleGranted);
        if (typeof window !== 'undefined') sessionStorage.setItem('ts_auth_role', roleGranted);
        setCurrentView('panadero');
        window.history.pushState(null, '', '#panadero');
        setPasswordModalTarget(null);
        showToast('✓ Acceso concedido al Panel de Panadería y Cocina');
      } else {
        setPasswordError('Contraseña incorrecta. Inténtalo de nuevo.');
      }
    }
  };

  const handleSavePasswords = (e) => {
    e.preventDefault();
    let updated = false;

    if (newAdminPwd.trim()) {
      setAdminPassword(newAdminPwd.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('ts_admin_pwd', newAdminPwd.trim());
      }
      updated = true;
    }

    if (newPanaderoPwd.trim()) {
      setPanaderoPassword(newPanaderoPwd.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('ts_panadero_pwd', newPanaderoPwd.trim());
      }
      updated = true;
    }

    if (updated) {
      showToast('✓ Contraseñas actualizadas con éxito en este dispositivo');
      setNewAdminPwd('');
      setNewPanaderoPwd('');
    } else {
      showToast('⚠️ Ingresa al menos una contraseña para actualizar');
    }
  };

  const handleLogout = () => {
    setAuthRole(null);
    if (typeof window !== 'undefined') sessionStorage.removeItem('ts_auth_role');
    setCurrentView('public');
    window.history.pushState(null, '', '#');
    showToast('Sesión cerrada');
  };

  const navigateTo = (view) => {
    if (view === 'public') {
      setCurrentView('public');
      window.history.pushState(null, '', '#');
    } else {
      handleRequestProtectedAccess(view);
    }
  };

  const handleMoveProduct = (productId, direction) => {
    const currentIndex = products.findIndex((p2) => p2.id === productId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newOrder = [...products];
    const [movedItem] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    setProducts(newOrder);
    showToast(`Posición actualizada: "${movedItem.name}" movido hacia ${direction === 'up' ? 'arriba ⬆️' : 'abajo ⬇️'}`);
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
    setFormFeatures(product.features || ['Sin Azúcar', 'Sin Gluten']);
    setFormRequiresNotice(product.requiresNotice ?? (product.category === 'Tortas' || product.category === 'Pan'));
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Tortas');
    setFormDescription('');
    setFormPrice(45000);
    setFormImageUrl('/torta-moka.jpg');
    setFormAvailable(true);
    setFormFeatures(['Sin Azúcar', 'Sin Gluten']);
    setFormRequiresNotice(true);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Escribe un nombre para el producto');
      return;
    }

    const cleanImageUrl = ensureSlash(formImageUrl);

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
                features: formFeatures,
                requiresNotice: formRequiresNotice,
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
        features: formFeatures,
        requiresNotice: formRequiresNotice,
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast(`✓ Producto "${formName.trim()}" agregado al catálogo`);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId, productName) => {
    if (confirm(`¿Estás seguro de eliminar "${productName}" del catálogo?`)) {
      setProducts((prev) => prev.filter((p2) => p2.id !== productId));
      showToast(`Producto "${productName}" eliminado`);
    }
  };

  const handleResetCatalog = () => {
    if (confirm('¿Restablecer el catálogo con las 29 tortas y categorías originales asociadas a /public?')) {
      setProducts(initialProducts);
      showToast('✓ Catálogo completo restablecido');
    }
  };

  const toggleFormFeature = (feature) => {
    if (formFeatures.includes(feature)) {
      setFormFeatures(formFeatures.filter((f) => f !== feature));
    } else {
      setFormFeatures([...formFeatures, feature]);
    }
  };

  // Filtrado catálogo público
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
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesFeat = item.features?.some((f) => f.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesFeat) return false;
      }

      return true;
    });
  }, [products, activeCategory, activeDietaryTag, searchQuery]);

  // Filtrado panel panadero
  const panaderoFilteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (panaderoCategoryFilter !== 'Todas' && item.category !== panaderoCategoryFilter) return false;
      if (panaderoStatusFilter === 'available' && !item.available) return false;
      if (panaderoStatusFilter === 'soldout' && item.available) return false;

      if (panaderoSearch.trim()) {
        const query = panaderoSearch.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      }
      return true;
    });
  }, [products, panaderoCategoryFilter, panaderoStatusFilter, panaderoSearch]);

  const categoryCounts = useMemo(() => {
    const counts = { Todas: products.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = products.filter((item) => item.category === cat).length;
    });
    return counts;
  }, [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((item) => item.available).length;
    const cakes = products.filter((item) => item.category === 'Tortas').length;
    return { total, available, soldOut: total - available, cakes };
  }, [products]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E19] flex flex-col font-sans selection:bg-[#2D5A27] selection:text-white">
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2D5A27] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-[#428139] animate-bounce">
          <Sparkles size={16} className="text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra Superior con Horarios de Bucaramanga */}
      <aside className="bg-[#2D5A27] text-white text-xs py-2 px-4 shadow-inner" aria-label="Aviso de pedidos y horarios">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold tracking-wide">
              Horario Bucaramanga & Floridablanca: Lun a Sáb 8:00 AM - 6:00 PM
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-emerald-100 font-medium">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              <span>Tortas por encargo (1 día)</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              <span>Despachos a toda el área metropolitana</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Header de Navegación */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() => navigateTo('public')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2D5A27] text-white flex items-center justify-center font-serif text-xl font-black shadow-md group-hover:scale-105 transition-transform">
              TS
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#241E19] block group-hover:text-[#2D5A27] transition">
                Territorio Saludable
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C533C] font-semibold block">
                100% Sin Azúcar & Sin Gluten • Bucaramanga
              </span>
            </div>
          </button>

          {/* Navegación y Accesos Protegidos */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
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
              title="Panel completo de administración y precios"
            >
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Panel Admin</span>
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
          </nav>
        </div>
      </header>

      {/* ============================================================== */}
      {/* VISTA 1: CATÁLOGO PÚBLICO (CLIENTES)                            */}
      {/* ============================================================== */}
      {currentView === 'public' && (
        <div className="flex-1 flex flex-col">
          {/* Banner Hero */}
          <section className="bg-gradient-to-b from-[#FAF0E6]/80 to-transparent pt-8 pb-6 px-4 border-b border-[#EAE2D8]">
            <div className="max-w-4xl mx-auto text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EA] text-[#2D5A27] text-xs font-bold border border-[#C5DEC3]">
                🌱 Pastelería Artesanal Consciente
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#241E19] leading-tight">
                Disfruta lo dulce, cuida tu bienestar
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                Tortas artesanales, panes libres de gluten y postres gourmet horneados en Bucaramanga.
                Endulzados naturalmente con fruta pura y fruto del monje, sin azúcar refinada.
              </p>

              {/* Buscador de Productos */}
              <div className="pt-2 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
                  <input
                    type="text"
                    placeholder="Buscar por torta, pan, ingrediente o etiqueta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#D8CFC4] shadow-xs text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Pestañas de Categorías y Filtros Dietarios */}
          <section className="sticky top-[61px] z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D8] py-3 px-4 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1">
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

            <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-[#EAE2D8]/70 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 shrink-0">
                Filtros:
              </span>
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveDietaryTag(tag)}
                  className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer font-semibold ${
                    activeDietaryTag === tag
                      ? 'bg-[#241E19] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Tarjetas de Productos (Diseño Visual Estilo AI Studio) */}
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241E19]">
                  {activeCategory === 'Todas' ? 'Menú Completo de Territorio Saludable' : `Categoría: ${activeCategory}`}
                  {activeCategory === 'Tortas' && ' (29 Opciones)'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Mostrando {filteredProducts.length} delicia{filteredProducts.length !== 1 ? 's' : ''} saludable{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-[#EAE2D8] p-8 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF0E6] text-[#8C533C] flex items-center justify-center text-3xl mx-auto">
                  🧁
                </div>
                <h4 className="font-serif text-xl font-bold text-[#241E19]">No se encontraron delicias</h4>
                <p className="text-xs text-stone-500">
                  Prueba cambiando los filtros de etiquetas o el término de búsqueda.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('Todas');
                    setActiveDietaryTag('Todas');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#23481E] transition cursor-pointer"
                >
                  Ver Todo el Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
                  const currentSelectedPortion = selectedPortions[product.id] || (hasSizes && product.sizes ? product.sizes[0].portions : '');
                  const selectedSizeObj = hasSizes && product.sizes
                    ? product.sizes.find((s) => s.portions === currentSelectedPortion) || product.sizes[0]
                    : null;
                  const displayPrice = selectedSizeObj ? selectedSizeObj.price : product.price;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-[#EAE2D8] overflow-hidden flex flex-col shadow-xs hover:shadow-xl hover:border-[#2D5A27]/40 transition-all duration-300 group"
                    >
                      {/* Imagen con degradado inferior, precio grande y badges */}
                      <div className="relative aspect-4/3 w-full bg-[#FAF0E6] overflow-hidden">
                        <img
                          src={product.imageUrl || FALLBACK_IMAGE_URL}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE_URL;
                          }}
                          loading="lazy"
                        />

                        {/* Degradado oscuro inferior estilo AI Studio */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                        {/* Badge superior izquierdo con ícono de reloj */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[#2D5A27] text-[11px] font-bold shadow-xs flex items-center gap-1.5">
                          <Clock size={12} className="text-[#2D5A27]" />
                          <span>{product.requiresNotice ? 'Anticipación: 1 día' : 'Entrega Inmediata'}</span>
                        </div>

                        {/* Botón superior derecho de información (i) */}
                        <button
                          type="button"
                          onClick={() => setInfoModalProduct(product)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-[#2D5A27] flex items-center justify-center shadow-xs transition cursor-pointer backdrop-blur-xs"
                          title="Ver ingredientes y detalles del producto"
                        >
                          <Info size={16} />
                        </button>

                        {/* Categoría a la izquierda y Precio Grande a la derecha */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                            {product.category}
                          </span>
                          <span className="font-serif text-2xl font-black text-white drop-shadow-md tracking-tight">
                            {formatPrice(displayPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-serif text-lg font-bold text-[#241E19] group-hover:text-[#2D5A27] transition">
                            {product.name}
                          </h4>

                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                            {product.description}
                          </p>

                          {product.features && product.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {product.features.map((feat) => (
                                <span
                                  key={feat}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-stone-600 border border-[#EAE2D8] font-medium"
                                >
                                  {feat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#F2ECE4] space-y-3">
                          {/* Botones de selección de porciones en pills horizontales */}
                          {hasSizes && product.sizes && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                Tamaño / Porción:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {product.sizes.map((size) => {
                                  const isSelected = size.portions === currentSelectedPortion;
                                  return (
                                    <button
                                      key={size.portions}
                                      type="button"
                                      onClick={() =>
                                        setSelectedPortions({
                                          ...selectedPortions,
                                          [product.id]: size.portions,
                                        })
                                      }
                                      className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition cursor-pointer border ${
                                        isSelected
                                          ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs'
                                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                                      }`}
                                    >
                                      {size.portions}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Botón Verde Destacado WhatsApp */}
                          {product.available ? (
                            <a
                              href={buildWhatsAppUrl(product, currentSelectedPortion, displayPrice)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 transition cursor-pointer active:scale-98"
                            >
                              <Phone size={16} className="fill-white" />
                              <span>Pedir por WhatsApp</span>
                            </a>
                          ) : (
                            <div className="space-y-1.5">
                              <button
                                disabled
                                className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 text-stone-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-stone-200"
                              >
                                <XCircle size={15} />
                                <span>Agotado Temporalmente</span>
                              </button>
                              <a
                                href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(`¡Hola! Vi en el catálogo que *${product.name}* está agotado. ¿Cuándo tendrán nueva disponibilidad horneada?`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center text-[11px] text-[#2D5A27] hover:underline font-semibold"
                              >
                                Consultar próxima horneada por WhatsApp →
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* ============================================================== */}
          {/* PIE DE PÁGINA (FOOTER OSCURO COMPLETO)                         */}
          {/* ============================================================== */}
          <footer className="bg-[#1C1815] text-[#F3EFEA] pt-12 pb-8 border-t border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
                {/* Columna 1: Marca y Horarios */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-serif text-lg font-bold">
                      TS
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white">
                        Territorio Saludable
                      </h4>
                      <p className="text-[10px] text-amber-200/80 uppercase tracking-widest font-semibold">
                        Pastelería Consciente
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    100% libre de gluten, sin azúcar refinada y horneado artesanalmente en Bucaramanga para cuidar de ti y tu familia.
                  </p>
                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                      Horarios de Atención:
                    </span>
                    <ul className="text-xs text-stone-300 space-y-0.5">
                      <li>• Lunes a Viernes: <b>8:00 AM – 6:00 PM</b></li>
                      <li>• Sábados: <b>8:00 AM – 5:00 PM</b></li>
                      <li>• Domingos y Festivos: <b>9:00 AM – 2:00 PM</b></li>
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
                    <li className="pt-1 flex items-center justify-between">
                      <span>Cabecera / Sotomayor / Prado</span>
                      <span className="font-bold text-emerald-400">$5.000</span>
                    </li>
                    <li className="pt-1 flex items-center justify-between">
                      <span>Centro / San Francisco</span>
                      <span className="font-bold text-emerald-400">$7.000</span>
                    </li>
                    <li className="pt-1 flex items-center justify-between">
                      <span>Floridablanca / Cañaveral</span>
                      <span className="font-bold text-emerald-400">$10.000</span>
                    </li>
                    <li className="pt-1 flex items-center justify-between">
                      <span>Girón / Piedecuesta</span>
                      <span className="font-bold text-emerald-400">$15.000</span>
                    </li>
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
                    Verificamos tu pago directamente por WhatsApp para agendar tu entrega.
                  </p>
                </div>

                {/* Columna 4: Enlaces Administrativos y Seguridad */}
                <div className="space-y-3">
                  <h4 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Acceso de Personal</span>
                  </h4>
                  <p className="text-xs text-stone-400">
                    Accesos protegidos para la administración y cocina del taller:
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRequestProtectedAccess('admin')}
                      className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-stone-700 cursor-pointer"
                    >
                      <Lock size={13} className="text-amber-400" />
                      <span>Acceso Administrativo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestProtectedAccess('panadero')}
                      className="w-full py-2 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2 border border-stone-800 cursor-pointer"
                    >
                      <ChefHat size={14} className="text-amber-400" />
                      <span>Panel de Cocina / Panadería</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Derechos de Autor */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
                <p>© 2026 Territorio Saludable S.A.S. • Bucaramanga, Colombia.</p>
                <div className="flex items-center gap-4 text-stone-400 text-[11px]">
                  <span>Pastelería 100% Saludable</span>
                  <span>•</span>
                  <span>Sin Gluten & Sin Azúcar</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: PANEL PANADERO (COCINA / CHECKLIST)                   */}
      {/* ============================================================== */}
      {currentView === 'panadero' && (
        <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigateTo('public')}
                className="p-2 rounded-xl bg-white border border-[#D8CFC4] hover:bg-stone-50 text-stone-600 transition cursor-pointer"
                title="Volver al catálogo"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#241E19] flex items-center gap-2">
                  <ChefHat className="text-amber-700" size={26} />
                  <span>Panel de Panadería y Cocina</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Cambio rápido de estado: <b>Disponible</b> o <b>Agotado</b> con un solo toque.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateTo('public')}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition cursor-pointer"
              >
                Ver Tienda
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                title="Cerrar sesión de panadero"
              >
                <LogOut size={13} />
                <span>Salir</span>
              </button>
            </div>
          </div>

          {/* Métricas Cocina */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EAE2D8] shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total en Catálogo</span>
              <p className="font-serif text-2xl font-black text-[#241E19]">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Disponibles para Venta</span>
              <p className="font-serif text-2xl font-black text-[#2D5A27]">{stats.available}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Agotados Actualmente</span>
              <p className="font-serif text-2xl font-black text-red-600">{stats.soldOut}</p>
            </div>
          </div>

          {/* Filtros Cocina */}
          <div className="bg-white rounded-3xl border border-[#EAE2D8] p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre para cambiar estado..."
                  value={panaderoSearch}
                  onChange={(e) => setPanaderoSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPanaderoStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    panaderoStatusFilter === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Todos ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPanaderoStatusFilter('available')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    panaderoStatusFilter === 'available'
                      ? 'bg-[#2D5A27] text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Disponibles ({stats.available})
                </button>
                <button
                  type="button"
                  onClick={() => setPanaderoStatusFilter('soldout')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    panaderoStatusFilter === 'soldout'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  Agotados ({stats.soldOut})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPanaderoCategoryFilter('Todas')}
                className={`text-xs px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  panaderoCategoryFilter === 'Todas'
                    ? 'bg-[#2D5A27] text-white'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Todas las Categorías
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPanaderoCategoryFilter(cat)}
                  className={`text-xs px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    panaderoCategoryFilter === cat
                      ? 'bg-[#2D5A27] text-white'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                Mostrando {panaderoFilteredProducts.length} productos
              </span>
              <span className="text-[11px] text-stone-500">
                Toque el botón grande para cambiar estado al instante
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {panaderoFilteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition ${
                    product.available ? 'hover:bg-emerald-50/30' : 'bg-red-50/20 hover:bg-red-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0 relative">
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif font-bold text-base text-[#241E19]">
                          {product.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {product.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            product.available
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.available ? '✓ DISPONIBLE EN TIENDA' : '⚠️ AGOTADO EN TIENDA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleProductStatus(product.id)}
                      className={`px-4 sm:px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm active:scale-95 ${
                        product.available
                          ? 'bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-[#2D5A27] hover:bg-[#23481E] text-white border-2 border-[#2D5A27]'
                      }`}
                      title="Toque para cambiar estado"
                    >
                      {product.available ? (
                        <>
                          <XCircle size={18} className="text-red-600" />
                          <span>Marcar Agotado</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} className="text-emerald-300" />
                          <span>Marcar Disponible</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: PANEL ADMIN COMPLETO                                   */}
      {/* ============================================================== */}
      {currentView === 'admin' && (
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D8]">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('public')}
                  className="p-2 rounded-xl bg-white border border-[#D8CFC4] hover:bg-stone-50 text-stone-600 transition cursor-pointer"
                  title="Volver al catálogo"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#241E19]">
                  Panel de Administración
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Control de orden con flechas <b>Subir ⬆️ y Bajar ⬇️</b>, gestión de precios y seguridad de contraseñas.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-amber-600 text-stone-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Restablecer el catálogo completo"
              >
                <RefreshCw size={13} />
                <span>Restablecer Catálogo</span>
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
                title="Cerrar sesión de administrador"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

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
              <p className="font-serif text-2xl font-black text-amber-800">{stats.cakes} de 29</p>
            </div>
          </div>

          {/* SECCIÓN DE SEGURIDAD & MODIFICACIÓN DE CONTRASEÑAS */}
          <div className="bg-white rounded-3xl border border-[#EAE2D8] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#EAE2D8]">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#241E19]">
                  Seguridad & Modificación de Contraseñas
                </h3>
                <p className="text-xs text-stone-500">
                  Cambia las claves de acceso para Admin y Panadería. Se guardan localmente de forma segura.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePasswords} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nueva Contraseña de Administrador
                </label>
                <input
                  type="password"
                  value={newAdminPwd}
                  onChange={(e) => setNewAdminPwd(e.target.value)}
                  placeholder="Escribe la nueva contraseña de Admin..."
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
                  placeholder="Escribe la nueva contraseña de Cocina..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Lock size={14} />
                  <span>Guardar Nuevas Contraseñas</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Productos con Controles de Reordenamiento */}
          <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#EAE2D8] bg-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#241E19]">
                  Control de Orden y Edición del Catálogo
                </h3>
                <p className="text-xs text-stone-500">
                  Usa los botones <b>⬆️ Subir</b> o <b>⬇️ Bajar</b> para cambiar de puesto un producto en el catálogo.
                </p>
              </div>
              <span className="text-xs bg-[#EAE2D8] px-3 py-1 rounded-full text-stone-700 font-semibold self-start sm:self-auto">
                {products.length} productos ordenados
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
                    {/* Botones de Reordenar (Subir / Bajar) */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveProduct(product.id, 'up')}
                          className={`p-1.5 rounded-lg border transition ${
                            isFirst
                              ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] cursor-pointer shadow-2xs'
                          }`}
                          title={isFirst ? 'Ya está en la primera posición' : 'Subir producto de posición ⬆️'}
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
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] cursor-pointer shadow-2xs'
                          }`}
                          title={isLast ? 'Ya está en la última posición' : 'Bajar producto de posición ⬇️'}
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

                    {/* Acciones: Toggle + Editar */}
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
                          title={`Alternar a ${product.available ? 'Agotado' : 'Disponible'}`}
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
                          title="Editar Producto"
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
      {/* MODAL DE INFORMACIÓN DETALLADA (ÍCONO (i))                     */}
      {/* ============================================================== */}
      {infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
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
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Sellos y Beneficios:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {infoModalProduct.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-xs px-2.5 py-1 rounded-xl bg-emerald-50 text-[#2D5A27] font-semibold border border-emerald-200"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="font-bold">Tiempo de preparación:</span>
                  <span className="text-stone-600">
                    {infoModalProduct.requiresNotice ? '1 día de anticipación (Horneado fresco)' : 'Disponible para entrega hoy'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-700 pt-1 border-t border-stone-200">
                  <span className="font-bold">Ciudad:</span>
                  <span className="text-stone-600">Bucaramanga & Área Metropolitana</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInfoModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
                <a
                  href={buildWhatsAppUrl(infoModalProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone size={14} className="fill-white" />
                  <span>Pedir Ahora</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DE SEGURIDAD CON CONTRASEÑA                              */}
      {/* ============================================================== */}
      {passwordModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full overflow-hidden p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF3EA] text-[#2D5A27] flex items-center justify-center mx-auto shadow-inner">
                {passwordModalTarget === 'admin' ? <KeyRound size={24} /> : <ChefHat size={24} />}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#241E19]">
                {passwordModalTarget === 'admin' ? 'Acceso a Administración' : 'Acceso a Panadería & Cocina'}
              </h3>
              <p className="text-xs text-stone-500">
                {passwordModalTarget === 'admin'
                  ? 'Ingresa tu contraseña de administrador para continuar'
                  : 'Ingresa tu contraseña de cocina para continuar'}
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-3.5">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="password"
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] font-mono text-center tracking-widest text-lg font-bold"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-600 font-semibold text-center flex items-center justify-center gap-1">
                  <AlertCircle size={13} />
                  <span>{passwordError}</span>
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DE EDICIÓN / CREACIÓN (ADMIN)                            */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#241E19]">
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Las fotos se vinculan por su ruta local en la carpeta /public.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] text-xs sm:text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] text-xs sm:text-sm font-medium cursor-pointer"
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
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalla los ingredientes saludables, textura y endulzante..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] text-xs sm:text-sm font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Precio Base (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] text-xs sm:text-sm font-bold text-[#2D5A27]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    Ruta de la Imagen (/nombre-foto.png) *
                  </label>
                  <span className="text-[10px] text-stone-400">Texto directo, sin subida</span>
                </div>

                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    required
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Ej: /torta-moka.jpg o /nombre-foto.png"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:border-[#2D5A27] font-mono text-xs text-stone-800 font-medium"
                  />
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-stone-400">Accesos rápidos de fotos comunes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Torta Moka', path: '/torta-moka.jpg' },
                      { label: 'Torta Pistacho', path: '/torta-pistacho.jpg' },
                      { label: 'Choco-arequipe', path: '/choco-arequipe.jpg' },
                      { label: 'Luna Almendras', path: '/luna-almendras.jpg' },
                      { label: 'Torta Arequipe', path: '/torta-arequipe.png' },
                      { label: 'Arequipe Artesanal', path: '/arequipe-artesanal.png' },
                    ].map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => setFormImageUrl(item.path)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition cursor-pointer border ${
                          formImageUrl === item.path
                            ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:border-[#2D5A27]'
                        }`}
                      >
                        {item.path}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={formImageUrl || FALLBACK_IMAGE_URL}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE_URL;
                      }}
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-700">Vista previa</p>
                    <p className="text-stone-400 font-mono text-[10px] truncate max-w-[220px]">
                      {formImageUrl || DEFAULT_IMAGE_FALLBACK}
                    </p>
                  </div>
                </div>
              </div>

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
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formRequiresNotice ? 'bg-[#2D5A27]' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={formRequiresNotice}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formRequiresNotice ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Estado Inicial del Producto
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {formAvailable ? 'Visible y disponible para venta' : 'Marcado como agotado temporalmente'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setFormAvailable(!formAvailable)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formAvailable ? 'bg-[#2D5A27]' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={formAvailable}
                >
                  <span
                    aria-hidden="true"
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
    </div>
  );
}
