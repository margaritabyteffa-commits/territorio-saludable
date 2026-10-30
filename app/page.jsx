"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  SlidersHorizontal,
  Clock,
  Lock,
  KeyRound,
  ChefHat,
  LogOut,
  MapPin,
  AlertCircle
} from "lucide-react";

// ==========================================
// 1. CONFIGURACIÓN, CLAVES Y MODELO DE DATOS
// ==========================================

const WHATSAPP_PHONE_NUMBER = "573174246835";
const DEFAULT_IMAGE_FALLBACK = "/torta-moka.jpg";

// Claves de acceso para paneles protegidos
const ADMIN_PASSWORD_DEFAULT = "1234";
const PANADERO_PASSWORD_DEFAULT = "5678";

export const CATEGORIES = ["Tortas", "Detalles", "Pan", "Postres", "Mercadito"];
export const DIETARY_TAGS = ["Todas", "Keto", "Sin Gluten", "Sin Azúcar", "Sin Lácteos", "Entrega Hoy", "Con Anticipación"];

const formatPrice = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(amount);
};

// ==========================================
// 2. CATÁLOGO COMPLETO INICIAL (initialProducts)
// Incluye las 29 Tortas, Pan, Detalles, Postres y Mercadito
// ==========================================
const p = (id, name, category, price, description, imageUrl, features, requiresNotice, sizes) => ({
  id,
  name,
  category,
  price,
  description,
  imageUrl: imageUrl || DEFAULT_IMAGE_FALLBACK,
  available: true,
  features,
  requiresNotice: requiresNotice === 1,
  ...(Array.isArray(sizes) && sizes.length > 0
    ? {
        sizes: sizes.map(([portions, pPrice]) => ({
          portions,
          price: pPrice,
          label: `${portions} (${formatPrice(pPrice)})`
        }))
      }
    : {})
});

