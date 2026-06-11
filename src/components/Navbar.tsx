"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
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

  const toggleMenu = () => {
    const navLinks = document.getElementById("nav-links");
    const hamburger = document.getElementById("hamburger");
    const navOverlay = document.getElementById("nav-overlay");

    if (navLinks?.classList.contains("active")) {
      closeMenu();
    } else {
      navLinks?.classList.add("active");
      hamburger?.classList.add("active");
      navOverlay?.classList.add("active");
      // eslint-disable-next-line react-hooks/immutability
      document.body.style.overflow = "hidden";
    }
  };

  const closeMenu = () => {
    const navLinks = document.getElementById("nav-links");
    const hamburger = document.getElementById("hamburger");
    const navOverlay = document.getElementById("nav-overlay");

    navLinks?.classList.remove("active");
    hamburger?.classList.remove("active");
    navOverlay?.classList.remove("active");
    document.body.style.overflow = "";
  };

  const handleLinkClick = () => {
    // Delay closeMenu slightly to let the browser process the anchor navigation click
    // before the menu element transitions to pointer-events: none / off-screen
    setTimeout(closeMenu, 50);
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

      <nav id="main-nav">
        <div className="logo">
          <Link href="/" className="logo-link">CG</Link>
          <Link href="/admin/login" className="logo-dot-link">.</Link>
        </div>

        <div className="nav-links" id="nav-links" role="navigation">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#about" className="nav-item" onClick={handleLinkClick}>About</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#projects" className="nav-item" onClick={handleLinkClick}>Work</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#certificates" className="nav-item" onClick={handleLinkClick}>Certs</a>
          <Link href="/blog" className="nav-item" onClick={handleLinkClick}>Blog</Link>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#contact" className="nav-item" onClick={handleLinkClick}>Contact</a>

          <label htmlFor="dark-mode-toggle" className="theme-switch theme-switch-panel" title="Toggle Theme" aria-label="Toggle dark/light mode">
            <span className="theme-switch-thumb"></span>
            <span className="theme-switch-icon icon-moon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></span>
            <span className="theme-switch-icon icon-sun"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg></span>
          </label>
        </div>

        <label htmlFor="dark-mode-toggle" className="theme-switch theme-switch-nav" title="Toggle Theme" aria-label="Toggle dark/light mode">
          <span className="theme-switch-thumb"></span>
          <span className="theme-switch-icon icon-moon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></span>
          <span className="theme-switch-icon icon-sun"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg></span>
        </label>

        <div className="hamburger" id="hamburger" aria-label="Toggle menu" role="button" tabIndex={0} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Nav overlay backdrop */}
        <div className="nav-overlay" id="nav-overlay" onClick={closeMenu}></div>
      </nav>
    </>
  );
}


