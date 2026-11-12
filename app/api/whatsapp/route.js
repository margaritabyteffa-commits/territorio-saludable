import { NextResponse } from 'next/server';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE || '573000559196';
const BASE_URL = 'https://territorio-saludable.vercel.app';

// Matriz oculta de barrios y tarifas de Bucaramanga y Área Metropolitana
const BARRIOS_TARIFAS = [
  { 
    tarifa: 5000, 
    zona: 'Cabecera / Sotomayor / Prado', 
    barrios: ['cabecera', 'sotomayor', 'prado', 'antiguo campestre', 'mejoras publicas', 'mejoras públicas', 'conucos', 'la floresta', 'bolivar', 'bolívar', 'pan de azucar', 'pan de azúcar', 'terrazas', 'altos de cabecera'] 
  },
  { 
    tarifa: 7000, 
    zona: 'Centro / San Francisco / Ciudadela', 
    barrios: ['centro', 'san francisco', 'alarcon', 'alarcón', 'comuneros', 'la concordia', 'ricaurte', 'mutis', 'real de minas', 'ciudadela', 'diamante', 'provenza', 'san alonso', 'la aurora', 'universidad', 'antonia santos', 'garcia rovira', 'garcía rovira', 'el rocio', 'el rocío', 'cacique', 'tejar'] 
  },
  { 
    tarifa: 10000, 
    zona: 'Floridablanca / Cañaveral', 
    barrios: ['floridablanca', 'cañaveral', 'canaveral', 'el bosque', 'lagos', 'zapamanga', 'la cumbre', 'altamira', 'molinos', 'bucaros', 'búcaros', 'caldas', 'fatima', 'fátima', 'villabel', 'caracolí', 'caracoli'] 
  },
  { 
    tarifa: 12000, 
    zona: 'Norte / Morrorico / La Feria', 
    barrios: ['morrorico', 'la feria', 'kennedy', 'cafe madrid', 'café madrid', 'colorados', 'estoraques', 'campo hermoso', 'gaitan', 'gaitán', 'modelo', 'chapinero', 'girardot'] 
  },
  { 
    tarifa: 15000, 
    zona: 'Girón / Piedecuesta / Ruitoque', 
    barrios: ['giron', 'girón', 'piedecuesta', 'ruitoque', 'menzuly', 'valle de menzuly', 'guatiguara', 'guatiguará', 'barro blanco', 'poblado', 'rincon de giron', 'rincón de girón'] 
  }
];

const PRICE_CATALOG = {
  'torta pistacho (5 porc)': 94000,
  'torta pistacho (8 porc)': 141000,
  'torta pistacho (12 porc)': 197000,
  'torta pistacho (18 porc)': 274000,
  'torta pistacho (25 porc)': 353000,
  'torta moka (5 porc)': 84000,
  'torta moka (8 porc)': 123000,
  'torta moka (12 porc)': 155000,
  'torta moka (18 porc)': 217000,
  'luna de almendras (5 porc)': 73000,
  'luna de almendras (8 porc)': 108000,
  'luna de almendras (12 porc)': 142000,
  'luna de almendras (18 porc)': 189000,
  'luna de almendras (25 porc)': 250000,
  'torta zanahoria (5 porc)': 73000,
  'torta zanahoria (8 porc)': 108000,
  'torta zanahoria (12 porc)': 145000,
  'torta zanahoria (18 porc)': 189000,
  'torta zanahoria (25 porc)': 249000,
  'torta de arequipe (5 porc)': 82000,
  'torta de arequipe (8 porc)': 118000,
  'torta de arequipe (12 porc)': 148000,
  'torta de arequipe (18 porc)': 195000,
  'torta de arequipe (25 porc)': 255000,
  'torta primavera (5 porc)': 75000,
  'torta primavera (8 porc)': 110000,
  'torta primavera (12 porc)': 145000,
  'torta primavera (18 porc)': 195000
};

const userSessions = {};

const MENU_PRINCIPAL = `¡Hola! Bienvenid@ a *Territorio Saludable* 🍰🌱

Pastelería 100% Sin Azúcar Refinada y Libres de Gluten en Bucaramanga.
Responde con el número de tu preferencia:

1️⃣ Tortas Saludables
2️⃣ Catalogo Detalles
3️⃣ Pan Saludable
4️⃣ Postres Saludables
5️⃣ Mercadito
6️⃣ 📖 Ver el Catálogo Completo
7️⃣ 👩‍🍳 Hablar con un asesor

Visita nuestra tienda web: ${BASE_URL}`;

