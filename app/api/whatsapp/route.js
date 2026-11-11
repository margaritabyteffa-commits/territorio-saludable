import { NextResponse } from 'next/server';

// Configuración de variables de entorno
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const BASE_URL = 'https://territorio-saludable.vercel.app';

// Respuestas estáticas para opciones numéricas del menú
const MENU_RESPONSES = {
  '1': `¡Nuestras tortas son deliciosas y sin culpa! 🍰\n\nMíralas aquí:\n${BASE_URL}/#tortas\n\nCuando sepas cuál te gusta, ¡escríbeme su nombre por aquí o selecciónala directamente desde la página! 🍰✨\n\nResponde 0 o Menu para volver al menú principal.`,
  '2': `¡Sorprende a alguien especial con nuestros detalles saludables! 🎁\n\nConsulta el catálogo completo aquí:\n${BASE_URL}/#detalles\n\n¡Escríbenos el detalle que deseas encargar o tu fecha especial!\n\nResponde 0 o Menu para volver al menú principal.`,
  '3': `¡Panes artesanos 100% sin azúcar y sin gluten! 🍞\n\nMira nuestras variedades aquí:\n${BASE_URL}/#pan\n\n¡Escríbeme el pan que deseas encargar!\n\nResponde 0 o Menu para volver al menú principal.`,
  '4': `¡Postres saludables para disfrutar cualquier día! 🍮\n\nExplora la lista completa:\n${BASE_URL}/#postres\n\nEscríbenos cuál te provoca pedir hoy.\n\nResponde 0 o Menu para volver al menú principal.`,
  '5': `¡Bienvenidos a nuestro Mercadito Saludable! 🛒\n\nProductos e insumos naturales aquí:\n${BASE_URL}/#mercadito\n\nResponde 0 o Menu para volver al menú principal.`,
  '0': `¡Hola! Bienvenid@ a *Territorio Saludable* 🍰🌱\n\nPastelería 100% Sin Azúcar Refinada y Libres de Gluten en Bucaramanga.\n\nSelecciona una opción enviando el número:\n1️⃣ Tortas Saludables\n2️⃣ Catálogo Detalles\n3️⃣ Pan Saludable\n4️⃣ Postres Saludables\n5️⃣ Mercadito\n\nO escribe directamente lo que estás buscando.`,
  'menu': `¡Hola! Bienvenid@ a *Territorio Saludable* 🍰🌱\n\nPastelería 100% Sin Azúcar Refinada y Libres de Gluten en Bucaramanga.\n\nSelecciona una opción enviando el número:\n1️⃣ Tortas Saludables\n2️⃣ Catálogo Detalles\n3️⃣ Pan Saludable\n4️⃣ Postres Saludables\n5️⃣ Mercadito\n\nO escribe directamente lo que estás buscando.`
};

// Función para enviar mensaje a la API de WhatsApp Graph Meta
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
    if (!response.ok) {
      console.error('Error enviando mensaje de Meta WhatsApp:', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('Excepción al enviar mensaje a WhatsApp:', error);
  }
}

// Consultar a Gemini cuando el usuario escribe texto libre (ej: "Torta zanahoria")
async function getAIResponse(userPrompt) {
  if (!GEMINI_API_KEY) {
    return `¡Gracias por tu interés en *${userPrompt}*! 🍰 Puedes ver la información completa y porciones disponibles en nuestro catálogo: ${BASE_URL}/#tortas`;
  }

  try {
    const systemInstruction = `Eres el asistente virtual de la pastelería "Territorio Saludable" en Bucaramanga.
Todas nuestras tortas, panes y postres son 100% sin azúcar refinada (endulzados con Stevia) y libres de gluten.
Las tortas requieren 1 día de anticipación.
Sé amable, conciso y responde brevemente sobre el producto consultado ("${userPrompt}"), indicando que pueden hacer el pedido directamente por este chat o en el enlace de la tienda: ${BASE_URL}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nCliente: ${userPrompt}` }]
            }
          ]
        })
      }
    );

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || `¡Gracias por preguntar por *${userPrompt}*! 🍰 Puedes consultar detalles y porciones en nuestra página: ${BASE_URL}`;
  } catch (err) {
    console.error('Error llamando a Gemini AI:', err);
    return `¡Gracias por escribirnos sobre *${userPrompt}*! 🍰 Puedes verificar disponibilidad y porciones en nuestro sitio web: ${BASE_URL}`;
  }
}

// GET para verificación del Webhook de Meta
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

// POST para recibir mensajes entrantes de WhatsApp
export async function POST(request) {
  try {
    const body = await request.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === 'text') {
      const from = message.from; // Número del cliente
      const incomingText = message.text.body.trim();
      const normalizedText = incomingText.toLowerCase();

      // 1. Si el usuario envía una opción conocida (0, 1, 2, 3, 4, 5, menu, hola)
      if (MENU_RESPONSES[normalizedText]) {
        await sendWhatsAppMessage(from, MENU_RESPONSES[normalizedText]);
      } else if (normalizedText === 'hola') {
        await sendWhatsAppMessage(from, MENU_RESPONSES['0']);
      } else {
        // 2. Si escribe un producto libre (ej: "Torta zanahoria"), responde la IA / catálogo
        const aiReply = await getAIResponse(incomingText);
        await sendWhatsAppMessage(from, aiReply);
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error procesando el Webhook de WhatsApp:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
