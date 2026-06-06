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
      return NextResponse.redirect(new URL('/?status=error&msg=Please complete the reCAPTCHA verification.#contact', request.url), 303);
    }

    // 1. Verify Google reCAPTCHA using Enterprise REST API
    const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || '6LfVNBAtAAAAAFn8Wh8T8cleAHiT3R3cAJEQITFc';
    const projectID = process.env.RECAPTCHA_PROJECT_ID || 'portfolio-1773375323575';
    const apiKey = process.env.RECAPTCHA_API_KEY || ''; // Requires an API key starting with AIza
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!apiKey) {
      console.error("Missing RECAPTCHA_API_KEY environment variable.");
      return NextResponse.redirect(new URL('/?status=error&msg=Server configuration error. Please try again later.#contact', request.url), 303);
    }

    try {
      const assessUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;
      const assessBody = {
        event: {
          token: recaptchaResponse.toString(),
          siteKey: recaptchaSiteKey,
          expectedAction: 'submit'
        }
      };

      const assessResult = await fetch(assessUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessBody)
      });

      const response = await assessResult.json();

      if (!response.tokenProperties?.valid) {
        console.error(`Assessment failed because token was: ${response.tokenProperties?.invalidReason}`);
        return NextResponse.redirect(new URL('/?status=error&msg=reCAPTCHA verification failed (invalid token). Please try again.#contact', request.url), 303);
      }

      if (response.tokenProperties.action === 'submit') {
        const score = response.riskAnalysis?.score || 0;
        if (score < 0.5) {
          console.error(`reCAPTCHA blocked due to low score: ${score}`);
          return NextResponse.redirect(new URL('/?status=error&msg=reCAPTCHA verification failed (bot behavior detected). Please try again.#contact', request.url), 303);
        }
      } else {
        console.error("The action attribute does not match.");
        return NextResponse.redirect(new URL('/?status=error&msg=reCAPTCHA verification failed (action mismatch). Please try again.#contact', request.url), 303);
      }
    } catch (err) {
      console.error("Enterprise REST error:", err);
      return NextResponse.redirect(new URL('/?status=error&msg=reCAPTCHA verification service unavailable. Please try again later.#contact', request.url), 303);
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
      return NextResponse.redirect(new URL(`/?status=error&msg=Rate limit exceeded. You can only send ${rateLimit} emails per hour.#contact`, request.url), 303);
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
      return NextResponse.redirect(new URL('/?status=error&msg=Failed to send message via mail service. Please try again later.#contact', request.url), 303);
    }

    return NextResponse.redirect(new URL('/?status=success#contact', request.url), 303);

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.redirect(new URL('/?status=error&msg=An unexpected error occurred.#contact', request.url), 303);
  }
}
