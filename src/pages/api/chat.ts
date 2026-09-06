import type { APIRoute } from 'astro';
import { 
  getSiteSettings, 
  getProjects, 
  getSkills, 
  getExperience, 
  getEducation, 
  getCertifications, 
  getTestimonials 
} from '../../lib/data';

interface ClientGeo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  flag?: string;
}

function isAiPrompt(rawQuery: string): boolean {
  const q = rawQuery.toLowerCase().trim();

  // 1. Jailbreak & System Prompt injections
  const jailbreaks = [
    'ignore previous',
    'ignore all instructions',
    'disregard previous',
    'disregard all prior',
    'forget previous',
    'forget all prior',
    'system prompt',
    'prompt injection',
    'jailbreak',
    'dan mode',
    'developer mode',
    'bypass security',
    'do anything now',
    'override instructions'
  ];
  if (jailbreaks.some(j => q.includes(j))) return true;

  // 2. Persona / Roleplay prompting
  if (/\b(act as|pretend (to be|you are)|you are now|roleplay as|simulate being|from now on you)\b/i.test(q)) {
    return true;
  }

  // 3. AI Model / LLM Identity testing
  if (/\b(are you (an? )?(ai|llm|robot|bot|chatgpt|gpt|claude|gemini|deepseek)|what (model|llm|ai) (are you|is this)|who created your model|as an ai language model)\b/i.test(q)) {
    return true;
  }

  // 4. Generative requests (poems, stories, essays, jokes, code generation)
  if (/\b(write|generate|compose|create)\s+(a|an|me|some)?\s*(poem|story|essay|song|joke|script|python|code|function|algorithm|sql query|novel|haiku|letter|rap|speech|recipe)\b/i.test(q)) {
    return true;
  }

  // 5. Common generic AI query / homework / riddles
  if (/\b(tell me a joke|tell me a riddle|tell me a story|what is the meaning of life|explain quantum physics|write hello world|solve for x)\b/i.test(q)) {
    return true;
  }

  // 6. Basic math problem queries (e.g., "what is 2+2", "calculate 5*10", "2 + 2?")
  if (/^(\s*what is\s+)?\d+\s*[\+\-\*\/]\s*\d+\s*(\?|=|\?|equals)?\s*\??$/i.test(q) || /^calculate\s+\d+/i.test(q)) {
    return true;
  }

  // 7. Text manipulation, Translation & Homework assistance
  if (/\b(translate (this|the following)|summarize the following|paraphrase the following|help me (write|code|solve))\b/i.test(q)) {
    return true;
  }

  return false;
}

