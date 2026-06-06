import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";

export default async function Home() {
  const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || "";

  // Check if Supabase is actually configured
  const isDummy = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co') === 'https://dummy.supabase.co';

  let settingsRows = null;
  let techStackRows = null;
  let projectRows = null;
  let certRows = null;
  let articleRows = null;

  if (!isDummy) {
    // Fetch Settings
    const resSettings = await supabase.from('settings').select('*').eq('id', 1).single();
    settingsRows = resSettings.data;

    // Fetch Tech Stack
    const resTech = await supabase.from('techstack').select('tech_name').order('id', { ascending: true });
    techStackRows = resTech.data;

    // Fetch Projects (Limit 3)
    const resProj = await supabase.from('projects').select('*').order('id', { ascending: false }).limit(3);
    projectRows = resProj.data;

    // Fetch Certifications (Limit 3)
    const resCert = await supabase.from('certifications').select('*').order('id', { ascending: false }).limit(3);
    certRows = resCert.data;

    // Fetch Articles (Limit 3)
    const resArt = await supabase.from('articles').select('*').order('id', { ascending: false }).limit(3);
    articleRows = resArt.data;
  }

  const settings = settingsRows || {
    about_text_1: 'I am a senior IT student majoring in Software Development. I write code to solve real-world problems.',
    about_text_2: 'My primary stack includes PHP, React, Node.js, and MySQL. I enjoy database design, front-end development, and bug fixing.',
    years_coding: '3+',
    projects_count: '10+',
    certifications_count: '6+',
    tiktok_url: 'https://www.tiktok.com/@crischarlesgarcia',
    facebook_url: 'https://facebook.com/kristyarls345',
    instagram_url: 'https://instagram.com/crischarlesgarcia',
    linkedin_url: 'https://www.linkedin.com/in/cris-charles-garcia-187415303',
    github_url: 'https://github.com/ssbg04'
  };

  const techStack = techStackRows ? techStackRows.map(r => r.tech_name) : [];

  return (
    <>
      {/* ===== HERO ===== */}
      <ScrollReveal>
        <header className="hero">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="dot"></span>
              Available for work
            </div>
            <span style={{ display: "block", color: "var(--text-muted)", fontSize: "1rem", fontWeight: 500, marginBottom: "10px" }}>
              Hi, I am Cris Charles Garcia.
            </span>
            <h1>Software <span className="highlight">Developer</span>.</h1>
            <p className="subtitle">
              I am an IT student majoring in Software Development based in Laguna, Philippines. I focus on building reliable web applications.
            </p>
            <div className="hero-btns">
              <Link href="#projects" className="btn primary" id="btn-view-projects">My Projects ↗</Link>
              <Link href="#contact" className="btn secondary" id="btn-get-in-touch">Contact Me</Link>
            </div>
          </div>
          <div className="hero-img-container">
            <div className="img-ring"></div>
            <img src="/assets/img/pp-night.webp" alt="Cris Charles Garcia" className="profile-pic img-night-normal" />
            <img src="/assets/img/pp-night-shy.webp" alt="Cris Charles Garcia" className="profile-pic img-night-hover" />
            <img src="/assets/img/pp-day.webp" alt="Cris Charles Garcia" className="profile-pic img-day-normal" />
            <img src="/assets/img/pp-day-shy.webp" alt="Cris Charles Garcia" className="profile-pic img-day-hover" />
            <div className="glow-effect"></div>
          </div>
        </header>
      </ScrollReveal>

      <div className="section-divider"></div>

      {/* ===== ABOUT ===== */}
      <ScrollReveal>
        <section id="about" className="section-pad">
          <div className="section-header">
            <span className="section-label">About Me</span>
            <h2 className="section-title">About Me</h2>
          </div>
          <div className="about-content">
            <div className="about-text">
              <p>{settings.about_text_1}</p>
              <p>{settings.about_text_2}</p>
            </div>
            <div className="tech-stack">
              <h3>Tech Stack</h3>
              <div className="tags">
                {techStack.length > 0 ? (
                  techStack.map((tech, index) => (
                    <span key={index}>{tech}</span>
                  ))
                ) : (
                  <p>No tech stack found.</p>
                )}
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">{settings.years_coding}</div>
              <div className="stat-label">Years Coding</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{settings.projects_count}</div>
              <div className="stat-label">Projects Built</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{settings.certifications_count}</div>
              <div className="stat-label">Certifications</div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="section-divider"></div>

      {/* ===== PROJECTS ===== */}
      <ScrollReveal>
        <section id="projects" className="section-pad">
          <div className="section-header">
            <span className="section-label">Projects</span>
            <h2 className="section-title">Recent Projects</h2>
          </div>
          <div className="project-grid">
            {projectRows && projectRows.length > 0 ? projectRows.map((project, index) => (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-card" key={index}>
                <div className="card-img">
                  <img src={project.img_url || undefined} alt={project.title} loading="lazy" />
                  <div className="card-img-overlay"></div>
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h3>{project.title}</h3>
                    <span className="arrow-icon">↗</span>
                  </div>
                  <p>{project.des}</p>
                  <div className="stack-badges">
                    {project.techstack ? project.techstack.split(',').map((tag: string) => tag.trim()).map((tag: string, i: number) => (
                      <span className="stack-badge" key={i}>{tag}</span>
                    )) : null}
                  </div>
                </div>
              </a>
            )) : <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No projects available.</p>}
          </div>
          <div className="view-all-container">
            <Link href="/projects" className="btn secondary" id="btn-all-projects">All Projects →</Link>
          </div>
        </section>
      </ScrollReveal>

      <div className="section-divider"></div>

      {/* ===== CERTIFICATIONS ===== */}
      <ScrollReveal>
        <section id="certificates" className="section-pad">
          <div className="section-header">
            <span className="section-label">Certifications</span>
            <h2 className="section-title">My Certifications</h2>
          </div>
          <div className="cert-grid">
            {certRows && certRows.length > 0 ? certRows.map((cert, index) => (
              <div className="cert-card" key={index}>
                <div className="cert-icon">{cert.icon || "🏆"}</div>
                <div className="cert-info">
                  <h3>{cert.title}</h3>
                  <p className="issuer">{cert.issuer}</p>
                  <span className="date">Issued {cert.date_issued}</span>
                </div>
              </div>
            )) : <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No certifications available.</p>}
          </div>
          <div className="view-all-container">
            <Link href="/certifications" className="btn secondary" id="btn-all-certs">All Certifications →</Link>
          </div>
        </section>
      </ScrollReveal>

      <div className="section-divider"></div>

      {/* ===== BLOG ===== */}
      <ScrollReveal>
        <section id="blog" className="section-pad">
          <div className="section-header">
            <span className="section-label">Articles</span>
            <h2 className="section-title">Latest Articles</h2>
          </div>
          <div className="blog-grid">
            {articleRows && articleRows.length > 0 ? articleRows.map((article, index) => (
              <article className="blog-card" key={index}>
                <div className="blog-meta">
                  <span className="blog-date">{article.date_published}</span>
                  {article.tag && <span className="blog-tag">{article.tag}</span>}
                </div>
                <h3 className="blog-title">{article.title}</h3>
                <p className="blog-excerpt">{article.excerpt}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">Read Article →</a>
              </article>
            )) : <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No articles available.</p>}
          </div>
          <div className="view-all-container">
            <Link href="/blog" className="btn secondary" id="btn-all-articles">All Articles →</Link>
          </div>
        </section>
      </ScrollReveal>

      <div className="section-divider"></div>

      {/* ===== CONTACT ===== */}
      <ScrollReveal>
        <section id="contact" className="section-pad">
          <div className="section-header" style={{ textAlign: "center" }}>
            <span className="section-label">Contact</span>
            <h2 className="section-title">Get in Touch</h2>
          </div>
          <div className="contact-container">
            <p>Feel free to reach out if you have a project idea, a job opportunity, or any questions.</p>

            <div className="social-links">
              {settings.github_url && (
                <a href={settings.github_url} target="_blank" className="social-btn" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" className="social-btn" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" className="social-btn" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" className="social-btn" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {settings.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" className="social-btn" aria-label="TikTok">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                </a>
              )}
            </div>

            <form action="/api/contact" method="POST" className="email-form" id="contact-form">
              <input type="text" name="name" id="form-name" placeholder="Name" required />
              <input type="email" name="email" id="form-email" placeholder="Your Email" required />
              <input type="text" name="subject" id="form-subject" placeholder="Subject" required />
              <textarea name="message" id="form-message" rows={5} placeholder="Message" required></textarea>
              
              {/* reCAPTCHA v3 / Enterprise implementation */}
              <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response" />
              <script src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`} async defer></script>
              <script dangerouslySetInnerHTML={{ __html: `
                document.addEventListener('DOMContentLoaded', function() {
                  var form = document.getElementById('contact-form');
                  if (form) {
                    form.addEventListener('submit', function(event) {
                      event.preventDefault(); // Stop normal submission
                      var btn = document.getElementById('btn-send-message');
                      var originalText = btn.innerText;
                      btn.innerText = 'Verifying...';
                      btn.disabled = true;
                      
                      grecaptcha.enterprise.ready(async function() {
                        try {
                          const token = await grecaptcha.enterprise.execute('${recaptchaSiteKey}', {action: 'submit'});
                          document.getElementById('g-recaptcha-response').value = token;
                          form.submit(); // Now submit the form manually
                        } catch(err) {
                          btn.innerText = originalText;
                          btn.disabled = false;
                          alert('reCAPTCHA failed to load. Please try again.');
                        }
                      });
                    });
                  }
                });
              `}} />

              <button type="submit" className="btn primary full-width" id="btn-send-message">Send Message</button>
            </form>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
