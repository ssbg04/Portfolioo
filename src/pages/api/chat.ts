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

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ message: 'Message is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve full portfolio data to inject into context
    const settings = await getSiteSettings();
    const projects = await getProjects();
    const skills = await getSkills();
    const experience = await getExperience();
    const education = await getEducation();
    const certifications = await getCertifications();
    const testimonials = await getTestimonials();

    // Construct the context string
    const context = `
You are the AI Assistant for ${settings.fullName}, ${settings.title}.
Your goal is to answer visitor questions accurately and politely about ${settings.fullName}'s background, skills, work history, education, certifications, projects, and testimonials.
Keep your responses friendly, concise, and professional.

PORTFOLIO CONTENT CONTEXT:

Site Owner Name: ${settings.fullName}
Professional Title: ${settings.title}
Value Proposition: ${settings.valueProposition}
Email Contact: ${settings.email}
Location: ${settings.location}

EXPERIENCE / WORK HISTORY:
${experience.map(exp => `- Role: ${exp.role} at ${exp.company} (${exp.startDate} to ${exp.endDate})
  Key achievements:
  ${exp.description.map(desc => `  * ${desc}`).join('\n')}
  Technologies: ${exp.technologies?.join(', ') || 'N/A'}`).join('\n\n')}

EDUCATION & ACADEMICS:
${education.map(ed => `- ${ed.degree} (${ed.fieldOfStudy || ''}) at ${ed.institution}, ${ed.location || ''} (${ed.startDate} - ${ed.endDate})
  Achievements: ${ed.achievements?.join(', ') || 'N/A'}`).join('\n')}

CERTIFICATIONS & CREDENTIALS:
${certifications.map(c => `- ${c.title} (#${c.code}) by ${c.issuer} (${c.category})
  Description: ${c.description}
  Skills: ${c.skills?.join(', ') || 'N/A'}`).join('\n')}

FEATURED PROJECTS:
${projects.map(p => `- Title: ${p.title}
  Summary: ${p.summary}
  Description: ${p.description}
  Technologies: ${p.technologies.join(', ')}
  Repository: ${p.repositoryUrl || 'Private'}
  Demo Link: ${p.liveUrl || 'None'}`).join('\n\n')}

SKILLS MATRIX:
${skills.map(s => `- ${s.name} (${s.category}): Proficiency ${s.proficiency}%`).join('\n')}

CLIENT TESTIMONIALS:
${testimonials.map(t => `- "${t.quote}" - ${t.name}, ${t.role} at ${t.company}`).join('\n')}

INSTRUCTIONS:
- You must ONLY talk about Cris Charles Garcia.
- Answer questions using the context provided above.
- If asked about contact info, provide ${settings.email} or tell them to use the Contact form.
- If you don't know the answer or if it's not in the context, politely suggest contacting Cris directly.
- Maintain a helpful, professional agent persona.
`;

    const geminiApiKey = import.meta.env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

    if (!geminiApiKey) {
      console.warn('[Chat API] GEMINI_API_KEY is not set. Falling back to local mock chatbot responder.');
      
      // Local Mock Chatbot intelligence fallback
      let mockReply = `Hello! I'm Cris's AI assistant. I'm running in demo mode because the Gemini API key is not configured. However, I can share that Cris Charles Garcia is a ${settings.title} based in ${settings.location}. Feel free to contact him at ${settings.email}!`;
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('project') || lowerMsg.includes('work')) {
        mockReply = `Cris has worked on several featured projects including: ${projects.map(p => p.title).join(', ')}. You can check out the full list on the projects tab!`;
      } else if (lowerMsg.includes('skill') || lowerMsg.includes('tech') || lowerMsg.includes('stack')) {
        mockReply = `Cris is highly proficient in: ${skills.slice(0, 7).map(s => s.name).join(', ')}, and more!`;
      } else if (lowerMsg.includes('experience') || lowerMsg.includes('job') || lowerMsg.includes('company')) {
        mockReply = `Cris has experience working at companies like ${experience.map(e => e.company).join(' and ')} as a ${experience[0]?.role || 'Developer'}.`;
      }

      return new Response(
        JSON.stringify({ text: mockReply }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call Gemini API REST Endpoint
    // Using gemini-2.5-flash as the default model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...(history || []).map((h: any) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            })),
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ],
          systemInstruction: {
            parts: [{ text: context }]
          },
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Chat API] Gemini response error:', errText);
      return new Response(
        JSON.stringify({ message: 'Error calling Gemini AI API' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resJson = await response.json();
    const textReply = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that response. Please try again.";

    return new Response(
      JSON.stringify({ text: textReply }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Chat API] Exception:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
