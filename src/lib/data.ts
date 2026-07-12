// Portfolio Data Layer (supports Sanity CMS with fallback to high-quality Mock data)

export interface Project {
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage?: string;
  technologies: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  publishedAt: string;
}

export interface Skill {
  name: string;
  category: 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'DevOps' | 'AI/ML' | 'Tools';
  proficiency: number; // 0-100
  icon?: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string; // "Present" or date
  description: string[];
  technologies?: string[];
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar?: string;
  quote: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  order: number;
}

export interface SiteSettings {
  fullName: string;
  title: string;
  valueProposition: string;
  biography?: string[];
  heroImage?: string;
  email: string;
  location: string;
  resumeFile?: string;
}

// ==========================================
// Mock Data (High-quality fallback content)
// ==========================================

export const mockSiteSettings: SiteSettings = {
  fullName: "Cris Charles Garcia",
  title: "Senior Full-Stack Engineer & AI Architect",
  valueProposition: "Crafting beautiful, high-performance interfaces and deploying intelligent agentic systems at scale.",
  biography: [
    "I am a senior full-stack developer who enjoys building fluid, responsive user interfaces and robust scalable backend APIs. Over the years, I've worked across different tech stacks, prioritizing performance, clean architectures, and modern engineering standards.",
    "Currently, I'm specializing in Astro, Next.js, and integrating large language models (LLMs) to create interactive agentic experiences."
  ],
  email: "crischarlesgarcia345@gmail.com",
  location: "Manila, Philippines",
  resumeFile: "#"
};

export const mockSocialLinks: SocialLink[] = [
  { platform: "GitHub", url: "https://github.com/crischarlesgarcia", icon: "github", order: 1 },
  { platform: "LinkedIn", url: "https://linkedin.com/in/crischarlesgarcia", icon: "linkedin", order: 2 },
  { platform: "Twitter", url: "https://twitter.com/crischarles", icon: "twitter", order: 3 },
  { platform: "Email", url: "mailto:crischarlesgarcia345@gmail.com", icon: "mail", order: 4 }
];

export const mockSkills: Skill[] = [
  // Frontend
  { name: "Astro", category: "Frontend", proficiency: 95 },
  { name: "React / Next.js", category: "Frontend", proficiency: 92 },
  { name: "TypeScript", category: "Frontend", proficiency: 90 },
  { name: "Tailwind CSS", category: "Frontend", proficiency: 95 },
  { name: "HTML5/CSS3/JS", category: "Frontend", proficiency: 98 },
  // Backend
  { name: "Node.js / Express", category: "Backend", proficiency: 88 },
  { name: "GraphQL / GROQ", category: "Backend", proficiency: 85 },
  { name: "FastAPI / Python", category: "Backend", proficiency: 80 },
  // Database
  { name: "PostgreSQL", category: "Database", proficiency: 85 },
  { name: "Supabase / Firebase", category: "Database", proficiency: 90 },
  { name: "MongoDB", category: "Database", proficiency: 82 },
  // DevOps
  { name: "Docker", category: "DevOps", proficiency: 75 },
  { name: "CI/CD (GitHub Actions)", category: "DevOps", proficiency: 80 },
  { name: "Vercel / Netlify / AWS", category: "DevOps", proficiency: 90 },
  // AI/ML
  { name: "Gemini API / LLMs", category: "AI/ML", proficiency: 88 },
  { name: "Prompt Engineering", category: "AI/ML", proficiency: 92 },
  { name: "LangChain / RAG", category: "AI/ML", proficiency: 80 }
];

export const mockProjects: Project[] = [
  {
    title: "QuantumAgent AI Chatbot",
    slug: "quantumagent-ai-chatbot",
    summary: "High-performance RAG-based AI customer support agent using Gemini and Supabase Vector DB.",
    description: "An advanced AI-powered chatbot capable of context-aware, structured retrieval using Pinecone/Supabase Vector Store. Employs stream processing for fast response rates and strict system prompt safety policies.",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&h=380&q=80",
    technologies: ["React", "TypeScript", "Gemini API", "Supabase", "Tailwind CSS"],
    repositoryUrl: "https://github.com/crischarlesgarcia/quantum-agent",
    liveUrl: "https://quantumagent.vercel.app",
    featured: true,
    order: 1,
    publishedAt: "2026-03-10"
  },
  {
    title: "NeuroGlass UI Kit",
    slug: "neuroglass-ui-kit",
    summary: "Premium design library focusing on material glassmorphism, responsive utilities, and fluid WebGL physics.",
    description: "A highly-optimized glassmorphic component library styled using dynamic Tailwind custom classes. Achieving 60fps on mobile via hardware-accelerated transforms and canvas-based micro-interactions.",
    coverImage: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&h=380&q=80",
    technologies: ["Astro", "Tailwind CSS", "React", "Framer Motion"],
    repositoryUrl: "https://github.com/crischarlesgarcia/neuroglass-ui",
    liveUrl: "https://neuroglass.dev",
    featured: true,
    order: 2,
    publishedAt: "2026-04-15"
  },
  {
    title: "Apex Analytics Platform",
    slug: "apex-analytics-platform",
    summary: "Real-time metric monitoring dashboard featuring live-streamed server charts, heatmaps, and anomalies detection.",
    description: "A powerful visual telemetry board showcasing microservices metrics. Written entirely in TypeScript, utilizing WebSockets for real-time visual delta rendering and custom SVG data representations.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&h=380&q=80",
    technologies: ["Next.js", "Node.js", "Chart.js", "Redis", "TypeScript"],
    repositoryUrl: "https://github.com/crischarlesgarcia/apex-analytics",
    liveUrl: "https://apex-telemetry.vercel.app",
    featured: true,
    order: 3,
    publishedAt: "2026-05-20"
  }
];

