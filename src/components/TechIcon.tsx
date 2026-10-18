import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReact,
  faNodeJs,
  faPhp,
  faPython,
  faJs,
  faSquareJs,
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
  faWordpress,
  faGoogle
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
  faNetworkWired,
  faRocket,
  faCubes
} from '@fortawesome/free-solid-svg-icons';

interface TechIconProps {
  name: string;
  icon?: string;
  className?: string;
}

export default function TechIcon({ name, icon, className = 'w-5 h-5' }: TechIconProps) {
  // Combine both name and Sanity icon string (e.g. "React" + "fa-brands fa-react")
  const n = `${name} ${icon || ''}`.toLowerCase().trim();

  // 1. Tailwind CSS
  if (n.includes('tailwind')) {
    return <FontAwesomeIcon icon={faTailwindCss} className={className} />;
  }

  // 2. TypeScript & JavaScript
  if (n.includes('typescript') || n === 'ts') {
    return <FontAwesomeIcon icon={faSquareJs} className={className} />;
  }
  if (n.includes('js') || n.includes('javascript')) {
    return <FontAwesomeIcon icon={faJs} className={className} />;
  }

  // 3. React Native & React
  if (n.includes('react native')) {
    return <FontAwesomeIcon icon={faMobileScreenButton} className={className} />;
  }
  if (n.includes('react')) {
    return <FontAwesomeIcon icon={faReact} className={className} />;
  }

  // 4. Node.js
  if (n.includes('node')) {
    return <FontAwesomeIcon icon={faNodeJs} className={className} />;
  }

  // 5. PHP & Laravel
  if (n.includes('laravel')) {
    return <FontAwesomeIcon icon={faLaravel} className={className} />;
  }
  if (n.includes('php')) {
    return <FontAwesomeIcon icon={faPhp} className={className} />;
  }

  // 6. Python
  if (n.includes('python')) {
    return <FontAwesomeIcon icon={faPython} className={className} />;
  }

  // 7. Docker
  if (n.includes('docker')) {
    return <FontAwesomeIcon icon={faDocker} className={className} />;
  }

  // 8. Git & GitHub
  if (n.includes('github')) {
    return <FontAwesomeIcon icon={faGithub} className={className} />;
  }
  if (n.includes('git')) {
    return <FontAwesomeIcon icon={faGitAlt} className={className} />;
  }

  // 9. Linux
  if (n.includes('linux')) {
    return <FontAwesomeIcon icon={faLinux} className={className} />;
  }

  // 10. Java
  if (n.includes('java')) {
    return <FontAwesomeIcon icon={faJava} className={className} />;
  }

  // 11. Rust & Go
  if (n.includes('rust')) {
    return <FontAwesomeIcon icon={faRust} className={className} />;
  }
  if (n.includes('golang') || n.includes('go')) {
    return <FontAwesomeIcon icon={faGolang} className={className} />;
  }

  // 12. Figma & WordPress
  if (n.includes('figma')) {
    return <FontAwesomeIcon icon={faFigma} className={className} />;
  }
  if (n.includes('wordpress')) {
    return <FontAwesomeIcon icon={faWordpress} className={className} />;
  }

  // 13. Vue & Angular
  if (n.includes('vue')) {
    return <FontAwesomeIcon icon={faVuejs} className={className} />;
  }
  if (n.includes('angular')) {
    return <FontAwesomeIcon icon={faAngular} className={className} />;
  }

  // 14. HTML5 & CSS3
  if (n.includes('html')) {
    return <FontAwesomeIcon icon={faHtml5} className={className} />;
  }
  if (n.includes('css')) {
    return <FontAwesomeIcon icon={faCss3Alt} className={className} />;
  }

  // 15. Bootstrap & Sass
  if (n.includes('bootstrap')) {
    return <FontAwesomeIcon icon={faBootstrap} className={className} />;
  }
  if (n.includes('sass') || n.includes('scss')) {
    return <FontAwesomeIcon icon={faSass} className={className} />;
  }

  // 16. Cloud Providers & DevOps Platforms
  if (n.includes('aws')) {
    return <FontAwesomeIcon icon={faAws} className={className} />;
  }
  if (n.includes('google cloud') || n.includes('gcp') || n.includes('google')) {
    return <FontAwesomeIcon icon={faGoogle} className={className} />;
  }
  if (n.includes('vercel')) {
    return <FontAwesomeIcon icon={faRocket} className={className} />;
  }
  if (n.includes('netlify')) {
    return <FontAwesomeIcon icon={faCloud} className={className} />;
  }
  if (n.includes('render')) {
    return <FontAwesomeIcon icon={faServer} className={className} />;
  }

  // 17. Database (MySQL, PostgreSQL, SQLite, Mongo, SQL)
  if (n.includes('sql') || n.includes('database') || n.includes('postgres') || n.includes('sqlite') || n.includes('mongo')) {
    return <FontAwesomeIcon icon={faDatabase} className={className} />;
  }

  // 18. Flutter & Mobile
  if (n.includes('flutter') || n.includes('mobile')) {
    return <FontAwesomeIcon icon={faMobileScreenButton} className={className} />;
  }

  // 19. Cybersecurity & Shield
  if (n.includes('secur') || n.includes('cyber') || n.includes('shield')) {
    return <FontAwesomeIcon icon={faShieldHalved} className={className} />;
  }

  // 20. Terminal / CLI / Bash
  if (n.includes('terminal') || n.includes('bash') || n.includes('cli')) {
    return <FontAwesomeIcon icon={faTerminal} className={className} />;
  }

  // 21. AI & Bots
  if (n.includes('ai') || n.includes('ml') || n.includes('bot')) {
    return <FontAwesomeIcon icon={faRobot} className={className} />;
  }

  // 22. Server & Networking
  if (n.includes('server')) {
    return <FontAwesomeIcon icon={faServer} className={className} />;
  }
  if (n.includes('network') || n.includes('telemetry') || n.includes('cisco')) {
    return <FontAwesomeIcon icon={faNetworkWired} className={className} />;
  }

  // 23. Generic Cloud
  if (n.includes('cloud')) {
    return <FontAwesomeIcon icon={faCloud} className={className} />;
  }

  // Default: Code
  return <FontAwesomeIcon icon={faCode} className={className} />;
}
