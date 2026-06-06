import { supabase } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key_for_development";

export default async function AdminPage() {
    // Check if Supabase is configured
    const isDummy = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co') === 'https://dummy.supabase.co';

    let settingsRows = null, projectRows = null, certRows = null, articleRows = null, techStackRows = null;

    if (!isDummy) {
        const resSettings = await supabase.from('settings').select('*').eq('id', 1).single();
        settingsRows = resSettings.data;

        const resProj = await supabase.from('projects').select('*').order('id', { ascending: false });
        projectRows = resProj.data;

        const resCert = await supabase.from('certifications').select('*').order('id', { ascending: false });
        certRows = resCert.data;

        const resArt = await supabase.from('articles').select('*').order('id', { ascending: false });
        articleRows = resArt.data;

        const resTech = await supabase.from('techstack').select('*').order('id', { ascending: true });
        techStackRows = resTech.data;
    }

    // Extract username from token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    let username = "Admin";

    if (token) {
        try {
            const secret = new TextEncoder().encode(SECRET_KEY);
            const { payload } = await jwtVerify(token, secret);
            username = payload.username as string;
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        :root {
            --bg-dark: #090d16;
            --sidebar-bg: rgba(30, 41, 59, 0.4);
            --surface: #1e293b;
            --surface-hover: #334155;
            --accent: #3b82f6;
            --text-light: #f8fafc;
            --text-muted: #94a3b8;
            --danger: #ef4444;
            --success: #10b981;
            --border-color: rgba(148, 163, 184, 0.1);
            --input-bg: rgba(15, 23, 42, 0.5);
            --badge-bg: rgba(15, 23, 42, 0.8);
        }
        body:has(#dark-mode-toggle:not(:checked)) {
            --bg-dark: #f8fafc;
            --sidebar-bg: rgba(255, 255, 255, 0.6);
            --surface: #ffffff;
            --surface-hover: #f1f5f9;
            --text-light: #0f172a;
            --text-muted: #64748b;
            --border-color: rgba(15, 23, 42, 0.08);
            --input-bg: rgba(255, 255, 255, 0.8);
            --badge-bg: #e2e8f0;
        }
        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            font-family: 'Inter', sans-serif;
            margin: 0;
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 280px;
            background: var(--sidebar-bg);
            border-right: 1px solid var(--border-color);
            height: 100vh;
            position: fixed;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(10px);
            z-index: 100;
        }
        .logo-container {
            padding: 24px;
            border-bottom: 1px solid var(--border-color);
        }
        .logo-text {
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .logo-dot {
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
        }
        .sidebar-nav {
            padding: 20px 12px;
            flex-grow: 1;
        }
        .nav-link {
            display: block;
            width: 100%;
            padding: 12px 16px;
            color: var(--text-muted);
            text-decoration: none;
            border-radius: 8px;
            margin-bottom: 4px;
            transition: all 0.2s;
            text-align: left;
            background: transparent;
            border: none;
            font-size: 0.95rem;
            cursor: pointer;
            font-family: inherit;
        }
        .nav-link:hover {
            background: rgba(148, 163, 184, 0.05);
            color: var(--text-light);
        }
        .nav-link.active {
            background: rgba(59, 130, 246, 0.1);
            color: var(--accent);
            font-weight: 600;
        }
        .sidebar-footer {
            padding: 20px;
            border-top: 1px solid var(--border-color);
        }
        .logout-btn {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: color 0.2s;
        }
        .logout-btn:hover {
            color: var(--danger);
        }
        .main-content {
            margin-left: 280px;
            padding: 40px;
            flex-grow: 1;
            min-height: 100vh;
        }
        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
        }
        .page-title h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            margin: 0 0 8px 0;
        }
        .page-title p {
            color: var(--text-muted);
            margin: 0;
        }
        .user-badge {
            background: var(--surface);
            padding: 8px 16px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.85rem;
            border: 1px solid var(--border-color);
        }
        .status-dot {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }
        .card {
            background: var(--surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }
        .card-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
        }
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group-full {
            grid-column: 1 / -1;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 500;
        }
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 12px;
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-light);
            font-family: inherit;
            transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus {
            outline: none;
            border-color: var(--accent);
        }
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            display: inline-block;
            text-decoration: none;
        }
        .btn.primary {
            background: var(--accent);
            color: white;
        }
        .btn.primary:hover {
            background: #2563eb;
        }
        .btn.secondary {
            background: var(--surface-hover);
            color: var(--text-light);
        }
        .btn.secondary:hover {
            background: #475569;
        }
        .btn.danger {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .btn.danger:hover {
            background: var(--danger);
            color: white;
        }
        .btn-sm {
            padding: 6px 12px;
            font-size: 0.85rem;
        }
        .table-container {
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        th {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .btn-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .text-center { text-align: center; }
        .tech-badges-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .tech-badge-item {
            background: var(--badge-bg);
            border: 1px solid var(--border-color);
            padding: 6px 12px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
        }
        .tech-badge-delete {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 1.1rem;
            padding: 0 4px;
            line-height: 1;
        }
        .tech-badge-delete:hover {
            color: var(--danger);
        }
        .alert {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
        }
        .alert-danger {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        .form-overlay-card {
            border: 1px solid var(--accent);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
        }
        .sidebar-close-btn {
            display: none;
        }
        .hamburger {
            display: none;
        }
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(9, 13, 22, 0.6);
            backdrop-filter: blur(4px);
            z-index: 95;
            animation: modalFadeIn 0.2s ease-out;
        }
        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(9, 13, 22, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: modalFadeIn 0.2s ease-out;
            padding: 20px;
        }
        .modal-container {
            background: var(--surface);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            width: 100%;
            max-width: 650px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
        }
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
        }
        .modal-header h2 {
            margin: 0;
            font-family: 'Outfit', sans-serif;
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--text-light);
        }
        .modal-close {
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 1.75rem;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            line-height: 1;
        }
        .modal-close:hover {
            color: var(--danger);
        }
        .modal-body {
            padding: 24px;
            overflow-y: auto;
        }
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes modalSlideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .mobile-top-bar {
            display: none;
        }
        @media (max-width: 768px) {
            .sidebar {
                left: auto;
                right: 0;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                border-right: none;
                border-left: 1px solid var(--border-color);
            }
            .sidebar.open {
                transform: translateX(0);
            }
            .main-content {
                margin-left: 0;
                padding: 20px;
                padding-top: 80px;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
            .mobile-top-bar {
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: var(--bg-dark);
                border-bottom: 1px solid var(--border-color);
                z-index: 90;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
            }
            .sidebar-close-btn {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 5px;
                padding: 4px;
                background: none;
                border: none;
                cursor: pointer;
                position: absolute;
                top: 18px;
                right: 20px;
                z-index: 105;
                width: 24px;
                height: 24px;
            }
            .mobile-top-bar .hamburger {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 5px;
                padding: 4px;
                background: none;
                border: none;
                cursor: pointer;
                width: 24px;
                height: 24px;
            }
            .bar {
                display: block;
                width: 24px;
                height: 2px;
                background: var(--text-light);
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            .hamburger.active .bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
            .hamburger.active .bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
            .hamburger.active .bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        }
      `}} />

            <AdminDashboard
                initialSettings={settingsRows || {}}
                initialProjects={projectRows || []}
                initialCerts={certRows || []}
                initialArticles={articleRows || []}
                initialTechStack={techStackRows || []}
                username={username}
            />
        </>
    );
}
