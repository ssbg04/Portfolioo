import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const recaptchaResponse = formData.get('g-recaptcha-response');
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    if (!recaptchaResponse) {
      return NextResponse.redirect(new URL('/?status=error&msg=Please complete the reCAPTCHA verification.#contact', request.url));
    }

    // 1. Verify Google reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || '';
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    const verifyParams = new URLSearchParams({
      secret: recaptchaSecret,
      response: recaptchaResponse.toString(),
      remoteip: ip
    });

    const verifyResult = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: verifyParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const verifyData = await verifyResult.json();

    if (!verifyData.success || (verifyData.score !== undefined && verifyData.score < 0.5)) {
      console.error('reCAPTCHA failed:', verifyData);
      return NextResponse.redirect(new URL('/?status=error&msg=reCAPTCHA verification failed (bot behavior detected). Please try again.#contact', request.url));
    }

    // 2. Rate Limiting via Supabase
    const rateLimit = parseInt(process.env.RATE_LIMIT || '10', 10);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await supabase
      .from('email_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('submitted_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit check error:', countError);
    }

    if (count !== null && count >= rateLimit) {
      return NextResponse.redirect(new URL(`/?status=error&msg=Rate limit exceeded. You can only send ${rateLimit} emails per hour.#contact`, request.url));
    }

    // 3. Log Submission
    await supabase.from('email_submissions').insert([{ ip_address: ip }]);

    // 4. Forward to FormSubmit
    const contactEmail = process.env.CONTACT_EMAIL || 'crischarlesgarcia345@gmail.com';
    const formSubmitUrl = `https://formsubmit.co/ajax/${contactEmail}`;

    const formSubmitParams = new URLSearchParams();
    formSubmitParams.append('name', name?.toString() || '');
    formSubmitParams.append('email', email?.toString() || '');
    formSubmitParams.append('subject', subject?.toString() || '');
    formSubmitParams.append('message', message?.toString() || '');
    formSubmitParams.append('_captcha', 'false'); // FormSubmit captcha disabled since we have reCAPTCHA

    const formSubmitResult = await fetch(formSubmitUrl, {
      method: 'POST',
      body: formSubmitParams,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!formSubmitResult.ok) {
      return NextResponse.redirect(new URL('/?status=error&msg=Failed to send message via mail service. Please try again later.#contact', request.url));
    }

    return NextResponse.redirect(new URL('/?status=success#contact', request.url));

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.redirect(new URL('/?status=error&msg=An unexpected error occurred.#contact', request.url));
  }
}