const MENU_RESPONSES = {
  '1': `¡Nuestras tortas son deliciosas y sin culpa! 🍰\n\nMíralas aquí:\n${BASE_URL}/#tortas\n\n📌 *Recuerda:* En la página debes seleccionar el número de porciones que deseas.\n\nCuando sepas cuál te gusta, ¡escríbeme su nombre y porciones por aquí o selecciónala directamente desde la página! 🍰✨\n\nResponde 0 o Menu para volver al menú principal.`,
  '2': `¡Sorprende a alguien especial con nuestros detalles saludables! 🎁\n\nConsulta el catálogo de detalles aquí:\n${BASE_URL}/#detalles\n\n¡Escríbenos el detalle que deseas encargar!\n\nResponde 0 o Menu para volver al menú principal.`,
  '3': `¡Panes artesanos 100% sin azúcar y sin gluten! 🍞\n\nMira nuestras variedades aquí:\n${BASE_URL}/#pan\n\n¡Escríbeme el pan que deseas encargar!\n\nResponde 0 o Menu para volver al menú principal.`,
  '4': `¡Postres saludables para disfrutar cualquier día! 🍮\n\nExplora la lista completa de postres aquí:\n${BASE_URL}/#postres\n\nEscríbenos cuál te provoca pedir hoy.\n\nResponde 0 o Menu para volver al menú principal.`,
  '5': `¡Bienvenidos a nuestro Mercadito Saludable! 🛒\n\nProductos e insumos naturales aquí:\n${BASE_URL}/#mercadito\n\nResponde 0 o Menu para volver al menú principal.`,
  '6': `📖 *Catálogo Completo de Territorio Saludable*\n\nPuedes explorar todos nuestros productos, fotos y precios en:\n${BASE_URL}\n\nResponde 0 o Menu para volver al menú principal.`,
  '0': MENU_PRINCIPAL,
  'menu': MENU_PRINCIPAL
};

const formatCOP = (n) => '$ ' + Number(n || 0).toLocaleString('es-CO');

// Obtiene la fecha de HOY o MAÑANA en zona horaria de Colombia
function getDynamicDateExample(daysToAdd = 0) {
  const now = new Date();
  const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  colombiaTime.setDate(colombiaTime.getDate() + daysToAdd);
  const dd = String(colombiaTime.getDate()).padStart(2, '0');
  const mm = String(colombiaTime.getMonth() + 1).padStart(2, '0');
  const yyyy = colombiaTime.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Evalúa si el pedido exige 1 día de anticipación
function cartRequiresOneDayNotice(session) {
  if (!session.fromWeb) {
    return true;
  }
  return session.cart.some(item => {
    const clean = item.toLowerCase();
    return clean.includes('1 día anticipación') || clean.includes('1 dia anticipacion');
  });
}

// Completa el año automáticamente si el cliente escribe solo día y mes
function normalizeUserDate(text) {
  const now = new Date();
  const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const currentYear = colombiaTime.getFullYear();
  
  if (!text.includes(String(currentYear)) && !text.includes(String(currentYear + 1))) {
    return `${text.trim()} de ${currentYear}`;
  }
  return text.trim();
}

function getCalculatedPrice(productString) {
  const clean = productString.toLowerCase().replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  for (const [key, val] of Object.entries(PRICE_CATALOG)) {
    if (clean.includes(key)) return val;
  }
  if (clean.includes('25 porc')) return 353000;
  if (clean.includes('18 porc')) return 274000;
  if (clean.includes('12 porc')) return 197000;
  if (clean.includes('8 porc')) return 141000;
  if (clean.includes('5 porc')) return 94000;
  return 85000;
}

async function calculateShippingByAddress(addressText) {
  const clean = addressText.toLowerCase();
  
  for (const group of BARRIOS_TARIFAS) {
    if (group.barrios.some(b => clean.includes(b))) {
      return { found: true, tarifa: group.tarifa, zona: group.zona };
    }
  }

  if (GEMINI_API_KEY && clean.length > 10) {
    try {
      const prompt = `Eres un experto en geografía de Bucaramanga, Floridablanca, Girón y Piedecuesta (Santander, Colombia).
El cliente escribió esta dirección: "${addressText}".
Si menciona un barrio, conjunto o municipio identificable, asigna el costo de domicilio desde Cabecera (Bucaramanga) respondiendo ÚNICAMENTE con uno de estos números:
- 5000 (Sector Cabecera, Sotomayor, Prado, Mejoras Públicas, Terrazas, Conucos)
- 7000 (Centro, San Francisco, Real de Minas, Provenza, Diamante, Mutis, San Alonso, Aurora, Cacique)
- 10000 (Floridablanca casco antiguo, Cañaveral, Lagos, Bosque, Zapamanga, Cumbre)
- 12000 (Norte de Bucaramanga, Morrorico, Campo Hermoso, La Feria, Café Madrid)
- 15000 (Girón, Piedecuesta, Ruitoque, Menzuly)
Si el texto SOLO tiene nomenclatura (calle/carrera/número) y NO menciona ningún barrio, conjunto ni municipio, responde exactamente: FALTA_BARRIO`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
        }
      );
      const data = await res.json();
      const ans = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const num = parseInt(ans.replace(/\D/g, ''));
      if ([5000, 7000, 10000, 12000, 15000].includes(num)) {
        return { found: true, tarifa: num, zona: 'Área Metropolitana' };
      }
    } catch (e) {
      console.error('Error calculando barrio con IA:', e);
    }
  }

  return { found: false };
}

