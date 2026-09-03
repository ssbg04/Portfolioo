// Portfolio Data Layer (supports Sanity CMS with fallback to high-quality Mock data)
import { sanityClient, urlFor } from './sanity';

export interface Project {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category?: string;
  status?: string;
  coverImage?: string;
  gallery?: string[];
  technologies: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  publishedAt: string;
}

export interface Skill {
  name: string;
  category: 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'DevOps' | 'AI/ML' | 'Tools' | 'Cybersecurity' | string;
  proficiency: number; // 0-100
  icon?: string;
}

export interface Certification {
  id: string;
  code: string;
  title: string;
  issuer: string;
  description: string;
  badgeImage: string;
  badgeUrl: string;
  category: string;
  skills: string[];
  issueDate?: string;
  featured?: boolean;
  order?: number;
}

export interface Experience {
  company: string;
  role: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate: string; // "Present" or date
  description: string[];
  technologies?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string;
  location?: string;
  achievements?: string[];
  order?: number;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar?: string;
  quote: string;
  relationship?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  order: number;
  showInHero?: boolean;
  showInFooter?: boolean;
  showInLinksPage?: boolean;
}

export interface SiteSettings {
  fullName: string;
  title: string;
  valueProposition: string;
  isAvailable?: boolean;
  availabilityStatus?: string;
  biography?: string[];
  heroImage?: string;
  heroImageNight?: string;
  logoImage?: string;
  email: string;
  location: string;
  resumeFile?: string;
  contactHeading?: string;
  contactSubtitle?: string;
  maintenanceMode?: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// ==========================================
// Fallback Mock Data
// ==========================================

export const mockSiteSettings: SiteSettings = {
  fullName: "Cris Charles Garcia",
  title: "Software Developer",
  valueProposition: "I am an IT student majoring in Software Development based in Laguna, Philippines. I focus on building reliable cross platforms applications with AI assisted.",
  isAvailable: true,
  availabilityStatus: "Available for new projects",
  biography: [
    "I am a senior IT student majoring in Software Development. I write code to solve real-world problems.",
    "My primary stack includes PHP, React, Node.js, and MySQL. I enjoy database design, front-end development, and bug fixing."
  ],
  email: "crischarlesgarcia345@gmail.com",
  location: "Laguna, Philippines",
  resumeFile: "/CV-Cris-Charles-Garcia.pdf",
  logoImage: "/logo.png",
  contactHeading: "Let's create something amazing.",
  contactSubtitle: "Whether you have a question, a project idea, or just want to say hi, my inbox is always open. I'll try my best to get back to you!",
  maintenanceMode: false,
  maintenanceTitle: "Please come back later.",
  maintenanceMessage: "The website is currently being refined and updated. You can still reach me directly through my channels below."
};

export const mockSocialLinks: SocialLink[] = [
  { platform: "GitHub", url: "https://github.com/ssbg04", icon: "github", order: 1, showInHero: true, showInFooter: true, showInLinksPage: true },
  { platform: "Facebook", url: "https://www.facebook.com/kristyarls345/", icon: "facebook", order: 2, showInHero: true, showInFooter: true, showInLinksPage: true },
  { platform: "TikTok", url: "https://www.tiktok.com/@sisibigi", icon: "tiktok", order: 3, showInHero: true, showInFooter: false, showInLinksPage: true },
  { platform: "Email", url: "mailto:crischarlesgarcia345@gmail.com", icon: "mail", order: 4, showInHero: true, showInFooter: true, showInLinksPage: true }
];

export const mockSkills: Skill[] = [
  { name: "HTML5/CSS3/JS", category: "Frontend", proficiency: 90 },
  { name: "React", category: "Frontend", proficiency: 85 },
  { name: "PHP", category: "Backend", proficiency: 85 },
  { name: "Node.js", category: "Backend", proficiency: 85 },
  { name: "Flutter", category: "Mobile", proficiency: 80 },
  { name: "MySQL", category: "Database", proficiency: 85 },
  { name: "Git & GitHub", category: "Tools", proficiency: 90 },
  { name: "Cybersecurity Basics", category: "Cybersecurity", proficiency: 80 }
];

export const mockCertifications: Certification[] = [
  {
    id: 'computer-hardware',
    code: '01',
    title: 'Computer Hardware Basics',
    issuer: 'Cisco',
    description: 'Hardware diagnostics, mobile device architectures, component installation, preventative maintenance, and troubleshooting tools.',
    badgeImage: 'https://images.credly.com/images/19e742ef-13be-4d26-87ed-ac8f5fd0643c/linkedin_thumb_image.png',
    badgeUrl: 'https://www.credly.com/badges/d2f0c176-2e45-4b99-88e2-fa9fb9ff34c6/public_url',
    category: 'Hardware & Systems',
    skills: ['PC Architecture', 'Component Diagnostics', 'Hardware Assembly', 'System Repair'],
    featured: true,
    order: 1
  },
  {
    id: 'digital-awareness',
    code: '02',
    title: 'Digital Awareness',
    issuer: 'Cisco × OpenEDG',
    description: 'Digital tools ecosystem, online safety protocols, data management, and ethical technology practices in modern computing.',
    badgeImage: 'https://images.credly.com/images/29e7c859-4719-4081-a12f-6bdc073a43d2/linkedin_thumb_image.png',
    badgeUrl: 'https://www.credly.com/badges/20ec510f-8325-483c-b16e-2ca00ae660ae/public_url',
    category: 'Digital Literacy',
    skills: ['Digital Privacy', 'Cyber Hygiene', 'Content Ethics', 'Security Best Practices'],
    featured: true,
    order: 2
  },
  {
    id: 'endpoint-security',
    code: '03',
    title: 'Endpoint Security',
    issuer: 'Cisco',
    description: 'Host and OS hardening, endpoint telemetry, malware detection, network segmentation, and defense-in-depth principles.',
    badgeImage: 'https://images.credly.com/images/0ca5f542-fb5e-4a22-9b7a-c1a1ce4c3db7/linkedin_thumb_EndpointSecurity.png',
    badgeUrl: 'https://www.credly.com/badges/2aae16d4-b16c-474f-a84e-f06c330193cd/public_url',
    category: 'Cybersecurity',
    skills: ['Endpoint Hardening', 'Threat Telemetry', 'OS Security', 'Mitigation Protocols'],
    featured: true,
    order: 3
  },
  {
    id: 'intro-cybersecurity',
    code: '04',
    title: 'Introduction to Cybersecurity',
    issuer: 'Cisco',
    description: 'Global threat landscape, vulnerability assessment methodologies, incident mitigation, and defensive cybersecurity operations.',
    badgeImage: 'https://images.credly.com/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/linkedin_thumb_I2CS__1_.png',
    badgeUrl: 'https://www.credly.com/badges/adc49a5e-87bb-4917-991d-a28160942c13/public_url',
    category: 'Cybersecurity',
    skills: ['Threat Modeling', 'Vulnerability Assessment', 'Incident Response', 'Network Defense'],
    featured: true,
    order: 4
  }
];

export const mockProjects: Project[] = [
  {
    title: "TIS Record Management System",
    slug: "tis-record-management-system",
    category: "System / Record Management",
    status: "LIVE PRODUCTION",
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
    employmentType: "Internship",
    location: "Laguna, Philippines",
    startDate: "2025",
    endDate: "Present",
    description: [
      "Engineered automated school record management solutions and optimized database queries.",
      "Collaborated with administration staff to digitize physical records and improve data retrieval speed."
    ],
    technologies: ["PHP", "MySQL", "JavaScript", "HTML/CSS"]
  }
];

export const mockEducation: Education[] = [
  {
    institution: "Laguna State Polytechnic University",
    degree: "Bachelor of Science in Information Technology",
    fieldOfStudy: "Major in Software Development",
    startDate: "2022",
    endDate: "2026",
    location: "Laguna, Philippines",
    achievements: [
      "Specialized in full-stack software development, database design, and systems architecture.",
      "Developed enterprise records and data management projects."
    ],
    order: 1
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    name: "Engr. Michael Reyes",
    role: "Department Coordinator",
    company: "Talisay Integrated School",
    quote: "Cris engineered our records management solution with exceptional precision. His database structure eliminated redundant paperwork and streamlined student profiling across the board.",
    relationship: "Internship Supervisor"
  },
  {
    name: "Prof. Alyssa Navarro",
    role: "Lead IT Faculty",
    company: "LSPU College of Computer Studies",
    quote: "One of the most dedicated developers in his cohort. Cris combines strong relational database skills with modern full-stack practices and always goes beyond basic requirements.",
    relationship: "Academic Instructor"
  },
  {
    name: "Jethro Hernandez",
    role: "Senior Full-Stack Engineer",
    company: "Collaborative Project",
    quote: "A dependable and proactive teammate. Cris writes clean, modular code, adapts rapidly to modern toolchains, and delivers rock-solid backend endpoints ahead of schedule.",
    relationship: "Project Partner"
  }
];

// ==========================================
// Sanity CMS Fetch Logic
// ==========================================

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    if (!sanityClient) return mockSiteSettings;
    const settings = await sanityClient.fetch(`*[_type == "siteSettings"][0]{
      ...,
      "resumeAssetUrl": resumeAsset.asset->url
    }`);
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

