import type { APIRoute } from 'astro';

export const prerender = false;

// Simple in-memory message queue keyed by user session for real-time live chat polling
// In Cloudflare Workers, state persists across fast requests on the same edge location
interface ChatMessage {
  id: string;
  sender: 'user' | 'cris';
  text: string;
  time: number;
}

// Global in-memory session store across endpoints in the same runtime instance
const sessions = new Map<string, ChatMessage[]>();

export function addCrisReply(sessionId: string, text: string) {
  const crisMsg: ChatMessage = {
    id: 'cris_' + Date.now(),
    sender: 'cris',
    text,
    time: Date.now(),
  };

  // Find matching session (direct or prefix match)
  let key = sessionId;
  if (!sessions.has(sessionId)) {
    for (const k of sessions.keys()) {
      if (k.startsWith(sessionId) || sessionId.startsWith(k)) {
        key = k;
        break;
      }
    }
  }

  const history = sessions.get(key) || [];
  history.push(crisMsg);
  if (history.length > 30) history.shift();
  sessions.set(key, history);
  return crisMsg;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { sessionId, message, userName } = await request.json();

    if (!sessionId || !message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Resolve client country & city via Cloudflare edge headers
    const cfCountry = request.headers.get('cf-ipcountry') || 'PH';
    const cfCity = request.headers.get('cf-ipcity') || '';
    const locationStr = [cfCity, cfCountry].filter(Boolean).join(', ') || 'Unknown Origin';

    // Store visitor message in session history
    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: message.trim(),
      time: Date.now(),
    };

    const history = sessions.get(sessionId) || [];
    history.push(userMsg);
    if (history.length > 30) history.shift();
    sessions.set(sessionId, history);

    // Safely resolve bot credentials across Astro / Cloudflare Workers
    let botToken: string | undefined = undefined;
    let chatId: string | undefined = undefined;

    try {
      if (typeof process !== 'undefined' && process.env) {
        botToken = process.env.TELEGRAM_BOT_TOKEN;
        chatId = process.env.TELEGRAM_CHAT_ID;
      }
    } catch {}

    if (!botToken && typeof import.meta !== 'undefined' && import.meta.env) {
      botToken = (import.meta.env as any).TELEGRAM_BOT_TOKEN;
      chatId = (import.meta.env as any).TELEGRAM_CHAT_ID;
    }

    // Try cloudflare worker env if available
    if (!botToken && (locals as any)?.env) {
      botToken = (locals as any).env.TELEGRAM_BOT_TOKEN;
      chatId = (locals as any).env.TELEGRAM_CHAT_ID;
    }

    let tgSuccess = false;
    let tgErrorDetails = null;

    if (botToken && chatId) {
      const safeSession = String(sessionId).replace(/[&<>"']/g, '');
      const safeUser = String(userName || 'Visitor').replace(/[&<>"']/g, '');
      const safeLoc = String(locationStr).replace(/[&<>"']/g, '');
      const safeMsg = String(message.trim())
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const telegramHtml = 
        `💬 <b>New Portfolio Live Message</b>\n\n` +
        `👤 <b>From:</b> ${safeUser}\n` +
        `🔑 <b>Session:</b> #${safeSession}\n` +
        `📍 <b>Origin:</b> ${safeLoc}\n\n` +
        `📝 <b>Message:</b>\n<i>"${safeMsg}"</i>\n\n` +
        `👉 <i>To reply, swipe right and reply to this message!</i>`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: String(chatId).trim(),
            text: telegramHtml,
            parse_mode: 'HTML',
          }),
        });

        const tgData: any = await tgRes.json();
        tgSuccess = tgData?.ok === true;
        if (!tgSuccess) {
          tgErrorDetails = tgData;
          console.error('[Telegram Error]', tgData);
        }
      } catch (tgError: any) {
        tgErrorDetails = tgError?.message;
        console.error('Telegram dispatch error:', tgError);
      }
    } else {
      console.warn('[Telegram] Credentials missing in environment: botToken=' + Boolean(botToken) + ' chatId=' + Boolean(chatId));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: userMsg,
        telegramConfigured: Boolean(botToken && chatId),
        telegramDispatched: tgSuccess,
        details: tgErrorDetails,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response(JSON.stringify({ messages: [] }), { status: 400 });
  }

  const history = sessions.get(sessionId) || [];
  return new Response(
    JSON.stringify({ messages: history }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
};
