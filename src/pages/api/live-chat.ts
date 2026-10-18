import type { APIRoute } from 'astro';

export const prerender = false;

// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'cris';
  text: string;
  time: number;
}

// Global in-memory fallback cache across warm edge runtime instances
const inMemorySessions = new Map<string, ChatMessage[]>();
let inMemoryLastSession: string = '';
let webhookRegistered = false;

/**
 * Safely resolves Telegram bot credentials across all runtime environments
 */
export function resolveCredentials(locals?: any) {
  let botToken: string | undefined = undefined;
  let chatId: string | undefined = undefined;

  // 1. Modern Cloudflare Workers runtime env
  try {
    if (typeof cfEnv !== 'undefined' && cfEnv) {
      botToken = (cfEnv as any).TELEGRAM_BOT_TOKEN;
      chatId = (cfEnv as any).TELEGRAM_CHAT_ID;
    }
  } catch {}

  // 2. Node / process.env
  try {
    if ((!botToken || !chatId) && typeof process !== 'undefined' && process.env) {
      botToken = botToken || process.env.TELEGRAM_BOT_TOKEN;
      chatId = chatId || process.env.TELEGRAM_CHAT_ID;
    }
  } catch {}

  // 3. Vite import.meta.env
  try {
    if ((!botToken || !chatId) && typeof import.meta !== 'undefined' && import.meta.env) {
      botToken = botToken || (import.meta.env as any).TELEGRAM_BOT_TOKEN;
      chatId = chatId || (import.meta.env as any).TELEGRAM_CHAT_ID;
    }
  } catch {}

  // 4. Astro locals.env
  try {
    if ((!botToken || !chatId) && (locals as any)?.env) {
      botToken = botToken || (locals as any).env.TELEGRAM_BOT_TOKEN;
      chatId = chatId || (locals as any).env.TELEGRAM_CHAT_ID;
    }
  } catch {}

  return { botToken, chatId };
}

/**
 * Safely resolves persistent Cloudflare KV storage
 */
export function resolveKV(locals?: any) {
  let kv: any = null;
  try {
    if (typeof cfEnv !== 'undefined' && cfEnv) {
      kv = (cfEnv as any).GEO_KV || (cfEnv as any).GEO_ANALYTICS || (cfEnv as any).CHAT_KV || (cfEnv as any).SESSION;
    }
    if (!kv && (locals as any)?.env) {
      kv = (locals as any).env.GEO_KV || (locals as any).env.GEO_ANALYTICS || (locals as any).env.CHAT_KV || (locals as any).env.SESSION;
    }
  } catch {}
  return kv;
}

/**
 * Reads chat history from KV (with memory fallback)
 */
export async function getChatHistory(sessionId: string, kv?: any): Promise<ChatMessage[]> {
  const key = `chat_${sessionId}`;
  let history: ChatMessage[] = inMemorySessions.get(sessionId) || [];

  if (kv) {
    try {
      const stored = await kv.get(key);
      if (stored) {
        history = JSON.parse(stored);
        inMemorySessions.set(sessionId, history);
      }
    } catch (err) {
      console.error('KV chat read error:', err);
    }
  }

  return history;
}

/**
 * Persists chat history to KV (with memory fallback)
 */
export async function saveChatHistory(sessionId: string, history: ChatMessage[], kv?: any) {
  inMemorySessions.set(sessionId, history);
  inMemoryLastSession = sessionId;

  if (kv) {
    try {
      const key = `chat_${sessionId}`;
      // Persist conversation for 7 days
      await kv.put(key, JSON.stringify(history), { expirationTtl: 86400 * 7 });
      // Keep track of the most recent active session for smart un-threaded reply fallback
      await kv.put('chat_last_session', sessionId, { expirationTtl: 86400 });
    } catch (err) {
      console.error('KV chat write error:', err);
    }
  }
}

/**
 * Appends Cris's response to the visitor's session history in KV & memory
 */
export async function addCrisReply(sessionId: string, text: string, kv?: any) {
  const crisMsg: ChatMessage = {
    id: 'cris_' + Date.now(),
    sender: 'cris',
    text,
    time: Date.now(),
  };

  const history = await getChatHistory(sessionId, kv);
  history.push(crisMsg);
  if (history.length > 50) history.shift();

  await saveChatHistory(sessionId, history, kv);
  return crisMsg;
}

/**
 * Auto-registers Telegram webhook so replies on phone immediately trigger the webhook
 */
async function autoRegisterTelegramWebhook(botToken: string, requestUrl: string) {
  if (webhookRegistered || !botToken) return;
  try {
    const origin = new URL(requestUrl).origin;
    const targetWebhook = `${origin}/api/telegram-webhook`;

    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoData = await infoRes.json();

    if (infoData?.result?.url !== targetWebhook) {
      await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetWebhook,
          allowed_updates: ['message', 'edited_message'],
        }),
      });
    }
    webhookRegistered = true;
  } catch (err) {
    console.error('Auto webhook setup error:', err);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { sessionId, message, userName } = await request.json();

    if (!sessionId || !message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const kv = resolveKV(locals);
    const { botToken, chatId } = resolveCredentials(locals);

    // Resolve client country & city via Cloudflare edge headers
    const cfCountry = request.headers.get('cf-ipcountry') || 'PH';
    const cfCity = request.headers.get('cf-ipcity') || '';
    const locationStr = [cfCity, cfCountry].filter(Boolean).join(', ') || 'Unknown Origin';

    // Store visitor message in persistent history
    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: message.trim(),
      time: Date.now(),
    };

    const history = await getChatHistory(sessionId, kv);
    history.push(userMsg);
    if (history.length > 50) history.shift();
    await saveChatHistory(sessionId, history, kv);

    // Ensure Telegram webhook is active in the background
    if (botToken) {
      autoRegisterTelegramWebhook(botToken, request.url).catch(() => {});
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
        `🔑 <b>Session:</b> <code>#${safeSession}</code>\n` +
        `📍 <b>Origin:</b> ${safeLoc}\n\n` +
        `📝 <b>Message:</b>\n<i>"${safeMsg}"</i>\n\n` +
        `👉 <b>Reply directly to this message</b> to send your reply to the visitor's live chat!`;

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
        storage: kv ? 'cloudflare_kv' : 'edge_memory',
        details: tgErrorDetails,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response(JSON.stringify({ messages: [] }), { status: 400 });
  }

  const kv = resolveKV(locals);
  const history = await getChatHistory(sessionId, kv);

  return new Response(
    JSON.stringify({
      messages: history,
      storage: kv ? 'cloudflare_kv' : 'edge_memory',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
};
