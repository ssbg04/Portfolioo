"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Award,
  BookOpen,
  Layers,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Plus,
  Edit2,
  Trash2,
  MonitorPlay,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Menu,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Dark mode toggle state
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(localStorage.getItem("theme") !== "light");
    }
  }, []);

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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Preview Zoom state
  const [previewZoom, setPreviewZoom] = useState(1);

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

      {/* Floating Toast Notification */}
      {message.text && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: message.type === 'success' ? '#065f46' : '#7f1d1d',
          color: message.type === 'success' ? '#a7f3d0' : '#fecaca',
          border: `1px solid ${message.type === 'success' ? '#059669' : '#dc2626'}`,
          padding: '16px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          animation: 'modalSlideUp 0.3s ease-out'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <div style={{ fontWeight: 600 }}>{message.text}</div>
          <button onClick={() => setMessage({ type: "", text: "" })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Mobile Header */}
      <header className="mobile-top-bar">
        <div className="logo-text" style={{ fontSize: "1.25rem" }}>
          <span>Admin Panel</span>
          <span className="logo-dot"></span>
        </div>
        <div 
          className={`hamburger ${isSidebarOpen ? "active" : ""}`} 
          id="hamburger" 
          role="button" 
          tabIndex={0} 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`} id="sidebar">
        <div className="logo-container">
          <div className="logo-text">
            <span>Admin Panel</span>
            <span className="logo-dot"></span>
          </div>
        </div>
        <div className="sidebar-nav">
          <button className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => switchTab("dashboard")} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard size={18} /> Dashboard Overview
          </button>
          <button className={`nav-link ${activeTab === "projects" ? "active" : ""}`} onClick={() => switchTab("projects")} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={18} /> Projects ({initialProjects.length})
          </button>
          <button className={`nav-link ${activeTab === "certifications" ? "active" : ""}`} onClick={() => switchTab("certifications")} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} /> Certifications ({initialCerts.length})
          </button>
          <button className={`nav-link ${activeTab === "articles" ? "active" : ""}`} onClick={() => switchTab("articles")} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} /> Blog Articles ({initialArticles.length})
          </button>
          <button className={`nav-link ${activeTab === "techstack" ? "active" : ""}`} onClick={() => switchTab("techstack")} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} /> Tech Stack ({initialTechStack.length})
          </button>
          <button className={`nav-link ${activeTab === "account" ? "active" : ""}`} onClick={() => switchTab("account")} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} /> Account Security
          </button>
        </div>
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>THEME</span>
            <label htmlFor="dark-mode-toggle" className="theme-switch" title="Toggle Theme" aria-label="Toggle dark/light mode" style={{ margin: 0, transform: 'scale(0.85)' }}>
              <span className="theme-switch-thumb"></span>
              <span className="theme-switch-icon icon-moon"><Moon size={14} /></span>
              <span className="theme-switch-icon icon-sun"><Sun size={14} /></span>
            </label>
          </div>
          <button onClick={handleLogout} className="logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} /> Logout
          </button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setIsPreviewModalOpen(true)} 
              className="btn primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)' }}
            >
              <MonitorPlay size={18} /> Live Preview
            </button>
            <div className="user-badge">
              <span className="status-dot"></span>
              <span>Active Session</span>
            </div>
          </div>
        </div>

        {/* ================= TAB: DASHBOARD / PROFILE ================= */}
        {activeTab === "dashboard" && (
          <div className="tab-pane active">
            {/* Stats Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {[
                { title: "Total Projects", count: initialProjects.length, icon: <FolderKanban size={24} /> },
                { title: "Certifications", count: initialCerts.length, icon: <Award size={24} /> },
                { title: "Blog Articles", count: initialArticles.length, icon: <BookOpen size={24} /> },
                { title: "Tech Stack", count: initialTechStack.length, icon: <Layers size={24} /> },
              ].map((stat, i) => (
                <div key={i} className="card" style={{ marginBottom: 0, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent)' }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'Outfit' }}>{stat.count}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.title}</div>
                  </div>
                </div>
              ))}
            </div>

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

              <button type="submit" className="btn primary" disabled={isSubmitting}>Save Profile Changes</button>
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
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={18} /> Add New Project
              </button>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderKanban size={24} /> Current Projects
              </div>
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
                            <button className="btn secondary btn-sm" onClick={() => { setEditProject(proj); setIsProjectModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button className="btn danger btn-sm" onClick={async () => {
                              if (confirm("Are you sure?")) {
                                setIsSubmitting(true);
                                await deleteProject(proj.id);
                                setIsSubmitting(false);
                                router.refresh();
                              }
                            }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={14} /> Delete
                            </button>
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
              <div className="custom-modal-overlay" onClick={handleCloseProject}>
                <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="custom-modal-header">
                    <h2>{editProject ? "Edit Project" : "Add New Project"}</h2>
                    <button className="custom-modal-close" onClick={handleCloseProject}><X size={24} /></button>
                  </div>
                  <div className="custom-modal-body">
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
                          <label>Image URL</label>
                          <input type="text" name="img_url" defaultValue={editProject?.img_url} />
                        </div>
                        <div className="form-group">
                          <label>Old URL / Extra Link</label>
                          <input type="text" name="url" defaultValue={editProject?.url} />
                        </div>
                        <div className="form-group">
                          <label>Live Demo URL</label>
                          <input type="url" name="live_demo_url" defaultValue={editProject?.live_demo_url} />
                        </div>
                        <div className="form-group">
                          <label>Repository URL</label>
                          <input type="url" name="repo_url" defaultValue={editProject?.repo_url} />
                        </div>
                        <div className="form-group form-group-full">
                          <label>Description</label>
                          <textarea name="des" required defaultValue={editProject?.des} rows={4}></textarea>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
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
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={18} /> Add Certification
              </button>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={24} /> Current Certifications
              </div>
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
                        <td>{cert.icon?.includes('fa-') ? <i className={cert.icon}></i> : cert.icon}</td>
                        <td>{cert.title}</td>
                        <td>{cert.issuer}</td>
                        <td>
                          <div className="btn-actions">
                            <button className="btn secondary btn-sm" onClick={() => { setEditCert(cert); setIsCertModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={14} /> Edit</button>
                            <button className="btn danger btn-sm" onClick={async () => {
                              if (confirm("Are you sure?")) {
                                setIsSubmitting(true);
                                await deleteCertification(cert.id);
                                setIsSubmitting(false);
                                router.refresh();
                              }
                            }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14} /> Delete</button>
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
              <div className="custom-modal-overlay" onClick={handleCloseCert}>
                <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="custom-modal-header">
                    <h2>{editCert ? "Edit Certification" : "Add Certification"}</h2>
                    <button className="custom-modal-close" onClick={handleCloseCert}><X size={24} /></button>
                  </div>
                  <div className="custom-modal-body">
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
                          <input type="text" name="icon" defaultValue={editCert?.icon || "🏆"} placeholder="Emoji or 'fa-solid fa-award'" />
                        </div>
                        <div className="form-group">
                          <label>Image URL</label>
                          <input type="text" name="img_url" defaultValue={editCert?.img_url} placeholder="https://example.com/cert.png" />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
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
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={18} /> Add Article
              </button>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={24} /> Current Articles
              </div>
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
                            <button className="btn secondary btn-sm" onClick={() => { setEditArticle(art); setIsArticleModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={14} /> Edit</button>
                            <button className="btn danger btn-sm" onClick={async () => {
                              if (confirm("Are you sure?")) {
                                setIsSubmitting(true);
                                await deleteArticle(art.id);
                                setIsSubmitting(false);
                                router.refresh();
                              }
                            }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14} /> Delete</button>
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
              <div className="custom-modal-overlay" onClick={handleCloseArticle}>
                <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="custom-modal-header">
                    <h2>{editArticle ? "Edit Article" : "Add Article"}</h2>
                    <button className="custom-modal-close" onClick={handleCloseArticle}><X size={24} /></button>
                  </div>
                  <div className="custom-modal-body">
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
                          <textarea name="excerpt" required defaultValue={editArticle?.excerpt} rows={4}></textarea>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
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
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={24} /> Add Technology
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                handleAction(addTechStack, new FormData(form), "Technology added!", () => form.reset());
              }} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                  <label>Technology Name</label>
                  <input type="text" name="tech_name" required placeholder="e.g. Next.js, GraphQL, PostgreSQL" />
                </div>
                <button type="submit" className="btn primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> Add Tech
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={24} /> Current Technologies
              </div>
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
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={24} /> Change Admin Credentials
              </div>
              
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>Update your username or set a new password. You will be logged out upon success.</p>
              </div>

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
                  <div className="form-group form-group-full">
                    <label>New Username</label>
                    <input type="text" name="new_username" required defaultValue={username} placeholder="Username" />
                  </div>
                  
                  {/* Visual Divider */}
                  <div className="form-group-full" style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '10px 0 20px' }}>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }}></div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>PASSWORD</span>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }}></div>
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
                <div style={{ marginTop: "30px" }}>
                  <button type="submit" className="btn primary" disabled={isSubmitting}>
                    Update Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ================= LIVE PREVIEW MODAL ================= */}
      {isPreviewModalOpen && (
        <div className="custom-modal-overlay" style={{ zIndex: 3000, padding: 0 }}>
          <div className="custom-modal-container" style={{ width: '95vw', maxWidth: '1600px', height: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="custom-modal-header" style={{ padding: '12px 24px', background: '#090d16', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MonitorPlay size={20} color="#3b82f6" />
                <h2 style={{ fontSize: '1.2rem' }}>Live Site Preview</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', borderRadius: '8px', padding: '4px' }}>
                  <button onClick={() => setPreviewZoom(z => Math.max(0.5, z - 0.1))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px' }} title="Zoom Out"><ZoomOut size={16} /></button>
                  <span style={{ color: '#f8fafc', fontSize: '0.85rem', width: '45px', textAlign: 'center' }}>{Math.round(previewZoom * 100)}%</span>
                  <button onClick={() => setPreviewZoom(z => Math.min(1.5, z + 0.1))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px' }} title="Zoom In"><ZoomIn size={16} /></button>
                  <button onClick={() => setPreviewZoom(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', borderLeft: '1px solid #334155' }} title="Reset Zoom"><Maximize2 size={16} /></button>
                </div>
                <button className="custom-modal-close" onClick={() => setIsPreviewModalOpen(false)}><X size={24} /></button>
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative', background: '#0f172a', overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                height: '100%',
                transform: `scale(${previewZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease'
              }}>
                <iframe 
                  src="/" 
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} 
                  title="Portfolio Live Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