    const resumeResolved = settings.resumeAssetUrl || 
      (settings.resumeFile ? (typeof settings.resumeFile === 'string' ? settings.resumeFile : urlFor(settings.resumeFile)) : mockSiteSettings.resumeFile);

    return {
      fullName: settings.fullName || mockSiteSettings.fullName,
      title: settings.title || mockSiteSettings.title,
      valueProposition: settings.valueProposition || mockSiteSettings.valueProposition,
      isAvailable: settings.isAvailable ?? mockSiteSettings.isAvailable,
      availabilityStatus: settings.availabilityStatus || mockSiteSettings.availabilityStatus,
      biography: biography.length > 0 ? biography : mockSiteSettings.biography,
      heroImage: settings.heroImage ? urlFor(settings.heroImage) : undefined,
      heroImageNight: settings.heroImageNight ? urlFor(settings.heroImageNight) : undefined,
      logoImage: settings.logoImage ? urlFor(settings.logoImage) : mockSiteSettings.logoImage,
      email: settings.email || mockSiteSettings.email,
      location: settings.location || mockSiteSettings.location,
      resumeFile: resumeResolved,
      contactHeading: settings.contactHeading || mockSiteSettings.contactHeading,
      contactSubtitle: settings.contactSubtitle || mockSiteSettings.contactSubtitle,
      maintenanceMode: settings.maintenanceMode ?? mockSiteSettings.maintenanceMode,
      maintenanceTitle: settings.maintenanceTitle || mockSiteSettings.maintenanceTitle,
      maintenanceMessage: settings.maintenanceMessage || mockSiteSettings.maintenanceMessage,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription
    };
  } catch (error) {
    console.error('Error fetching siteSettings from Sanity:', error);
    return mockSiteSettings;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    if (!sanityClient) return mockSocialLinks;
    const links = await sanityClient.fetch(`*[_type == "socialLink"] | order(coalesce(order, 99) asc)`);
    if (!links || links.length === 0) return mockSocialLinks;
    return links.map((l: any, idx: number) => {
      const platformName = l.platform || 'Link';
      let iconKey = (l.icon && l.icon !== 'a' && l.icon !== '1') ? l.icon : platformName.toLowerCase();
      if (iconKey.includes('facebook')) iconKey = 'facebook';
      else if (iconKey.includes('github')) iconKey = 'github';
      else if (iconKey.includes('tiktok')) iconKey = 'tiktok';
      else if (iconKey.includes('linkedin')) iconKey = 'linkedin';
      else if (iconKey.includes('mail') || iconKey.includes('email')) iconKey = 'mail';

      return {
        platform: platformName,
        url: l.url || '#',
        icon: iconKey,
        order: typeof l.order === 'number' ? l.order : idx + 1,
        showInHero: l.showInHero ?? true,
        showInFooter: l.showInFooter ?? true,
        showInLinksPage: l.showInLinksPage ?? true
      };
    });
  } catch (error) {
    console.error('Error fetching socialLink from Sanity:', error);
    return mockSocialLinks;
  }
}

