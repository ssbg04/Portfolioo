// Portfolio Data Layer (supports Sanity CMS with fallback to high-quality Mock data)
import { sanityClient, urlFor } from './sanity';

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
// Fallback Mock Data
// ==========================================

export const mockSiteSettings: SiteSettings = {
  fullName: "Cris Charles Garcia",
  title: "Software Developer",
  valueProposition: "I am an IT student majoring in Software Development based in Laguna, Philippines. I focus on building reliable cross platforms applications with AI assisted.",
  biography: [
    "I am a senior IT student majoring in Software Development. I write code to solve real-world problems.",
    "My primary stack includes PHP, React, Node.js, and MySQL. I enjoy database design, front-end development, and bug fixing."
  ],
  email: "crischarlesgarcia345@gmail.com",
  location: "Laguna, Philippines",
  resumeFile: "/CV-Cris-Charles-Garcia.pdf"
};

export const mockSocialLinks: SocialLink[] = [
  { platform: "GitHub", url: "https://github.com/ssbg04", icon: "github", order: 1 },
  { platform: "Facebook", url: "https://www.facebook.com/kristyarls345/", icon: "facebook", order: 2 },
  { platform: "TikTok", url: "https://www.tiktok.com/@sisibigi", icon: "tiktok", order: 3 },
  { platform: "Email", url: "mailto:crischarlesgarcia345@gmail.com", icon: "mail", order: 4 }
];

export const mockSkills: Skill[] = [
  { name: "HTML5/CSS3/JS", category: "Frontend", proficiency: 90 },
  { name: "Node.js", category: "Backend", proficiency: 85 },
  { name: "Flutter", category: "Mobile", proficiency: 80 },
  { name: "MySQL", category: "Database", proficiency: 85 }
];

export const mockProjects: Project[] = [
  {
    title: "TIS Record Management System",
    slug: "tis-record-management-system",
    summary: "Comprehensive record and student management platform engineered for institutional efficiency.",
    description: "Designed and built to streamline academic data, attendance records, and student profiles with secure role-based access and intuitive data dashboards.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    technologies: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
    repositoryUrl: "https://github.com/ssbg04",
    liveUrl: "https://github.com/ssbg04",
    featured: true,
    order: 1,
    publishedAt: "2026"
  }
];

export const mockExperience: Experience[] = [
  {
    company: "Talisay Integrated School",
    role: "Programmer",
    startDate: "2025",
    endDate: "Present",
    description: [
      "Engineered automated school record management solutions and optimized database queries.",
      "Collaborated with administration staff to digitize physical records and improve data retrieval speed."
    ],
    technologies: ["PHP", "MySQL", "JavaScript", "HTML/CSS"]
  }
];

// ==========================================
// Sanity CMS Fetch Logic
// ==========================================

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await sanityClient.fetch(`*[_type == "siteSettings"][0]`);
    if (!settings) return mockSiteSettings;

    // Handle biography whether stored as array of strings, single string, or block content
    let biography: string[] = [];
    if (Array.isArray(settings.biography)) {
      biography = settings.biography.flatMap((b: any) => 
        typeof b === 'string' ? b.split('\n\n').filter(Boolean) : [String(b)]
      );
    } else if (typeof settings.biography === 'string') {
      biography = settings.biography.split('\n\n').filter(Boolean);
    }

    return {
      fullName: settings.fullName || mockSiteSettings.fullName,
      title: settings.title || mockSiteSettings.title,
      valueProposition: settings.valueProposition || mockSiteSettings.valueProposition,
      biography: biography.length > 0 ? biography : mockSiteSettings.biography,
      heroImage: settings.heroImage ? urlFor(settings.heroImage) : undefined,
      email: settings.email || mockSiteSettings.email,
      location: settings.location || mockSiteSettings.location,
      resumeFile: settings.resumeFile 
        ? (typeof settings.resumeFile === 'string' ? settings.resumeFile : urlFor(settings.resumeFile)) 
        : mockSiteSettings.resumeFile
    };
  } catch (error) {
    console.error('Error fetching siteSettings from Sanity:', error);
    return mockSiteSettings;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const links = await sanityClient.fetch(`*[_type == "socialLink"] | order(coalesce(order, 99) asc)`);
    if (!links || links.length === 0) return mockSocialLinks;
    return links.map((l: any, idx: number) => ({
      platform: l.platform || 'Link',
      url: l.url || '#',
      icon: l.icon || (l.platform ? l.platform.toLowerCase() : 'link'),
      order: typeof l.order === 'number' ? l.order : idx + 1
    }));
  } catch (error) {
    console.error('Error fetching socialLink from Sanity:', error);
    return mockSocialLinks;
  }
}

export async function getSkills(): Promise<Skill[]> {
  try {
    const skills = await sanityClient.fetch(`*[_type == "skill"]`);
    if (!skills || skills.length === 0) return mockSkills;
    return skills.map((s: any) => ({
      name: s.name || 'Skill',
      category: s.category || 'Tools',
      proficiency: typeof s.proficiency === 'number' ? s.proficiency : 85,
      icon: s.icon
    }));
  } catch (error) {
    console.error('Error fetching skill from Sanity:', error);
    return mockSkills;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await sanityClient.fetch(`*[_type == "project"] | order(coalesce(order, 99) asc)`);
    if (!projects || projects.length === 0) return mockProjects;
    return projects.map((p: any, idx: number) => {
      const slugVal = p.slug?.current || (typeof p.slug === 'string' ? p.slug : (p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `project-${idx}`));
      return {
        title: p.title || 'Untitled Project',
        slug: slugVal,
        summary: p.summary || p.description || '',
        description: p.description || p.summary || '',
        coverImage: p.coverImage ? urlFor(p.coverImage) : undefined,
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        repositoryUrl: p.repositoryUrl,
        liveUrl: p.liveUrl,
        featured: p.featured ?? true,
        order: typeof p.order === 'number' ? p.order : idx + 1,
        publishedAt: p.publishedAt ? String(p.publishedAt) : '2026'
      };
    });
  } catch (error) {
    console.error('Error fetching project from Sanity:', error);
    return mockProjects;
  }
}

export async function getExperience(): Promise<Experience[]> {
  try {
    const experience = await sanityClient.fetch(`*[_type == "experience"] | order(startDate desc)`);
    if (!experience || experience.length === 0) return mockExperience;
    return experience.map((e: any) => {
      let desc: string[] = [];
      if (Array.isArray(e.description)) {
        desc = e.description.flatMap((d: any) => typeof d === 'string' ? d.split('\n\n').filter(Boolean) : [String(d)]);
      } else if (typeof e.description === 'string') {
        desc = e.description.split('\n\n').filter(Boolean);
      }
      return {
        company: e.company || 'Company',
        role: e.role || 'Developer',
        startDate: e.startDate ? String(e.startDate) : '2025',
        endDate: e.endDate ? String(e.endDate) : 'Present',
        description: desc.length > 0 ? desc : [e.company || 'Work history details'],
        technologies: Array.isArray(e.technologies) ? e.technologies : []
      };
    });
  } catch (error) {
    console.error('Error fetching experience from Sanity:', error);
    return mockExperience;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
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
