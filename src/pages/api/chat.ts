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
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ text: 'Please enter a keyword or inquiry to search.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const query = message.trim().toLowerCase();

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
      reply = `**Featured Projects:**\n\n` +
        topProjects.map(p => `• **${p.title}**: ${p.summary} (Tech: ${p.technologies.slice(0, 4).join(', ')})`).join('\n\n') +
        `\n\n*You can explore all full case studies in the [Projects](/projects) section.*`;

    } else if (query.includes('skill') || query.includes('tech') || query.includes('stack') || query.includes('language') || query.includes('framework') || query.includes('tool')) {
      const categories = Array.from(new Set(skills.map(s => s.category || 'Core')));
      reply = `**Technologies & Core Stack:**\n\n` +
        categories.map(cat => {
          const catSkills = skills.filter(s => (s.category || 'Core') === cat).map(s => s.name);
          return `• **${cat}**: ${catSkills.join(', ')}`;
        }).join('\n') +
        `\n\n*Review the full interactive matrix in the [Skills Matrix](/#skills).*`;

    } else if (query.includes('experience') || query.includes('job') || query.includes('career') || query.includes('intern') || query.includes('role')) {
      reply = `**Professional Experience:**\n\n` +
        experience.map(e => `• **${e.role}** at **${e.company}** (${e.startDate} — ${e.endDate})\n  ${e.description?.[0] || 'Full-stack software engineering and database administration.'}`).join('\n\n');

    } else if (query.includes('education') || query.includes('degree') || query.includes('college') || query.includes('school') || query.includes('lspu') || query.includes('academic')) {
      reply = `**Academic Background:**\n\n` +
        education.map(ed => `• **${ed.degree}** (${ed.fieldOfStudy || 'IT'})\n  ${ed.institution} (${ed.startDate} — ${ed.endDate})`).join('\n\n');

    } else if (query.includes('cert') || query.includes('badge') || query.includes('cisco') || query.includes('credential')) {
      reply = `**Verified Certifications:**\n\n` +
        certifications.slice(0, 4).map(c => `• **${c.title}** — Issued by ${c.issuer}`).join('\n') +
        `\n\n*Check the verified Credly links on the [Certifications](/certifications) page.*`;

    } else if (query.includes('contact') || query.includes('email') || query.includes('reach') || query.includes('hire') || query.includes('call') || query.includes('message')) {
      reply = `**Get in Touch with Cris:**\n\n` +
        `• **Email:** [${settings.email || 'crischarlesgarcia345@gmail.com'}](mailto:${settings.email || 'crischarlesgarcia345@gmail.com'})\n` +
        `• **Location:** ${settings.location || 'Laguna, Philippines'}\n` +
        `• **Status:** ${settings.statusIndicator || 'Open for technical opportunities'}\n\n` +
        `Feel free to send a message directly using the [Contact Form](/contact).`;

    } else if (query.includes('testimonial') || query.includes('recommend') || query.includes('review') || query.includes('feedback')) {
      const topT = testimonials[0];
      reply = `**Client & Peer Endorsement:**\n\n` +
        `"${topT.quote}"\n\n— **${topT.name}**, ${topT.role} (${topT.company})\n\n` +
        `*Read more verified endorsements in the [Testimonials](/#testimonials) section.*`;

    } else if (query.includes('who') || query.includes('about') || query.includes('cris') || query.includes('intro') || query.includes('hello') || query.includes('hi')) {
      reply = `**Hello! I am the Portfolio Assistant for ${settings.fullName}.**\n\n` +
        `${settings.fullName} is a **${settings.title}** based in ${settings.location}.\n\n` +
        `*${settings.valueProposition || 'Engineering accessible web platforms and resilient backend services.'}*\n\n` +
        `You can ask me about:\n` +
        `• *"What are Cris's main skills?"*\n` +
        `• *"Show me featured projects"*\n` +
        `• *"Work experience and internship"*\n` +
        `• *"Certifications and education"*\n` +
        `• *"How to contact Cris"*`;

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
        let result = `**Search results for "${query}":**\n\n`;
        if (matchedProjects.length > 0) {
          result += `**Projects:**\n` + matchedProjects.map(p => `• **${p.title}**: ${p.summary}`).join('\n') + '\n\n';
        }
        if (matchedSkills.length > 0) {
          result += `**Relevant Skills:** ` + matchedSkills.map(s => s.name).join(', ') + '\n\n';
        }
        reply = result;
      } else {
        reply = `I couldn't find an exact match for **"${query}"**.\n\n` +
          `Try searching for one of these topics:\n` +
          `• **Skills** (e.g. React, Node.js, MySQL)\n` +
          `• **Projects** (e.g. TIS, Portfolio)\n` +
          `• **Experience** or **Education**\n` +
          `• **Certifications**\n` +
          `• **Contact Info**`;
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
