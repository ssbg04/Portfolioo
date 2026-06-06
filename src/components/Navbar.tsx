"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
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
            <span className="theme-switch-icon icon-moon">🌙</span>
            <span className="theme-switch-icon icon-sun">☀️</span>
          </label>
        </div>

        <label htmlFor="dark-mode-toggle" className="theme-switch theme-switch-nav" title="Toggle Theme" aria-label="Toggle dark/light mode">
          <span className="theme-switch-thumb"></span>
          <span className="theme-switch-icon icon-moon">🌙</span>
          <span className="theme-switch-icon icon-sun">☀️</span>
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


