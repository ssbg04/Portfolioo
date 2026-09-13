import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// In-memory sliding window rate limiter: 2 emails per 24 hours per IP, Email, and Device ID
interface RateRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateRecord>();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_EMAILS_PER_DAY = 2;

function checkRateLimit(key: string, now: number): { allowed: boolean; remainingMs: number } {
  const record = rateLimitStore.get(key);
  if (!record) return { allowed: true, remainingMs: 0 };

  // Keep only timestamps within the last 24 hours
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  record.timestamps = activeTimestamps;

  if (activeTimestamps.length >= MAX_EMAILS_PER_DAY) {
    const oldest = Math.min(...activeTimestamps);
    const remainingMs = Math.max(0, oldest + RATE_LIMIT_WINDOW_MS - now);
    return { allowed: false, remainingMs };
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
    const { name, email, message, deviceId } = body;

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
      const hoursLeft = Math.ceil(ipCheck.remainingMs / (1000 * 60 * 60));
      return new Response(
        JSON.stringify({
          message: `Daily limit reached for this network/IP (max 2 emails/day). To prevent spam, please try again in ~${hoursLeft} hour(s).`,
          limitReached: true
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check Email rate limit
    const emailCheck = checkRateLimit(`email:${normalizedEmail}`, now);
    if (!emailCheck.allowed) {
      const hoursLeft = Math.ceil(emailCheck.remainingMs / (1000 * 60 * 60));
      return new Response(
        JSON.stringify({
          message: `Daily limit reached for this email address (max 2 emails/day). To prevent abuse, please try again in ~${hoursLeft} hour(s).`,
          limitReached: true
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check Device ID rate limit
    if (cleanDeviceId) {
      const deviceCheck = checkRateLimit(`device:${cleanDeviceId}`, now);
      if (!deviceCheck.allowed) {
        const hoursLeft = Math.ceil(deviceCheck.remainingMs / (1000 * 60 * 60));
        return new Response(
          JSON.stringify({
            message: `Daily limit reached for this device (max 2 emails/day). To prevent automated spam, please try again in ~${hoursLeft} hour(s).`,
            limitReached: true
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Credentials from environment variables
    const zohoUser = import.meta.env.ZOHO_USER || (typeof process !== 'undefined' ? process.env.ZOHO_USER : undefined);
    const zohoPass = import.meta.env.ZOHO_PASS || (typeof process !== 'undefined' ? process.env.ZOHO_PASS : undefined);
    const zohoHost = import.meta.env.ZOHO_SMTP_HOST || (typeof process !== 'undefined' ? process.env.ZOHO_SMTP_HOST : undefined) || 'smtp.zoho.com';
    const zohoPort = Number(import.meta.env.ZOHO_SMTP_PORT || (typeof process !== 'undefined' ? process.env.ZOHO_SMTP_PORT : undefined)) || 465;
    const rawPrimaryEmail = import.meta.env.PRIMARY_EMAIL || (typeof process !== 'undefined' ? process.env.PRIMARY_EMAIL : undefined) || 'gcrischarles@gmail.com';
    const recipients = rawPrimaryEmail
      .split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => Boolean(e) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const finalRecipients = recipients.length > 0 ? recipients : ['gcrischarles@gmail.com'];

    console.log(`[Contact Form] Submission received from ${name} (${email}) [IP: ${clientIp}]`);

    if (!zohoUser || !zohoPass) {
      console.warn('[Contact Form] ZOHO_USER or ZOHO_PASS is missing in .env');
      return new Response(
        JSON.stringify({
          message: 'Server email credentials (ZOHO_USER / ZOHO_PASS) are not configured in .env'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configure Nodemailer transporter for Zoho SMTP
    const transporter = nodemailer.createTransport({
      host: zohoHost,
      port: zohoPort,
      secure: zohoPort === 465, // true for port 465, false for 587
      auth: {
        user: zohoUser,
        pass: zohoPass,
      },
    });

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

    // Send the contact email to all primary email recipients
    await transporter.sendMail({
      from: `"Portfolio Message" <${zohoUser}>`,
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
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100% !important;
      padding: 28px 20px !important;
      box-sizing: border-box;
    }
    .container {
      width: 100% !important;
      max-width: 880px !important;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      margin: 0 auto;
    }
    .grid-cell {
      padding: 14px 18px;
      vertical-align: top;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    @media only screen and (max-width: 680px) {
      .wrapper {
        padding: 12px 8px !important;
      }
      .header-pad {
        padding: 16px 18px !important;
      }
      .body-pad {
        padding: 16px !important;
      }
      .grid-row {
        display: block !important;
        width: 100% !important;
      }
      .grid-cell {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin-bottom: 8px !important;
      }
      .grid-spacer {
        display: none !important;
      }
      .header-action {
        display: block !important;
        margin-top: 10px !important;
        text-align: left !important;
      }
      .footer-cell {
        padding: 14px 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #0f172a;">
  <div class="wrapper" style="width: 100%; padding: 28px 20px; background-color: #f8fafc; box-sizing: border-box;">
    <div class="container" style="max-width: 880px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      
      <!-- Top Bar -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid #e2e8f0;">
        <tr>
          <td class="header-pad" style="padding: 20px 28px; background-color: #ffffff;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #2563eb; margin-bottom: 2px;">
                    Portfolio Contact
                  </div>
                  <div style="font-size: 18px; font-weight: 700; color: #0f172a;">
                    Message from ${safeName}
                  </div>
                </td>
                <td class="header-action" align="right" style="vertical-align: middle;">
                  <a href="mailto:${safeEmail}?subject=Re:%20Portfolio%20Inquiry" style="display: inline-block; padding: 7px 14px; background-color: #0f172a; color: #ffffff; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                    Reply to Sender
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Main Body Area -->
      <div class="body-pad" style="padding: 28px;">
        
        <!-- Metadata 3-Column Grid -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border-collapse: separate; border-spacing: 0;">
          <tr class="grid-row">
            <td class="grid-cell" style="width: 32%; padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px;">From</div>
              <div style="font-size: 15px; font-weight: 600; color: #0f172a; word-break: break-word;">${safeName}</div>
            </td>
            <td class="grid-spacer" style="width: 2%;"></td>
            <td class="grid-cell" style="width: 38%; padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px;">Email</div>
              <div style="font-size: 14px; font-weight: 500; word-break: break-all;">
                <a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a>
              </div>
            </td>
            <td class="grid-spacer" style="width: 2%;"></td>
            <td class="grid-cell" style="width: 26%; padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px;">Date</div>
              <div style="font-size: 13px; color: #475569; line-height: 1.4;">${formattedDate}</div>
            </td>
          </tr>
        </table>

        <!-- Message Block (Occupying all spaces) -->
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
            Message
          </div>
          <div style="width: 100%; box-sizing: border-box; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px 24px; font-size: 15px; line-height: 1.7; color: #0f172a; white-space: pre-wrap; word-break: break-word;">${safeMessage}</div>
        </div>

      </div>

      <!-- Footer Bar -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
        <tr>
          <td class="footer-cell" style="padding: 16px 28px; font-size: 12px; color: #64748b;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  Delivered to <span style="font-weight: 500; color: #0f172a;">${finalRecipients.map(escapeHtml).join(', ')}</span>
                </td>
                <td align="right" style="vertical-align: middle; color: #94a3b8; font-size: 11px;">
                  crischarles.top
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
    console.error('[Contact Form] Zoho SMTP / Nodemailer Error:', error);
    return new Response(
      JSON.stringify({
        message: error?.message || 'Failed to dispatch email via Zoho SMTP.'
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
