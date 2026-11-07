import { NextResponse } from 'next/server';

// 1. VERIFICACIÓN DEL WEBHOOK (Requerido por Meta)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const MY_VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'territorio_secret_123';

  if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Token de verificación inválido', { status: 403 });
}

// 2. RECEPCIÓN Y PROCESAMIENTO DE MENSAJES (POST)
export async function POST(request) {
  try {
    const body = await request.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.text) {
      const from = message.from;
      const msgText = message.text.body;

      console.log(`📩 Mensaje recibido de ${from}: ${msgText}`);

      // Generar respuesta inteligente con Gemini
      const replyMessage = await generateGeminiResponse(msgText);
      console.log(`🤖 Respuesta de Gemini generada: ${replyMessage}`);

      // Enviar respuesta a WhatsApp a través de Meta API
      await sendWhatsAppMessage(from, replyMessage);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. INTEGRACIÓN INTELIGENTE CON GEMINI API
async function generateGeminiResponse(userQuery) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('⚠️ GEMINI_API_KEY no encontrada en variables de entorno de Vercel');
    return getFallbackResponse(userQuery);
  }

  const prompt = `
Eres el asistente virtual oficial por WhatsApp de "Territorio Saludable", una repostería funcional y saludable en Bucaramanga.

INFORMACIÓN COMPLETA DEL NEGOCIO Y CATÁLOGO:
- Todos nuestros productos son 100% SIN azúcar refinada y SIN gluten (ideales para cuidarse, diabéticos o celiacos).
- Catálogo web interactivo: https://territorio-saludable.vercel.app
- Categorías del catálogo (29 productos en total):
  1. *Tortas Saludables* (Moka, Red Velvet, Zanahoria, Chocolate)
  2. *Pan Saludable* (Pan de Yuca, Pan de Queso, Pan de Almidón)
  3. *Postres Saludables* (Cheesecakes, Mousse, Brownies)
  4. *Catálogo Detalles* (Cajas regalo y tortas personalizadas)
  5. *Mercadito* (Harinas funcionales, endulzantes, snacks)

MEDIOS Y PROCESO DE PAGO:
- Medios de pago autorizados: **Nequi** y **Bancolombia**.
- Indica al cliente que cuando realice su transferencia, debe **enviar la captura del comprobante por este mismo chat de WhatsApp**.
- Explica amablemente que **la administración / jefe valida manualmente cada comprobante** antes de ingresar el pedido a la cocina.

INSTRUCCIONES DE FORMATO:
- Responde de forma cercana, amable, breve y apetitosa.
- Usa formato estilo WhatsApp con *negritas*, viñetas y emojis (🍰, 🌿, 💳, 🛵).
- Responde directamente a la consulta del cliente.

Consulta del cliente: "${userQuery}"
Respuesta:`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();

    if (data.error) {
      console.error('❌ Error devuelto por Gemini API:', JSON.stringify(data.error));
      return getFallbackResponse(userQuery);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(userQuery);
  } catch (err) {
    console.error('❌ Error conectando con Gemini:', err);
    return getFallbackResponse(userQuery);
  }
}

// 4. RESPUESTA DE RESPALDO (FALLBACK)
function getFallbackResponse(query) {
  return `¡Hola! 🌿 Bienvenido a *Territorio Saludable* 🍰

Toda nuestra repostería es **100% sin azúcar refinada y libre de gluten**.

Puedes explorar nuestro catálogo interactivo con fotos y precios en:
👉 https://territorio-saludable.vercel.app

💳 *Medios de Pago:* Nequi y Bancolombia.
Una vez realices tu transferencia, **envíanos la captura del comprobante por este chat** para que nuestra administración lo valide e ingrese tu pedido a cocina inmediatamente.

¿Qué producto o torta te gustaría consultar hoy?`;
}

// 5. ENVÍO DE MENSAJE A TRAVÉS DE META GRAPH API
async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.error('❌ Faltan variables WHATSAPP_TOKEN o WHATSAPP_PHONE_ID');
    return;
  }

  console.log(`📤 Enviando mensaje a ${to} mediante Phone ID ${phoneId}...`);

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    })
  });

  const responseData = await res.json();
  console.log('📄 Respuesta de Meta Graph API:', JSON.stringify(responseData));
}
