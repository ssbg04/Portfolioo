import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recaptchaResponse = body.token;

    if (!recaptchaResponse) {
      return NextResponse.json({ success: false, msg: 'Please complete the reCAPTCHA verification.' });
    }

    // 1. Verify Google reCAPTCHA using Enterprise REST API
    const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || '6LfVNBAtAAAAAFn8Wh8T8cleAHiT3R3cAJEQITFc';
    const projectID = process.env.RECAPTCHA_PROJECT_ID || 'portfolio-1773375323575';
    const apiKey = process.env.RECAPTCHA_API_KEY || ''; // Requires an API key starting with AIza
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!apiKey) {
      console.error("Missing RECAPTCHA_API_KEY environment variable.");
      return NextResponse.json({ success: false, msg: 'Server configuration error. Please try again later.' });
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
        return NextResponse.json({ success: false, msg: 'reCAPTCHA verification failed (invalid token). Please try again.' });
      }

      if (response.tokenProperties.action === 'submit') {
        const score = response.riskAnalysis?.score || 0;
        if (score < 0.5) {
          console.error(`reCAPTCHA blocked due to low score: ${score}`);
          return NextResponse.json({ success: false, msg: 'reCAPTCHA verification failed (bot behavior detected). Please try again.' });
        }
      } else {
        console.error("The action attribute does not match.");
        return NextResponse.json({ success: false, msg: 'reCAPTCHA verification failed (action mismatch). Please try again.' });
      }
    } catch (err) {
      console.error("Enterprise REST error:", err);
      return NextResponse.json({ success: false, msg: 'reCAPTCHA verification service unavailable. Please try again later.' });
    }

    // 2. Rate Limiting via Supabase
    const rateLimit = parseInt(process.env.RATE_LIMIT || '10', 10);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await supabase
      .from('email_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit check error:', countError);
    }

    if (count !== null && count >= rateLimit) {
      return NextResponse.json({ success: false, msg: `Rate limit exceeded. You can only send ${rateLimit} emails per hour.` });
    }

    // 3. Log Submission
    await supabase.from('email_submissions').insert([{ ip_address: ip }]);

    return NextResponse.json({ success: true, msg: 'Verification passed.' });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, msg: 'An unexpected error occurred.' });
  }
}
