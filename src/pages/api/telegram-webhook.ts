import type { APIRoute } from 'astro';
import { addCrisReply } from './live-chat';

export const prerender = false;

/**
 * Telegram Webhook Handler
 * Telegram sends an update whenever you reply to a message in the bot chat.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();

    // Check if the update is a message reply
    const message = payload?.message;
    if (!message || !message.text) {
      return new Response(JSON.stringify({ ok: true, note: 'No text message' }), { status: 200 });
    }

    const replyToMessage = message.reply_to_message;
    const replyText = message.text.trim();

    // Find the session ID from the replied message or the reply text itself
    let targetSessionId = '';

    const textToScan = [
      replyToMessage?.text,
      replyToMessage?.caption,
      message.text
    ].filter(Boolean).join('\n');

    // Matches "#user_xxxx" or "Session: #xxxx"
    const match = textToScan.match(/#([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      targetSessionId = match[1];
    }

    if (targetSessionId) {
      addCrisReply(targetSessionId, replyText);
      console.log(`[Telegram Webhook] Matched reply to session: ${targetSessionId} -> "${replyText}"`);
      return new Response(JSON.stringify({ ok: true, matchedSession: targetSessionId }), { status: 200 });
    }

    console.warn('[Telegram Webhook] Could not match reply to any session. textToScan:', textToScan);
    return new Response(JSON.stringify({ ok: true, note: 'No session ID found in reply' }), { status: 200 });
  } catch (err: any) {
    console.error('Telegram webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ status: 'Telegram Webhook Endpoint Active' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
