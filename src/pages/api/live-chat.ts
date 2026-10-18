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
let lastTelegramCheck = 0;
let lastOffset = 0;
let webhookDisabled = false;

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
    id: 'cris_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sender: 'cris',
    text,
    time: Date.now(),
  };

  const history = await getChatHistory(sessionId, kv);
  // Avoid duplicate replies if processed multiple times
  const exists = history.some(m => m.sender === 'cris' && m.text === text && Date.now() - m.time < 30000);
  if (!exists) {
    history.push(crisMsg);
    if (history.length > 50) history.shift();
    await saveChatHistory(sessionId, history, kv);
  }
  return crisMsg;
}

/**
 * Instant Telegram Sync (1-2s latency):
 * Directly checks Telegram for new replies from Cris whenever a visitor is actively chatting
 */
async function syncTelegramReplies(botToken: string, activeSessionId: string, kv?: any) {
  // Throttle to at most once per 1.2s to be kind to Telegram rate limits while remaining near-instant
  const now = Date.now();
  if (now - lastTelegramCheck < 1200) return;
  lastTelegramCheck = now;

  try {
    // 1. Ensure webhook is removed so Telegram buffers replies for fast getUpdates
    if (!webhookDisabled) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, { method: 'POST' });
        webhookDisabled = true;
      } catch {}
    }

    // 2. Resolve last processed update ID
    let offset = lastOffset;
    if (!offset && kv) {
      try {
        const storedOffset = await kv.get('tg_last_offset');
        if (storedOffset) offset = parseInt(storedOffset, 10);
      } catch {}
    }

    // 3. Fast non-blocking poll of Telegram's update queue
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset || 0}&limit=10&timeout=0`);
    const data: any = await res.json();

    if (data?.ok && Array.isArray(data.result) && data.result.length > 0) {
      let maxUpdateId = offset || 0;

      for (const update of data.result) {
        if (update.update_id >= maxUpdateId) {
          maxUpdateId = update.update_id + 1;
        }

        const msg = update.message || update.edited_message;
        if (!msg || !msg.text) continue;

        const replyText = msg.text.trim();
        let targetSessionId = '';

        // Match if Cris swiped to reply to a visitor message
        if (msg.reply_to_message) {
          const scan = [msg.reply_to_message.text, msg.reply_to_message.caption].filter(Boolean).join('\n');
          const m = scan.match(/#(user_[a-zA-Z0-9_-]+)/) || scan.match(/#([a-zA-Z0-9_-]+)/);
          if (m && m[1]) targetSessionId = m[1];
        }

        // Match if Cris typed #user_xxxx in the message
        if (!targetSessionId) {
          const m = replyText.match(/#(user_[a-zA-Z0-9_-]+)/);
          if (m && m[1]) targetSessionId = m[1];
        }

        // Fallback: route directly to the active visitor currently polling
        if (!targetSessionId) {
          targetSessionId = activeSessionId;
        }

        if (targetSessionId) {
          await addCrisReply(targetSessionId, replyText, kv);
        }
      }

      lastOffset = maxUpdateId;
      if (kv && maxUpdateId > (offset || 0)) {
        try {
          await kv.put('tg_last_offset', String(maxUpdateId), { expirationTtl: 86400 * 3 });
        } catch {}
      }
    }
  } catch (err) {
    console.error('syncTelegramReplies error:', err);
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

    // Ensure webhook is removed for fast getUpdates
    if (botToken && !webhookDisabled) {
      fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, { method: 'POST' }).catch(() => {});
      webhookDisabled = true;
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
        `👉 <b>Reply directly</b> to this message to send your reply to the visitor instantly!`;

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
  const { botToken } = resolveCredentials(locals);

  // Instantly fetch any new replies from Cris directly from Telegram (bypasses 60s KV delay)
  if (botToken) {
    await syncTelegramReplies(botToken, sessionId, kv);
  }

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