async function verifyReceiptWithAI(imageId) {
  if (!GEMINI_API_KEY) return { valid: true };
  try {
    const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${imageId}`, {
      headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
    });
    const mediaData = await mediaRes.json();
    if (!mediaData.url) return { valid: true };

    const imgRes = await fetch(mediaData.url, {
      headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
    });
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

    const prompt = `Analiza esta imagen. ¿Es un comprobante de transferencia bancaria o pago digital (Nequi, Bancolombia, Daviplata, PSE, etc.)?
Responde en formato JSON estricto sin markdown:
{"esComprobante": true/false, "montoDetectado": numero_sin_puntos_ni_simbolos, "detalle": "breve descripcion"}`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Image } }
            ]
          }]
        })
      }
    );
    const aiData = await aiRes.json();
    const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanJson = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    
    if (cleanJson.esComprobante === false) {
      return { valid: false, reason: 'La imagen enviada no parece ser un comprobante de pago bancario.' };
    }
    return { valid: true, info: cleanJson.detalle || 'Comprobante bancario detectado' };
  } catch (e) {
    console.error('Error analizando comprobante:', e);
    return { valid: true };
  }
}

async function sendWhatsAppMessage(to, text) {
  try {
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: text }
      })
    });
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
  }
}

function parseWebOrderMessage(text) {
  if (text.includes('Quiero pedir:')) {
    const parts = text.split('Quiero pedir:');
    if (parts[1]) {
      const detail = parts[1].split('- $')[0].trim();
      let price = getCalculatedPrice(detail);
      if (text.includes('$')) {
        const pStr = text.split('$')[1]?.replace(/[^\d]/g, '');
        if (pStr && Number(pStr) > 1000) price = Number(pStr);
      }
      return { item: detail, price };
    }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const MY_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'territorio_token_secret';

  if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Verification failed', { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const messageType = message.type;
      const incomingText = message.text?.body?.trim() || '';
      const normalizedText = incomingText.toLowerCase();

      // Aprobación por parte del Administrador / Jefa
      if (from === ADMIN_PHONE && (normalizedText.startsWith('aprobar') || normalizedText.startsWith('aprobado') || normalizedText.includes('pedido aprobado'))) {
        const targetPhone = normalizedText.replace(/\D/g, '');
        const clientTarget = targetPhone.length >= 10 
          ? targetPhone 
          : Object.keys(userSessions).find(k => userSessions[k].state === 'AWAITING_VERIFICATION');
        
        if (clientTarget && userSessions[clientTarget]) {
          const order = userSessions[clientTarget].orderData;
          const items = userSessions[clientTarget].cart.join(', ');
          userSessions[clientTarget].state = 'APPROVED';

          await sendWhatsAppMessage(clientTarget, `🎉 ¡Excelente noticia! Hemos verificado tu pago correctamente.\n\n🎂 Tu pedido (*${items}*) ha sido *APROBADO Y AGENDADO* para el *${order.deliveryDate}* a las *${order.deliveryTime}*.\n\n¡Muchas gracias por elegir Territorio Saludable! 🌱✨`);
          await sendWhatsAppMessage(ADMIN_PHONE, `✅ *PEDIDO AGENDADO EXITOSAMENTE*\n\nCliente: ${order.clientName} (${clientTarget})\nProductos: ${items}\nEntrega: ${order.deliveryDate} - ${order.deliveryTime}\nDirección: ${order.address}`);
        } else {
          await sendWhatsAppMessage(ADMIN_PHONE, `⚠️ No encontré un pedido pendiente de verificación para aprobar.`);
        }
        return NextResponse.json({ status: 'ok' });
      }

      if (!userSessions[from]) {
        userSessions[from] = { state: 'IDLE', fromWeb: false, cart: [], itemsDetail: [], orderData: {} };
      }
      const session = userSessions[from];

      // Detección prioritaria de pedido desde botón Web
      const webOrder = parseWebOrderMessage(incomingText);
      if (webOrder) {
        session.fromWeb = true;
        session.cart = [webOrder.item];
        session.itemsDetail = [{ name: webOrder.item, price: webOrder.price }];
        session.state = 'ASK_ADD_MORE';
        const cleanName = webOrder.item.replace(/\[.*?\]/g, '').trim();
        await sendWhatsAppMessage(from, `¡Excelente elección! 🍰 He agregado *${cleanName}* (${formatCOP(webOrder.price)}) a tu pedido.\n\n¿Deseas agregar otro producto más?\n1️⃣ Sí\n2️⃣ No`);
        return NextResponse.json({ status: 'ok' });
      }

      // Saludo o reinicio
      if (normalizedText === '0' || normalizedText === 'menu' || normalizedText === 'hola') {
        session.state = 'IDLE';
        session.fromWeb = false;
        session.cart = [];
        session.itemsDetail = [];
        session.orderData = {};
        await sendWhatsAppMessage(from, MENU_PRINCIPAL);
        return NextResponse.json({ status: 'ok' });
      }

      // Opción 7: Asesor Humano
      if (normalizedText === '7' && session.state === 'IDLE') {
        await sendWhatsAppMessage(from, `👩‍🍳 Ya uno de nuestros asesores estará respondiendo todas tus preguntas en breve.`);
        await sendWhatsAppMessage(ADMIN_PHONE, `🚨 *SOLICITUD DE ASESOR:* El cliente ${from} necesita atención personalizada.`);
        return NextResponse.json({ status: 'ok' });
      }

      // Recepción de comprobante
      if (messageType === 'image' || messageType === 'document') {
        if (session.state === 'AWAITING_PAYMENT' || session.state === 'CONFIRM_ORDER') {
          const mediaId = message.image?.id || message.document?.id;
          const verification = await verifyReceiptWithAI(mediaId);

          if (!verification.valid) {
            await sendWhatsAppMessage(from, `⚠️ ${verification.reason}\n\nPor favor envíanos la captura o foto del comprobante de transferencia por valor de *${formatCOP(session.orderData.grandTotal)}* para continuar.`);
            return NextResponse.json({ status: 'ok' });
          }

          session.state = 'AWAITING_VERIFICATION';
          await sendWhatsAppMessage(from, `¡Muchas gracias por enviar tu comprobante! 🧾\n\nVamos a verificar tu pago y en breve recibirás la confirmación de agendamiento de tu pedido.`);
          
          const cleanItems = session.cart.map(i => i.replace(/\[.*?\]/g, '').trim()).join(', ');
          const adminNotice = `🚨 *COMPROBANTE RECIBIDO - REVISAR* 🚨\n\n👤 *Cliente:* ${session.orderData.clientName}\n📱 *WhatsApp:* ${from}\n🎂 *Productos:* ${cleanItems}\n📍 *Dirección:* ${session.orderData.address}\n📅 *Entrega:* ${session.orderData.deliveryDate} - ${session.orderData.deliveryTime}\n💰 *Total a Verificar:* ${formatCOP(session.orderData.grandTotal)}\n🔍 *Lectura IA:* ${verification.info || 'Imagen recibida'}\n\n👉 Cuando verifiques el dinero en tu banco, responde:\n*Aprobar ${from}*`;
          
          await sendWhatsAppMessage(ADMIN_PHONE, adminNotice);
          return NextResponse.json({ status: 'ok' });
        }
      }

      // Máquina de estados secuencial
      switch (session.state) {
        case 'IDLE':
          if (MENU_RESPONSES[normalizedText]) {
            await sendWhatsAppMessage(from, MENU_RESPONSES[normalizedText]);
          } else {
            session.fromWeb = false;
            const calculatedPrice = getCalculatedPrice(incomingText);
            if (normalizedText.includes('porc') || normalizedText.includes('porciones') || normalizedText.includes('personal')) {
              session.cart.push(incomingText);
              session.itemsDetail.push({ name: incomingText, price: calculatedPrice });
              session.state = 'ASK_ADD_MORE';
              await sendWhatsAppMessage(from, `¡Anotado! 📝 Agregado: *${incomingText}* (${formatCOP(calculatedPrice)}).\n\n¿Deseas agregar otro producto más?\n1️⃣ Sí\n2️⃣ No`);
            } else {
              session.tempProduct = incomingText;
              session.state = 'ASK_PORTIONS';
              await sendWhatsAppMessage(from, `¡Qué deliciosa elección! 🎂 Recuerda que los pedidos directos por chat se programan con 1 día de anticipación.\n\nPor favor, indícanos cuántas porciones o cantidad deseas para *${incomingText}* (Ejemplo: 5 porc, 8 porc, 12 porc, 18 porc, 25 porc o 1 unidad):`);
            }
          }
          break;

        case 'ASK_PORTIONS':
          const fullItem = `${session.tempProduct} (${incomingText})`;
          const itemPrice = getCalculatedPrice(fullItem);
          session.cart.push(fullItem);
          session.itemsDetail.push({ name: fullItem, price: itemPrice });
          delete session.tempProduct;
          session.state = 'ASK_ADD_MORE';
          await sendWhatsAppMessage(from, `¡Perfecto! Agregado *${fullItem}* (${formatCOP(itemPrice)}) a tu pedido. 🍰\n\n¿Deseas agregar otro producto más?\n1️⃣ Sí\n2️⃣ No`);
          break;

        case 'ASK_ADD_MORE':
          if (normalizedText === '1' || normalizedText === 'si' || normalizedText === 'sí') {
            session.state = 'IDLE';
            await sendWhatsAppMessage(from, `Escribe el nombre del otro producto o presiona *0* para ver el menú:`);
          } else {
            session.state = 'ASK_CLIENT_NAME';
            await sendWhatsAppMessage(from, `¡Perfecto! Vamos a tomar tus datos para la entrega.\n\n1. ¿Cuál es el *nombre completo de la persona que realiza el pedido*?`);
          }
          break;

        case 'ASK_CLIENT_NAME':
          session.orderData.clientName = incomingText;
          session.state = 'ASK_ADDRESS';
          await sendWhatsAppMessage(
            from,
            `2. ¿Cuál es la *dirección exacta de entrega*?\nPor favor incluye *barrio o municipio*, y si aplica, *torre, apartamento o casa*.\n\n📌 _Ejemplo: Cra 35 # 52-20, Torre 2 Apto 401, Barrio Cabecera_`
          );
          break;

        case 'ASK_ADDRESS':
          session.orderData.address = incomingText;
          const shippingCalc = await calculateShippingByAddress(incomingText);
          
          if (shippingCalc.found) {
            session.orderData.shippingCost = shippingCalc.tarifa;
            session.orderData.zoneName = shippingCalc.zona;
            session.state = 'ASK_RECIPIENT_NAME';
            await sendWhatsAppMessage(from, `3. ¿Cuál es el *nombre de la persona que recibe* el pedido?`);
          } else {
            session.state = 'ASK_NEIGHBORHOOD';
            await sendWhatsAppMessage(
              from,
              `¿En qué *barrio o municipio* (Bucaramanga, Floridablanca, Girón o Piedecuesta) queda esa dirección para calcular el valor de tu domicilio?`
            );
          }
          break;

        case 'ASK_NEIGHBORHOOD':
          session.orderData.address = `${session.orderData.address} (${incomingText})`;
          const secondCalc = await calculateShippingByAddress(incomingText);
          session.orderData.shippingCost = secondCalc.found ? secondCalc.tarifa : 7000;
          session.orderData.zoneName = secondCalc.found ? secondCalc.zona : incomingText;
          
          session.state = 'ASK_RECIPIENT_NAME';
          await sendWhatsAppMessage(from, `3. ¿Cuál es el *nombre de la persona que recibe* el pedido?`);
          break;

        case 'ASK_RECIPIENT_NAME':
          session.orderData.recipientName = incomingText;
          session.state = 'ASK_RECIPIENT_PHONE';
          await sendWhatsAppMessage(from, `4. ¿Cuál es el *número de teléfono/celular de la persona que recibe*?`);
          break;

        case 'ASK_RECIPIENT_PHONE':
          session.orderData.recipientPhone = incomingText;
          session.state = 'ASK_DELIVERY_DATE';

          const needsTomorrow = cartRequiresOneDayNotice(session);
          if (needsTomorrow) {
            const tomorrowStr = getDynamicDateExample(1);
            await sendWhatsAppMessage(
              from,
              `5. ¿Para qué *fecha* deseas la entrega?\n⚠️ _Recuerda que este pedido se agenda con 1 día de anticipación (a partir de mañana)._\n\n📌 _Ejemplo: ${tomorrowStr} o 15 de noviembre:_`
            );
          } else {
            const todayStr = getDynamicDateExample(0);
            await sendWhatsAppMessage(
              from,
              `5. ¿Para qué *fecha* deseas la entrega?\n✨ _Estos productos tienen disponibilidad para entrega hoy mismo o la fecha que prefieras._\n\n📌 _Ejemplo: Hoy ${todayStr} o 15 de noviembre:_`
            );
          }
          break;

        case 'ASK_DELIVERY_DATE':
          session.orderData.deliveryDate = normalizeUserDate(incomingText);
          session.state = 'ASK_DELIVERY_TIME';
          await sendWhatsAppMessage(from, `6. ¿En qué *horario o rango de hora* prefieres la entrega? (Ejemplo: 4:00 PM):`);
          break;

        case 'ASK_DELIVERY_TIME':
          session.orderData.deliveryTime = incomingText;
          session.state = 'CONFIRM_ORDER';

          const subtotal = session.itemsDetail.reduce((acc, curr) => acc + curr.price, 0);
          const shipping = session.orderData.shippingCost || 7000;
          const grandTotal = subtotal + shipping;

          session.orderData.subtotal = subtotal;
          session.orderData.grandTotal = grandTotal;

          const cleanCartList = session.cart.map(i => `• ${i.replace(/\[.*?\]/g, '').trim()}`).join('\n');

          const summaryText = `📋 *RESUMEN DE TU PEDIDO* 🍰🌱

🛒 *Producto(s):*
${cleanCartList}

👤 *Cliente:* ${session.orderData.clientName}
📍 *Dirección de Entrega:* ${session.orderData.address}
📦 *Recibe:* ${session.orderData.recipientName} (${session.orderData.recipientPhone})
📅 *Fecha de Entrega:* ${session.orderData.deliveryDate}
🕒 *Hora de Entrega:* ${session.orderData.deliveryTime}

💰 *Subtotal Productos:* ${formatCOP(subtotal)}
🛵 *Domicilio:* ${formatCOP(shipping)}
💳 *TOTAL A PAGAR:* ${formatCOP(grandTotal)}

¿Confirmas que toda la información es correcta?
1️⃣ Sí, confirmar pedido
2️⃣ No, corregir o cancelar`;

          await sendWhatsAppMessage(from, summaryText);
          break;

        case 'CONFIRM_ORDER':
          if (normalizedText === '1' || normalizedText === 'si' || normalizedText === 'sí') {
            session.state = 'AWAITING_PAYMENT';
            
            const bankDetails = `🎉 *¡Pedido Confirmado por valor de ${formatCOP(session.orderData.grandTotal)}!*

Para programar tu pedido en cocina, por favor realiza la transferencia a cualquiera de nuestras cuentas oficiales:

💳 *Nequi / Daviplata:* 3000559196
🏦 *Bancolombia Ahorros:* 379-000123-45 (Territorio Saludable S.A.S.)

📌 *PASO FINAL:* Envíanos la *foto o comprobante del pago* por este chat para verificar la transferencia y agendar tu entrega. ¡Muchas gracias!`;

            await sendWhatsAppMessage(from, bankDetails);
          } else {
            session.state = 'IDLE';
            session.fromWeb = false;
            session.cart = [];
            session.itemsDetail = [];
            session.orderData = {};
            await sendWhatsAppMessage(from, `Pedido cancelado o reiniciado. Responde *0* o *Menu* para comenzar nuevamente.`);
          }
          break;
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
