import type { APIRoute } from 'astro';
import { Resend } from 'resend';
export const prerender = false;

// In-memory sliding window rate limiter: 2 emails per 24 hours per IP, Email, and Device ID
interface RateRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateRecord>();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_EMAILS_PER_DAY = 5;
const BURST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_BURST_EMAILS = 3;

function checkRateLimit(key: string, now: number): { allowed: boolean; remainingMs: number; isBurst?: boolean } {
  const record = rateLimitStore.get(key);
  if (!record) return { allowed: true, remainingMs: 0 };

  const activeTimestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  record.timestamps = activeTimestamps;

  // Check burst limit (max 3 emails per 10 mins)
  const recentBurst = activeTimestamps.filter((ts) => now - ts < BURST_WINDOW_MS);
  if (recentBurst.length >= MAX_BURST_EMAILS) {
    const oldestBurst = Math.min(...recentBurst);
    const remainingMs = Math.max(0, oldestBurst + BURST_WINDOW_MS - now);
    return { allowed: false, remainingMs, isBurst: true };
  }

  // Check daily limit (max 5 emails per 24 hours)
  if (activeTimestamps.length >= MAX_EMAILS_PER_DAY) {
    const oldest = Math.min(...activeTimestamps);
    const remainingMs = Math.max(0, oldest + RATE_LIMIT_WINDOW_MS - now);
    return { allowed: false, remainingMs, isBurst: false };
  }

  return { allowed: true, remainingMs: 0 };
}

function recordSubmission(key: string, now: number) {
  const record = rateLimitStore.get(key) || { timestamps: [] };
  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  record.timestamps.push(now);
  rateLimitStore.set(key, record);
}