export async function getSkills(): Promise<Skill[]> {
  try {
    if (!sanityClient) return mockSkills;
    const skills = await sanityClient.fetch(`*[_type == "skill"] | order(coalesce(order, 99) asc)`);
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

export async function getCertifications(): Promise<Certification[]> {
  try {
    if (!sanityClient) return mockCertifications;
    const certs = await sanityClient.fetch(`*[_type == "certification"] | order(coalesce(order, 99) asc)`);
    if (!certs || certs.length === 0) return mockCertifications;
    return certs.map((c: any, idx: number) => {
      const badgeImg = c.badgeImage ? urlFor(c.badgeImage) : (c.badgeImageUrl || '');
      return {
        id: c._id || `cert-${idx}`,
        code: c.code || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`),
        title: c.title || 'Certification',
        issuer: c.issuer || 'Credential Issuer',
        description: c.description || '',
        badgeImage: badgeImg,
        badgeUrl: c.badgeUrl || '#',
        category: c.category || 'General',
        skills: Array.isArray(c.skills) ? c.skills : [],
        issueDate: c.issueDate,
        featured: c.featured ?? true,
        order: typeof c.order === 'number' ? c.order : idx + 1
      };
    });
  } catch (error) {
    console.error('Error fetching certification from Sanity:', error);
    return mockCertifications;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    if (!sanityClient) return mockProjects;
    const projects = await sanityClient.fetch(`*[_type == "project"] | order(coalesce(order, 99) asc)`);
    if (!projects || projects.length === 0) return mockProjects;
    return projects.map((p: any, idx: number) => {
      const slugVal = p.slug?.current || (typeof p.slug === 'string' ? p.slug : (p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `project-${idx}`));
      const gallery = Array.isArray(p.gallery) ? p.gallery.map((img: any) => urlFor(img)).filter(Boolean) : [];
      return {
        title: p.title || 'Untitled Project',
        slug: slugVal,
        summary: p.summary || p.description || '',
        description: p.description || p.summary || '',
        category: p.category || 'Software Project',
        status: p.status || 'LIVE PRODUCTION',
        coverImage: p.coverImage ? urlFor(p.coverImage) : undefined,
        gallery,
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
    if (!sanityClient) return mockExperience;
    const experience = await sanityClient.fetch(`*[_type == "experience"] | order(coalesce(order, 99) asc, startDate desc)`);
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
        employmentType: e.employmentType,
        location: e.location,
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

export async function getEducation(): Promise<Education[]> {
  try {
    if (!sanityClient) return mockEducation;
    const education = await sanityClient.fetch(`*[_type == "education"] | order(coalesce(order, 99) asc, startDate desc)`);
    if (!education || education.length === 0) return mockEducation;
    return education.map((ed: any, idx: number) => ({
      institution: ed.institution || 'Institution',
      degree: ed.degree || 'Degree',
      fieldOfStudy: ed.fieldOfStudy,
      startDate: ed.startDate ? String(ed.startDate) : '2022',
      endDate: ed.endDate ? String(ed.endDate) : 'Present',
      location: ed.location,
      achievements: Array.isArray(ed.achievements) ? ed.achievements : [],
      order: typeof ed.order === 'number' ? ed.order : idx + 1
    }));
  } catch (error) {
    console.error('Error fetching education from Sanity:', error);
    return mockEducation;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    if (!sanityClient) return mockTestimonials;
    const testimonials = await sanityClient.fetch(`*[_type == "testimonial"] | order(coalesce(order, 99) asc)`);
    if (!testimonials || testimonials.length === 0) return mockTestimonials;
    return testimonials.map((t: any) => ({
      name: t.name,
      role: t.role,
      company: t.company,
      avatar: t.avatar ? urlFor(t.avatar) : undefined,
      quote: t.quote,
      relationship: t.relationship
    }));
  } catch (error) {
    console.error('Error fetching testimonial from Sanity:', error);
    return mockTestimonials;
  }
}
