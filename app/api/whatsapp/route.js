import { NextResponse } from 'next/server';

// 1. Verificación del Webhook para Meta
export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'territorio2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Token de verificación inválido', { status: 403 });
}

// 2. Recepción de mensajes y respuesta automática del bot
export async function POST(request) {
  try {
    const body = await request.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const senderPhone = message.from;
      
      const welcomeMessage = 
        "¡Hola! 👋 Bienvenido a *Territorio Saludable*. 🍰\n\n" +
        "Nos alegra mucho saludarte. Somos tu pastelería artesanal 100% libre de gluten y sin azúcar refinada en Bucaramanga. 🌱\n\n" +
        "¿Qué te gustaría hacer hoy?\n" +
        "1️⃣ Ver nuestro Catálogo Web\n" +
        "2️⃣ Consultar Horarios y Domicilios\n" +
        "3️⃣ Hablar con un asesor\n\n" +
        "Visita nuestra tienda aquí: https://territorio-saludable.vercel.app";

      await sendWhatsAppMessage(senderPhone, welcomeMessage);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error en el webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendWhatsAppMessage(toPhone, textMessage) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone,
      text: { body: textMessage },
    }),
  });
}
