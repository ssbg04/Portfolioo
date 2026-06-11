import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import { ArticleCard } from "@/components/ClientCardModals";


export const metadata = {
  title: "Blog | Cris Charles Garcia",
  description: "Blog — Thoughts, tutorials, and notes on software development.",
};

export const dynamic = 'force-dynamic';

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
              <ArticleCard article={article} key={index} />
            )) : <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No articles available.</p>}
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
