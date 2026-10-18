import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReact,
  faNodeJs,
  faPhp,
  faPython,
  faJs,
  faHtml5,
  faCss3Alt,
  faTailwindCss,
  faDocker,
  faGithub,
  faGitAlt,
  faLinux,
  faJava,
  faVuejs,
  faAngular,
  faBootstrap,
  faSass,
  faAws,
  faLaravel,
  faRust,
  faGolang,
  faFigma,
  faWordpress
} from '@fortawesome/free-brands-svg-icons';
import {
  faDatabase,
  faShieldHalved,
  faTerminal,
  faRobot,
  faMobileScreenButton,
  faCode,
  faCloud,
  faServer,
  faNetworkWired
} from '@fortawesome/free-solid-svg-icons';

interface TechIconProps {
  name: string;
  icon?: string;
  className?: string;
}

export default function TechIcon({ name, icon, className = 'w-5 h-5' }: TechIconProps) {
  // Combine both name and Sanity icon string (e.g. "React" + "fa-brands fa-react")
  const n = `${name} ${icon || ''}`.toLowerCase().trim();

  // 1. Tailwind CSS (Official FontAwesome v7 brand icon)
  if (n.includes('tailwind')) {
    return <FontAwesomeIcon icon={faTailwindCss} className={className} />;
  }

  // 2. TypeScript (Specific check before JavaScript)
  if (n.includes('typescript') || n === 'ts') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 3h20v18H2V3zm11.5 8.5h-2v6h2v-6zm-.5-1.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm7 5.5c-.3-.2-.8-.4-1.4-.4-.7 0-1.1.3-1.1.7 0 .4.4.6 1.2.9 1.3.5 2 1.1 2 2.2 0 1.4-1.1 2.3-2.8 2.3-.9 0-1.7-.2-2.3-.6l.5-1.5c.5.3 1.1.5 1.8.5.8 0 1.2-.3 1.2-.7 0-.4-.4-.6-1.3-.9-1.2-.5-1.9-1.1-1.9-2.1 0-1.4 1.1-2.2 2.6-2.2.8 0 1.5.2 2 .5l-.5 1.6z" />
      </svg>
    );
  }

  // 3. React Native (Specific check before React)
  if (n.includes('react native')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <ellipse cx="12" cy="12" rx="4.5" ry="2" />
        <ellipse cx="12" cy="12" rx="4.5" ry="2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="4.5" ry="2" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    );
  }

  // 4. React (FontAwesome brand icon)
  if (n.includes('react')) {
    return <FontAwesomeIcon icon={faReact} className={className} />;
  }

  // 5. Node.js (FontAwesome brand icon)
  if (n.includes('node')) {
    return <FontAwesomeIcon icon={faNodeJs} className={className} />;
  }

  // 6. PHP & Laravel (FontAwesome brand icons)
  if (n.includes('laravel')) {
    return <FontAwesomeIcon icon={faLaravel} className={className} />;
  }
  if (n.includes('php')) {
    return <FontAwesomeIcon icon={faPhp} className={className} />;
  }

  // 7. Python (FontAwesome brand icon)
  if (n.includes('python')) {
    return <FontAwesomeIcon icon={faPython} className={className} />;
  }

  // 8. Docker (FontAwesome brand icon)
  if (n.includes('docker')) {
    return <FontAwesomeIcon icon={faDocker} className={className} />;
  }

  // 9. Git / GitHub (FontAwesome brand icons)
  if (n.includes('github')) {
    return <FontAwesomeIcon icon={faGithub} className={className} />;
  }
  if (n.includes('git')) {
    return <FontAwesomeIcon icon={faGitAlt} className={className} />;
  }

  // 10. Linux (FontAwesome brand icon)
  if (n.includes('linux')) {
    return <FontAwesomeIcon icon={faLinux} className={className} />;
  }

  // 11. Java (FontAwesome brand icon)
  if (n.includes('java')) {
    return <FontAwesomeIcon icon={faJava} className={className} />;
  }

  // 12. Rust & Go (FontAwesome brand icons)
  if (n.includes('rust')) {
    return <FontAwesomeIcon icon={faRust} className={className} />;
  }
  if (n.includes('golang') || n.includes('go')) {
    return <FontAwesomeIcon icon={faGolang} className={className} />;
  }

  // 13. Figma & WordPress (FontAwesome brand icons)
  if (n.includes('figma')) {
    return <FontAwesomeIcon icon={faFigma} className={className} />;
  }
  if (n.includes('wordpress')) {
    return <FontAwesomeIcon icon={faWordpress} className={className} />;
  }

  // 14. Vue & Angular (FontAwesome brand icons)
  if (n.includes('vue')) {
    return <FontAwesomeIcon icon={faVuejs} className={className} />;
  }
  if (n.includes('angular')) {
    return <FontAwesomeIcon icon={faAngular} className={className} />;
  }

  // 15. Bootstrap & Sass (FontAwesome brand icons)
  if (n.includes('bootstrap')) {
    return <FontAwesomeIcon icon={faBootstrap} className={className} />;
  }
  if (n.includes('sass') || n.includes('scss')) {
    return <FontAwesomeIcon icon={faSass} className={className} />;
  }

  // 16. AWS (FontAwesome brand icon)
  if (n.includes('aws')) {
    return <FontAwesomeIcon icon={faAws} className={className} />;
  }

  // 17. HTML / HTML5 (FontAwesome brand icon)
  if (n.includes('html')) {
    return <FontAwesomeIcon icon={faHtml5} className={className} />;
  }

  // 18. CSS / CSS3 (FontAwesome brand icon)
  if (n.includes('css')) {
    return <FontAwesomeIcon icon={faCss3Alt} className={className} />;
  }

  // 19. JavaScript (FontAwesome brand icon)
  if (n.includes('js') || n.includes('javascript')) {
    return <FontAwesomeIcon icon={faJs} className={className} />;
  }

  // 20. Flutter / Mobile (FontAwesome solid icon)
  if (n.includes('flutter') || n.includes('mobile')) {
    return <FontAwesomeIcon icon={faMobileScreenButton} className={className} />;
  }

  // 21. Database / MySQL / SQL (FontAwesome solid icon)
  if (n.includes('mysql') || n.includes('sql') || n.includes('database') || n.includes('mongo')) {
    return <FontAwesomeIcon icon={faDatabase} className={className} />;
  }

  // 22. Security / Cyber / Shield (FontAwesome solid icon)
  if (n.includes('secur') || n.includes('cyber') || n.includes('shield')) {
    return <FontAwesomeIcon icon={faShieldHalved} className={className} />;
  }

  // 23. Terminal / CLI / Bash (FontAwesome solid icon)
  if (n.includes('terminal') || n.includes('bash') || n.includes('cli')) {
    return <FontAwesomeIcon icon={faTerminal} className={className} />;
  }

  // 24. AI / ML / Bot (FontAwesome solid icon)
  if (n.includes('ai') || n.includes('ml') || n.includes('bot')) {
    return <FontAwesomeIcon icon={faRobot} className={className} />;
  }

  // 25. Server & Networking (FontAwesome solid icons)
  if (n.includes('server')) {
    return <FontAwesomeIcon icon={faServer} className={className} />;
  }
  if (n.includes('network') || n.includes('telemetry') || n.includes('cisco')) {
    return <FontAwesomeIcon icon={faNetworkWired} className={className} />;
  }

  // 26. Vercel (Official brand vector)
  if (n.includes('vercel')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0l12-21.05 12 21.05z" />
      </svg>
    );
  }

  // 27. Netlify (Official brand vector)
  if (n.includes('netlify')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.49 19.09l.36.21 4.14 2.4 1.01.58.5-.29 4.14-2.4.36-.21v-.42V8.94v-.42l-.36-.21-4.14-2.4-.5-.29-1.01.58-4.14 2.4-.36.21v.42v10.15v.42zm5.51-11.97l3.65 2.11v7.54l-3.65 2.11-3.65-2.11V9.23l3.65-2.11z" />
      </svg>
    );
  }

  // 28. Render (Official brand vector)
  if (n.includes('render')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.98 9.53a8.03 8.03 0 00-6.1-5.46 8.08 8.08 0 00-7.39 2.53 8.04 8.04 0 00-2.47 5.74V20h4.43v-7.66c0-2.94 2.38-5.33 5.33-5.33 2.94 0 5.33 2.39 5.33 5.33V20h4.43v-7.66a8 8 0 00-3.56-2.81z" />
      </svg>
    );
  }

  // 29. Google Cloud / GCP (Official brand vector)
  if (n.includes('google cloud') || n.includes('gcp') || n.includes('google cloud console')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
      </svg>
    );
  }

  // 30. PostgreSQL / Postgres (Official brand vector)
  if (n.includes('postgres') || n.includes('postgresql')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16.93c-3.96-.46-7-3.83-7-7.93 0-4.41 3.59-8 8-8 1.84 0 3.53.63 4.88 1.68l-1.45 1.45A5.96 5.96 0 0014 5.5c-3.31 0-6 2.69-6 6 0 2.97 2.16 5.43 5 5.91v1.52z" />
      </svg>
    );
  }

  // 31. SQLite (Official brand vector)
  if (n.includes('sqlite')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }

  // 32. Generic Cloud (FontAwesome solid icon)
  if (n.includes('cloud')) {
    return <FontAwesomeIcon icon={faCloud} className={className} />;
  }

  // Default: Code (FontAwesome solid icon)
  return <FontAwesomeIcon icon={faCode} className={className} />;
}