async function getClientGeo(request: Request): Promise<ClientGeo> {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  let ip = (forwarded?.split(',')[0] || realIp || cfIp || '').trim();

  // Vercel deployment geolocation headers
  const vercelCity = request.headers.get('x-vercel-ip-city');
  const vercelRegion = request.headers.get('x-vercel-ip-country-region');
  const vercelCountry = request.headers.get('x-vercel-ip-country');

  const isLocal = !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.');

  // If on Vercel and we have IP and city
  if (!isLocal && vercelCity && vercelCountry) {
    return {
      ip,
      city: decodeURIComponent(vercelCity),
      region: vercelRegion ? decodeURIComponent(vercelRegion) : undefined,
      country: vercelCountry,
      isp: 'Vercel Edge Network'
    };
  }

  // High-speed public geo lookup (reliable across local dev, preview, and server)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const url = isLocal ? 'https://ipwho.is/' : `https://ipwho.is/${ip}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          ip: data.ip || ip || 'Unknown IP',
          city: data.city,
          region: data.region,
          country: data.country,
          isp: data.connection?.isp || data.connection?.org,
          flag: data.flag?.emoji
        };
      }
    }
  } catch {
    // Fall back below if network call fails
  }

  return {
    ip: ip || '127.0.0.1',
    city: vercelCity ? decodeURIComponent(vercelCity) : (isLocal ? 'Localhost' : 'Unknown City'),
    region: vercelRegion ? decodeURIComponent(vercelRegion) : undefined,
    country: vercelCountry || (isLocal ? 'Development Network' : 'Earth'),
    isp: isLocal ? 'Local Machine' : 'Detected ISP'
  };
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
  lastMessage: string;
  lastTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimitAndSpam(ip: string, rawMessage: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const trimmed = rawMessage.trim().toLowerCase();

  // 1. Max character length limit (prevent giant paste dumps)
  if (rawMessage.length > 250) {
    return {
      allowed: false,
      reason: 'Query is too long. Please keep your search keyword or question under 250 characters.'
    };
  }

  // 2. Repeated character spam (e.g. "aaaaaaa", ".....")
  if (/(.)\1{9,}/.test(trimmed)) {
    return {
      allowed: false,
      reason: 'Excessive repeating characters detected. Please enter a valid inquiry.'
    };
  }

  // 3. Repeated word copy-paste spam (e.g. "test test test test")
  const words = trimmed.split(/\s+/);
  if (words.length >= 4) {
    const unique = new Set(words);
    if (unique.size <= 2) {
      return {
        allowed: false,
        reason: 'Repetitive copy-pasted text detected. Please ask a specific question.'
      };
    }
  }

  // 4. Rate limiting per IP
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + 10000, // 10s sliding window
      lastMessage: trimmed,
      lastTime: now
    });
    return { allowed: true };
  }

  // Duplicate query spam detection within 4 seconds
  if (entry.lastMessage === trimmed && now - entry.lastTime < 4000) {
    return {
      allowed: false,
      reason: '⚠️ Duplicate request detected. Please review the response above before asking again.'
    };
  }

  entry.count++;
  entry.lastMessage = trimmed;
  entry.lastTime = now;

  // Rapid flood threshold: max 5 requests per 10 seconds
  if (entry.count > 5) {
    return {
      allowed: false,
      reason: '⏳ **Rate limit reached:** Too many rapid requests. Please pause a few seconds before trying again.'
    };
  }

  return { allowed: true };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ text: 'Please enter a keyword or inquiry to search.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    const clientIp = (forwarded?.split(',')[0] || realIp || cfIp || '127.0.0.1').trim();

    // Check rate limit and copy-paste spam
    const spamCheck = checkRateLimitAndSpam(clientIp, message);
    if (!spamCheck.allowed) {
      return new Response(
        JSON.stringify({ text: spamCheck.reason }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const query = message.trim().toLowerCase();

    // Check if the user is trying to prompt like an AI chatbot
    if (isAiPrompt(query)) {
      const geo = await getClientGeo(request);
      const flagEmoji = geo.flag ? `${geo.flag} ` : '';
      const locationParts = [geo.city, geo.region, geo.country].filter(Boolean);
      const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown Location';

      const aiTrollReply = 
        `Whoa there, detective! 🕵️‍♂️\n\n` +
        `I caught you trying to prompt me like an AI or ChatGPT!\n\n` +
        `Just a reminder: I am a lightweight keyword assistant for Cris's portfolio, not an AI chatbot.\n\n` +
        `Detected Origin:\n` +
        `• IP: ${geo.ip}\n` +
        `• Location: ${flagEmoji}${locationStr}\n` +
        `• Network: ${geo.isp || 'Identified Provider'}\n\n` +
        `No GPU servers were harmed! Feel free to ask about Cris's projects, skills, experience, or contact info instead.`;

      return new Response(
        JSON.stringify({ text: aiTrollReply }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch live portfolio data from Sanity / cache
    const [settings, projects, skills, experience, education, certifications, testimonials] = await Promise.all([
      getSiteSettings(),
      getProjects(),
      getSkills(),
      getExperience(),
      getEducation(),
      getCertifications(),
      getTestimonials()
    ]);

    let reply = '';

    // Keyword matching logic
    if (query.includes('project') || query.includes('work') || query.includes('portfolio') || query.includes('app') || query.includes('tis')) {
      const topProjects = projects.slice(0, 3);
      reply = `Featured Projects:\n\n` +
        topProjects.map((p, idx) => `${idx + 1}. ${p.title} – ${p.summary} (Tech: ${p.technologies.slice(0, 4).join(', ')})`).join('\n\n') +
        `\n\nYou can explore all full case studies in the Projects section.`;

    } else if (query.includes('skill') || query.includes('tech') || query.includes('stack') || query.includes('language') || query.includes('framework') || query.includes('tool')) {
      const categories = Array.from(new Set(skills.map(s => s.category || 'Core')));
      reply = `Technologies & Core Stack:\n\n` +
        categories.map(cat => {
          const catSkills = skills.filter(s => (s.category || 'Core') === cat).map(s => s.name);
          return `• ${cat}: ${catSkills.join(', ')}`;
        }).join('\n') +
        `\n\nYou can review the full interactive matrix in the Skills Matrix section.`;

    } else if (query.includes('experience') || query.includes('job') || query.includes('career') || query.includes('intern') || query.includes('role')) {
      reply = `Professional Experience:\n\n` +
        experience.map(e => `• ${e.role} at ${e.company} (${e.startDate} — ${e.endDate})\n  ${e.description?.[0] || 'Full-stack software engineering and database administration.'}`).join('\n\n');

    } else if (query.includes('education') || query.includes('degree') || query.includes('college') || query.includes('school') || query.includes('lspu') || query.includes('academic')) {
      reply = `Academic Background:\n\n` +
        education.map(ed => `• ${ed.degree} (${ed.fieldOfStudy || 'IT'}) at ${ed.institution} (${ed.startDate} — ${ed.endDate})`).join('\n\n');

    } else if (query.includes('cert') || query.includes('badge') || query.includes('cisco') || query.includes('credential')) {
      reply = `Verified Certifications:\n\n` +
        certifications.slice(0, 4).map(c => `• ${c.title} — Issued by ${c.issuer}`).join('\n') +
        `\n\nYou can review all verified digital badges in the Certifications page.`;

    } else if (query.includes('contact') || query.includes('email') || query.includes('reach') || query.includes('hire') || query.includes('call') || query.includes('message')) {
      reply = `Get in Touch with Cris:\n\n` +
        `• Email: ${settings.email || 'crischarlesgarcia345@gmail.com'}\n` +
        `• Location: ${settings.location || 'Laguna, Philippines'}\n` +
        `• Status: ${settings.statusIndicator || 'Open for technical opportunities'}\n\n` +
        `Feel free to send a message directly using the Contact Form on this site.`;

    } else if (query.includes('testimonial') || query.includes('recommend') || query.includes('review') || query.includes('feedback')) {
      const topT = testimonials[0];
      reply = `Client & Peer Endorsement:\n\n` +
        `"${topT.quote}"\n\n— ${topT.name}, ${topT.role} (${topT.company})\n\n` +
        `Read more verified endorsements in the Testimonials section.`;

    } else if (query.includes('who') || query.includes('about') || query.includes('cris') || query.includes('intro') || query.includes('hello') || query.includes('hi')) {
      reply = `Hello! I am the Portfolio Assistant for ${settings.fullName}.\n\n` +
        `${settings.fullName} is a ${settings.title} based in ${settings.location}.\n\n` +
        `${settings.valueProposition || 'Engineering accessible web platforms and resilient backend services.'}\n\n` +
        `You can ask me about:\n` +
        `• Cris's main skills and technical stack\n` +
        `• Featured projects and case studies\n` +
        `• Work experience and internship history\n` +
        `• Certifications and education\n` +
        `• How to contact Cris`;

    } else {
      // General Keyword Search across projects and skills
      const matchedProjects = projects.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.summary.toLowerCase().includes(query) ||
        p.technologies.some(t => t.toLowerCase().includes(query))
      );

      const matchedSkills = skills.filter(s => 
        s.name.toLowerCase().includes(query)
      );

      if (matchedProjects.length > 0 || matchedSkills.length > 0) {
        let result = `Search results for "${query}":\n\n`;
        if (matchedProjects.length > 0) {
          result += `Projects:\n` + matchedProjects.map(p => `• ${p.title}: ${p.summary}`).join('\n') + '\n\n';
        }
        if (matchedSkills.length > 0) {
          result += `Relevant Skills: ` + matchedSkills.map(s => s.name).join(', ') + '\n\n';
        }
        reply = result.trim();
      } else {
        reply = `I couldn't find an exact match for "${query}".\n\n` +
          `Try asking about one of these topics:\n` +
          `• Skills (e.g. React, Node.js, MySQL)\n` +
          `• Projects (e.g. TIS, Portfolio)\n` +
          `• Experience or Education\n` +
          `• Certifications\n` +
          `• Contact Info`;
      }
    }

    return new Response(
      JSON.stringify({ text: reply }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Portfolio Assistant Search Error]:', error);
    return new Response(
      JSON.stringify({ text: 'Sorry, an error occurred while searching portfolio records.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