export const mockExperience: Experience[] = [
  {
    company: "Stellar AI Solutions",
    role: "Lead Full-Stack Developer",
    startDate: "2025-01",
    endDate: "Present",
    description: [
      "Architected responsive Next.js/Astro enterprise interfaces utilizing custom Tailwind utility structures.",
      "Engineered automated semantic data pipelines incorporating LLMs for automated CMS content tagging.",
      "Improved mobile web load performance (LCP) by 45% through aggressive bundle-shaking and client-side hydration gating."
    ],
    technologies: ["Astro", "React", "Node.js", "Gemini API", "Tailwind CSS"]
  },
  {
    company: "NovaTech Labs",
    role: "Senior Frontend Engineer",
    startDate: "2023-05",
    endDate: "2024-12",
    description: [
      "Designed and maintained custom component libraries based on Glassmorphic and Material Design principles.",
      "Spearheaded SEO and WCAG accessibility audits, resulting in standard-compliant (AA contrast) interfaces and 95+ score audits.",
      "Configured automatic Vercel preview deployment pipelines with automated Playwright visual testing."
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Astro", "Playwright"]
  }
];

// ==========================================
// Sanity CMS Fetch Logic (If Configured)
// ==========================================

import { sanityClient, urlFor } from './sanity';

const isSanityConfigured = () => {
  return !!sanityClient;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured() || !sanityClient) return mockSiteSettings;
  try {
    const settings = await sanityClient.fetch(`*[_type == "siteSettings"][0]`);
    if (!settings) return mockSiteSettings;
    return {
      fullName: settings.fullName || mockSiteSettings.fullName,
      title: settings.title || mockSiteSettings.title,
      valueProposition: settings.valueProposition || mockSiteSettings.valueProposition,
      biography: settings.biography || mockSiteSettings.biography,
      heroImage: settings.heroImage ? urlFor(settings.heroImage) : undefined,
      email: settings.email || mockSiteSettings.email,
      location: settings.location || mockSiteSettings.location,
      resumeFile: settings.resumeFile ? (typeof settings.resumeFile === 'string' ? settings.resumeFile : urlFor(settings.resumeFile)) : mockSiteSettings.resumeFile
    };
  } catch (error) {
    console.error('Error fetching siteSettings from Sanity:', error);
    return mockSiteSettings;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (!isSanityConfigured() || !sanityClient) return mockSocialLinks.sort((a, b) => a.order - b.order);
  try {
    const links = await sanityClient.fetch(`*[_type == "socialLink"] | order(order asc)`);
    if (!links || links.length === 0) return mockSocialLinks;
    return links.map((l: any) => ({
      platform: l.platform,
      url: l.url,
      icon: l.icon || 'link',
      order: l.order || 0
    }));
  } catch (error) {
    console.error('Error fetching socialLink from Sanity:', error);
    return mockSocialLinks;
  }
}

export async function getSkills(): Promise<Skill[]> {
  if (!isSanityConfigured() || !sanityClient) return mockSkills;
  try {
    const skills = await sanityClient.fetch(`*[_type == "skill"]`);
    if (!skills || skills.length === 0) return mockSkills;
    return skills.map((s: any) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency || 0,
      icon: s.icon
    }));
  } catch (error) {
    console.error('Error fetching skill from Sanity:', error);
    return mockSkills;
  }
}

export async function getProjects(): Promise<Project[]> {
  if (!isSanityConfigured() || !sanityClient) return mockProjects.sort((a, b) => a.order - b.order);
  try {
    const projects = await sanityClient.fetch(`*[_type == "project"] | order(order asc)`);
    if (!projects || projects.length === 0) return mockProjects;
    return projects.map((p: any) => ({
      title: p.title,
      slug: p.slug?.current || p.slug,
      summary: p.summary,
      description: p.description,
      coverImage: p.coverImage ? urlFor(p.coverImage) : undefined,
      technologies: p.technologies || [],
      repositoryUrl: p.repositoryUrl,
      liveUrl: p.liveUrl,
      featured: p.featured || false,
      order: p.order || 0,
      publishedAt: p.publishedAt || ''
    }));
  } catch (error) {
    console.error('Error fetching project from Sanity:', error);
    return mockProjects;
  }
}

export async function getExperience(): Promise<Experience[]> {
  if (!isSanityConfigured() || !sanityClient) return mockExperience;
  try {
    const experience = await sanityClient.fetch(`*[_type == "experience"] | order(startDate desc)`);
    if (!experience || experience.length === 0) return mockExperience;
    return experience.map((e: any) => ({
      company: e.company,
      role: e.role,
      startDate: e.startDate,
      endDate: e.endDate || 'Present',
      description: e.description || [],
      technologies: e.technologies || []
    }));
  } catch (error) {
    console.error('Error fetching experience from Sanity:', error);
    return mockExperience;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSanityConfigured() || !sanityClient) return [];
  try {
    const testimonials = await sanityClient.fetch(`*[_type == "testimonial"]`);
    if (!testimonials || testimonials.length === 0) return [];
    return testimonials.map((t: any) => ({
      name: t.name,
      role: t.role,
      company: t.company,
      avatar: t.avatar ? urlFor(t.avatar) : undefined,
      quote: t.quote
    }));
  } catch (error) {
    console.error('Error fetching testimonial from Sanity:', error);
    return [];
  }
}
