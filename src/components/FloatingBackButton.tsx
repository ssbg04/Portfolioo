"use client";

import { useRouter } from "next/navigation";

export default function FloatingBackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="floating-back-btn" 
      aria-label="Go back"
      title="Go back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <style jsx>{`
        .floating-back-btn {
          position: fixed;
          top: 80px; /* Below navbar */
          left: 20px;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: var(--surface);
          border: 1px solid var(--border-color);
          color: var(--text-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 90;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .floating-back-btn:hover {
          background: var(--surface-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
        .floating-back-btn svg {
          width: 20px;
          height: 20px;
        }
        @media (max-width: 768px) {
          .floating-back-btn {
            top: 70px;
            left: 15px;
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </button>
  );
}
