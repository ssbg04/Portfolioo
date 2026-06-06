import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Blog | Cris Charles Garcia",
  description: "Blog — Thoughts, tutorials, and notes on software development.",
};

export default async function BlogPage() {
  const { data: articleRows } = await supabase.from('articles').select('*').order('id', { ascending: false });

  return (
    <>
      <ScrollReveal>
        <div className="page-hero">
          <span className="section-label">Blog</span>
          <h1>My Thoughts</h1>
          <p className="subtitle">Tutorials, thoughts, and notes on software development.</p>
        </div>
      </ScrollReveal>

      <div className="section-divider"></div>

      <ScrollReveal>
        <section className="section-pad">
          <div className="blog-grid">
            {articleRows && articleRows.length > 0 ? articleRows.map((article, index) => (
              <article className="blog-card" key={index}>
                <div className="blog-meta">
                  <span className="blog-date">{article.date_published}</span>
                  <span className="blog-tag">{article.tag}</span>
                </div>
                <h3 className="blog-title">{article.title}</h3>
                <p className="blog-excerpt">{article.excerpt}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">Read Article →</a>
              </article>
            )) : <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No articles available.</p>}
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