function cleanupExpiredRecords(now: number) {
  if (rateLimitStore.size > 2000) {
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message, deviceId, _hp_website } = body;

    // Honeypot spam bot trap
    if (_hp_website && String(_hp_website).trim().length > 0) {
      return new Response(
        JSON.stringify({ message: 'Message sent successfully!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Server-side validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields: name, email, message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ message: 'Invalid email address format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate Limiting Security Check
    const now = Date.now();
    cleanupExpiredRecords(now);

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      '127.0.0.1';

    const normalizedEmail = String(email).toLowerCase().trim();
    const cleanDeviceId = typeof deviceId === 'string' && deviceId.trim().length > 0
      ? deviceId.trim()
      : null;

    // 1. Check IP rate limit
    const ipCheck = checkRateLimit(`ip:${clientIp}`, now);
    if (!ipCheck.allowed) {
      const waitTime = ipCheck.isBurst
        ? `${Math.ceil(ipCheck.remainingMs / (1000 * 60))} minute(s)`
        : `~${Math.ceil(ipCheck.remainingMs / (1000 * 60 * 60))} hour(s)`;
      return new Response(
        JSON.stringify({
          message: ipCheck.isBurst
            ? `Please wait ${waitTime} before sending another message.`
            : `Daily limit reached (max 5 emails/day). Please try again in ${waitTime}.`,
          limitReached: true
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check Email rate limit
    const emailCheck = checkRateLimit(`email:${normalizedEmail}`, now);
    if (!emailCheck.allowed) {
      const waitTime = emailCheck.isBurst
        ? `${Math.ceil(emailCheck.remainingMs / (1000 * 60))} minute(s)`
        : `~${Math.ceil(emailCheck.remainingMs / (1000 * 60 * 60))} hour(s)`;
      return new Response(
        JSON.stringify({
          message: emailCheck.isBurst
            ? `Please wait ${waitTime} before sending another message.`
            : `Daily limit reached for this email (max 5 emails/day). Please try again in ${waitTime}.`,
          limitReached: true
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check Device ID rate limit
    if (cleanDeviceId) {
      const deviceCheck = checkRateLimit(`device:${cleanDeviceId}`, now);
      if (!deviceCheck.allowed) {
        const waitTime = deviceCheck.isBurst
          ? `${Math.ceil(deviceCheck.remainingMs / (1000 * 60))} minute(s)`
          : `~${Math.ceil(deviceCheck.remainingMs / (1000 * 60 * 60))} hour(s)`;
        return new Response(
          JSON.stringify({
            message: deviceCheck.isBurst
              ? `Please wait ${waitTime} before sending another message.`
              : `Daily limit reached for this device (max 5 emails/day). Please try again in ${waitTime}.`,
            limitReached: true
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Credentials from environment variables
    const resendApiKey = import.meta.env.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : undefined);
    const resendFrom = import.meta.env.RESEND_FROM || (typeof process !== 'undefined' ? process.env.RESEND_FROM : undefined) || 'Portfolio Contact <onboarding@resend.dev>';
    const rawPrimaryEmail = import.meta.env.PRIMARY_EMAIL || (typeof process !== 'undefined' ? process.env.PRIMARY_EMAIL : undefined) || 'crischarlesgarcia345@gmail.com';
    const recipients = rawPrimaryEmail
      .split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => Boolean(e) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const finalRecipients = recipients.length > 0 ? recipients : ['crischarlesgarcia345@gmail.com'];

    console.log(`[Contact Form] Submission received from ${name} (${email}) [IP: ${clientIp}]`);

    if (!resendApiKey) {
      console.warn('[Contact Form] RESEND_API_KEY is missing in .env');
      return new Response(
        JSON.stringify({
          message: 'Server email credentials (RESEND_API_KEY) are not configured in .env'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format date and sanitize inputs for email presentation
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Manila'
    }).format(new Date());

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // Send the contact email via Resend HTTP API
    const resend = new Resend(resendApiKey);

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: resendFrom,
      to: finalRecipients,
      replyTo: `"${name}" <${email}>`,
      subject: `Portfolio Inquiry: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nDate: ${formattedDate}\n\nMessage:\n${message}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Inquiry: ${safeName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      color: #0a0a0a;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: separate;
      border-spacing: 0;
    }
    .email-wrapper {
      width: 100% !important;
      padding: 32px 16px !important;
      background-color: #fafafa;
      box-sizing: border-box;
    }
    .email-container {
      width: 100% !important;
      max-width: 680px !important;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 14px;
      overflow: hidden;
      margin: 0 auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 16px 8px !important;
      }
      .content-padding {
        padding: 20px 18px !important;
      }
      .meta-grid-col {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin-bottom: 10px !important;
      }
      .meta-grid-spacer {
        display: none !important;
      }
      .cta-btn {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;">
  <div class="email-wrapper" style="width: 100%; padding: 36px 16px; background-color: #fafafa; box-sizing: border-box;">
    <div class="email-container" style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
      
      <!-- Top Technical Status Bar -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; border-bottom: 1px solid #e4e4e7;">
        <tr>
          <td style="padding: 14px 28px; font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace; font-size: 11px; color: #71717a;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: #10b981; margin-right: 6px; vertical-align: middle;"></span>
                  <span style="letter-spacing: 0.05em; font-weight: 600; color: #0a0a0a;">PORTFOLIO</span>
                  <span style="color: #a1a1aa; margin: 0 4px;">//</span>
                  <span style="color: #71717a;">INQUIRY RECEIVED</span>
                </td>
                <td align="right" style="vertical-align: middle; color: #a1a1aa; font-size: 10px;">
                  DEV // 01
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Header Title Banner -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td class="content-padding" style="padding: 28px 28px 20px 28px; background-color: #ffffff;">
            <div style="font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #1d4ed8; margin-bottom: 6px;">
              Direct Transmission
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.02em; line-height: 1.25;">
              Message from ${safeName}
            </h1>
          </td>
        </tr>
      </table>

      <!-- Main Body: Bento Metadata Cards -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td class="content-padding" style="padding: 0 28px 28px 28px;">
            
            <!-- Metadata Bento Grid -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
              <tr>
                <td class="meta-grid-col" style="width: 48%; vertical-align: top; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px 18px;">
                  <div style="font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #71717a; margin-bottom: 4px;">
                    Sender Name
                  </div>
                  <div style="font-size: 14px; font-weight: 600; color: #0a0a0a; word-break: break-word;">
                    ${safeName}
                  </div>
                </td>
                <td class="meta-grid-spacer" style="width: 4%;"></td>
                <td class="meta-grid-col" style="width: 48%; vertical-align: top; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px 18px;">
                  <div style="font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #71717a; margin-bottom: 4px;">
                    Email Address
                  </div>
                  <div style="font-size: 13px; font-weight: 500; word-break: break-all;">
                    <a href="mailto:${safeEmail}" style="color: #1d4ed8; text-decoration: none; font-weight: 600;">
                      ${safeEmail}
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" style="height: 10px;"></td>
              </tr>
              <tr>
                <td colspan="3" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 12px 18px;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; color: #71717a;">
                        <span style="text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">TIMESTAMP:</span> ${formattedDate} (PHT)
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Message Bento Container -->
            <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
              <div style="background-color: #fafafa; border-bottom: 1px solid #e4e4e7; padding: 10px 18px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #71717a;">
                Inquiry Content
              </div>
              <div style="padding: 22px 20px; font-size: 15px; line-height: 1.7; color: #18181b; white-space: pre-wrap; word-break: break-word;">${safeMessage}</div>
            </div>

            <!-- Quick Action CTA Button -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left">
                  <a href="mailto:${safeEmail}?subject=Re:%20Portfolio%20Inquiry" class="cta-btn" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: #ffffff; font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.04em; text-decoration: none; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    Reply to ${safeName} &rarr;
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

      <!-- Bottom Security & Delivery Footer -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e4e4e7; background-color: #fafafa;">
        <tr>
          <td style="padding: 16px 28px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: #71717a;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  Delivered to <strong style="color: #0a0a0a; font-weight: 600;">${finalRecipients.map(escapeHtml).join(', ')}</strong>
                </td>
                <td align="right" style="vertical-align: middle; color: #a1a1aa; font-size: 10px;">
                  crischarles.com
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

    </div>
  </div>
</body>
</html>
      `,
    });

    if (resendError) {
      console.error('[Contact Form] Resend API Error:', resendError);
      return new Response(
        JSON.stringify({
          message: resendError.message || 'Failed to dispatch email via Resend API.'
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Record successful submission for rate limiting across IP, Email, and Device
    recordSubmission(`ip:${clientIp}`, now);
    recordSubmission(`email:${normalizedEmail}`, now);
    if (cleanDeviceId) {
      recordSubmission(`device:${cleanDeviceId}`, now);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Message sent successfully!',
        remainingToday: MAX_EMAILS_PER_DAY - (checkRateLimit(`ip:${clientIp}`, now).remainingMs > 0 ? MAX_EMAILS_PER_DAY : 1)
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Contact Form] Resend Error:', error);
    return new Response(
      JSON.stringify({
        message: error?.message || 'Failed to dispatch email via Resend API.'
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
