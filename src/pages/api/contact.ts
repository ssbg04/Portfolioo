import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message } = body;

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

    const resendApiKey = import.meta.env.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : undefined);
    const contactEmail = import.meta.env.CONTACT_EMAIL || (typeof process !== 'undefined' ? process.env.CONTACT_EMAIL : undefined) || 'crischarlesgarcia345@gmail.com';

    console.log(`[Contact Form] Submission received from ${name} (${email}): ${message}`);

    if (!resendApiKey) {
      // Mock mode: Success if no Resend key is configured
      console.warn('[Contact Form] RESEND_API_KEY is not set. Simulating successful email dispatch.');
      return new Response(
        JSON.stringify({ 
          message: 'Message received successfully (Simulation mode - API keys not configured).' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call Resend REST API directly
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: contactEmail,
        subject: `New Portfolio Message from ${name}`,
        html: `
          <h3>New Message Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `
      })
    });

    if (resendResponse.ok) {
      return new Response(
        JSON.stringify({ message: 'Message sent successfully!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const errorData = await resendResponse.json();
      console.error('[Contact Form] Resend API error:', errorData);
      return new Response(
        JSON.stringify({ message: 'Email dispatch failed. Please try again later.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[Contact Form] Server exception:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
