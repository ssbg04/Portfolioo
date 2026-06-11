"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Helper component for Portal
function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

// --- Project Card & Modal ---
export function ProjectCard({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="project-card" onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
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
      </div>

      {isOpen && (
        <ModalPortal>
          <div className="custom-modal-overlay" onClick={() => setIsOpen(false)} style={{ zIndex: 9999 }}>
            <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="custom-modal-header">
                <h2>{project.title}</h2>
                <button className="custom-modal-close" onClick={() => setIsOpen(false)}>×</button>
              </div>
              <div className="custom-modal-body">
                <img src={project.img_url || undefined} alt={project.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
                <p>{project.des}</p>
                
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: 'var(--text-light)', marginBottom: '10px' }}>Tech Stack</h4>
                  <div className="stack-badges">
                    {project.techstack ? project.techstack.split(',').map((tag: string) => tag.trim()).map((tag: string, i: number) => (
                      <span className="stack-badge" key={i}>{tag}</span>
                    )) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {project.live_demo_url ? (
                    <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="btn primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      Live Demo ↗
                    </a>
                  ) : project.url ? (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      Live Demo ↗
                    </a>
                  ) : (
                    <button className="btn secondary" disabled>No Live Demo</button>
                  )}
                  
                  {project.repo_url && (
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      View Repository ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

// --- Article Card & Modal ---
export function ArticleCard({ article }: { article: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <article className="blog-card" onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
        <div className="blog-meta">
          <span className="blog-date">{article.date_published}</span>
          {article.tag && <span className="blog-tag">{article.tag}</span>}
        </div>
        <h3 className="blog-title">{article.title}</h3>
        <p className="blog-excerpt">{article.excerpt}</p>
        <span className="read-more">Read Article →</span>
      </article>

      {isOpen && (
        <ModalPortal>
          <div className="custom-modal-overlay" onClick={() => setIsOpen(false)} style={{ zIndex: 9999 }}>
            <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="custom-modal-header">
                <h2>{article.title}</h2>
                <button className="custom-modal-close" onClick={() => setIsOpen(false)}>×</button>
              </div>
              <div className="custom-modal-body">
                <div className="blog-meta" style={{ marginBottom: '16px' }}>
                  <span className="blog-date">{article.date_published}</span>
                  {article.tag && <span className="blog-tag">{article.tag}</span>}
                </div>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-light)' }}>{article.excerpt}</p>
                
                <div style={{ marginTop: '24px' }}>
                  {article.url && article.url !== "#" ? (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      Read Full Article ↗
                    </a>
                  ) : (
                    <button className="btn secondary" disabled>Article link unavailable</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

// --- Certification Card & Modal ---
export function CertCard({ cert }: { cert: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="cert-card" onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
        {cert.img_url ? (
          <div style={{ width: '60px', height: '60px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--card-bg)', flexShrink: 0 }}>
            <img src={cert.img_url} alt={cert.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div className="cert-icon">{cert.icon?.includes('fa-') ? <i className={cert.icon}></i> : (cert.icon || "🏆")}</div>
        )}
        <div className="cert-info">
          <h3>{cert.title}</h3>
          <p className="issuer">{cert.issuer}</p>
          <span className="date">Issued {cert.date_issued}</span>
        </div>
      </div>

      {isOpen && (
        <ModalPortal>
          <div className="custom-modal-overlay" onClick={() => setIsOpen(false)} style={{ zIndex: 9999 }}>
            <div className="custom-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
              <div className="custom-modal-header">
                <h2>{cert.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {cert.img_url && (
                    <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)', marginRight: '16px' }}>
                      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} style={{ background: 'none', border: 'none', padding: '4px 8px', color: 'var(--text-main)', cursor: 'pointer' }}>-</button>
                      <button onClick={resetZoom} style={{ background: 'none', border: 'none', padding: '4px 8px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8rem', minWidth: '40px' }}>{Math.round(zoom * 100)}%</button>
                      <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} style={{ background: 'none', border: 'none', padding: '4px 8px', color: 'var(--text-main)', cursor: 'pointer' }}>+</button>
                    </div>
                  )}
                  <button className="custom-modal-close" onClick={() => setIsOpen(false)}>×</button>
                </div>
              </div>
              <div className="custom-modal-body" style={{ textAlign: 'center', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <p style={{ marginBottom: '8px' }}><strong>Issuer:</strong> {cert.issuer}</p>
                <p style={{ marginBottom: '24px' }}><strong>Date:</strong> {cert.date_issued}</p>
                
                {cert.img_url ? (
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0a0a0a', borderRadius: '8px', minHeight: '400px', cursor: isDragging ? 'grabbing' : 'grab' }}>
                    <div
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        touchAction: 'none'
                      }}
                    >
                      <img 
                        src={cert.img_url} 
                        alt={cert.title} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'contain',
                          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                          transition: isDragging ? 'none' : 'transform 0.2s ease',
                          pointerEvents: 'none'
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '8rem', margin: '40px 0' }}>{cert.icon?.includes('fa-') ? <i className={cert.icon}></i> : (cert.icon || "🏆")}</div>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
