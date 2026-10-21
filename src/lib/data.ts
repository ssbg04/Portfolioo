// Portfolio Data Layer (supports Sanity CMS with fallback to high-quality Mock data)
import { sanityClient, urlFor } from './sanity';

function cleanBadgeUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('images.credly.com/size/2048x2048/')) {
    return url.replace('/size/2048x2048/', '/size/340x340/');
  }
  return url;
}

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
  highlights?: string[];
}

export interface Skill {
  name: string;
  category: 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'DevOps' | 'AI/ML' | 'Tools' | 'Cybersecurity' | string;
  proficiency?: number; // optional (deprecated)
  icon?: string;
  order?: number;
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
  type?: 'certificate' | 'badge';
}

export function isDocumentCertificate(cert: Certification): boolean {
  if (cert.type === 'certificate') return true;
  if (cert.type === 'badge') return false;
  const title = (cert.title || '').toLowerCase();
  const url = (cert.badgeUrl || '').toLowerCase();
  const img = (cert.badgeImage || '').toLowerCase();
  if (url.includes('credly.com') || img.includes('credly.com') || img.includes('badge')) return false;
  return (
    title.includes('certificate') ||
    title.includes('nc2') ||
    title.includes('nc ii') ||
    title.includes('tesda') ||
    title.includes('diploma')
  );
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
  rating?: number;
}

