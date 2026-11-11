import { NextResponse } from 'next/server';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE || '573000559196';

const BASE_URL = 'https://territorio-saludable.vercel.app';

// Tarifas de domicilio según zona de Bucaramanga / Área Metropolitana
const ZONAS_DOMICILIO = [
  { name: 'Cabecera / Sotomayor / Prado', price: 5000 },
  { name: 'Centro / San Francisco', price: 7000 },
  { name: 'Floridablanca / Cañaveral', price: 10000 },
  { name: 'Girón / Piedecuesta', price: 15000 }
];

// Precios de referencia según porción
const PRODUCT_PRICES = {
  'torta pistacho (12 porciones)': 197000,
  'torta moka (12 porciones)': 155000,
  'torta moka (5 porciones)': 84000,
  'torta de arequipe (8 porciones)': 118000
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

async function sendWhatsAppMessage(to, text) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
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
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
  }
}

function parseWebOrderMessage(text) {
  if (text.includes('Quisiera pedir:')) {
    const parts = text.split('Quisiera pedir:');
    if (parts[1]) {
      const detail = parts[1].split('por valor de')[0].trim();
      let price = 0;
      if (text.includes('$')) {
        const pStr = text.split('$')[1]?.split('.')[0]?.replace(/\D/g, '');
        price = Number(pStr || 0) * 1000;
      }
      return { item: detail, price: price || 120000 };
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
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from;
      const messageType = message.type;
      const incomingText = message.text?.body?.trim() || '';
      const normalizedText = incomingText.toLowerCase();

      // Si el Administrador aprueba una orden respondiendo "Aprobar [Telefono]" o "Aprobado"
      if (from === ADMIN_PHONE && (normalizedText.startsWith('aprobar') || normalizedText.startsWith('aprobado'))) {
        const targetPhone = normalizedText.replace('aprobar', '').replace('aprobado', '').trim();
        const clientTarget = targetPhone || Object.keys(userSessions).find(k => userSessions[k].state === 'AWAITING_VERIFICATION');
        
        if (clientTarget && userSessions[clientTarget]) {
          userSessions[clientTarget].state = 'APPROVED';
          await sendWhatsAppMessage(clientTarget, `🎉 ¡Excelente noticia! Hemos verificado tu pago correctamente.\n\n🎂 Tu pedido ha sido *APROBADO Y PROGRAMADO EN COCINA*. ¡Muchas gracias por elegir Territorio Saludable!`);
          await sendWhatsAppMessage(ADMIN_PHONE, `✅ El pedido del cliente ${clientTarget} ha sido confirmado y agendado.`);
        }
        return NextResponse.json({ status: 'ok' });
      }

      if (!userSessions[from]) {
        userSessions[from] = { state: 'IDLE', cart: [], itemsDetail: [], orderData: {} };
      }
      const session = userSessions[from];

      // Reiniciar con 0 o Menu
      if (normalizedText === '0' || normalizedText === 'menu' || normalizedText === 'hola') {
        session.state = 'IDLE';
        session.cart = [];
        session.itemsDetail = [];
        session.orderData = {};
        await sendWhatsAppMessage(from, MENU_PRINCIPAL);
        return NextResponse.json({ status: 'ok' });
      }

      // Si el usuario envía comprobante (Foto o Documento)
      if (messageType === 'image' || messageType === 'document') {
        if (session.state === 'AWAITING_PAYMENT' || session.state === 'CONFIRM_ORDER') {
          session.state = 'AWAITING_VERIFICATION';
          await sendWhatsAppMessage(from, `¡Muchas gracias por enviar tu comprobante de pago! 🧾\n\nEstamos verificando la transferencia con la entidad bancaria. En breve un asesor te enviará la confirmación final de tu pedido.`);
          
          // Alerta exclusiva para el Jefe / Asesor con los datos completos
          const adminNotice = `🚨 *COMPROBANTE RECIBIDO PARA VERIFICACIÓN* 🚨\n\n👤 *Cliente:* ${session.orderData.clientName}\n📱 *WhatsApp:* ${from}\n🎂 *Productos:* ${session.cart.join(', ')}\n📍 *Dirección:* ${session.orderData.address} (${session.orderData.zoneName})\n📅 *Entrega:* ${session.orderData.deliveryDate} - ${session.orderData.deliveryTime}\n💰 *Total a Verificar:* ${formatCOP(session.orderData.grandTotal)}\n\n👉 Para aprobar la orden responde a este chat con:\n*Aprobar ${from}*`;
          
          await sendWhatsAppMessage(ADMIN_PHONE, adminNotice);
          return NextResponse.json({ status: 'ok' });
        }
      }

      // Detección de pedido desde botón Web
      const webOrder = parseWebOrderMessage(incomingText);
      if (webOrder) {
        session.cart = [webOrder.item];
        session.itemsDetail = [{ name: webOrder.item, price: webOrder.price }];
        session.state = 'ASK_ADD_MORE';
        await sendWhatsAppMessage(from, `¡Excelente elección! 🍰 He agregado *${webOrder.item}* a tu pedido.\n\n¿Deseas agregar otro producto más a tu pedido?\n1️⃣ Sí\n2️⃣ No`);
        return NextResponse.json({ status: 'ok' });
      }

      // Máquina de estados
      switch (session.state) {
        case 'IDLE':
          if (MENU_RESPONSES[normalizedText]) {
            await sendWhatsAppMessage(from, MENU_RESPONSES[normalizedText]);
          } else {
            const matchedPrice = PRODUCT_PRICES[normalizedText] || 85000;
            if (normalizedText.includes('porc') || normalizedText.includes('porciones') || normalizedText.includes('personal')) {
              session.cart.push(incomingText);
              session.itemsDetail.push({ name: incomingText, price: matchedPrice });
              session.state = 'ASK_ADD_MORE';
              await sendWhatsAppMessage(from, `¡Anotado! 📝 Agregado: *${incomingText}*.\n\n¿Deseas agregar otro producto más a tu pedido?\n1️⃣ Sí\n2️⃣ No`);
            } else {
              session.tempProduct = incomingText;
              session.state = 'ASK_PORTIONS';
              await sendWhatsAppMessage(from, `¡Qué deliciosa elección! 🎂 Recordamos que nuestras tortas deben pedirse con 1 día de anticipación.\n\nPor favor, indícanos cuántas porciones deseas para *${incomingText}* (Ejemplo: 5 porc, 8 porc, 12 porc, 18 porc, 25 porc):`);
            }
          }
          break;

        case 'ASK_PORTIONS':
          const fullItem = `${session.tempProduct} (${incomingText})`;
          const estPrice = PRODUCT_PRICES[fullItem.toLowerCase()] || 95000;
          session.cart.push(fullItem);
          session.itemsDetail.push({ name: fullItem, price: estPrice });
          delete session.tempProduct;
          session.state = 'ASK_ADD_MORE';
          await sendWhatsAppMessage(from, `¡Perfecto! Agregado *${fullItem}* a tu pedido. 🍰\n\n¿Deseas agregar otro producto más?\n1️⃣ Sí\n2️⃣ No`);
          break;

        case 'ASK_ADD_MORE':
          if (normalizedText === '1' || normalizedText === 'si' || normalizedText === 'sí') {
            session.state = 'IDLE';
            await sendWhatsAppMessage(from, `Escribe el nombre del otro producto o presiona *0* para ver las opciones:`);
          } else {
            session.state = 'ASK_CLIENT_NAME';
            await sendWhatsAppMessage(from, `¡Perfecto! Vamos a tomar tus datos para la entrega.\n\n1. ¿Cuál es el *nombre completo de la persona que realiza el pedido*?`);
          }
          break;

        case 'ASK_CLIENT_NAME':
          session.orderData.clientName = incomingText;
          session.state = 'ASK_ZONE';
          
          let zonesMenu = `2. ¿En qué zona de Bucaramanga o Área Metropolitana deseas la entrega? Responde con el número:\n\n`;
          ZONAS_DOMICILIO.forEach((z, i) => {
            zonesMenu += `${i + 1}️⃣ ${z.name} (${formatCOP(z.price)})\n`;
          });
          await sendWhatsAppMessage(from, zonesMenu);
          break;

        case 'ASK_ZONE':
          const zIdx = parseInt(incomingText) - 1;
          const selectedZone = ZONAS_DOMICILIO[zIdx] || ZONAS_DOMICILIO[0];
          session.orderData.zoneName = selectedZone.name;
          session.orderData.shippingCost = selectedZone.price;

          session.state = 'ASK_ADDRESS';
          await sendWhatsAppMessage(from, `3. ¿Cuál es la *dirección exacta de entrega*? (Ejemplo: Calle 58 # 17 - 18, Barrio / Conjunto):`);
          break;

        case 'ASK_ADDRESS':
          session.orderData.address = incomingText;
          session.state = 'ASK_RECIPIENT_NAME';
          await sendWhatsAppMessage(from, `4. ¿Cuál es el *nombre de la persona que recibe* el pedido?`);
          break;

        case 'ASK_RECIPIENT_NAME':
          session.orderData.recipientName = incomingText;
          session.state = 'ASK_RECIPIENT_PHONE';
          await sendWhatsAppMessage(from, `5. ¿Cuál es el *número de teléfono/celular de la persona que recibe*?`);
          break;

        case 'ASK_RECIPIENT_PHONE':
          session.orderData.recipientPhone = incomingText;
          session.state = 'ASK_DELIVERY_DATE';
          await sendWhatsAppMessage(from, `6. ¿Para qué *fecha* deseas la entrega? (Ejemplo: Mañana 12 de Noviembre):`);
          break;

        case 'ASK_DELIVERY_DATE':
          session.orderData.deliveryDate = incomingText;
          session.state = 'ASK_DELIVERY_TIME';
          await sendWhatsAppMessage(from, `7. ¿En qué *horario o rango de hora* prefieres la entrega? (Ejemplo: 4:00 PM):`);
          break;

        case 'ASK_DELIVERY_TIME':
          session.orderData.deliveryTime = incomingText;
          session.state = 'CONFIRM_ORDER';

          const subtotal = session.itemsDetail.reduce((acc, curr) => acc + curr.price, 0);
          const shipping = session.orderData.shippingCost || 5000;
          const grandTotal = subtotal + shipping;

          session.orderData.subtotal = subtotal;
          session.orderData.grandTotal = grandTotal;

          const summaryText = `📋 *RESUMEN DE TU PEDIDO* 🍰🌱

🛒 *Producto(s):*
${session.cart.map(i => `• ${i}`).join('\n')}

👤 *Cliente:* ${session.orderData.clientName}
📍 *Dirección de Entrega:* ${session.orderData.address} (${session.orderData.zoneName})
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
