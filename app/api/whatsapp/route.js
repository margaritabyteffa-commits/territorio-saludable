import { NextResponse } from 'next/server';

// 1. VERIFICACIÓN DEL WEBHOOK
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

// 2. RECEPCIÓN Y RESPUESTA DE MENSAJES ENTRANTES (POST)
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

      // Consultar a Gemini
      const replyMessage = await generateGeminiResponse(msgText);
      console.log(`🤖 Respuesta de Gemini: ${replyMessage}`);

      // Enviar a WhatsApp
      await sendWhatsAppMessage(from, replyMessage);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Función auxiliar para llamar a Gemini API
async function generateGeminiResponse(userQuery) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('⚠️ GEMINI_API_KEY no encontrada en variables de entorno');
    return '¡Hola! Bienvenido a Territorio Saludable. En un momento te atenderemos personalmente.';
  }

  const prompt = `Eres el asistente virtual por WhatsApp de "Territorio Saludable", una repostería funcional y saludable en Bucaramanga.
Tus productos son 100% sin azúcar refinada y sin gluten.
Categorías principales: Tortas Saludables, Catalogo Detalles, Pan Saludable, Postres Saludables y Mercadito.
Métodos de pago: Nequi y Bancolombia.
Informa al cliente que una vez realice su transferencia por Nequi o Bancolombia, debe enviar la captura por este chat para que la Jefe valide el pago e ingrese el pedido a cocina.

Consulta del cliente: "${userQuery}"

Responde de forma amable, corta y formateada para WhatsApp (usa *negritas* y emojis).`;

  try {
   const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await res.json();

    if (data.error) {
      console.error('❌ Error de Gemini API:', JSON.stringify(data.error));
      return '¡Hola! Gracias por escribir a Territorio Saludable. ¿Deseas ver nuestro catálogo?';
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '¡Hola! Gracias por escribir a Territorio Saludable. ¿En qué te ayudamos hoy?';
  } catch (err) {
    console.error('❌ Error en llamada a Gemini:', err);
    return '¡Hola! Gracias por escribir a Territorio Saludable. ¿Deseas ver nuestro catálogo?';
  }
}

// Función auxiliar para enviar mensaje mediante la API de Meta
async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.error('❌ Faltan variables WHATSAPP_TOKEN o WHATSAPP_PHONE_ID');
    return;
  }

  console.log(`📤 Enviando mensaje a ${to} usando Phone ID ${phoneId}...`);

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