export interface GalleryItem {
  id: string;
  title?: string;
  photo: string;
  description?: string;
  category?: string;
  order?: number;
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
  title: "Software Developer | Web, Mobile & Information Systems",
  valueProposition: "I build practical software applications, from user interfaces and REST APIs to database-driven information systems. My experience includes Flutter, Node.js, SQL databases, document processing, and application deployment.",
  isAvailable: true,
  availabilityStatus: "Available for new projects",
  biography: [
    "I am a senior IT student majoring in Software Development at Dalubhasaan ng Lungsod ng San Pablo. I write code to solve real-world problems in institutional records and business workflows.",
    "My primary focus includes Flutter multi-platform development, Node.js REST APIs, database modeling (SQLite/MySQL), and automated document processing with OCR."
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
  { platform: "LinkedIn", url: "https://www.linkedin.com/in/cris-charles-garcia/", icon: "linkedin", order: 2, showInHero: true, showInFooter: true, showInLinksPage: true },
  { platform: "Email", url: "mailto:crischarlesgarcia345@gmail.com", icon: "mail", order: 3, showInHero: true, showInFooter: true, showInLinksPage: true },
  { platform: "Facebook", url: "https://www.facebook.com/kristyarls345/", icon: "facebook", order: 4, showInHero: false, showInFooter: true, showInLinksPage: true },
  { platform: "TikTok", url: "https://www.tiktok.com/@sisibigi", icon: "tiktok", order: 5, showInHero: false, showInFooter: false, showInLinksPage: true }
];

export const mockSkills: Skill[] = [
  // Languages
  { name: "Dart", category: "Languages", icon: "fa-solid fa-code", order: 1 },
  { name: "TypeScript", category: "Languages", icon: "fa-brands fa-js", order: 2 },
  { name: "JavaScript", category: "Languages", icon: "fa-brands fa-js", order: 3 },
  { name: "PHP", category: "Languages", icon: "fa-brands fa-php", order: 4 },
  { name: "SQL", category: "Languages", icon: "fa-solid fa-database", order: 5 },
  { name: "Python", category: "Languages", icon: "fa-brands fa-python", order: 6 },

  // Frontend & Mobile
  { name: "Flutter", category: "Frontend & Mobile", icon: "fa-solid fa-mobile-screen-button", order: 1 },
  { name: "React", category: "Frontend & Mobile", icon: "fa-brands fa-react", order: 2 },
  { name: "Vite", category: "Frontend & Mobile", icon: "fa-solid fa-bolt", order: 3 },
  { name: "Tailwind CSS", category: "Frontend & Mobile", icon: "fa-brands fa-css3-alt", order: 4 },
  { name: "HTML5/CSS3", category: "Frontend & Mobile", icon: "fa-brands fa-html5", order: 5 },

  // Backend & APIs
  { name: "Node.js", category: "Backend & APIs", icon: "fa-brands fa-node-js", order: 1 },
  { name: "Express", category: "Backend & APIs", icon: "fa-solid fa-server", order: 2 },
  { name: "RESTful APIs", category: "Backend & APIs", icon: "fa-solid fa-network-wired", order: 3 },
  { name: "Socket.IO", category: "Backend & APIs", icon: "fa-solid fa-plug", order: 4 },
  { name: "JWT Authentication", category: "Backend & APIs", icon: "fa-solid fa-key", order: 5 },

  // Databases
  { name: "SQLite", category: "Databases", icon: "fa-solid fa-database", order: 1 },
  { name: "MySQL", category: "Databases", icon: "fa-solid fa-database", order: 2 },
  { name: "Database Modeling", category: "Databases", icon: "fa-solid fa-table", order: 3 },

  // Systems & Tools
  { name: "Git & GitHub", category: "Systems & Tools", icon: "fa-brands fa-github", order: 1 },
  { name: "Tesseract OCR", category: "Systems & Tools", icon: "fa-solid fa-file-lines", order: 2 },
  { name: "Inno Setup", category: "Systems & Tools", icon: "fa-brands fa-windows", order: 3 },
  { name: "Cybersecurity Basics", category: "Systems & Tools", icon: "fa-solid fa-shield-halved", order: 4 }
];

export const mockCertifications: Certification[] = [
  {
    id: "cert-tesda-nc2",
    code: "01",
    type: "certificate",
    title: "Computer Systems Servicing NC II",
    issuer: "TESDA",
    category: "Hardware & Systems",
    badgeImage: "/images/cert_nc2.jpg",
    badgeUrl: "https://www.tesda.gov.ph",
    description: "National qualification validating competency in computer systems installation, network and server configuration, hardware diagnostics, and preventive maintenance.",
    skills: ["System Installation", "Network Setup", "Server Administration", "Hardware Diagnostics"],
    featured: true,
    order: 1,
    issueDate: "2024-05-18"
  },
  {
    id: "cert-cisco-itn",
    code: "02",
    type: "certificate",
    title: "CCNA: Introduction to Networks (ITN)",
    issuer: "Cisco Networking Academy",
    category: "Networking",
    badgeImage: "/images/cert_cisco_itn.jpg",
    badgeUrl: "https://www.netacad.com",
    description: "Network architecture, IPv4/IPv6 addressing models, Ethernet switching, router configuration, and IP subnetting fundamentals.",
    skills: ["IPv4 / IPv6 Subnetting", "Cisco IOS", "Switching & Routing", "Network Security"],
    featured: true,
    order: 2,
    issueDate: "2023-11-14"
  },
  {
    id: "cert-hardware-basics",
    code: "03",
    type: "badge",
    title: "Computer Hardware Basics",
    issuer: "Cisco",
    category: "Hardware & Systems",
    badgeImage: "https://images.credly.com/images/19e742ef-13be-4d26-87ed-ac8f5fd0643c/linkedin_thumb_image.png",
    badgeUrl: "https://www.credly.com/badges/d2f0c176-2e45-4b99-88e2-fa9fb9ff34c6/public_url",
    description: "Hardware diagnostics, component installation, preventative maintenance, and troubleshooting tools.",
    skills: ["PC Architecture", "Component Diagnostics", "Hardware Assembly", "System Repair"],
    featured: true,
    order: 3
  },
  {
    id: "cert-endpoint-security",
    code: "04",
    type: "badge",
    title: "Endpoint Security",
    issuer: "Cisco",
    category: "Cybersecurity",
    badgeImage: "https://images.credly.com/images/0ca5f542-fb5e-4a22-9b7a-c1a1ce4c3db7/linkedin_thumb_EndpointSecurity.png",
    badgeUrl: "https://www.credly.com/badges/2aae16d4-b16c-474f-a84e-f06c330193cd/public_url",
    description: "Host and OS hardening, endpoint telemetry, malware detection, and defense-in-depth security principles.",
    skills: ["Endpoint Hardening", "Threat Telemetry", "OS Security", "Mitigation Protocols"],
    featured: true,
    order: 4
  },
  {
    id: "cert-intro-cybersecurity",
    code: "05",
    type: "badge",
    title: "Introduction to Cybersecurity",
    issuer: "Cisco",
    category: "Cybersecurity",
    badgeImage: "https://images.credly.com/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/linkedin_thumb_I2CS__1_.png",
    badgeUrl: "https://www.credly.com/badges/adc49a5e-87bb-4917-991d-a28160942c13/public_url",
    description: "Global threat landscape, vulnerability assessment methodologies, incident mitigation, and defensive cybersecurity operations.",
    skills: ["Threat Modeling", "Vulnerability Assessment", "Incident Response", "Network Defense"],
    featured: true,
    order: 5
  },
  {
    id: "cert-digital-awareness",
    code: "06",
    type: "badge",
    title: "Digital Awareness",
    issuer: "Cisco × OpenEDG",
    category: "Digital Literacy",
    badgeImage: "https://images.credly.com/images/29e7c859-4719-4081-a12f-6bdc073a43d2/linkedin_thumb_image.png",
    badgeUrl: "https://www.credly.com/badges/20ec510f-8325-483c-b16e-2ca00ae660ae/public_url",
    description: "Digital tools ecosystem, online safety protocols, data management, and ethical technology practices in modern computing.",
    skills: ["Digital Privacy", "Cyber Hygiene", "Content Ethics", "Security Best Practices"],
    featured: true,
    order: 6
  }
];

export const mockProjects: Project[] = [
  {
    title: "TIS Record Management System",
    slug: "tis-rms",
    category: "Desktop & Mobile System · OCR & Document Processing",
    status: "OPERATIONAL (LAN)",
    summary: "Institutional client-server records and transcript management platform with automated OCR data extraction and DepEd SF10 generation.",
    description: "Multi-platform client-server records system designed for local network deployment. Built with a Flutter client (Windows Desktop & Android) communicating with a Node.js REST API and local SQLite database, featuring bundled Tesseract OCR for physical document ingestion, DepEd School Form 10 (SF10) report compilation, and custom Windows installer via Inno Setup.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    technologies: ["Flutter", "Dart", "Node.js", "Express", "SQLite", "Tesseract OCR", "Inno Setup"],
    highlights: ["Offline-First LAN Architecture", "Tesseract OCR & Ghostscript Pipeline", "DepEd SF10 Automated Generator", "Inno Setup Windows Packaging"],
    repositoryUrl: "https://github.com/ssbg04/TIS_RMS",
    liveUrl: "https://web.tis-rms.cc.cd",
    featured: true,
    order: 1,
    publishedAt: "2026-04-26"
  },
  {
    title: "Isalin | Multi-Converter",
    slug: "isalin",
    category: "Web Application · Client-Side Utility",
    status: "LIVE PRODUCTION",
    summary: "High-performance multi-converter utility web application for instant, privacy-conscious file, text, and format transformations.",
    description: "Built to deliver instant, client-optimized conversion workflows with zero-latency transformations, responsive glass UI, keyboard shortcuts, and strict TypeScript safety. Operates entirely in-browser with zero server-side data leaks.",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    highlights: ["Zero-Latency In-Browser Processing", "Offline Support", "Responsive Bento UI", "Oxlint & Strict Typing"],
    repositoryUrl: "https://github.com/ssbg04/isal.in",
    liveUrl: "https://isal-in.vercel.app",
    featured: true,
    order: 2,
    publishedAt: "2026-10"
  },
  {
    title: "TindaGrid | Offline-First Retail Micro-ERP",
    slug: "tindagrid",
    category: "Mobile & Web PWA · Offline Micro-ERP",
    status: "IN DEVELOPMENT",
    summary: "Offline-first micro-ERP, retail POS, and crowdsourced telemetry platform engineered for Philippine neighborhood stores (sari-sari stores).",
    description: "Engineered to prevent transaction data loss in areas with volatile connectivity. Features a Flutter PWA with persistent storage (navigator.storage.persist()), service-worker offline caching, Soft UI Taglish design system, and a NestJS monorepo microservice backend.",
    coverImage: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80",
    technologies: ["Flutter", "Dart", "NestJS", "TypeScript", "PWA", "Riverpod"],
    highlights: ["Persistent Storage (PWA)", "Bilingual Taglish Soft UI", "NestJS Monorepo Architecture", "Offline-First Caching"],
    repositoryUrl: "https://github.com/ssbg04/tindagrid",
    liveUrl: "https://github.com/ssbg04/tindagrid",
    featured: true,
    order: 3,
    publishedAt: "2026-10"
  },
  {
    title: "Glimpse | Real-Time WebSockets Platform",
    slug: "glimpse",
    category: "Web Application · Real-Time Networking",
    status: "COMPLETED",
    summary: "Anonymous real-time peer matching and communication platform utilizing Socket.IO rooms and event-driven architecture.",
    description: "Event-driven real-time chat application demonstrating duplex WebSockets networking. Implemented FIFO user matchmaking queues for text and video channels, dynamic room lifecycle management, and connection telemetry.",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    technologies: ["Node.js", "Express", "Socket.IO", "WebSockets", "JavaScript"],
    highlights: ["Duplex WebSocket Protocol", "Automated Queue Matchmaking", "Room Lifecycle Routing"],
    repositoryUrl: "https://github.com/ssbg04/glimpse",
    liveUrl: "https://github.com/ssbg04/glimpse",
    featured: false,
    order: 4,
    publishedAt: "2025-11"
  },
  {
    title: "Susi | Mobile Credential Vault",
    slug: "susi",
    category: "Mobile Application · Security",
    status: "IN DEVELOPMENT",
    summary: "Offline-first mobile password and credential vault built with React Native, Expo Router, and glassmorphic aesthetics.",
    description: "Local encrypted credential management mobile application. Features biometric authentication hooks, hardware-backed secure storage, Expo Router file-based navigation, and native fluid visual feedback.",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    technologies: ["React Native", "Expo", "TypeScript", "Expo Router", "Tailwind CSS"],
    highlights: ["Biometric Authentication", "Encrypted Local Storage", "Native Glass UI"],
    repositoryUrl: "https://github.com/ssbg04/susi",
    liveUrl: "https://github.com/ssbg04/susi",
    featured: false,
    order: 5,
    publishedAt: "2026-09"
  },
  {
    title: "ICIS Supply/Inventory Management System",
    slug: "icis-inventory",
    category: "Enterprise Inventory System",
    status: "LIVE PRODUCTION",
    summary: "Institutional supply and asset tracking system streamlining stock level audits, equipment logistics, and reporting.",
    description: "Engineered to eliminate stock discrepancies, generate automated replenishment alerts, and maintain detailed ledger audits across departments.",
    coverImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    technologies: ["PHP", "MySQL", "JavaScript", "Tailwind CSS", "Docker"],
    highlights: ["Stock Level Telemetry", "Automated Reorder Alerts", "Multi-Warehouse Tracking"],
    repositoryUrl: "https://github.com/ssbg04/icis-inventory",
    liveUrl: "https://github.com/ssbg04/icis-inventory",
    featured: false,
    order: 6,
    publishedAt: "2026-05"
  }
];

export const mockExperience: Experience[] = [
  {
    company: "Talisay Integrated School",
    role: "Systems Developer / IT Programmer Intern",
    employmentType: "Internship",
    location: "Laguna, Philippines",
    startDate: "2025",
    endDate: "Present",
    description: [
      "Architected and deployed a multi-platform records management solution (TIS RMS) for campus administrative staff, digitizing physical student files.",
      "Engineered an automated document pipeline bundling Tesseract OCR & Ghostscript to extract Learner Reference Numbers (LRN) and academic marks from scanned documents.",
      "Designed an offline-first client-server LAN topology using Node.js as a persistent Windows Service with a local SQLite database to guarantee zero disruption during internet outages."
    ],
    technologies: ["Flutter", "Dart", "Node.js", "SQLite", "Tesseract OCR", "REST APIs"]
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

export const mockTestimonials: Testimonial[] = [];

export const mockGalleryItems: GalleryItem[] = [
  {
    id: "g-1",
    title: "TIS Records Management Demo",
    photo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    description: "Presenting the automated student and institutional record management system.",
    category: "Projects",
    order: 1
  },
  {
    id: "g-2",
    title: "Software Engineering Lab",
    photo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    description: "Database normalization and backend system architecture design sessions.",
    category: "Academics",
    order: 2
  },
  {
    id: "g-3",
    title: "Developer Workstation Setup",
    photo: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    description: "Daily development environment focused on clean code, TypeScript, and performance benchmarking.",
    category: "Personal",
    order: 3
  },
  {
    id: "g-4",
    title: "Cisco Networking & Security Milestones",
    photo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    description: "Cybersecurity assessment and hardware fundamentals credential demonstrations.",
    category: "Certificates",
    order: 4
  },
  {
    id: "g-5",
    title: "Campus Tech Colloquium",
    photo: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    description: "Participating in university technology showcase and developer symposia.",
    category: "Events",
    order: 5
  },
  {
    id: "g-6",
    title: "Collaborative Code Review",
    photo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    description: "Sprint planning and collaborative peer debugging sessions.",
    category: "Projects",
    order: 6
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
      heroImage: settings.heroImage ? urlFor(settings.heroImage, { width: 640, quality: 80 }) : undefined,
      heroImageNight: settings.heroImageNight ? urlFor(settings.heroImageNight, { width: 640, quality: 80 }) : undefined,
      logoImage: settings.logoImage ? urlFor(settings.logoImage, { width: 128, quality: 85 }) : mockSiteSettings.logoImage,
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
      icon: s.icon,
      order: s.order
    }));
  } catch (error) {
    console.error('Error fetching skill from Sanity:', error);
    return mockSkills;
  }
}

