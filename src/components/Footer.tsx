"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year] = useState(new Date().getFullYear());
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer>
        <p>&copy; {year} Cris Charles Garcia. Based in Laguna, Philippines.</p>
      </footer>

      <a
        href="#"
        id="back-to-top"
        title="Back to Top"
        aria-label="Back to top"
        className={showBackToTop ? "show" : ""}
        onClick={scrollToTop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </a>
    </>
  );
}
