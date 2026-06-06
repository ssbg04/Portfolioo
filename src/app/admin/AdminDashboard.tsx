"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateSettings,
  upsertProject,
  deleteProject,
  upsertCertification,
  deleteCertification,
  upsertArticle,
  deleteArticle,
  addTechStack,
  deleteTechStack,
  logout,
  changeAdminCredentials
} from "./actions";

export default function AdminDashboard({
  initialSettings,
  initialProjects,
  initialCerts,
  initialArticles,
  initialTechStack,
  username
}: {
  initialSettings: any;
  initialProjects: any[];
  initialCerts: any[];
  initialArticles: any[];
  initialTechStack: any[];
  username: string;
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Dark mode toggle state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") !== "light";
    }
    return true;
  });

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsDark(checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  // Edit states
  const [editProject, setEditProject] = useState<any>(null);
  const [editCert, setEditCert] = useState<any>(null);
  const [editArticle, setEditArticle] = useState<any>(null);

  // Modal open states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Form refs for unsaved changes confirmation
  const projectFormRef = useRef<HTMLFormElement>(null);
  const certFormRef = useRef<HTMLFormElement>(null);
  const articleFormRef = useRef<HTMLFormElement>(null);

  const confirmClose = (formElement: HTMLFormElement | null, initialData: any) => {
    if (!formElement) return true;
    const formData = new FormData(formElement);
    for (const [key, value] of formData.entries()) {
      if (key === "id") continue;
      const initialVal = initialData ? (initialData[key] ?? "") : "";
      const currentVal = value.toString();
      if (currentVal.trim() !== initialVal.toString().trim()) {
        return confirm("You have unsaved changes. Are you sure you want to close and discard them?");
      }
    }
    return true;
  };

  const handleCloseProject = () => {
    if (confirmClose(projectFormRef.current, editProject)) {
      setIsProjectModalOpen(false);
      setEditProject(null);
    }
  };

  const handleCloseCert = () => {
    if (confirmClose(certFormRef.current, editCert)) {
      setIsCertModalOpen(false);
      setEditCert(null);
    }
  };

  const handleCloseArticle = () => {
    if (confirmClose(articleFormRef.current, editArticle)) {
      setIsArticleModalOpen(false);
      setEditArticle(null);
    }
  };

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleAction = async (actionFn: any, formData: FormData, successMsg: string, resetFn?: () => void) => {
    setIsSubmitting(true);
    const result = await actionFn(formData);
    setIsSubmitting(false);

    if (result.success) {
      showMessage("success", successMsg);
      if (resetFn) resetFn();
      router.refresh();
    } else {
      showMessage("error", result.error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    setEditProject(null);
    setEditCert(null);
    setEditArticle(null);
    setIsProjectModalOpen(false);
    setIsCertModalOpen(false);
    setIsArticleModalOpen(false);
  };

  return (
    <>
      <input 
        type="checkbox" 
        id="dark-mode-toggle" 
        className="toggle-checkbox" 
        checked={isDark} 
        onChange={handleToggle} 
      />

      {/* Mobile Header */}
      <header className="mobile-top-bar">
        <div className="logo-text" style={{ fontSize: "1.25rem" }}>
          <span>Admin Panel</span>
          <span className="logo-dot"></span>
        </div>
        <div 
          className={`hamburger ${isSidebarOpen ? "active" : ""}`} 
          id="hamburger" 
          aria-label="Toggle menu" 
          role="button" 
          tabIndex={0} 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`} id="sidebar">
        <div 
          className={`hamburger sidebar-close-btn ${isSidebarOpen ? "active" : ""}`} 
          aria-label="Close menu" 
          role="button" 
          tabIndex={0} 
          onClick={() => setIsSidebarOpen(false)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <div className="logo-container">
          <div className="logo-text">
            <span>Admin Panel</span>
            <span className="logo-dot"></span>
          </div>
        </div>
        <div className="sidebar-nav">
          <button className={`nav-link ${activeTab === "profile" ? "active" : ""}`} onClick={() => switchTab("profile")}>👤 Profile & Stats</button>
          <button className={`nav-link ${activeTab === "projects" ? "active" : ""}`} onClick={() => switchTab("projects")}>💻 Projects</button>
          <button className={`nav-link ${activeTab === "certifications" ? "active" : ""}`} onClick={() => switchTab("certifications")}>🏆 Certifications</button>
          <button className={`nav-link ${activeTab === "articles" ? "active" : ""}`} onClick={() => switchTab("articles")}>📰 Blog Articles</button>
          <button className={`nav-link ${activeTab === "techstack" ? "active" : ""}`} onClick={() => switchTab("techstack")}>⚡ Tech Stack</button>
          <button className={`nav-link ${activeTab === "account" ? "active" : ""}`} onClick={() => switchTab("account")}>🔒 Account Security</button>
        </div>
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>THEME</span>
            <label htmlFor="dark-mode-toggle" className="theme-switch" title="Toggle Theme" aria-label="Toggle dark/light mode" style={{ margin: 0, transform: 'scale(0.85)' }}>
              <span className="theme-switch-thumb"></span>
              <span className="theme-switch-icon icon-moon">🌙</span>
              <span className="theme-switch-icon icon-sun">☀️</span>
            </label>
          </div>
          <button onClick={handleLogout} className="logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>Logout ➔</button>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="main-content" id="main-content">
        <div className="top-bar">
          <div className="page-title">
            <h1 id="tab-title-text">{activeTab.toUpperCase()} MANAGEMENT</h1>
            <p>Welcome back, {username}.</p>
          </div>
          <div className="user-badge">
            <span className="status-dot"></span>
            <span>Active Session</span>
          </div>
        </div>

        {/* System Alerts */}
        {message.text && (
          <div className={`alert alert-${message.type === "success" ? "success" : "danger"}`}>
            <span>{message.type === "success" ? "✓" : "⚠️"}</span>
            <div>{message.text}</div>
          </div>
        )}

        {/* ================= TAB: PROFILE ================= */}
        {activeTab === "profile" && (
          <div className="tab-pane active">
            <form onSubmit={(e) => { e.preventDefault(); handleAction(updateSettings, new FormData(e.currentTarget), "Settings updated!"); }}>
              <div className="card">
                <div className="card-title">📝 About Me Bio Copy</div>
                <div className="form-group">
                  <label htmlFor="about_text_1">About Paragraph 1</label>
                  <textarea name="about_text_1" id="about_text_1" required defaultValue={initialSettings?.about_text_1} />
                </div>
                <div className="form-group">
                  <label htmlFor="about_text_2">About Paragraph 2</label>
                  <textarea name="about_text_2" id="about_text_2" required defaultValue={initialSettings?.about_text_2} />
                </div>
              </div>

              <div className="card">
                <div className="card-title">📈 Statistics Counters</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="years_coding">Years Coding Count</label>
                    <input type="text" name="years_coding" id="years_coding" required defaultValue={initialSettings?.years_coding} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="projects_count">Projects Built Count</label>
                    <input type="text" name="projects_count" id="projects_count" required defaultValue={initialSettings?.projects_count} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="certifications_count">Certifications Count</label>
                    <input type="text" name="certifications_count" id="certifications_count" required defaultValue={initialSettings?.certifications_count} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">🔗 Social Links</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>TikTok URL</label>
                    <input type="url" name="tiktok_url" defaultValue={initialSettings?.tiktok_url} />
                  </div>
                  <div className="form-group">
                    <label>GitHub URL</label>
                    <input type="url" name="github_url" defaultValue={initialSettings?.github_url} />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input type="url" name="linkedin_url" defaultValue={initialSettings?.linkedin_url} />
                  </div>
                  <div className="form-group">
                    <label>Facebook URL</label>
                    <input type="url" name="facebook_url" defaultValue={initialSettings?.facebook_url} />
                  </div>
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input type="url" name="instagram_url" defaultValue={initialSettings?.instagram_url} />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn primary" disabled={isSubmitting}>Save Changes</button>
            </form>
          </div>
        )}

        {/* ================= TAB: PROJECTS ================= */}
        {activeTab === "projects" && (
          <div className="tab-pane active">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <button 
                className="btn primary" 
                onClick={() => { setEditProject(null); setIsProjectModalOpen(true); }}
              >
                ➕ Add New Project
              </button>
            </div>

            <div className="card">
              <div className="card-title">📁 Current Projects</div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Tech Stack</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialProjects.map(proj => (
                      <tr key={proj.id}>
                        <td>{proj.title}</td>
                        <td>{proj.techstack}</td>
                        <td>
                          <div className="btn-actions">
                            <button className="btn secondary btn-sm" onClick={() => { setEditProject(proj); setIsProjectModalOpen(true); }}>Edit</button>
                            <button className="btn danger btn-sm" onClick={async () => {
                              if (confirm("Are you sure?")) {
                                setIsSubmitting(true);
                                await deleteProject(proj.id);
                                setIsSubmitting(false);
                                router.refresh();
                              }
                            }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Modal */}
            {isProjectModalOpen && (
              <div className="modal-overlay" onClick={handleCloseProject}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{editProject ? "✏️ Edit Project" : "➕ Add New Project"}</h2>
                    <button className="modal-close" onClick={handleCloseProject}>×</button>
                  </div>
                  <div className="modal-body">
                    <form ref={projectFormRef} onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      handleAction(upsertProject, new FormData(form), editProject ? "Project updated!" : "Project added!", () => {
                        form.reset();
                        setEditProject(null);
                        setIsProjectModalOpen(false);
                      });
                    }}>
                      {editProject && <input type="hidden" name="id" value={editProject.id} />}
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Project Title</label>
                          <input type="text" name="title" required defaultValue={editProject?.title} />
                        </div>
                        <div className="form-group">
                          <label>Tech Stack</label>
                          <input type="text" name="techstack" defaultValue={editProject?.techstack} />
                        </div>
                        <div className="form-group">
                          <label>Project URL</label>
                          <input type="text" name="url" defaultValue={editProject?.url} />
                        </div>
                        <div className="form-group">
                          <label>Image URL</label>
                          <input type="text" name="img_url" defaultValue={editProject?.img_url} />
                        </div>
                        <div className="form-group form-group-full">
                          <label>Description</label>
                          <textarea name="des" required defaultValue={editProject?.des}></textarea>
                        </div>
                      </div>
                      <div className="modal-footer" style={{ display: "flex", gap: "12px", marginTop: "20px", padding: "16px 0 0 0", borderTop: "1px solid var(--border-color)" }}>
                        <button type="button" className="btn secondary" onClick={handleCloseProject}>Cancel</button>
                        <button type="submit" className="btn primary" disabled={isSubmitting}>{editProject ? "Update Project" : "Add Project"}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: CERTIFICATIONS ================= */}
        {activeTab === "certifications" && (
          <div className="tab-pane active">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <button 
                className="btn primary" 
                onClick={() => { setEditCert(null); setIsCertModalOpen(true); }}
              >
                ➕ Add Certification
              </button>
            </div>

            <div className="card">
              <div className="card-title">🏆 Current Certifications</div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Title</th>
                      <th>Issuer</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialCerts.map(cert => (
                      <tr key={cert.id}>
                        <td>{cert.icon}</td>
                        <td>{cert.title}</td>
                        <td>{cert.issuer}</td>
                        <td>
                          <div className="btn-actions">
                            <button className="btn secondary btn-sm" onClick={() => { setEditCert(cert); setIsCertModalOpen(true); }}>Edit</button>
                            <button className="btn danger btn-sm" onClick={async () => {
                              if (confirm("Are you sure?")) {
                                setIsSubmitting(true);
                                await deleteCertification(cert.id);
                                setIsSubmitting(false);
                                router.refresh();
                              }
                            }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certification Modal */}
            {isCertModalOpen && (
              <div className="modal-overlay" onClick={handleCloseCert}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{editCert ? "✏️ Edit Certification" : "➕ Add Certification"}</h2>
                    <button className="modal-close" onClick={handleCloseCert}>×</button>
                  </div>
                  <div className="modal-body">
                    <form ref={certFormRef} onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      handleAction(upsertCertification, new FormData(form), editCert ? "Updated!" : "Added!", () => {
                        form.reset();
                        setEditCert(null);
                        setIsCertModalOpen(false);
                      });
                    }}>
                      {editCert && <input type="hidden" name="id" value={editCert.id} />}
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Title</label>
                          <input type="text" name="title" required defaultValue={editCert?.title} />
                        </div>
                        <div className="form-group">
                          <label>Issuer</label>
                          <input type="text" name="issuer" required defaultValue={editCert?.issuer} />
                        </div>
                        <div className="form-group">
                          <label>Date Issued</label>
                          <input type="text" name="date_issued" defaultValue={editCert?.date_issued} />
                        </div>
                        <div className="form-group">
                          <label>Icon</label>
                          <input type="text" name="icon" defaultValue={editCert?.icon || "🏆"} />
                        </div>
                      </div>
                      <div className="modal-footer" style={{ display: "flex", gap: "12px", marginTop: "20px", padding: "16px 0 0 0", borderTop: "1px solid var(--border-color)" }}>
                        <button type="button" className="btn secondary" onClick={handleCloseCert}>Cancel</button>
                        <button type="submit" className="btn primary" disabled={isSubmitting}>{editCert ? "Update" : "Add"}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: ARTICLES ================= */}
        {activeTab === "articles" && (
          <div className="tab-pane active">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <button 
                className="btn primary" 
                onClick={() => { setEditArticle(null); setIsArticleModalOpen(true); }}
              >
                ➕ Add Article
              </button>
            </div>

            <div className="card">
              <div className="card-title">📰 Current Articles</div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Tag</th>
                      <th>Published Date</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialArticles.map(art => (
                      <tr key={art.id}>
                        <td>{art.title}</td>
                        <td>{art.tag}</td>
                        <td>{art.date_published}</td>
                        <td>
                          <div className="btn-actions">
                            <button className="btn secondary btn-sm" onClick={() => { setEditArticle(art); setIsArticleModalOpen(true); }}>Edit</button>
                            <button className="btn danger btn-sm" onClick={async () => {
                              if (confirm("Are you sure?")) {
                                setIsSubmitting(true);
                                await deleteArticle(art.id);
                                setIsSubmitting(false);
                                router.refresh();
                              }
                            }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Article Modal */}
            {isArticleModalOpen && (
              <div className="modal-overlay" onClick={handleCloseArticle}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{editArticle ? "✏️ Edit Article" : "➕ Add Article"}</h2>
                    <button className="modal-close" onClick={handleCloseArticle}>×</button>
                  </div>
                  <div className="modal-body">
                    <form ref={articleFormRef} onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      handleAction(upsertArticle, new FormData(form), editArticle ? "Updated!" : "Added!", () => {
                        form.reset();
                        setEditArticle(null);
                        setIsArticleModalOpen(false);
                      });
                    }}>
                      {editArticle && <input type="hidden" name="id" value={editArticle.id} />}
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Title</label>
                          <input type="text" name="title" required defaultValue={editArticle?.title} />
                        </div>
                        <div className="form-group">
                          <label>Publish Date</label>
                          <input type="text" name="date_published" defaultValue={editArticle?.date_published} />
                        </div>
                        <div className="form-group">
                          <label>Tag</label>
                          <input type="text" name="tag" defaultValue={editArticle?.tag} />
                        </div>
                        <div className="form-group">
                          <label>URL</label>
                          <input type="text" name="url" defaultValue={editArticle?.url || "#"} />
                        </div>
                        <div className="form-group form-group-full">
                          <label>Excerpt</label>
                          <textarea name="excerpt" required defaultValue={editArticle?.excerpt}></textarea>
                        </div>
                      </div>
                      <div className="modal-footer" style={{ display: "flex", gap: "12px", marginTop: "20px", padding: "16px 0 0 0", borderTop: "1px solid var(--border-color)" }}>
                        <button type="button" className="btn secondary" onClick={handleCloseArticle}>Cancel</button>
                        <button type="submit" className="btn primary" disabled={isSubmitting}>{editArticle ? "Update" : "Add"}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: TECH STACK ================= */}
        {activeTab === "techstack" && (
          <div className="tab-pane active">
            <div className="card">
              <div className="card-title">➕ Add Technology</div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                handleAction(addTechStack, new FormData(form), "Technology added!", () => form.reset());
              }} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                  <label>Technology Name</label>
                  <input type="text" name="tech_name" required placeholder="e.g. Next.js, GraphQL, PostgreSQL" />
                </div>
                <button type="submit" className="btn primary" disabled={isSubmitting}>Add Tech</button>
              </form>
            </div>

            <div className="card">
              <div className="card-title">⚡ Current Technologies</div>
              {initialTechStack.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No technologies configured.</p>
              ) : (
                <div className="tech-badges-grid">
                  {initialTechStack.map(tech => (
                    <div className="tech-badge-item" key={tech.id}>
                      <span>{tech.tech_name}</span>
                      <button onClick={async () => {
                        if (confirm("Delete this technology?")) {
                          setIsSubmitting(true);
                          await deleteTechStack(tech.id);
                          setIsSubmitting(false);
                          router.refresh();
                        }
                      }} className="tech-badge-delete" title="Delete tag">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: ACCOUNT SECURITY ================= */}
        {activeTab === "account" && (
          <div className="tab-pane active">
            <div className="card">
              <div className="card-title">🔒 Change Admin Credentials</div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                const formData = new FormData(e.currentTarget);
                const result = await changeAdminCredentials(username, formData);
                setIsSubmitting(false);
                if (result.success) {
                  showMessage("success", "Credentials updated successfully! Logging out...");
                  setTimeout(() => {
                    router.push("/admin/login");
                  }, 2000);
                } else {
                  showMessage("error", result.error || "Failed to update credentials");
                }
              }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>New Username</label>
                    <input type="text" name="new_username" required defaultValue={username} placeholder="Username" />
                  </div>
                  <div className="form-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input type="password" name="new_password" placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" name="confirm_password" placeholder="••••••••" />
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <button type="submit" className="btn primary" disabled={isSubmitting}>
                    Update Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
