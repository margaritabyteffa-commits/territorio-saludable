import { NextResponse } from 'next/server';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE || '573000559196'; // Teléfono para recibir alertas

const BASE_URL = 'https://territorio-saludable.vercel.app';

// Base de datos temporal en memoria para el flujo de conversación por cliente
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

// Función para enviar mensaje mediante Meta Graph API
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
    const data = await response.json();
    if (!response.ok) console.error('Error Meta API:', JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
  }
}

// Extracción de datos si el mensaje viene generado desde el botón de la web
function parseWebOrderMessage(text) {
  // Ejemplo: "¡Hola Territorio Saludable! 🍰 Quisiera pedir: Torta Moka (12 porc) por valor de $ 155.000..."
  if (text.includes('Quisiera pedir:')) {
    const parts = text.split('Quisiera pedir:');
    if (parts[1]) {
      const detail = parts[1].split('por valor de')[0].trim();
      return detail; // Retorna "Torta Moka (12 porc)"
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

    if (message && message.type === 'text') {
      const from = message.from;
      const incomingText = message.text.body.trim();
      const normalizedText = incomingText.toLowerCase();

      // Inicializar sesión de cliente
      if (!userSessions[from]) {
        userSessions[from] = { state: 'IDLE', cart: [], orderData: {} };
      }
      const session = userSessions[from];

      // Opciones globales para reiniciar o ir al menú
      if (normalizedText === '0' || normalizedText === 'menu' || normalizedText === 'hola') {
        session.state = 'IDLE';
        session.cart = [];
        session.orderData = {};
        await sendWhatsAppMessage(from, MENU_PRINCIPAL);
        return NextResponse.json({ status: 'ok' });
      }

      // Opción 7: Asesor Humano
      if (normalizedText === '7') {
        await sendWhatsAppMessage(from, `👩‍🍳 Uno de nuestros asesores estará respondiendo todas tus preguntas en breve. ¡Gracias por tu paciencia!`);
        await sendWhatsAppMessage(ADMIN_PHONE, `🚨 *ALERTA ASESOR:* El cliente ${from} ha solicitado hablar con un asesor humano por WhatsApp.`);
        return NextResponse.json({ status: 'ok' });
      }

      // Verificar si es un mensaje enviado automáticamente por el botón "Pedir" de la página web
      const webItem = parseWebOrderMessage(incomingText);
      if (webItem) {
        session.cart = [webItem];
        session.state = 'ASK_ADD_MORE';
        await sendWhatsAppMessage(from, `¡Excelente elección! 🍰 He agregado *${webItem}* a tu pedido.\n\n¿Deseas agregar otro producto más a tu pedido?\n1️⃣ Sí\n2️⃣ No`);
        return NextResponse.json({ status: 'ok' });
      }

      // --- MÁQUINA DE ESTADOS / FLUJO DEL PEDIDO ---
      switch (session.state) {

        case 'IDLE':
          if (MENU_RESPONSES[normalizedText]) {
            await sendWhatsAppMessage(from, MENU_RESPONSES[normalizedText]);
          } else {
            // Si el cliente escribe directamente el nombre de un producto (ej: "Torta zanahoria")
            // Comprobamos si especificó porciones
            if (normalizedText.includes('porc') || normalizedText.includes('porciones') || normalizedText.includes('personal')) {
              session.cart.push(incomingText);
              session.state = 'ASK_ADD_MORE';
              await sendWhatsAppMessage(from, `¡Anotado! 📝 Agregado: *${incomingText}*.\n\n¿Deseas agregar otro producto más a tu pedido?\n1️⃣ Sí\n2️⃣ No`);
            } else {
              // No especificó porción: guardamos el producto temporalmente y pedimos porción
              session.tempProduct = incomingText;
              session.state = 'ASK_PORTIONS';
              await sendWhatsAppMessage(from, `¡Qué deliciosa elección! 🎂 Recordamos que nuestras tortas deben pedirse con 1 día de anticipación.\n\nPor favor, indícanos cuántas porciones deseas para *${incomingText}* (Ejemplo: 5 porc, 8 porc, 12 porc, 18 porc, 25 porc):`);
            }
          }
          break;

        case 'ASK_PORTIONS':
          const fullProduct = `${session.tempProduct} (${incomingText})`;
          session.cart.push(fullProduct);
          delete session.tempProduct;
          session.state = 'ASK_ADD_MORE';
          await sendWhatsAppMessage(from, `¡Perfecto! Agregado *${fullProduct}* a tu pedido. 🍰\n\n¿Deseas agregar otro producto más?\n1️⃣ Sí\n2️⃣ No`);
          break;

        case 'ASK_ADD_MORE':
          if (normalizedText === '1' || normalizedText === 'si' || normalizedText === 'sí') {
            session.state = 'IDLE';
            await sendWhatsAppMessage(from, `¡Claro que sí! Escribe el nombre del otro producto o presiona el menú para explorar:`);
          } else {
            // No desea más productos, iniciamos recolección de datos
            session.state = 'ASK_CLIENT_NAME';
            await sendWhatsAppMessage(from, `¡Perfecto! Vamos a tomar tus datos de entrega.\n\n1. ¿Cuál es el *nombre completo de la persona que realiza el pedido*?`);
          }
          break;

        case 'ASK_CLIENT_NAME':
          session.orderData.clientName = incomingText;
          session.state = 'ASK_ADDRESS';
          await sendWhatsAppMessage(from, `2. ¿Cuál es la *dirección exacta de entrega* en Bucaramanga o Área Metropolitana? (Incluye barrio o conjunto):`);
          break;

        case 'ASK_ADDRESS':
          session.orderData.address = incomingText;
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
          await sendWhatsAppMessage(from, `5. ¿Para qué *fecha* deseas la entrega? (Ejemplo: Mañana 12 de Noviembre):`);
          break;

        case 'ASK_DELIVERY_DATE':
          session.orderData.deliveryDate = incomingText;
          session.state = 'ASK_DELIVERY_TIME';
          await sendWhatsAppMessage(from, `6. ¿En qué *horario o rango de hora* prefieres la entrega? (Ejemplo: 3:00 PM):`);
          break;

        case 'ASK_DELIVERY_TIME':
          session.orderData.deliveryTime = incomingText;
          session.state = 'CONFIRM_ORDER';

          const summaryText = `📋 *RESUMEN DE TU PEDIDO* 🍰🌱

🛒 *Producto(s):*
${session.cart.map(i => `• ${i}`).join('\n')}

👤 *Cliente:* ${session.orderData.clientName}
📍 *Dirección de Entrega:* ${session.orderData.address}
📦 *Recibe:* ${session.orderData.recipientName} (${session.orderData.recipientPhone})
📅 *Fecha de Entrega:* ${session.orderData.deliveryDate}
🕒 *Hora de Entrega:* ${session.orderData.deliveryTime}

¿Confirmas que toda la información es correcta?
1️⃣ Sí, confirmar pedido
2️⃣ No, corregir o cancelar`;

          await sendWhatsAppMessage(from, summaryText);
          break;

        case 'CONFIRM_ORDER':
          if (normalizedText === '1' || normalizedText === 'si' || normalizedText === 'sí') {
            session.state = 'AWAITING_PAYMENT';
            
            const bankDetails = `🎉 *¡Pedido Registrado con Éxito!*

Para programar tu pedido en cocina, por favor realiza la transferencia a cualquiera de nuestras cuentas oficiales:

💳 *Nequi / Daviplata:* 3000559196
🏦 *Bancolombia Ahorros:* 379-000123-45 (Territorio Saludable S.A.S.)

📌 *IMPORTANTE:* Envíanos la *foto o captura del comprobante de pago* por este medio para validar tu pedido. ¡Muchas gracias!`;

            await sendWhatsAppMessage(from, bankDetails);

            // Alerta al Administrador / Jefe
            const adminAlert = `🚨 *NUEVO PEDIDO REQUERIDO DE APROBACIÓN* 🚨
            
👤 *Cliente:* ${session.orderData.clientName}
📱 *Teléfono Cliente:* ${from}
📦 *Productos:* ${session.cart.join(', ')}
📍 *Dirección:* ${session.orderData.address}
📅 *Entrega:* ${session.orderData.deliveryDate} - ${session.orderData.deliveryTime}
👤 *Recibe:* ${session.orderData.recipientName} (${session.orderData.recipientPhone})

_Por favor verificar el comprobante de pago enviado y marcar como "Aprobado / En Producción"._`;

            await sendWhatsAppMessage(ADMIN_PHONE, adminAlert);

          } else {
            session.state = 'IDLE';
            session.cart = [];
            session.orderData = {};
            await sendWhatsAppMessage(from, `Pedido cancelado o reiniciado. Responde *0* o *Menu* si deseas volver a empezar.`);
          }
          break;

        default:
          session.state = 'IDLE';
          await sendWhatsAppMessage(from, MENU_PRINCIPAL);
          break;
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