export async function getCertifications(featuredOnly = false): Promise<Certification[]> {
  try {
    if (!sanityClient) return featuredOnly ? mockCertifications.filter(c => c.featured) : mockCertifications;

    const query = featuredOnly
      ? `*[_type == "certification" && featured == true] | order(coalesce(order, 99) asc)`
      : `*[_type == "certification"] | order(coalesce(order, 99) asc)`;

    const certs = await sanityClient.fetch(query);

    if (!certs || certs.length === 0) return featuredOnly ? mockCertifications.filter(c => c.featured) : mockCertifications;

    return certs.map((c: any, idx: number) => ({
      id: c._id || `cert-${idx}`,
      code: c.code || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`),
      title: c.title || 'Certification',
      issuer: c.issuer || 'Credential Issuer',
      description: c.description || '',
      badgeImage: c.badgeImage ? urlFor(c.badgeImage, { width: 480, quality: 80 }) : cleanBadgeUrl(c.badgeImageUrl || ''),
      badgeUrl: c.badgeUrl || '#',
      category: c.category || 'General',
      skills: Array.isArray(c.skills) ? c.skills : [],
      issueDate: c.issueDate,
      featured: c.featured === true,
      order: typeof c.order === 'number' ? c.order : idx + 1,
      type: c.type || (
        c.badgeUrl?.includes('credly.com')
          ? 'badge'
          : (c.title?.toLowerCase().includes('badge') ? 'badge' : 'certificate')
      )
    }));
  } catch (error) {
    console.error('Error fetching certification from Sanity:', error);
    return featuredOnly ? mockCertifications.filter(c => c.featured) : mockCertifications;
  }
}

export async function getProjects(featuredOnly = false): Promise<Project[]> {
  try {
    if (!sanityClient) return featuredOnly ? mockProjects.filter(p => p.featured) : mockProjects;

    const query = featuredOnly
      ? `*[_type == "project" && featured == true] | order(coalesce(order, 99) asc)`
      : `*[_type == "project"] | order(coalesce(order, 99) asc)`;

    const projects = await sanityClient.fetch(query);

    if (!projects || projects.length === 0) return featuredOnly ? mockProjects.filter(p => p.featured) : mockProjects;

    return projects.map((p: any, idx: number) => ({
      title: p.title || 'Untitled Project',
      slug: p.slug?.current || (
        typeof p.slug === 'string'
          ? p.slug
          : p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `project-${idx}`
      ),
      summary: p.summary || p.description || '',
      description: p.description || p.summary || '',
      category: p.category || 'Software Project',
      status: p.status || 'LIVE PRODUCTION',
      coverImage: p.coverImage ? urlFor(p.coverImage, { width: 900, quality: 80 }) : undefined,
      gallery: Array.isArray(p.gallery)
        ? p.gallery.map((img: any) => urlFor(img, { width: 1200, quality: 80 })).filter(Boolean)
        : [],
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
      repositoryUrl: p.repositoryUrl,
      liveUrl: p.liveUrl,
      featured: p.featured === true,
      order: typeof p.order === 'number' ? p.order : idx + 1,
      publishedAt: p.publishedAt ? String(p.publishedAt) : '2026'
    }));
  } catch (error) {
    console.error('Error fetching projects from Sanity:', error);
    return featuredOnly ? mockProjects.filter(p => p.featured) : mockProjects;
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
    if (!sanityClient) return [];
    const testimonials = await sanityClient.fetch(`*[_type == "testimonial"] | order(coalesce(order, 99) asc)`);
    if (!testimonials || testimonials.length === 0) return [];
    return testimonials.map((t: any) => ({
      name: t.name,
      role: t.role,
      company: t.company,
      avatar: t.avatar ? urlFor(t.avatar, { width: 128, quality: 80 }) : undefined,
      quote: t.quote,
      relationship: t.relationship,
      rating: typeof t.rating === 'number' ? Math.min(5, Math.max(1, t.rating)) : 5
    }));
  } catch (error) {
    console.error('Error fetching testimonial from Sanity:', error);
    return [];
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    if (!sanityClient) return mockGalleryItems;
    const items = await sanityClient.fetch(`*[_type == "galleryItem"] | order(coalesce(order, 99) asc, _createdAt desc)`);
    if (!items || items.length === 0) return mockGalleryItems;
    return items.map((g: any) => ({
      id: g._id,
      title: g.title,
      photo: g.photo ? urlFor(g.photo, { width: 960, quality: 80 }) : (g.photoUrl || ''),
      description: g.description,
      category: g.category || 'General',
      order: g.order
    })).filter((item: GalleryItem) => Boolean(item.photo));
  } catch (error) {
    console.error('Error fetching gallery items from Sanity:', error);
    return mockGalleryItems;
  }
}
