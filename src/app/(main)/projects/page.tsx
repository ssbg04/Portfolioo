import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import FloatingBackButton from "@/components/FloatingBackButton";

export const metadata = {
  title: "All Projects | Cris Charles Garcia",
  description: "All Projects — A complete archive of apps, websites, and experiments built by Cris Charles Garcia.",
};

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const { data: projectRows } = await supabase.from('projects').select('*').order('id', { ascending: false });

  return (
    <>
      <FloatingBackButton />
      <ScrollReveal>
        <div className="page-hero">
          <span className="section-label">Projects</span>
          <h1>My Projects</h1>
          <p className="subtitle">A list of websites and software projects I have built.</p>
        </div>
      </ScrollReveal>

      <div className="section-divider"></div>

      <ScrollReveal>
        <section className="section-pad">
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
        </section>
      </ScrollReveal>
    </>
  );
}
