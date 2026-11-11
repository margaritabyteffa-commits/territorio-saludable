import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'territorio2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Token de verificación inválido', { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === 'text') {
      const senderPhone = message.from;
      const userText = message.text.body.trim().toLowerCase();

      let replyMessage = '';

      // Evaluación del mensaje del usuario
      if (userText === '1' || userText.includes('torta')) {
        replyMessage = 
          "🎂 *Tortas Saludables (100% Sin Azúcar y Sin Gluten)*\n\n" +
          "Nuestras tortas son endulzadas naturalmente y perfectas para cuidar tu salud sin perder el sabor:\n\n" +
          "• *Torta de Chocolate & Almendras* (Sin gluten)\n" +
          "• *Torta Zanahoria Fit* (Con cobertura de queso crema ligero)\n" +
          "• *Torta Red Velvet Saludable*\n\n" +
          "📲 Ver fotos y pedir directamente en la tienda web:\n" +
          "https://territorio-saludable.vercel.app\n\n" +
          "_Responde *0* o *Menu* para volver al menú principal._";
      } else if (userText === '6' || userText.includes('catalogo')) {
        replyMessage = 
          "📖 *Catálogo Completo Territorio Saludable*\n\n" +
          "Explora toda nuestra variedad de repostería artesanal en el siguiente enlace:\n" +
          "https://territorio-saludable.vercel.app";
      } else if (userText === '7' || userText.includes('asesor')) {
        replyMessage = 
          "👩‍🍳 *Atención Personalizada*\n\n" +
          "Un asesor de Territorio Saludable revisará tu mensaje en breve para ayudarte con tu pedido o responder tus dudas sobre ingredientes.\n\n" +
          "¡Gracias por tu paciencia!";
      } else {
        // Menú Principal por defecto
        replyMessage = 
          "¡Hola! Bienvenido a *Territorio Saludable* 🌱.\n" +
          "¿Qué delicia sin azúcar te provoca hoy?\n\n" +
          "Responde con el número de tu preferencia:\n" +
          "1️⃣ Tortas Saludables\n" +
          "2️⃣ Catalogo Detalles\n" +
          "3️⃣ Pan Saludable\n" +
          "4️⃣ Postre Saludable\n" +
          "5️⃣ Mercadito\n" +
          "6️⃣ 📖 Ver el Catálogo Completo\n" +
          "7️⃣ 👩‍🍳 Hablar con un asesor\n\n" +
          "Visita nuestra tienda web: https://territorio-saludable.vercel.app";
      }

      await sendWhatsAppMessage(senderPhone, replyMessage);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error en el webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendWhatsAppMessage(toPhone, textMessage) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID || '1483210214864841';

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
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

    const data = await response.json();

    if (!response.ok) {
      console.error('Error enviando mensaje de Meta WhatsApp:', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error de red al llamar a Meta Graph API:', error);
  }
}