export const initialProducts = [
  // --- LAS 29 TORTAS SALUDABLES ---
  p("torta-1-arequipe", "Torta de Arequipe", "Tortas", 63000, "Bizcocho ultra suave sin azúcar refinada cubierto con arequipe artesanal saludable y toques de frutos secos tostados.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 63000], ["8 porc", 87000], ["12 porc", 111000], ["18 porc", 156000], ["25 porc", 197000]]),
  p("torta-2-moka", "Torta Moka", "Tortas", 84000, "Esponjoso bizcocho con café orgánico santandereano, cacao puro al 70% y suave crema chantilly sin azúcar.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Keto", "Con Anticipación"], 1, [["5 porc", 84000], ["8 porc", 123000], ["12 porc", 155000], ["18 porc", 217000]]),
  p("torta-3-pistacho", "Torta Pistacho", "Tortas", 94000, "Bizcocho húmedo de harina de almendras y pasta 100% pura de pistachos tostados con frosting fit de queso ligero.", "/torta-pistacho.jpg", ["Keto", "Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, [["5 porc", 94000], ["8 porc", 141000], ["12 porc", 197000], ["18 porc", 274000], ["25 porc", 353000]]),
  p("torta-4-choco-arequipe", "Torta Choco-arequipe", "Tortas", 60000, "Combinación perfecta de bizcocho húmedo de chocolate oscuro y relleno abundante de arequipe artesanal sin azúcar.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["3 porc", 60000], ["5 porc", 84000], ["8 porc", 123000], ["12 porc", 155000]]),
  p("torta-5-luna-almendras", "Luna de Almendras", "Tortas", 73000, "Torta suave a base de harina de almendras seleccionadas, aromatizada con vainilla natural y almendras laminadas crujientes.", "/luna-almendras.jpg", ["Keto", "Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, [["5 porc", 73000], ["8 porc", 108000], ["12 porc", 142000], ["18 porc", 189000], ["25 porc", 250000]]),
  p("torta-6-victoria", "Torta Victoria", "Tortas", 84000, "Clásica torta estilo británico esponjosa con mermelada casera de fresas frescas sin azúcar y crema chantilly fit.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 84000], ["8 porc", 110000], ["12 porc", 141000], ["18 porc", 192000], ["25 porc", 248000]]),
  p("torta-7-mousse-cake", "Mousse Cake", "Tortas", 73000, "Capas sedosas de mousse de chocolate amargo al 70% sobre una base crocante de frutos secos y cacao puro.", "/choco-arequipe.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 73000], ["8 porc", 100000], ["12 porc", 120000]]),
  p("torta-8-yogurt", "Torta de Yogurt", "Tortas", 84000, "Textura esponjosa enriquecida con yogurt griego artesanal probiótico y un sutil toque cítrico natural.", "/torta-pistacho.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 84000], ["8 porc", 123000], ["12 porc", 155000], ["18 porc", 217000], ["25 porc", 270000]]),
  p("torta-9-red-velvet", "Capas Red Velvet", "Tortas", 85000, "Inconfundible bizcocho aterciopelado color carmesí con cacao y capas de frosting suave de queso crema sin azúcar.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 85000], ["8 porc", 124000], ["12 porc", 156000], ["18 porc", 218000]]),
  p("torta-10-tres-leches-vainilla", "3 Leches Vainilla", "Tortas", 84000, "Bizcocho súper húmedo bañado en nuestra exclusiva infusión de tres leches deslactosadas sin azúcar con merengue dorado.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 84000], ["8 porc", 123000], ["12 porc", 155000], ["18 porc", 217000]]),
  p("torta-11-tres-leches-chocolate", "3 Leches Chocolate", "Tortas", 84000, "Versión chocolatosa de tres leches saludables con cacao puro, ultra húmeda, decorada con virutas de chocolate oscuro.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 84000], ["8 porc", 123000], ["12 porc", 155000], ["18 porc", 217000]]),
  p("torta-12-marquesa-brownie", "Marquesa de Brownie", "Tortas", 75000, "Postre frío por capas alternadas de brownie melcochudo de chocolate y crema chantilly ligera sin azúcar refinada.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 75000], ["8 porc", 115000], ["12 porc", 146000], ["18 porc", 205000], ["24 porc", 270000]]),
  p("torta-13-zanahoria", "Torta Zanahoria", "Tortas", 75000, "Deliciosa torta húmeda con zanahoria fresca rallada, nueces de nogal crocantes, canela aromática y frosting de queso suave.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 75000], ["8 porc", 108000], ["12 porc", 141000], ["18 porc", 188000], ["25 porc", 249000]]),
  p("torta-14-sin-lacteos", "Sin Lácteos", "Tortas", 86000, "Formulación 100% libre de caseína y lactosa, elaborada con leche de coco y almendras, suave y esponjosa.", "/torta-moka.jpg", ["Sin Lácteos", "Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, [["5 porc", 86000], ["8 porc", 119000], ["12 porc", 135000], ["18 porc", 193000]]),
  p("torta-15-volcan", "Torta Volcán", "Tortas", 56000, "Espectacular centro fluido de chocolate tibio que fluye al cortar. Perfecta para amantes del chocolate intenso.", "/choco-arequipe.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["2-3 porc", 56000], ["5 porc", 74000], ["8 porc", 110000], ["12 porc", 130000], ["18 porc", 189000]]),
  p("torta-16-tres-sabores", "3 Sabores", "Tortas", 134000, "Trilogía especial que combina bizcocho de chocolate, vainilla y frutos rojos en una sola presentación gourmet.", "/torta-pistacho.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["8 porc", 134000], ["12 porc", 169000], ["18 porc", 223000], ["25 porc", 283000]]),
  p("torta-17-chocoluxe", "Torta Chocoluxe", "Tortas", 94000, "Nuestra creación más indulgente con tres texturas de chocolate belga sin azúcar, trufas fit y ganache brillante.", "/choco-arequipe.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 94000], ["8 porc", 141000], ["12 porc", 197000], ["18 porc", 274000], ["25 porc", 353000]]),
  p("torta-18-maria-luisa", "María Luisa", "Tortas", 84000, "Tradicional torta rellena de abundante arequipe artesanal y dulce de mora casero sin azúcar refinada.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 84000], ["8 porc", 123000], ["12 porc", 155000], ["18 porc", 217000], ["25 porc", 270000]]),
  p("torta-19-matilda", "Matilda", "Tortas", 134000, "Inspirada en el clásico cinéfilo: capas densas y ultra húmedas de puro fudge de chocolate oscuro sin remordimientos.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["8 porc", 134000], ["12 porc", 169000], ["18 porc", 223000], ["25 porc", 283000]]),
  p("torta-20-vasca-frutos-rojos", "Torta Vasca Frutos Rojos", "Tortas", 58000, "Cheesecake estilo vasco horneado a alta temperatura, interior cremoso y compota de frutos rojos de la casa.", "/torta-pistacho.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["3 porc", 58000], ["6 porc", 101000], ["8 porc", 133000]]),
  p("torta-21-vasca-frutos-amarillos", "Torta Vasca Frutos Amarillos", "Tortas", 58000, "Cremosa tarta vasca de queso con coulis tropical de maracuyá, mango y uchuvas 100% natural sin azúcar.", "/torta-pistacho.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["3 porc", 58000], ["6 porc", 101000], ["8 porc", 133000]]),
  p("torta-22-vasca-pistacho", "Tortas Vasca Pistacho", "Tortas", 62000, "Cheesecake quemado vasco con pasta pura de pistachos tostados importados y textura aterciopelada inolvidable.", "/torta-pistacho.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["3 porc", 62000], ["6 porc", 104000], ["8 porc", 139000]]),
  p("torta-23-primavera", "Torta Primavera", "Tortas", 85000, "Fresca y ligera, elaborada con compota de fresas y arándanos frescos, crema ligera de limón y flores comestibles.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 85000], ["8 porc", 124000], ["12 porc", 156000], ["18 porc", 218000], ["25 porc", 271000]]),
  p("torta-24-guanabana-yogurt", "Torta de Guanábana y Yogurt Griego", "Tortas", 55000, "Pulpa natural de guanábana seleccionada combinada con la suavidad del yogurt griego deslactosado y bizcocho ligero.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["8 porc", 55000]]),
  p("torta-25-chocolate-amargo", "Torta de Chocolate Amargo 70%", "Tortas", 52000, "Bizcocho intenso para paladares refinados, elaborado con cacao puro al 70%, sin azúcar ni harinas refinadas.", "/choco-arequipe.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["8 porc", 52000]]),
  p("torta-26-selva-negra", "Torta Selva Negra Fit", "Tortas", 84000, "Capas de bizcocho esponjoso de cacao, cerezas maceradas sin azúcar y suave crema chantilly de almendras.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 84000], ["8 porc", 123000], ["12 porc", 155000], ["18 porc", 217000]]),
  p("torta-27-limon-almendras", "Torta Keto de Limón & Almendras", "Tortas", 78000, "Sabor cítrico vibrante de limones naturales con base de almendras y cobertura de glaseado keto sin calorías.", "/luna-almendras.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 78000], ["8 porc", 112000], ["12 porc", 145000]]),
  p("torta-28-naranja-amapola", "Torta Naranja & Semillas de Amapola", "Tortas", 72000, "Aroma cítrico de naranjas valencianas recién exprimidas con textura crujiente de semillas de amapola seleccionadas.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 72000], ["8 porc", 105000], ["12 porc", 138000]]),
  p("torta-29-tres-leches-arequipe", "Torta Tres Leches Arequipe", "Tortas", 86000, "La combinación soñada: tres leches ultra jugosa empapada con arequipe artesanal saludable y canela.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Con Anticipación"], 1, [["5 porc", 86000], ["8 porc", 126000], ["12 porc", 158000], ["18 porc", 220000]]),

  // --- CATÁLOGO DE DETALLES ---
  p("det-1-mini-torta-corazon", "Mini Torta Corazón", "Detalles", 39000, "Hermosa mini torta personal en forma de corazón con flores naturales y caja de regalo.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-2-mini-box", "Mini Box", "Detalles", 30000, "Caja sorpresa con surtido dulce saludable: mini brownies, alfajor y galletas de chocolate.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-3-guacal-premium", "Guacal Premium", "Detalles", 98000, "Guacal de madera artesanal con mini torta, frasco de arequipe, postre 3 leches y bouquet floral.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-4-guacal-amor", "Guacal Amor", "Detalles", 88000, "Detalle especial en madera con delicias sin azúcar, brownie melcochudo y alfajores fit.", "/torta-pistacho.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-5-brownies-x2", "Brownies x2", "Detalles", 20000, "Dúo de brownies melcochudos de cacao puro y nueces en empaque para regalo con cinta.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-6-copa-saludable", "Copa Saludable", "Detalles", 55000, "Copa de vidrio con capas de torta, chantilly sin azúcar, fresas frescas y lazo decorativo.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-7-guacal-te-cuido", "Guacal te cuido", "Detalles", 52000, "Detalle pensado en bienestar: mugcake esponjoso, mermelada natural y galletitas sin gluten.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-8-guacal-coquette", "Guacal Coquette", "Detalles", 65000, "Presentación elegante con lazo pastel, mini cake decorado y alfajores de arequipe.", "/torta-pistacho.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-9-box-duo", "Box Duo", "Detalles", 20000, "Cajita de regalo con 2 postres individuales a elección para sorprender en cualquier momento.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-10-mini-brownies-x4", "Mini brownies x4", "Detalles", 24000, "Cuatro bocaditos densos de chocolate con nueces tostadas en caja de presentación especial.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-11-postre-ilusion", "Postre Ilusión", "Detalles", 19000, "Vaso postre individual con capas de galleta, crema chantilly fit y compota de frutos rojos.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-12-mini-cake-naranja", "Mini cake Naranja", "Detalles", 28000, "Mini torta personal de naranja natural empacada para regalo con tarjeta y lazo.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-13-mini-cake-love", "Mini cake Love", "Detalles", 28000, "Torta individual de chocolate con cubierta de arequipe saludable y diseño festivo.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("det-14-mini-marquesa-brownie", "Mini Marquesa de Brownie", "Detalles", 35000, "Delicioso postre frío en caja de acetato con capas cremosas y virutas de chocolate.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),

  // --- PAN SALUDABLE (100% LIBRE DE GLUTEN) ---
  p("pan-1-ajo-hierbas", "Pan Ajo y finas hierbas (Salado, 250g)", "Pan", 16000, "Pan artesanal horneado con ajo rostizado, orégano y romero. Masa libre de gluten suave y aromática.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-2-bocadillo-parmesano", "Pan Bocadillo y Queso Parmesano (Dulce, 4 und)", "Pan", 13000, "Cuatro pancitos con relleno de bocadillo sin azúcar añadida y toque saladito de parmesano madurado.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-3-semillas-chia", "Pan Semillas de chía y ajonjolí (Dulce, 4 und)", "Pan", 11000, "Pancitos suaves ricos en fibra natural y omega-3 vegetal, endulzados naturalmente.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Keto", "Con Anticipación"], 1, 0),
  p("pan-4-rollitos-cuajada", "Pan Rollitos de Cuajada y Nuez (Dulce, 4 und)", "Pan", 14000, "Rollitos tiernos con cuajada fresca campesina de la región y nueces picadas crujientes.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-5-oregano", "Pan de Orégano (Salado, 4 und)", "Pan", 11000, "Panecillos salados ideales para acompañar comidas, tostadas o sándwiches ligeros.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-6-queso-parmesano", "Pan de Queso Parmesano (Salado, 4 und)", "Pan", 14000, "Corteza dorada con queso parmesano gratinado e interior esponjoso libre de harinas refinadas.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-7-ajonjoli", "Pan con Ajonjolí (Dulce, 4 und)", "Pan", 15000, "Miga suave con semillas de ajonjolí tostadas que aportan un sabor a nuez característico.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-8-rollitos-chitaga", "Pan Rollitos de Queso Chitagá (Dulce, 4 und)", "Pan", 14000, "Receta tradicional santandereana adaptada 100% saludable con queso típico de Chitagá.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-9-queso-chitaga-300g", "Pan con Queso Chitagá (Dulce, 300g)", "Pan", 18000, "Hogaza familiar rellena con generosas capas de queso Chitagá suave y dulcecito.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-10-baguette", "Pan Baguette (Salado, 250g)", "Pan", 15000, "Baguette artesanal con costra crocante y miga aireada sin trigo ni gluten, perfecta para bruschettas.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-11-queso-campesino", "Pan con Queso Campesino (Dulce, 350g)", "Pan", 19000, "Pan grande para compartir en familia con queso campesino fresco bajo en grasa.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-12-rustico", "Pan Rústico (Salado, 300g)", "Pan", 17000, "Hogaza campestre horneada a la piedra con harinas integrales de semillas y quinoa.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-13-roscon-relleno", "Roscón Relleno (Dulce, arequipe, rinde 4 porc)", "Pan", 30000, "Roscón tradicional relleno de abundante arequipe sin azúcar y azúcar glass fit por encima.", "/choco-arequipe.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),
  p("pan-14-focaccia", "Focaccia (Salado, 300g, rinde 5-6 porc)", "Pan", 36000, "Focaccia italiana con aceite de oliva virgen extra, tomates cherry confitados y romero fresco.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Con Anticipación"], 1, 0),

  // --- POSTRES SALUDABLES ---
  p("pos-1-tres-leches-arequipe-vaso", "3 Leches de Arequipe (9 oz)", "Postres", 17000, "Vaso individual de bizcocho esponjoso bañado en tres leches deslactosadas y arequipe fit.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("pos-2-tres-leches-mermelada", "3 Leches con Mermelada Frutos Rojos / Amarillos", "Postres", 17000, "Tres leches refrescante coronado con mermelada artesanal de frutos del bosque sin azúcar.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Frutos Rojos", 17000], ["Frutos Amarillos", 17000]]),
  p("pos-3-mugcake-surtido", "Mugcake Esponjoso (Varios Sabores)", "Postres", 15000, "Bizcochito fit individual en taza listo para disfrutar. Delicioso, ligero y sin remordimientos.", "/torta-moka.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Naranja & Amapola", 15000], ["Red Velvet", 15000], ["Yogurt Griego", 15000], ["Chocolate 70%", 15000]]),
  p("pos-4-red-velvet-3-leches", "Red Velvet 3 Leches", "Postres", 18000, "La combinación perfecta entre la humedad de las tres leches y el sabor aterciopelado del red velvet.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("pos-5-brownies-caja", "Caja de Brownies Melcochudos", "Postres", 19000, "Brownies densos y húmedos con nueces de nogal y chocolate oscuro al 70%.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Caja x2", 19000], ["Caja x4", 36000]]),
  p("pos-6-mini-brownies-caja", "Mini Brownies Bocaditos", "Postres", 23000, "Caja de mini brownies individuales ideales para snacks de la tarde o compartir.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Caja x4", 23000], ["Caja x8", 44000]]),
  p("pos-7-mini-blondies-caja", "Mini Blondies de Chocolate Blanco", "Postres", 23000, "Suaves cuadritos de vainilla natural con chispas de chocolate blanco sin azúcar.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Caja x4", 23000], ["Caja x8", 44000]]),
  p("pos-8-blondie-caja", "Blondie Tradicional", "Postres", 19000, "Versión rubia del brownie elaborada con harina de almendras y toque acaramelado natural.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Caja x2", 19000], ["Caja x4", 36000]]),
  p("pos-9-galletas-semillas", "Galletas Crocantes de Semillas", "Postres", 12300, "Paquete de galletas artesanales con chía, girasol, ajonjolí y linaza dorada.", "/luna-almendras.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Paquete x10", 12300], ["Paquete x15", 18200]]),
  p("pos-10-galletas-chocolate", "Galletas con Chips de Chocolate", "Postres", 7500, "Galletas clásicas con trozos crujientes de chocolate amargo puro.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Paquete x3", 7500], ["Paquete x10", 19000]]),
  p("pos-11-alfajores-chocolate", "Alfajores Bañados en Chocolate", "Postres", 23000, "Masa quebradiza de maicena rellena con arequipe saludable y cobertura de cacao.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Caja x3", 23000], ["Caja x6", 41000]]),
  p("pos-12-alfajores-arequipe", "Alfajores Tradicionales con Arequipe", "Postres", 21000, "Clásicos alfajores argentinos fit con abundante arequipe artesanal y coco rallado.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Caja x3", 21000], ["Caja x6", 39000]]),
  p("pos-13-mini-cookies", "Mini Cookies (Empaque x12)", "Postres", 7000, "Deliciosas y diminutas galletitas de vainilla ideales para café o lonchera.", "/luna-almendras.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("pos-14-canastilla-yuca", "Canastilla de Pan de Yuca", "Postres", 24000, "Crocantes canastillas de almidón agrio de yuca y queso cuajada fresca.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Entrega Hoy"], 0, [["Empaque x2", 24000], ["Empaque x4", 41000]]),
  p("pos-15-repollas-fit", "Repollas Sin Azúcar y Sin Gluten", "Postres", 17000, "Masa choux ligera rellena de arequipe artesanal y espolvoreadas con endulzante natural.", "/choco-arequipe.jpg", ["Sin Gluten", "Sin Azúcar", "Entrega Hoy"], 0, [["Caja x2", 17000], ["Caja x4", 32000]]),
  p("pos-16-caja-compartir", "Caja Compartir Especial", "Postres", 50000, "Super caja de degustación con canastillas de yuca, mini blondies, fresas y repollas rellenas.", "/torta-pistacho.jpg", ["Sin Gluten", "Sin Azúcar", "Entrega Hoy"], 0, 0),

  // --- MERCADITO SALUDABLE ---
  p("mer-1-arequipe-artesanal", "Arequipe Artesanal 100% Sin Azúcar", "Mercadito", 16000, "Arequipe cremoso cocinado lentamente con leche deslactosada y fruto del monje.", "/choco-arequipe.jpg", ["Sin Azúcar", "Sin Gluten", "Keto", "Entrega Hoy"], 0, [["Frasco 150g", 16000], ["Frasco 280g", 25000], ["Frasco 500g", 38000]]),
  p("mer-2-mermelada-natural", "Mermeladas Naturales Sin Azúcar", "Mercadito", 16000, "Pura fruta seleccionada cocida a fuego lento sin azúcar refinada ni conservantes.", "/torta-moka.jpg", ["Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, [["Envase 150g", 16000], ["Envase 250g", 25500]]),
  p("mer-3-arepas-sin-gluten", "Arepas Libres de Gluten (Paquete)", "Mercadito", 14000, "Arepas artesanales listas para asar, elaboradas con maíz peto puro sin mezclas de trigo.", "/luna-almendras.jpg", ["Sin Gluten", "Sin Azúcar", "Entrega Hoy"], 0, [["Semillas de chía y ajonjolí", 14000], ["Plátano maduro", 14000]]),
  p("mer-4-granola-keto", "Granola Keto de Frutos Secos (250g)", "Mercadito", 22000, "Mezcla tostada de nueces, almendras, semillas de calabaza y coco rallado sin cereales.", "/luna-almendras.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0),
  p("mer-5-endulzante-monkfruit", "Monk Fruit Puro (Endulzante 150g)", "Mercadito", 34000, "Endulzante natural sin impacto glucémico ni calorías. Ideal para hornear y endulzar bebidas.", "/torta-moka.jpg", ["Keto", "Sin Azúcar", "Sin Gluten", "Entrega Hoy"], 0, 0)
];

// Generador de URL directa para WhatsApp (SIN CAMPO DE DEDICATORIA)
const buildWhatsAppUrl = (product, selectedPortion, currentPrice) => {
  const portionText = selectedPortion ? `• Tamaño / Porción: ${selectedPortion}\n` : "";
  const finalPrice = currentPrice || product.price;

  const message = `¡Hola Territorio Saludable! 👋🍰 Quiero pedir el siguiente producto del catálogo:

*${product.name}*
• Categoría: ${product.category}
${portionText}• Precio: ${formatPrice(finalPrice)}
• Estado: ${product.available ? "Disponible" : "Consultar disponibilidad"}

¿Me podrían confirmar disponibilidad y el proceso de entrega para Bucaramanga? ¡Muchas gracias!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (App / page.jsx)
// ==========================================
export default function App() {
  // Vista actual: 'public' | 'admin' | 'panadero'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#admin") return "admin";
      if (hash === "#panadero") return "panadero";
    }
    return "public";
  });

  // Estado de autenticación para roles protegidos: null | 'admin' | 'panadero'
  const [authRole, setAuthRole] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ts_auth_role") || null;
    }
    return null;
  });

  // Modal de contraseña
  const [passwordModalTarget, setPasswordModalTarget] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Catálogo de productos persistido en localStorage
  const [products, setProducts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ts_products_catalog");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => ({
              ...item,
              imageUrl: item.imageUrl || DEFAULT_IMAGE_FALLBACK,
              available: typeof item.available === "boolean" ? item.available : true,
              features: Array.isArray(item.features) ? item.features : ["Sin Azúcar", "Sin Gluten"]
            }));
          }
        }
      } catch (err) {
        console.warn("Error leyendo catálogo guardado:", err);
      }
    }
    return initialProducts;
  });

  // Filtros del catálogo público
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeDietaryTag, setActiveDietaryTag] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPortions, setSelectedPortions] = useState({});

  // Filtros del panel panadero
  const [panaderoCategoryFilter, setPanaderoCategoryFilter] = useState("Todas");
  const [panaderoStatusFilter, setPanaderoStatusFilter] = useState("all");
  const [panaderoSearch, setPanaderoSearch] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Modal de edición de producto en Admin
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados del formulario Admin
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Tortas");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState("/torta-moka.jpg");
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatures, setFormFeatures] = useState(["Sin Azúcar", "Sin Gluten"]);
  const [formRequiresNotice, setFormRequiresNotice] = useState(true);

  // Sincronizar URL hash con vistas
  useEffect(() => {
    const handleLocationSync = () => {
      const hash = window.location.hash;
      if (hash === "#admin") {
        if (authRole === "admin") setCurrentView("admin");
        else handleRequestProtectedAccess("admin");
      } else if (hash === "#panadero") {
        if (authRole === "panadero" || authRole === "admin") setCurrentView("panadero");
        else handleRequestProtectedAccess("panadero");
      } else {
        setCurrentView("public");
      }
    };
    window.addEventListener("hashchange", handleLocationSync);
    return () => window.removeEventListener("hashchange", handleLocationSync);
  }, [authRole]);

  // Persistir cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ts_products_catalog", JSON.stringify(products));
    } catch (err) {
      console.warn("Error guardando en localStorage:", err);
    }
  }, [products]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Solicitar acceso protegido con contraseña
  const handleRequestProtectedAccess = (targetRole) => {
    if (authRole === "admin") {
      setCurrentView(targetRole);
      window.history.pushState(null, "", `#${targetRole}`);
      return;
    }
    if (authRole === "panadero" && targetRole === "panadero") {
      setCurrentView("panadero");
      window.history.pushState(null, "", "#panadero");
      return;
    }

    setPasswordModalTarget(targetRole);
    setPasswordInput("");
    setPasswordError("");
  };

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();

    if (passwordModalTarget === "admin") {
      if (cleanPass === ADMIN_PASSWORD_DEFAULT) {
        setAuthRole("admin");
        if (typeof window !== "undefined") sessionStorage.setItem("ts_auth_role", "admin");
        setCurrentView("admin");
        window.history.pushState(null, "", "#admin");
        setPasswordModalTarget(null);
        showToast("✓ Acceso concedido al Panel de Administración");
      } else {
        setPasswordError("Contraseña incorrecta. (Clave por defecto: 1234)");
      }
    } else if (passwordModalTarget === "panadero") {
      if (cleanPass === PANADERO_PASSWORD_DEFAULT || cleanPass === ADMIN_PASSWORD_DEFAULT) {
        const roleGranted = cleanPass === ADMIN_PASSWORD_DEFAULT ? "admin" : "panadero";
        setAuthRole(roleGranted);
        if (typeof window !== "undefined") sessionStorage.setItem("ts_auth_role", roleGranted);
        setCurrentView("panadero");
        window.history.pushState(null, "", "#panadero");
        setPasswordModalTarget(null);
        showToast("✓ Acceso concedido al Panel de Panadería y Cocina");
      } else {
        setPasswordError("Contraseña incorrecta. (Clave por defecto: 5678)");
      }
    }
  };

  const handleLogout = () => {
    setAuthRole(null);
    if (typeof window !== "undefined") sessionStorage.removeItem("ts_auth_role");
    setCurrentView("public");
    window.history.pushState(null, "", "#");
    showToast("Sesión cerrada");
  };

  const navigateTo = (view) => {
    if (view === "public") {
      setCurrentView("public");
      window.history.pushState(null, "", "#");
    } else {
      handleRequestProtectedAccess(view);
    }
  };

  // REORDENAR PRODUCTO: Mover Arriba ⬆️ o Mover Abajo ⬇️
  const handleMoveProduct = (productId, direction) => {
    const currentIndex = products.findIndex((p) => p.id === productId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newOrder = [...products];
    const [movedItem] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    setProducts(newOrder);
    showToast(`Posición actualizada: "${movedItem.name}" movido hacia ${direction === "up" ? "arriba ⬆️" : "abajo ⬇️"}`);
  };

  // Toggle rápido de disponibilidad (1 solo toque)
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

  // Modal de edición (Admin)
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormImageUrl(product.imageUrl || DEFAULT_IMAGE_FALLBACK);
    setFormAvailable(product.available);
    setFormFeatures(product.features || ["Sin Azúcar", "Sin Gluten"]);
    setFormRequiresNotice(product.requiresNotice ?? (product.category === "Tortas" || product.category === "Pan"));
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("Tortas");
    setFormDescription("");
    setFormPrice(45000);
    setFormImageUrl("/torta-moka.jpg");
    setFormAvailable(true);
    setFormFeatures(["Sin Azúcar", "Sin Gluten"]);
    setFormRequiresNotice(true);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Escribe un nombre para el producto");
      return;
    }

    const cleanImageUrl = formImageUrl.trim() || DEFAULT_IMAGE_FALLBACK;

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
                requiresNotice: formRequiresNotice
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
        requiresNotice: formRequiresNotice
      };
      setProducts((prev) => [newProd, ...prev]);
      showToast(`✓ Producto "${formName.trim()}" agregado al catálogo`);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId, productName) => {
    if (confirm(`¿Estás seguro de eliminar "${productName}" del catálogo?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`Producto "${productName}" eliminado`);
    }
  };

  const handleResetCatalog = () => {
    if (confirm("¿Restablecer el catálogo con las 29 tortas y categorías originales?")) {
      setProducts(initialProducts);
      showToast("✓ Catálogo completo restablecido con las 29 tortas");
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
    return products.filter((p) => {
      if (activeCategory !== "Todas" && p.category !== activeCategory) return false;

      if (activeDietaryTag === "Keto") {
        if (!p.features?.some((f) => /keto/i.test(f))) return false;
      } else if (activeDietaryTag === "Sin Gluten") {
        if (!p.features?.some((f) => /sin gluten/i.test(f))) return false;
      } else if (activeDietaryTag === "Sin Azúcar") {
        if (!p.features?.some((f) => /sin az[uú]car/i.test(f))) return false;
      } else if (activeDietaryTag === "Sin Lácteos") {
        if (!p.features?.some((f) => /sin l[aá]cteos/i.test(f))) return false;
      } else if (activeDietaryTag === "Entrega Hoy") {
        if (p.requiresNotice) return false;
      } else if (activeDietaryTag === "Con Anticipación") {
        if (!p.requiresNotice) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        const matchesFeat = p.features?.some((f) => f.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesFeat) return false;
      }

      return true;
    });
  }, [products, activeCategory, activeDietaryTag, searchQuery]);

  // Filtrado panel panadero
  const panaderoFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (panaderoCategoryFilter !== "Todas" && p.category !== panaderoCategoryFilter) return false;
      if (panaderoStatusFilter === "available" && !p.available) return false;
      if (panaderoStatusFilter === "soldout" && p.available) return false;

      if (panaderoSearch.trim()) {
        const query = panaderoSearch.toLowerCase();
        return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
      }
      return true;
    });
  }, [products, panaderoCategoryFilter, panaderoStatusFilter, panaderoSearch]);

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
    const cakes = products.filter((p) => p.category === "Tortas").length;
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
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
            onClick={() => navigateTo("public")}
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
              onClick={() => navigateTo("public")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentView === "public"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "bg-white border border-[#D8CFC4] text-stone-700 hover:bg-stone-50"
              }`}
            >
              Catálogo
            </button>

            {/* Botón Panel Panadero (Clave 5678) */}
            <button
              onClick={() => navigateTo("panadero")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === "panadero"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              }`}
              title="Panel simplificado para panaderos y cocina (Clave: 5678)"
            >
              <ChefHat size={14} />
              <span className="hidden sm:inline">Panel Panadero</span>
              <span className="sm:hidden">Cocina</span>
            </button>

            {/* Botón Admin Completo (Clave 1234) */}
            <button
              onClick={() => navigateTo("admin")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === "admin"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white border border-[#D8CFC4] text-stone-700 hover:bg-stone-50"
              }`}
              title="Panel completo de administración y precios (Clave: 1234)"
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
      {currentView === "public" && (
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
                Endulzados naturalmente con fruta pura y monk fruit, sin azúcar refinada.
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
                      onClick={() => setSearchQuery("")}
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
            {/* Pestañas por Categoría */}
            <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setActiveCategory("Todas")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === "Todas"
                    ? "bg-[#2D5A27] text-white shadow-sm"
                    : "bg-white border border-[#EAE2D8] text-stone-600 hover:border-[#2D5A27] hover:text-[#2D5A27]"
                }`}
              >
                <span>Todas</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === "Todas" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                }`}>
                  {categoryCounts["Todas"] || 0}
                </span>
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? "bg-[#2D5A27] text-white shadow-sm"
                      : "bg-white border border-[#EAE2D8] text-stone-600 hover:border-[#2D5A27] hover:text-[#2D5A27]"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                  }`}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Filtros por Etiquetas Dietarias */}
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
                      ? "bg-[#241E19] text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Tarjetas de Productos */}
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241E19]">
                  {activeCategory === "Todas" ? "Menú Completo de Territorio Saludable" : `Categoría: ${activeCategory}`}
                  {activeCategory === "Tortas" && " (29 Opciones)"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Mostrando {filteredProducts.length} delicia{filteredProducts.length !== 1 ? "s" : ""} saludable{filteredProducts.length !== 1 ? "s" : ""}
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
                    setActiveCategory("Todas");
                    setActiveDietaryTag("Todas");
                    setSearchQuery("");
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
                  const currentSelectedPortion = selectedPortions[product.id] || (hasSizes && product.sizes ? product.sizes[0].portions : "");
                  const selectedSizeObj = hasSizes && product.sizes
                    ? product.sizes.find((s) => s.portions === currentSelectedPortion) || product.sizes[0]
                    : null;
                  const displayPrice = selectedSizeObj ? selectedSizeObj.price : product.price;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-[#EAE2D8] overflow-hidden flex flex-col shadow-xs hover:shadow-xl hover:border-[#2D5A27]/40 transition-all duration-300 group"
                    >
                      {/* Imagen Fija con Fallback */}
                      <div className="relative aspect-4/3 w-full bg-[#FAF0E6] overflow-hidden">
                        <img
                          src={product.imageUrl || DEFAULT_IMAGE_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + DEFAULT_IMAGE_FALLBACK) {
                              e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                            }
                          }}
                          loading="lazy"
                        />

                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[#2D5A27] text-[11px] font-bold shadow-xs">
                          {product.category}
                        </span>

                        <span
                          className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-xs flex items-center gap-1 ${
                            product.available
                              ? "bg-[#EBF3EA] text-[#2D5A27] border border-[#C5DEC3]"
                              : "bg-red-50 text-red-600 border border-red-200"
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

                        {product.requiresNotice && (
                          <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
                            <Clock size={10} />
                            <span>1 día de anticipación</span>
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-serif text-lg font-bold text-[#241E19] group-hover:text-[#2D5A27] transition">
                            {product.name}
                          </h4>

                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
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
                          {/* Selector de Porciones y Precios */}
                          {hasSizes && product.sizes && (
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                                <span>Elige el tamaño / porción:</span>
                                <span className="text-[#2D5A27] font-semibold">{currentSelectedPortion}</span>
                              </label>
                              <select
                                value={currentSelectedPortion}
                                onChange={(e) =>
                                  setSelectedPortions({
                                    ...selectedPortions,
                                    [product.id]: e.target.value
                                  })
                                }
                                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#2D5A27] cursor-pointer"
                              >
                                {product.sizes.map((size) => (
                                  <option key={size.portions} value={size.portions}>
                                    {size.label || `${size.portions} (${formatPrice(size.price)})`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                              {hasSizes ? "Precio seleccionado" : "Precio"}
                            </span>
                            <span className="font-serif text-xl font-black text-[#2D5A27]">
                              {formatPrice(displayPrice)}
                            </span>
                          </div>

                          {/* Botón Directo WhatsApp (Sin dedicatoria) */}
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
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: PANEL PANADERO (COCINA / HORNEADO - CLAVE 5678)         */}
      {/* Interfaz simplificada tipo checklist: SOLO toggle Disponible/Agotado */}
      {/* ============================================================== */}
      {currentView === "panadero" && (
        <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="bg-amber-50 rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                🥖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-amber-950">
                    Panel de Panadería & Cocina
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                    Checklist Rápido
                  </span>
                </div>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Toca el botón grande de cada producto para cambiar entre <b>Disponible</b> y <b>Agotado</b> en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => navigateTo("public")}
                className="px-3 py-1.5 rounded-xl bg-white text-stone-700 hover:bg-stone-100 text-xs font-bold border border-stone-200 transition cursor-pointer"
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

          {/* Resumen de Métricas Cocina */}
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

          {/* Filtros para Cocina */}
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
                  onClick={() => setPanaderoStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    panaderoStatusFilter === "all"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Todos ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPanaderoStatusFilter("available")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    panaderoStatusFilter === "available"
                      ? "bg-[#2D5A27] text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Disponibles ({stats.available})
                </button>
                <button
                  type="button"
                  onClick={() => setPanaderoStatusFilter("soldout")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    panaderoStatusFilter === "soldout"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  Agotados ({stats.soldOut})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPanaderoCategoryFilter("Todas")}
                className={`text-xs px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  panaderoCategoryFilter === "Todas"
                    ? "bg-[#2D5A27] text-white"
                    : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
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
                      ? "bg-[#2D5A27] text-white"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Lista Checklist de Cocina */}
          <div className="bg-white rounded-3xl border border-[#EAE2D8] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#EAE2D8] flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                Mostrando {panaderoFilteredProducts.length} productos
              </span>
              <span className="text-[11px] text-stone-500">
                Toque el botón para cambiar estado al instante
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {panaderoFilteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition ${
                    product.available ? "hover:bg-emerald-50/30" : "bg-red-50/20 hover:bg-red-50/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0 relative">
                      <img
                        src={product.imageUrl || DEFAULT_IMAGE_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
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
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.available ? "✓ DISPONIBLE EN TIENDA" : "⚠️ AGOTADO EN TIENDA"}
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
                          ? "bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-300"
                          : "bg-[#2D5A27] hover:bg-[#23481E] text-white border-2 border-[#2D5A27]"
                      }`}
                      title="Toque para alternar estado"
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
      {/* VISTA 3: PANEL ADMIN COMPLETO (PROTEGIDO CON CLAVE 1234)        */}
      {/* Permite Mover Arriba ⬆️, Mover Abajo ⬇️, Editar y Eliminar       */}
      {/* ============================================================== */}
      {currentView === "admin" && (
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D8]">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo("public")}
                  className="p-2 rounded-xl bg-white border border-[#D8CFC4] hover:bg-stone-50 text-stone-600 transition cursor-pointer"
                  title="Volver al catálogo público"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#241E19]">
                  Panel de Administración
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Usa las flechas <b>Subir ⬆️ y Bajar ⬇️</b> para cambiar exactamente el orden de visualización en el catálogo público.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-amber-600 text-stone-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Restablecer el catálogo con las 29 tortas y categorías originales"
              >
                <RefreshCw size={13} />
                <span>Restablecer 29 Tortas</span>
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

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EAE2D8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Productos</span>
                <p className="font-serif text-2xl font-black text-[#241E19]">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E6] text-[#8C533C] flex items-center justify-center font-bold text-lg">
                📦
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE2D8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Tortas Saludables</span>
                <p className="font-serif text-2xl font-black text-purple-700">{stats.cakes} / 29</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                🍰
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE2D8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Disponibles</span>
                <p className="font-serif text-2xl font-black text-[#2D5A27]">{stats.available}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EBF3EA] text-[#2D5A27] flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE2D8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Agotados</span>
                <p className="font-serif text-2xl font-black text-red-600">{stats.soldOut}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
                <XCircle size={20} />
              </div>
            </div>
          </div>

          {/* Tabla de Productos con Controles de Reordenamiento (⬆️ y ⬇️) */}
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
                    {/* Botones de Reordenar (Subir ⬆️ / Bajar ⬇️) + Número de Posición */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveProduct(product.id, "up")}
                          className={`p-1.5 rounded-lg border transition ${
                            isFirst
                              ? "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed"
                              : "bg-white text-stone-700 border-stone-300 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] cursor-pointer shadow-2xs"
                          }`}
                          title={isFirst ? "Ya está en la primera posición" : "Subir producto de posición ⬆️"}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <span className="text-[11px] font-mono font-bold text-stone-500">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveProduct(product.id, "down")}
                          className={`p-1.5 rounded-lg border transition ${
                            isLast
                              ? "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed"
                              : "bg-white text-stone-700 border-stone-300 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] cursor-pointer shadow-2xs"
                          }`}
                          title={isLast ? "Ya está en la última posición" : "Bajar producto de posición ⬇️"}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      {/* Miniatura */}
                      <div className="w-16 h-16 rounded-2xl bg-[#FAF0E6] overflow-hidden border border-[#EAE2D8] shrink-0 relative">
                        <img
                          src={product.imageUrl || DEFAULT_IMAGE_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
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
                        <span className={`text-xs font-bold ${product.available ? "text-[#2D5A27]" : "text-stone-400"}`}>
                          {product.available ? "Disponible" : "Agotado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleProductStatus(product.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.available ? "bg-[#2D5A27]" : "bg-stone-300"
                          }`}
                          role="switch"
                          aria-checked={product.available}
                          title={`Alternar a ${product.available ? "Agotado" : "Disponible"}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              product.available ? "translate-x-5" : "translate-x-0"
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
      {/* MODAL DE SEGURIDAD CON CONTRASEÑA (ADMIN: 1234 / PANADERO: 5678)*/}
      {/* ============================================================== */}
      {passwordModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full overflow-hidden p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF3EA] text-[#2D5A27] flex items-center justify-center mx-auto shadow-inner">
                {passwordModalTarget === "admin" ? <KeyRound size={24} /> : <ChefHat size={24} />}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#241E19]">
                {passwordModalTarget === "admin" ? "Acceso a Administración" : "Acceso a Panadería & Cocina"}
              </h3>
              <p className="text-xs text-stone-500">
                {passwordModalTarget === "admin"
                  ? "Ingresa la contraseña de administrador (por defecto: 1234)"
                  : "Ingresa la contraseña para cocina (por defecto: 5678)"}
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
                    setPasswordError("");
                  }}
                  placeholder={passwordModalTarget === "admin" ? "Clave: 1234" : "Clave: 5678"}
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
                  {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
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
                      { label: "Torta Moka", path: "/torta-moka.jpg" },
                      { label: "Torta Pistacho", path: "/torta-pistacho.jpg" },
                      { label: "Choco-arequipe", path: "/choco-arequipe.jpg" },
                      { label: "Luna Almendras", path: "/luna-almendras.jpg" }
                    ].map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => setFormImageUrl(item.path)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition cursor-pointer border ${
                          formImageUrl === item.path
                            ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                            : "bg-stone-100 text-stone-600 border-stone-200 hover:border-[#2D5A27]"
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
                      src={formImageUrl || DEFAULT_IMAGE_FALLBACK}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
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
                  {["Sin Azúcar", "Sin Gluten", "Keto", "Sin Lácteos"].map((feat) => {
                    const isSelected = formFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFormFeature(feat)}
                        className={`text-xs px-3 py-1 rounded-xl font-semibold transition cursor-pointer border ${
                          isSelected
                            ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:border-[#2D5A27]"
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
                    {formRequiresNotice ? "Se hornea por encargo (1 día)" : "Disponible para entrega hoy"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setFormRequiresNotice(!formRequiresNotice)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formRequiresNotice ? "bg-[#2D5A27]" : "bg-stone-300"
                  }`}
                  role="switch"
                  aria-checked={formRequiresNotice}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formRequiresNotice ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Estado Disponible
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {formAvailable ? "Habilitado en el catálogo público" : "Marcado como Agotado"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setFormAvailable(!formAvailable)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formAvailable ? "bg-[#2D5A27]" : "bg-stone-300"
                  }`}
                  role="switch"
                  aria-checked={formAvailable}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formAvailable ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481E] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
