import type { APIRoute } from 'astro';
import { addCrisReply, resolveKV, resolveCredentials } from './live-chat';

export const prerender = false;

/**
 * Telegram Webhook Handler
 * Telegram sends an update whenever you reply to a message in the bot chat.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = await request.json();
    const kv = resolveKV(locals);

    // Support standard messages or edited messages
    const message = payload?.message || payload?.edited_message;
    if (!message || !message.text) {
      return new Response(JSON.stringify({ ok: true, note: 'No text message' }), { status: 200 });
    }

    const replyToMessage = message.reply_to_message;
    const replyText = message.text.trim();

    // 1. Find the session ID from the replied message or the reply text itself
    let targetSessionId = '';

    const textToScan = [
      replyToMessage?.text,
      replyToMessage?.caption,
      message.text
    ].filter(Boolean).join('\n');

    // Matches "#user_xxxx" or "#xxxx"
    const match = textToScan.match(/#(user_[a-zA-Z0-9_-]+)/) || textToScan.match(/#([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      targetSessionId = match[1];
    }

    // 2. If no session tag in message, fallback to the last active session stored in KV
    if (!targetSessionId && kv) {
      try {
        const lastSession = await kv.get('chat_last_session');
        if (lastSession) {
          targetSessionId = lastSession;
          console.log(`[Telegram Webhook] Fallback to last active session: ${targetSessionId}`);
        }
      } catch (err) {
        console.error('KV last session read error:', err);
      }
    }

    if (targetSessionId) {
      await addCrisReply(targetSessionId, replyText, kv);
      console.log(`[Telegram Webhook] Matched reply to session: ${targetSessionId} -> "${replyText}"`);
      return new Response(
        JSON.stringify({
          ok: true,
          matchedSession: targetSessionId,
          replyText,
          savedToKV: Boolean(kv),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.warn('[Telegram Webhook] Could not match reply to any session. textToScan:', textToScan);
    return new Response(JSON.stringify({ ok: true, note: 'No session ID found in reply' }), { status: 200 });
  } catch (err: any) {
    console.error('Telegram webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

/**
 * Diagnostic & Setup Endpoint
 * Visiting /api/telegram-webhook checks Telegram's webhook status and registers the URL automatically
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const { botToken } = resolveCredentials(locals);

  if (!botToken) {
    return new Response(
      JSON.stringify({
        status: 'Error',
        error: 'TELEGRAM_BOT_TOKEN is not configured in environment',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const webhookUrl = `${url.origin}/api/telegram-webhook`;

  try {
    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoData = await infoRes.json();

    let setupResult = null;
    const isMismatch = infoData?.result?.url !== webhookUrl;

    // Automatically register if not configured or if explicitly requested
    if (isMismatch || url.searchParams.get('setup') === '1') {
      const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'edited_message'],
          drop_pending_updates: false,
        }),
      });
      setupResult = await setRes.json();
    }

    // Fetch updated status
    const updatedInfoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const updatedInfo = await updatedInfoRes.json();

    return new Response(
      JSON.stringify(
        {
          status: 'Telegram Webhook Active',
          configuredUrl: webhookUrl,
          telegramWebhookInfo: updatedInfo?.result || infoData?.result,
          actionTaken: setupResult ? 'Auto-registered webhook with Telegram' : 'Webhook already up-to-date',
          setupResponse: setupResult,
        },
        null,
        2
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'Error', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
