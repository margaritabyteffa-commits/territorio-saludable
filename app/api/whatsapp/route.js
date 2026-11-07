import { NextResponse } from 'next/server';

// 1. VERIFICACIÓN DEL WEBHOOK (Meta llama a este GET para validar la conexión)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const MY_VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'territorio_secret_123';

  if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
    console.log('Webhook de WhatsApp verificado con éxito');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Token de verificación inválido', { status: 403 });
}

// 2. RECEPCIÓN Y RESPUESTA DE MENSAJES ENTRANTES (POST)
export async function POST(request) {
  try {
    const body = await request.json();

    // Validar si el payload contiene un mensaje de WhatsApp
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.text) {
      const from = message.from; // Número del cliente que escribe
      const msgText = message.text.body;

      console.log(`Mensaje recibido de ${from}: ${msgText}`);

      // Consultar a la API de Gemini para responder con la información del catálogo
      const replyMessage = await generateGeminiResponse(msgText);

      // Enviar la respuesta de vuelta por la API de WhatsApp Cloud
      await sendWhatsAppMessage(from, replyMessage);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook de WhatsApp:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Función auxiliar para llamar a Gemini API con contexto de Territorio Saludable
async function generateGeminiResponse(userQuery) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return '¡Hola! Bienvenido a Territorio Saludable. En un momento te atenderemos personalmente.';
  }

  const prompt = `Eres el asistente virtual por WhatsApp de "Territorio Saludable", una repostería funcional y saludable en Bucaramanga.
Tus productos son 100% sin azúcar refinada y sin gluten (usamos fruto del monje, stevia, harinas de almendras, arroz y yuca).
Categorías principales: Tortas Saludables, Catalogo Detalles, Pan Saludable, Postres Saludables y Mercadito.
Métodos de pago: Nequi y Bancolombia.
Regla importante: Informa siempre al cliente que una vez realice su transferencia por Nequi o Bancolombia, debe enviar la foto/captura del comprobante por este chat para que la Jefe valide el pago e ingrese el pedido a cocina.

Consulta del cliente: "${userQuery}"

Responde de forma amable, corta y formateada para WhatsApp (usa negritas con *texto* y emojis).`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '¡Hola! Gracias por escribirnos a Territorio Saludable. ¿En qué podemos ayudarte hoy?';
  } catch (err) {
    console.error('Error consultando Gemini:', err);
    return '¡Hola! Gracias por escribir a Territorio Saludable. ¿Deseas ver nuestro catálogo de tortas y panes saludables?';
  }
}

// Función auxiliar para enviar mensaje mediante la API de Meta
async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.error('Faltan variables de entorno WHATSAPP_TOKEN o WHATSAPP_PHONE_ID');
    return;
  }

  await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
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
}
