import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import FloatingBackButton from "@/components/FloatingBackButton";

export const metadata = {
  title: "All Certifications | Cris Charles Garcia",
  description: "Certifications — A collection of my professional certificates and courses.",
};

export const dynamic = 'force-dynamic';

export default async function CertificationsPage() {
  const { data: certRows } = await supabase.from('certifications').select('*').order('id', { ascending: false });

  return (
    <>
      <FloatingBackButton />
      <ScrollReveal>
        <div className="page-hero">
          <span className="section-label">Certifications</span>
          <h1>My Certifications</h1>
          <p className="subtitle">A complete list of my professional certificates and courses.</p>
        </div>
      </ScrollReveal>

      <div className="section-divider"></div>

      <ScrollReveal>
        <section className="section-pad">
          <div className="cert-grid">
            {certRows && certRows.length > 0 ? certRows.map((cert, index) => (
              <div className="cert-card" key={index}>
                <div className="cert-icon">{cert.icon || "🎓"}</div>
                <div className="cert-info">
                  <h3>{cert.title}</h3>
                  <p className="issuer">{cert.issuer}</p>
                  <span className="date">Issued {cert.date_issued}</span>
                </div>
              </div>
            )) : <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No certifications available.</p>}
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
